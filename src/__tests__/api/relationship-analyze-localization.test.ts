import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabaseAdmin: () => {
    throw new Error('Supabase should not be used in localization tests');
  },
}));

function postRelationship(body: unknown) {
  return new NextRequest('https://tianji.love/api/relationship/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function coreResultText(data: any) {
  const dimensions = data.dimensions ?? {};
  return [
    data.summary?.headline,
    data.summary?.oneLiner,
    ...(data.summary?.keywords ?? []),
    data.timeline?.currentPhase,
    data.timeline?.next30Days,
    ...Object.values(dimensions).flatMap((dimension: any) => [
      dimension.label,
      dimension.summary,
      ...(dimension.strengths ?? []),
      ...(dimension.risks ?? []),
      ...(dimension.advice ?? []),
    ]),
  ].filter(Boolean).join('\n');
}

describe('/api/relationship/analyze localization', () => {
  it('tags free relationship analysis with TianJi Love gateway metadata', async () => {
    const { POST } = await import('@/app/api/relationship/analyze/route');

    const response = await POST(postRelationship({
      relationType: 'romantic',
      lang: 'en',
      personA: { nickname: 'Alex', birthDate: '1992-05-11', birthTime: '08:30' },
      personB: { nickname: 'Jordan', birthDate: '1994-09-21', birthTime: '21:15' },
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.aiMeta).toMatchObject({
      gatewayIntent: 'relationship-report',
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      publicUserFacing: true,
      safetyRewriteApplied: false,
      fallback: false,
    });
    expect(JSON.stringify(json.data.aiMeta)).not.toContain('Alex');
    expect(JSON.stringify(json.data.aiMeta)).not.toContain('Jordan');
  });

  it('returns English core result content when lang=en', async () => {
    const { POST } = await import('@/app/api/relationship/analyze/route');

    const response = await POST(postRelationship({
      relationType: 'romantic',
      lang: 'en',
      personA: { nickname: 'Alex', birthDate: '1992-05-11', birthTime: '08:30' },
      personB: { nickname: 'Jordan', birthDate: '1994-09-21', birthTime: '21:15' },
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    const text = coreResultText(json.data);
    expect(text).toContain('attraction');
    expect(text).toContain('Next move');
    expect(text).not.toMatch(/[\u4e00-\u9fff]/);
  });

  it('keeps Chinese core result content when lang=zh', async () => {
    const { POST } = await import('@/app/api/relationship/analyze/route');

    const response = await POST(postRelationship({
      relationType: 'romantic',
      lang: 'zh',
      personA: { nickname: 'Alex', birthDate: '1992-05-11', birthTime: '08:30' },
      personB: { nickname: 'Jordan', birthDate: '1994-09-21', birthTime: '21:15' },
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(coreResultText(json.data)).toMatch(/[\u4e00-\u9fff]/);
  });
});
