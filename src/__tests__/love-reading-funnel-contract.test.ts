import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockCheckoutCreate = vi.fn();
const mockCheckoutRetrieve = vi.fn();
const mockCreateOrder = vi.fn();
const mockAttachCheckout = vi.fn();
const mockGetPaidOrder = vi.fn();

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mockCheckoutCreate,
        retrieve: mockCheckoutRetrieve,
      },
    },
  }),
}));

vi.mock('@/lib/pay-per-use-orders', () => ({
  createPayPerUseOrder: mockCreateOrder,
  attachCheckoutSessionToOrder: mockAttachCheckout,
  getPaidPayPerUseOrder: mockGetPaidOrder,
}));

function jsonRequest(body: Record<string, unknown>) {
  return new NextRequest('https://tianji.love/api/love-reading/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const birth = {
  year: '1991',
  month: '7',
  day: '14',
  time: '08:00',
};

describe('Love Reading paid funnel contract', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.ENABLE_PAY_PER_USE = 'true';
    process.env.NEXT_PUBLIC_APP_URL = 'https://tianji.love';

    const { clearLoveReadingSessionsForTests } = await import('@/lib/love-reading');
    clearLoveReadingSessionsForTests();

    mockCreateOrder.mockResolvedValue({
      id: 'order_love_123',
      kind: 'love-reading',
      requestId: 'request',
      requestRef: 'ref',
      status: 'pending',
      amountCents: 1299,
      currency: 'usd',
    });
    mockCheckoutCreate.mockResolvedValue({
      id: 'cs_love_123',
      url: 'https://checkout.stripe.test/love',
    });
    mockCheckoutRetrieve.mockResolvedValue({
      id: 'cs_love_123',
      status: 'complete',
      payment_status: 'paid',
      metadata: {},
    });
    mockGetPaidOrder.mockResolvedValue(null);
  });

  it('creates an opaque result session without putting birth data in the URL or response body', async () => {
    const { POST, GET } = await import('@/app/api/love-reading/session/route');

    const response = await POST(
      jsonRequest({
        mode: 'solo',
        language: 'en',
        birth,
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toEqual(expect.any(String));
    expect(body.resultUrl).toBe(`/love-reading/result/${body.id}?lang=en`);
    const resultUrl = new URL(body.resultUrl, 'https://tianji.love');
    expect(resultUrl.searchParams.get('year')).toBeNull();
    expect(resultUrl.searchParams.get('month')).toBeNull();
    expect(resultUrl.searchParams.get('day')).toBeNull();
    expect(resultUrl.searchParams.get('time')).toBeNull();
    expect(resultUrl.pathname).toBe(`/love-reading/result/${body.id}`);
    expect(JSON.stringify(body)).not.toContain('Complete Love Reading');

    const preview = await GET(
      new NextRequest(`https://tianji.love/api/love-reading/session?id=${body.id}`)
    );
    const previewBody = await preview.json();

    expect(preview.status).toBe(200);
    expect(previewBody).toMatchObject({
      id: body.id,
      teaser: expect.any(String),
      price: '$12.99',
      unlocked: false,
    });
    expect(previewBody.fullReport).toBeUndefined();
  });

  it('opens checkout using only opaque order and request metadata', async () => {
    const { POST } = await import('@/app/api/love-reading/session/route');

    const created = await POST(jsonRequest({ mode: 'solo', language: 'en', birth }));
    const createdBody = await created.json();
    const checkout = await POST(
      jsonRequest({
        action: 'checkout',
        id: createdBody.id,
        language: 'en',
      })
    );
    const checkoutBody = await checkout.json();
    const metadata = mockCheckoutCreate.mock.calls[0][0].metadata;

    expect(checkout.status).toBe(200);
    expect(checkoutBody).toMatchObject({ url: 'https://checkout.stripe.test/love', orderId: 'order_love_123' });
    expect(mockAttachCheckout).toHaveBeenCalledWith('order_love_123', 'cs_love_123');
    expect(metadata).toMatchObject({
      flow: 'pay-per-use',
      kind: 'love-reading',
      orderId: 'order_love_123',
      requestId: createdBody.id,
    });
    expect(metadata.year).toBeUndefined();
    expect(metadata.month).toBeUndefined();
    expect(metadata.day).toBeUndefined();
    expect(metadata.time).toBeUndefined();
    expect(metadata.birth).toBeUndefined();
    expect(metadata.fullReport).toBeUndefined();
  });

  it('returns the full report only after Stripe and server order verification', async () => {
    const { POST, GET } = await import('@/app/api/love-reading/session/route');
    const { loveReadingRequestRef } = await import('@/lib/love-reading');

    const created = await POST(jsonRequest({ mode: 'solo', language: 'en', birth }));
    const createdBody = await created.json();
    const requestRef = loveReadingRequestRef(createdBody.id);
    mockCheckoutRetrieve.mockResolvedValue({
      id: 'cs_love_123',
      status: 'complete',
      payment_status: 'paid',
      metadata: {
        flow: 'pay-per-use',
        kind: 'love-reading',
        requestRef,
      },
    });

    const pending = await GET(
      new NextRequest(`https://tianji.love/api/love-reading/session?id=${createdBody.id}&session_id=cs_love_123`)
    );
    const pendingBody = await pending.json();
    expect(pending.status).toBe(200);
    expect(pendingBody.unlocked).toBe(false);
    expect(pendingBody.fullReport).toBeUndefined();

    mockGetPaidOrder.mockResolvedValueOnce({
      id: 'order_love_123',
      kind: 'love-reading',
      requestId: createdBody.id,
      requestRef,
      status: 'paid',
      amountCents: 1299,
      currency: 'usd',
      stripeCheckoutSessionId: 'cs_love_123',
    });

    const paid = await GET(
      new NextRequest(`https://tianji.love/api/love-reading/session?id=${createdBody.id}&session_id=cs_love_123`)
    );
    const paidBody = await paid.json();

    expect(paid.status).toBe(200);
    expect(paidBody.unlocked).toBe(true);
    expect(paidBody.fullReport).toContain('Complete Love Reading');
  });
});
