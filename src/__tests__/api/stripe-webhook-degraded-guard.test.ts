import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getStripe: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
  markOrderPaid: vi.fn(),
  markOrderRefunded: vi.fn(),
  recordStripeEvent: vi.fn(),
  trackLoveFunnelEvent: vi.fn(),
  sendReportReadyEmailForCheckoutSession: vi.fn(),
  isPayPerUseEnabled: vi.fn(() => true),
  markRelationshipReadingPremium: vi.fn(),
  ensureReportJobForSession: vi.fn(),
  runReportJob: vi.fn(),
}));

vi.mock('@/lib/stripe', () => ({
  getStripe: mocks.getStripe,
}));

vi.mock('@/lib/billing', () => ({
  markOrderPaid: mocks.markOrderPaid,
  markOrderRefunded: mocks.markOrderRefunded,
  recordStripeEvent: mocks.recordStripeEvent,
}));

vi.mock('@/lib/love-funnel-analytics', () => ({
  trackLoveFunnelEvent: mocks.trackLoveFunnelEvent,
}));

vi.mock('@/lib/love-report-email', () => ({
  sendReportReadyEmailForCheckoutSession: mocks.sendReportReadyEmailForCheckoutSession,
}));

vi.mock('@/lib/pay-per-use', () => ({
  isPayPerUseEnabled: mocks.isPayPerUseEnabled,
}));

vi.mock('@/lib/relationship-reading-store', () => ({
  markRelationshipReadingPremium: mocks.markRelationshipReadingPremium,
}));

vi.mock('@/lib/report-jobs', () => ({
  ensureReportJobForSession: mocks.ensureReportJobForSession,
  runReportJob: mocks.runReportJob,
}));

function postWebhookRequest() {
  return new NextRequest('https://tianji.love/api/stripe/webhook', {
    method: 'POST',
    body: JSON.stringify({ id: 'evt_test_degraded' }),
  });
}

describe('Stripe webhook degraded runtime guard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    for (const mock of Object.values(mocks)) {
      if ('mockReset' in mock) mock.mockReset();
    }
    mocks.getStripe.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(),
      },
    });
    mocks.isPayPerUseEnabled.mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('skips webhook mutation safely when Stripe is unavailable in staging degraded mode', async () => {
    vi.stubEnv('STAGING_DEGRADED_MODE', 'true');
    vi.stubEnv('STRIPE_LIVE_DISABLED', 'true');
    vi.stubEnv('STRIPE_SECRET_KEY', undefined);
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', undefined);

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const response = await POST(postWebhookRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      received: true,
      skipped: 'payment_unavailable',
    });
    expect(mocks.getStripe).not.toHaveBeenCalled();
    expect(mocks.recordStripeEvent).not.toHaveBeenCalled();
    expect(mocks.markOrderPaid).not.toHaveBeenCalled();
    expect(mocks.markOrderRefunded).not.toHaveBeenCalled();
    expect(mocks.sendReportReadyEmailForCheckoutSession).not.toHaveBeenCalled();
    expect(JSON.stringify(json)).not.toMatch(/sk_|rk_|whsec_|birthDate|birthTime|birthLocation|timezone|prompt/i);
  });
});
