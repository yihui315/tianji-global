import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import type { NormalizedPayload } from '@/types/module-result';
import {
  getTrafficExperience,
  trafficSourceSchema,
  trafficStrategySchema,
  type TrafficSource,
  type TrafficStrategy,
} from '@/lib/traffic-evolution';

export const destinyScanInputSchema = z.object({
  birthDate: z.string().min(1, 'birthDate is required'),
  birthTime: z.string().trim().optional().default(''),
  birthLocation: z.string().trim().min(1, 'birthLocation is required'),
  traffic: z
    .object({
      source: trafficSourceSchema,
      strategy: trafficStrategySchema,
      campaign: z.string().trim().max(120).optional().default(''),
    })
    .optional(),
});

export type DestinyScanInput = z.infer<typeof destinyScanInputSchema>;

export interface DestinyEnergyPoint {
  label: string;
  value: number;
}

export interface DestinyTrendPoint {
  label: string;
  value: number;
  note: string;
}

export interface DestinySection {
  headline: string;
  summary: string;
  bullets: string[];
}

export interface DestinyScanPreview {
  id: string;
  meta: {
    trafficSource: TrafficSource;
    strategy: TrafficStrategy;
  };
  summary: {
    headline: string;
    oneLiner: string;
    compatibilityScore: number;
  };
  energy: {
    overall: number;
    points: DestinyEnergyPoint[];
  };
  timeline: {
    headline: string;
    currentWindow: string;
    trend: DestinyTrendPoint[];
  };
  teaser: {
    relationship: string;
    wealth: string;
    actions: string;
  };
  share: {
    title: string;
    oneLiner: string;
    caption: string;
  };
}

export interface DestinyScanResult extends DestinyScanPreview {
  relationship: DestinySection;
  wealth: DestinySection;
  actions: DestinySection;
}

interface EncryptedPayload {
  birthDate: string;
  birthTime?: string;
  birthLocation: string;
  trafficSource?: TrafficSource;
  strategy?: TrafficStrategy;
  campaign?: string;
  createdAt: string;
}

const HEADLINES = [
  'You are not behind. You are built for a later bloom.',
  'Your life path accelerates when you stop copying faster people.',
  'The turning point you want is closer than your current rhythm suggests.',
  'You carry a long-wave destiny, not a short-wave one.',
];

const ONE_LINERS = [
  'Your strongest seasons arrive through timing, not force.',
  'You grow in phases, and the next phase rewards consistency.',
  'The pattern in your life is depth first, visibility second.',
  'Momentum comes when your emotional timing and practical timing finally align.',
];

const WINDOW_LINES = [
  'The next 90 days favor deliberate repositioning over impulsive leaps.',
  'A practical reset opens a cleaner growth lane in the next 6 to 8 weeks.',
  'Your strongest timing window is tied to one confident long-term move, not many small ones.',
  'You are entering a cleaner cycle for relationships and money choices.',
];

const RELATIONSHIP_HEADLINES = [
  'You bond slowly, but the people who stay with you tend to stay deeply.',
  'You are wired for emotional precision, not casual attachment.',
  'Your strongest relationships come from clarity, not chemistry alone.',
  'You attract intensity, but you thrive with steadiness.',
];

const WEALTH_HEADLINES = [
  'Your money pattern improves in waves, not a straight climb.',
  'You earn more when you choose leverage over overwork.',
  'Wealth comes after structure for you, not before it.',
  'Your best financial periods follow simplification, not expansion at any cost.',
];

const ACTION_HEADLINES = [
  'Your next breakthrough is operational, not mystical.',
  'The fastest upgrade is to narrow your focus and hold it longer.',
  'You do not need more ideas right now. You need one committed move.',
  'The right action plan is smaller and more repeatable than you think.',
];

const TIKTOK_ONE_LINERS = [
  'People read your energy before they read your words.',
  'Your next shift lands fast once the right timing opens.',
  'You do not need a new identity. You need the right window.',
  'The part that changes everything for you is closer than it looks.',
];

const SEO_ONE_LINERS = [
  'Your next growth phase favors structure, timing, and selective decisions.',
  'The strongest part of your path comes from depth, not noise.',
  'The next cycle rewards clarity over speed and focus over expansion.',
  'You make your best progress when timing and discipline move together.',
];

const DIRECT_ONE_LINERS = [
  'This is a premium pattern: slower to reveal, stronger once it compounds.',
  'Your best outcomes come when you stop chasing broad attention and choose depth.',
  'The next high-value move is not louder. It is more deliberate.',
  'Your curve is built for compounding, not constant urgency.',
];

