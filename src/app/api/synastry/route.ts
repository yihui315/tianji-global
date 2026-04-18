import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi } from '@/lib/bazi';
import { generateBySolar } from '@/lib/ziwei-engine';
import { computeBaZiSynastry, type BaZiSynastryInput } from '@/lib/bazi-synastry-engine';
import { computeZiweiSynastry, extractZiweiSynastryInput } from '@/lib/ziwei-synastry-engine';
import { validateSynastryReport } from '@/lib/synastry-coherence';
import {
  composeSynastryNarrative,
  type SynastryNarrativeReport,
} from '@/lib/narrative-composer/synastry-templates';

interface BaZiPersonInput {
  birthDate: string;
  birthTime: number;
  gender?: string;
}

interface ZiweiPersonInput {
  birthday: string;
  birthTime: number;
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

function computeBaZiPillars(person: BaZiPersonInput): BaZiSynastryInput {
  const [year, month, day] = person.birthDate.split('-').map(Number);
  const hour = person.birthTime * 2 + 23;
  const chart = calculateBaZi({ year, month, day, hour }) as BaZiSynastryInput;

  return {
    ...chart,
    gender: person.gender,
  };
}

function toPlainRecord(person: BaZiPersonInput | ZiweiPersonInput): Record<string, unknown> {
  return person as unknown as Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  try {
    const body: SynastryRequest = await req.json();
    const {
      systemType,
      person1,
      person2,
      language = 'zh',
      depth = 'basic',
      enhanceWithAI = false,
    } = body;

    let synastryResult: ReturnType<typeof computeBaZiSynastry | typeof computeZiweiSynastry>;
    let narrative: SynastryNarrativeReport | null = null;

    if (systemType === 'bazi') {
      synastryResult = computeBaZiSynastry(
        computeBaZiPillars(person1 as BaZiPersonInput),
        computeBaZiPillars(person2 as BaZiPersonInput)
      );
    } else if (systemType === 'ziwei') {
      const ziweiPerson1 = person1 as ZiweiPersonInput;
      const ziweiPerson2 = person2 as ZiweiPersonInput;

      const chart1 = generateBySolar({
        birthday: ziweiPerson1.birthday,
        birthTime: ziweiPerson1.birthTime,
        gender: ziweiPerson1.gender ?? 'male',
        language: language === 'en' ? 'en-US' : 'zh-CN',
      });
      const chart2 = generateBySolar({
        birthday: ziweiPerson2.birthday,
        birthTime: ziweiPerson2.birthTime,
        gender: ziweiPerson2.gender ?? 'male',
        language: language === 'en' ? 'en-US' : 'zh-CN',
      });

      synastryResult = computeZiweiSynastry(
        extractZiweiSynastryInput(chart1),
        extractZiweiSynastryInput(chart2)
      );
    } else {
      return NextResponse.json(
        { error: `systemType '${systemType}' not yet supported` },
        { status: 400 }
      );
    }

    const coherence = validateSynastryReport(
      toPlainRecord(person1),
      toPlainRecord(person2),
      systemType,
      undefined,
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

    try {
      narrative = composeSynastryNarrative(
        synastryResult as Parameters<typeof composeSynastryNarrative>[0],
        { system: systemType as 'bazi' | 'ziwei', language, depth }
      );
    } catch {
      narrative = null;
    }

    let aiEnhancedNarrative: string | null = null;
    if (enhanceWithAI && narrative) {
      try {
        aiEnhancedNarrative = await generateAIEnhancement(synastryResult, narrative, systemType, language);
      } catch {
        aiEnhancedNarrative = null;
      }
    }

    if (aiEnhancedNarrative) {
      const recheck = validateSynastryReport(
        toPlainRecord(person1),
        toPlainRecord(person2),
        systemType,
        aiEnhancedNarrative,
        { language }
      );

      if (!recheck.valid) {
        aiEnhancedNarrative = null;
      }
    }

    return NextResponse.json({
      systemType,
      synastry: synastryResult,
      coherence,
      narrative: aiEnhancedNarrative ?? narrative,
      language,
      depth,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[synastry API error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function generateAIEnhancement(
  _synastryResult: unknown,
  _narrative: SynastryNarrativeReport,
  _systemType: string,
  _language: string
): Promise<string | null> {
  return null;
}
