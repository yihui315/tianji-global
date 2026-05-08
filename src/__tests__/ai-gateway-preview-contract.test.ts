import { beforeEach, describe, expect, it, vi } from 'vitest';

const FULL_ANSWER =
  'FULL SECRET ANSWER: this complete response must stay on the server and must never be encoded into the frontend id.';

vi.mock('@/lib/ai-orchestrator', () => ({
  generateReport: vi.fn(async () => ({
    content: FULL_ANSWER,
    provider: 'openai',
    model: 'openai/gpt-4o-mini',
    latencyMs: 42,
    tokensUsed: { input: 11, output: 22 },
    costUSD: 0.0001,
  })),
}));

function jsonRequest(url: string, body: Record<string, unknown>) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('AI Gateway preview contract', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { clearPreviewRecordsForTests } = await import('@/lib/ai/usage');
    clearPreviewRecordsForTests();
  });

  it('returns only an opaque id, preview, and price for ask previews', async () => {
    const { POST } = await import('@/app/api/ask/preview/route');
    const { getPreviewRecord } = await import('@/lib/ai/usage');
    const { generateReport } = await import('@/lib/ai-orchestrator');

    const response = await POST(
      jsonRequest('http://localhost/api/ask/preview', {
        question: 'Should I move this month?',
        language: 'en',
      }) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(Object.keys(json).sort()).toEqual(['id', 'preview', 'price'].sort());
    expect(json.id).toEqual(expect.any(String));
    expect(json.id.length).toBeLessThanOrEqual(32);
    expect(json.id).not.toContain(FULL_ANSWER);
    expect(Buffer.from(json.id, 'base64url').toString('utf8')).not.toContain(FULL_ANSWER);
    expect(json.preview).not.toContain(FULL_ANSWER);

    const stored = getPreviewRecord(json.id);
    expect(stored?.kind).toBe('ask');
    if (stored?.kind === 'ask') {
      expect(stored.fullAnswer).toContain(FULL_ANSWER);
      expect(stored.usage).toMatchObject({
        provider: 'openai',
        model: 'openai/gpt-4o-mini',
        latencyMs: 42,
        tokensUsed: { input: 11, output: 22 },
      });
    }

    expect(generateReport).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: expect.stringContaining('Do not make deterministic'),
      }),
    );
  });

  it('keeps draw full readings server-side behind an opaque id', async () => {
    const { POST } = await import('@/app/api/draw/preview/route');
    const { getPreviewRecord } = await import('@/lib/ai/usage');

    const response = await POST(
      jsonRequest('http://localhost/api/draw/preview', {
        question: 'What should I notice today?',
        language: 'en',
      }) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.id).toEqual(expect.any(String));
    expect(json.id.length).toBeLessThanOrEqual(32);
    expect(json.id).not.toContain(FULL_ANSWER);
    expect(Buffer.from(json.id, 'base64url').toString('utf8')).not.toContain(FULL_ANSWER);
    expect(json.preview).not.toContain(FULL_ANSWER);
    expect(json.previewDraw).toHaveLength(3);

    const stored = getPreviewRecord(json.id);
    expect(stored?.kind).toBe('draw');
    if (stored?.kind === 'draw') {
      expect(stored.fullReading).toContain(FULL_ANSWER);
      expect(stored.draw).toHaveLength(3);
      expect(stored.usage.tokensUsed).toEqual({ input: 11, output: 22 });
    }
  });
});
