import { NextRequest, NextResponse } from 'next/server';
import { generateBySolar, generateByLunar, type BirthdayType, type Gender, type Language } from '@/lib/ziwei-engine';
import { interpretZiwei } from '@/lib/ai-interpreter';
import type { ZiweiData } from '@/lib/ai-prompts';

/**
 * GET /api/ziwei
 *
 * Query parameters:
 *   birthday     — YYYY-MM-DD date string
 *   birthTime    — 0-12 (时辰 index)
 *   gender       — "male" | "female"
 *   birthdayType — "solar" | "lunar" (default: "solar")
 *   leapMonth    — "true" | "false" (default: "false")
 *   language     — "zh-CN" | "zh-TW" | "en-US" | "ja" | "ko" | "vi" (default: "zh-CN")
 *   enhanceWithAI — "true" to add AI interpretation
 *
 * Returns:
 *   JSON ZiweiChart + optional aiInterpretation
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const birthday = searchParams.get('birthday');
  const birthTimeStr = searchParams.get('birthTime');
  const gender = searchParams.get('gender') as Gender | null;
  const birthdayType = (searchParams.get('birthdayType') || 'solar') as BirthdayType;
  const leapMonth = searchParams.get('leapMonth') === 'true';
  const language = (searchParams.get('language') || 'zh-CN') as Language;
  const enhanceWithAI = searchParams.get('enhanceWithAI') === 'true';

  // Validate required fields
  if (!birthday) {
    return NextResponse.json(
      { error: 'Missing required parameter: birthday' },
      { status: 400 },
    );
  }
  if (!birthTimeStr) {
    return NextResponse.json(
      { error: 'Missing required parameter: birthTime' },
      { status: 400 },
    );
  }
  if (!gender) {
    return NextResponse.json(
      { error: 'Missing required parameter: gender' },
      { status: 400 },
    );
  }

  const birthTime = parseInt(birthTimeStr, 10);
  if (isNaN(birthTime) || birthTime < 0 || birthTime > 12) {
    return NextResponse.json(
      { error: 'Invalid birthTime. Must be an integer between 0 and 12.' },
      { status: 400 },
    );
  }
  if (gender !== 'male' && gender !== 'female') {
    return NextResponse.json(
      { error: 'Invalid gender. Must be "male" or "female".' },
      { status: 400 },
    );
  }

  try {
    let chart;
    if (birthdayType === 'lunar') {
      chart = generateByLunar({
        birthday,
        birthTime,
        gender,
        leapMonth,
        language,
      });
    } else {
      chart = generateBySolar({
        birthday,
        birthTime,
        gender,
        leapMonth,
        language,
      });
    }

    const response: Record<string, unknown> = {
      ...chart,
      language,
      meta: { platform: 'TianJi Global | 天机全球', version: '1.0.0' },
    };

    // Build AI-friendly ZiweiData from the raw iztro data
    if (enhanceWithAI) {
      try {
        const raw = chart.raw as {
          palaces: Array<{
            name: string;
            majorStars: Array<{ name: string }>;
            minorStars?: Array<{ name: string }>;
            adjectiveStars?: Array<{ name: string }>;
            isBodyPalace?: boolean;
            heavenlyStem?: string;
            earthlyBranch?: string;
          }>;
          fiveElementsClass?: string;
        };

        // Find life palace (index 4 = 命宫) and body palace
        const lifePalaceIdx = 4;
        const lifePalace = raw.palaces[lifePalaceIdx];
        const bodyPalace = raw.palaces.find((p) => p.isBodyPalace);

        const toStarNames = (stars?: Array<{ name: string }>) =>
          (stars || []).map((s) => s.name).filter(Boolean);

        const ziweiData: ZiweiData = {
          yearStem: raw.palaces[lifePalaceIdx]?.heavenlyStem || '未知',
          lifePalace: {
            branch: String(lifePalaceIdx),
            name: lifePalace?.name || '命宫',
          },
          bodyPalace: {
            branch: String(raw.palaces.findIndex((p) => p.isBodyPalace)),
            name: bodyPalace?.name || '身宫',
          },
          palaces: raw.palaces.map((p, idx) => ({
            name: p.name,
            nameEn: p.name, // keep Chinese in v1
            stars: [
              ...toStarNames(p.majorStars),
              ...toStarNames(p.minorStars),
              ...toStarNames(p.adjectiveStars),
            ],
            isLifePalace: idx === lifePalaceIdx,
          })),
          siHua: { lu: '', quan: '', ke: '', ji: '' }, // siHua not exposed by iztro v2
          gender,
        };

        const lang = language.startsWith('zh') ? 'zh' : 'en';
        const { aiInterpretation, disclaimer, report } = await interpretZiwei(ziweiData, lang);

        response.aiInterpretation = aiInterpretation;
        response.disclaimer = disclaimer;
        response.aiMeta = {
          provider: report.provider,
          model: report.model,
          latencyMs: report.latencyMs,
          costUSD: report.costUSD,
        };
      } catch (aiErr) {
        response.aiError = aiErr instanceof Error ? aiErr.message : 'AI interpretation failed';
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Ziwei calculation failed: ${message}` },
      { status: 500 },
    );
  }
}
