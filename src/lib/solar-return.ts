/**
 * Solar Return Engine - 太阳返照计算
 * TianJi Global | 天机全球
 *
 * Calculates the precise moment when the Sun returns to its birth longitude,
 * which marks the Solar Return - the beginning of a new solar year.
 */

import { utc_to_jd, calc, houses_ex2, constants, set_ephe_path } from 'sweph';

// Set ephemeris path to sweph's bundled data
set_ephe_path('');

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  sign: number;
  signName: string;
  signSymbol: string;
  degree: number;
  orb: number;
}

export interface HousePlacements {
  houses: number[];
  ascendant: number;
  midheaven: number;
}

export interface ChartData {
  planets: PlanetPosition[];
  houses: HousePlacements;
  julianDay: number;
}

export interface SolarReturnResult {
  birthDate: string;
  birthTime: string;
  targetYear: number;
  birthSunLongitude: number;
  birthdayExactTime: string;  // ISO datetime of exact Solar Return
  birthdayExactJulianDay: number;
  chart: ChartData;
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

// ─── Date Parsing ─────────────────────────────────────────────────────────────

function parseBirthDateTime(birthDate: string, birthTime: string): { year: number; month: number; day: number; hour: number; min: number } {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [h, m] = birthTime.split(':').map(Number);
  const hour = h + m / 60;
  return { year, month, day, hour, min: m };
}

function getJulianDay(year: number, month: number, day: number, hour: number): number {
  const result = utc_to_jd(year, month, day, hour, 0, 0, constants.SE_GREG_CAL);
  if (result.flag !== constants.OK) throw new Error(result.error ?? 'Julian day conversion failed');
  return result.data[0];
}

function julianDayToDateTime(jd: number): { year: number; month: number; day: number; hour: number } {
  // Convert Julian Day back to calendar date
  // Using the inverse of utc_to_jd calculation
  const z = Math.floor(jd + 0.5);
  const f = (jd + 0.5) - z;
  let a: number;
  
  if (z < 2299161) {
    a = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);
  
  const day = b - d - Math.floor(30.6001 * e);
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;
  
  // Calculate hour from fractional day
  const hourDecimal = f * 24;
  const h = Math.floor(hourDecimal);
  const mDecimal = (hourDecimal - h) * 60;
  const minute = Math.floor(mDecimal);
  
  return { year, month, day, hour: h + minute / 60 };
}

function formatDateTimeISO(dt: { year: number; month: number; day: number; hour: number }): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const h = Math.floor(dt.hour);
  const m = Math.round((dt.hour - h) * 60);
  return `${dt.year}-${pad(dt.month)}-${pad(dt.day)}T${pad(h)}:${pad(m)}:00`;
}

// ─── Sign Calculation ─────────────────────────────────────────────────────────

function getSign(longitude: number): { sign: number; signName: string; signSymbol: string; degree: number } {
  const sign = Math.floor(longitude / 30) % 12;
  const degree = longitude % 30;
  const s = ZODIAC_SIGNS[sign];
  return { sign, signName: s.name, signSymbol: s.symbol, degree };
}

// ─── Sun Position ─────────────────────────────────────────────────────────────

function getSunLongitude(jd_et: number): number {
  const result = calc(jd_et, constants.SE_SUN, constants.SEFLG_SWIEPH | constants.SEFLG_SPEED);
  if (result.flag < 0) {
    const fallback = calc(jd_et, constants.SE_SUN, constants.SEFLG_SWIEPH);
    if (fallback.flag < 0) throw new Error('Failed to calculate Sun position');
    return (fallback.data[0] as number) % 360;
  }
  return (result.data[0] as number) % 360;
}

// ─── Planetary Positions ──────────────────────────────────────────────────────

