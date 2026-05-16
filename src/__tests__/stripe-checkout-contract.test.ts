import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Stripe checkout billing contract', () => {
  it('defines the two Love V1 one-time products with fixed USD amounts', () => {
    const billing = read('src/lib/billing.ts');

    expect(billing).toContain('solo_love_report');
    expect(billing).toContain('unitAmount: 499');
    expect(billing).toContain('compatibility_report');
    expect(billing).toContain('Full Relationship Report');
    expect(billing).not.toContain('tianji_plus_monthly');
    expect(billing).not.toContain("mode: 'subscription'");
    expect(billing).not.toContain('recurring');
  });

  it('creates one-time Checkout sessions from /api/checkout with minimal metadata', () => {
    const checkout = read('src/app/api/checkout/route.ts');

    expect(checkout).toContain('checkout.sessions.create');
    expect(checkout).toContain('getBillingProduct');
    expect(checkout).toContain("mode: 'payment'");
    expect(checkout).toContain('metadata');
    expect(checkout).toContain('readingSessionId');
    expect(checkout).toContain('relationshipReadingId');
    expect(checkout).toContain("source: checkoutSource");
    expect(checkout).toContain('/relationship/result/');
    expect(checkout).toContain('idempotencyKey');
    expect(checkout).toContain('customer_email');
    expect(checkout).not.toContain('subscription_data');
    expect(checkout).not.toContain('CHECKOUT_SESSION_ID');
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
    expect(webhook).toContain('recordStripeEvent');
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
    const migration = read('supabase/migrations/20260507_stripe_checkout.sql');
    const billing = read('src/lib/billing.ts');

    for (const tableName of ['orders', 'stripe_events']) {
      expect(migration).toContain(`create table if not exists public.${tableName}`);
      expect(migration).toContain(`alter table public.${tableName} enable row level security`);
    }

    expect(migration).toContain('unique (stripe_event_id)');
    expect(migration).toContain('stripe_checkout_session_id');
    expect(migration).toContain('customer_email text');
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
