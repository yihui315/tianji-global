import { describe, expect, it, vi } from 'vitest';
import type { PlatformContext } from '@/lib/unified-platform';
import { buildNormalizedPayloadForModule } from '@/lib/unified-normalization';
import { persistLegacyReadingCompat } from '@/lib/unified-write';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
}));

function createUnifiedPersistSupabase() {
  const inserts: Record<string, Record<string, unknown>[]> = {
    user_profiles: [],
    reading_sessions_unified: [],
    module_results: [],
    destiny_profiles: [],
  };

  return {
    inserts,
    client: {
      from(table: string) {
        return {
          select() {
            if (table === 'module_results') {
              return {
                eq() {
                  return {
                    eq() {
                      return {
                        order: async () => ({
                          data: inserts.module_results.map((row) => ({
                            ...row,
                            id: 'module-result-1',
                            created_at: '2026-04-23T00:00:00.000Z',
                            updated_at: '2026-04-23T00:00:00.000Z',
                          })),
                        }),
                      };
                    },
                  };
                },
              };
            }

            return {
              eq() {
                return {
                  eq() {
                    return {
                      async maybeSingle() {
                        return { data: null };
                      },
                    };
                  },
                  order() {
                    return {
                      limit() {
                        return {
                          async maybeSingle() {
                            return { data: null };
                          },
                        };
                      },
                    };
                  },
                };
              },
            };
          },
          insert(value: Record<string, unknown>) {
            inserts[table] = [...(inserts[table] ?? []), value];
            return {
              select() {
                return {
                  async single() {
                    if (table === 'user_profiles') {
                      return { data: { id: 'profile-1' } };
                    }

                    if (table === 'reading_sessions_unified') {
                      return { data: { id: 'session-1' } };
                    }

                    if (table === 'module_results') {
                      return {
                        data: {
                          id: 'module-result-1',
                          session_id: value.session_id,
                          user_id: value.user_id,
                          profile_id: value.profile_id,
                          module_type: value.module_type,
                          version: value.version,
                          title: value.title,
                          summary: value.summary,
                          raw_payload: value.raw_payload,
                          normalized_payload: value.normalized_payload,
                          confidence_score: value.confidence_score,
                          is_premium: value.is_premium,
                          created_at: '2026-04-23T00:00:00.000Z',
                          updated_at: '2026-04-23T00:00:00.000Z',
                        },
                      };
                    }

                    return { data: { id: `${table}-1` } };
                  },
                };
              },
            };
          },
          upsert(value: Record<string, unknown>) {
            inserts[table] = [...(inserts[table] ?? []), value];
            return Promise.resolve({ data: value });
          },
        };
      },
    },
  };
}

describe('buildNormalizedPayloadForModule', () => {
  it('uses core normalizers before falling back to the empty default payload', () => {
    const payload = buildNormalizedPayloadForModule(
      'bazi',
      {
        chart: {
          dayMasterElement: 'Metal',
          day: { heavenlyStem: 'Geng', earthlyBranch: 'Chen', element: 'Metal' },
        },
        aiInterpretation: 'You thrive when structure and judgment work together.',
      },
      {
        title: 'BaZi Reading',
        summary: 'Strategic metal-water structure',
      }
    );

    expect(payload.summary.headline).toBe('BaZi Reading');
    expect(payload.identity?.headline).toContain('Metal');
    expect(payload.wealth?.summary).toContain('pace');
  });
});

describe('persistLegacyReadingCompat', () => {
  it('creates a default primary profile and unified module result when legacy core saves have no profile yet', async () => {
    const supabase = createUnifiedPersistSupabase();
    const context = {
      sessionUserId: 'auth-user-1',
      sessionUserEmail: 'reader@example.com',
      user: {
        id: 'platform-user-1',
        email: 'reader@example.com',
      },
      supabase: supabase.client,
    } as unknown as PlatformContext;

    const result = await persistLegacyReadingCompat({
      context,
      readingType: 'bazi',
      title: 'BaZi Reading',
      summary: 'A structured metal-water profile.',
      readingData: {
        birthDate: '1992-04-12',
        birthTime: '08:30',
        birthLocation: 'Singapore',
        chart: {
          dayMasterElement: 'Metal',
        },
      },
    });

    expect(result?.profileId).toBe('profile-1');
    expect(supabase.inserts.user_profiles[0]).toMatchObject({
      user_id: 'platform-user-1',
      profile_type: 'self',
      birth_date: '1992-04-12',
      birth_time: '08:30',
      birth_location: 'Singapore',
      is_primary: true,
    });
    expect(supabase.inserts.reading_sessions_unified[0]).toMatchObject({
      user_id: 'platform-user-1',
      profile_id: 'profile-1',
      module_type: 'bazi',
      status: 'completed',
    });
    expect(supabase.inserts.module_results[0]).toMatchObject({
      user_id: 'platform-user-1',
      profile_id: 'profile-1',
      module_type: 'bazi',
      title: 'BaZi Reading',
    });
    expect(supabase.inserts.destiny_profiles[0]).toMatchObject({
      user_id: 'platform-user-1',
      profile_id: 'profile-1',
      source_modules: ['bazi'],
    });
  });
});
