import type { SupabaseClient } from '@supabase/supabase-js';
import { generateDailyFortuneReport, buildDailyFortuneCacheKey } from '@/lib/daily-fortune/generator';
import { generateRemedyActions } from '@/lib/daily-fortune/remedy-engine';
import { maybeEnhanceDailyFortuneNarrative } from '@/lib/daily-fortune/nlg';
import { loadDailyFortuneContext } from '@/lib/daily-fortune/context';
import {
  getActiveRemedyRules,
  getDailyFortuneReport,
  getDailyFortuneReportById,
  getDailyFortuneHistory,
  insertRemedyActions,
  upsertDailyFortuneReport,
} from '@/lib/daily-fortune/repository';
import type {
  DailyFortuneReport,
  DailyFortuneResult,
  DailyFortuneSystemType,
  FortuneLanguage,
  FortuneTier,
  RemedyAction,
} from '@/types/daily-fortune';

export function isDailyFortuneEnabled(): boolean {
  return process.env.DAILY_FORTUNE_ENABLED === 'true';
}

export function isDailyFortuneDispatchEnabled(): boolean {
  return process.env.DAILY_FORTUNE_DISPATCH_ENABLED === 'true';
}

export function isDailyFortuneNlgEnabled(): boolean {
  return process.env.DAILY_FORTUNE_NLG_ENABLED === 'true';
}

export function normalizeDailyFortuneSystemType(value: string | null | undefined): DailyFortuneSystemType {
  return value === 'relationship' || value === 'tarot' || value === 'integrated' ? value : 'bazi';
}

export function normalizeDailyFortuneLanguage(value: unknown): FortuneLanguage {
  return value === 'en' ? 'en' : 'zh';
}

export function normalizeDailyFortuneTier(value: unknown): FortuneTier {
  return value === 'premium' || value === 'pro' ? value : 'free';
}

export function todayIsoDate(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function limitReportForTier(report: DailyFortuneReport): DailyFortuneReport {
  if (report.tier !== 'free') {
    return {
      ...report,
      remedies: report.remedies.slice(0, 5),
    };
  }

  return {
    ...report,
    drivers: report.drivers.slice(0, 1),
    remedies: report.remedies.slice(0, 2),
    locked: {
      drivers: true,
      remedies: true,
      sections: true,
      reason: 'premium_required',
    },
  };
}

function fail<T>(code: string, message: string): DailyFortuneResult<T> {
  return { success: false, error: { code, message } };
}

export async function getOrCreateDailyFortuneReport(params: {
  supabase: SupabaseClient;
  userId: string;
  profileId?: string;
  date?: string;
  timezone?: string;
  systemType?: DailyFortuneSystemType;
  language?: FortuneLanguage;
  tier?: FortuneTier;
  forceRegenerate?: boolean;
}): Promise<DailyFortuneResult<DailyFortuneReport>> {
  const context = await loadDailyFortuneContext({
    supabase: params.supabase,
    userId: params.userId,
    profileId: params.profileId,
  });
  const date = params.date || todayIsoDate();
  const systemType = params.systemType ?? 'bazi';
  const language = params.language ?? context.language;
  const tier = params.tier ?? context.tier;
  const profileId = params.profileId ?? context.profileId;
  const timezone = params.timezone ?? context.timezone;
  const cacheKey = buildDailyFortuneCacheKey({
    userId: params.userId,
    profileId,
    date,
    systemType,
    language,
    tier,
  });

  if (!params.forceRegenerate) {
    const existing = await getDailyFortuneReport({ supabase: params.supabase, cacheKey });
    if (!existing.success) return existing;
    if (existing.data) return { success: true, data: limitReportForTier(existing.data) };
  }

  const rules = await getActiveRemedyRules({ supabase: params.supabase });
  if (!rules.success) return rules;

  const baseReport = generateDailyFortuneReport({
    userId: params.userId,
    profileId,
    date,
    timezone,
    systemType,
    language,
    tier,
    destinyProfile: context.signals,
    recentModuleResults: context.recentModuleResults,
  });

  const remedies: RemedyAction[] = generateRemedyActions({
    riskTags: baseReport.riskTags,
    scores: baseReport.scores,
    tier,
    activeRules: rules.data,
  });
  const report = await maybeEnhanceDailyFortuneNarrative({ ...baseReport, remedies });

  const upserted = await upsertDailyFortuneReport({
    supabase: params.supabase,
    report,
  });
  if (!upserted.success) return upserted;

  const insertedActions = await insertRemedyActions({
    supabase: params.supabase,
    reportId: upserted.data.id ?? '',
    actions: remedies,
  });
  if (!insertedActions.success) return insertedActions;

  return {
    success: true,
    data: limitReportForTier({
      ...upserted.data,
      remedies: insertedActions.data.length ? insertedActions.data : remedies,
    }),
  };
}

export async function getDailyFortuneHistoryForUser(params: {
  supabase: SupabaseClient;
  userId: string;
  limit?: number;
  systemType?: string;
  dateBefore?: string;
}): Promise<DailyFortuneResult<DailyFortuneReport[]>> {
  const limit = Math.min(Math.max(params.limit ?? 14, 1), 90);
  return getDailyFortuneHistory({
    supabase: params.supabase,
    userId: params.userId,
    limit,
    systemType: params.systemType,
    dateBefore: params.dateBefore,
  });
}

export async function getOwnedDailyFortuneReport(params: {
  supabase: SupabaseClient;
  reportId: string;
  userId: string;
}): Promise<DailyFortuneResult<DailyFortuneReport>> {
  const report = await getDailyFortuneReportById({ supabase: params.supabase, reportId: params.reportId });
  if (!report.success) return report;
  if (!report.data) return fail('not_found', 'Daily fortune report was not found.');
  if (report.data.userId !== params.userId) return fail('forbidden', 'You cannot access this report.');
  return { success: true, data: report.data };
}
