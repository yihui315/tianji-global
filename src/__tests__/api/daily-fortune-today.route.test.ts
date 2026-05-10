import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetPlatformContext = vi.fn();
const mockGetOrCreateDailyFortuneReport = vi.fn();

vi.mock('@/lib/unified-platform', () => ({
  getPlatformContext: mockGetPlatformContext,
}));

vi.mock('@/lib/daily-fortune/service', () => ({
  getOrCreateDailyFortuneReport: mockGetOrCreateDailyFortuneReport,
  isDailyFortuneEnabled: () => true,
  normalizeDailyFortuneLanguage: (value: unknown) => (value === 'en' ? 'en' : 'zh'),
  normalizeDailyFortuneSystemType: (value: unknown) => (value === 'tarot' ? 'tarot' : 'bazi'),
  todayIsoDate: () => '2026-05-10',
}));

describe('GET /api/daily-fortune/today', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when the user is not logged in', async () => {
    mockGetPlatformContext.mockResolvedValue(null);
    const { GET } = await import('@/app/api/daily-fortune/today/route');

    const response = await GET(new NextRequest('http://localhost/api/daily-fortune/today'));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      success: false,
      error: { code: 'unauthorized', message: 'Login is required.' },
    });
  });

  it('returns the canonical report with disclaimer for a logged-in user', async () => {
    mockGetPlatformContext.mockResolvedValue({
      user: { id: 'user-1', timezone: 'Asia/Singapore', language: 'zh', subscription_tier: 'free' },
      supabase: {},
    });
    mockGetOrCreateDailyFortuneReport.mockResolvedValue({
      success: true,
      data: {
        id: 'report-1',
        date: '2026-05-10',
        scores: { overall: 78, love: 82, career: 71, wealth: 66, health: 74 },
        headline: '先稳后进的一天',
        summary: '今天适合先稳定节奏。',
        drivers: [],
        riskTags: [],
        remedies: [],
        disclaimer: '仅供娱乐与自我观察。',
      },
    });
    const { GET } = await import('@/app/api/daily-fortune/today/route');

    const response = await GET(
      new NextRequest('http://localhost/api/daily-fortune/today?systemType=bazi&date=2026-05-10')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.reportId).toBe('report-1');
    expect(body.data.disclaimer).toContain('自我观察');
    expect(mockGetOrCreateDailyFortuneReport).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        date: '2026-05-10',
        systemType: 'bazi',
      })
    );
  });
});
