import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSupabaseAdmin: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: mocks.getSupabaseAdmin,
  isSupabaseConfigured: mocks.isSupabaseConfigured,
}));

describe('relationship reading Supabase mutation degraded guard', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mocks.getSupabaseAdmin.mockReset();
    mocks.isSupabaseConfigured.mockReset();
    mocks.isSupabaseConfigured.mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('does not call Supabase write helpers when mutations are disabled', async () => {
    vi.stubEnv('SUPABASE_MUTATION_DISABLED', 'true');
    const { createRelationshipProfile, markRelationshipReadingPremium } = await import('@/lib/relationship-reading-store');

    await expect(createRelationshipProfile({
      nickname: 'Private',
      relationType: 'romantic',
    })).resolves.toBeNull();
    await expect(markRelationshipReadingPremium('11111111-1111-4111-8111-111111111111')).resolves.toBe(false);

    expect(mocks.isSupabaseConfigured).not.toHaveBeenCalled();
    expect(mocks.getSupabaseAdmin).not.toHaveBeenCalled();
  });
});
