/**
 * Transit Engine - Secondary Progressions & Direct/Retrograde Motion
 * TianJi Global | 天机全球
 *
 * Implements Secondary Progressions: 1 day = 1 year
 * Calculates planetary velocities and motion status.
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
  name: string;
  longitude: number;    // 0-360 degrees
  latitude: number;      // ecliptic latitude
  sign: number;          // 0-11 (Aries=0)
  signName: string;
  signSymbol: string;
  degree: number;        // degree within sign (0-29.999)
  orb: number;           // distance in AU
  speed: number;          // daily motion in degrees
  isRetrograde: boolean;  // true if negative speed
  natalLongitude?: number;
  progressedLongitude?: number;
  motion?: 'direct' | 'retrograde' | 'station';
}

export interface TransitPlanet extends PlanetPosition {
  natalLongitude: number;  // position at birth
  progressedLongitude: number;  // position at target date (progressed)
  motion: 'direct' | 'retrograde' | 'station';
}

export interface TransitResult {
  birthDate: string;
  targetDate: string;
  age: number;                    // age in years (decimal)
  progressedDays: number;         // days after birth used for progression
  planets: TransitPlanet[];
  julianDay: number;
  interpretation: string;
}

// ─── Zodiac Data ─────────────────────────────────────────────────────────────

const ZODIAC_SIGNS = [
  { name: 'Aries',     nameZh: '白羊', symbol: '♈' },
  { name: 'Taurus',    nameZh: '金牛', symbol: '♉' },
  { name: 'Gemini',    nameZh: '双子', symbol: '♊' },
  { name: 'Cancer',    nameZh: '巨蟹', symbol: '♋' },
  { name: 'Leo',       nameZh: '狮子', symbol: '♌' },
  { name: 'Virgo',     nameZh: '处女', symbol: '♍' },
  { name: 'Libra',     nameZh: '天秤', symbol: '♎' },
  { name: 'Scorpio',   nameZh: '天蝎', symbol: '♏' },
  { name: 'Sagittarius',nameZh: '射手', symbol: '♐' },
  { name: 'Capricorn', nameZh: '摩羯', symbol: '♑' },
  { name: 'Aquarius',  nameZh: '水瓶', symbol: '♒' },
  { name: 'Pisces',    nameZh: '双鱼', symbol: '♓' },
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

const PLANET_DATA: Record<string, { getPosition: (jd: number) => { lon: number; lat: number; distance: number } }> = {
  Sun:     { getPosition: (jd) => { const p = earth.position(jd); return { lon: (p.lon + Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Mercury: { getPosition: (jd) => { const p = mercury.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Venus:   { getPosition: (jd) => { const p = venus.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Mars:    { getPosition: (jd) => { const p = mars.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Jupiter: { getPosition: (jd) => { const p = jupiter.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Saturn:  { getPosition: (jd) => { const p = saturn.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Uranus:  { getPosition: (jd) => { const p = uranus.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
  Neptune: { getPosition: (jd) => { const p = neptune.position(jd); const e = earth.position(jd); return { lon: (p.lon - e.lon + 2*Math.PI) % (2 * Math.PI), lat: p.lat, distance: p.distance } } },
}

const PLANET_NAMES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

// ─── Date Parsing ────────────────────────────────────────────────────────────

function parseDateTime(dateStr: string, timeStr: string): { year: number; month: number; day: number; hour: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [h, m] = timeStr.split(':').map(Number);
  const hour = h + m / 60;
  return { year, month, day, hour };
}

function getJulianDay(year: number, month: number, day: number, hour: number): number {
  return CalendarGregorianToJD(year, month, day + hour / 24);
}

function addDays(dateStr: string, days: number): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const baseDate = new Date(y, m - 1, d);
  baseDate.setDate(baseDate.getDate() + Math.floor(days));
  return { year: baseDate.getFullYear(), month: baseDate.getMonth() + 1, day: baseDate.getDate() };
}

// ─── Sign Calculation ────────────────────────────────────────────────────────

function radToDeg(rad: number): number {
  return (rad * 180 / Math.PI + 360) % 360;
}

function getSign(longitude: number): { sign: number; signName: string; signSymbol: string; degree: number } {
  const sign = Math.floor(longitude / 30) % 12;
  const degree = longitude % 30;
  const s = ZODIAC_SIGNS[sign];
  return { sign, signName: s.name, signSymbol: s.symbol, degree };
}

// ─── Planetary Position with Speed ──────────────────────────────────────────

function getPlanetPosition(jd: number, name: string): PlanetPosition {
  const jdEt = jd + 1 / 86400; // TT = UT + 1 day
  
  let lon: number, lat: number, dist: number, speed: number;

  if (name === 'Sun') {
    const p = earth.position(jdEt);
    lon = radToDeg((p.lon + Math.PI) % (2 * Math.PI));
    lat = radToDeg(p.lat);
    dist = p.distance;
    speed = 0.9856; // approximate
  } else if (name === 'Moon') {
    const p = moonPosition(jdEt);
    lon = radToDeg(p.lon);
    lat = radToDeg(p.lat);
    dist = p.distance;
    speed = 13.176; // approximate degrees per day
  } else {
    const pd = PLANET_DATA[name];
    if (!pd) return { name, longitude: 0, latitude: 0, sign: 0, signName: 'Aries', signSymbol: '♈', degree: 0, orb: 1, speed: 0, isRetrograde: false, natalLongitude: 0, progressedLongitude: 0, motion: 'direct' };
    
    const p = pd.getPosition(jdEt);
    lon = radToDeg(p.lon);
    lat = radToDeg(p.lat);
    dist = p.distance;
    
    // Calculate approximate speed (degrees per day)
    const p1 = pd.getPosition(jdEt - 1);
    const p2 = pd.getPosition(jdEt);
    const lonDiff1 = (p2.lon - p1.lon + 2*Math.PI) % (2*Math.PI);
    const lonDiff2 = (p1.lon - p2.lon + 2*Math.PI) % (2*Math.PI);
    speed = radToDeg(Math.min(lonDiff1, lonDiff2));
  }

  const { sign, signName, signSymbol, degree } = getSign(lon);
  const isRetrograde = speed < 0;

  return {
    name,
    longitude: lon,
    latitude: lat,
    sign,
    signName,
    signSymbol,
    degree,
    orb: dist,
    speed: Math.abs(speed),
    isRetrograde,
    natalLongitude: lon,
    progressedLongitude: lon,
    motion: 'direct',
  };
}

// ─── Secondary Progressions Core ────────────────────────────────────────────

export function computeSecondaryProgression(
  birthDate: string,
  birthTime: string,
  targetDate: string
): TransitResult {
  const birth = parseDateTime(birthDate, birthTime);
  const target = parseDateTime(targetDate, '12:00');

  const birthJD = getJulianDay(birth.year, birth.month, birth.day, birth.hour);
  const targetJD = getJulianDay(target.year, target.month, target.day, target.hour);
  const daysDiff = targetJD - birthJD;
  const age = daysDiff / 365.25;

  const progressedDays = Math.round(age * 365.25);
  const progressedDate = addDays(birthDate, progressedDays);

  const natalPositions: Record<string, PlanetPosition> = {};
  for (const name of PLANET_NAMES) {
    natalPositions[name] = getPlanetPosition(birthJD, name);
  }

  const progressedJD = getJulianDay(progressedDate.year, progressedDate.month, progressedDate.day, birth.hour);

  const planets: TransitPlanet[] = [];

  for (const name of PLANET_NAMES) {
    const natal = natalPositions[name];
    const progressed = getPlanetPosition(progressedJD, name);

    let motion: 'direct' | 'retrograde' | 'station';
    if (Math.abs(progressed.speed) < 0.01) {
      motion = 'station';
    } else if (progressed.isRetrograde) {
      motion = 'retrograde';
    } else {
      motion = 'direct';
    }

    planets.push({
      ...progressed,
      natalLongitude: natal.longitude,
      progressedLongitude: progressed.longitude,
      motion,
    });
  }

  const interpretation = generateInterpretation(planets, age);

  return {
    birthDate,
    targetDate,
    age: Math.round(age * 100) / 100,
    progressedDays,
    planets,
    julianDay: progressedJD,
    interpretation,
  };
}

// ─── Direct/Retrograde Analysis ─────────────────────────────────────────────

export interface MotionAnalysis {
  planet: string;
  currentMotion: 'direct' | 'retrograde' | 'station';
  speed: number;        // degrees per day
  status: string;       // descriptive status
}

export function analyzePlanetaryMotion(date: string, time: string): MotionAnalysis[] {
  const { year, month, day, hour } = parseDateTime(date, time);
  const jd = getJulianDay(year, month, day, hour);

  const analyses: MotionAnalysis[] = [];

  for (const name of PLANET_NAMES) {
    const planet = getPlanetPosition(jd, name);
    
    let motion: 'direct' | 'retrograde' | 'station' = 'direct';
    let status: string;

    if (Math.abs(planet.speed) < 0.01) {
      motion = 'station';
      status = name === 'Mercury' || name === 'Venus'
        ? 'Stationary (pre-retrograde/post-retrograde)'
        : 'Stationary';
    } else if (planet.isRetrograde) {
      motion = 'retrograde';
      status = `${name} is retrograde`;
    } else {
      motion = 'direct';
      status = `${name} is direct`;
    }

    analyses.push({ planet: name, currentMotion: motion, speed: planet.speed, status });
  }

  return analyses;
}

// ─── Interpretation Generator ────────────────────────────────────────────────

function generateInterpretation(planets: TransitPlanet[], age: number): string {
  const directPlanets = planets.filter(p => p.motion === 'direct');
  const retrogradePlanets = planets.filter(p => p.motion === 'retrograde');
  const stationPlanets = planets.filter(p => p.motion === 'station');

  let interpretation = `Secondary Progressions for age ${age.toFixed(1)}:\n\n`;

  interpretation += `Current planetary motion:\n`;
  interpretation += `- Direct: ${directPlanets.map(p => p.name).join(', ') || 'none'}\n`;
  interpretation += `- Retrograde: ${retrogradePlanets.map(p => p.name).join(', ') || 'none'}\n`;
  interpretation += `- Station: ${stationPlanets.map(p => p.name).join(', ') || 'none'}\n\n`;

  if (retrogradePlanets.length > 0) {
    interpretation += `Retrograde planets indicate internalization and review periods. `;
    const majorRetrogrades = retrogradePlanets.filter(p =>
      ['Mars', 'Jupiter', 'Saturn'].includes(p.name)
    );
    if (majorRetrogrades.length > 0) {
      interpretation += `${majorRetrogrades.map(p => p.name).join(' and ')} retrograde may signal a time of reassessment in ${majorRetrogrades[0].signName.toLowerCase()} energy.\n`;
    }
  }

  const sunProgressed = planets.find(p => p.name === 'Sun');
  if (sunProgressed) {
    interpretation += `\nProgressed Sun in ${sunProgressed.signName} ${sunProgressed.degree.toFixed(1)}° - `;
    interpretation += `representing the core self-expression at this stage of life.\n`;
  }

  const moonProgressed = planets.find(p => p.name === 'Moon');
  if (moonProgressed) {
    interpretation += `Progressed Moon in ${moonProgressed.signName} ${moonProgressed.degree.toFixed(1)}° - `;
    interpretation += `reflecting emotional development and inner life.\n`;
  }

  return interpretation;
}

// ─── Full Transit Report ──────────────────────────────────────────────────────

export interface TransitReport {
  progression: TransitResult;
  motionAnalysis: MotionAnalysis[];
  majorTransits: string[];
}

export function generateTransitReport(
  birthDate: string,
  birthTime: string,
  lat: number,
  lng: number,
  targetDate: string
): TransitReport {
  const progression = computeSecondaryProgression(birthDate, birthTime, targetDate);
  const motionAnalysis = analyzePlanetaryMotion(targetDate, '12:00');

  const majorTransits: string[] = [];

  const retrogradePlanets = progression.planets.filter(p => p.motion === 'retrograde');
  if (retrogradePlanets.length > 0) {
    majorTransits.push(`${retrogradePlanets.length} planets are retrograde in the progressed chart`);
  }

  for (const planet of progression.planets) {
    const natal = progression.planets.find(p => p.name === planet.name);
    if (natal) {
      const diff = Math.abs(planet.progressedLongitude - natal.natalLongitude);
      const orb = diff > 180 ? 360 - diff : diff;
      if (orb < 1) {
        majorTransits.push(`Progressed ${planet.name} is conjunct natal ${planet.name} (${orb.toFixed(2)}°)`);
      }
    }
  }

  return {
    progression,
    motionAnalysis,
    majorTransits,
  };
}

export { ZODIAC_SIGNS };
