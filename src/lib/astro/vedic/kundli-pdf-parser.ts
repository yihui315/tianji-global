import type { DashaPeriod, HousePosition, PlanetPosition, VedicChartData } from './types';

const PLANET_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

function parseDegree(raw: string | undefined) {
  if (!raw) return undefined;
  const match = raw.match(/\d+(?:\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : undefined;
}

function normalizeZodiac(raw: string | undefined): VedicChartData['metadata']['zodiac'] {
  if (!raw) return 'unknown';
  if (/sidereal/i.test(raw)) return 'sidereal';
  if (/tropical/i.test(raw)) return 'tropical';
  return 'unknown';
}

function parseAscendant(text: string) {
  const match = text.match(/\b(?:Ascendant|Lagna)\s*:\s*([A-Za-z]+)(?:\s+([0-9.]+)[°\s])?/i);
  if (!match) return undefined;
  return {
    sign: match[1],
    degree: parseDegree(match[2]),
  };
}

function parseMoonSign(text: string) {
  return text.match(/\bMoon\s+Sign\s*:\s*([A-Za-z]+)/i)?.[1];
}

function parseMoonNakshatra(text: string) {
  const match = text.match(/\bMoon\s+Nakshatra\s*:\s*([A-Za-z\s]+?)(?:\s+Pada\s+(\d+))?(?:\n|$)/i);
  if (!match) return undefined;
  return {
    name: match[1].trim(),
    pada: match[2] ? Number.parseInt(match[2], 10) : undefined,
  };
}

function parsePlanets(text: string): PlanetPosition[] {
  return text
    .split('\n')
    .flatMap((line) => {
      const planetPattern = PLANET_NAMES.join('|');
      const pattern = new RegExp(`\\b(${planetPattern})\\s*:\\s*([A-Za-z]+)(?:\\s+([0-9.]+)[°\\s][^\\n]*)?(?:House\\s+(\\d+))?`, 'i');
      const match = line.match(pattern);
      if (!match) return [];
      return [{
        planet: match[1],
        sign: match[2],
        degree: parseDegree(match[3]),
        house: match[4] ? Number.parseInt(match[4], 10) : undefined,
      }];
    });
}

function parseSeventhHouse(text: string): HousePosition[] {
  const match = text.match(/\b7th\s+House\s*:\s*([A-Za-z]+)(?:\s+Lord\s+([A-Za-z]+))?/i);
  if (!match) return [];
  return [{
    house: 7,
    sign: match[1],
    lord: match[2],
  }];
}

function parseDashas(text: string): DashaPeriod[] {
  const matches = [...text.matchAll(/\bDasha\s*:\s*([A-Za-z]+)\s+(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/gi)];
  return matches.map((match) => ({
    system: 'Vimshottari',
    planet: match[1],
    startDate: match[2],
    endDate: match[3],
  }));
}

export function parseKundliPdfText(rawText: string): Partial<VedicChartData> {
  const text = rawText.replace(/\r\n/g, '\n');
  const warnings: string[] = [];
  const planets = parsePlanets(text);
  const houses = parseSeventhHouse(text);
  const dashaPeriods = parseDashas(text);
  const ascendant = parseAscendant(text);
  const moonSign = parseMoonSign(text);
  const moonNakshatra = parseMoonNakshatra(text);
  const zodiac = normalizeZodiac(text.match(/\bZodiac\s*:\s*([A-Za-z]+)/i)?.[1]);
  const ayanamsa = text.match(/\bAyanamsa\s*:\s*([A-Za-z]+)/i)?.[1] ?? 'Lahiri';

  if (!ascendant) warnings.push('missing_ascendant');
  if (!moonSign) warnings.push('missing_moon_sign');
  if (!moonNakshatra) warnings.push('missing_moon_nakshatra');
  if (!planets.length) warnings.push('missing_planet_positions');
  if (!houses.length) warnings.push('missing_house_positions');
  if (!dashaPeriods.length) warnings.push('missing_dasha_periods');

  return {
    metadata: {
      sourceType: 'kundli-pdf-text',
      zodiac,
      ayanamsa,
      warnings,
    },
    ascendant,
    moonSign,
    moonNakshatra,
    planets,
    houses,
    dashaPeriods,
    warnings,
  };
}
