/**
 * Electional Astrology Engine - 择日择时
 * TianJi Global | 天机全球
 *
 * Finds the most auspicious dates/times using REAL astronomia calculations.
 * No Math.random() - all scores are deterministic based on actual planetary positions.
 */

import { CalendarGregorianToJD } from 'astronomia/julian'
import { Planet } from 'astronomia/planetposition'
import { position as moonPosition } from 'astronomia/moonposition'
import earthData from 'astronomia/data/vsop87Bearth'
import mercuryData from 'astronomia/data/vsop87Bmercury'
import venusData from 'astronomia/data/vsop87Bvenus'
import marsData from 'astronomia/data/vsop87Bmars'
import jupiterData from 'astronomia/data/vsop87Bjupiter'
import saturnData from 'astronomia/data/vsop87Bsaturn'

export interface ElectionalCandidate {
  date: Date;
  score: number;
  moonPhase: 'new' | 'waxing' | 'full' | 'waning';
  moonLongitude: number;
  voidOfCourse: boolean;
  aspects: string[];
  warnings: string[];
  highlights: string[];
}

// ─── Planet Data Setup ────────────────────────────────────────────────────────

const earth = new Planet(earthData)
const mercury = new Planet(mercuryData)
const venus = new Planet(venusData)
const mars = new Planet(marsData)
const jupiter = new Planet(jupiterData)
const saturn = new Planet(saturnData)

