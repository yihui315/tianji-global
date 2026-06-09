/**
 * Stripe Test-Mode Checkout API — TianJi Global
 *
 * POST /api/checkout/test
 *
 * Creates a Stripe checkout session in test mode for the love reading revenue funnel.
 * Validates productId against BILLING_PRODUCTS and supports solo_love_question,
 * solo_love_report, and compatibility_report.
 */

import { NextRequest, NextResponse } from 'next/server';
import { BILLING_PRODUCTS, type BillingProductId } from '@/lib/billing';
import { isProductEnabled, isPayPerUseEnabled } from '@/lib/pay-per-use';
import { createTestCheckoutSession } from '@/lib/checkout-test';
import { isUuidReadingId } from '@/lib/reading-id';

export async function POST(request: NextRequest) {
  if (!isPayPerUseEnabled()) {
    return NextResponse.json(
      { error: 'Pay-per-use is not enabled' },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as {
      productId?: string;
      readingId?: string;
      source?: string;
      email?: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    const { productId, readingId, source, email, successUrl, cancelUrl } = body;

    // Validate productId
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    if (!BILLING_PRODUCTS[productId as BillingProductId]) {
      return NextResponse.json(
        { error: `Invalid productId: ${productId}` },
        { status: 400 },
      );
    }

    if (!isProductEnabled(productId)) {
      return NextResponse.json(
        { error: `Product ${productId} is not enabled` },
        { status: 403 },
      );
    }

    // Validate readingId format if provided
    if (readingId && !isUuidReadingId(readingId)) {
      return NextResponse.json(
        { error: 'Invalid readingId format' },
        { status: 400 },
      );
    }

    // Validate URLs
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resolvedSuccessUrl =
      successUrl ?? `${appUrl}/en/love-reading/result/${readingId ?? ''}`;
    const resolvedCancelUrl =
      cancelUrl ?? `${appUrl}/en/love-reading/result/${readingId ?? ''}`;

    console.log(
      `[CHECKOUT_TEST] Creating test checkout: productId=${productId}, readingId=${readingId}, source=${source}`,
    );

    const result = await createTestCheckoutSession({
      productId,
      readingId,
      customerEmail: email,
      successUrl: resolvedSuccessUrl,
      cancelUrl: resolvedCancelUrl,
    });

    console.log(
      `[CHECKOUT_TEST] Session created: ${result.sessionId} for product ${productId}`,
    );

    return NextResponse.json({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
      mode: 'test',
    });
  } catch (error) {
    console.error('[CHECKOUT_TEST] Error creating test checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create test checkout session' },
      { status: 500 },
    );
  }
}