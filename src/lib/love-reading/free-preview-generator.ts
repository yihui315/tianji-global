import { chooseLoveArchetype } from './love-archetypes';
import { buildLoveDimensions } from './love-dimensions';
import { buildCurrentLoveWindow } from './love-timing';
import { assertLoveReportQuality } from './report-quality-check';
import {
  LOVE_DIMENSION_KEYS,
  LOVE_REPORT_VERSION,
  normalizeLoveReportLocale,
  scoreBand,
  type LoveDimensionKey,
  type LoveReport,
  type LoveReportLocale,
  type PrivateBirthInput,
} from './report-schema';

export type FreePreviewRelationshipMode = 'solo' | 'compatibility';

export type FreePreviewReportInput = {
  locale?: LoveReportLocale | 'zh-CN';
  readingMode?: FreePreviewRelationshipMode;
  personA: PrivateBirthInput;
  personB?: PrivateBirthInput;
  createdAt?: string;
};

function hashText(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }
  return hash;
}

function scoreFromInput(input: FreePreviewReportInput, key: LoveDimensionKey) {
  const seed = [
    input.readingMode ?? 'solo',
    input.personA.birthDate ?? '',
    input.personA.birthTime ?? '',
    input.personB?.birthDate ?? '',
    input.personB?.birthTime ?? '',
    key,
  ].join('|');
  return 48 + (hashText(seed) % 38);
}

function uncertaintyNote(input: FreePreviewReportInput, _locale: LoveReportLocale) {
  const missingTime = !input.personA.birthTime || (input.readingMode === 'compatibility' && !input.personB?.birthTime);
  const missingPlace = !input.personA.birthPlace || (input.readingMode === 'compatibility' && !input.personB?.birthPlace);
  const onlyOne = input.readingMode !== 'compatibility' || !input.personB?.birthDate;

  if (!missingTime && !missingPlace && !onlyOne) return undefined;

  if (onlyOne) {
    return 'Only one birth profile is available, so this preview reflects personal relationship tendency rather than full compatibility.';
  }

  if (missingTime) {
    return 'Birth time is missing, so this preview avoids precise house, rising, or timing claims.';
  }

  return 'Birth place is missing, so this preview uses conservative location-independent guidance.';
}

function copyFor(_locale: LoveReportLocale) {
  return {
    headline: 'Your relationship preview is ready',
    oneLiner: 'A privacy-safe first signal for understanding the pattern, pace, and next best action.',
    strength: 'The relationship has enough signal to support a calm next step.',
    friction: 'The main risk is asking for certainty before the communication pattern is proven.',
    next7: [
      'Start with one honest check-in.',
      'Avoid reading silence as a final answer.',
      'Choose consistency over dramatic proof.',
    ],
    teaser: 'Unlock the full report for five-dimension depth, a 30-day window, and a repair script.',
    shareCta: 'Start your private TianJi Love preview',
  };
}

export function generateFreePreviewReport(input: FreePreviewReportInput): LoveReport {
  const locale = normalizeLoveReportLocale(input.locale);
  const scores = Object.fromEntries(
    LOVE_DIMENSION_KEYS.map((key) => [key, scoreFromInput(input, key)])
  ) as Record<LoveDimensionKey, number>;
  const overallScore = Math.round(
    LOVE_DIMENSION_KEYS.reduce((sum, key) => sum + scores[key], 0) / LOVE_DIMENSION_KEYS.length
  );
  const note = uncertaintyNote(input, locale);
  const c = copyFor(locale);
  const archetype = chooseLoveArchetype(overallScore, locale);
  const report: LoveReport = {
    version: LOVE_REPORT_VERSION,
    locale,
    visibility: 'free',
    headline: c.headline,
    oneLiner: c.oneLiner,
    relationshipArchetype: archetype,
    overallScore,
    dimensions: buildLoveDimensions(locale, scores, note),
    currentWindow: buildCurrentLoveWindow(overallScore, locale, note),
    strengths: [c.strength, archetype.summary],
    frictionPoints: [c.friction],
    next7Days: c.next7,
    next30Days: [],
    premiumTeaser: c.teaser,
    premiumSections: [],
    privacySafeShareSummary: {
      title: archetype.title,
      summary: archetype.summary,
      scoreBand: scoreBand(overallScore),
      cta: c.shareCta,
      archetypeTitle: archetype.title,
    },
    createdAt: input.createdAt ?? '1970-01-01T00:00:00.000Z',
  };

  assertLoveReportQuality(report);
  return report;
}
