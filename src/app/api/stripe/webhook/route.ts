import { NextRequest, NextResponse } from 'next/server';
import {
  claimStripeEvent,
  getBillingProduct,
  markOrderPaid,
  markOrderRefunded,
  markStripeEventFailed,
  markStripeEventProcessed,
  type BillingProductId,
} from '@/lib/billing';
import { trackLoveFunnelEvent } from '@/lib/love-funnel-analytics';
import {
  normalizeLoveProductType,
  normalizeOneTimeProductType,
} from '@/lib/love-reading/revenue-contract';
import { sendReportReadyEmailForCheckoutSession } from '@/lib/love-report-email';
import { isPayPerUseEnabled } from '@/lib/pay-per-use';
import { markRelationshipReadingPremium } from '@/lib/relationship-reading-store';
import { ensureReportJobForSession, runReportJob } from '@/lib/report-jobs';
import {
  STAGING_DEGRADED_PAYMENT_UNAVAILABLE_CODE,
  isStagingDegradedMode,
  isStripePaymentAvailable,
} from '@/lib/staging-degraded-mode';
import { getStripe } from '@/lib/stripe';
import type { CheckoutSession, StripeCharge, StripeRefund, StripeMetadata } from '@/types/stripe-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function metadataProductId(metadata?: StripeMetadata | null): BillingProductId | null {
  const productType = metadata?.productId ?? metadata?.legacyProductId;
  return normalizeLoveProductType(productType) ?? normalizeOneTimeProductType(productType);
}

function readingModeFromMetadata(metadata?: StripeMetadata | null) {
  if (
    metadata?.loveReportMode === 'compatibility' ||
    metadata?.legacyProductId === 'compatibility_report'
  ) {
    return 'compatibility';
  }
  return 'solo';
}

async function handleCheckoutSessionCompleted(session: CheckoutSession) {
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return;

  const productId = metadataProductId(session.metadata);
  const readingSessionId = session.metadata?.readingSessionId;
  const resourceRef = session.metadata?.resourceRef;
  const source = session.metadata?.source === 'relationship' ? 'relationship' : 'love_reading';
  const relationshipReadingId = session.metadata?.relationshipReadingId || readingSessionId;
  if (!productId || (!readingSessionId && !resourceRef)) return;

  const product = getBillingProduct(productId);
  if (!product) return;

  await markOrderPaid({
    checkoutSessionId: session.id,
    stripePaymentIntentId:
      typeof session.payment_intent === 'string' ? session.payment_intent : null,
    customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
  });
  await trackLoveFunnelEvent('love_checkout_success', {
    productId,
    source,
    readingSessionId,
    relationshipReadingId: source === 'relationship' ? relationshipReadingId : null,
    checkoutSessionId: session.id,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
  });

  // Ask/Draw entitlements are represented by the paid order. Their result
  // routes only unlock after this webhook-backed state is present.
  if (product.kind === 'one_time_unlock') return;

  if (!readingSessionId) return;

  if (source === 'relationship') {
    if (!relationshipReadingId) return;
    await markRelationshipReadingPremium(relationshipReadingId);
    return;
  }

  const reportJob = await ensureReportJobForSession({
    sessionId: readingSessionId,
    readingMode: readingModeFromMetadata(session.metadata),
    userId: session.metadata?.userId || null,
    vedicEntitlement: {
      paid: true,
      product: productId,
    },
  });

  await runReportJob(reportJob.id);
  try {
    await sendReportReadyEmailForCheckoutSession({
      checkoutSessionId: session.id,
      locale: session.metadata?.locale === 'zh-CN' ? 'zh-CN' : 'en',
    });
  } catch {
    console.warn('[stripe/webhook] report ready email was not sent');
  }
}

async function handleRefundEvent(object: StripeCharge | StripeRefund) {
  const paymentIntent =
    typeof object.payment_intent === 'string' ? object.payment_intent : null;

  await markOrderRefunded({ stripePaymentIntentId: paymentIntent });
  await trackLoveFunnelEvent('love_refund_requested', {
    stripePaymentIntentId: paymentIntent,
    stripeObjectId: object.id,
  });
}

export async function POST(request: NextRequest) {
  if (isStagingDegradedMode() && !isStripePaymentAvailable()) {
    return NextResponse.json({
      received: true,
      skipped: STAGING_DEGRADED_PAYMENT_UNAVAILABLE_CODE,
    });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret || !webhookSecret.startsWith('whsec_')) {
    return NextResponse.json(
      { error: 'Webhook signing secret is not configured', code: 'stripe_webhook_secret_invalid' },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: import('@/types/stripe-api').StripeEvent;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('[stripe/webhook] signature verification failed', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!isPayPerUseEnabled()) {
    return NextResponse.json({ received: true, skipped: 'pay_per_use_disabled' });
  }

  const claimed = await claimStripeEvent(event);
  if (!claimed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as import('@/types/stripe-api').CheckoutSession);
        break;
      case 'charge.refunded':
        await handleRefundEvent(event.data.object as import('@/types/stripe-api').StripeCharge);
        break;
      case 'refund.created':
        await handleRefundEvent(event.data.object as import('@/types/stripe-api').StripeRefund);
        break;
      default:
        break;
    }
    await markStripeEventProcessed(event.id);
  } catch (error) {
    await markStripeEventFailed(event.id);
    console.error('[stripe/webhook] event processing failed', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
