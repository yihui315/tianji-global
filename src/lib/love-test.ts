export const LOVE_TEST_SHARE_FORMATS = ['og', 'wechat_moments', 'xiaohongshu', 'douyin'] as const;
export const LOVE_TEST_PAID_INTENTS = ['what_are_they_thinking', 'timing', 'next_step'] as const;
export const LOVE_TEST_ASK_INTENTS = LOVE_TEST_PAID_INTENTS;

export type LoveTestShareFormat = (typeof LOVE_TEST_SHARE_FORMATS)[number];
export type LoveTestPaidIntent = (typeof LOVE_TEST_PAID_INTENTS)[number];
export type LoveTestAskIntent = LoveTestPaidIntent;

export const LOVE_TEST_PAID_INTENT_META = {
  what_are_they_thinking: {
    title: 'What are they thinking now?',
    priceLabel: '9.9 first question',
    previewPromise: 'See the emotional pattern first. Unlock the deeper answer only if it feels useful.',
  },
  timing: {
    title: 'When should I act?',
    priceLabel: '9.9 timing question',
    previewPromise: 'Get the timing signal first. Unlock the deeper next-step advice only if needed.',
  },
  next_step: {
    title: 'What should I do next?',
    priceLabel: '9.9 next-step question',
    previewPromise: 'See the safest first move. Unlock the full plan only if it matches your situation.',
  },
} satisfies Record<
  LoveTestPaidIntent,
  {
    title: string;
    priceLabel: string;
    previewPromise: string;
  }
>;

export type FateRelationshipStatus =
  | 'ambiguous'
  | 'dating'
  | 'separated_cold'
  | 'crush'
  | 'reunion_considering';

export interface LoveTestInput {
  yourName: string;
  theirName: string;
  relationshipStatus: FateRelationshipStatus;
  mainConcern: string;
}

export type LoveTestStage = 'early' | 'dating' | 'committed' | 'complicated';
export type LoveTestCommunication = 'direct' | 'gentle' | 'guarded' | 'playful';
export type LoveTestRhythm = 'fast' | 'steady' | 'slow' | 'mixed';
export type LoveTestConflict = 'repair' | 'space' | 'spark' | 'avoid';
export type LoveTestValues = 'security' | 'growth' | 'adventure' | 'devotion';

export interface LegacyLoveTestInput {
  stage: LoveTestStage;
  communication: LoveTestCommunication;
  rhythm: LoveTestRhythm;
  conflict: LoveTestConflict;
  values: LoveTestValues;
}

export interface LoveTestResult {
  id: string;
  score: number;
  matchLevel: string;
  archetype: string;
  headline: string;
  oneLiner: string;
  keywords: string[];
  insights: string[];
  actionSuggestion: string;
  strengths: string[];
  watchout: string;
  nextStep: string;
  upsellQuestion: string;
  shareText: string;
}

export interface LoveTestSharePayload {
  score: number;
  headline: string;
  oneLiner: string;
  archetype: string;
  keywords: string[];
  shareUrl: string;
}

type ConcernSignal = 'communication' | 'trust' | 'timing' | 'reunion' | 'commitment' | 'unclear';

export function isLoveTestAskIntent(value: unknown): value is LoveTestAskIntent {
  return typeof value === 'string' && (LOVE_TEST_ASK_INTENTS as readonly string[]).includes(value);
}

export function isLoveTestPaidIntent(value: unknown): value is LoveTestPaidIntent {
  return typeof value === 'string' && (LOVE_TEST_PAID_INTENTS as readonly string[]).includes(value);
}

export function getLoveTestPaidIntentMeta(value: unknown) {
  return isLoveTestPaidIntent(value) ? LOVE_TEST_PAID_INTENT_META[value] : null;
}

