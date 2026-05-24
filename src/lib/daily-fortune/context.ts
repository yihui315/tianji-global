import type { SupabaseClient } from '@supabase/supabase-js';
import type { DailyFortuneContextSignals, FortuneTier } from '@/types/daily-fortune';
import { normalizePlan } from '@/lib/unified-platform';

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function collectRisks(section: unknown): string[] {
  const record = asRecord(section);
  return [
    ...asStringArray(record.risks),
    ...asStringArray(record.riskTags),
    ...asStringArray(record.avoid),
  ].map((risk) => risk.replace(/\s+/g, '_').toLowerCase());
}

async function safeMaybeSingle<T>(
  query: PromiseLike<{ data: T | null; error: { message: string } | null }>
): Promise<T | null> {
  try {
    const { data } = await query;
    return data ?? null;
  } catch {
    return null;
  }
}

export async function loadDailyFortuneContext(params: {
  supabase: SupabaseClient;
  userId: string;
  profileId?: string;
}): Promise<{
  profileId?: string;
  timezone: string;
  language: 'en' | 'zh';
  tier: FortuneTier;
  signals: DailyFortuneContextSignals;
  recentModuleResults: Array<Record<string, unknown>>;
}> {
  const user = await safeMaybeSingle<Record<string, unknown>>(
    params.supabase.from('users').select('id, subscription_tier, timezone, language').eq('id', params.userId).maybeSingle()
  );

  const profileQuery = params.profileId
    ? params.supabase
        .from('user_profiles')
        .select('id, timezone, language, is_primary')
        .eq('id', params.profileId)
        .eq('user_id', params.userId)
        .maybeSingle()
    : params.supabase
        .from('user_profiles')
        .select('id, timezone, language, is_primary')
        .eq('user_id', params.userId)
        .eq('is_primary', true)
        .maybeSingle();
  const profile = await safeMaybeSingle<Record<string, unknown>>(profileQuery);
  const resolvedProfileId = typeof profile?.id === 'string' ? profile.id : params.profileId;

  const destiny = resolvedProfileId
    ? await safeMaybeSingle<Record<string, unknown>>(
        params.supabase
          .from('destiny_profiles')
          .select('relationship_profile, career_profile, wealth_profile, timing_profile, action_profile, risk_profile, source_modules')
          .eq('user_id', params.userId)
          .eq('profile_id', resolvedProfileId)
          .maybeSingle()
      )
    : null;

  const entitlement = await safeMaybeSingle<Record<string, unknown>>(
    params.supabase
      .from('entitlements')
      .select('plan, is_active, expires_at')
      .eq('user_id', params.userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
  );

  let recentModuleResults: Array<Record<string, unknown>> = [];
  if (resolvedProfileId) {
    try {
      const { data } = await params.supabase
        .from('module_results')
        .select('module_type, normalized_payload, confidence_score, created_at')
        .eq('user_id', params.userId)
        .eq('profile_id', resolvedProfileId)
        .order('created_at', { ascending: false })
        .limit(5);
      recentModuleResults = (data ?? []) as Array<Record<string, unknown>>;
    } catch {
      recentModuleResults = [];
    }
  }

  const timingProfile = asRecord(destiny?.timing_profile);
  const timingRisks = collectRisks(timingProfile);
  const actionRisks = collectRisks(destiny?.action_profile);

  return {
    profileId: resolvedProfileId,
    timezone:
      (typeof profile?.timezone === 'string' && profile.timezone) ||
      (typeof user?.timezone === 'string' && user.timezone) ||
      'Asia/Singapore',
    language: profile?.language === 'en' || user?.language === 'en' ? 'en' : 'zh',
    tier: normalizePlan(entitlement?.plan ?? user?.subscription_tier) as FortuneTier,
    signals: {
      relationshipRisk: collectRisks(destiny?.relationship_profile).filter((risk) =>
        ['communication_tension', 'emotional_reactivity'].includes(risk)
      ),
      careerRisk: [...collectRisks(destiny?.career_profile), ...actionRisks].filter((risk) =>
        ['overload', 'focus_fragmentation'].includes(risk)
      ),
      wealthRisk: collectRisks(destiny?.wealth_profile).filter((risk) =>
        ['impulse_spending', 'high_risk_decision'].includes(risk)
      ),
      healthRisk: [...collectRisks(destiny?.risk_profile), ...timingRisks].filter((risk) =>
        ['low_energy', 'sleep_pressure'].includes(risk)
      ),
      profileSignals: destiny ? ['profile signal'] : [],
      timingWindow: timingRisks.length > 0 ? 'pressure' : 'neutral',
      monthlyOverlay: 'neutral',
    },
    recentModuleResults,
  };
}
