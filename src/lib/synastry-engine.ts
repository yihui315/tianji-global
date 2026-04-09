/**
 * Western Astrology Synastry Engine
 * TianJi Global | 天机全球
 *
 * Computes planetary positions, house placements, and synastry aspects
 * between two birth charts using the Swiss Ephemeris (sweph).
 */

import { utc_to_jd, calc, houses_ex2, constants, set_ephe_path } from 'sweph';

// Set ephemeris path to sweph's bundled data
set_ephe_path('');

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlanetPosition {
  name: string;         // e.g. 'Sun', 'Moon', 'Mercury'
  longitude: number;    // 0-360 degrees
  latitude: number;     // ecliptic latitude
  sign: number;         // 0-11 (Aries=0)
  signName: string;
  signSymbol: string;
  degree: number;       // degree within sign (0-29.999)
  orb: number;          // distance in AU
}

export interface HousePlacements {
  houses: number[];     // 12 house cusps (longitudes)
  ascendant: number;
  midheaven: number;
}

export interface ChartData {
  planets: PlanetPosition[];
  houses: HousePlacements;
  julianDay: number;
}

export type AspectType = 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition';
export type AspectPolarity = 'harmonious' | 'challenging' | 'neutral';

export interface Aspect {
  planet1: string;
  planet2: string;
  type: AspectType;
  exactAngle: number;   // actual angular difference
  orb: number;          // deviation from exact (degrees)
  strength: number;     // 0-100 (percentage of max orb)
  polarity: AspectPolarity;
  polarityScore: number; // +1 harmonious, -1 challenging
}

export interface SynastryResult {
  person1Chart: ChartData;
  person2Chart: ChartData;
  aspects: Aspect[];
  overallScore: number; // 0-100
}

// ─── Zodiac Data ─────────────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  { name: 'Aries',     nameZh: '白羊', symbol: '♈', element: 'Fire'   },
  { name: 'Taurus',    nameZh: '金牛', symbol: '♉', element: 'Earth'   },
  { name: 'Gemini',    nameZh: '双子', symbol: '♊', element: 'Air'     },
  { name: 'Cancer',    nameZh: '巨蟹', symbol: '♋', element: 'Water'   },
  { name: 'Leo',       nameZh: '狮子', symbol: '♌', element: 'Fire'    },
  { name: 'Virgo',     nameZh: '处女', symbol: '♍', element: 'Earth'   },
  { name: 'Libra',     nameZh: '天秤', symbol: '♎', element: 'Air'     },
  { name: 'Scorpio',   nameZh: '天蝎', symbol: '♏', element: 'Water'   },
  { name: 'Sagittarius',nameZh: '射手', symbol: '♐', element: 'Fire'   },
  { name: 'Capricorn', nameZh: '摩羯', symbol: '♑', element: 'Earth'   },
  { name: 'Aquarius',  nameZh: '水瓶', symbol: '♒', element: 'Air'    },
  { name: 'Pisces',    nameZh: '双鱼', symbol: '♓', element: 'Water'  },
];

const PLANET_IDS: Record<string, number> = {
  Sun:     constants.SE_SUN,
  Moon:    constants.SE_MOON,
  Mercury: constants.SE_MERCURY,
  Venus:   constants.SE_VENUS,
  Mars:    constants.SE_MARS,
  Jupiter: constants.SE_JUPITER,
  Saturn:  constants.SE_SATURN,
  Uranus:  constants.SE_URANUS,
  Neptune: constants.SE_NEPTUNE,
  Pluto:   constants.SE_PLUTO,
};

const ASPECT_DEFINITIONS: Array<{ type: AspectType; angle: number; orb: number; polarity: AspectPolarity }> = [
  { type: 'Conjunction',  angle:   0, orb: 12, polarity: 'neutral'    },
  { type: 'Sextile',      angle:  60, orb:  6, polarity: 'harmonious'  },
  { type: 'Square',       angle:  90, orb:  8, polarity: 'challenging' },
  { type: 'Trine',        angle: 120, orb:  8, polarity: 'harmonious'  },
  { type: 'Opposition',   angle: 180, orb: 10, polarity: 'challenging' },
];

