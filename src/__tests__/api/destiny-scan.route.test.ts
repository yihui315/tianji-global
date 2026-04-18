import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetPlatformContext = vi.fn();
const mockIsSupabaseConfigured = vi.fn();
const mockGetSupabaseAdmin = vi.fn();

vi.mock('@/lib/unified-platform', () => ({
  getPlatformContext: mockGetPlatformContext,
  mapModuleResultRow: (value: Record<string, unknown>) => ({
    id: value.id ?? '',
    sessionId: value.session_id ?? '',
    userId: value.user_id ?? '',
    profileId: value.profile_id ?? '',
    moduleType: value.module_type ?? 'fortune',
    version: value.version ?? 'v1',
    title: value.title,
    summary: value.summary,
    rawPayload: value.raw_payload ?? {},
    normalizedPayload: value.normalized_payload ?? { summary: {} },
    confidenceScore: value.confidence_score as number | undefined,
    isPremium: Boolean(value.is_premium),
    createdAt: value.created_at ?? '',
    updatedAt: value.updated_at ?? '',
  }),
  toLegacyReadingType: () => 'fortune',
}));

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: mockIsSupabaseConfigured,
  getSupabaseAdmin: mockGetSupabaseAdmin,
}));

function createPersistingSupabase() {
  const captured = {
    insertedProfile: null as Record<string, unknown> | null,
    insertedSession: null as Record<string, unknown> | null,
    insertedModule: null as Record<string, unknown> | null,
    destinyUpsert: null as Record<string, unknown> | null,
  };

  return {
    captured,
    client: {
      from(table: string) {
        if (table === 'user_profiles') {
          return {
            select() {
              return {
                eq() {
                  return {
                    eq() {
                      return {
                        async maybeSingle() {
                          return { data: null, error: null };
                        },
                      };
                    },
                    order() {
                      return {
                        limit() {
                          return {
                            async maybeSingle() {
                              return { data: null, error: null };
                            },
                          };
                        },
                      };
                    },
                  };
                },
              };
            },
            insert(payload: Record<string, unknown>) {
              captured.insertedProfile = payload;
              return {
                select() {
                  return {
                    async single() {
                      return { data: { id: 'profile-1' }, error: null };
                    },
                  };
                },
              };
            },
          };
        }

        if (table === 'reading_sessions_unified') {
          return {
            insert(payload: Record<string, unknown>) {
              captured.insertedSession = payload;
              return {
                select() {
                  return {
                    async single() {
                      return { data: { id: 'session-1' }, error: null };
                    },
                  };
                },
              };
            },
          };
        }

        if (table === 'module_results') {
          return {
            insert(payload: Record<string, unknown>) {
              captured.insertedModule = payload;
              return {
                select() {
                  return {
                    async single() {
                      return {
                        data: {
                          id: 'module-1',
                          session_id: 'session-1',
                          user_id: 'platform-user-1',
                          profile_id: 'profile-1',
                          module_type: payload.module_type,
                          version: payload.version,
                          title: payload.title,
                          summary: payload.summary,
                          raw_payload: payload.raw_payload,
                          normalized_payload: payload.normalized_payload,
                          confidence_score: payload.confidence_score,
                          is_premium: payload.is_premium,
                          created_at: '2026-04-18T00:00:00.000Z',
                          updated_at: '2026-04-18T00:00:00.000Z',
                        },
                        error: null,
                      };
                    },
                  };
                },
              };
            },
            select() {
              return {
                eq() {
                  return {
                    eq() {
                      return {
                        async order() {
                          return {
                            data: [
                              {
                                id: 'module-1',
                                session_id: 'session-1',
                                user_id: 'platform-user-1',
                                profile_id: 'profile-1',
                                module_type: 'fortune',
                                version: 'destiny-scan-v1',
                                title: 'AI Destiny Scan',
                                summary: 'The part that changes everything for you is closer than it looks.',
                                raw_payload: captured.insertedModule?.raw_payload ?? {},
                                normalized_payload: captured.insertedModule?.normalized_payload ?? {},
                                confidence_score: 87,
                                is_premium: false,
                                created_at: '2026-04-18T00:00:00.000Z',
                                updated_at: '2026-04-18T00:00:00.000Z',
                              },
                            ],
                            error: null,
                          };
                        },
                      };
                    },
                  };
                },
                contains() {
                  return {
                    async order() {
                      return {
                        data: [
                          {
                            raw_payload: captured.insertedModule?.raw_payload ?? {},
                          },
                        ],
                        error: null,
                      };
                    },
                  };
                },
              };
            },
          };
        }

        if (table === 'destiny_profiles') {
          return {
            async upsert(payload: Record<string, unknown>) {
              captured.destinyUpsert = payload;
              return { data: null, error: null };
            },
          };
        }

        throw new Error(`Unhandled table: ${table}`);
      },
    },
  };
}

