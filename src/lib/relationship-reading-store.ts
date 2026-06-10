import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { isUuidReadingId } from '@/lib/reading-id';
import { isSupabaseMutationDisabled } from '@/lib/staging-degraded-mode';
import type { RelationshipReading, RelationshipType } from '@/types/relationship';

export const RELATIONSHIP_LOCKED_SECTIONS = [
  'dimensions',
  'next30Days',
  'conflictRepair',
  'conversationGuide',
  'pdfReport',
  'savedHistory',
] as const;

export function isRelationshipReadingId(value?: string | null) {
  return isUuidReadingId(value);
}

function asNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function asRelationType(value: unknown): RelationshipType {
  return value === 'friendship' || value === 'work' ? value : 'romantic';
}

function firstNickname(value: unknown, fallback: string) {
  if (Array.isArray(value)) return firstNickname(value[0], fallback);
  if (value && typeof value === 'object') {
    const nickname = (value as { nickname?: unknown }).nickname;
    return typeof nickname === 'string' && nickname.trim() ? nickname : fallback;
  }
  return fallback;
}

export function relationshipReadingFromRecord(record: Record<string, unknown>): RelationshipReading {
  const isPremium = Boolean(record.is_premium);

  return {
    id: String(record.id),
    userId: typeof record.user_id === 'string' ? record.user_id : undefined,
    profileAId: typeof record.profile_a_id === 'string' ? record.profile_a_id : undefined,
    profileBId: typeof record.profile_b_id === 'string' ? record.profile_b_id : undefined,
    relationType: asRelationType(record.relation_type),
    personA: { nickname: firstNickname(record.profile_a, 'Person A') },
    personB: { nickname: firstNickname(record.profile_b, 'Person B') },
    overallScore: asNumber(record.score_overall),
    dimensions: record.dimensions as RelationshipReading['dimensions'],
    summary: record.summary as RelationshipReading['summary'],
    timeline: (record.timeline as RelationshipReading['timeline']) ?? undefined,
    isPremium,
    accessLevel: isPremium ? 'full' : 'free',
    lockedSections: isPremium ? [] : [...RELATIONSHIP_LOCKED_SECTIONS],
    createdAt: typeof record.created_at === 'string' ? record.created_at : '',
  };
}

export async function createRelationshipProfile(input: {
  nickname: string;
  relationType: RelationshipType;
  userId?: string | null;
}): Promise<string | null> {
  if (isSupabaseMutationDisabled()) return null;
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await getSupabaseAdmin()
    .from('relationship_profiles')
    .insert({
      user_id: input.userId ?? null,
      nickname: input.nickname,
      relation_type: input.relationType,
      visibility: 'hidden_birth_data',
    })
    .select('id')
    .single();

  if (error || !data?.id) return null;
  return String(data.id);
}

export async function getRelationshipReadingById(id: string): Promise<RelationshipReading | null> {
  if (!isRelationshipReadingId(id) || !isSupabaseConfigured()) return null;

  const { data, error } = await getSupabaseAdmin()
    .from('relationship_readings')
    .select(
      `
        *,
        profile_a:relationship_profiles!relationship_readings_profile_a_id_fkey(nickname),
        profile_b:relationship_profiles!relationship_readings_profile_b_id_fkey(nickname)
      `
    )
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return relationshipReadingFromRecord(data as Record<string, unknown>);
}

export async function markRelationshipReadingPremium(id: string): Promise<boolean> {
  if (isSupabaseMutationDisabled()) return false;
  if (!isRelationshipReadingId(id) || !isSupabaseConfigured()) return false;

  const { error } = await getSupabaseAdmin()
    .from('relationship_readings')
    .update({ is_premium: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}
