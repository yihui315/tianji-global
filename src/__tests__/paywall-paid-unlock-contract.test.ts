import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { clearPreviewRecordsForTests, createPreviewRecord } from '@/lib/ai/usage';

const FULL_ANSWER = 'FULL PAID ANSWER: keep this server-side until Stripe verification completes.';

const mockCheckoutCreate = vi.fn();
const mockCheckoutRetrieve = vi.fn();
const mockConstructEvent = vi.fn();
const mockCreateOrder = vi.fn();
const mockAttachCheckout = vi.fn();
const mockGetPaidOrder = vi.fn();
const mockRecordWebhookEvent = vi.fn();
const mockMarkOrderPaid = vi.fn();

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mockCheckoutCreate,
        retrieve: mockCheckoutRetrieve,
      },
    },
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  }),
}));

vi.mock('@/lib/pay-per-use-orders', () => ({
  createPayPerUseOrder: mockCreateOrder,
  attachCheckoutSessionToOrder: mockAttachCheckout,
  getPaidPayPerUseOrder: mockGetPaidOrder,
  recordStripeWebhookEvent: mockRecordWebhookEvent,
  markPayPerUseOrderPaidFromSession: mockMarkOrderPaid,
}));

vi.mock('pg', () => ({
  Pool: class {
    on() {
      return undefined;
    }
  },
}));

function postRequest(url: string, body: Record<string, unknown>) {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createAskPreview(): string {
  return createPreviewRecord({
    kind: 'ask',
    question: 'Should I launch?',
    language: 'en',
    preview: 'Short preview',
    fullAnswer: FULL_ANSWER,
    usage: {
      provider: 'openai',
      model: 'openai/gpt-4o-mini',
      latencyMs: 10,
      tokensUsed: { input: 4, output: 8 },
    },
  });
}

describe('paid unlock and entitlement verification', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.ENABLE_PAY_PER_USE = 'true';
    process.env.NEXT_PUBLIC_APP_URL = 'https://tianji.love';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

    clearPreviewRecordsForTests();

    mockCreateOrder.mockResolvedValue({
      id: 'order_123',
      kind: 'ask',
      requestId: 'request',
      requestRef: 'ref',
      status: 'pending',
      amountCents: 499,
      currency: 'usd',
    });
    mockCheckoutCreate.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.test/session',
    });
    mockGetPaidOrder.mockResolvedValue(null);
    mockCheckoutRetrieve.mockResolvedValue({
      id: 'cs_test_123',
      status: 'complete',
      payment_status: 'paid',
      metadata: {},
    });
  });

  it('creates checkout with only opaque request/order metadata', async () => {
    const id = createAskPreview();
    const { POST } = await import('@/app/api/ask/unlock/route');

    const response = await POST(postRequest('https://tianji.love/api/ask/unlock', { id }) as never);
    const body = await response.json();
    const metadata = mockCheckoutCreate.mock.calls[0][0].metadata;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ url: 'https://checkout.stripe.test/session', orderId: 'order_123' });
    expect(mockAttachCheckout).toHaveBeenCalledWith('order_123', 'cs_test_123');
    expect(metadata).toMatchObject({
      flow: 'pay-per-use',
      kind: 'ask',
      orderId: 'order_123',
      requestId: id,
    });
    expect(JSON.stringify(metadata)).not.toContain(FULL_ANSWER);
    expect(JSON.stringify(metadata)).not.toContain('Should I launch?');
  });

  it('returns the full answer only after Stripe and server order verification', async () => {
    const id = createAskPreview();
    const { tokenRef } = await import('@/lib/pay-per-use-unlock');
    const { GET } = await import('@/app/api/ask/unlock/route');

    mockCheckoutRetrieve.mockResolvedValue({
      id: 'cs_test_123',
      status: 'complete',
      payment_status: 'paid',
      metadata: {
        flow: 'pay-per-use',
        kind: 'ask',
        requestRef: tokenRef(id),
      },
    });

    const pendingResponse = await GET(
      new NextRequest(`https://tianji.love/api/ask/unlock?session_id=cs_test_123&id=${id}`)
    );
    expect(pendingResponse.status).toBe(403);

    mockGetPaidOrder.mockResolvedValueOnce({
      id: 'order_123',
      kind: 'ask',
      requestId: id,
      requestRef: tokenRef(id),
      status: 'paid',
      amountCents: 499,
      currency: 'usd',
      stripeCheckoutSessionId: 'cs_test_123',
    });

    const paidResponse = await GET(
      new NextRequest(`https://tianji.love/api/ask/unlock?session_id=cs_test_123&id=${id}`)
    );
    const body = await paidResponse.json();

    expect(paidResponse.status).toBe(200);
    expect(body.data.fullAnswer).toBe(FULL_ANSWER);
  });

  it('rejects invalid webhook signatures and processes duplicate events idempotently', async () => {
    const { POST } = await import('@/app/api/stripe/webhook/route');

    mockConstructEvent.mockImplementationOnce(() => {
      throw new Error('bad signature');
    });

    const invalid = await POST(
      new NextRequest('https://tianji.love/api/stripe/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': 'bad' },
        body: '{}',
      })
    );
    expect(invalid.status).toBe(400);
    expect(mockRecordWebhookEvent).not.toHaveBeenCalled();

    const event = {
      id: 'evt_paid_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
            flow: 'pay-per-use',
            kind: 'ask',
            orderId: 'order_123',
            requestRef: 'ref_123',
          },
          payment_intent: 'pi_123',
        },
      },
    };
    mockConstructEvent.mockReturnValue(event);
    mockRecordWebhookEvent.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    mockMarkOrderPaid.mockResolvedValue({ id: 'order_123' });

    const first = await POST(
      new NextRequest('https://tianji.love/api/stripe/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid' },
        body: '{}',
      })
    );
    expect(first.status).toBe(200);
    expect(mockMarkOrderPaid).toHaveBeenCalledTimes(1);

    const duplicate = await POST(
      new NextRequest('https://tianji.love/api/stripe/webhook', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid' },
        body: '{}',
      })
    );
    const duplicateBody = await duplicate.json();
    expect(duplicate.status).toBe(200);
    expect(duplicateBody).toMatchObject({ duplicate: true });
    expect(mockMarkOrderPaid).toHaveBeenCalledTimes(1);
  });
});
