import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { encodeQuickDrawId, type DrawnSlot } from '@/lib/quick-draw';

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

function sampleDraw(): DrawnSlot[] {
  return [
    {
      slot: 'yesterday',
      card: { id: 0, name: 'The Fool', nameChinese: '愚者', arcana: 'major' },
      isReversed: false,
      miniReading: 'An old impulse is still shaping the question.',
    },
    {
      slot: 'today',
      card: { id: 1, name: 'The Magician', nameChinese: '魔术师', arcana: 'major' },
      isReversed: true,
      miniReading: 'The current signal asks for clarity before action.',
    },
    {
      slot: 'tomorrow',
      card: { id: 2, name: 'The High Priestess', nameChinese: '女祭司', arcana: 'major' },
      isReversed: false,
      miniReading: 'The next opening depends on observable behavior.',
    },
  ];
}

describe('Draw gateway revenue contract', () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.createSession.mockReset();
    mocks.retrieveSession.mockReset();
    mocks.generateReport.mockReset();
  });

  it('returns a useful limited free Draw reading through tarot_draw without full paid output', async () => {
    mocks.generateReport.mockResolvedValue({
      content:
        'This card can be read as a possible pattern in the relationship. A practical next step is to wait for one observable signal before sending the message.',
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      latencyMs: 24,
      tokensUsed: { input: 30, output: 40 },
    });

    const { POST } = await import('@/app/api/draw/preview/route');
    const response = await POST(postRequest('/api/draw/preview', {
      question: 'Should I reach out after the silence?',
      language: 'en',
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.locked).toBe(true);
    expect(json.reading).toEqual(expect.stringContaining('possible pattern'));
    expect(json.preview).toEqual(expect.any(String));
    expect(json.cards).toHaveLength(3);
    expect(json.fullReading).toBeUndefined();
    expect(json.reading).not.toContain('seven-day action plan');
    expect(mocks.generateReport).toHaveBeenCalledWith(expect.objectContaining({
      preferredProvider: 'ollama',
      preferredModel: 'ollama/gemma4:31b',
      taskType: 'analysis',
    }));
    expect(json.aiMeta).toMatchObject({
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      fallbackUsed: false,
      safetyRewritten: false,
      route: 'tarot_draw',
    });
    expect(JSON.stringify(json.aiMeta)).not.toContain('Should I reach out');
  });

  it('generates paid/pro Draw readings after payment with safe aiMeta and rewritten certainty risk', async () => {
    const id = encodeQuickDrawId({
      question: 'Will my ex return if I pay now?',
      language: 'en',
      draw: sampleDraw(),
      fullReading: '',
    });

    mocks.retrieveSession.mockResolvedValue({
      payment_status: 'paid',
      status: 'complete',
      metadata: { flow: 'quick-draw' },
    });
    mocks.generateReport.mockResolvedValue({
      content:
        'The cards guarantee this will definitely happen. 100% your ex will return. You are destined to break up unless you pay now or disaster will happen. birthTime birthLocation timezone',
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      latencyMs: 31,
      tokensUsed: { input: 44, output: 55 },
    });

    const { GET } = await import('@/app/api/draw/unlock/route');
    const response = await GET(getRequest(`/api/draw/unlock?session_id=cs_test_paid&id=${encodeURIComponent(id)}`));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.unlocked).toBe(true);
    expect(json.data.locked).toBe(false);
    expect(json.data.reading).toEqual(expect.any(String));
    expect(json.data.fullReading).toBe(json.data.reading);
    expect(json.data.cards).toHaveLength(3);
    expect(json.data.reading).not.toMatch(/cards guarantee|this will definitely happen|100% your ex will return|destined to break up|pay now or disaster will happen/i);
    expect(json.data.reading).not.toMatch(/birthTime|birthLocation|timezone/i);
    expect(json.data.reading).toMatch(/observable signals|reflection, not certainty/i);
    expect(json.data.aiMeta).toMatchObject({
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      fallbackUsed: false,
      safetyRewritten: true,
      latencyMs: 31,
      route: 'tarot_draw',
    });

    const aiMetaJson = JSON.stringify(json.data.aiMeta);
    expect(aiMetaJson).not.toContain('Will my ex return');
    expect(aiMetaJson).not.toMatch(/API_KEY|birthDate|birthTime|birthLocation|timezone|prompt|requestBody/i);
  });

  it('routes enhanced Tarot API interpretations through tarot_draw gateway safety', async () => {
    mocks.generateReport.mockResolvedValue({
      content: 'The cards guarantee this will definitely happen.',
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      latencyMs: 19,
    });

    const { POST } = await import('@/app/api/tarot/route');
    const response = await POST(postRequest('/api/tarot', {
      spreadType: 'three-card',
      question: 'What is the relationship pattern?',
      language: 'en',
      enhanceWithAI: true,
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.aiInterpretation).not.toMatch(/cards guarantee|will definitely/i);
    expect(json.aiInterpretation).toMatch(/reflection, not certainty|observable signals/i);
    expect(json.aiMeta).toMatchObject({
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      fallbackUsed: false,
      safetyRewritten: true,
      route: 'tarot_draw',
    });
  });
});
