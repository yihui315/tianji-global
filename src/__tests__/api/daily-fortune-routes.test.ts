import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetPlatformContext = vi.fn();
const mockGetOrCreateDailyFortuneReport = vi.fn();
const mockGetDailyFortuneHistoryForUser = vi.fn();
const mockGetOwnedDailyFortuneReport = vi.fn();
const mockRecordFortuneFeedback = vi.fn();

vi.mock('@/lib/unified-platform', () => ({
  getPlatformContext: mockGetPlatformContext,
}));

vi.mock('@/lib/daily-fortune/service', () => ({
  getDailyFortuneHistoryForUser: mockGetDailyFortuneHistoryForUser,
  getOrCreateDailyFortuneReport: mockGetOrCreateDailyFortuneReport,
  getOwnedDailyFortuneReport: mockGetOwnedDailyFortuneReport,
  isDailyFortuneEnabled: () => true,
  normalizeDailyFortuneSystemType: (value: unknown) => (value === 'tarot' ? 'tarot' : 'bazi'),
}));

vi.mock('@/lib/daily-fortune/repository', () => ({
  recordFortuneFeedback: mockRecordFortuneFeedback,
}));

describe('daily fortune API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('caps history limit at 90 for the current user', async () => {
    mockGetPlatformContext.mockResolvedValue({
      user: { id: 'user-1' },
      supabase: {},
    });
    mockGetDailyFortuneHistoryForUser.mockResolvedValue({ success: true, data: [] });
    const { GET } = await import('@/app/api/daily-fortune/history/route');

    const response = await GET(new NextRequest('http://localhost/api/daily-fortune/history?limit=120'));

    expect(response.status).toBe(200);
    expect(mockGetDailyFortuneHistoryForUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', limit: 90 })
    );
  });

  it('generate route reuses the canonical service and supports force regeneration', async () => {
    mockGetPlatformContext.mockResolvedValue({
      user: { id: 'user-1' },
      supabase: {},
    });
    mockGetOrCreateDailyFortuneReport.mockResolvedValue({
      success: true,
      data: { id: 'report-1', disclaimer: '仅供娱乐与自我观察。' },
    });
    const { POST } = await import('@/app/api/daily-fortune/generate/route');

    const response = await POST(
      new NextRequest('http://localhost/api/daily-fortune/generate', {
        method: 'POST',
        body: JSON.stringify({ date: '2026-05-10', systemType: 'bazi', forceRegenerate: true }),
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.id).toBe('report-1');
    expect(mockGetOrCreateDailyFortuneReport).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-1', forceRegenerate: true })
    );
  });

  it('rejects overlong remedy feedback comments before writing', async () => {
    mockGetPlatformContext.mockResolvedValue({
      user: { id: 'user-1' },
      supabase: {},
    });
    const { POST } = await import('@/app/api/remedies/feedback/route');

    const response = await POST(
      new NextRequest('http://localhost/api/remedies/feedback', {
        method: 'POST',
        body: JSON.stringify({ reportId: 'report-1', comment: 'x'.repeat(501) }),
      })
    );

    expect(response.status).toBe(400);
    expect(mockRecordFortuneFeedback).not.toHaveBeenCalled();
  });

  it('returns 403 when feedback targets another user report', async () => {
    mockGetPlatformContext.mockResolvedValue({
      user: { id: 'user-1' },
      supabase: {},
    });
    mockGetOwnedDailyFortuneReport.mockResolvedValue({
      success: false,
      error: { code: 'forbidden', message: 'You cannot access this report.' },
    });
    const { POST } = await import('@/app/api/remedies/feedback/route');

    const response = await POST(
      new NextRequest('http://localhost/api/remedies/feedback', {
        method: 'POST',
        body: JSON.stringify({ reportId: 'report-1', helpful: true }),
      })
    );

    expect(response.status).toBe(403);
  });
});
