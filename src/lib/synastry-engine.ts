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

export type SynastryType = 'overlay' | 'composite' | 'davison';

export interface SynastryResult {
  person1Chart: ChartData;
  person2Chart: ChartData;
  aspects: Aspect[];
  overallScore: number; // 0-100
}

export interface CompositeChartData {
  planets: PlanetPosition[];
  houses: HousePlacements;
  midpointStructures: MidpointStructure[];
}

export interface MidpointStructure {
  midpoint: number;       // longitude of the midpoint
  planet1: string;        // planet at midpoint from person1
  planet2: string;        // planet at midpoint from person2
  aspectToThird: number;  // degrees from midpoint to a third planet
  thirdPlanet: string;    // name of the third planet making the structure
  structureType: 'T-square' | 'Grand Trine' | 'Yod' | 'Castle' | 'Bow';
  sensitivity: 'high' | 'medium' | 'low';
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
    // flag >= 0 means calculation succeeded (returned flag is a STATUS code, not the input iflag)
    // flag < 0 means error
    if (result.flag < 0) {
      // Fallback: try without speed flag
      const fallback = calc(jd_et, id, constants.SEFLG_SWIEPH);
      if (fallback.flag < 0) continue;
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

// ─── Composite / Davison Chart Helpers ─────────────────────────────────────────

/**
 * Normalize a longitude to 0-360 range, handling wrap-around at 0°
 * e.g. 350° and 10° → midpoint is 180° away, not 340° (we want 180°)
 * For composite midpoint: midpoint = (pos1 + pos2) / 2 with wrap handling
 */
function normalizeLongitude(lon: number): number {
  return ((lon % 360) + 360) % 360;
}

/**
 * Compute the midpoint between two longitudes, handling the 0° wrap
 * Returns value in 0-360 range
 */
function computeMidpoint(pos1: number, pos2: number): number {
  // Handle wrap-around: if the two positions are more than 180° apart
  // going the "short way" through 0°, we need to adjust
  let diff = pos2 - pos1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return normalizeLongitude(pos1 + diff / 2);
}

/**
 * Composite chart: simple midpoint between two charts
 * Formula: compositePosition = (pos1 + pos2) / 2 (with 0° wrap handling)
 */
function computeCompositePlanet(pos1: number, pos2: number): number {
  // Handle 0° wrap by using the shortest arc
  const p1 = pos1 % 360;
  const p2 = pos2 % 360;
  let diff = p2 - p1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return normalizeLongitude(p1 + diff / 2);
}

/**
 * Davison chart: weighted midpoint using Julian Day time weighting
 * Formula: davisonPosition = (jd1 * pos1 + jd2 * pos2) / (jd1 + jd2) simplified
 * In practice uses mid JD as weight for each position
 */
function computeDavisonPlanet(pos1: number, pos2: number, jd1: number, jd2: number): number {
  // Weight by time difference: mid-point in time gets midpoint position
  // Simplified: use equal weighting but reference to mid-JD
  const midJd = (jd1 + jd2) / 2;
  const w1 = Math.abs(midJd - jd2); // weight based on distance from mid
  const w2 = Math.abs(jd1 - midJd);
  const total = w1 + w2;
  if (total === 0) return computeCompositePlanet(pos1, pos2);
  // Weighted average (simplified Davison)
  const p1 = pos1 % 360;
  const p2 = pos2 % 360;
  let diff = p2 - p1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return normalizeLongitude(p1 + (diff * w2) / total);
}

function buildCompositePlanet(name: string, pos1: number, pos2: number): PlanetPosition {
  const lon = computeCompositePlanet(pos1, pos2);
  const { sign, signName, signSymbol, degree } = getSign(lon);
  return { name, longitude: lon, latitude: 0, sign, signName, signSymbol, degree, orb: 0 };
}

function buildDavisonPlanet(name: string, pos1: number, pos2: number, jd1: number, jd2: number): PlanetPosition {
  const lon = computeDavisonPlanet(pos1, pos2, jd1, jd2);
  const { sign, signName, signSymbol, degree } = getSign(lon);
  return { name, longitude: lon, latitude: 0, sign, signName, signSymbol, degree, orb: 0 };
}

/**
 * Compute Composite chart (simple midpoint chart)
 */
export function computeCompositeChart(
  person1: { birthDate: string; birthTime: string; lat: number; lng: number },
  person2: { birthDate: string; birthTime: string; lat: number; lng: number }
): CompositeChartData {
  const chart1 = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
  const chart2 = getChartData(person2.birthDate, person2.birthTime, person2.lat, person2.lng);

  // Build composite planets as midpoints
  const compositePlanets: PlanetPosition[] = chart1.planets.map(p1 => {
    const p2 = chart2.planets.find(p => p.name === p1.name) ?? p1;
    return buildCompositePlanet(p1.name, p1.longitude, p2.longitude);
  });

  // Composite houses: midpoint of each person's house cusps
  const compositeHouses = chart1.houses.houses.map((h1, i) => {
    const h2 = chart2.houses.houses[i] ?? h1;
    return computeCompositePlanet(h1, h2);
  });

  const compositeAsc = computeCompositePlanet(chart1.houses.ascendant, chart2.houses.ascendant);
  const compositeMc = computeCompositePlanet(chart1.houses.midheaven, chart2.houses.midheaven);

  const midpointStructures = computeMidpointStructures(compositePlanets, chart1.planets, chart2.planets);

  return {
    planets: compositePlanets,
    houses: { houses: compositeHouses, ascendant: compositeAsc, midheaven: compositeMc },
    midpointStructures,
  };
}

/**
 * Compute Davison chart (time-weighted midpoint chart)
 */
export function computeDavisonChart(
  person1: { birthDate: string; birthTime: string; lat: number; lng: number },
  person2: { birthDate: string; birthTime: string; lat: number; lng: number }
): CompositeChartData {
  const chart1 = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
  const chart2 = getChartData(person2.birthDate, person2.birthTime, person2.lat, person2.lng);

  const davisonPlanets: PlanetPosition[] = chart1.planets.map(p1 => {
    const p2 = chart2.planets.find(p => p.name === p1.name) ?? p1;
    return buildDavisonPlanet(p1.name, p1.longitude, p2.longitude, chart1.julianDay, chart2.julianDay);
  });

  const davisonHouses = chart1.houses.houses.map((h1, i) => {
    const h2 = chart2.houses.houses[i] ?? h1;
    return computeDavisonPlanet(h1, h2, chart1.julianDay, chart2.julianDay);
  });

  const davisonAsc = computeDavisonPlanet(chart1.houses.ascendant, chart2.houses.ascendant, chart1.julianDay, chart2.julianDay);
  const davisonMc = computeDavisonPlanet(chart1.houses.midheaven, chart2.houses.midheaven, chart1.julianDay, chart2.julianDay);

  const midpointStructures = computeMidpointStructures(davisonPlanets, chart1.planets, chart2.planets);

  return {
    planets: davisonPlanets,
    houses: { houses: davisonHouses, ascendant: davisonAsc, midheaven: davisonMc },
    midpointStructures,
  };
}

/**
 * Compute midpoint structures: patterns formed by planets at/near midpoints
 * of other planets in the composite chart.
 * These are sensitive points that aspect planets from the original charts.
 */
export function computeMidpointStructures(
  compositePlanets: PlanetPosition[],
  chart1Planets: PlanetPosition[],
  chart2Planets: PlanetPosition[]
): MidpointStructure[] {
  const structures: MidpointStructure[] = [];
  const allPlanets = [...chart1Planets, ...chart2Planets];
  const midpointsToCheck: Array<{ lon: number; p1: string; p2: string }> = [];

  // Generate all planet pair midpoints
  for (let i = 0; i < compositePlanets.length; i++) {
    for (let j = i + 1; j < compositePlanets.length; j++) {
      const cp1 = compositePlanets[i];
      const cp2 = compositePlanets[j];
      midpointsToCheck.push({
        lon: computeMidpoint(cp1.longitude, cp2.longitude),
        p1: cp1.name,
        p2: cp2.name,
      });
    }
  }

  // For each midpoint, check if any planet makes a close aspect (0°, 90°, 180°, 120°, 60°)
  const ASPECT_ANGLES = [
    { angle: 0, type: 'Conjunction', sensitivity: 'high' as const },
    { angle: 90, type: 'Square', sensitivity: 'medium' as const },
    { angle: 180, type: 'Opposition', sensitivity: 'high' as const },
    { angle: 120, type: 'Trine', sensitivity: 'low' as const },
    { angle: 60, type: 'Sextile', sensitivity: 'low' as const },
  ];

  for (const mp of midpointsToCheck) {
    for (const planet of allPlanets) {
      let diff = Math.abs(planet.longitude - mp.lon);
      if (diff > 180) diff = 360 - diff;

      for (const asp of ASPECT_ANGLES) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= 3) { // 3° orb for midpoint structures
          const structureType = detectStructureType(mp.p1, mp.p2, planet.name, diff, asp.angle);
          if (structureType) {
            structures.push({
              midpoint: mp.lon,
              planet1: mp.p1,
              planet2: mp.p2,
              aspectToThird: Math.round(asp.angle),
              thirdPlanet: planet.name,
              structureType,
              sensitivity: asp.sensitivity,
            });
          }
        }
      }
    }
  }

  // Deduplicate and sort by sensitivity
  const seen = new Set<string>();
  return structures
    .filter(s => {
      const key = `${s.planet1}-${s.planet2}-${s.thirdPlanet}-${s.structureType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.sensitivity] - order[b.sensitivity];
    });
}

function detectStructureType(
  p1: string, p2: string, p3: string,
  actualDiff: number, targetAngle: number
): MidpointStructure['structureType'] | null {
  // Yod: two planets 150° apart from a third ( quincunx )
  // Castle: T-square + Trine pattern
  // Bow: Opposition with two Squares
  if (Math.abs(targetAngle - 150) <= 3) return 'Yod';
  if (targetAngle === 0 || targetAngle === 180) return 'Castle';
  return null;
}

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

export { getSign };

export { ZODIAC_SIGNS };
