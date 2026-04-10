/**
 * Transit Engine - Secondary Progressions & Direct/Retrograde Motion
 * TianJi Global | 天机全球
 *
 * Implements Secondary Progressions: 1 day = 1 year
 * Calculates planetary velocities and motion status.
 */

import { utc_to_jd, calc, constants, set_ephe_path } from 'sweph';

// Set ephemeris path to sweph's bundled data
set_ephe_path('');

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
  speed: number;         // daily motion in degrees
  isRetrograde: boolean; // true if negative speed
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

// ─── Date Parsing ────────────────────────────────────────────────────────────

function parseDateTime(dateStr: string, timeStr: string): { year: number; month: number; day: number; hour: number } {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [h, m] = timeStr.split(':').map(Number);
  const hour = h + m / 60;
  return { year, month, day, hour };
}

function getJulianDay(year: number, month: number, day: number, hour: number): number {
  const result = utc_to_jd(year, month, day, hour, 0, 0, constants.SE_GREG_CAL);
  if (result.flag !== constants.OK) throw new Error(result.error ?? 'Julian day conversion failed');
  return result.data[0];
}

function addDays(dateStr: string, days: number): { year: number; month: number; day: number } {
  // Simple day addition - for Secondary Progressions we add days to birth date
  // to get the "progressed date" where 1 day = 1 year
  const [y, m, d] = dateStr.split('-').map(Number);
  const baseDate = new Date(y, m - 1, d);
  baseDate.setDate(baseDate.getDate() + Math.floor(days));
  return { year: baseDate.getFullYear(), month: baseDate.getMonth() + 1, day: baseDate.getDate() };
}

// ─── Sign Calculation ────────────────────────────────────────────────────────

function getSign(longitude: number): { sign: number; signName: string; signSymbol: string; degree: number } {
  const sign = Math.floor(longitude / 30) % 12;
  const degree = longitude % 30;
  const s = ZODIAC_SIGNS[sign];
  return { sign, signName: s.name, signSymbol: s.symbol, degree };
}

// ─── Planetary Position with Speed ──────────────────────────────────────────

function getPlanetPosition(jd_et: number, name: string, id: number): PlanetPosition {
  const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;

  const result = calc(jd_et, id, flags);

  let lon: number, lat: number, dist: number, speed: number;

  if (result.flag < 0) {
    // Fallback: try without speed flag
    const fallback = calc(jd_et, id, constants.SEFLG_SWIEPH);
    if (fallback.flag < 0) {
      throw new Error(`Failed to calculate position for ${name}`);
    }
    lon = fallback.data[0] as number;
    lat = fallback.data[1] as number;
    dist = fallback.data[2] as number;
    speed = 0; // unknown
  } else {
    lon = result.data[0] as number;
    lat = result.data[1] as number;
    dist = result.data[2] as number;
    // Speed is returned as data[3] when SEFLG_SPEED is set
    speed = result.data[3] as number ?? 0;
  }

  const { sign, signName, signSymbol, degree } = getSign(lon % 360);
  const isRetrograde = speed < 0;

  return {
    name,
    longitude: lon % 360,
    latitude: lat,
    sign,
    signName,
    signSymbol,
    degree,
    orb: dist,
    speed: Math.abs(speed),
    isRetrograde,
  };
}

// ─── Secondary Progressions Core ────────────────────────────────────────────

/**
 * Calculate Secondary Progressions
 * Rule: 1 day after birth = 1 year of life
 * So for a target age X, we look at planetary positions X days after birth
 */
export function computeSecondaryProgression(
  birthDate: string,
  birthTime: string,
  targetDate: string
): TransitResult {
  // Parse dates
  const birth = parseDateTime(birthDate, birthTime);
  const target = parseDateTime(targetDate, '12:00'); // noon for target date

  // Calculate age in years
  const birthJD = getJulianDay(birth.year, birth.month, birth.day, birth.hour);
  const targetJD = getJulianDay(target.year, target.month, target.day, target.hour);
  const daysDiff = targetJD - birthJD;
  const age = daysDiff / 365.25; // approximate years

  // Progressed days = age in years (1 day = 1 year)
  const progressedDays = Math.round(age * 365.25);

  // Get the "progressed date" - birth date + progressedDays
  const progressedDate = addDays(birthDate, progressedDays);

  // Calculate natal positions (at birth)
  const natalPositions: Record<string, PlanetPosition> = {};
  for (const [name, id] of Object.entries(PLANET_IDS)) {
    natalPositions[name] = getPlanetPosition(birthJD, name, id);
  }

  // Calculate progressed positions (at progressed date)
  const progressedJD = getJulianDay(progressedDate.year, progressedDate.month, progressedDate.day, birth.hour);

  const planets: TransitPlanet[] = [];

  for (const [name, id] of Object.entries(PLANET_IDS)) {
    const natal = natalPositions[name];
    const progressed = getPlanetPosition(progressedJD, name, id);

    // Determine motion status
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

  // Generate interpretation
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

/**
 * Analyze current planetary motion (direct/retrograde) for a specific date
 */
export function analyzePlanetaryMotion(date: string, time: string): MotionAnalysis[] {
  const { year, month, day, hour } = parseDateTime(date, time);
  const jd = getJulianDay(year, month, day, hour);

  const analyses: MotionAnalysis[] = [];

  for (const [name, id] of Object.entries(PLANET_IDS)) {
    const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
    const result = calc(jd, id, flags);

    if (result.flag < 0) continue;

    const speed = (result.data[3] as number | undefined) ?? 0;
    const isRetrograde = !isNaN(speed) && speed < 0;

    let motion: 'direct' | 'retrograde' | 'station' = 'direct';
    let status: string;

    if (isNaN(speed) || Math.abs(speed) < 0.01) {
      motion = 'station';
      status = name === 'Mercury' || name === 'Venus'
        ? 'Stationary (pre-retrograde/post-retrograde)'
        : 'Stationary';
    } else if (isRetrograde) {
      motion = 'retrograde';
      status = `${name} is retrograde`;
    } else {
      motion = 'direct';
      status = `${name} is direct`;
    }

    analyses.push({ planet: name, currentMotion: motion, speed: Math.abs(speed), status });
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

  // Sun progressed
  const sunProgressed = planets.find(p => p.name === 'Sun');
  if (sunProgressed) {
    interpretation += `\nProgressed Sun in ${sunProgressed.signName} ${sunProgressed.degree.toFixed(1)}° - `;
    interpretation += `representing the core self-expression at this stage of life.\n`;
  }

  // Moon progressed
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

/**
 * Generate a comprehensive transit report
 */
export function generateTransitReport(
  birthDate: string,
  birthTime: string,
  lat: number,
  lng: number,
  targetDate: string
): TransitReport {
  // For Secondary Progressions, we don't need lat/lng for planets
  // but they're kept for API compatibility
  const progression = computeSecondaryProgression(birthDate, birthTime, targetDate);
  const motionAnalysis = analyzePlanetaryMotion(targetDate, '12:00');

  // Generate major transits description
  const majorTransits: string[] = [];

  const retrogradePlanets = progression.planets.filter(p => p.motion === 'retrograde');
  if (retrogradePlanets.length > 0) {
    majorTransits.push(`${retrogradePlanets.length} planets are retrograde in the progressed chart`);
  }

  // Check for conjunctions to natal
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
