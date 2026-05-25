import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { encodeAskQuestionId } from '@/lib/ask-question';
import { generateReport } from '@/lib/ai-orchestrator';

const mocks = vi.hoisted(() => ({
  createSession: vi.fn(),
  retrieveSession: vi.fn(),
  generateReport: vi.fn(),
}));

vi.mock('@/lib/stripe', () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: mocks.createSession,
        retrieve: mocks.retrieveSession,
      },
    },
  }),
}));

vi.mock('@/lib/ai-orchestrator', () => ({
  generateReport: mocks.generateReport,
}));

function postRequest(path: string, body: unknown) {
  return new NextRequest(`https://tianji.love${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

function getRequest(path: string) {
  return new NextRequest(`https://tianji.love${path}`, {
    method: 'GET',
  });
}

describe('Ask paid gateway contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mocks.createSession.mockReset();
    mocks.retrieveSession.mockReset();
    mocks.generateReport.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps unpaid Ask locked without returning full answers or provider metadata', async () => {
    const { POST } = await import('@/app/api/ask/preview/route');

    const response = await POST(postRequest('/api/ask/preview', {
      question: 'Should I text them again tonight?',
      language: 'en',
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.locked).toBe(true);
    expect(json.answer).toBeNull();
    expect(json.fullAnswer).toBeUndefined();
    expect(json.preview).toEqual(expect.any(String));
    expect(json.evidence).toMatchObject({
      confidence: expect.stringMatching(/low|medium|high/),
      signals: expect.any(Array),
    });
    expect(json.evidence.signals.length).toBeLessThanOrEqual(3);
    expect(JSON.stringify(json.evidence)).not.toContain('Should I text them again tonight?');
    expect(json.preview).not.toContain('complete reading');
    expect(json.aiMeta).toBeUndefined();
    expect(json.meta?.provider).toBeUndefined();
    expect(json.meta?.model).toBeUndefined();
    expect(generateReport).not.toHaveBeenCalled();
  });

  it('returns a locked Love-Test paid-intent preview without Stripe, provider, or full-answer leakage', async () => {
    const { POST } = await import('@/app/api/ask/preview/route');

    const response = await POST(postRequest('/api/ask/preview', {
      question: 'What are they thinking now?',
      language: 'en',
      source: 'love_test',
      intent: 'what_are_they_thinking',
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.locked).toBe(true);
    expect(json.answer).toBeNull();
    expect(json.fullAnswer).toBeUndefined();
    expect(json.preview).toEqual(expect.any(String));
    expect(json.evidence).toMatchObject({
      confidence: expect.stringMatching(/low|medium|high/),
      signals: expect.any(Array),
    });
    expect(json.id).toEqual(expect.any(String));
    expect(json.url).toBeUndefined();
    expect(JSON.stringify(json)).not.toMatch(/stripe\.com|checkout\.stripe|birthDate|birthTime|birthLocation|timezone/i);
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.generateReport).not.toHaveBeenCalled();
  });

  it('rejects unknown Love-Test paid intent values without reaching checkout or provider code', async () => {
    const { POST } = await import('@/app/api/ask/preview/route');

    const response = await POST(postRequest('/api/ask/preview', {
      question: 'Should I act now?',
      language: 'en',
      source: 'love_test',
      intent: 'start_checkout_now',
    }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toEqual(expect.any(String));
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.generateReport).not.toHaveBeenCalled();
  });

  it('blocks Love-Test paid-intent unlock before Stripe when checkout readiness is missing', async () => {
    const id = encodeAskQuestionId({
      question: 'What are they thinking now?',
      fullAnswer: '',
      language: 'en',
    });

    const { POST } = await import('@/app/api/ask/unlock/route');
    const response = await POST(postRequest('/api/ask/unlock', {
      id,
      language: 'en',
      source: 'love_test',
      intent: 'what_are_they_thinking',
    }));
    const json = await response.json();

    expect(response.status).toBe(423);
    expect(json).toMatchObject({
      error: 'Checkout readiness required',
      code: 'love_test_checkout_readiness_required',
      checkoutReadiness: 'blocked',
    });
    expect(json.url).toBeUndefined();
    expect(JSON.stringify(json)).not.toMatch(/stripe\.com|checkout\.stripe|birthDate|birthTime|birthLocation|timezone|What are they thinking/i);
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.generateReport).not.toHaveBeenCalled();
  });

  it('requires explicit paid-smoke approval even after Love-Test test-mode readiness is marked ready', async () => {
    vi.stubEnv('LOVE_TEST_PAID_INTENT_TEST_MODE_READY', 'true');

    const id = encodeAskQuestionId({
      question: 'When should I act?',
      fullAnswer: '',
      language: 'en',
    });

    const { POST } = await import('@/app/api/ask/unlock/route');
    const response = await POST(postRequest('/api/ask/unlock', {
      id,
      language: 'en',
      source: 'love_test',
      intent: 'timing',
    }));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toMatchObject({
      error: 'Test-mode checkout ready - awaiting approval',
      code: 'love_test_paid_smoke_approval_required',
      checkoutReadiness: 'approval_required',
    });
    expect(json.url).toBeUndefined();
    expect(JSON.stringify(json)).not.toMatch(/stripe\.com|checkout\.stripe|When should I act/i);
    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.generateReport).not.toHaveBeenCalled();
  });

  it('generates paid Ask answers through the TianJi gateway with safe aiMeta', async () => {
    const id = encodeAskQuestionId({
      question: 'Will they come back if I pay now?',
      fullAnswer: '',
      language: 'en',
    });

    mocks.retrieveSession.mockResolvedValue({
      payment_status: 'paid',
      status: 'complete',
      metadata: { flow: 'ask-question' },
    });
    mocks.generateReport.mockResolvedValue({
      content:
        'The cards guarantee 100% will come back. You will definitely marry, and you are destined to break up if you do not pay now or disaster will happen.',
      provider: 'deepseek',
      model: 'deepseek/deepseek-v4-flash',
      latencyMs: 37,
      tokensUsed: { input: 20, output: 30 },
    });

    const { GET } = await import('@/app/api/ask/unlock/route');
    const response = await GET(getRequest(`/api/ask/unlock?session_id=cs_test_paid&id=${encodeURIComponent(id)}`));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.unlocked).toBe(true);
    expect(json.data.locked).toBe(false);
    expect(json.data.answer).toEqual(expect.any(String));
    expect(json.data.fullAnswer).toBe(json.data.answer);
    expect(json.data.evidence).toMatchObject({
      confidence: expect.stringMatching(/low|medium|high/),
      signals: expect.any(Array),
    });
    expect(json.data.evidence.signals.length).toBeGreaterThanOrEqual(5);
    expect(json.data.evidence.signals.length).toBeLessThanOrEqual(8);
    expect(JSON.stringify(json.data.evidence)).not.toContain('Will they come back');
    expect(json.data.answer).not.toMatch(/100% will come back|definitely marry|destined to break up|pay now or disaster will happen|cards guarantee/i);
    expect(json.data.answer).toContain('self-reflection');
    expect(mocks.generateReport).toHaveBeenCalledWith(expect.objectContaining({
      preferredProvider: 'deepseek',
      preferredModel: 'deepseek/deepseek-v4-flash',
      taskType: 'analysis',
    }));
    expect(json.data.aiMeta).toMatchObject({
      provider: 'deepseek',
      model: 'deepseek/deepseek-v4-flash',
      fallbackUsed: false,
      safetyRewritten: true,
      latencyMs: 37,
      route: 'paid_ask',
    });

    const aiMetaJson = JSON.stringify(json.data.aiMeta);
    expect(aiMetaJson).not.toContain('Will they come back');
    expect(aiMetaJson).not.toContain('cards guarantee');
    expect(aiMetaJson).not.toMatch(/API_KEY|birthDate|birthTime|birthLocation|timezone|prompt/i);
  });

  it('returns a safe locked 503 when Stripe env is missing in staging degraded mode', async () => {
    vi.stubEnv('STAGING_DEGRADED_MODE', 'true');
    vi.stubEnv('STRIPE_LIVE_DISABLED', 'true');
    vi.stubEnv('STRIPE_SECRET_KEY', undefined);

    const id = encodeAskQuestionId({
      question: 'Should I text them again tonight?',
      fullAnswer: '',
      language: 'en',
    });

    const { POST, GET } = await import('@/app/api/ask/unlock/route');
    const postResponse = await POST(postRequest('/api/ask/unlock', { id, language: 'en' }));
    const getResponse = await GET(getRequest(`/api/ask/unlock?session_id=cs_test_paid&id=${encodeURIComponent(id)}`));

    for (const response of [postResponse, getResponse]) {
      const json = await response.json();
      expect(response.status).toBe(503);
      expect(json).toMatchObject({
        success: false,
        locked: true,
        code: 'payment_unavailable',
      });
      expect(JSON.stringify(json)).not.toMatch(/sk_|rk_|whsec_|birthDate|birthTime|birthLocation|timezone|prompt|Should I text/i);
    }

    expect(mocks.createSession).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.generateReport).not.toHaveBeenCalled();
  });
});
