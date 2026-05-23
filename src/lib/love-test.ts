export const LOVE_TEST_SHARE_FORMATS = ['og', 'wechat_moments', 'xiaohongshu', 'douyin'] as const;

export type LoveTestShareFormat = (typeof LOVE_TEST_SHARE_FORMATS)[number];

export type LoveTestStage = 'early' | 'dating' | 'committed' | 'complicated';
export type LoveTestCommunication = 'direct' | 'gentle' | 'guarded' | 'playful';
export type LoveTestRhythm = 'fast' | 'steady' | 'slow' | 'mixed';
export type LoveTestConflict = 'repair' | 'space' | 'spark' | 'avoid';
export type LoveTestValues = 'security' | 'growth' | 'adventure' | 'devotion';

export interface LoveTestInput {
  stage: LoveTestStage;
  communication: LoveTestCommunication;
  rhythm: LoveTestRhythm;
  conflict: LoveTestConflict;
  values: LoveTestValues;
}

export interface LoveTestResult {
  id: string;
  score: number;
  archetype: string;
  headline: string;
  oneLiner: string;
  keywords: string[];
  strengths: string[];
  watchout: string;
  nextStep: string;
  upsellQuestion: string;
}

export interface LoveTestSharePayload {
  score: number;
  headline: string;
  oneLiner: string;
  archetype: string;
  keywords: string[];
  shareUrl: string;
}

const SCORE_TABLES = {
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

const ARCHETYPES = [
  {
    id: 'steady_bridge',
    minScore: 82,
    label: 'Steady Bridge',
    headline: 'Your connection gets stronger when the next step is explicit.',
    oneLiner: 'The bond has real repair capacity, but it still needs small agreements instead of assumed mind-reading.',
    keywords: ['steady pace', 'repair', 'clarity', 'trust'],
    strengths: ['You can name needs without making the whole bond feel fragile.', 'The connection improves when both people know the next practical step.'],
    watchout: 'Do not let politeness replace precision. Vague peace can still hide a mismatch.',
    nextStep: 'Pick one recurring friction point and agree on a 7-day experiment for handling it differently.',
    upsellQuestion: 'Ask: what relationship pattern should I understand before our next important conversation?',
  },
  {
    id: 'tender_fire',
    minScore: 68,
    label: 'Tender Fire',
    headline: 'There is warmth here, but pacing decides whether it becomes trust.',
    oneLiner: 'The attraction can be useful if you slow the moment enough to hear what each person is protecting.',
    keywords: ['chemistry', 'pace', 'care', 'choice'],
    strengths: ['The emotional signal is strong enough to notice without forcing certainty.', 'The relationship has room for a clearer rhythm if both people stop rushing the verdict.'],
    watchout: 'Intensity can feel like evidence. It is still only a signal until behavior becomes consistent.',
    nextStep: 'Use one calm check-in to ask what pace would feel honest, not just exciting.',
    upsellQuestion: 'Ask: is this relationship asking for action, patience, or a different frame?',
  },
  {
    id: 'magnetic_mirror',
    minScore: 52,
    label: 'Magnetic Mirror',
    headline: 'This connection reflects a pattern you are ready to see.',
    oneLiner: 'The useful signal is not whether the bond is perfect. It is what it reveals about your choices under pressure.',
    keywords: ['mirror', 'pattern', 'pressure', 'self-trust'],
    strengths: ['The connection can reveal where you abandon your own pace.', 'There is enough signal to learn from it without handing it control.'],
    watchout: 'Avoid treating uncertainty as a command to chase clarity from the other person.',
    nextStep: 'Write down the one behavior you need to observe before making a bigger emotional investment.',
    upsellQuestion: 'Ask: what is the hidden tension behind why I keep returning to this person?',
  },
  {
    id: 'quiet_crossroads',
    minScore: 0,
    label: 'Quiet Crossroads',
    headline: 'Your clearest answer may come from reducing pressure first.',
    oneLiner: 'This bond needs less guessing and more evidence. The next move should make reality easier to see.',
    keywords: ['crossroads', 'space', 'evidence', 'boundaries'],
    strengths: ['You are close to seeing what is real if you stop negotiating with the fantasy version.', 'A smaller test can protect your dignity and your energy.'],
    watchout: 'Do not let silence, distance, or mixed signals become a story you have to solve alone.',
    nextStep: 'Choose one boundary or request that would clarify the connection within the next week.',
    upsellQuestion: 'Ask: what is the smallest action that would make this relationship clearer without forcing an outcome?',
  },
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

function pickArchetype(score: number) {
  return ARCHETYPES.find((item) => score >= item.minScore) ?? ARCHETYPES[ARCHETYPES.length - 1];
}

export function computeLoveTestResult(input: LoveTestInput): LoveTestResult {
  const base =
    SCORE_TABLES.stage[input.stage] +
    SCORE_TABLES.communication[input.communication] +
    SCORE_TABLES.rhythm[input.rhythm] +
    SCORE_TABLES.conflict[input.conflict] +
    SCORE_TABLES.values[input.values];
  const hashInput = `${input.stage}:${input.communication}:${input.rhythm}:${input.conflict}:${input.values}`;
  const variance = (stableHash(hashInput) % 9) - 4;
  const score = clampScore(base + variance);
  const archetype = pickArchetype(score);

  return {
    id: `love_test_${stableHash(hashInput).toString(36)}`,
    score,
    archetype: archetype.label,
    headline: archetype.headline,
    oneLiner: archetype.oneLiner,
    keywords: [...archetype.keywords],
    strengths: [...archetype.strengths],
    watchout: archetype.watchout,
    nextStep: archetype.nextStep,
    upsellQuestion: archetype.upsellQuestion,
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