const STATUS_PROFILES = {
  ambiguous: {
    score: 61,
    label: 'Unspoken Pull',
    headline: 'There is a real signal here, but clarity has to be invited.',
    keywords: ['mixed signals', 'curiosity', 'soft clarity', 'pace'],
    insight: 'The connection may be active underneath the surface, but it needs a low-pressure opening before either person can respond honestly.',
    action: 'Send one warm, specific message that names the moment you want to understand, without asking for a final verdict.',
  },
  dating: {
    score: 76,
    label: 'Growing Rhythm',
    headline: 'This match can deepen when small promises become consistent.',
    keywords: ['momentum', 'consistency', 'repair', 'trust'],
    insight: 'The relationship has enough movement to test real-life compatibility, especially through follow-through and repair after small tension.',
    action: 'Choose one shared routine for the next week and observe whether both of you protect it naturally.',
  },
  separated_cold: {
    score: 49,
    label: 'Quiet Crossroads',
    headline: 'The bond needs evidence, not more guessing.',
    keywords: ['distance', 'boundary', 'evidence', 'self-trust'],
    insight: 'Distance is not automatically the end, but it is a sign that your next move should reduce confusion instead of chasing reassurance.',
    action: 'Set one boundary around waiting, checking, or rereading old messages, then decide what evidence would actually change your mind.',
  },
  crush: {
    score: 67,
    label: 'Fresh Spark',
    headline: 'Attraction is present, and the safest next step is a small reveal.',
    keywords: ['spark', 'curiosity', 'playfulness', 'first move'],
    insight: 'The match feels alive because imagination is high, so the useful test is whether real contact stays warm after the fantasy gets smaller.',
    action: 'Create one simple shared moment: a short invitation, a question with texture, or a reason to continue the conversation.',
  },
  reunion_considering: {
    score: 57,
    label: 'Returning Tide',
    headline: 'Reunion energy is possible only when the old pattern changes shape.',
    keywords: ['reunion', 'repair', 'pattern', 'new terms'],
    insight: 'The strongest signal is not whether you miss each other. It is whether both people can name what would be different this time.',
    action: 'Before reconnecting, write down the one old loop you refuse to repeat and the one repair behavior you need to see.',
  },
} satisfies Record<
  FateRelationshipStatus,
  {
    score: number;
    label: string;
    headline: string;
    keywords: string[];
    insight: string;
    action: string;
  }
>;

const LEGACY_SCORE_TABLES = {
  stage: { early: 13, dating: 18, committed: 22, complicated: 12 },
  communication: { direct: 23, gentle: 21, guarded: 12, playful: 18 },
  rhythm: { fast: 15, steady: 23, slow: 18, mixed: 16 },
  conflict: { repair: 24, space: 18, spark: 14, avoid: 10 },
  values: { security: 21, growth: 23, adventure: 17, devotion: 22 },
} satisfies {
  stage: Record<LoveTestStage, number>;
  communication: Record<LoveTestCommunication, number>;
  rhythm: Record<LoveTestRhythm, number>;
  conflict: Record<LoveTestConflict, number>;
  values: Record<LoveTestValues, number>;
};

const MATCH_LEVELS = [
  { minScore: 82, label: 'Strong Mutual Signal' },
  { minScore: 68, label: 'Warm Growth Signal' },
  { minScore: 52, label: 'Potential With Conditions' },
  { minScore: 0, label: 'Needs Clearer Evidence' },
] as const;

const SENSITIVE_SHARE_KEYS = [
  ['birth', 'date'],
  ['birth', 'time'],
  ['birth', 'location'],
  ['time', 'zone'],
  ['raw', 'question'],
  ['pro', 'mpt'],
  ['full', 'report'],
  ['full', 'result'],
  ['your', 'name'],
  ['their', 'name'],
  ['nick', 'name'],
  ['main', 'concern'],
  ['concern'],
].map((parts) => parts.join(''));

function normalizeKey(key: string) {
  return key.replace(/[\s_-]/g, '').toLowerCase();
}

