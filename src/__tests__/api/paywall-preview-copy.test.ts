import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/ai-orchestrator', () => ({
  generateReport: vi.fn(async () => {
    throw new Error('AI provider unavailable');
  }),
}));

function postRequest(path: string, body: unknown) {
  return new NextRequest(`https://tianji.love${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('paywall preview fallback copy', () => {
  it('returns a structured TianJi synthesis for ask previews in English', async () => {
    const { POST } = await import('@/app/api/ask/preview/route');
    const response = await POST(postRequest('/api/ask/preview', {
      question: 'Should I launch the website today?',
      language: 'en',
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.preview).toContain('Situation');
    expect(json.preview).not.toMatch(/[�]|å|ç|澶|鈥/);
  });

  it('returns a structured TianJi synthesis for ask previews in Chinese', async () => {
    const { POST } = await import('@/app/api/ask/preview/route');
    const response = await POST(postRequest('/api/ask/preview', {
      question: '今天适合上线官网吗？',
      language: 'zh',
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.preview).toContain('局势判断');
    expect(json.preview).not.toMatch(/[�]|å|ç|澶|鈥/);
  });

  it('returns readable Chinese for draw fallback previews', async () => {
    const { POST } = await import('@/app/api/draw/preview/route');
    const response = await POST(postRequest('/api/draw/preview', {
      question: '今天应该专注什么？',
      language: 'zh',
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.preview).toContain('三张牌');
    expect(json.preview).not.toMatch(/[�]|å|ç|澶|鈥/);
  });
});