function getPlanetaryPositions(jd_et: number): PlanetPosition[] {
  const flags = constants.SEFLG_SWIEPH | constants.SEFLG_SPEED;
  const planets: PlanetPosition[] = [];

  for (const [name, id] of Object.entries(PLANET_IDS)) {
    const result = calc(jd_et, id, flags);
    
    if (result.flag < 0) {
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

// ─── House Placements ────────────────────────────────────────────────────────

function getHouses(jd_ut: number, lat: number, lng: number): HousePlacements {
  const hResult = houses_ex2(jd_ut, 0, lat, lng, 'P') as { flag: number; error: string; data: { houses: number[] } };
  if (hResult.flag !== constants.OK) throw new Error(hResult.error ?? 'House calculation failed');

  const houses = hResult.data.houses.map(h => ((h % 360) + 360) % 360);
  const ascendant = houses[0];
  const midheaven = houses[9] ?? houses[1];

  return { houses, ascendant, midheaven };
}

// ─── Solar Return Core Calculation ──────────────────────────────────────────

/**
 * Find the exact moment of Solar Return using binary search
 * The Solar Return occurs when the Sun returns to its birth longitude
 */
function findSolarReturnExactTime(
  birthDate: string,
  birthTime: string,
  targetYear: number,
  birthSunLongitude: number
): { jd: number; datetime: string } {
  // Parse birth info
  const birth = parseBirthDateTime(birthDate, birthTime);
  
  // Get birthday for target year (same month/day)
  // Solar Return typically occurs around the birthday
  const birthdayThisYear: { year: number; month: number; day: number; hour: number } = {
    year: targetYear,
    month: birth.month,
    day: birth.day,
    hour: birth.hour + birth.min / 60,
  };
  
  // Get Julian Day for noon on birthday
  const jd_birthday = getJulianDay(birthdayThisYear.year, birthdayThisYear.month, birthdayThisYear.day, 12);
  
  // Get Sun longitude at noon on birthday
  const sunAtNoon = getSunLongitude(jd_birthday);
  
  // Calculate the difference - we need to find when Sun = birthSunLongitude
  // Sun moves approximately 1 degree per day
  // If Sun at noon is past birth longitude, SR was earlier that day
  // If Sun at noon is before birth longitude, SR will be later
  
  // Calculate approximate days difference
  let diff = birthSunLongitude - sunAtNoon;
  
  // Normalize difference to -180 to 180 range
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  
  // Convert degrees difference to days (approximately 1 day per degree for the Sun)
  // But we need more precision - Sun moves about 1 degree per day
  // So we search within a window of about 2 days around the birthday
  
  // Start with a search window of +/- 2 days from noon
  const searchWindowDays = 2;
  const dayFraction = 1 / 24; // 1 hour steps for initial search
  
  // Binary search for exact Solar Return time
  // Start with jd_birthday and search forward/backward
  let jd_start = jd_birthday - searchWindowDays;
  let jd_end = jd_birthday + searchWindowDays;
  
  // First, do a coarse search to find the crossing point
  let prevSunLon = getSunLongitude(jd_start);
  let crossingFound = false;
  
  for (let jd = jd_start + dayFraction; jd <= jd_end; jd += dayFraction) {
    const currentSunLon = getSunLongitude(jd);
    
    // Check if we crossed the birth longitude
    // Handle wrap-around at 0 degrees
    const prevDiff = normalizeDiff(prevSunLon, birthSunLongitude);
    const currDiff = normalizeDiff(currentSunLon, birthSunLongitude);
    
    // Check for zero crossing (sign change in difference)
    if (prevDiff * currDiff < 0 || Math.abs(currDiff) < 0.01) {
      // Found the crossing - use binary search to find exact time
      let lo = jd - dayFraction;
      let hi = jd;
      
      for (let i = 0; i < 20; i++) { // 20 iterations for precision
        const mid = (lo + hi) / 2;
        const midSunLon = getSunLongitude(mid);
        const midDiff = normalizeDiff(midSunLon, birthSunLongitude);
        
        if (Math.abs(midDiff) < 0.0001) {
          // Found exact match
          const dt = julianDayToDateTime(mid);
          return { jd: mid, datetime: formatDateTimeISO(dt) };
        }
        
        if (midDiff * prevDiff < 0) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      
      // If we didn't find exact match, return the midpoint
      const finalJd = (lo + hi) / 2;
      const dt = julianDayToDateTime(finalJd);
      crossingFound = true;
      return { jd: finalJd, datetime: formatDateTimeISO(dt) };
    }
    
    prevSunLon = currentSunLon;
  }
  
  // If no crossing found in the window, use the birthday noon as approximation
  // This can happen near the solstices or equinoxes where Sun speed changes
  const dt = julianDayToDateTime(jd_birthday);
  return { jd: jd_birthday, datetime: formatDateTimeISO(dt) };
}

function normalizeDiff(currentSunLon: number, targetLon: number): number {
  let diff = currentSunLon - targetLon;
  // Normalize to -180 to 180
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

// ─── Main Solar Return Function ─────────────────────────────────────────────

/**
 * Calculate Solar Return for a given birth date and target year
 * 
 * @param birthDate - Birth date in YYYY-MM-DD format
 * @param birthTime - Birth time in HH:MM format
 * @param lat - Birth latitude
 * @param lng - Birth longitude
 * @param targetYear - The year for which to calculate Solar Return
 * @returns SolarReturnResult with exact timing and full chart data
 */
export function calculateSolarReturn(
  birthDate: string,
  birthTime: string,
  lat: number,
  lng: number,
  targetYear: number
): SolarReturnResult {
  // Step 1: Get birth Sun longitude
  const birth = parseBirthDateTime(birthDate, birthTime);
  const birthJD = getJulianDay(birth.year, birth.month, birth.day, birth.hour);
  const birthSunLongitude = getSunLongitude(birthJD);
  
  // Step 2: Find exact Solar Return time for target year
  const { jd, datetime } = findSolarReturnExactTime(birthDate, birthTime, targetYear, birthSunLongitude);
  
  // Step 3: Calculate full chart for Solar Return moment
  // For houses, we need jd_ut
  const jdResult = utc_to_jd(
    julianDayToDateTime(jd).year,
    julianDayToDateTime(jd).month,
    julianDayToDateTime(jd).day,
    julianDayToDateTime(jd).hour,
    0, 0, constants.SE_GREG_CAL
  );
  const jd_ut = jdResult.data[1];
  const jd_et = jdResult.data[0];
  
  const planets = getPlanetaryPositions(jd_et);
  const houses = getHouses(jd_ut, lat, lng);
  
  // Step 4: Generate interpretation
  const interpretation = generateSolarReturnInterpretation(planets, birthSunLongitude, targetYear);
  
  return {
    birthDate,
    birthTime,
    targetYear,
    birthSunLongitude,
    birthdayExactTime: datetime,
    birthdayExactJulianDay: jd,
    chart: { planets, houses, julianDay: jd_ut },
    interpretation,
  };
}

// ─── Interpretation Generator ────────────────────────────────────────────────

function generateSolarReturnInterpretation(planets: PlanetPosition[], birthSunLongitude: number, targetYear: number): string {
  const sun = planets.find(p => p.name === 'Sun');
  
  let interpretation = `Solar Return for ${targetYear}\n\n`;
  
  if (sun) {
    interpretation += `Sun is at ${sun.signSymbol} ${sun.signName} ${sun.degree.toFixed(1)}°\n`;
    interpretation += `This is your Solar Return chart - the chart active for this year of your life.\n`;
  }
  
  // Find planets near the Ascendant (within 5 degrees)
  const ascendant = planets.find(p => p.name === 'Sun'); // We use Sun as reference
  if (ascendant) {
    interpretation += `\nKey positions:\n`;
    interpretation += `- Sun (identity): ${sun?.signSymbol} ${sun?.signName} ${sun?.degree.toFixed(1)}°\n`;
  }
  
  return interpretation;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { ZODIAC_SIGNS };
