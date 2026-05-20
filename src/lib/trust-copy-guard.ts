type PrimitivePayloadValue = string | number | boolean | null;

const guaranteedPredictionPatterns = [
  /\bwe predict your future\b/i,
  /\bfind your soulmate\b/i,
  /\bknow exactly when love will arrive\b/i,
  /\bguaranteed\b/i,
  /\bwill definitely\b/i,
  /\bdestined to\b/i,
];

const professionalAdvicePatterns = [
  /\bmedical advice\b/i,
  /\blegal advice\b/i,
  /\bfinancial advice\b/i,
  /\bdiagnose\b/i,
  /\btreat\b/i,
  /\binvestment advice\b/i,
];

const sensitiveKeyNames = new Set([
  'answer',
  'airesponse',
  'birthdate',
  'birthtime',
  'birthplace',
  'birthlocation',
  'fullanswer',
  'fullreading',
  'fullreport',
  'fullresult',
  'timezone',
  'modeloutput',
  'modelresponse',
  'prompt',
  'provideroutput',
  'providerresponse',
  'providerraw',
  'question',
  'rawproviderresponse',
  'rawquestion',
  'rawresponse',
  'rawresult',
  'readingtext',
  'rawkundlitext',
  'kundlipdftext',
  'response',
  'resulttext',
  'relationshipanswer',
  'relationshipanswers',
  'rawrelationshipanswer',
  'rawrelationshipanswers',
]);

export const forbiddenTrustClaims = [
  ...guaranteedPredictionPatterns.map((pattern) => ({
    kind: 'guaranteed prediction',
    pattern,
  })),
  ...professionalAdvicePatterns.map((pattern) => ({
    kind: 'professional advice',
    pattern,
  })),
];

function normalizeKey(key: string) {
  return key.replace(/[\s_-]/g, '').toLowerCase();
}

export function isSensitivePrivacyKey(key: string) {
  return sensitiveKeyNames.has(normalizeKey(key));
}

export function assertSafeTrustCopy(copy: string) {
  const match = forbiddenTrustClaims.find(({ pattern }) => pattern.test(copy));
  if (!match) return;

  if (match.kind === 'professional advice') {
    throw new Error('Trust copy must not present TianJi as professional advice.');
  }

  throw new Error('Trust copy must not make guaranteed prediction claims.');
}

export function stripSensitiveKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripSensitiveKeys);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !isSensitivePrivacyKey(key))
      .map(([key, item]) => [key, stripSensitiveKeys(item)])
  );
}

export function sanitizeAnalyticsPayload(payload: Record<string, unknown>) {
  const sanitized: Record<string, PrimitivePayloadValue> = {};

  for (const [key, value] of Object.entries(payload)) {
    if (isSensitivePrivacyKey(key)) continue;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function sanitizePrivacyRequest(payload: Record<string, unknown>) {
  return stripSensitiveKeys(payload) as Record<string, unknown>;
}

export function sanitizeRelationshipSharePayload(share: unknown, reading: unknown) {
  const sanitizedShare =
    share && typeof share === 'object'
      ? {
          ...(share as Record<string, unknown>),
          include_birth_data: false,
          includeBirthData: false,
        }
      : share;

  return {
    share: sanitizedShare,
    reading: stripSensitiveKeys(reading),
  };
}
