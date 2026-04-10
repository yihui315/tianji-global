/**
 * Celebrity Match Algorithm - Western Astrology Synastry
 * TianJi Global | 天机全球
 *
 * Computes match percentage between a user's birth chart and celebrity charts
 * using planetary phase (synastry) analysis.
 */

import { computeSynastry, getChartData, type ChartData, type Aspect } from './synastry-engine';
import { getAllCelebrities, type CelebrityEntry } from './celebrity-db';

export interface MatchReason {
  planet1: string;
  planet2: string;
  aspectType: string;
  description: string;
}

export interface CelebrityMatch {
  celebrity: CelebrityEntry;
  matchScore: number;       // 0-100
  sunScore: number;
  moonScore: number;
  venusScore: number;
  marsScore: number;
  reasons: MatchReason[];
  aspects: Aspect[];        // top aspects for display
}

/** Weighted scores for different planet pairs */
const PLANET_WEIGHTS: Record<string, number> = {
  Sun: 30,
  Moon: 25,
  Venus: 22,
  Mars: 23,
};

const PLANET_PAIRS = ['Sun', 'Moon', 'Venus', 'Mars'];

function getPlanetScore(
  userChart: ChartData,
  celebChart: ChartData,
  planet: string
): { score: number; aspects: Aspect[] } {
  const p1 = userChart.planets.find(p => p.name === planet);
  const p2 = celebChart.planets.find(p => p.name === planet);

  if (!p1 || !p2) return { score: 0, aspects: [] };

  // Compute angular difference between the same planet in both charts
  let diff = Math.abs(p1.longitude - p2.longitude);
  if (diff > 180) diff = 360 - diff;

  // Aspect definitions for scoring
  const aspectDefs = [
    { angle: 0,   type: 'Conjunction',  orb: 12, weight: 1.0 },
    { angle: 60,  type: 'Sextile',      orb: 6,  weight: 0.7 },
    { angle: 90,  type: 'Square',       orb: 8,  weight: 0.5 },
    { angle: 120, type: 'Trine',        orb: 8,  weight: 0.9 },
    { angle: 180, type: 'Opposition',   orb: 10, weight: 0.6 },
  ];

  let bestScore = 0;
  let bestAspect: Aspect | null = null;

  for (const def of aspectDefs) {
    const orb = Math.abs(diff - def.angle);
    if (orb <= def.orb) {
      const strength = ((def.orb - orb) / def.orb) * 100;
      const score = strength * def.weight;
      if (score > bestScore) {
        bestScore = score;
        bestAspect = {
          planet1: planet,
          planet2: planet,
          type: def.type as Aspect['type'],
          exactAngle: def.angle,
          orb: Math.round(orb * 100) / 100,
          strength: Math.round(strength),
          polarity: def.type === 'Conjunction' ? 'neutral' : def.type === 'Sextile' || def.type === 'Trine' ? 'harmonious' : 'challenging',
          polarityScore: def.type === 'Sextile' || def.type === 'Trine' ? 1 : def.type === 'Square' || def.type === 'Opposition' ? -1 : 0,
        };
      }
    }
  }

  // Bonus: same sign also adds score
  if (p1.sign === p2.sign) {
    bestScore = Math.min(100, bestScore + 15);
  }

  // Bonus: same element
  const elements = ['Fire', 'Earth', 'Air', 'Water'];
  const p1ElemIdx = Math.floor(p1.sign / 3);
  const p2ElemIdx = Math.floor(p2.sign / 3);
  if (p1ElemIdx === p2ElemIdx) {
    bestScore = Math.min(100, bestScore + 8);
  }

  return {
    score: Math.round(bestScore),
    aspects: bestAspect ? [bestAspect] : [],
  };
}

function buildMatchReason(celeb: CelebrityEntry, planet: string, aspect: Aspect | null, score: number): MatchReason {
  const descriptions: Record<string, string> = {
    Sun: '太阳代表核心自我和人生目标',
    Moon: '月亮代表情感和内心世界',
    Venus: '金星代表爱情和审美',
    Mars: '火星代表行动力和欲望',
  };

  if (!aspect) {
    return {
      planet1: planet,
      planet2: planet,
      aspectType: 'None',
      description: `${planet}相位暂无显著相位`,
    };
  }

  const aspectDescriptions: Record<string, string> = {
    Conjunction: '合相 - 你们在${planet}方面高度一致',
    Sextile: '六分相 - 你们在${planet}方面有轻松互动',
    Square: '四分相 - 你们在${planet}方面有挑战和成长',
    Trine: '三分相 - 你们在${planet}方面和谐共振',
    Opposition: '对分相 - 你们在${planet}方面形成互补或张力',
  };

  const template = aspectDescriptions[aspect.type] || aspect.type;
  const desc = template.replace('${planet}', descriptions[planet] || planet);

  return {
    planet1: planet,
    planet2: planet,
    aspectType: aspect.type,
    description: desc,
  };
}

export function matchUserWithCelebrity(
  userBirthDate: string,
  userBirthTime: string,
  userLat: number,
  userLng: number,
  celeb: CelebrityEntry
): CelebrityMatch {
  const userChart = getChartData(userBirthDate, userBirthTime, userLat, userLng);
  const celebChart = getChartData(celeb.birthDate, celeb.birthTime, celeb.lat, celeb.lng);

  // Also run full synastry for all aspects
  const synastry = computeSynastry(
    { birthDate: userBirthDate, birthTime: userBirthTime, lat: userLat, lng: userLng },
    { birthDate: celeb.birthDate, birthTime: celeb.birthTime, lat: celeb.lat, lng: celeb.lng }
  );

  const scores: Record<string, number> = {};
  const reasons: MatchReason[] = [];

  for (const planet of PLANET_PAIRS) {
    const { score, aspects } = getPlanetScore(userChart, celebChart, planet);
    scores[planet] = score;
    const aspect = aspects[0] || null;
    reasons.push(buildMatchReason(celeb, planet, aspect, score));
  }

  // Weighted total score
  let totalScore = 0;
  let totalWeight = 0;
  for (const [planet, weight] of Object.entries(PLANET_WEIGHTS)) {
    totalScore += (scores[planet] || 0) * weight;
    totalWeight += weight;
  }
  const matchScore = Math.round(totalScore / totalWeight);

  return {
    celebrity: celeb,
    matchScore,
    sunScore: scores.Sun || 0,
    moonScore: scores.Moon || 0,
    venusScore: scores.Venus || 0,
    marsScore: scores.Mars || 0,
    reasons,
    aspects: synastry.aspects.slice(0, 8),
  };
}

export function findTopCelebrityMatches(
  userBirthDate: string,
  userBirthTime: string,
  userLat: number,
  userLng: number,
  topN = 3
): CelebrityMatch[] {
  const celebrities = getAllCelebrities();

  const matches = celebrities.map(celeb =>
    matchUserWithCelebrity(userBirthDate, userBirthTime, userLat, userLng, celeb)
  );

  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches.slice(0, topN);
}