function isSafeLoveTestShareKey(key: string) {
  return !SENSITIVE_SHARE_KEYS.includes(normalizeKey(key));
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function pickMatchLevel(score: number) {
  return MATCH_LEVELS.find((item) => score >= item.minScore)?.label ?? MATCH_LEVELS[MATCH_LEVELS.length - 1].label;
}

function normalizeText(value: string, fallback: string) {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned ? cleaned.slice(0, 140) : fallback;
}

function concernSignal(mainConcern: string): ConcernSignal {
  const concern = mainConcern.toLowerCase();
  if (/text|talk|message|communicat|reply|silent|ghost/.test(concern)) return 'communication';
  if (/trust|safe|cheat|honest|truth|secure/.test(concern)) return 'trust';
  if (/when|timing|wait|move|act|next/.test(concern)) return 'timing';
  if (/ex|return|reunion|again|cold|back/.test(concern)) return 'reunion';
  if (/future|commit|marry|long|serious|official/.test(concern)) return 'commitment';
  return 'unclear';
}

function concernInsight(signal: ConcernSignal) {
  switch (signal) {
    case 'communication':
      return 'Your strongest growth lever is communication: the next exchange should be specific enough to create evidence, but gentle enough to keep the channel open.';
    case 'trust':
      return 'Trust is the center of this question. Look for repeated behavior and emotional safety, not only intense apologies or persuasive words.';
    case 'timing':
      return 'Timing matters more than intensity here. A calm pause may reveal whether the bond can hold steady without constant pressure.';
    case 'reunion':
      return 'The past is part of the signal, but it should not lead the whole reading. A reunion only helps if it creates different behavior in the present.';
    case 'commitment':
      return 'Commitment is the real test. The match becomes clearer when both people define what consistency means in everyday terms.';
    default:
      return 'The question is still broad, so the cleanest signal will come from one observable next step rather than a perfect answer.';
  }
}

function concernAdjustment(signal: ConcernSignal) {
  switch (signal) {
    case 'trust':
      return -4;
    case 'reunion':
      return -3;
    case 'communication':
      return 2;
    case 'commitment':
      return 3;
    case 'timing':
      return 1;
    default:
      return 0;
  }
}

function isLegacyLoveTestInput(input: LoveTestInput | LegacyLoveTestInput): input is LegacyLoveTestInput {
  return 'stage' in input;
}

function fromLegacyInput(input: LegacyLoveTestInput): LoveTestInput {
  const statusByStage: Record<LoveTestStage, FateRelationshipStatus> = {
    early: 'crush',
    dating: 'dating',
    committed: 'dating',
    complicated: 'ambiguous',
  };

  return {
    yourName: 'You',
    theirName: 'Them',
    relationshipStatus: statusByStage[input.stage],
    mainConcern: `${input.communication} communication, ${input.rhythm} rhythm, ${input.conflict} conflict, ${input.values} values`,
  };
}

function legacyAdjustment(input: LegacyLoveTestInput) {
  const base =
    LEGACY_SCORE_TABLES.stage[input.stage] +
    LEGACY_SCORE_TABLES.communication[input.communication] +
    LEGACY_SCORE_TABLES.rhythm[input.rhythm] +
    LEGACY_SCORE_TABLES.conflict[input.conflict] +
    LEGACY_SCORE_TABLES.values[input.values];

  return Math.round((base - 80) / 8);
}

export function computeLoveTestResult(input: LoveTestInput | LegacyLoveTestInput): LoveTestResult {
  const normalizedInput = isLegacyLoveTestInput(input) ? fromLegacyInput(input) : input;
  const legacyDelta = isLegacyLoveTestInput(input) ? legacyAdjustment(input) : 0;
  const profile = STATUS_PROFILES[normalizedInput.relationshipStatus];
  const yourName = normalizeText(normalizedInput.yourName, 'You');
  const theirName = normalizeText(normalizedInput.theirName, 'Them');
  const mainConcern = normalizeText(normalizedInput.mainConcern, 'What is the real relationship signal?');
  const signal = concernSignal(mainConcern);
  const hashInput = `${yourName.toLowerCase()}:${theirName.toLowerCase()}:${normalizedInput.relationshipStatus}:${mainConcern.toLowerCase()}`;
  const variance = (stableHash(hashInput) % 11) - 5;
  const score = clampScore(profile.score + concernAdjustment(signal) + legacyDelta + variance);
  const matchLevel = pickMatchLevel(score);
  const actionSuggestion = profile.action;
  const insights = [
    profile.insight,
    concernInsight(signal),
    'Treat this as a reflection prompt, not a final verdict: the next real-world behavior matters more than the score.',
  ];

  return {
    id: `love_test_${stableHash(hashInput).toString(36)}`,
    score,
    matchLevel,
    archetype: profile.label,
    headline: profile.headline,
    oneLiner: `${matchLevel}. The useful question is what the connection does under gentle clarity.`,
    keywords: [...profile.keywords],
    insights,
    actionSuggestion,
    strengths: insights.slice(0, 2),
    watchout: insights[2],
    nextStep: actionSuggestion,
    upsellQuestion: 'Open the full Love Reading flow to turn this signal into a private relationship reading.',
    shareText: `I got ${profile.label} on TianJi Free Fate Match Test: ${score}/100. Try yours at https://tianji.love/love-test`,
  };
}

export function getLoveTestSharePayload(result: LoveTestResult, shareUrl: string): LoveTestSharePayload {
  return {
    score: result.score,
    headline: result.headline,
    oneLiner: result.oneLiner,
    archetype: result.archetype,
    keywords: result.keywords.slice(0, 4),
    shareUrl,
  };
}

function pickString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function pickNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && Number.isFinite(Number(value))) return Number(value);
  return fallback;
}

function pickKeywords(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 4);
}

export function sanitizeLoveTestSharePayload(input: Record<string, unknown>): LoveTestSharePayload {
  const safeData = Object.fromEntries(
    Object.entries(input).filter(([key]) => isSafeLoveTestShareKey(key))
  );

  return {
    score: clampScore(pickNumber(safeData.score, 72)),
    headline: pickString(safeData.headline, 'Your private love pattern is ready'),
    oneLiner: pickString(
      safeData.oneLiner,
      'A private Love Test signal you can share without exposing personal inputs.'
    ),
    archetype: pickString(safeData.archetype, 'Love Pattern'),
    keywords: pickKeywords(safeData.keywords),
    shareUrl: pickString(safeData.shareUrl, 'https://tianji.love/love-test'),
  };
}
