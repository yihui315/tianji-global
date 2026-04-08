import { NextRequest, NextResponse } from 'next/server';

export interface FortunePoint {
  ageStart: number;
  ageEnd: number;
  phase: string;
  phaseEn: string;
  overall: number;
  career: number;
  wealth: number;
  love: number;
  health: number;
}

const PHASES_ZH = [
  { ageStart: 0, ageEnd: 9, phase: '童年', phaseEn: 'Childhood' },
  { ageStart: 10, ageEnd: 19, phase: '少年', phaseEn: 'Youth' },
  { ageStart: 20, ageEnd: 29, phase: '青年', phaseEn: 'Young Adult' },
  { ageStart: 30, ageEnd: 39, phase: '而立', phaseEn: 'Establishing' },
  { ageStart: 40, ageEnd: 49, phase: '不惑', phaseEn: 'Clarifying' },
  { ageStart: 50, ageEnd: 59, phase: '知命', phaseEn: 'Wisdom' },
  { ageStart: 60, ageEnd: 69, phase: '耳顺', phaseEn: 'Harmony' },
  { ageStart: 70, ageEnd: 79, phase: '花甲', phaseEn: 'Retirement' },
  { ageStart: 80, ageEnd: 89, phase: '古稀', phaseEn: 'Longevity' },
  { ageStart: 90, ageEnd: 99, phase: '耄耋', phaseEn: 'Elder' },
];

// Seeded pseudo-random for consistent results per birth year
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function calculateFortuneFromBirth(
  birthYear: number,
  birthMonth: number,
  birthDay: number
): FortunePoint[] {
  const rand = seededRandom(birthYear * 10000 + birthMonth * 100 + birthDay);

  return PHASES_ZH.map(p => {
    const base = 40 + rand() * 30;
    const career = Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 30)));
    const wealth = Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 30)));
    const love = Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 30)));
    const health = Math.round(Math.min(100, Math.max(0, base + 15 + (rand() - 0.5) * 20)));
    const overall = Math.round((career + wealth + love + health) / 4);

    return {
      ...p,
      overall,
      career,
      wealth,
      love,
      health,
    };
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const birthDate = searchParams.get('birthDate');
  const birthTime = searchParams.get('birthTime');
  const gender = searchParams.get('gender') || 'unspecified';
  const language = searchParams.get('language') || 'zh';

  if (!birthDate) {
    return NextResponse.json(
      { error: language === 'zh' ? '缺少出生日期' : 'Birth date is required' },
      { status: 400 }
    );
  }

  try {
    const [year, month, day] = birthDate.split('-').map(Number);
    const fortuneCycles = calculateFortuneFromBirth(year, month, day);

    // Find best and worst periods
    const sorted = [...fortuneCycles].sort((a, b) => b.overall - a.overall);
    const bestPeriods = sorted.slice(0, 3).map(
      p => language === 'zh'
        ? `${p.phase} (${p.ageStart}-${p.ageEnd}岁): ${p.overall}分`
        : `${p.phaseEn} (${p.ageStart}-${p.ageEnd}): Score ${p.overall}`
    );
    const challengingPeriods = sorted.slice(-2).map(
      p => language === 'zh'
        ? `${p.phase} (${p.ageStart}-${p.ageEnd}岁): ${p.overall}分`
        : `${p.phaseEn} (${p.ageStart}-${p.ageEnd}): Score ${p.overall}`
    );

    // Determine current life phase
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    const currentPhase = PHASES_ZH.find(p => age >= p.ageStart && age <= p.ageEnd) || PHASES_ZH[0];

    return NextResponse.json({
      birthDate,
      birthTime: birthTime || null,
      gender,
      currentAge: age,
      currentPhase: language === 'zh' ? currentPhase.phase : currentPhase.phaseEn,
      fortuneCycles,
      summary: language === 'zh'
        ? `根据您的八字推算，您目前处于${currentPhase.phase}时期（${currentPhase.ageStart}-${currentPhase.ageEnd}岁），这是一个重要的人生阶段。`
        : `Based on your birth chart, you are currently in the ${currentPhase.phaseEn} phase (${currentPhase.ageStart}-${currentPhase.ageEnd}).`,
      bestPeriods,
      challengingPeriods,
    });
  } catch {
    return NextResponse.json(
      { error: language === 'zh' ? '日期格式错误' : 'Invalid date format' },
      { status: 400 }
    );
  }
}