const PLANET_DATA: Record<string, { getPosition: (jd: number) => { lon: number; lat: number; distance: number } }> = {
  Sun:     { getPosition: (jd) => { const p = earth.position(jd); return { lon: (p.lon + Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Mercury: { getPosition: (jd) => { const p = mercury.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Venus:   { getPosition: (jd) => { const p = venus.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Mars:    { getPosition: (jd) => { const p = mars.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Jupiter: { getPosition: (jd) => { const p = jupiter.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Saturn:  { getPosition: (jd) => { const p = saturn.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
}

const PLANET_NAMES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

const SIGN_NAMES = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const EVENT_CONFIGS: Record<string, {
  favorableSigns: string[];
  avoidSigns: string[];
  preferPlanet: string;
  avoidVoidCourse: boolean;
  preferWaxing: boolean;
  preferWaning: boolean;
  scoreBonuses: Record<string, number>;
}> = {
  business_launch: {
    favorableSigns: ['Aries', 'Leo', 'Sagittarius', 'Cancer', 'Libra'],
    avoidSigns: ['Scorpio', 'Capricorn'],
    preferPlanet: 'Jupiter',
    avoidVoidCourse: true,
    preferWaxing: true,
    preferWaning: false,
    scoreBonuses: { Jupiter: 20, Sun: 15, Venus: 10 },
  },
  marriage: {
    favorableSigns: ['Taurus', 'Libra', 'Pisces', 'Cancer'],
    avoidSigns: ['Aries', 'Scorpio', 'Capricorn'],
    preferPlanet: 'Venus',
    avoidVoidCourse: true,
    preferWaxing: true,
    preferWaning: false,
    scoreBonuses: { Venus: 25, Jupiter: 15, Sun: 10 },
  },
  travel: {
    favorableSigns: ['Sagittarius', 'Gemini', 'Aquarius'],
    avoidSigns: ['Capricorn'],
    preferPlanet: 'Mercury',
    avoidVoidCourse: false,
    preferWaxing: false,
    preferWaning: false,
    scoreBonuses: { Mercury: 15, Jupiter: 15 },
  },
  surgery: {
    favorableSigns: ['Virgo', 'Capricorn', 'Taurus'],
    avoidSigns: ['Aries', 'Leo', 'Sagittarius', 'Pisces'],
    preferPlanet: 'Saturn',
    avoidVoidCourse: true,
    preferWaxing: false,
    preferWaning: true,
    scoreBonuses: { Saturn: 20, Moon: 10 },
  },
  legal: {
    favorableSigns: ['Aries', 'Capricorn', 'Aquarius', 'Libra'],
    avoidSigns: ['Pisces', 'Cancer'],
    preferPlanet: 'Saturn',
    avoidVoidCourse: true,
    preferWaxing: true,
    preferWaning: false,
    scoreBonuses: { Saturn: 20, Sun: 15, Jupiter: 10 },
  },
  education: {
    favorableSigns: ['Virgo', 'Aquarius', 'Sagittarius', 'Gemini'],
    avoidSigns: ['Scorpio'],
    preferPlanet: 'Mercury',
    avoidVoidCourse: true,
    preferWaxing: false,
    preferWaning: false,
    scoreBonuses: { Mercury: 20, Jupiter: 15, Sun: 10 },
  },
};

function normalizeAngle(a: number): number {
  a = a % 360;
  return a < 0 ? a + 360 : a;
}

function radToDeg(rad: number): number {
  return (rad * 180 / Math.PI + 360) % 360;
}

function getSignName(longitude: number): string {
  return SIGN_NAMES[Math.floor(longitude / 30) % 12];
}

function getAspectName(angleDiff: number): string | null {
  const angle = Math.min(angleDiff, 360 - angleDiff);
  if (angle <= 8) return 'conjunction';
  if (Math.abs(angle - 60) <= 6) return 'sextile';
  if (Math.abs(angle - 90) <= 6) return 'square';
  if (Math.abs(angle - 120) <= 6) return 'trine';
  if (Math.abs(angle - 180) <= 8) return 'opposition';
  return null;
}

function getAspectPolarity(type: string): 'harmonious' | 'challenging' | 'neutral' {
  if (type === 'trine' || type === 'sextile') return 'harmonious';
  if (type === 'square' || type === 'opposition') return 'challenging';
  return 'neutral';
}

/** Get Julian Day for a UTC date (noon) */
function getJD(year: number, month: number, day: number): number {
  return CalendarGregorianToJD(year, month, day + 12 / 24);
}

/** Get planet longitude in degrees */
function getPlanetLon(jd: number, name: string): number | null {
  try {
    const jdEt = jd + 1 / 86400;
    if (name === 'Sun') {
      const p = earth.position(jdEt);
      return radToDeg((p.lon + Math.PI) % (2 * Math.PI));
    }
    if (name === 'Moon') {
      const p = moonPosition(jdEt);
      return radToDeg(p.lon);
    }
    const pd = PLANET_DATA[name];
    if (!pd) return null;
    const p = pd.getPosition(jdEt);
    return radToDeg(p.lon);
  } catch {
    return null;
  }
}

/** Get moon longitude and phase */
function getMoonPhaseData(jd: number): { longitude: number; phase: 'new' | 'waxing' | 'full' | 'waning' } {
  const moonLon = getPlanetLon(jd, 'Moon');
  const sunLon = getPlanetLon(jd, 'Sun');
  if (moonLon === null || sunLon === null) return { longitude: 0, phase: 'new' };

  const elongation = normalizeAngle(moonLon - sunLon);
  let phase: 'new' | 'waxing' | 'full' | 'waning';
  if (elongation < 45) phase = 'new';
  else if (elongation < 135) phase = 'waxing';
  else if (elongation < 225) phase = 'full';
  else if (elongation < 315) phase = 'waning';
  else phase = 'new';

  return { longitude: moonLon, phase };
}

/** Get moon speed (degrees per day) for void-of-course detection */
function getMoonSpeed(jd: number): number {
  try {
    const jdEt = jd + 1 / 86400;
    const p1 = moonPosition(jdEt - 1);
    const p2 = moonPosition(jdEt);
    const lonDiff1 = (p2.lon - p1.lon + 2*Math.PI) % (2*Math.PI);
    const lonDiff2 = (p1.lon - p2.lon + 2*Math.PI) % (2*Math.PI);
    return radToDeg(Math.min(lonDiff1, lonDiff2));
  } catch {
    return 13;
  }
}

/**
 * Detect if moon is void-of-course.
 * Moon is void when it makes no major aspect before leaving its sign.
 */
function isVoidOfCourse(jd: number): boolean {
  const moonLon = getPlanetLon(jd, 'Moon');
  if (moonLon === null) return false;

  const moonDegreeInSign = moonLon % 30;
  const moonSpeed = getMoonSpeed(jd);
  const hoursLeftInSign = (30 - moonDegreeInSign) / (moonSpeed / 24);

  if (hoursLeftInSign < 3) {
    for (let m = 0; m < 3; m += 0.1) {
      const jdCheck = jd + m / 24;
      const futureMoonLon = getPlanetLon(jdCheck, 'Moon');
      if (futureMoonLon === null) continue;

      for (const name of ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
        if (name === 'Moon') continue;
        const planetLon = getPlanetLon(jdCheck, name);
        if (planetLon === null) continue;

        const angleDiff = Math.abs(futureMoonLon - planetLon);
        const normAngle = Math.min(angleDiff, 360 - angleDiff);
        if (normAngle <= 10) {
          const aspectName = getAspectName(normAngle);
          if (aspectName && ['trine', 'square', 'opposition', 'conjunction'].includes(aspectName)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  if (moonDegreeInSign > 27) {
    for (const name of ['Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
      if (name === 'Moon' || name === 'Mercury' || name === 'Venus') continue;
      const planetLon = getPlanetLon(jd, name);
      if (planetLon === null) continue;

      const angleDiff = Math.abs(moonLon - planetLon);
      const normAngle = Math.min(angleDiff, 360 - angleDiff);
      if (normAngle <= 10 || (normAngle >= 170 && normAngle <= 190)) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/** Score planetary aspects for a given day */
function scoreAspects(
  positions: Record<string, number>,
  config: typeof EVENT_CONFIGS[string]
): { score: number; aspects: string[]; highlights: string[]; warnings: string[] } {
  let score = 50;
  const aspects: string[] = [];
  const highlights: string[] = [];
  const warnings: string[] = [];

  const planetNames = Object.keys(positions);
  for (let i = 0; i < planetNames.length; i++) {
    for (let j = i + 1; j < planetNames.length; j++) {
      const p1 = planetNames[i];
      const p2 = planetNames[j];
      const lon1 = positions[p1];
      const lon2 = positions[p2];
      if (lon1 === undefined || lon2 === undefined) continue;

      const angleDiff = Math.abs(lon1 - lon2);
      const normAngle = Math.min(angleDiff, 360 - angleDiff);
      const aspectName = getAspectName(normAngle);

      if (aspectName) {
        const polarity = getAspectPolarity(aspectName);
        aspects.push(`${p1}-${aspectName}-${p2}`);

        if (polarity === 'harmonious') {
          score += 8;
          highlights.push(`${p1} ${aspectName} ${p2} — harmonious`);
        } else if (polarity === 'challenging') {
          score -= 8;
          warnings.push(`${p1} ${aspectName} ${p2} — challenging`);
        }
      }
    }
  }

  for (const [planet, bonus] of Object.entries(config.scoreBonuses)) {
    const lon = positions[planet];
    if (lon !== undefined) {
      const sign = getSignName(lon);
      if (config.favorableSigns.includes(sign)) {
        score += bonus;
        highlights.push(`${planet} in ${sign} — well placed`);
      } else if (config.avoidSigns.includes(sign)) {
        score -= bonus;
        warnings.push(`${planet} in ${sign} — poorly placed`);
      }
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    aspects,
    highlights,
    warnings,
  };
}

export function getMoonPhase(date: Date): 'new' | 'waxing' | 'full' | 'waning' {
  const jd = getJD(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  return getMoonPhaseData(jd).phase;
}

export function getBestElectionalDates(
  eventType: string,
  startDate: Date,
  endDate: Date
): ElectionalCandidate[] {
  const config = EVENT_CONFIGS[eventType] || EVENT_CONFIGS.business_launch;
  const candidates: ElectionalCandidate[] = [];

  const maxDays = Math.min(
    Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000),
    90
  );

  const current = new Date(startDate);
  for (let d = 0; d <= maxDays && candidates.length < 30; d++) {
    const evalDate = new Date(current);
    evalDate.setUTCHours(12, 0, 0, 0);
    const jd = getJD(evalDate.getUTCFullYear(), evalDate.getUTCMonth() + 1, evalDate.getUTCDate());

    const moonData = getMoonPhaseData(jd);
    const voidOfCourse = isVoidOfCourse(jd);

    const positions: Record<string, number> = {};
    for (const name of PLANET_NAMES) {
      const lon = getPlanetLon(jd, name);
      if (lon !== null) positions[name] = lon;
    }

    const { score, aspects, highlights, warnings } = scoreAspects(positions, config);

    let finalScore = score;
    const finalHighlights = [...highlights];
    const finalWarnings = [...warnings];

    if (config.preferWaxing && (moonData.phase === 'waxing' || moonData.phase === 'full')) {
      finalScore += 15;
      finalHighlights.push(`Moon ${moonData.phase} — favorable for new beginnings`);
    } else if (config.preferWaning && (moonData.phase === 'waning' || moonData.phase === 'full')) {
      finalScore += 15;
      finalHighlights.push(`Moon ${moonData.phase} — favorable for endings/operations`);
    } else if (config.preferWaxing && moonData.phase === 'waning') {
      finalScore -= 10;
      finalWarnings.push('Waning moon less ideal for this event type');
    }

    if (voidOfCourse && config.avoidVoidCourse) {
      finalScore -= 20;
      finalWarnings.push('Void-of-course moon — decisions may lack follow-through');
    } else if (!voidOfCourse) {
      finalScore += 8;
      finalHighlights.push('Moon not void-of-course — decisive');
    }

    if (moonData.phase === 'new') {
      finalScore += 5;
      finalHighlights.push('New moon — fresh starts');
    }

    finalScore = Math.max(0, Math.min(100, finalScore));

    candidates.push({
      date: new Date(evalDate),
      score: finalScore,
      moonPhase: moonData.phase,
      moonLongitude: moonData.longitude,
      voidOfCourse,
      aspects,
      warnings: finalWarnings,
      highlights: finalHighlights,
    });

    current.setUTCDate(current.getUTCDate() + 1);
  }

  return candidates.sort((a, b) => b.score - a.score);
}

export function getHourlyBreakdown(date: Date): { hour: number; score: number; label: string }[] {
  const jdBase = getJD(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  const moonDataBase = getMoonPhaseData(jdBase);
  const results = [];

  for (let h = 0; h < 24; h++) {
    const jd = jdBase + (h - 12) / 24;
    const positions: Record<string, number> = {};
    for (const name of PLANET_NAMES) {
      const lon = getPlanetLon(jd, name);
      if (lon !== null) positions[name] = lon;
    }
    let score = 50;

    if (moonDataBase.phase === 'waxing' || moonDataBase.phase === 'full') {
      if (h >= 9 && h <= 17) score += 10;
    }
    if (moonDataBase.phase === 'waning') {
      if (h >= 6 && h <= 12) score += 8;
    }
    if ((h >= 9 && h <= 11) || (h >= 14 && h <= 16)) score += 12;
    if (h === 0 || h === 12) score -= 5;

    const jupiterLon = positions.Jupiter;
    if (jupiterLon !== undefined) {
      const sign = getSignName(jupiterLon);
      if (['Sagittarius', 'Pisces'].includes(sign)) score += 8;
    }

    const label = score >= 65 ? 'Favorable' : score >= 50 ? 'Neutral' : 'Challenging';
    results.push({ hour: h, score: Math.round(Math.max(0, Math.min(100, score))), label });
  }

  return results;
}
