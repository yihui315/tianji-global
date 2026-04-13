/**
 * Horary Astrology Engine - 卦占
 * TianJi Global | 天机全球
 *
 * Casts a chart for the exact moment a question is asked.
 * Uses astronomia (pure JS ephemeris) for accurate planetary positions.
 * ASC is calculated using sidereal time + ecliptic obliquity formula.
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

export interface PlanetPosition {
  planet: string;
  sign: string;
  signIndex: number;
  degree: number;
  longitude: number;
}

export interface HoraryChart {
  castTime: Date;
  planets: PlanetPosition[];
  ascSign: string;
  ascSignIndex: number;
  ascDegree: number;
  ascLongitude: number;
  mcSign: string;
  mcLongitude: number;
  houses: number[];
  planetsInSigns: Record<string, string>;
}

export interface Judgment {
  outcome: 'yes' | 'no' | 'uncertain';
  strength: 'strong' | 'weak' | 'indeterminate';
  significators: string[];
  reasons: string[];
  house: number;
  houseRuler: string;
  questionType: string;
}

// ─── Sign Data ────────────────────────────────────────────────────────────────

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
               'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};
const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
};
const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

// ─── Planet Data Setup ────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeAngle(a: number): number {
  a = a % 360;
  return a < 0 ? a + 360 : a;
}

function radToDeg(rad: number): number {
  return (rad * 180 / Math.PI + 360) % 360;
}

function getSignIndex(longitude: number): number {
  return Math.floor(longitude / 30) % 12;
}

function getSignName(signIndex: number): string {
  return SIGNS[signIndex] ?? 'Aries';
}

function getDegreeInSign(longitude: number): number {
  return Math.round((longitude % 30) * 10) / 10;
}

// ─── Julian Day ──────────────────────────────────────────────────────────────

function getJD(year: number, month: number, day: number, hour: number): number {
  return CalendarGregorianToJD(year, month, day + hour / 24);
}

// ─── Planetary Positions ─────────────────────────────────────────────────────

function getPlanetaryPositions(jd: number): PlanetPosition[] {
  const jdEt = jd + 1 / 86400; // TT
  const positions: PlanetPosition[] = [];

  // Sun
  const sunPos = earth.position(jdEt);
  const sunLon = radToDeg((sunPos.lon + Math.PI) % (2 * Math.PI));
  const sunSignIndex = getSignIndex(sunLon);
  positions.push({ planet: 'Sun', sign: getSignName(sunSignIndex), signIndex: sunSignIndex, degree: getDegreeInSign(sunLon), longitude: sunLon });

  // Moon
  const moon = moonPosition(jdEt);
  const moonLon = radToDeg(moon.lon);
  const moonSignIndex = getSignIndex(moonLon);
  positions.push({ planet: 'Moon', sign: getSignName(moonSignIndex), signIndex: moonSignIndex, degree: getDegreeInSign(moonLon), longitude: moonLon });

  // Other planets
  for (const name of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']) {
    const pd = PLANET_DATA[name];
    if (!pd) continue;
    const p = pd.getPosition(jdEt);
    const lon = radToDeg(p.lon);
    const signIndex = getSignIndex(lon);
    positions.push({ planet: name, sign: getSignName(signIndex), signIndex, degree: getDegreeInSign(lon), longitude: lon });
  }

  return positions;
}

// ─── House Calculation ───────────────────────────────────────────────────────

function calculateHouses(
  year: number, month: number, day: number,
  hour: number,
  latitude: number,
  longitude: number
): { ascLongitude: number; mcLongitude: number; houses: number[] } {
  const jd = getJD(year, month, day, hour);
  
  // Simplified house calculation using LST + obliquity formula
  const T = (jd - 2451545.0) / 36525;
  const lst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  const lstRad = ((lst - longitude) % 360) * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;
  const eps = 23.439 * Math.PI / 180; // obliquity

  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -(Math.sin(lstRad) * Math.cos(eps) + Math.tan(latRad) * Math.sin(eps))
  );
  const mcRad = Math.atan2(Math.sin(lstRad) * Math.cos(eps), -Math.sin(eps));

  const ascLongitude = normalizeAngle(ascRad * 180 / Math.PI);
  const mcLongitude = normalizeAngle(mcRad * 180 / Math.PI);

  const houses: number[] = [];
  houses[0] = ascLongitude;
  houses[9] = mcLongitude;
  houses[3] = (ascLongitude + 180) % 360;
  houses[6] = (mcLongitude + 180) % 360;

  // Simplified intermediate houses
  for (let i = 1; i < 12; i++) {
    if (i === 3 || i === 6 || i === 9) continue;
    houses[i] = (houses[0] + i * 30) % 360;
  }

  return { ascLongitude, mcLongitude, houses };
}

// ─── Chart Casting ───────────────────────────────────────────────────────────

export function castHoraryChart(question: string, castTime: Date): HoraryChart {
  const year = castTime.getFullYear();
  const month = castTime.getMonth() + 1;
  const day = castTime.getDate();
  const hour = castTime.getHours() + castTime.getMinutes() / 60 + castTime.getSeconds() / 3600;

  const jd = getJD(year, month, day, hour);

  const planets = getPlanetaryPositions(jd);

  // Default location ~31°N, ~121°E = Shanghai
  const { ascLongitude, mcLongitude, houses } = calculateHouses(year, month, day, hour, 31, 121);

  const ascSignIndex = getSignIndex(ascLongitude);
  const mcSignIndex = getSignIndex(mcLongitude);

  const planetsInSigns: Record<string, string> = {};
  for (const p of planets) {
    planetsInSigns[p.planet] = p.sign;
  }

  return {
    castTime,
    planets,
    ascSign: getSignName(ascSignIndex),
    ascSignIndex,
    ascDegree: getDegreeInSign(ascLongitude),
    ascLongitude,
    mcSign: getSignName(mcSignIndex),
    mcLongitude,
    houses,
    planetsInSigns,
  };
}

// ─── Question Evaluation ─────────────────────────────────────────────────────

export function evaluateQuestion(question: string, chart: HoraryChart): Judgment {
  const q = question.toLowerCase();

  let house = 1;
  let questionType = 'self';
  if (q.match(/money|wealth|financial|income|rich|bank|salary/)) { house = 2; questionType = 'finances'; }
  else if (q.match(/love|relationship|marriage|partner|husband|wife|boyfriend|girlfriend|crush/)) { house = 7; questionType = 'partnership'; }
  else if (q.match(/career|job|work|business|career|profession/)) { house = 10; questionType = 'career'; }
  else if (q.match(/health|illness|sick|hospital|doctor|disease/)) { house = 6; questionType = 'health'; }
  else if (q.match(/travel|trip|journey|flight|vacation/)) { house = 9; questionType = 'travel'; }
  else if (q.match(/legal|lawsuit|law|court|police/)) { house = 10; questionType = 'legal'; }
  else if (q.match(/child|children|kid|baby|pregnant|fertility/)) { house = 5; questionType = 'children'; }
  else if (q.match(/sibling|brother|sister|friend|neighbor/)) { house = 3; questionType = 'siblings'; }
  else if (q.match(/property|house|real estate|land/)) { house = 4; questionType = 'property'; }
  else if (q.match(/education|school|exam|university|study/)) { house = 9; questionType = 'education'; }
  else if (q.match(/communication|message|letter|email|phone/)) { house = 3; questionType = 'communication'; }

  const houseCuspLongitude = chart.houses[house - 1] ?? chart.ascLongitude;
  const houseCuspSignIndex = getSignIndex(houseCuspLongitude);
  const houseRuler = SIGN_RULERS[getSignName(houseCuspSignIndex)] ?? 'Moon';

  const significatorPlanets = chart.planets.filter(p => {
    if (p.planet === houseRuler) return true;
    if (p.sign === getSignName(houseCuspSignIndex)) return true;
    return false;
  });

  let strengthScore = 50;
  const reasons: string[] = [];

  const ascRuler = SIGN_RULERS[chart.ascSign] ?? 'Sun';
  const ascRulerPlanet = chart.planets.find(p => p.planet === ascRuler);

  if (ascRulerPlanet) {
    if (ascRulerPlanet.sign === chart.ascSign) {
      strengthScore += 15;
      reasons.push(`${ascRuler} (ASC ruler) in ${ascRulerPlanet.sign} — dignified`);
    }
    const moonPlanet = chart.planets.find(p => p.planet === 'Moon');
    if (moonPlanet) {
      const angle = Math.abs(moonPlanet.longitude - ascRulerPlanet.longitude);
      const normAngle = Math.min(angle, 360 - angle);
      if (normAngle <= 30 || (normAngle >= 150 && normAngle <= 210)) {
        strengthScore += 10;
        reasons.push(`Moon sextile/trine ${ascRuler} — natural assistance`);
      }
    }
  }

  if (significatorPlanets.length === 0) {
    strengthScore -= 10;
    reasons.push('No planet found as primary significator — outcome uncertain');
  }

  for (const p of significatorPlanets) {
    if (SIGN_RULERS[p.sign] === p.planet) {
      strengthScore += 10;
      reasons.push(`${p.planet} rules its own sign (${p.sign}) — very strong`);
    }
    const isAngular = [0, 3, 6, 9].includes(house - 1);
    if (isAngular) {
      strengthScore += 8;
      reasons.push(`${p.planet} angular — active and prominent`);
    }
    if ([2, 5, 8, 11].includes(house - 1)) {
      strengthScore -= 5;
      reasons.push(`${p.planet} in cadent house — less active`);
    }
  }

  if (ascRulerPlanet) {
    const otherSig = significatorPlanets.find(p => p.planet !== houseRuler);
    if (otherSig) {
      if (SIGN_RULERS[ascRulerPlanet.sign] === otherSig.planet) {
        strengthScore += 15;
        reasons.push(`Mutual reception — ${otherSig.planet} receives ${ascRuler} (ASC ruler) by sign`);
      }
    }
  }

  const moonPlanet = chart.planets.find(p => p.planet === 'Moon');
  if (moonPlanet) {
    if (moonPlanet.degree > 27) {
      strengthScore -= 5;
      reasons.push('Moon in late degrees — slow resolution');
    }
  }

  let outcome: 'yes' | 'no' | 'uncertain' = 'uncertain';
  if (strengthScore >= 65) outcome = 'yes';
  else if (strengthScore <= 40) outcome = 'no';

  let strength: 'strong' | 'weak' | 'indeterminate' = 'indeterminate';
  if (strengthScore >= 62) strength = 'strong';
  else if (strengthScore <= 42) strength = 'weak';

  return {
    outcome,
    strength,
    significators: significatorPlanets.map(p => `${p.planet} in ${p.sign} ${p.degree}°`),
    reasons: reasons.length > 0 ? reasons : ['Chart requires careful interpretation'],
    house,
    houseRuler,
    questionType,
  };
}

export { SIGNS, SIGN_SYMBOLS, PLANET_GLYPHS, SIGN_RULERS };
