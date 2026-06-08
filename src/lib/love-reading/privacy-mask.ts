import type {
  LoveReport,
  PrivateBirthInput,
  PrivacySafeShareSummary,
  PublicBirthSummary,
} from './report-schema';

const privateKeyPattern =
  /(birth(date|time|place|location)|timezone|full(name|report|result|reading)|privatequestion|contact(info)?|email|phone|payment(state|status)?|stripe|raw(engine|output|result|response)?|prompt)/i;

const isoDatePattern = /\b(?:19|20)\d{2}-\d{2}-\d{2}\b/;
const timePattern = /\b(?:[01]\d|2[0-3]):[0-5]\d\b/;
const paymentPattern = /\b(?:paid|unpaid|checkout|payment_status|stripe|cs_test|cs_live|pi_|price_)\b/i;

const absoluteClaimPatterns = [
  /\b(?:will definitely|guaranteed|must marry|only destiny|break up immediately|certain soulmate|100%|exactly when)\b/i,
  /一定会|必然|唯一命运|必须分手|马上分手|百分百|错过.*就完|注定结婚|一定复合/,
];

const fearBasedCtaPatterns = [
  /\b(?:pay now or|buy now or|unlock now or|miss your true love|save your relationship by paying)\b/i,
  /不付费.*错过|必须购买|花钱.*挽回|不买.*没未来|付费.*真爱/,
];

const zodiacSigns = [
  ['Capricorn', 1, 19],
  ['Aquarius', 2, 18],
  ['Pisces', 3, 20],
  ['Aries', 4, 19],
  ['Taurus', 5, 20],
  ['Gemini', 6, 20],
  ['Cancer', 7, 22],
  ['Leo', 8, 22],
  ['Virgo', 9, 22],
  ['Libra', 10, 22],
  ['Scorpio', 11, 21],
  ['Sagittarius', 12, 21],
  ['Capricorn', 12, 31],
] as const;

function firstGrapheme(value: string) {
  return Array.from(value.trim())[0];
}

function zodiacFromBirthDate(birthDate?: string) {
  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return undefined;
  const [, monthText, dayText] = birthDate.split('-');
  const month = Number(monthText);
  const day = Number(dayText);
  const sign = zodiacSigns.find(([, endMonth, endDay]) => month < endMonth || (month === endMonth && day <= endDay));
  return sign?.[0];
}

export function maskBirthInput(input: PrivateBirthInput): PublicBirthSummary {
  const birthMonth = input.birthDate?.match(/^\d{4}-(\d{2})-\d{2}$/)?.[1];

  return {
    displayName: input.name ? `${firstGrapheme(input.name)}*` : undefined,
    zodiacSign: zodiacFromBirthDate(input.birthDate),
    birthMonthLabel: birthMonth ? `${birthMonth}-born` : undefined,
    hasExactTime: false,
    hasBirthPlace: false,
  };
}

export function containsForbiddenRelationshipClaim(value: unknown): boolean {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return absoluteClaimPatterns.some((pattern) => pattern.test(serialized));
}

export function containsFearBasedCTA(value: unknown): boolean {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return fearBasedCtaPatterns.some((pattern) => pattern.test(serialized));
}

export function containsPrivateBirthLeak(value: unknown): boolean {
  const serialized = JSON.stringify(value);
  if (!serialized) return false;
  return (
    privateKeyPattern.test(serialized) ||
    isoDatePattern.test(serialized) ||
    timePattern.test(serialized) ||
    paymentPattern.test(serialized)
  );
}

function stripPrivateKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripPrivateKeys);
  }
  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !privateKeyPattern.test(key))
      .map(([key, item]) => [key, stripPrivateKeys(item)])
  );
}

export function sanitizePublicSharePayload(payload: Record<string, unknown>) {
  const stripped = stripPrivateKeys(payload) as Record<string, unknown>;
  const allowed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(stripped)) {
    if (
      key === 'title' ||
      key === 'summary' ||
      key === 'scoreBand' ||
      key === 'cta' ||
      key === 'archetypeTitle' ||
      key === 'displayName' ||
      key === 'zodiacSign' ||
      key === 'birthMonthLabel' ||
      key === 'hasExactTime' ||
      key === 'hasBirthPlace'
    ) {
      allowed[key] = value;
    }
  }

  return allowed;
}

export function buildPublicShareSummary(report: LoveReport): PrivacySafeShareSummary {
  return {
    title: report.privacySafeShareSummary.title,
    summary: report.privacySafeShareSummary.summary,
    scoreBand: report.privacySafeShareSummary.scoreBand,
    cta: report.privacySafeShareSummary.cta,
    archetypeTitle: report.relationshipArchetype.title,
  };
}
