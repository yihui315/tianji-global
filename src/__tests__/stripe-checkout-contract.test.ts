import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Stripe checkout billing contract', () => {
  it('defines the canonical Love premium one-time product with legacy aliases', () => {
    const billing = read('src/lib/billing.ts');
    const revenueContract = read('src/lib/love-reading/revenue-contract.ts');

    expect(revenueContract).toContain("LOVE_PREMIUM_REPORT_PRODUCT_TYPE = 'love_premium_report'");
    expect(revenueContract).toContain('solo_love_report');
    expect(revenueContract).toContain('compatibility_report');
    expect(billing).toContain('LOVE_PREMIUM_REPORT_PRICE.amountMinor');
    expect(billing).toContain('LOVE_PREMIUM_REPORT_PRICE.currency');
    expect(billing).toContain('STRIPE_LOVE_PREMIUM_REPORT_PRICE_ID');
    expect(billing).not.toContain('tianji_plus_monthly');
    expect(billing).not.toContain("mode: 'subscription'");
    expect(billing).not.toContain('recurring');
  });

  it('creates one-time Checkout sessions from /api/checkout with minimal metadata', () => {
    const checkout = read('src/app/api/checkout/route.ts');

    expect(checkout).toContain('checkout.sessions.create');
    expect(checkout).toContain('getBillingProduct');
    expect(checkout).toContain('normalizeLoveProductType');
    expect(checkout).toContain('getCheckoutPriceIdReadiness');
    expect(checkout).toContain("mode: 'payment'");
    expect(checkout).toContain('metadata');
    expect(checkout).toContain('readingSessionId');
    expect(checkout).toContain('relationshipReadingId');
    expect(checkout).toContain("source: checkoutSource");
    expect(checkout).toContain('/relationship/result/');
    expect(checkout).toContain('idempotencyKey');
    expect(checkout).toContain('customer_email');
    expect(checkout).toContain('createPendingOrder');
    expect(checkout).toContain('getStripeTestModeReadiness');
    expect(checkout).toContain('isBillingPersistenceConfigured');
    expect(checkout.indexOf('getCheckoutPriceIdReadiness')).toBeLessThan(
      checkout.indexOf('checkout.sessions.create')
    );
    expect(checkout).not.toContain('subscription_data');
    expect(checkout).not.toContain('CHECKOUT_SESSION_ID');
  });

  it('keeps subscriptions disabled until lifecycle handlers exist and uses fixed Price IDs only', () => {
    const checkout = read('src/app/api/stripe/checkout/route.ts');
    const stripe = read('src/lib/stripe.ts');

    expect(checkout).toContain('ENABLE_STRIPE_SUBSCRIPTIONS');
    expect(checkout).toContain('subscription_lifecycle_not_ready');
    expect(checkout).toContain('subscription_price_id_missing');
    expect(checkout).toContain('price: plan.priceId');
    expect(checkout).not.toContain('price_data');
    expect(stripe).toContain('STRIPE_PRO_MONTHLY_PRICE_ID');
    expect(stripe).toContain('STRIPE_PRO_YEARLY_PRICE_ID');
    expect(stripe).not.toContain("|| 'price_pro_monthly'");
    expect(stripe).not.toContain("|| 'price_pro_yearly'");
  });

  it('keeps paid checkout and unlock routes disabled unless pay-per-use is explicitly enabled', () => {
    const payPerUse = read('src/lib/pay-per-use.ts');
    const guardedRoutes = [
      'src/app/api/checkout/route.ts',
      'src/app/api/stripe/checkout/route.ts',
      'src/app/api/destiny/unlock/route.ts',
    ];

    expect(payPerUse).toContain('ENABLE_PAY_PER_USE');
    expect(payPerUse).toContain("process.env.ENABLE_PAY_PER_USE === 'true'");
    expect(payPerUse).toContain('requirePayPerUseEnabled');

    for (const route of guardedRoutes) {
      expect(read(route)).toContain('requirePayPerUseEnabled');
    }
  });

  it('verifies webhook signatures, handles paid checkout completion, and records idempotency', () => {
    const webhook = read('src/app/api/stripe/webhook/route.ts');

    expect(webhook).toContain('request.text()');
    expect(webhook).toContain('stripe-signature');
    expect(webhook).toContain('webhooks.constructEvent');
    expect(webhook).toContain('claimStripeEvent');
    expect(webhook).toContain('markStripeEventProcessed');
    expect(webhook).toContain('markStripeEventFailed');
    expect(webhook).toContain('normalizeOneTimeProductType');
    expect(webhook).toContain("case 'checkout.session.completed'");
    expect(webhook).toContain('payment_status');
    expect(webhook).toContain('markOrderPaid');
    expect(webhook).toContain('markRelationshipReadingPremium');
    expect(webhook).toContain('ensureReportJobForSession');
    expect(webhook).toContain('sendReportReadyEmailForCheckoutSession');
    expect(webhook).not.toContain("case 'invoice.paid'");
    expect(webhook).not.toContain("case 'invoice.payment_failed'");
    expect(webhook).not.toContain("case 'customer.subscription.updated'");
    expect(webhook).toContain('isPayPerUseEnabled');
    expect(webhook).toContain('pay_per_use_disabled');
  });

  it('adds one-time billing tables and an entitlement checker', () => {
    const migration = [
      read('supabase/migrations/20260507_stripe_checkout.sql'),
      read('supabase/migrations/20260720_phase3_test_payment_closure.sql'),
    ].join('\n');
    const billing = read('src/lib/billing.ts');

    for (const tableName of ['orders', 'stripe_events']) {
      expect(migration).toContain(`create table if not exists public.${tableName}`);
      expect(migration).toContain(`alter table public.${tableName} enable row level security`);
    }

    expect(migration).toContain('unique (stripe_event_id)');
    expect(migration).toContain('stripe_checkout_session_id');
    expect(migration).toContain('customer_email text');
    expect(migration).toContain('resource_ref');
    expect(migration).toContain("'ask_unlock'");
    expect(migration).toContain("'draw_unlock'");
    expect(migration).toContain('processing_started_at');
    expect(migration).not.toContain('create table if not exists public.subscriptions');
    expect(billing).toContain('async function hasEntitlement');
  });

  it('captures email safely for report recovery without raw birth data', () => {
    const email = read('src/lib/love-report-email.ts');

    expect(email).toContain('sendReportReadyEmailForCheckoutSession');
    expect(email).toContain('buildPrivateReportLink');
    expect(email).toContain('Your TianJi Love report is ready');
    expect(email).not.toMatch(/birth(Date|Time|Place)/);
  });
});
