import { NextRequest, NextResponse } from 'next/server';
import { celebrities } from '@/data/celebrities';
import { calculateBaZi } from '@/lib/bazi';

function computeCompatibility(a: { year: number; month: number; day: number; hour: number }, b: { year: number; month: number; day: number; hour: number }): number {
  try {
    const chartA = calculateBaZi(a);
    const chartB = calculateBaZi(b);

    const stemMatch = chartA.day.heavenlyStem === chartB.day.heavenlyStem ? 30 :
      chartA.dayMasterElement === chartB.dayMasterElement ? 15 : 0;

    const elemA = chartA.dayMasterElement;
    const elemB = chartB.dayMasterElement;
    const compatible: Record<string, string[]> = {
      'Wood': ['Fire', 'Earth'],
      'Fire': ['Earth', 'Metal'],
      'Earth': ['Metal', 'Water'],
      'Metal': ['Water', 'Wood'],
      'Water': ['Wood', 'Fire'],
    };
    const elementScore = (compatible[elemA]?.includes(elemB) ? 25 : compatible[elemB]?.includes(elemA) ? 15 : 5);

    const pillarMatches = [
      chartA.year.heavenlyStem === chartB.year.heavenlyStem,
      chartA.month.heavenlyStem === chartB.month.heavenlyStem,
      chartA.hour.heavenlyStem === chartB.hour.heavenlyStem,
    ].filter(Boolean).length * 5;

    return Math.min(99, stemMatch + elementScore + pillarMatches);
  } catch {
    return 50;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase() || '';
  const occupation = searchParams.get('occupation') || '';
  const birthDate = searchParams.get('birthDate');
  const birthTime = searchParams.get('birthTime');

  // Match endpoint
  if (birthDate && birthTime) {
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hour, minute] = birthTime.split(':').map(Number);
    if (!year || !month || !day || isNaN(hour) || isNaN(minute)) {
      return NextResponse.json({ error: 'Invalid birthDate or birthTime' }, { status: 400 });
    }
    const scored = celebrities.map(celeb => {
      const [cy, cm, cd] = celeb.birthDate.split('-').map(Number);
      const [ch, cmin] = celeb.birthTime.split(':').map(Number);
      const score = computeCompatibility({ year, month, day, hour }, { year: cy, month: cm, day: cd, hour: ch });
      return { ...celeb, compatibility: score };
    });
    scored.sort((a, b) => b.compatibility - a.compatibility);
    return NextResponse.json(scored.slice(0, 5));
  }

  // List/search endpoint
  let results = celebrities;
  if (q) {
    results = results.filter(c => c.name.toLowerCase().includes(q) || c.nationality.toLowerCase().includes(q) || c.occupation.toLowerCase().includes(q));
  }
  if (occupation && occupation !== 'All') {
    results = results.filter(c => c.occupation.toLowerCase() === occupation.toLowerCase());
  }

  return NextResponse.json(results);
}