const TRAFFIC_TIMELINES: Record<TrafficSource, string[]> = {
  tiktok: [
    'A visible emotional shift is building over the next 30 to 90 days.',
    'Your next momentum spike comes when one delayed decision finally lands.',
    'The curve is bending upward, but the trigger point is still hidden.',
  ],
  seo: [
    'The next 90 days reward practical timing and fewer scattered decisions.',
    'Your strongest near-term gains come from one clear repositioning move.',
    'The most useful window ahead is structured, not chaotic.',
  ],
  direct: [
    'Your premium timing window opens when one disciplined decision replaces three reactive ones.',
    'This cycle favors quality, leverage, and fewer but stronger moves.',
    'The next phase is less about discovery and more about execution.',
  ],
  referral: [
    'The next visible shift is strong enough to share before it is fully explained.',
    'Your timing curve has a social peak coming soon.',
    'The most shareable part of the story is still ahead of you.',
  ],
  unknown: WINDOW_LINES,
};

const RELATIONSHIP_BULLETS = [
  'Slow down the start, then deepen with intention.',
  'Choose partners who respect timing, not urgency.',
  'Treat clarity as chemistry, not as a mood killer.',
  'Your future self benefits from cleaner emotional boundaries now.',
];

const WEALTH_BULLETS = [
  'Build systems before you chase scale.',
  'One premium offer usually beats three scattered ones.',
  'Your strongest money weeks follow focused decision windows.',
  'Reduce noise so the profitable pattern becomes obvious.',
];

const ACTION_BULLETS = [
  'Pick one 30-day priority and let the rest become background.',
  'Track progress weekly, not emotionally.',
  'Protect one uninterrupted hour for long-range work each day.',
  'Say no faster to tasks that do not move timing, money, or relationships.',
];

const TREND_LABELS = ['Now', '2W', '1M', '2M', '3M', '4M', '6M'];
const ENERGY_LABELS = ['Identity', 'Love', 'Wealth', 'Timing'];

function getSecretKey() {
  const secret =
    process.env.DESTINY_SCAN_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'tianji-destiny-scan-fallback-secret';

  return createHash('sha256').update(secret).digest();
}

function normalizeInput(input: DestinyScanInput) {
  return `${input.birthDate}|${input.birthTime || 'unknown'}|${input.birthLocation.trim().toLowerCase()}`;
}

function createSeed(input: DestinyScanInput) {
  const digest = createHash('sha256').update(normalizeInput(input)).digest();
  return digest.readUInt32BE(0);
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length];
}

function score(seed: number, min: number, max: number, offset = 0) {
  const span = max - min + 1;
  const normalizedSeed = seed >>> (offset % 16);
  return min + ((normalizedSeed + offset * 17) % span);
}

function buildEnergy(seed: number) {
  const points = ENERGY_LABELS.map((label, index) => ({
    label,
    value: score(seed, 52, 92, index * 3),
  }));

  const overall = Math.round(points.reduce((total, item) => total + item.value, 0) / points.length);

  return { overall, points };
}

function buildTrend(seed: number): DestinyTrendPoint[] {
  const baseline = score(seed, 46, 64, 5);

  return TREND_LABELS.map((label, index) => {
    const swing = Math.sin((seed % 11) + index * 0.9) * 14;
    const momentum = index * score(seed, 2, 5, 7);
    const value = Math.max(32, Math.min(96, Math.round(baseline + swing + momentum)));

    return {
      label,
      value,
      note:
        value >= 75
          ? 'Expansion'
          : value >= 60
            ? 'Alignment'
            : value >= 45
              ? 'Reset'
              : 'Pressure',
    };
  });
}

function buildSection(
  headline: string,
  summary: string,
  bullets: string[],
  seed: number
): DestinySection {
  return {
    headline,
    summary,
    bullets: bullets
      .map((entry, index) => pick([entry, bullets[(index + 1) % bullets.length]], seed, index))
      .filter((entry, index, entries) => entries.indexOf(entry) === index)
      .slice(0, 3),
  };
}

