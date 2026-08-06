import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  claimStripeEvent: vi.fn(),
  markOrderPaid: vi.fn(),
  markOrderRefunded: vi.fn(),
  markStripeEventProcessed: vi.fn(),
  markStripeEventFailed: vi.fn(),
  trackLoveFunnelEvent: vi.fn(),
  markRelationshipReadingPremium: vi.fn(),
  ensureReportJobForSession: vi.fn(),
  runReportJob: vi.fn(),
  sendReportReadyEmailForCheckoutSession: vi.fn(),
}));

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({ webhooks: { constructEvent: mocks.constructEvent } }),
}));

vi.mock('@/lib/billing', () => ({
  claimStripeEvent: mocks.claimStripeEvent,
  getBillingProduct: (productId: string) => ({
    productId,
    kind: productId === 'ask_unlock' || productId === 'draw_unlock'
      ? 'one_time_unlock'
      : 'premium_report',
  }),
  markOrderPaid: mocks.markOrderPaid,
  markOrderRefunded: mocks.markOrderRefunded,
  markStripeEventProcessed: mocks.markStripeEventProcessed,
  markStripeEventFailed: mocks.markStripeEventFailed,
}));

vi.mock('@/lib/love-funnel-analytics', () => ({
  trackLoveFunnelEvent: mocks.trackLoveFunnelEvent,
}));

vi.mock('@/lib/love-report-email', () => ({
  sendReportReadyEmailForCheckoutSession: mocks.sendReportReadyEmailForCheckoutSession,
}));

vi.mock('@/lib/pay-per-use', () => ({ isPayPerUseEnabled: () => true }));
vi.mock('@/lib/relationship-reading-store', () => ({
  markRelationshipReadingPremium: mocks.markRelationshipReadingPremium,
}));
vi.mock('@/lib/report-jobs', () => ({
  ensureReportJobForSession: mocks.ensureReportJobForSession,
  runReportJob: mocks.runReportJob,
}));

function request() {
  return new NextRequest('https://example.test/api/stripe/webhook', {
    method: 'POST',
    body: '{}',
    headers: { 'stripe-signature': 'test-signature' },
  });
}

function completedEvent(productId: 'ask_unlock' | 'draw_unlock' | 'love_premium_report') {
  return {
    id: `evt_${productId}`,
    type: 'checkout.session.completed',
    data: {
      object: {
        id: `checkout_${productId}`,
        mode: 'payment',
        payment_status: 'paid',
        amount_total: productId === 'ask_unlock' ? 199 : 299,
        currency: 'usd',
        payment_intent: 'payment_intent_fixture',
        customer_details: null,
        customer_email: null,
        metadata: {
          productId,
          resourceRef: 'masked-resource-ref',
          readingSessionId: '00000000-0000-4000-8000-000000000001',
          source: 'love_reading',
        },
      },
    },
  };
}

describe('Stripe webhook payment closure', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', ['whsec', 'fixture'].join('_'));
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.claimStripeEvent.mockResolvedValue(true);
  });

  it.each(['ask_unlock', 'draw_unlock'] as const)(
    'marks %s paid once and does not run premium report work',
    async (productId) => {
      mocks.constructEvent.mockReturnValue(completedEvent(productId));

      const { POST } = await import('@/app/api/stripe/webhook/route');
      const response = await POST(request());

      expect(response.status).toBe(200);
      expect(mocks.markOrderPaid).toHaveBeenCalledTimes(1);
      expect(mocks.ensureReportJobForSession).not.toHaveBeenCalled();
      expect(mocks.markStripeEventProcessed).toHaveBeenCalledWith(`evt_${productId}`);
      expect(mocks.markStripeEventFailed).not.toHaveBeenCalled();
    }
  );

  it('treats an already claimed event as a duplicate without granting again', async () => {
    mocks.constructEvent.mockReturnValue(completedEvent('ask_unlock'));
    mocks.claimStripeEvent.mockResolvedValue(false);

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const response = await POST(request());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ received: true, duplicate: true });
    expect(mocks.markOrderPaid).not.toHaveBeenCalled();
    expect(mocks.markStripeEventProcessed).not.toHaveBeenCalled();
  });

  it('releases a failed claim so Stripe can retry the event', async () => {
    const event = completedEvent('ask_unlock');
    mocks.constructEvent.mockReturnValue(event);
    mocks.markOrderPaid.mockRejectedValue(new Error('database unavailable'));

    const { POST } = await import('@/app/api/stripe/webhook/route');
    const response = await POST(request());

    expect(response.status).toBe(500);
    expect(mocks.markStripeEventFailed).toHaveBeenCalledWith(event.id);
    expect(mocks.markStripeEventProcessed).not.toHaveBeenCalled();
  });
});
