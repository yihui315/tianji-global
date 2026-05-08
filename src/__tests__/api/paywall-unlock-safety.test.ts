import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

function postRequest(path: string) {
  return new NextRequest(`https://tianji.love${path}`, {
    method: 'POST',
    body: JSON.stringify({ id: 'safe-disabled-launch-check-id' }),
    headers: { 'content-type': 'application/json' },
  });
}

function getRequest(path: string) {
  return new NextRequest(`https://tianji.love${path}`);
}

async function withPayPerUseDisabled(check: () => Promise<void>) {
  const previous = process.env.ENABLE_PAY_PER_USE;
  delete process.env.ENABLE_PAY_PER_USE;

  try {
    await check();
  } finally {
    if (previous === undefined) {
      delete process.env.ENABLE_PAY_PER_USE;
    } else {
      process.env.ENABLE_PAY_PER_USE = previous;
    }
  }
}

describe('paywall unlock launch safety gate', () => {
  it('keeps ask unlock checkout and verification unavailable by default', async () => {
    await withPayPerUseDisabled(async () => {
      const { GET, POST } = await import('@/app/api/ask/unlock/route');

      const checkout = await POST(postRequest('/api/ask/unlock'));
      const verify = await GET(getRequest('/api/ask/unlock?session_id=test&id=test'));

      expect(checkout.status).toBe(503);
      expect(verify.status).toBe(503);
      await expect(checkout.json()).resolves.toMatchObject({
        error: expect.stringContaining('temporarily unavailable'),
      });
    });
  });

  it('keeps draw unlock checkout and verification unavailable by default', async () => {
    await withPayPerUseDisabled(async () => {
      const { GET, POST } = await import('@/app/api/draw/unlock/route');

      const checkout = await POST(postRequest('/api/draw/unlock'));
      const verify = await GET(getRequest('/api/draw/unlock?session_id=test&id=test'));

      expect(checkout.status).toBe(503);
      expect(verify.status).toBe(503);
      await expect(checkout.json()).resolves.toMatchObject({
        error: expect.stringContaining('temporarily unavailable'),
      });
    });
  });
});