// ─── Julian Day Calculation ───────────────────────────────────────────────────

function parseBirthDateTime(birthDate: string, birthTime: string): { year: number; month: number; day: number; hour: number; min: number; sec: number } {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [h, m] = birthTime.split(':').map(Number);
  const hour = h + m / 60;
  return { year, month, day, hour, min: m, sec: 0 };
}

function getJulianDay(year: number, month: number, day: number, hour: number): number {
  const result = utc_to_jd(year, month, day, hour, 0, 0, constants.SE_GREG_CAL);
  if (result.flag !== constants.OK) throw new Error(result.error ?? 'Julian day conversion failed');
  return result.data[0]; // jd_ut for houses; we use jd_et for planets
}

// ─── Planetary Positions ──────────────────────────────────────────────────────

function getSign(longitude: number): { sign: number; signName: string; signSymbol: string; degree: number } {
  const sign = Math.floor(longitude / 30) % 12;
  const degree = longitude % 30;
  const s = ZODIAC_SIGNS[sign];
  return { sign, signName: s.name, signSymbol: s.symbol, degree };
}

function getPlanetaryPositions(birthDate: string, birthTime: string, _lat: number, _lng: number): PlanetPosition[] {
  const { year, month, day, hour } = parseBirthDateTime(birthDate, birthTime);
  const jdResult = utc_to_jd(year, month, day, hour, 0, 0, constants.SE_GREG_CAL);
  if (jdResult.flag !== constants.OK) throw new Error(jdResult.error ?? 'Julian day conversion failed');

  const jd_et = jdResult.data[0]; // ephemeris time for planetary calculations
  const jd_ut = jdResult.data[1]; // universal time for houses

  const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;

  const planets: PlanetPosition[] = [];

  for (const [name, id] of Object.entries(PLANET_IDS)) {
    const result = calc(jd_et, id, flags);
    if (result.flag !== flags) {
      // Fallback: try without speed flag
      const fallback = calc(jd_et, id, constants.SEFLG_SWIEPH);
      if (fallback.flag !== constants.SEFLG_SWIEPH) continue;
      const lon = fallback.data[0] as number;
      const lat = fallback.data[1] as number;
      const dist = fallback.data[2] as number;
      const { sign, signName, signSymbol, degree } = getSign(lon);
      planets.push({ name, longitude: lon % 360, latitude: lat, sign, signName, signSymbol, degree, orb: dist });
    } else {
      const lon = result.data[0] as number;
      const lat = result.data[1] as number;
      const dist = result.data[2] as number;
      const { sign, signName, signSymbol, degree } = getSign(lon);
      planets.push({ name, longitude: lon % 360, latitude: lat, sign, signName, signSymbol, degree, orb: dist });
    }
  }

  return planets;
}

// ─── House Placements (Placidus) ─────────────────────────────────────────────

function getHouses(jd_ut: number, lat: number, lng: number): HousePlacements {
  // houses_ex2(tjd_ut, iflag, geolat, geolon, hsys) — returns degrees
  const hResult = houses_ex2(jd_ut, 0, lat, lng, 'P') as { flag: number; error: string; data: { houses: number[] } };
  if (hResult.flag !== constants.OK) throw new Error(hResult.error ?? 'House calculation failed');

  const houses = hResult.data.houses.map(h => ((h % 360) + 360) % 360);
  const ascendant = houses[0];
  const midheaven = houses[9] ?? houses[1];

  return { houses, ascendant, midheaven };
}

// ─── Full Chart Data ─────────────────────────────────────────────────────────

