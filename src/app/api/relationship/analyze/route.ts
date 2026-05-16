// POST /api/relationship/analyze
import { NextRequest, NextResponse } from 'next/server';
import { analyzeRelationship } from '@/lib/relationship-engine';
import { createRelationshipProfile } from '@/lib/relationship-reading-store';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getTianjiModelRoute, rewriteDeterministicPrediction } from '@/lib/tianji-model-gateway';
import type { AnalyzeRelationshipRequest, ApiResponse, RelationshipDimensionScore, RelationshipReading } from '@/types/relationship';

function rewriteText(value: string, state: { applied: boolean }) {
  const rewritten = rewriteDeterministicPrediction(value);
  if (rewritten !== value) {
    state.applied = true;
  }
  return rewritten;
}

function rewriteDimension(
  dimension: RelationshipDimensionScore,
  state: { applied: boolean },
): RelationshipDimensionScore {
  return {
    ...dimension,
    label: rewriteText(dimension.label, state),
    summary: rewriteText(dimension.summary, state),
    strengths: dimension.strengths.map((item) => rewriteText(item, state)),
    risks: dimension.risks.map((item) => rewriteText(item, state)),
    advice: dimension.advice.map((item) => rewriteText(item, state)),
  };
}

function applyRelationshipGatewaySafety(reading: RelationshipReading): RelationshipReading {
  const route = getTianjiModelRoute('relationship-report');
  const state = { applied: false };
  const dimensions: RelationshipReading['dimensions'] = {
    attraction: rewriteDimension(reading.dimensions.attraction, state),
    communication: rewriteDimension(reading.dimensions.communication, state),
    conflict: rewriteDimension(reading.dimensions.conflict, state),
    rhythm: rewriteDimension(reading.dimensions.rhythm, state),
    longTerm: rewriteDimension(reading.dimensions.longTerm, state),
  };

  return {
    ...reading,
    summary: {
      headline: rewriteText(reading.summary.headline, state),
      oneLiner: rewriteText(reading.summary.oneLiner, state),
      keywords: reading.summary.keywords.map((item) => rewriteText(item, state)),
    },
    timeline: reading.timeline
      ? {
          currentPhase: rewriteText(reading.timeline.currentPhase, state),
          next30Days: rewriteText(reading.timeline.next30Days, state),
          next90Days: reading.timeline.next90Days
            ? rewriteText(reading.timeline.next90Days, state)
            : undefined,
        }
      : undefined,
    dimensions,
    aiMeta: {
      gatewayIntent: 'relationship-report',
      provider: route.provider,
      model: route.preferredModel,
      publicUserFacing: route.publicUserFacing,
      safetyRewriteApplied: state.applied,
      fallback: false,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRelationshipRequest = await req.json();
    const { relationType, personA, personB, premium = false, lang: requestedLang = 'zh' } = body;

    if (!relationType || !personA?.nickname || !personB?.nickname || !personA?.birthDate || !personB?.birthDate) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Missing required fields: relationType, personA.nickname, personB.nickname, personA.birthDate, personB.birthDate',
      }, { status: 400 });
    }

    const personABirthDate = personA.birthDate;
    const personBBirthDate = personB.birthDate;
    const lang = requestedLang === 'en' ? 'en' : 'zh';

    // Run compatibility analysis
    const { reading, dbData } = analyzeRelationship(
      personABirthDate,
      personBBirthDate,
      relationType,
      personA.nickname,
      personB.nickname,
      personA.birthTime,
      personB.birthTime,
      lang,
    );
    const gatewayReading = applyRelationshipGatewaySafety(reading);
    const gatewayDbData = {
      ...dbData,
      summary: gatewayReading.summary,
      dimensions: gatewayReading.dimensions,
      timeline: gatewayReading.timeline ?? dbData.timeline,
    };

    // Try to persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        const [profileAId, profileBId] = await Promise.all([
          createRelationshipProfile({ nickname: personA.nickname, relationType }),
          createRelationshipProfile({ nickname: personB.nickname, relationType }),
        ]);
        const { data, error } = await supabase
          .from('relationship_readings')
          .insert({
            profile_a_id: profileAId,
            profile_b_id: profileBId,
            relation_type: relationType,
            score_overall: gatewayDbData.scoreOverall,
            score_attraction: gatewayDbData.scoreAttraction,
            score_communication: gatewayDbData.scoreCommunication,
            score_conflict: gatewayDbData.scoreConflict,
            score_rhythm: gatewayDbData.scoreRhythm,
            score_long_term: gatewayDbData.scoreLongTerm,
            summary: gatewayDbData.summary as any,
            dimensions: gatewayDbData.dimensions as any,
            timeline: gatewayDbData.timeline as any,
            is_premium: premium,
          })
          .select('id')
          .single();

        if (!error && data) {
          gatewayReading.id = data.id;
        }
      } catch (dbErr) {
        console.warn('[relationship] Supabase write failed, continuing with in-memory result:', dbErr);
      }
    }

    return NextResponse.json<ApiResponse<RelationshipReading>>({
      success: true,
      data: gatewayReading,
    });
  } catch (err) {
    console.error('[relationship/analyze]', err);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Analysis failed. Please check input data.',
    }, { status: 500 });
  }
}
