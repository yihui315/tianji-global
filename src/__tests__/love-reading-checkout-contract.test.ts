import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildLineItem,
  getBillingProduct,
  getCheckoutPriceIdReadiness,
} from '@/lib/billing';
import {
  LOVE_PREMIUM_REPORT_CHECKOUT_READINESS_ERROR,
  LOVE_PREMIUM_REPORT_PRICE,
  LOVE_PREMIUM_REPORT_PRODUCT_TYPE,
  STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID_ENV,
} from '@/lib/love-reading/revenue-contract';
import { buildLoveReportSharePayload } from '@/lib/love-reading/share-payload';
import type { LoveReport } from '@/lib/love-reading/report-schema';
import { getStripeTestModeReadiness } from '@/lib/stripe';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const sampleReport = {
  privacySafeShareSummary: {
    title: 'Learning Rhythm',
    summary: 'A privacy-safe first signal.',
    scoreBand: '60-79',
    cta: 'Start your private TianJi Love preview',
  },
  relationshipArchetype: {
    title: 'Learning Rhythm',
  },
} as LoveReport;

describe('Love Reading checkout contract readiness', () => {
  it('normalizes legacy product aliases before checkout handling', () => {
    expect(getBillingProduct('solo_love_report')?.productId).toBe(
      LOVE_PREMIUM_REPORT_PRODUCT_TYPE
    );
    expect(getBillingProduct('compatibility_report')?.productId).toBe(
      LOVE_PREMIUM_REPORT_PRODUCT_TYPE
    );
  });

  it('accepts canonical love_premium_report and rejects unknown product types', () => {
    expect(getBillingProduct('love_premium_report')?.productId).toBe(
      LOVE_PREMIUM_REPORT_PRODUCT_TYPE
    );
    expect(getBillingProduct('unknown_product')).toBeNull();
    expect(getBillingProduct('')).toBeNull();
  });

  it('keeps Ask and Draw as fixed one-time USD unlocks with inline price data', () => {
    const ask = getBillingProduct('ask_unlock');
    const draw = getBillingProduct('draw_unlock');

    expect(ask).toMatchObject({ productId: 'ask_unlock', unitAmount: 199, currency: 'usd' });
    expect(draw).toMatchObject({ productId: 'draw_unlock', unitAmount: 299, currency: 'usd' });
    expect(ask && buildLineItem(ask)).toMatchObject({
      price_data: { currency: 'usd', unit_amount: 199 },
      quantity: 1,
    });
    expect(draw && buildLineItem(draw)).toMatchObject({
      price_data: { currency: 'usd', unit_amount: 299 },
      quantity: 1,
    });
  });

  it('fails closed unless the server key is explicitly test mode', () => {
    expect(getStripeTestModeReadiness({})).toMatchObject({ ready: false, mode: 'missing' });
    expect(getStripeTestModeReadiness({ STRIPE_SECRET_KEY: ['sk', 'live', 'fixture'].join('_') })).toMatchObject({
      ready: false,
      mode: 'live_forbidden',
    });
    expect(getStripeTestModeReadiness({ STRIPE_SECRET_KEY: 'not-a-stripe-key' })).toMatchObject({
      ready: false,
      mode: 'invalid',
    });
    expect(getStripeTestModeReadiness({ STRIPE_SECRET_KEY: ['sk', 'test', 'fixture'].join('_') })).toEqual({
      ready: true,
      mode: 'test',
    });
  });

  it('blocks checkout readiness when the future Stripe Price ID is missing', () => {
    const product = getBillingProduct('love_premium_report');
    expect(product).not.toBeNull();

    const readiness = getCheckoutPriceIdReadiness(product!, {});

    expect(readiness).toEqual({
      ready: false,
      code: LOVE_PREMIUM_REPORT_CHECKOUT_READINESS_ERROR,
      error: 'Love premium report checkout is not configured',
    });
  });

  it('uses a configured test Price ID without inline checkout fallback', () => {
    const product = getBillingProduct('solo_love_report');
    expect(product).not.toBeNull();

    const readiness = getCheckoutPriceIdReadiness(product!, {
      [STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID_ENV]: 'price_test_love_premium_report',
    });

    expect(readiness).toEqual({
      ready: true,
      priceId: 'price_test_love_premium_report',
    });
    expect(readiness.ready ? buildLineItem(product!, readiness.priceId) : null).toEqual({
      price: 'price_test_love_premium_report',
      quantity: 1,
    });
  });

  it('keeps the canonical CNY price contract visible to checkout source', () => {
    expect(LOVE_PREMIUM_REPORT_PRICE).toEqual({
      currency: 'cny',
      amountMinor: 1990,
      display: '¥19.9',
    });

    const checkoutRoute = read('src/app/api/checkout/route.ts');
    expect(checkoutRoute).toContain('normalizedProductType');
    expect(checkoutRoute).toContain('getCheckoutPriceIdReadiness');
    expect(checkoutRoute.indexOf('getCheckoutPriceIdReadiness')).toBeLessThan(
      checkoutRoute.indexOf('checkout.sessions.create')
    );
    expect(read('src/lib/billing.ts')).toContain('STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID');
  });

  it('does not expose payment state in public share payloads', () => {
    const payload = buildLoveReportSharePayload(sampleReport, {
      paymentState: 'paid',
      checkoutSessionId: 'cs_test_not_public',
      stripeCustomerId: 'cus_not_public',
      displayName: 'A*',
    });

    expect(payload).toEqual({
      title: 'Learning Rhythm',
      summary: 'A privacy-safe first signal.',
      scoreBand: '60-79',
      cta: 'Start your private TianJi Love preview',
      archetypeTitle: 'Learning Rhythm',
      displayName: 'A*',
    });
    expect(JSON.stringify(payload)).not.toMatch(/paid|checkout|stripe|cs_test/i);
  });
});
