/**
 * Synastry API — TianJi Global 天机全球
 * Unified endpoint for BaZi and Ziwei synastry reports.
 *
 * POST /api/synastry
 * Body: {
 *   systemType: 'bazi' | 'ziwei' | 'qizheng' | 'western'
 *   person1: BaZiSynastryInput | ZiweiSynastryInput
 *   person2: BaZiSynastryInput | ZiweiSynastryInput
 *   language?: 'zh' | 'en'
 *   depth?: 'basic' | 'premium'
 *   enhanceWithAI?: boolean
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi } from '@/lib/bazi';
import { generateBySolar } from '@/lib/ziwei-engine';
import { computeBaZiSynastry } from '@/lib/bazi-synastry-engine';
import { computeZiweiSynastry, extractZiweiSynastryInput } from '@/lib/ziwei-synastry-engine';
import { validateSynastryReport } from '@/lib/synastry-coherence';
import { composeSynastryNarrative } from '@/lib/narrative-composer/synastry-templates';

// ─── Request types ─────────────────────────────────────────────────────────────

interface BaZiPersonInput {
  birthDate: string;
  birthTime: number; //时辰 index 0-12
  gender?: string;
}

interface ZiweiPersonInput {
  birthday: string; // YYYY-MM-DD solar
  birthTime: number; // 时辰 index 0-12
  gender?: 'male' | 'female';
}

interface SynastryRequest {
  systemType: 'bazi' | 'ziwei' | 'qizheng' | 'western';
  person1: BaZiPersonInput | ZiweiPersonInput;
  person2: BaZiPersonInput | ZiweiPersonInput;
  language?: 'zh' | 'en';
  depth?: 'basic' | 'premium';
  enhanceWithAI?: boolean;
}

// ─── Helper: compute BaZi pillars ─────────────────────────────────────────────

function computeBaZiPillars(person: BaZiPersonInput) {
  const [y, m, d] = person.birthDate.split('-').map(Number);
  const hour = person.birthTime * 2 + 23; // 时辰转小时
  const chart = calculateBaZi(y, m, d, hour);
  return {
    year: { heavenlyStem: chart.year, earthlyBranch: chart.month, element: 'unknown' },
    month: { heavenlyStem: chart.year, earthlyBranch: chart.month, element: 'unknown' },
    day: { heavenlyStem: chart.day, earthlyBranch: chart.day, element: 'unknown' },
    hour: { heavenlyStem: chart.hour, earthlyBranch: chart.hour, element: 'unknown' },
    dayMasterElement: chart.dayMasterElement ?? '木',
    gender: person.gender,
  };
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: SynastryRequest = await req.json();
    const { systemType, person1, person2, language = 'zh', depth = 'basic', enhanceWithAI = false } = body;

    // ── 1. Compute synastry ─────────────────────────────────────────────────

    let synastryResult: ReturnType<typeof computeBaZiSynastry | typeof computeZiweiSynastry>;
    let narrative: ReturnType<typeof composeSynastryNarrative>;

    if (systemType === 'bazi') {
      const p1 = computeBaZiPillars(person1 as BaZiPersonInput);
      const p2 = computeBaZiPillars(person2 as BaZiPersonInput);
      synastryResult = computeBaZiSynastry(p1, p2);
    } else if (systemType === 'ziwei') {
      const ziweiP1 = person1 as ZiweiPersonInput;
      const ziweiP2 = person2 as ZiweiPersonInput;
      const chart1 = generateBySolar({
        birthday: ziweiP1.birthday,
        birthTime: ziweiP1.birthTime,
        gender: ziweiP1.gender ?? 'male',
        language: language === 'en' ? 'en-US' : 'zh-CN',
      });
      const chart2 = generateBySolar({
        birthday: ziweiP2.birthday,
        birthTime: ziweiP2.birthTime,
        gender: ziweiP2.gender ?? 'male',
        language: language === 'en' ? 'en-US' : 'zh-CN',
      });
      const input1 = extractZiweiSynastryInput(chart1);
      const input2 = extractZiweiSynastryInput(chart2);
      synastryResult = computeZiweiSynastry(input1, input2);
    } else {
      return NextResponse.json(
        { error: `systemType '${systemType}' not yet supported` },
        { status: 400 }
      );
    }

    // ── 2. Cultural coherence check ────────────────────────────────────────

    const coherence = validateSynastryReport(
      person1 as Record<string, unknown>,
      person2 as Record<string, unknown>,
      systemType,
      undefined, // reportContent checked post-narrative
      { language }
    );

    if (!coherence.valid) {
      return NextResponse.json(
        {
          error: 'Synastry coherence check failed',
          violations: coherence.violations,
          warnings: coherence.warnings,
        },
        { status: 422 }
      );
    }

    // ── 3. Compose narrative ───────────────────────────────────────────────

    try {
      narrative = composeSynastryNarrative(
        synastryResult as Parameters<typeof composeSynastryNarrative>[0],
        { system: systemType as 'bazi' | 'ziwei', language, depth }
      );
    } catch (err) {
      // Narrative composition failed — return raw synastry without narrative
      narrative = null;
    }

    // ── 4. Optional AI enhancement ─────────────────────────────────────────

    let aiEnhancedNarrative: string | null = null;
    if (enhanceWithAI && narrative) {
      try {
        aiEnhancedNarrative = await generateAIEnhancement(synastryResult, narrative, systemType, language);
      } catch {
        // AI enhancement failed — continue without it
        aiEnhancedNarrative = null;
      }
    }

    // ── 5. Re-check coherence on AI enhanced narrative ─────────────────────

    if (aiEnhancedNarrative) {
      const recheck = validateSynastryReport(
        person1 as Record<string, unknown>,
        person2 as Record<string, unknown>,
        systemType,
        aiEnhancedNarrative,
        { language }
      );
      if (!recheck.valid) {
        // Use original narrative instead
        aiEnhancedNarrative = null;
      }
    }

    // ── 6. Build response ───────────────────────────────────────────────────

    return NextResponse.json({
      systemType,
      synastry: synastryResult,
      coherence,
      narrative: aiEnhancedNarrative ?? (narrative ?? null),
      language,
      depth,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[synastry API error]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── AI Enhancement (placeholder — uses existing orchestrator) ────────────────

async function generateAIEnhancement(
  synastryResult: unknown,
  narrative: unknown,
  systemType: string,
  language: string
): Promise<string | null> {
  // TODO: Integrate with ai-orchestrator for AI-enhanced synastry narrative
  // For now, return null — basic synastry result is already informative
  return null;
}
