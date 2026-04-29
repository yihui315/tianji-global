import type { NormalizedPayload } from '@/types/module-result';
import { asNumber, asRecord, asRecordArray, asString, compactSection } from './helpers';
import type { ModuleNormalizer } from './types';

function sign(record: Record<string, unknown>): string | undefined {
  return asString(record.sign) ?? asString(record.signZh);
}

function planetByName(planets: Record<string, unknown>[], name: string): Record<string, unknown> {
  return planets.find((planet) => asString(planet.name)?.toLowerCase() === name.toLowerCase()) ?? {};
}

function formatPlacement(label: string, record: Record<string, unknown>): string | undefined {
  const placement = sign(record);
  const degree = asNumber(record.degree);
  if (!placement) return undefined;
  return degree !== undefined ? `${label} in ${placement} ${degree}deg` : `${label} in ${placement}`;
}

export const westernNormalizer: ModuleNormalizer = {
  moduleType: 'western',
  normalize(raw, options = {}): NormalizedPayload {
    const bigThree = asRecord(raw.bigThree);
    const sun = asRecord(bigThree.sun);
    const moon = asRecord(bigThree.moon);
    const rising = asRecord(bigThree.rising);
    const planets = asRecordArray(raw.planets);
    const houses = asRecord(raw.houses);
    const venus = planetByName(planets, 'Venus');
    const mars = planetByName(planets, 'Mars');
    const mcSign = asString(houses.mcSign) ?? asString(houses.mcSignZh);
    const ascendantSign = asString(houses.ascendantSign) ?? asString(houses.ascendantSignZh) ?? sign(rising);
    const sunSign = sign(sun);
    const moonSign = sign(moon);
    const risingSign = sign(rising);
    const bigThreeHeadline = [sunSign && `${sunSign} Sun`, moonSign && `${moonSign} Moon`, risingSign && `${risingSign} Rising`]
      .filter(Boolean)
      .join(' / ');
    const venusPlacement = formatPlacement('Venus', venus);
    const marsPlacement = formatPlacement('Mars', mars);

    return {
      summary: {
        headline: options.title ?? (bigThreeHeadline ? `Western chart: ${bigThreeHeadline}` : 'Western natal chart'),
        oneLiner: options.summary ?? bigThreeHeadline,
        keywords: [sunSign, moonSign, risingSign, venusPlacement, marsPlacement].filter((item): item is string => Boolean(item)),
      },
      structure: {
        bigThree,
        houses,
      },
      chart: asRecord(raw.chart),
      identity: compactSection({
        headline: bigThreeHeadline,
        summary: [sunSign && `Sun in ${sunSign}`, moonSign && `Moon in ${moonSign}`, ascendantSign && `Rising in ${ascendantSign}`]
          .filter(Boolean)
          .join('; '),
      }),
      relationship: compactSection({
        headline: venusPlacement || marsPlacement ? 'Relational style' : undefined,
        summary: [venusPlacement, marsPlacement].filter(Boolean).join('; '),
      }),
      career: compactSection({
        headline: mcSign ? `Career angle in ${mcSign}` : undefined,
        summary: mcSign ? `The public path and vocation themes are filtered through ${mcSign}.` : undefined,
      }),
      timing: {},
    };
  },
};
