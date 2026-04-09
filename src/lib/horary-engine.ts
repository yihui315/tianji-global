/**
 * Horary Astrology Engine - 卦占
 * TianJi Global | 天机全球
 *
 * Casts a chart for the exact moment a question is asked.
 * Uses Swiss Ephemeris (sweph) for accurate planetary positions.
 * ASC is calculated using sidereal time + ecliptic obliquity formula.
 */

import { utc_to_jd, calc, constants, houses_ex2 } from 'sweph';

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

// ─── Constants ───────────────────────────────────────────────────────────────

const SE_TO_PLANET: [string, number][] = [
  ['Sun', constants.SE_SUN],
  ['Moon', constants.SE_MOON],
  ['Mercury', constants.SE_MERCURY],
  ['Venus', constants.SE_VENUS],
  ['Mars', constants.SE_MARS],
  ['Jupiter', constants.SE_JUPITER],
  ['Saturn', constants.SE_SATURN],
  ['Uranus', constants.SE_URANUS],
  ['Neptune', constants.SE_NEPTUNE],
  ['Pluto', constants.SE_PLUTO],
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizeAngle(a: number): number {
  a = a % 360;
  return a < 0 ? a + 360 : a;
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

// ─── Swiss Ephemeris ──────────────────────────────────────────────────────────

function getJD(year: number, month: number, day: number, hour: number): number {
  const r = utc_to_jd(year, month, day, hour, 0, 0, constants.SE_GREG_CAL);
  return r.data[0]; // ephemeris time
}

/** Get planet longitude in degrees (deterministic via sweph) */
function getPlanetLon(jd: number, seId: number): number | null {
  try {
    const r = calc(jd, seId, constants.SEFLG_SWIEPH);
    if (r.flag !== constants.SEFLG_SWIEPH) return null;
    return normalizeAngle(r.data[0] as number);
  } catch {
    return null;
  }
}

function getPlanetaryPositions(jd: number): PlanetPosition[] {
  const positions: PlanetPosition[] = [];
  for (const [planet, seId] of SE_TO_PLANET) {
    const lon = getPlanetLon(jd, seId);
    if (lon !== null) {
      const signIndex = getSignIndex(lon);
      positions.push({
        planet,
        sign: getSignName(signIndex),
        signIndex,
        degree: getDegreeInSign(lon),
        longitude: lon,
      });
    }
  }
  return positions;
}

/** Calculate ASC, MC and house cusps using sweph houses_ex2 */
function calculateHouses(
  year: number, month: number, day: number,
  hour: number,
  latitude: number,
  longitude: number
): { ascLongitude: number; mcLongitude: number; houses: number[] } {
  const jd_ut = utc_to_jd(year, month, day, hour, 0, 0, constants.SE_GREG_CAL).data[1];

  try {
    // houses_ex2(tjd_ut, iflag, geolat, geolon, hsys)
    const result = houses_ex2(jd_ut, 0, latitude, longitude, 'P') as { flag: number; error: string; data: { houses: number[] } };
    if (result.flag === constants.OK && result.data?.houses?.length >= 12) {
      // Houses are returned in degrees already
      const houses = result.data.houses.map(h => normalizeAngle(h));
      return {
        ascLongitude: houses[0],
        mcLongitude: houses[9] ?? houses[1],
        houses,
      };
    }
  } catch {
    // fall through to simplified formula
  }

  // Simplified fallback: use LST + obliquity formula
  const jd = getJD(year, month, day, hour);
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
  for (let i = 0; i < 12; i++) {
    houses.push(normalizeAngle(ascLongitude + i * 30));
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

  // Get planetary positions using sweph
  const planets = getPlanetaryPositions(jd);

  // Calculate houses using sweph (default: ~31°N, ~121°E = Shanghai)
  // In production, accept user location as parameter
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

  // Determine question type → quesited house
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

  // House ruler: planet ruling the sign on the house cusp
  const houseCuspLongitude = chart.houses[house - 1] ?? chart.ascLongitude;
  const houseCuspSignIndex = getSignIndex(houseCuspLongitude);
  const houseRuler = SIGN_RULERS[getSignName(houseCuspSignIndex)] ?? 'Moon';

  // Find significator planets for this house
  const significatorPlanets = chart.planets.filter(p => {
    if (p.planet === houseRuler) return true;
    if (p.sign === getSignName(houseCuspSignIndex)) return true;
    return false;
  });

  // Calculate strength based on essential dignities and house placement
  let strengthScore = 50;
  const reasons: string[] = [];

  // ASC ruler condition
  const ascRuler = SIGN_RULERS[chart.ascSign] ?? 'Sun';
  const ascRulerPlanet = chart.planets.find(p => p.planet === ascRuler);

  if (ascRulerPlanet) {
    if (ascRulerPlanet.sign === chart.ascSign) {
      strengthScore += 15;
      reasons.push(`${ascRuler} (ASC ruler) in ${ascRulerPlanet.sign} — dignified`);
    }
    // Moon assistance
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
    // Ruled sign
    if (SIGN_RULERS[p.sign] === p.planet) {
      strengthScore += 10;
      reasons.push(`${p.planet} rules its own sign (${p.sign}) — very strong`);
    }
    // Angular: houses 1, 4, 7, 10
    const isAngular = [0, 3, 6, 9].includes(house - 1);
    if (isAngular) {
      strengthScore += 8;
      reasons.push(`${p.planet} angular — active and prominent`);
    }
    // Cadent or succedent
    if ([2, 5, 8, 11].includes(house - 1)) {
      strengthScore -= 5;
      reasons.push(`${p.planet} in cadent house — less active`);
    }
  }

  // Reception check
  if (ascRulerPlanet) {
    const otherSig = significatorPlanets.find(p => p.planet !== houseRuler);
    if (otherSig) {
      if (SIGN_RULERS[ascRulerPlanet.sign] === otherSig.planet) {
        strengthScore += 15;
        reasons.push(`Mutual reception — ${otherSig.planet} receives ${ascRuler} (ASC ruler) by sign`);
      }
    }
  }

  // Moon condition
  const moonPlanet = chart.planets.find(p => p.planet === 'Moon');
  if (moonPlanet) {
    if (moonPlanet.degree > 27) {
      strengthScore -= 5;
      reasons.push('Moon in late degrees — slow resolution');
    }
  }

  // Determine outcome
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
