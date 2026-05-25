import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  markOrderPaid,
  markOrderRefunded,
  recordStripeEvent,
  type BillingProductId,
} from '@/lib/billing';
import { trackLoveFunnelEvent } from '@/lib/love-funnel-analytics';
import { sendReportReadyEmailForCheckoutSession } from '@/lib/love-report-email';
import { isPayPerUseEnabled } from '@/lib/pay-per-use';
import { markRelationshipReadingPremium } from '@/lib/relationship-reading-store';
import { ensureReportJobForSession, runReportJob } from '@/lib/report-jobs';
import {
  STAGING_DEGRADED_PAYMENT_UNAVAILABLE_CODE,
  isStagingDegradedMode,
  isStripePaymentAvailable,
} from '@/lib/staging-degraded-mode';
import { validateCheckoutSessionMetadata } from '@/lib/stripe-checkout-metadata';
import { getStripe } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function readingModeFromProduct(productId: BillingProductId) {
  return productId === 'compatibility_report' ? 'compatibility' : 'solo';
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return;

  const metadataValidation = validateCheckoutSessionMetadata(session.metadata);
  if (!metadataValidation.ok) {
    console.warn('[stripe/webhook] ignored checkout.session.completed with unsafe metadata', {
      reason: metadataValidation.reason,
    });
    return;
  }

  const {
    productId,
    source,
    readingSessionId,
    relationshipReadingId,
    locale,
    userId,
  } = metadataValidation.metadata;

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

  if (source === 'relationship') {
    if (productId !== 'compatibility_report' || !relationshipReadingId) return;
    await markRelationshipReadingPremium(relationshipReadingId);
    return;
  }

  const reportJob = await ensureReportJobForSession({
    sessionId: readingSessionId,
    readingMode: readingModeFromProduct(productId),
    userId,
  });

  await runReportJob(reportJob.id);
  try {
    await sendReportReadyEmailForCheckoutSession({
      checkoutSessionId: session.id,
      locale,
    });
  } catch {
    console.warn('[stripe/webhook] report ready email was not sent');
  }
}

async function handleRefundEvent(object: Stripe.Charge | Stripe.Refund) {
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

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('[stripe/webhook] signature verification failed', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (!isPayPerUseEnabled()) {
    return NextResponse.json({ received: true, skipped: 'pay_per_use_disabled' });
  }

  const isNewEvent = await recordStripeEvent(event);
  if (!isNewEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'charge.refunded':
      await handleRefundEvent(event.data.object as Stripe.Charge);
      break;
    case 'refund.created':
      await handleRefundEvent(event.data.object as Stripe.Refund);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