export function encodeDestinyScanId(input: DestinyScanInput) {
  const payload: EncryptedPayload = {
    birthDate: input.birthDate,
    birthTime: input.birthTime || undefined,
    birthLocation: input.birthLocation,
    trafficSource: input.traffic?.source,
    strategy: input.traffic?.strategy,
    campaign: input.traffic?.campaign || undefined,
    createdAt: new Date().toISOString(),
  };

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getSecretKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function decodeDestinyScanId(id: string): DestinyScanInput | null {
  try {
    const buffer = Buffer.from(id, 'base64url');
    const iv = buffer.subarray(0, 12);
    const tag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', getSecretKey(), iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const payload = JSON.parse(decrypted.toString('utf8')) as EncryptedPayload;

    return destinyScanInputSchema.parse({
      birthDate: payload.birthDate,
      birthTime: payload.birthTime ?? '',
      birthLocation: payload.birthLocation,
      traffic:
        payload.trafficSource && payload.strategy
          ? {
              source: payload.trafficSource,
              strategy: payload.strategy,
              campaign: payload.campaign ?? '',
            }
          : undefined,
    });
  } catch {
    return null;
  }
}

export function buildDestinyScan(input: DestinyScanInput, id = encodeDestinyScanId(input)): DestinyScanResult {
  const seed = createSeed(input);
  const energy = buildEnergy(seed);
  const trend = buildTrend(seed);
  const compatibilityScore = score(seed, 68, 91, 9);
  const source = input.traffic?.source ?? 'unknown';
  const strategy = input.traffic?.strategy ?? 'minimal_clean';
  const experience = getTrafficExperience(source);

  const summaryHeadline = pick(HEADLINES, seed, 1);
  const oneLinerPool =
    source === 'tiktok'
      ? TIKTOK_ONE_LINERS
      : source === 'seo'
        ? SEO_ONE_LINERS
        : source === 'direct'
          ? DIRECT_ONE_LINERS
          : ONE_LINERS;
  const oneLiner = pick(oneLinerPool, seed, 3);
  const timelineHeadline = pick(TRAFFIC_TIMELINES[source] ?? WINDOW_LINES, seed, 5);
  const relationshipHeadline = pick(RELATIONSHIP_HEADLINES, seed, 7);
  const wealthHeadline = pick(WEALTH_HEADLINES, seed, 11);
  const actionsHeadline = pick(ACTION_HEADLINES, seed, 13);

  return {
    id,
    meta: {
      trafficSource: source,
      strategy,
    },
    summary: {
      headline: summaryHeadline,
      oneLiner,
      compatibilityScore,
    },
    energy,
    timeline: {
      headline: timelineHeadline,
      currentWindow: `${trend[2]?.note ?? 'Alignment'} -> ${trend[4]?.note ?? 'Expansion'}`,
      trend,
    },
    teaser: {
      relationship: `${relationshipHeadline} ${experience.result.teaserSuffix}`,
      wealth: `${wealthHeadline} ${source === 'seo' ? 'The concrete explanation is still locked.' : 'Your strongest money window is still locked.'}`,
      actions: `${actionsHeadline} ${source === 'direct' ? 'The premium move is still hidden.' : 'The concrete 30-day move is still locked.'}`,
    },
    relationship: buildSection(
      relationshipHeadline,
      `${relationshipHeadline} Your emotional life works best when pace and trust rise together instead of being forced to peak at the start.`,
      RELATIONSHIP_BULLETS,
      seed
    ),
    wealth: buildSection(
      wealthHeadline,
      `${wealthHeadline} Your money pattern stabilizes when you remove scattered commitments and let one compounding system do the heavy lifting.`,
      WEALTH_BULLETS,
      seed + 1
    ),
    actions: buildSection(
      actionsHeadline,
      `${actionsHeadline} The next seven days are for simplifying, the next thirty are for compounding, and the next ninety are for visible results.`,
      ACTION_BULLETS,
      seed + 2
    ),
    share: {
      title: summaryHeadline,
      oneLiner,
      caption: `${experience.result.shareCaptionPrefix} Compatibility signal: ${compatibilityScore}%`,
    },
  };
}

export function toDestinyPreview(result: DestinyScanResult): DestinyScanPreview {
  return {
    id: result.id,
    meta: result.meta,
    summary: result.summary,
    energy: result.energy,
    timeline: result.timeline,
    teaser: result.teaser,
    share: result.share,
  };
}

export function buildDestinyScanNormalizedPayload(result: DestinyScanResult): NormalizedPayload {
  return {
    summary: {
      headline: result.summary.headline,
      oneLiner: result.summary.oneLiner,
      keywords: [result.meta.trafficSource, result.meta.strategy, result.timeline.currentWindow],
    },
    structure: {
      trafficSource: result.meta.trafficSource,
      strategy: result.meta.strategy,
      energyOverall: result.energy.overall,
      compatibilityScore: result.summary.compatibilityScore,
    },
    chart: {
      energy: result.energy,
      timelineTrend: result.timeline.trend,
    },
    identity: {
      headline: result.summary.headline,
      summary: result.summary.oneLiner,
      strengths: result.energy.points
        .filter((point) => point.value >= 70)
        .map((point) => `${point.label} ${point.value}`),
    },
    relationship: {
      headline: result.relationship.headline,
      summary: result.relationship.summary,
      strengths: result.relationship.bullets,
    },
    wealth: {
      headline: result.wealth.headline,
      summary: result.wealth.summary,
      opportunities: result.wealth.bullets,
    },
    timing: {
      headline: result.timeline.headline,
      summary: result.timeline.currentWindow,
      opportunities: result.timeline.trend
        .filter((point) => point.value >= 70)
        .map((point) => `${point.label}: ${point.note}`),
      risks: result.timeline.trend
        .filter((point) => point.value < 50)
        .map((point) => `${point.label}: ${point.note}`),
    },
    advice: {
      headline: result.actions.headline,
      summary: result.actions.summary,
      advice: result.actions.bullets,
    },
    risk: {
      risks: [
        result.teaser.relationship,
        result.teaser.wealth,
      ],
    },
    timeline: {
      currentPhase: result.timeline.currentWindow,
      next30Days: result.timeline.headline,
      phases: result.timeline.trend.map((point) => ({
        range: point.label,
        label: point.note,
        description: `${point.label}: ${point.value}`,
      })),
    },
  };
}
