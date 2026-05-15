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
import { getStripe } from '@/lib/stripe';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  const payPerUseGate = requirePayPerUseEnabled();
  if (payPerUseGate) return payPerUseGate;

  try {
    const body = (await request.json()) as {
      productId?: string;
      readingSessionId?: string;
      locale?: 'en' | 'zh-CN';
      email?: string;
    };

    const product = getBillingProduct(body.productId ?? '');
    if (!product) {
      return NextResponse.json({ error: 'Invalid productId' }, { status: 400 });
    }
    if (!body.readingSessionId) {
      return NextResponse.json({ error: 'Missing readingSessionId' }, { status: 400 });
    }
    if (!uuidPattern.test(body.readingSessionId)) {
      return NextResponse.json({ error: 'Invalid readingSessionId' }, { status: 400 });
    }

    const session = await auth();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const locale = body.locale ?? 'en';
    const customerEmail = session?.user?.email ?? body.email ?? undefined;
    const metadata = {
      productId: product.productId,
      readingSessionId: body.readingSessionId,
      locale,
      userId: session?.user?.id ?? '',
    };

    const checkoutSession = await getStripe().checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [buildLineItem(product)],
        customer_email: customerEmail,
        client_reference_id: body.readingSessionId,
        metadata,
        success_url: `${appUrl}/${locale}/love-reading/result/${body.readingSessionId}?checkout=success`,
        cancel_url: `${appUrl}/${locale}/love-reading/result/${body.readingSessionId}?checkout=cancelled`,
        allow_promotion_codes: true,
      },
      {
        idempotencyKey: `${product.productId}:${body.readingSessionId}:${session?.user?.id ?? body.email ?? 'guest'}`,
      }
    );

    await createPendingOrder({
      product,
      checkoutSessionId: checkoutSession.id,
      userId: session?.user?.id ?? null,
      readingSessionId: body.readingSessionId,
      customerEmail,
    });
    await trackLoveFunnelEvent('love_checkout_created', {
      productId: product.productId,
      readingSessionId: body.readingSessionId,
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
