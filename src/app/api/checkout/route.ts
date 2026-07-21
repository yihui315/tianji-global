import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  buildLineItem,
  createPendingOrder,
  getCheckoutPriceIdReadiness,
  getBillingProduct,
  isBillingPersistenceConfigured,
  type BillingProductId,
} from '@/lib/billing';
import {
  normalizeLoveProductType,
  normalizeOneTimeProductType,
} from '@/lib/love-reading/revenue-contract';
import { trackLoveFunnelEvent } from '@/lib/love-funnel-analytics';
import { requirePayPerUseEnabled } from '@/lib/pay-per-use';
import { getStripe, getStripeTestModeReadiness } from '@/lib/stripe';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const payPerUseGate = requirePayPerUseEnabled();
  if (payPerUseGate) return payPerUseGate;

  try {
    const body = (await request.json()) as {
      productId?: string;
      readingSessionId?: string;
      relationshipReadingId?: string;
      source?: 'love_reading' | 'relationship';
      locale?: 'en' | 'zh-CN';
      email?: string;
    };

    const inputProductType = body.productId ?? '';

    // Try premium_report first, then one-time unlock
    const normalizedPremium = normalizeLoveProductType(inputProductType);
    const normalizedOneTime = normalizeOneTimeProductType(inputProductType);
    const normalizedProductType = normalizedPremium ?? normalizedOneTime;

    if (!normalizedProductType) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }

    const product = getBillingProduct(inputProductType);
    if (!product) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }

    // Every checkout is tied to an existing private reading session.
    const isOneTime = product.kind === 'one_time_unlock';
    const checkoutSource = body.source === 'relationship' ? 'relationship' : 'love_reading';
    const checkoutReferenceId =
      checkoutSource === 'relationship'
        ? body.relationshipReadingId ?? body.readingSessionId
        : body.readingSessionId;

    if (!checkoutReferenceId) {
      return NextResponse.json({ error: 'Missing readingSessionId' }, { status: 400 });
    }
    if (!uuidPattern.test(checkoutReferenceId)) {
      return NextResponse.json({ error: 'Invalid readingSessionId' }, { status: 400 });
    }

    const stripeReadiness = getStripeTestModeReadiness();
    if (!stripeReadiness.ready) {
      return NextResponse.json(
        { error: 'Stripe test mode is not configured', code: stripeReadiness.code },
        { status: 503 }
      );
    }
    if (!isBillingPersistenceConfigured()) {
      return NextResponse.json(
        { error: 'Billing persistence is not configured', code: 'billing_persistence_missing' },
        { status: 503 }
      );
    }

    const session = await auth();
    const checkoutPriceReadiness = getCheckoutPriceIdReadiness(product);
    if (!checkoutPriceReadiness.ready) {
      return NextResponse.json(
        {
          error: checkoutPriceReadiness.error,
          code: checkoutPriceReadiness.code,
          checkoutReadiness: 'blocked',
          productId: product.productId,
        },
        { status: 503 }
      );
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const locale = body.locale ?? 'en';
    const customerEmail = session?.user?.email ?? body.email ?? undefined;
    const loveReportMode =
      checkoutSource === 'relationship' || inputProductType === 'compatibility_report'
        ? 'compatibility'
        : 'solo';
    const metadata: Record<string, string> = {
      productId: product.productId,
      source: checkoutSource,
      locale,
      userId: session?.user?.id ?? '',
    };

    if (!isOneTime) {
      // Premium report metadata
      Object.assign(metadata, {
        legacyProductId: normalizedPremium && inputProductType !== normalizedPremium ? inputProductType : '',
        loveReportMode,
        readingSessionId: checkoutReferenceId ?? '',
        relationshipReadingId: checkoutSource === 'relationship' ? (checkoutReferenceId ?? '') : '',
      });
    } else {
      // One-time unlock metadata
      Object.assign(metadata, {
        readingSessionId: checkoutReferenceId ?? '',
        entitlement: product.productId,
      });
    }

    const resultPath = isOneTime
      ? `/${locale}/love-reading/result/${checkoutReferenceId}`
      : checkoutSource === 'relationship'
        ? `/relationship/result/${checkoutReferenceId}?lang=${locale === 'zh-CN' ? 'zh' : 'en'}`
        : `/${locale}/love-reading/result/${checkoutReferenceId}`;

    const checkoutSession = await getStripe().checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [buildLineItem(product, checkoutPriceReadiness.priceId)],
        customer_email: customerEmail,
        client_reference_id: checkoutReferenceId,
        metadata,
        success_url: `${appUrl}${resultPath}${resultPath.includes('?') ? '&' : '?'}checkout=success`,
        cancel_url: `${appUrl}${resultPath}${resultPath.includes('?') ? '&' : '?'}checkout=cancelled`,
        allow_promotion_codes: true,
      },
      {
        idempotencyKey: `${checkoutSource}:${product.productId}:${checkoutReferenceId ?? 'no_session'}:${session?.user?.id ?? body.email ?? 'guest'}`,
      }
    );

    await createPendingOrder({
      product,
      checkoutSessionId: checkoutSession.id,
      userId: session?.user?.id ?? null,
      readingSessionId: checkoutReferenceId,
      customerEmail,
    });
    await trackLoveFunnelEvent('love_checkout_created', {
      productId: product.productId,
      source: checkoutSource,
      readingSessionId: checkoutReferenceId ?? null,
      relationshipReadingId: checkoutSource === 'relationship' ? checkoutReferenceId ?? null : null,
      checkoutSessionId: checkoutSession.id,
      amountTotal: product.unitAmount,
      currency: product.currency,
    });

    return NextResponse.json({
      success: true,
      data: {
        checkoutSessionId: checkoutSession.id,
        url: checkoutSession.url,
        productId: product.productId as BillingProductId,
      },
    });
  } catch (error) {
    console.error('[api/checkout] failed', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
