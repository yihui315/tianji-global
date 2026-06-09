/**
 * Stripe Test-Mode Checkout — TianJi Global
 *
 * Test-mode checkout session creation for the love reading revenue funnel.
 * Uses Stripe test mode with simulated sessions when no real test price ID is available.
 */

import { getStripe } from '@/lib/stripe';
import { BILLING_PRODUCTS, buildLineItem, type BillingProductId } from '@/lib/billing';
import { isProductEnabled } from '@/lib/pay-per-use';

export interface TestCheckoutParams {
  productId: string;
  readingId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface TestCheckoutResult {
  sessionId: string;
  checkoutUrl: string;
}

/**
 * Creates a Stripe checkout session in test mode.
 *
 * If STRIPE_TEST_PRICE_ID_{PRODUCT} is set, uses that price ID directly.
 * Otherwise falls back to creating a session with unit_amount (test mode simulation).
 *
 * Logs [CHECKOUT_TEST] events for observability.
 */
export async function createTestCheckoutSession(
  params: TestCheckoutParams,
): Promise<TestCheckoutResult> {
  const { productId, readingId, customerEmail, successUrl, cancelUrl } = params;

  if (!isProductEnabled(productId)) {
    throw new Error(`Product ${productId} is not enabled for pay-per-use`);
  }

  const product = BILLING_PRODUCTS[productId as BillingProductId];
  if (!product) {
    throw new Error(`Unknown billing product: ${productId}`);
  }

  // Check for test price ID override per product
  const testPriceIdEnvKey = `STRIPE_TEST_PRICE_ID_${productId.toUpperCase()}`;
  const testPriceId = process.env[testPriceIdEnvKey];

  const stripe = getStripe();

  let checkoutSession;

  if (testPriceId) {
    // Use the test price ID directly
    console.log(`[CHECKOUT_TEST] Using test price ID for ${productId}: ${testPriceId}`);
    checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [
          {
            price: testPriceId,
            quantity: 1,
          },
        ],
        customer_email: customerEmail,
        client_reference_id: readingId ?? undefined,
        metadata: {
          productId,
          source: 'love_reading',
          readingSessionId: readingId ?? '',
          testMode: 'true',
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      },
      {
        idempotencyKey: `test:${productId}:${readingId ?? 'no-reading'}:${Date.now()}`,
      },
    );
  } else {
    // Simulate with unit_amount (test mode without real price ID)
    console.log(
      `[CHECKOUT_TEST] Creating simulated session for ${productId} with unit_amount ${product.unitAmount}`,
    );
    checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [buildLineItem(product)],
        customer_email: customerEmail,
        client_reference_id: readingId ?? undefined,
        metadata: {
          productId,
          source: 'love_reading',
          readingSessionId: readingId ?? '',
          testMode: 'true',
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
      },
      {
        idempotencyKey: `test:${productId}:${readingId ?? 'no-reading'}:${Date.now()}`,
      },
    );
  }

  console.log(`[CHECKOUT_TEST] Session created: ${checkoutSession.id} for product ${productId}`);

  return {
    sessionId: checkoutSession.id,
    checkoutUrl: checkoutSession.url ?? '',
  };
}