import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  buildLineItem,
  createPendingOrder,
  getBillingProduct,
  type BillingProductId,
} from '@/lib/billing';
import { trackLoveFunnelEvent } from '@/lib/love-funnel-analytics';
import { requirePayPerUseEnabled } from '@/lib/pay-per-use';
import { isUuidReadingId } from '@/lib/reading-id';
import { getStripe } from '@/lib/stripe';

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

    const product = getBillingProduct(body.productId ?? '');
    if (!product) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }
    const checkoutSource = body.source === 'relationship' ? 'relationship' : 'love_reading';
    const checkoutReferenceId =
      checkoutSource === 'relationship'
        ? body.relationshipReadingId ?? body.readingSessionId
        : body.readingSessionId;

    if (checkoutSource === 'relationship' && product.productId !== 'compatibility_report') {
      return NextResponse.json({ error: 'Invalid relationship product' }, { status: 400 });
    }
    if (!checkoutReferenceId) {
      return NextResponse.json({ error: 'Missing readingSessionId' }, { status: 400 });
    }
    if (!isUuidReadingId(checkoutReferenceId)) {
      return NextResponse.json({ error: 'Invalid readingSessionId' }, { status: 400 });
    }

    const session = await auth();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const locale = body.locale ?? 'en';
    const customerEmail = session?.user?.email ?? body.email ?? undefined;
    const metadata = {
      productId: product.productId,
      source: checkoutSource,
      readingSessionId: checkoutReferenceId,
      relationshipReadingId: checkoutSource === 'relationship' ? checkoutReferenceId : '',
      locale,
      userId: session?.user?.id ?? '',
    };
    const resultPath =
      checkoutSource === 'relationship'
        ? `/relationship/result/${checkoutReferenceId}?lang=${locale === 'zh-CN' ? 'zh' : 'en'}`
        : `/${locale}/love-reading/result/${checkoutReferenceId}`;

    const checkoutSession = await getStripe().checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [buildLineItem(product)],
        customer_email: customerEmail,
        client_reference_id: checkoutReferenceId,
        metadata,
        success_url: `${appUrl}${resultPath}${resultPath.includes('?') ? '&' : '?'}checkout=success`,
        cancel_url: `${appUrl}${resultPath}${resultPath.includes('?') ? '&' : '?'}checkout=cancelled`,
        allow_promotion_codes: true,
      },
      {
        idempotencyKey: `${checkoutSource}:${product.productId}:${checkoutReferenceId}:${session?.user?.id ?? body.email ?? 'guest'}`,
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
      readingSessionId: checkoutReferenceId,
      relationshipReadingId: checkoutSource === 'relationship' ? checkoutReferenceId : null,
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