export function getChartData(birthDate: string, birthTime: string, lat: number, lng: number): ChartData {
  const { year, month, day, hour } = parseBirthDateTime(birthDate, birthTime);
  const jdResult = utc_to_jd(year, month, day, hour, 0, 0, constants.SE_GREG_CAL);
  const jd_ut = jdResult.data[1];
  const jd_et = jdResult.data[0];

  const planets = getPlanetaryPositions(birthDate, birthTime, lat, lng);
  const houses = getHouses(jd_ut, lat, lng);

  return { planets, houses, julianDay: jd_ut };
}

// ─── Aspect Calculation ──────────────────────────────────────────────────────

function normalizeAngle(diff: number): number {
  return ((diff % 180) + 180) % 180;
}

function computeAspectStrength(orb: number, maxOrb: number): number {
  if (orb > maxOrb) return 0;
  return Math.round(((maxOrb - orb) / maxOrb) * 100);
}

function computeAspects(chart1: ChartData, chart2: ChartData): Aspect[] {
  const aspects: Aspect[] = [];

  for (const p1 of chart1.planets) {
    for (const p2 of chart2.planets) {
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const asp of ASPECT_DEFINITIONS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          const strength = computeAspectStrength(orb, asp.orb);
          const polarityScore = asp.polarity === 'harmonious' ? 1 : asp.polarity === 'challenging' ? -1 : 0;

          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: asp.type,
            exactAngle: asp.angle,
            orb: Math.round(orb * 100) / 100,
            strength,
            polarity: asp.polarity,
            polarityScore,
          });
        }
      }
    }
  }

  return aspects.sort((a, b) => b.strength - a.strength);
}

// ─── Compatibility Score ──────────────────────────────────────────────────────

function calculateOverallScore(aspects: Aspect[]): number {
  if (aspects.length === 0) return 30;

  let totalScore = 50; // baseline

  for (const asp of aspects) {
    // Weight aspects by their type importance and strength
    const weight = asp.type === 'Conjunction' ? 15
      : asp.type === 'Trine' ? 12
      : asp.type === 'Square' ? 10
      : asp.type === 'Sextile' ? 8
      : 10;

    const contribution = (asp.strength / 100) * weight * asp.polarityScore;
    totalScore += contribution;
  }

  // Count aspect types for bonus
  const conjunctCount = aspects.filter(a => a.type === 'Conjunction').length;
  const trineCount = aspects.filter(a => a.type === 'Trine').length;
  const squareCount = aspects.filter(a => a.type === 'Square').length;
  const oppositionCount = aspects.filter(a => a.type === 'Opposition').length;
  const sextileCount = aspects.filter(a => a.type === 'Sextile').length;

  // Bonus for multiple trines and sextiles (harmonious)
  totalScore += Math.min(trineCount, 3) * 2;
  totalScore += Math.min(sextileCount, 3) * 1;

  // Slight penalty for many squares/oppositions
  totalScore -= Math.max(0, squareCount - 2) * 1;
  totalScore -= Math.max(0, oppositionCount - 1) * 1;

  // Bonus for strong conjunctions
  const strongConjunctions = aspects.filter(a => a.type === 'Conjunction' && a.strength > 70).length;
  totalScore += strongConjunctions * 3;

  return Math.max(0, Math.min(100, Math.round(totalScore)));
}

// ─── Main Synastry Function ──────────────────────────────────────────────────

export function computeSynastry(
  person1: { birthDate: string; birthTime: string; lat: number; lng: number },
  person2: { birthDate: string; birthTime: string; lat: number; lng: number }
): SynastryResult {
  const person1Chart = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
  const person2Chart = getChartData(person2.birthDate, person2.birthTime, person2.lat, person2.lng);

  const aspects = computeAspects(person1Chart, person2Chart);
  const overallScore = calculateOverallScore(aspects);

  return { person1Chart, person2Chart, aspects, overallScore };
}

// ─── Sign Helpers ────────────────────────────────────────────────────────────

export function getSignByIndex(index: number) {
  return ZODIAC_SIGNS[index % 12];
}

export { ZODIAC_SIGNS };
