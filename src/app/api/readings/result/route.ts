import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { aggregateDestinyProfile } from '@/lib/destiny-aggregator';
import {
  buildDefaultNormalizedPayload,
  getPlatformContext,
  isModuleType,
  mapModuleResultRow,
  toLegacyReadingType,
} from '@/lib/unified-platform';

const normalizedPayloadSchema = z.object({
  summary: z
    .object({
      headline: z.string().optional(),
      oneLiner: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .default({}),
  structure: z.record(z.string(), z.unknown()).optional(),
  chart: z.record(z.string(), z.unknown()).optional(),
  identity: z.record(z.string(), z.unknown()).optional(),
  relationship: z.record(z.string(), z.unknown()).optional(),
  career: z.record(z.string(), z.unknown()).optional(),
  wealth: z.record(z.string(), z.unknown()).optional(),
  timing: z.record(z.string(), z.unknown()).optional(),
  advice: z.record(z.string(), z.unknown()).optional(),
  risk: z.record(z.string(), z.unknown()).optional(),
  timeline: z
    .object({
      currentPhase: z.string().optional(),
      next30Days: z.string().optional(),
      next90Days: z.string().optional(),
      phases: z
        .array(
          z.object({
            range: z.string(),
            label: z.string(),
            description: z.string(),
          })
        )
        .optional(),
    })
    .optional(),
});

const createResultSchema = z.object({
  sessionId: z.string().uuid(),
  moduleType: z.string().refine(isModuleType, 'Invalid moduleType'),
  version: z.string().default('v1'),
  title: z.string().optional(),
  summary: z.string().optional(),
  rawPayload: z.record(z.string(), z.unknown()).default({}),
  normalizedPayload: normalizedPayloadSchema.optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
  isPremium: z.boolean().default(false),
});

async function recomputeDestinyProfile(userId: string, profileId: string, supabase: SupabaseClient) {
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

export async function POST(request: NextRequest) {
  try {
    const context = await getPlatformContext();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = createResultSchema.parse(await request.json());
    const { data: session } = await context.supabase
      .from('reading_sessions_unified')
      .select('id, profile_id')
      .eq('id', body.sessionId)
      .eq('user_id', context.user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const normalizedPayload = body.normalizedPayload ?? buildDefaultNormalizedPayload(body.title, body.summary, body.rawPayload);
    const { data, error } = await context.supabase
      .from('module_results')
      .insert({
        session_id: body.sessionId,
        user_id: context.user.id,
        profile_id: session.profile_id,
        module_type: body.moduleType,
        version: body.version,
        title: body.title ?? null,
        summary: body.summary ?? null,
        raw_payload: body.rawPayload,
        normalized_payload: normalizedPayload,
        confidence_score: body.confidenceScore ?? null,
        is_premium: body.isPremium,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    const legacyReadingType = toLegacyReadingType(body.moduleType);
    if (legacyReadingType) {
      await context.supabase.from('readings').insert({
        user_id: context.sessionUserId || context.user.id,
        reading_type: legacyReadingType,
        title: body.title ?? `${body.moduleType} reading`,
        summary: body.summary ?? normalizedPayload.summary.oneLiner ?? '',
        reading_data: {
          sessionId: body.sessionId,
          profileId: session.profile_id,
          rawPayload: body.rawPayload,
          normalizedPayload,
          confidenceScore: body.confidenceScore ?? null,
          isPremium: body.isPremium,
        },
      });
    }

    await recomputeDestinyProfile(context.user.id, session.profile_id, context.supabase);

    return NextResponse.json({
      success: true,
      data: mapModuleResultRow(data),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supabase is not configured.') {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error('[api/readings/result] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
