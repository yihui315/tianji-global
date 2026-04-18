import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { aggregateDestinyProfile } from '@/lib/destiny-aggregator';
import { getPlatformContext, mapModuleResultRow } from '@/lib/unified-platform';

const recomputeSchema = z.object({
  profileId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const platform = await getPlatformContext();
    if (!platform) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = recomputeSchema.parse(await request.json());
    const { data: profile } = await platform.supabase
      .from('user_profiles')
      .select('id')
      .eq('id', body.profileId)
      .eq('user_id', platform.user.id)
      .maybeSingle();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: rows } = await platform.supabase
      .from('module_results')
      .select('*')
      .eq('user_id', platform.user.id)
      .eq('profile_id', body.profileId)
      .order('created_at', { ascending: false });

    const results = (rows ?? []).map(mapModuleResultRow);
    if (results.length === 0) {
      return NextResponse.json({ error: 'No module results found' }, { status: 404 });
    }

    const aggregated = aggregateDestinyProfile(body.profileId, results);
    const { data, error } = await platform.supabase
      .from('destiny_profiles')
      .upsert(
        {
          user_id: platform.user.id,
          profile_id: body.profileId,
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
      )
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        destinyProfileId: data.id,
        recomputed: true,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Supabase is not configured.') {
      return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error('[api/destiny/recompute] POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
