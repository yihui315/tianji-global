import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetPlatformContext = vi.fn();
const mockPersistUnifiedModuleResult = vi.fn();

vi.mock('@/lib/unified-platform', () => ({
  getPlatformContext: mockGetPlatformContext,
  isModuleType: (value: string) =>
    ['bazi', 'ziwei', 'fortune', 'relationship', 'western', 'numerology', 'tarot', 'yijing', 'fengshui', 'electional', 'transit', 'solar-return'].includes(value),
}));

vi.mock('@/lib/unified-write', () => ({
  persistUnifiedModuleResult: mockPersistUnifiedModuleResult,
}));

function createSessionLookupSupabase() {
  return {
    from(table: string) {
      if (table !== 'reading_sessions_unified') {
        throw new Error(`Unhandled table: ${table}`);
      }

      return {
        select() {
          return {
            eq() {
              return {
                eq() {
                  return {
                    async single() {
                      return {
                        data: {
                          id: 'session-1',
                          profile_id: 'profile-1',
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  };
}

describe('/api/readings/result POST', () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetPlatformContext.mockReset();
    mockPersistUnifiedModuleResult.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to unified persistence with the existing session and legacy-write enabled', async () => {
    mockGetPlatformContext.mockResolvedValue({
      sessionUserId: 'session-user-1',
      sessionUserEmail: 'test@example.com',
      user: { id: 'platform-user-1', email: 'test@example.com' },
      supabase: createSessionLookupSupabase(),
    });
    mockPersistUnifiedModuleResult.mockResolvedValue({
      id: 'module-1',
      sessionId: 'session-1',
      userId: 'platform-user-1',
      profileId: 'profile-1',
      moduleType: 'bazi',
      version: 'v1',
      title: 'BaZi Reading',
      summary: 'Strategic metal-water structure',
      rawPayload: {},
      normalizedPayload: { summary: {} },
      isPremium: false,
      createdAt: '2026-04-18T00:00:00.000Z',
      updatedAt: '2026-04-18T00:00:00.000Z',
    });

    const { POST } = await import('@/app/api/readings/result/route');
    const request = new NextRequest('http://localhost/api/readings/result', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: '7f9d7f85-4bc7-4ff3-a2fb-df019499c7d6',
        moduleType: 'bazi',
        title: 'BaZi Reading',
        summary: 'Strategic metal-water structure',
        rawPayload: {
          interpretation: 'You are strategic and patient.',
        },
        confidenceScore: 82,
        isPremium: false,
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPersistUnifiedModuleResult).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: 'profile-1',
        sessionId: '7f9d7f85-4bc7-4ff3-a2fb-df019499c7d6',
        moduleType: 'bazi',
        title: 'BaZi Reading',
        summary: 'Strategic metal-water structure',
        normalizedPayload: undefined,
        writeLegacyReading: true,
      })
    );
  });
});
