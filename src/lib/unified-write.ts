import type { SupabaseClient } from '@supabase/supabase-js';
import type { DestinyScanInput, DestinyScanResult } from '@/lib/destiny-scan';
import { buildDestinyScanNormalizedPayload } from '@/lib/destiny-scan';
import { aggregateDestinyProfile } from '@/lib/destiny-aggregator';
import type { ModuleResult, ModuleType, NormalizedPayload } from '@/types/module-result';
import type { PlatformContext } from '@/lib/unified-platform';
import { mapModuleResultRow, toLegacyReadingType } from '@/lib/unified-platform';
import {
  buildNormalizedPayloadForModule,
  CORE_UNIFIED_MODULES,
} from '@/lib/unified-normalization';

interface PersistUnifiedModuleResultInput {
  context: PlatformContext;
  profileId: string;
  moduleType: ModuleType;
  sessionId?: string;
  title?: string;
  summary?: string;
  rawPayload: Record<string, unknown>;
  normalizedPayload?: NormalizedPayload;
  confidenceScore?: number;
  isPremium?: boolean;
  version?: string;
  questionContext?: string | null;
  relationProfileId?: string | null;
  writeLegacyReading?: boolean;
}

export async function recomputeDestinyProfile(userId: string, profileId: string, supabase: SupabaseClient) {
  const { data: rows } = await supabase
    .from('module_results')
    .select('*')
    .eq('user_id', userId)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  const results = (rows ?? []).map(mapModuleResultRow);
  const aggregated = aggregateDestinyProfile(profileId, results);
  if (!aggregated.userId) {
    return;
  }

  await supabase
    .from('destiny_profiles')
    .upsert(
      {
        user_id: userId,
        profile_id: profileId,
        identity_summary: aggregated.identitySummary ?? {},
        energy_profile: aggregated.energyProfile ?? {},
        relationship_profile: aggregated.relationshipProfile ?? {},
        career_profile: aggregated.careerProfile ?? {},
        wealth_profile: aggregated.wealthProfile ?? {},
        timing_profile: aggregated.timingProfile ?? {},
        action_profile: aggregated.actionProfile ?? {},
        risk_profile: aggregated.riskProfile ?? {},
        source_modules: aggregated.sourceModules ?? [],
        confidence_score: aggregated.confidenceScore ?? 0,
        last_recomputed_at: aggregated.lastRecomputedAt ?? new Date().toISOString(),
      },
      { onConflict: 'user_id,profile_id' }
    );
}

export async function getPrimaryProfileId(context: PlatformContext): Promise<string | null> {
  const primary = await context.supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', context.user.id)
    .eq('is_primary', true)
    .maybeSingle();

  if (primary.data?.id) {
    return primary.data.id as string;
  }

  const latest = await context.supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', context.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (latest.data?.id as string | undefined) ?? null;
}

export async function ensurePrimaryProfileFromScan(context: PlatformContext, input: DestinyScanInput): Promise<string> {
  const primaryId = await getPrimaryProfileId(context);
  if (primaryId) {
    return primaryId;
  }

  const { data, error } = await context.supabase
    .from('user_profiles')
    .insert({
      user_id: context.user.id,
      profile_type: 'self',
      birth_date: input.birthDate,
      birth_time: input.birthTime || null,
      birth_location: input.birthLocation,
      timezone: null,
      language: 'en',
      is_primary: true,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    throw error ?? new Error('Unable to create primary profile for destiny scan.');
  }

  return data.id as string;
}

export async function persistUnifiedModuleResult(input: PersistUnifiedModuleResultInput): Promise<ModuleResult> {
  const {
    context,
    profileId,
    moduleType,
    sessionId,
    title,
    summary,
    rawPayload,
    normalizedPayload: providedNormalizedPayload,
    confidenceScore,
    isPremium = false,
    version = 'v1',
    questionContext = null,
    relationProfileId = null,
    writeLegacyReading = false,
  } = input;

  const normalizedPayload = buildNormalizedPayloadForModule(moduleType, rawPayload, {
    title,
    summary,
    normalizedPayload: providedNormalizedPayload,
  });

  const resolvedSessionId = sessionId ?? (
    await (async () => {
      const { data: session, error: sessionError } = await context.supabase
        .from('reading_sessions_unified')
        .insert({
          user_id: context.user.id,
          profile_id: profileId,
          module_type: moduleType,
          question_context: questionContext,
          relation_profile_id: relationProfileId,
          status: 'completed',
        })
        .select('id')
        .single();

      if (sessionError || !session?.id) {
        throw sessionError ?? new Error('Unable to create reading session.');
      }

      return session.id as string;
    })()
  );

  const { data, error } = await context.supabase
    .from('module_results')
    .insert({
      session_id: resolvedSessionId,
      user_id: context.user.id,
      profile_id: profileId,
      module_type: moduleType,
      version,
      title: title ?? null,
      summary: summary ?? null,
      raw_payload: rawPayload,
      normalized_payload: normalizedPayload,
      confidence_score: confidenceScore ?? null,
      is_premium: isPremium,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Unable to create module result.');
  }

  if (writeLegacyReading) {
    const legacyReadingType = toLegacyReadingType(moduleType);
    if (legacyReadingType) {
      await context.supabase.from('readings').insert({
        user_id: context.sessionUserId || context.user.id,
        reading_type: legacyReadingType,
        title: title ?? `${moduleType} reading`,
        summary: summary ?? normalizedPayload.summary.oneLiner ?? '',
        reading_data: {
          sessionId: resolvedSessionId,
          profileId,
          rawPayload,
          normalizedPayload,
          confidenceScore: confidenceScore ?? null,
          isPremium,
        },
      });
    }
  }

  await recomputeDestinyProfile(context.user.id, profileId, context.supabase);
  return mapModuleResultRow(data);
}

export async function persistLegacyReadingCompat(input: {
  context: PlatformContext;
  readingType: string;
  title: string;
  summary?: string;
  readingData?: Record<string, unknown>;
}) {
  if (!CORE_UNIFIED_MODULES.includes(input.readingType as ModuleType)) {
    return null;
  }

  const moduleType = input.readingType as ModuleType;
  const profileId = await getPrimaryProfileId(input.context);
  if (!profileId) {
    return null;
  }

  return persistUnifiedModuleResult({
    context: input.context,
    profileId,
    moduleType,
    title: input.title,
    summary: input.summary,
    rawPayload: input.readingData ?? {},
    writeLegacyReading: false,
  });
}

export async function persistDestinyScanResult(input: {
  context: PlatformContext;
  scanInput: DestinyScanInput;
  scanId: string;
  scanResult: DestinyScanResult;
}) {
  const profileId = await ensurePrimaryProfileFromScan(input.context, input.scanInput);

  return persistUnifiedModuleResult({
    context: input.context,
    profileId,
    moduleType: 'fortune',
    version: 'destiny-scan-v1',
    title: 'AI Destiny Scan',
    summary: input.scanResult.summary.oneLiner,
    rawPayload: {
      scanId: input.scanId,
      scanInput: input.scanInput,
      scanResult: input.scanResult,
      entrySurface: 'destiny-scan',
    },
    normalizedPayload: buildDestinyScanNormalizedPayload(input.scanResult),
    confidenceScore: input.scanResult.summary.compatibilityScore,
    questionContext: `destiny-scan:${input.scanInput.traffic?.source ?? 'unknown'}`,
    writeLegacyReading: false,
  });
}
