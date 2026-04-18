/**
 * Solar Return Engine - 太阳返照计算
 * TianJi Global | 天机全球
 *
 * Calculates the precise moment when the Sun returns to its birth longitude,
 * which marks the Solar Return - the beginning of a new solar year.
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

const PLANET_NAMES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

// ─── Date Parsing ─────────────────────────────────────────────────────────────

function parseBirthDateTime(birthDate: string, birthTime: string): { year: number; month: number; day: number; hour: number; min: number } {
  const [year, month, day] = birthDate.split('-').map(Number);
  const [h, m] = birthTime.split(':').map(Number);
  const hour = h + m / 60;
  return { year, month, day, hour, min: m };
}

function getJulianDay(year: number, month: number, day: number, hour: number): number {
  return CalendarGregorianToJD(year, month, day + hour / 24);
}

function julianDayToDateTime(jd: number): { year: number; month: number; day: number; hour: number } {
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

function radToDeg(rad: number): number {
  return (rad * 180 / Math.PI + 360) % 360;
}

function getApproxPlutoPosition(jd: number): { lon: number; lat: number; distance: number } {
  const daysSinceJ2000 = jd - 2451545.0;
  const meanMotion = 360 / (247.94 * 365.25);
  const lonDeg = ((250 + daysSinceJ2000 * meanMotion) % 360 + 360) % 360;
  const latDeg = Math.sin((daysSinceJ2000 / (365.25 * 40)) * Math.PI * 2) * 3;
  return {
    lon: (lonDeg * Math.PI) / 180,
    lat: (latDeg * Math.PI) / 180,
    distance: 39.5,
  };
}

function getSign(longitude: number): { sign: number; signName: string; signSymbol: string; degree: number } {
  const sign = Math.floor(longitude / 30) % 12;
  const degree = longitude % 30;
  const s = ZODIAC_SIGNS[sign];
  return { sign, signName: s.name, signSymbol: s.symbol, degree };
}

// ─── Sun Position ─────────────────────────────────────────────────────────────

function getSunLongitude(jd: number): number {
  const jdEt = jd + 1 / 86400;
  const p = earth.position(jdEt);
  return radToDeg((p.lon + Math.PI) % (2 * Math.PI));
}

// ─── Planetary Positions ──────────────────────────────────────────────────────

function getPlanetaryPositions(jd: number): PlanetPosition[] {
  const jdEt = jd + 1 / 86400;
  const planets: PlanetPosition[] = [];

  // Sun
  const sunPos = earth.position(jdEt);
  const sunLon = radToDeg((sunPos.lon + Math.PI) % (2 * Math.PI));
  const { sign: sunSign, signName: sunSignName, signSymbol: sunSignSymbol, degree: sunDegree } = getSign(sunLon);
  planets.push({ name: 'Sun', longitude: sunLon, latitude: radToDeg(sunPos.lat), sign: sunSign, signName: sunSignName, signSymbol: sunSignSymbol, degree: sunDegree, orb: sunPos.distance });

  // Moon
  const moon = moonPosition(jdEt);
  const moonLon = radToDeg(moon.lon);
  const { sign: moonSign, signName: moonSignName, signSymbol: moonSignSymbol, degree: moonDegree } = getSign(moonLon);
  planets.push({ name: 'Moon', longitude: moonLon, latitude: radToDeg(moon.lat), sign: moonSign, signName: moonSignName, signSymbol: moonSignSymbol, degree: moonDegree, orb: moon.distance });

  // Other planets
  for (const name of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune']) {
    const p = PLANET_DATA[name]?.getPosition(jdEt);
    if (!p) continue;
    const lon = radToDeg(p.lon);
    const { sign, signName, signSymbol, degree } = getSign(lon);
    planets.push({ name, longitude: lon, latitude: radToDeg(p.lat), sign, signName, signSymbol, degree, orb: p.distance });
  }

  return planets;
}

// ─── House Placements ────────────────────────────────────────────────────────

function getHouses(jd: number, lat: number, lng: number): HousePlacements {
  // Simplified house calculation
  const T = (jd - 2451545.0) / 36525;
  const lst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  const lstRad = ((lst - lng) % 360) * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const obliquity = (23.439 - 0.00000036 * T) * Math.PI / 180;

  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(lstRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity))
  );
  const mcRad = Math.atan2(Math.sin(lstRad) * Math.cos(obliquity), -Math.sin(obliquity));

  const ascendant = ((ascRad * 180 / Math.PI) + 360) % 360;
  const midheaven = ((mcRad * 180 / Math.PI) + 360) % 360;

  const houses: number[] = [];
  houses[0] = ascendant;
  houses[9] = midheaven;
  houses[3] = (ascendant + 180) % 360;
  houses[6] = (midheaven + 180) % 360;

  for (let i = 1; i < 12; i++) {
    if (i === 3 || i === 6 || i === 9) continue;
    houses[i] = (houses[0] + i * 30) % 360;
  }

  return { houses: houses.slice(0, 12), ascendant, midheaven };
}

// ─── Solar Return Core Calculation ──────────────────────────────────────────

function findSolarReturnExactTime(
  birthDate: string,
  birthTime: string,
  targetYear: number,
  birthSunLongitude: number
): { jd: number; datetime: string } {
  const birth = parseBirthDateTime(birthDate, birthTime);
  
  const birthdayThisYear: { year: number; month: number; day: number; hour: number } = {
    year: targetYear,
    month: birth.month,
    day: birth.day,
    hour: birth.hour + birth.min / 60,
  };
  
  const jd_birthday = getJulianDay(birthdayThisYear.year, birthdayThisYear.month, birthdayThisYear.day, 12);
  
  const sunAtNoon = getSunLongitude(jd_birthday);
  
  let diff = birthSunLongitude - sunAtNoon;
  
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  
  const searchWindowDays = 2;
  const dayFraction = 1 / 24;
  
  let jd_start = jd_birthday - searchWindowDays;
  let jd_end = jd_birthday + searchWindowDays;
  
  let prevSunLon = getSunLongitude(jd_start);
  
  for (let jd = jd_start + dayFraction; jd <= jd_end; jd += dayFraction) {
    const currentSunLon = getSunLongitude(jd);
    
    const prevDiff = normalizeDiff(prevSunLon, birthSunLongitude);
    const currDiff = normalizeDiff(currentSunLon, birthSunLongitude);
    
    if (prevDiff * currDiff < 0 || Math.abs(currDiff) < 0.01) {
      let lo = jd - dayFraction;
      let hi = jd;
      
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        const midSunLon = getSunLongitude(mid);
        const midDiff = normalizeDiff(midSunLon, birthSunLongitude);
        
        if (Math.abs(midDiff) < 0.0001) {
          const dt = julianDayToDateTime(mid);
          return { jd: mid, datetime: formatDateTimeISO(dt) };
        }
        
        if (midDiff * prevDiff < 0) {
          hi = mid;
        } else {
          lo = mid;
        }
      }
      
      const finalJd = (lo + hi) / 2;
      const dt = julianDayToDateTime(finalJd);
      return { jd: finalJd, datetime: formatDateTimeISO(dt) };
    }
    
    prevSunLon = currentSunLon;
  }
  
  const dt = julianDayToDateTime(jd_birthday);
  return { jd: jd_birthday, datetime: formatDateTimeISO(dt) };
}

function normalizeDiff(currentSunLon: number, targetLon: number): number {
  let diff = currentSunLon - targetLon;
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return diff;
}

// ─── Main Solar Return Function ─────────────────────────────────────────────

export function calculateSolarReturn(
  birthDate: string,
  birthTime: string,
  lat: number,
  lng: number,
  targetYear: number
): SolarReturnResult {
  const birth = parseBirthDateTime(birthDate, birthTime);
  const birthJD = getJulianDay(birth.year, birth.month, birth.day, birth.hour);
  const birthSunLongitude = getSunLongitude(birthJD);
  
  const { jd, datetime } = findSolarReturnExactTime(birthDate, birthTime, targetYear, birthSunLongitude);
  
  const jdResult = getJulianDay(
    julianDayToDateTime(jd).year,
    julianDayToDateTime(jd).month,
    julianDayToDateTime(jd).day,
    julianDayToDateTime(jd).hour
  );
  
  const planets = getPlanetaryPositions(jdResult);
  const houses = getHouses(jdResult, lat, lng);
  
  const interpretation = generateSolarReturnInterpretation(planets, birthSunLongitude, targetYear);
  
  return {
    birthDate,
    birthTime,
    targetYear,
    birthSunLongitude,
    birthdayExactTime: datetime,
    birthdayExactJulianDay: jd,
    chart: { planets, houses, julianDay: jdResult },
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
  
  const ascendant = planets.find(p => p.name === 'Sun');
  if (ascendant) {
    interpretation += `\nKey positions:\n`;
    interpretation += `- Sun (identity): ${sun?.signSymbol} ${sun?.signName} ${sun?.degree.toFixed(1)}°\n`;
  }
  
  return interpretation;
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { ZODIAC_SIGNS };
