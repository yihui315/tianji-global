/**
 * Western Astrology Synastry Engine
 * TianJi Global | 天机全球
 *
 * Computes planetary positions, house placements, and synastry aspects
 * between two birth charts using astronomia (pure JS ephemeris).
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
import uranusData from 'astronomia/data/vsop87Buranus'
import neptuneData from 'astronomia/data/vsop87Bneptune'

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

// ─── Planet Data Setup ──────────────────────────────────────────────────────

const earth = new Planet(earthData)
const mercury = new Planet(mercuryData)
const venus = new Planet(venusData)
const mars = new Planet(marsData)
const jupiter = new Planet(jupiterData)
const saturn = new Planet(saturnData)
const uranus = new Planet(uranusData)
const neptune = new Planet(neptuneData)

const PLANET_DATA: Record<string, { data: any; getPosition: (jd: number) => { lon: number; lat: number; distance: number } }> = {
  Sun:     { data: earthData, getPosition: (jd) => { const p = earth.position(jd); return { lon: (p.lon + Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Mercury: { data: mercuryData, getPosition: (jd) => { const p = mercury.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Venus:   { data: venusData, getPosition: (jd) => { const p = venus.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Mars:    { data: marsData, getPosition: (jd) => { const p = mars.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Jupiter: { data: jupiterData, getPosition: (jd) => { const p = jupiter.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Saturn:  { data: saturnData, getPosition: (jd) => { const p = saturn.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Uranus:  { data: uranusData, getPosition: (jd) => { const p = uranus.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Neptune: { data: neptuneData, getPosition: (jd) => { const p = neptune.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
}

const PLANET_NAMES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

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
  // astronomia uses Julian Day (TT/ET)
  const jd = CalendarGregorianToJD(year, month, day + hour / 24);
  return jd; // TT = UT + 1 day in seconds
}

function radToDeg(rad: number): number {
  return (rad * 180 / Math.PI + 360) % 360;
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
  const jd = getJulianDay(year, month, day, hour);
  const jdEt = jd + 1 / 86400; // TT = UT + 1 day

  const planets: PlanetPosition[] = [];

  // Sun - geocentric from Earth heliocentric
  const earthPos = earth.position(jdEt);
  const sunLon = radToDeg((earthPos.lon + Math.PI) % (2 * Math.PI));
  const sun = { lon: sunLon, lat: earthPos.lat, distance: earthPos.distance };
  const { sign, signName, signSymbol, degree } = getSign(sun.lon);
  planets.push({ name: 'Sun', longitude: sun.lon, latitude: radToDeg(sun.lat), sign, signName, signSymbol, degree, orb: sun.distance });

  // Moon - use moonPosition
  const moon = moonPosition(jdEt);
  const moonLon = radToDeg(moon.lon);
  const { sign: moonSign, signName: moonSignName, signSymbol: moonSignSymbol, degree: moonDegree } = getSign(moonLon);
  planets.push({ name: 'Moon', longitude: moonLon, latitude: radToDeg(moon.lat), sign: moonSign, signName: moonSignName, signSymbol: moonSignSymbol, degree: moonDegree, orb: moon.distance });

  // Other planets (Mercury through Neptune)
  for (const name of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']) {
    const pd = PLANET_DATA[name];
    if (!pd) continue;
    const pos = pd.getPosition(jdEt);
    const lon = radToDeg(pos.lon);
    const { sign, signName, signSymbol, degree } = getSign(lon);
    planets.push({ name, longitude: lon, latitude: radToDeg(pos.lat), sign, signName, signSymbol, degree, orb: pos.distance });
  }

  return planets;
}

// ─── House Placements (Placidus) ─────────────────────────────────────────────

/**
 * Calculate Placidus house cusps using a simplified algorithm.
 * For more accurate results, consider implementing a full Placidus algorithm.
 */
