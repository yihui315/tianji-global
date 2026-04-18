import type { SupabaseClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import type { Entitlement, EntitlementFeatures, PlanType } from '@/types/entitlement';
import type { ModuleResult, ModuleType, NormalizedPayload, TimelinePhase, UnifiedSection } from '@/types/module-result';
import type {
  ActionProfile,
  CareerProfile,
  DestinyProfile,
  IdentityProfile,
  RelationshipProfile,
  TimingProfile,
  WealthProfile,
} from '@/types/unified-profile';
import type { UserProfile } from '@/types/user-profile';

type JsonRecord = Record<string, unknown>;

interface PlatformUserRow {
  id: string;
  email: string;
  name?: string | null;
  avatar_url?: string | null;
  provider?: string | null;
  subscription_tier?: string | null;
  timezone?: string | null;
}

export interface PlatformContext {
  sessionUserId: string;
  sessionUserEmail: string;
  supabase: SupabaseClient;
  user: PlatformUserRow;
}

export const PLAN_FEATURES: Record<PlanType, EntitlementFeatures> = {
  free: {
    unifiedProfile: false,
    deepRelationship: false,
    longTimeline: false,
    premiumAdvice: false,
    exportPdf: false,
    multiProfile: false,
    advisorMode: false,
  },
  premium: {
    unifiedProfile: true,
    deepRelationship: true,
    longTimeline: true,
    premiumAdvice: true,
    exportPdf: false,
    multiProfile: true,
    advisorMode: false,
  },
  pro: {
    unifiedProfile: true,
    deepRelationship: true,
    longTimeline: true,
    premiumAdvice: true,
    exportPdf: true,
    multiProfile: true,
    advisorMode: true,
  },
};

function asRecord(value: unknown): JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.filter((item): item is string => typeof item === 'string' && item.length > 0);
  return items.length > 0 ? items : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asTimelinePhases(value: unknown): TimelinePhase[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const phases = value
    .map((item) => {
      const record = asRecord(item);
      const range = asString(record.range);
      const label = asString(record.label);
      const description = asString(record.description);
      if (!range || !label || !description) {
        return null;
      }

      return { range, label, description };
    })
    .filter((item): item is TimelinePhase => item !== null);

  return phases.length > 0 ? phases : undefined;
}

export function coerceUnifiedSection(value: unknown): UnifiedSection {
  const record = asRecord(value);

  return {
    headline: asString(record.headline),
    summary: asString(record.summary),
    strengths: asStringArray(record.strengths),
    risks: asStringArray(record.risks),
    opportunities: asStringArray(record.opportunities),
    advice: asStringArray(record.advice),
    confidence: asNumber(record.confidence),
  };
}

function coerceIdentityProfile(value: unknown): IdentityProfile {
  const record = asRecord(value);
  const section = coerceUnifiedSection(value);
  const elementBalanceRecord = asRecord(record.elementBalance);

  const elementBalance = Object.entries(elementBalanceRecord).reduce<Record<string, number>>((acc, [key, entry]) => {
    const parsed = asNumber(entry);
    if (parsed !== undefined) {
      acc[key] = parsed;
    }
    return acc;
  }, {});

  return {
    ...section,
    traits: asStringArray(record.traits),
    corePattern: asString(record.corePattern),
    elementBalance: Object.keys(elementBalance).length > 0 ? elementBalance : undefined,
  };
}

function coerceRelationshipProfile(value: unknown): RelationshipProfile {
  const record = asRecord(value);
  return {
    ...coerceUnifiedSection(value),
    style: asString(record.style),
    attractionPattern: asString(record.attractionPattern),
    conflictPattern: asString(record.conflictPattern),
  };
}

function coerceCareerProfile(value: unknown): CareerProfile {
  const record = asRecord(value);
  return {
    ...coerceUnifiedSection(value),
    workStyle: asString(record.workStyle),
    growthPattern: asString(record.growthPattern),
  };
}

function coerceWealthProfile(value: unknown): WealthProfile {
  const record = asRecord(value);
  return {
    ...coerceUnifiedSection(value),
    moneyPattern: asString(record.moneyPattern),
    volatility: asString(record.volatility),
  };
}

function coerceTimingProfile(value: unknown): TimingProfile {
  const record = asRecord(value);
  return {
    ...coerceUnifiedSection(value),
    currentWindow: asString(record.currentWindow),
    bestPeriods: asStringArray(record.bestPeriods),
    pressurePeriods: asStringArray(record.pressurePeriods),
  };
}

function coerceActionProfile(value: unknown): ActionProfile {
  const record = asRecord(value);
  return {
    ...coerceUnifiedSection(value),
    doMoreOf: asStringArray(record.doMoreOf),
    avoid: asStringArray(record.avoid),
    discussSoon: asStringArray(record.discussSoon),
  };
}

export function coerceNormalizedPayload(value: unknown): NormalizedPayload {
  const record = asRecord(value);
  const summaryRecord = asRecord(record.summary);
  const timelineRecord = asRecord(record.timeline);

  return {
    summary: {
      headline: asString(summaryRecord.headline),
      oneLiner: asString(summaryRecord.oneLiner),
      keywords: asStringArray(summaryRecord.keywords),
    },
    structure: asRecord(record.structure),
    chart: asRecord(record.chart),
    identity: coerceUnifiedSection(record.identity),
    relationship: coerceUnifiedSection(record.relationship),
    career: coerceUnifiedSection(record.career),
    wealth: coerceUnifiedSection(record.wealth),
    timing: coerceUnifiedSection(record.timing),
    advice: coerceUnifiedSection(record.advice),
    risk: coerceUnifiedSection(record.risk),
    timeline: {
      currentPhase: asString(timelineRecord.currentPhase),
      next30Days: asString(timelineRecord.next30Days),
      next90Days: asString(timelineRecord.next90Days),
      phases: asTimelinePhases(timelineRecord.phases),
    },
  };
}

export function normalizePlan(value: unknown): PlanType {
  return value === 'premium' || value === 'pro' ? value : 'free';
}

export function getFeaturesForPlan(plan: PlanType): EntitlementFeatures {
  return { ...PLAN_FEATURES[plan] };
}

function coerceFeatureOverrides(value: unknown): Partial<EntitlementFeatures> {
  const record = asRecord(value);

  return {
    unifiedProfile: asBoolean(record.unifiedProfile),
    deepRelationship: asBoolean(record.deepRelationship),
    longTimeline: asBoolean(record.longTimeline),
    premiumAdvice: asBoolean(record.premiumAdvice),
    exportPdf: asBoolean(record.exportPdf),
    multiProfile: asBoolean(record.multiProfile),
    advisorMode: asBoolean(record.advisorMode),
  };
}

export function mapEntitlementRow(value: unknown, fallbackTier?: unknown, fallbackUserId?: string): Entitlement {
  const record = asRecord(value);
  const plan = normalizePlan(record.plan ?? fallbackTier);
  const features = {
    ...getFeaturesForPlan(plan),
    ...coerceFeatureOverrides(record.features),
  };

  return {
    id: asString(record.id) ?? `fallback-${plan}`,
    userId: asString(record.user_id) ?? fallbackUserId ?? '',
    plan,
    features,
    startsAt: asString(record.starts_at),
    expiresAt: asString(record.expires_at),
    isActive: asBoolean(record.is_active) ?? true,
  };
}

export function getVisibleSections(plan: PlanType): { visibleSections: string[]; lockedSections: string[] } {
  if (plan === 'free') {
    return {
      visibleSections: ['identity', 'timing'],
      lockedSections: ['relationship', 'career', 'wealth', 'actions', 'risk'],
    };
  }

  return {
    visibleSections: ['identity', 'relationship', 'career', 'wealth', 'timing', 'actions', 'risk'],
    lockedSections: [],
  };
}

export function isModuleType(value: string): value is ModuleType {
  return [
    'bazi',
    'ziwei',
    'western',
    'numerology',
    'fortune',
    'relationship',
    'tarot',
    'yijing',
    'fengshui',
    'electional',
    'transit',
    'solar-return',
  ].includes(value);
}

export function toLegacyReadingType(moduleType: ModuleType): string | null {
  switch (moduleType) {
    case 'bazi':
    case 'ziwei':
    case 'western':
    case 'tarot':
    case 'yijing':
      return moduleType;
    default:
      return null;
  }
}

export function buildDefaultNormalizedPayload(
  title?: string,
  summary?: string,
  rawPayload?: Record<string, unknown>
): NormalizedPayload {
  return {
    summary: {
      headline: title,
      oneLiner: summary,
      keywords: asStringArray(rawPayload?.keywords),
    },
    structure: asRecord(rawPayload?.structure),
    chart: asRecord(rawPayload?.chart),
    identity: {},
    relationship: {},
    career: {},
    wealth: {},
    timing: {},
    advice: {},
    risk: {},
    timeline: {},
  };
}

export function mapUserProfileRow(value: unknown): UserProfile {
  const record = asRecord(value);

  return {
    id: asString(record.id) ?? '',
    userId: asString(record.user_id) ?? '',
    profileType: record.profile_type === 'other' ? 'other' : 'self',
    displayName: asString(record.display_name),
    nickname: asString(record.nickname),
    birthDate: asString(record.birth_date) ?? '',
    birthTime: asString(record.birth_time),
    birthLocation: asString(record.birth_location),
    timezone: asString(record.timezone),
    lat: asNumber(record.lat),
    lng: asNumber(record.lng),
    language: record.language === 'zh' ? 'zh' : 'en',
    gender: asString(record.gender),
    isPrimary: asBoolean(record.is_primary) ?? false,
    createdAt: asString(record.created_at) ?? '',
    updatedAt: asString(record.updated_at) ?? '',
  };
}

export function mapModuleResultRow(value: unknown): ModuleResult {
  const record = asRecord(value);
  const moduleType = asString(record.module_type) ?? '';
  const safeModuleType: ModuleType = isModuleType(moduleType) ? moduleType : 'bazi';

  return {
    id: asString(record.id) ?? '',
    sessionId: asString(record.session_id) ?? '',
    userId: asString(record.user_id) ?? '',
    profileId: asString(record.profile_id) ?? '',
    moduleType: safeModuleType,
    version: asString(record.version) ?? 'v1',
    title: asString(record.title),
    summary: asString(record.summary),
    rawPayload: asRecord(record.raw_payload),
    normalizedPayload: coerceNormalizedPayload(record.normalized_payload),
    confidenceScore: asNumber(record.confidence_score),
    isPremium: asBoolean(record.is_premium) ?? false,
    createdAt: asString(record.created_at) ?? '',
    updatedAt: asString(record.updated_at) ?? '',
  };
}

export function mapDestinyProfileRow(value: unknown): DestinyProfile {
  const record = asRecord(value);
  const sourceModules = Array.isArray(record.source_modules)
    ? record.source_modules.filter((item): item is ModuleType => typeof item === 'string' && isModuleType(item))
    : [];

  return {
    id: asString(record.id) ?? '',
    userId: asString(record.user_id) ?? '',
    profileId: asString(record.profile_id) ?? '',
    identitySummary: coerceIdentityProfile(record.identity_summary),
    energyProfile: asRecord(record.energy_profile),
    relationshipProfile: coerceRelationshipProfile(record.relationship_profile),
    careerProfile: coerceCareerProfile(record.career_profile),
    wealthProfile: coerceWealthProfile(record.wealth_profile),
    timingProfile: coerceTimingProfile(record.timing_profile),
    actionProfile: coerceActionProfile(record.action_profile),
    riskProfile: coerceUnifiedSection(record.risk_profile),
    sourceModules,
    confidenceScore: asNumber(record.confidence_score) ?? 0,
    lastRecomputedAt: asString(record.last_recomputed_at),
    createdAt: asString(record.created_at) ?? '',
    updatedAt: asString(record.updated_at) ?? '',
  };
}

export async function getPlatformContext(): Promise<PlatformContext | null> {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured.');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        email: session.user.email,
        name: session.user.name ?? null,
        avatar_url: session.user.image ?? null,
        provider: 'google',
      },
      { onConflict: 'email' }
    )
    .select('*')
    .single();

  if (error || !data) {
    throw error ?? new Error('Failed to resolve platform user.');
  }

  const user = data as PlatformUserRow;

  return {
    sessionUserId: session.user.id ?? '',
    sessionUserEmail: session.user.email,
    supabase,
    user,
  };
}
