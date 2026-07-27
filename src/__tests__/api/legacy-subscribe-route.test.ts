import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  addLegacySubscriber: vi.fn(),
  countLegacySubscribers: vi.fn(),
  isSupabaseMutationDisabled: vi.fn(),
}));

vi.mock('@/lib/legacy-subscriber-store', () => ({
  addLegacySubscriber: mocks.addLegacySubscriber,
  countLegacySubscribers: mocks.countLegacySubscribers,
}));

vi.mock('@/lib/staging-degraded-mode', () => ({
  isSupabaseMutationDisabled: mocks.isSupabaseMutationDisabled,
}));

function postRequest(body: unknown) {
  return new NextRequest('https://tianji.love/api/subscribe', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('legacy subscriber compatibility routes', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mocks.addLegacySubscriber.mockReset();
    mocks.countLegacySubscribers.mockReset();
    mocks.isSupabaseMutationDisabled.mockReset();
    mocks.isSupabaseMutationDisabled.mockReturnValue(false);
  });

  it('normalizes and stores a valid subscription', async () => {
    mocks.addLegacySubscriber.mockResolvedValue({ created: true });

    const { POST } = await import('@/app/api/subscribe/route');
    const response = await POST(postRequest({
      email: ' Reader@Example.com ',
      name: 'Reader',
      source: 'homepage',
    }));

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(mocks.addLegacySubscriber).toHaveBeenCalledWith({
      email: 'reader@example.com',
      name: 'Reader',
      source: 'homepage',
    });
  });

  it('returns the legacy duplicate contract', async () => {
    mocks.addLegacySubscriber.mockResolvedValue({ created: false });

    const { POST } = await import('@/app/api/subscribe/route');
    const response = await POST(postRequest({ email: 'reader@example.com' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      success: true,
      alreadySubscribed: true,
    });
  });

  it('rejects invalid payloads without writing', async () => {
    const { POST } = await import('@/app/api/subscribe/route');
    const response = await POST(postRequest({ email: 'not-an-email' }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'invalid_payload',
    });
    expect(mocks.addLegacySubscriber).not.toHaveBeenCalled();
  });

  it('skips writes in degraded staging mode', async () => {
    mocks.isSupabaseMutationDisabled.mockReturnValue(true);

    const { POST } = await import('@/app/api/subscribe/route');
    const response = await POST(postRequest({ email: 'reader@example.com' }));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      success: false,
      skipped: true,
      reason: 'subscriber_mutation_disabled',
    });
    expect(mocks.addLegacySubscriber).not.toHaveBeenCalled();
  });

  it('returns the current subscriber count without caching', async () => {
    mocks.countLegacySubscribers.mockResolvedValue(3);

    const { GET } = await import('@/app/api/subscribers/count/route');
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({ count: 3 });
  });

  it('does not hide subscriber store failures as a zero count', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.countLegacySubscribers.mockRejectedValue(new Error('corrupt store'));

    const { GET } = await import('@/app/api/subscribers/count/route');
    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'subscriber_store_unavailable',
    });

    consoleError.mockRestore();
  });
});
