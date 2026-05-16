import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { generateReport } from '@/lib/ai-orchestrator';

vi.mock('@/lib/ai-orchestrator', () => ({
  generateReport: vi.fn(() => new Promise(() => {})),
}));

function postRequest(path: string, body: unknown) {
  return new NextRequest(`https://tianji.love${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

async function expectRouteToSettle<T>(promise: Promise<T>, timeoutMs = 250) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Route did not settle within ${timeoutMs}ms`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

describe('paywall preview timeout fallback', () => {
  beforeEach(() => {
    vi.stubEnv('AI_PREVIEW_TIMEOUT_MS', '5');
    vi.mocked(generateReport).mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns a locked ask preview without starting paid AI generation', async () => {
    const { POST } = await import('@/app/api/ask/preview/route');

    const response = await expectRouteToSettle(POST(postRequest('/api/ask/preview', {
      question: 'Should I launch TianJi today?',
      language: 'en',
    })));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.locked).toBe(true);
    expect(json.answer).toBeNull();
    expect(json.preview).toContain('Situation');
    expect(json.id).toEqual(expect.any(String));
    expect(json.meta).toMatchObject({
      fallbackReason: 'local-preview',
    });
    expect(json.meta.provider).toBeUndefined();
    expect(json.meta.model).toBeUndefined();
    expect(generateReport).not.toHaveBeenCalled();
  });

  it('returns a draw fallback when AI preview generation does not settle', async () => {
    const { POST } = await import('@/app/api/draw/preview/route');

    const response = await expectRouteToSettle(POST(postRequest('/api/draw/preview', {
      question: 'What should I focus on today?',
      language: 'en',
    })));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.preview).toContain('three cards');
    expect(json.previewDraw).toHaveLength(3);
    expect(json.id).toEqual(expect.any(String));
    expect(json.meta).toMatchObject({
      provider: 'local-fallback',
      model: 'local-template',
      fallbackReason: 'timeout',
      timeoutMs: 5,
    });
    expect(json.meta.warning).toContain('timed out');
  });
});
