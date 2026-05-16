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
    mocks.createSession.mockReset();
    mocks.retrieveSession.mockReset();
    mocks.generateReport.mockReset();
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
    expect(json.preview).not.toContain('complete reading');
    expect(json.aiMeta).toBeUndefined();
    expect(json.meta?.provider).toBeUndefined();
    expect(json.meta?.model).toBeUndefined();
    expect(generateReport).not.toHaveBeenCalled();
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
});
