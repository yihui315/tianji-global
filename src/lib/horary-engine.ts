// Horary Astrology Engine - 卦占
// Casts a chart for the exact moment a question is asked

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  longitude: number;
}

export interface HoraryChart {
  castTime: Date;
  planets: PlanetPosition[];
  ascSign: string;
  ascDegree: number;
  planetsInSigns: Record<string, string>;
}

export interface Judgment {
  outcome: 'yes' | 'no' | 'uncertain';
  strength: 'strong' | 'weak' | 'indeterminate';
  significators: string[];
  reasons: string[];
  house: number;
  houseRuler: string;
}

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};
const PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};
const HOUSE_QUESITED: Record<string, number> = {
  self: 1, health: 1, finances: 2, assets: 2, siblings: 3, travel: 9,
  legal: 10, career: 10, reputation: 10, marriage: 7, partnership: 7,
  children: 5, education: 9, work: 6, health: 6, siblings: 3,
};

function getSign(longitude: number): { sign: string; degree: number } {
  const signIndex = Math.floor(longitude / 30) % 12;
  const degree = Math.round(longitude % 30);
  return { sign: SIGNS[signIndex], degree };
}

function simplePlanetaryPosition(date: Date): PlanetPosition[] {
  const jd = (date.getTime() / 86400000) + 2440587.5;
  const positions: PlanetPosition[] = [];

  // Simplified planetary longitude calculation (mean orbital elements)
  const meanLongitudes: Record<string, number> = {
    Sun: (julian => (280.46 + 0.9856474 * (jd - 2451545)) % 360),
    Moon: (julian => (218.32 + 13.176396 * (jd - 2451545)) % 360),
    Mercury: (julian => (252.25 + 4.0923 * (jd - 2451545)) % 360),
    Venus: (julian => (181.98 + 1.6021 * (jd - 2451545)) % 360),
    Mars: (julian => (355.43 + 0.524 * (jd - 2451545)) % 360),
    Jupiter: (julian => (34.35 + 0.083 * (jd - 2451545)) % 360),
    Saturn: (julian => (50.08 + 0.033 * (jd - 2451545)) % 360),
  };

  for (const [planet, fn] of Object.entries(meanLongitudes)) {
    const longitude = fn(jd) % 360;
    const { sign, degree } = getSign(longitude);
    positions.push({ planet, sign, degree, longitude });
  }

  // Add Uranus, Neptune, Pluto with approximate positions
  const laterPlanets = ['Uranus', 'Neptune', 'Pluto'];
  const baseLongitudes: Record<string, number> = {
    Uranus: 0, Neptune: 0, Pluto: 0,
  };
  // Use year-based approximation
  const year = date.getFullYear();
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
  const yearlyOffset = (year - 2000) * 0.011;
  baseLongitudes.Uranus = (42 + yearlyOffset * 4) % 360;
  baseLongitudes.Neptune = (334 + yearlyOffset * 2) % 360;
  baseLongitudes.Pluto = (228 + yearlyOffset * 0.8) % 360;

  for (const planet of laterPlanets) {
    const longitude = (baseLongitudes[planet] + dayOfYear * 0.004) % 360;
    const { sign, degree } = getSign(longitude);
    positions.push({ planet, sign, degree, longitude });
  }

  return positions;
}

export function castHoraryChart(question: string, castTime: Date): HoraryChart {
  const planets = simplePlanetaryPosition(castTime);
  const ascLongitude = (planets.find(p => p.planet === 'Sun')?.longitude ?? 0 + 90) % 360;
  const { sign: ascSign, degree: ascDegree } = getSign(ascLongitude);

  const planetsInSigns: Record<string, string> = {};
  for (const p of planets) {
    planetsInSigns[p.planet] = p.sign;
  }

  return {
    castTime,
    planets,
    ascSign,
    ascDegree,
    planetsInSigns,
  };
}

export function evaluateQuestion(question: string, chart: HoraryChart): Judgment {
  const q = question.toLowerCase();

  // Determine question type and house
  let house = 1;
  if (q.match(/money|wealth|financial|income|rich|bank/)) house = 2;
  else if (q.match(/love|relationship|marriage|partner|husband|wife|boyfriend|girlfriend/)) house = 7;
  else if (q.match(/career|job|work|business|career/)) house = 10;
  else if (q.match(/health|illness|sick|hospital/)) house = 6;
  else if (q.match(/travel|trip|journey|flight/)) house = 9;
  else if (q.match(/legal|lawsuit|law|court/)) house = 10;
  else if (q.match(/child|children|kid|baby|pregnant/)) house = 5;
  else if (q.match(/sibling|brother|sister|friend/)) house = 3;

  const houseRuler = SIGN_RULERS[chart.ascSign] ?? 'Moon';
  const significators = chart.planets.filter(p => p.planet === houseRuler).map(p => p.planet);

  // Find significator planets
  const significatorPlanets = chart.planets.filter(p => {
    const ruler = SIGN_RULERS[p.sign];
    return ruler === houseRuler || p.planet === houseRuler;
  });

  // Calculate strength based on dignities
  let strengthScore = 50;
  const reasons: string[] = [];

  for (const p of significatorPlanets) {
    if (p.sign === chart.ascSign) {
      strengthScore += 20;
      reasons.push(`${p.planet} in ${p.sign} (ASC) - very strong`);
    } else if (['Taurus', 'Libra', 'Capricorn', 'Pisces'].includes(p.sign)) {
      strengthScore += 15;
      reasons.push(`${p.planet} in ${p.sign} (exalted position)`);
    } else if (['Aries', 'Scorpio', 'Sagittarius', 'Pisces'].includes(p.sign)) {
      strengthScore -= 10;
      reasons.push(`${p.planet} in ${p.sign} (weak position)`);
    }
  }

  // Check for aspects (simplified - just look at angularity)
  const sunPlanet = chart.planets.find(p => p.planet === 'Sun');
  if (sunPlanet) {
    const angleFromAsc = Math.abs(sunPlanet.longitude - (chart.ascDegree + SIGNS.indexOf(chart.ascSign) * 30));
    if (angleFromAsc < 30 || angleFromAsc > 330) {
      strengthScore += 15;
      reasons.push('Sun angular - prominent and active');
    }
  }

  // Determine outcome
  let outcome: 'yes' | 'no' | 'uncertain' = 'uncertain';
  if (strengthScore >= 65) outcome = 'yes';
  else if (strengthScore <= 40) outcome = 'no';

  let strength: 'strong' | 'weak' | 'indeterminate' = 'indeterminate';
  if (strengthScore >= 60) strength = 'strong';
  else if (strengthScore <= 45) strength = 'weak';

  return {
    outcome,
    strength,
    significators: significatorPlanets.map(p => `${p.planet} in ${p.sign}`),
    reasons,
    house,
    houseRuler,
  };
}

export { SIGNS, SIGN_GLYPHS, PLANETS, SIGN_RULERS };