describe('/api/destiny/scan', () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetPlatformContext.mockReset();
    mockIsSupabaseConfigured.mockReset();
    mockGetSupabaseAdmin.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('persists logged-in scans into unified tables and returns the preview', async () => {
    const supabase = createPersistingSupabase();
    mockIsSupabaseConfigured.mockReturnValue(true);
    mockGetSupabaseAdmin.mockReturnValue(supabase.client);
    mockGetPlatformContext.mockResolvedValue({
      sessionUserId: 'session-user-1',
      sessionUserEmail: 'test@example.com',
      user: { id: 'platform-user-1', email: 'test@example.com', subscription_tier: 'free' },
      supabase: supabase.client,
    });

    const { POST } = await import('@/app/api/destiny/scan/route');
    const request = new NextRequest('http://localhost/api/destiny/scan', {
      method: 'POST',
      body: JSON.stringify({
        birthDate: '1994-07-12',
        birthTime: '08:30',
        birthLocation: 'Singapore',
        traffic: {
          source: 'tiktok',
          strategy: 'emotional_intense',
          campaign: 'hook-01',
        },
      }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.preview.meta.trafficSource).toBe('tiktok');
    expect(supabase.captured.insertedProfile).toMatchObject({
      birth_date: '1994-07-12',
      birth_time: '08:30',
      birth_location: 'Singapore',
      is_primary: true,
    });
    expect(supabase.captured.insertedSession).toMatchObject({
      module_type: 'fortune',
      question_context: 'destiny-scan:tiktok',
    });
    expect(supabase.captured.insertedModule?.version).toBe('destiny-scan-v1');
    expect(supabase.captured.insertedModule?.raw_payload).toMatchObject({
      scanId: body.id,
      entrySurface: 'destiny-scan',
    });
    expect(supabase.captured.destinyUpsert?.source_modules).toEqual(['fortune']);
  });

  it('prefers a persisted scan result when the scan id has already been stored', async () => {
    const persisted = {
      id: 'encoded-id',
      meta: {
        trafficSource: 'seo',
        strategy: 'clarity_first',
      },
      summary: {
        headline: 'Persisted headline',
        oneLiner: 'Persisted one-liner',
        compatibilityScore: 88,
      },
      energy: {
        overall: 80,
        points: [
          { label: 'Identity', value: 82 },
          { label: 'Love', value: 79 },
        ],
      },
      timeline: {
        headline: 'Persisted timing window',
        currentWindow: 'Alignment -> Expansion',
        trend: [{ label: 'Now', value: 75, note: 'Alignment' }],
      },
      teaser: {
        relationship: 'Persisted relationship teaser',
        wealth: 'Persisted wealth teaser',
        actions: 'Persisted action teaser',
      },
      share: {
        title: 'Persisted headline',
        oneLiner: 'Persisted one-liner',
        caption: 'Persisted caption',
      },
      relationship: {
        headline: 'Persisted relationship',
        summary: 'Persisted relationship summary',
        bullets: ['a'],
      },
      wealth: {
        headline: 'Persisted wealth',
        summary: 'Persisted wealth summary',
        bullets: ['b'],
      },
      actions: {
        headline: 'Persisted actions',
        summary: 'Persisted actions summary',
        bullets: ['c'],
      },
    };

    mockIsSupabaseConfigured.mockReturnValue(true);
    mockGetSupabaseAdmin.mockReturnValue({
      from(table: string) {
        if (table !== 'module_results') {
          throw new Error(`Unhandled table: ${table}`);
        }

        return {
          select() {
            return {
              contains() {
                return {
                  async order() {
                    return {
                      data: [
                        {
                          raw_payload: {
                            scanId: 'encoded-id',
                            scanResult: persisted,
                          },
                        },
                      ],
                      error: null,
                    };
                  },
                };
              },
            };
          },
        };
      },
    });

    const { GET } = await import('@/app/api/destiny/scan/route');
    const request = new NextRequest('http://localhost/api/destiny/scan?id=encoded-id');
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.summary.headline).toBe('Persisted headline');
    expect(body.meta.trafficSource).toBe('seo');
  });
});
