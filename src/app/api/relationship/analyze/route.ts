// POST /api/relationship/analyze
import { NextRequest, NextResponse } from 'next/server';
import { analyzeRelationship } from '@/lib/relationship-engine';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import type { AnalyzeRelationshipRequest, ApiResponse } from '@/types/relationship';
import type { RelationshipReading } from '@/types/relationship';

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeRelationshipRequest = await req.json();
    const { relationType, personA, personB, premium = false } = body;

    if (!relationType || !personA?.nickname || !personB?.nickname || !personA?.birthDate || !personB?.birthDate) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Missing required fields: relationType, personA.nickname, personB.nickname, personA.birthDate, personB.birthDate',
      }, { status: 400 });
    }

    const personABirthDate = personA.birthDate;
    const personBBirthDate = personB.birthDate;
    const lang = personABirthDate < '2000-01-01' ? 'zh' : 'zh'; // Always zh for now
    const lang = body.lang ?? 'zh';

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

    // Try to persist to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase
          .from('relationship_readings')
          .insert({
            relation_type: relationType,
            score_overall: dbData.scoreOverall,
            score_attraction: dbData.scoreAttraction,
            score_communication: dbData.scoreCommunication,
            score_conflict: dbData.scoreConflict,
            score_rhythm: dbData.scoreRhythm,
            score_long_term: dbData.scoreLongTerm,
            summary: dbData.summary as any,
            dimensions: dbData.dimensions as any,
            timeline: dbData.timeline as any,
            is_premium: premium,
          })
          .select('id')
          .single();

        if (!error && data) {
          reading.id = data.id;
        }
      } catch (dbErr) {
        console.warn('[relationship] Supabase write failed, continuing with in-memory result:', dbErr);
      }
    }

    return NextResponse.json<ApiResponse<RelationshipReading>>({
      success: true,
      data: reading,
    });
  } catch (err) {
    console.error('[relationship/analyze]', err);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Analysis failed. Please check input data.',
    }, { status: 500 });
  }
}