function getHouses(jd_ut: number, lat: number, lng: number): HousePlacements {
  // Simplified house calculation using the McCray algorithm approximation
  // This is a basic implementation - for production, use a full Placidus algorithm
  
  const T = (jd_ut - 2451545.0) / 36525; // Julian centuries from J2000.0
  const lst = 280.46061837 + 360.98564736629 * (jd_ut - 2451545.0) + 0.000387933 * T * T - lng;
  const lstRad = (lst % 360) * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const obliquity = (23.439 - 0.00000036 * T) * Math.PI / 180;

  // Ascendant
  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(lstRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity))
  );
  const ascendant = ((ascRad * 180 / Math.PI) + 360) % 360;

  // Midheaven
  const mcRad = Math.atan2(Math.sin(lstRad) * Math.cos(obliquity), -Math.sin(obliquity));
  const midheaven = ((mcRad * 180 / Math.PI) + 360) % 360;

  // Calculate house cusps (simplified Placidus)
  const houses: number[] = [];
  houses[0] = ascendant;
  houses[9] = midheaven;
  houses[3] = (ascendant + 180) % 360;
  houses[6] = (midheaven + 180) % 360;

  // Calculate intermediate houses using a simplified formula
  // This is an approximation - proper Placidus requires iterative calculation
  for (let i = 1; i < 12; i++) {
    if (i === 3 || i === 6 || i === 9) continue;
    houses[i] = (houses[0] + i * 30) % 360;
  }

  return { houses: houses.slice(0, 12), ascendant, midheaven };
}

// ─── Full Chart Data ─────────────────────────────────────────────────────────

export function getChartData(birthDate: string, birthTime: string, lat: number, lng: number): ChartData {
  const { year, month, day, hour } = parseBirthDateTime(birthDate, birthTime);
  const jd = getJulianDay(year, month, day, hour);
  const jd_ut = jd; // UT
  const jd_et = jd + 1 / 86400; // TT/ET

  const planets = getPlanetaryPositions(birthDate, birthTime, lat, lng);
  const houses = getHouses(jd_ut, lat, lng);

  return { planets, houses, julianDay: jd_ut };
}

// ─── Composite / Davison Chart Helpers ─────────────────────────────────────────

function normalizeLongitude(lon: number): number {
  return ((lon % 360) + 360) % 360;
}

function computeMidpoint(pos1: number, pos2: number): number {
  let diff = pos2 - pos1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return normalizeLongitude(pos1 + diff / 2);
}

function computeCompositePlanet(pos1: number, pos2: number): number {
  const p1 = pos1 % 360;
  const p2 = pos2 % 360;
  let diff = p2 - p1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return normalizeLongitude(p1 + diff / 2);
}

function computeDavisonPlanet(pos1: number, pos2: number, jd1: number, jd2: number): number {
  const midJd = (jd1 + jd2) / 2;
  const w1 = Math.abs(midJd - jd2);
  const w2 = Math.abs(jd1 - midJd);
  const total = w1 + w2;
  if (total === 0) return computeCompositePlanet(pos1, pos2);
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

export function computeCompositeChart(
  person1: { birthDate: string; birthTime: string; lat: number; lng: number },
  person2: { birthDate: string; birthTime: string; lat: number; lng: number }
): CompositeChartData {
  const chart1 = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
  const chart2 = getChartData(person2.birthDate, person2.birthTime, person2.lat, person2.lng);

  const compositePlanets: PlanetPosition[] = chart1.planets.map(p1 => {
    const p2 = chart2.planets.find(p => p.name === p1.name) ?? p1;
    return buildCompositePlanet(p1.name, p1.longitude, p2.longitude);
  });

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

export function computeMidpointStructures(
  compositePlanets: PlanetPosition[],
  chart1Planets: PlanetPosition[],
  chart2Planets: PlanetPosition[]
): MidpointStructure[] {
  const structures: MidpointStructure[] = [];
  const allPlanets = [...chart1Planets, ...chart2Planets];
  const midpointsToCheck: Array<{ lon: number; p1: string; p2: string }> = [];

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
        if (orb <= 3) {
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
  if (Math.abs(targetAngle - 150) <= 3) return 'Yod';
  if (targetAngle === 0 || targetAngle === 180) return 'Castle';
  return null;
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

  let totalScore = 50;

  for (const asp of aspects) {
    const weight = asp.type === 'Conjunction' ? 15
      : asp.type === 'Trine' ? 12
      : asp.type === 'Square' ? 10
      : asp.type === 'Sextile' ? 8
      : 10;

    const contribution = (asp.strength / 100) * weight * asp.polarityScore;
    totalScore += contribution;
  }

  const conjunctCount = aspects.filter(a => a.type === 'Conjunction').length;
  const trineCount = aspects.filter(a => a.type === 'Trine').length;
  const squareCount = aspects.filter(a => a.type === 'Square').length;
  const oppositionCount = aspects.filter(a => a.type === 'Opposition').length;
  const sextileCount = aspects.filter(a => a.type === 'Sextile').length;

  totalScore += Math.min(trineCount, 3) * 2;
  totalScore += Math.min(sextileCount, 3) * 1;
  totalScore -= Math.max(0, squareCount - 2) * 1;
  totalScore -= Math.max(0, oppositionCount - 1) * 1;

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
