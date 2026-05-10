import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  DailyFortuneReport,
  DailyFortuneResult,
  FortuneLanguage,
  FortuneRemedyRule,
  FortuneDimension,
  FortuneTier,
  RemedyAction,
} from '@/types/daily-fortune';
import type {
  DailyFortuneReportRow,
  FortuneRemedyActionRow,
  FortuneRemedyRuleRow,
} from '@/lib/daily-fortune/db-types';

function fail<T>(code: string, message: string): DailyFortuneResult<T> {
  return { success: false, error: { code, message } };
}

function ok<T>(data: T): DailyFortuneResult<T> {
  return { success: true, data };
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asDimension(value: unknown): FortuneDimension {
  return value === 'love' || value === 'career' || value === 'wealth' || value === 'health'
    ? value
    : 'health';
}

function mapReportRow(row: DailyFortuneReportRow, remedies: RemedyAction[] = []): DailyFortuneReport {
  const scores = row.scores_json as unknown as DailyFortuneReport['scores'];
  return {
    id: row.id,
    userId: row.user_id,
    profileId: row.profile_id ?? undefined,
    date: row.date,
    timezone: row.timezone,
    systemType: row.system_type as DailyFortuneReport['systemType'],
    language: row.language as FortuneLanguage,
    tier: row.tier as FortuneTier,
    scores,
    headline: row.headline,
    summary: row.summary,
    drivers: asArray(row.drivers_json) as DailyFortuneReport['drivers'],
    riskTags: asArray(row.content_json?.riskTags) as DailyFortuneReport['riskTags'],
    remedies,
    disclaimer: row.disclaimer,
    generatedBy: row.generated_by,
    cacheKey: row.cache_key,
    content: row.content_json,
  };
}

function mapRuleRow(row: FortuneRemedyRuleRow): FortuneRemedyRule {
  return {
    id: row.id,
    dimension: row.dimension as FortuneRemedyRule['dimension'],
    riskTag: row.risk_tag,
    condition: asRecord(row.condition_json),
    priority: row.priority,
    templateKey: row.template_key,
    titleTemplate: row.title_template,
    bodyTemplate: row.body_template,
    reasonTemplate: row.reason_template,
    actionType: row.action_type as FortuneRemedyRule['actionType'],
    minTier: row.min_tier as FortuneTier,
    isActive: row.is_active,
  };
}

function mapActionRow(row: FortuneRemedyActionRow): RemedyAction {
  const cta = asRecord(row.cta_json);

  return {
    id: row.id,
    ruleId: row.rule_id ?? undefined,
    type: row.type as RemedyAction['type'],
    dimension: asDimension(cta.dimension),
    title: row.title,
    body: row.body,
    reason: row.reason,
    priority: row.priority as RemedyAction['priority'],
    sortOrder: row.sort_order,
    cta: cta as RemedyAction['cta'],
  };
}

function reportToRow(report: DailyFortuneReport): Omit<DailyFortuneReportRow, 'id' | 'created_at' | 'updated_at' | 'generated_at' | 'status'> & {
  id?: string;
  status: string;
} {
  return {
    id: report.id,
    user_id: report.userId,
    profile_id: report.profileId ?? null,
    date: report.date,
    timezone: report.timezone,
    system_type: report.systemType,
    language: report.language,
    tier: report.tier,
    overall_score: report.scores.overall,
    scores_json: report.scores as unknown as Record<string, unknown>,
    headline: report.headline,
    summary: report.summary,
    drivers_json: report.drivers,
    content_json: {
      ...(report.content ?? {}),
      riskTags: report.riskTags,
      locked: report.locked,
    },
    disclaimer: report.disclaimer,
    cache_key: report.cacheKey,
    generated_by: report.generatedBy,
    status: 'generated',
  };
}

export async function getDailyFortuneReport(params: {
  supabase: SupabaseClient;
  cacheKey: string;
}): Promise<DailyFortuneResult<DailyFortuneReport | null>> {
  const { data, error } = await params.supabase
    .from('daily_fortune_reports')
    .select('*')
    .eq('cache_key', params.cacheKey)
    .maybeSingle();

  if (error) {
    return fail('report_lookup_failed', error.message);
  }
  if (!data) {
    return ok(null);
  }

  const actions = await getRemedyActionsForReport({ supabase: params.supabase, reportId: data.id });
  if (!actions.success) {
    return actions;
  }

  return ok(mapReportRow(data as DailyFortuneReportRow, actions.data));
}

export async function getDailyFortuneReportById(params: {
  supabase: SupabaseClient;
  reportId: string;
}): Promise<DailyFortuneResult<DailyFortuneReport | null>> {
  const { data, error } = await params.supabase
    .from('daily_fortune_reports')
    .select('*')
    .eq('id', params.reportId)
    .maybeSingle();

  if (error) return fail('report_lookup_failed', error.message);
  if (!data) return ok(null);

  const actions = await getRemedyActionsForReport({ supabase: params.supabase, reportId: data.id });
  if (!actions.success) return actions;
  return ok(mapReportRow(data as DailyFortuneReportRow, actions.data));
}

export async function upsertDailyFortuneReport(params: {
  supabase: SupabaseClient;
  report: DailyFortuneReport;
}): Promise<DailyFortuneResult<DailyFortuneReport>> {
  const { data, error } = await params.supabase
    .from('daily_fortune_reports')
    .upsert(reportToRow(params.report), { onConflict: 'cache_key' })
    .select('*')
    .single();

  if (error || !data) {
    return fail('report_upsert_failed', error?.message ?? 'Report upsert returned no data.');
  }

  return ok(mapReportRow(data as DailyFortuneReportRow, params.report.remedies));
}

export async function insertRemedyActions(params: {
  supabase: SupabaseClient;
  reportId: string;
  actions: RemedyAction[];
}): Promise<DailyFortuneResult<RemedyAction[]>> {
  const deleteResult = await params.supabase.from('fortune_remedy_actions').delete().eq('report_id', params.reportId);
  if (deleteResult.error) {
    return fail('remedy_action_delete_failed', deleteResult.error.message);
  }

  if (params.actions.length === 0) {
    return ok([]);
  }

  const { data, error } = await params.supabase
    .from('fortune_remedy_actions')
    .insert(
      params.actions.map((action, index) => ({
        report_id: params.reportId,
        rule_id: action.ruleId ?? null,
        type: action.type,
        title: action.title,
        body: action.body,
        reason: action.reason,
        priority: action.priority,
        cta_json: { ...(action.cta ?? {}), dimension: action.dimension },
        sort_order: action.sortOrder ?? index,
      }))
    )
    .select('*');

  if (error) {
    return fail('remedy_action_insert_failed', error.message);
  }

  return ok(((data ?? []) as FortuneRemedyActionRow[]).map(mapActionRow));
}

export async function getActiveRemedyRules(params: {
  supabase: SupabaseClient;
}): Promise<DailyFortuneResult<FortuneRemedyRule[]>> {
  const { data, error } = await params.supabase
    .from('fortune_remedy_rules')
    .select('*')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (error) {
    return fail('rules_lookup_failed', error.message);
  }

  return ok(((data ?? []) as FortuneRemedyRuleRow[]).map(mapRuleRow));
}

export async function recordFortuneFeedback(params: {
  supabase: SupabaseClient;
  input: {
    reportId: string;
    actionId?: string;
    userId: string;
    helpful?: boolean;
    executed?: boolean;
    comment?: string;
  };
}): Promise<DailyFortuneResult<{ id: string }>> {
  const { data, error } = await params.supabase
    .from('fortune_feedback')
    .insert({
      report_id: params.input.reportId,
      action_id: params.input.actionId ?? null,
      user_id: params.input.userId,
      helpful: params.input.helpful ?? null,
      executed: params.input.executed ?? null,
      comment: params.input.comment ?? null,
    })
    .select('id')
    .single();

  if (error || !data) {
    return fail('feedback_insert_failed', error?.message ?? 'Feedback insert returned no data.');
  }

  return ok({ id: String(data.id) });
}

export async function recordPushDeliveryLog(params: {
  supabase: SupabaseClient;
  input: {
    reportId?: string;
    userId: string;
    channel: 'email' | 'telegram' | 'web_push' | 'in_app';
    target?: string;
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'skipped';
    providerMessageId?: string;
    errorMessage?: string;
    sentAt?: string;
  };
}): Promise<DailyFortuneResult<{ id: string }>> {
  const { data, error } = await params.supabase
    .from('push_delivery_logs')
    .insert({
      report_id: params.input.reportId ?? null,
      user_id: params.input.userId,
      channel: params.input.channel,
      target: params.input.target ?? null,
      status: params.input.status,
      provider_message_id: params.input.providerMessageId ?? null,
      error_message: params.input.errorMessage ?? null,
      sent_at: params.input.sentAt ?? null,
    })
    .select('id')
    .single();

  if (error || !data) {
    return fail('delivery_log_insert_failed', error?.message ?? 'Delivery log insert returned no data.');
  }

  return ok({ id: String(data.id) });
}

export async function getDailyFortuneHistory(params: {
  supabase: SupabaseClient;
  userId: string;
  limit: number;
  systemType?: string;
  dateBefore?: string;
}): Promise<DailyFortuneResult<DailyFortuneReport[]>> {
  let query = params.supabase
    .from('daily_fortune_reports')
    .select('*')
    .eq('user_id', params.userId)
    .order('date', { ascending: false })
    .limit(params.limit);

  if (params.systemType) query = query.eq('system_type', params.systemType);
  if (params.dateBefore) query = query.lt('date', params.dateBefore);

  const { data, error } = await query;
  if (error) return fail('history_lookup_failed', error.message);

  return ok(((data ?? []) as DailyFortuneReportRow[]).map((row) => mapReportRow(row, [])));
}

async function getRemedyActionsForReport(params: {
  supabase: SupabaseClient;
  reportId: string;
}): Promise<DailyFortuneResult<RemedyAction[]>> {
  const { data, error } = await params.supabase
    .from('fortune_remedy_actions')
    .select('*')
    .eq('report_id', params.reportId)
    .order('sort_order', { ascending: true });

  if (error) {
    return fail('remedy_action_lookup_failed', error.message);
  }

  return ok(((data ?? []) as FortuneRemedyActionRow[]).map(mapActionRow));
}
