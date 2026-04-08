import { NextRequest, NextResponse } from 'next/server';
import { calculateBaZi, HEAVENLY_STEMS, ELEMENTS } from '@/lib/bazi';

type Language = 'en' | 'zh';

interface Pillar {
  heavenlyStem: string;
  earthlyBranch: string;
  element: string;
}

interface BaZiChart {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  dayMasterElement: string;
}

interface BaZiRequest {
  birthday: string; // YYYY-MM-DD
  birthTime: string; // HH:MM format
  gender?: 'male' | 'female';
  language?: Language;
}

function buildInterpretation(chart: BaZiChart, language: Language): string {
  const element = chart.dayMasterElement;
  const elementName = language === 'zh' 
    ? { Wood: '木', Fire: '火', Earth: '土', Metal: '金', Water: '水' }[element]
    : element;
  
  const dayStem = chart.day.heavenlyStem;
  const dayStemName = language === 'zh' ? dayStem : HEAVENLY_STEMS[HEAVENLY_STEMS.indexOf(dayStem) % 10];

  const interpretations = {
    en: `Your Day Master is ${dayStem} (${element}). This ${element.toLowerCase()}-type personality suggests innate strengths in ${getElementTraits(element, 'en')}.`,
    zh: `您的日主为${dayStem}，属${elementName}行。这种${elementName}型性格天生具有${getElementTraits(element, 'zh')}的优势。`,
  };

  return interpretations[language] || interpretations.en;
}

function getElementTraits(element: string, language: Language): string {
  const traits: Record<string, Record<string, string>> = {
    Wood: {
      en: 'creativity, adaptability, and growth',
      zh: '创造力、适应能力和成长力',
    },
    Fire: {
      en: 'passion, energy, and leadership',
      zh: '热情、活力和领导力',
    },
    Earth: {
      en: 'stability, practicality, and nurturing',
      zh: '稳定、务实和养育能力',
    },
    Metal: {
      en: 'strength, structure, and determination',
      zh: '力量、条理性和决心',
    },
    Water: {
      en: 'wisdom, flexibility, and intuition',
      zh: '智慧、灵活性和直觉',
    },
  };
  return traits[element]?.[language] || traits[element]?.en || '';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const birthday = searchParams.get('birthday');
  const birthTime = searchParams.get('birthTime');
  const gender = (searchParams.get('gender') as 'male' | 'female') || 'unspecified';
  const language = (searchParams.get('language') as Language) || 'zh';

  if (!birthday) {
    return NextResponse.json(
      { error: 'Missing required parameter: birthday' },
      { status: 400 },
    );
  }

  if (!birthTime) {
    return NextResponse.json(
      { error: 'Missing required parameter: birthTime' },
      { status: 400 },
    );
  }

  const [year, month, day] = birthday.split('-').map(Number);
  const [hour, minute] = birthTime.split(':').map(Number);

  if (!year || !month || !day || isNaN(hour) || isNaN(minute)) {
    return NextResponse.json(
      { error: 'Invalid birthday or birthTime format. Use YYYY-MM-DD for birthday and HH:MM for birthTime.' },
      { status: 400 },
    );
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return NextResponse.json(
      { error: 'Invalid date or time values.' },
      { status: 400 },
    );
  }

  try {
    const chart = calculateBaZi({ year, month, day, hour });
    const interpretation = buildInterpretation(chart, language);

    return NextResponse.json({
      chart,
      gender,
      language,
      interpretation,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `BaZi calculation failed: ${message}` },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: BaZiRequest = await request.json();
    const { birthday, birthTime, gender = 'unspecified', language = 'zh' } = body;

    if (!birthday || !birthTime) {
      return NextResponse.json(
        { error: 'birthday and birthTime are required.' },
        { status: 400 },
      );
    }

    const [year, month, day] = birthday.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);

    if (!year || !month || !day || isNaN(hour) || isNaN(minute)) {
      return NextResponse.json(
        { error: 'Invalid birthday or birthTime format.' },
        { status: 400 },
      );
    }

    const chart = calculateBaZi({ year, month, day, hour });
    const interpretation = buildInterpretation(chart, language);

    return NextResponse.json({
      chart,
      gender,
      language,
      interpretation,
      meta: {
        platform: 'TianJi Global | 天机全球',
        version: '1.0.0',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
