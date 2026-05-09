import { randomUUID } from 'node:crypto';
import { getPool } from '@/lib/db';
import { trackLoveFunnelEvent } from '@/lib/love-funnel-analytics';
import {
  generateLoveReport,
  type LoveReport,
  type LoveReportInput,
} from '@/lib/love-report-generator';

export type ReportJobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ReportJob {
  id: string;
  sessionId: string;
  userId: string | null;
  readingMode: LoveReportInput['readingMode'];
  status: ReportJobStatus;
  result: LoveReport | null;
  error: string | null;
  aiProvider: string | null;
  aiModel: string | null;
  aiInputTokens: number | null;
  aiOutputTokens: number | null;
  aiCostUSD: number | null;
  aiLatencyMs: number | null;
  createdAt: string;
  updatedAt: string;
}

const memoryJobs =
  ((globalThis as typeof globalThis & {
    __tianjiLoveReportJobs?: Map<string, ReportJob & { input: LoveReportInput }>;
  }).__tianjiLoveReportJobs ??= new Map<string, ReportJob & { input: LoveReportInput }>());
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function optionalUuid(value?: string | null) {
  return value && uuidPattern.test(value) ? value : null;
}

export async function createReportJob(input: LoveReportInput): Promise<ReportJob> {
  const now = new Date().toISOString();
  const job: ReportJob & { input: LoveReportInput } = {
    id: randomUUID(),
    sessionId: input.sessionId,
    userId: input.userId ?? null,
    readingMode: input.readingMode,
    status: 'queued',
    result: null,
    error: null,
    aiProvider: null,
    aiModel: null,
    aiInputTokens: null,
    aiOutputTokens: null,
    aiCostUSD: null,
    aiLatencyMs: null,
    createdAt: now,
    updatedAt: now,
    input,
  };

  if (!hasDatabaseUrl()) {
    memoryJobs.set(job.id, job);
    return job;
  }

  await getPool().query(
    `
      insert into report_jobs (id, user_id, session_id, status, input)
      values ($1, $2, $3, 'queued', $4)
      on conflict (session_id) do update set updated_at = report_jobs.updated_at
    `,
    [job.id, optionalUuid(input.userId), input.sessionId, JSON.stringify(input)]
  );

  return (await getReportJobBySession(input.sessionId)) ?? job;
}

function rowToReportJob(row: Record<string, unknown>): ReportJob {
  const input = row.input as Partial<LoveReportInput> | undefined;
  return {
    id: String(row.id),
    sessionId: String(row.session_id),
    userId: row.user_id ? String(row.user_id) : null,
    readingMode: input?.readingMode === 'compatibility' ? 'compatibility' : 'solo',
    status: row.status as ReportJobStatus,
    result: (row.result as LoveReport | null) ?? null,
    error: row.error ? String(row.error) : null,
    aiProvider: row.ai_provider ? String(row.ai_provider) : null,
    aiModel: row.ai_model ? String(row.ai_model) : null,
    aiInputTokens:
      row.ai_input_tokens === null || row.ai_input_tokens === undefined
        ? null
        : Number(row.ai_input_tokens),
    aiOutputTokens:
      row.ai_output_tokens === null || row.ai_output_tokens === undefined
        ? null
        : Number(row.ai_output_tokens),
    aiCostUSD:
      row.ai_cost_usd === null || row.ai_cost_usd === undefined
        ? null
        : Number(row.ai_cost_usd),
    aiLatencyMs:
      row.ai_latency_ms === null || row.ai_latency_ms === undefined
        ? null
        : Number(row.ai_latency_ms),
    createdAt:
      row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt:
      row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

export async function getReportJob(id: string): Promise<ReportJob | null> {
  const memoryJob = memoryJobs.get(id);
  if (memoryJob) {
    const { input: _input, ...job } = memoryJob;
    return job;
  }

  if (!hasDatabaseUrl()) return null;

  const result = await getPool().query(
    'select id, user_id, session_id, input, status, result, error, ai_provider, ai_model, ai_input_tokens, ai_output_tokens, ai_cost_usd, ai_latency_ms, created_at, updated_at from report_jobs where id = $1',
    [id]
  );
  const row = result.rows[0];
  if (!row) return null;

  return rowToReportJob(row);
}

export async function getReportJobBySession(sessionId: string): Promise<ReportJob | null> {
  for (const memoryJob of memoryJobs.values()) {
    if (memoryJob.sessionId === sessionId) {
      const { input: _input, ...job } = memoryJob;
      return job;
    }
  }

  if (!hasDatabaseUrl()) return null;

  const result = await getPool().query(
    `
      select id, user_id, session_id, input, status, result, error, ai_provider, ai_model, ai_input_tokens, ai_output_tokens, ai_cost_usd, ai_latency_ms, created_at, updated_at
      from report_jobs
      where session_id = $1
      order by created_at desc
      limit 1
    `,
    [sessionId]
  );
  const row = result.rows[0];
  if (!row) return null;

  return rowToReportJob(row);
}

export async function ensureReportJobForSession(input: LoveReportInput): Promise<ReportJob> {
  const existing = await getReportJobBySession(input.sessionId);
  if (existing) return existing;

  return createReportJob(input);
}

export async function runReportJob(id: string): Promise<void> {
  const memoryJob = memoryJobs.get(id);
  if (memoryJob) {
    if (memoryJob.status === 'completed') return;
    memoryJob.status = 'running';
    memoryJob.updatedAt = new Date().toISOString();
    try {
      memoryJob.result = await generateLoveReport(memoryJob.input);
      memoryJob.aiProvider = memoryJob.result.generationMeta.provider ?? null;
      memoryJob.aiModel = memoryJob.result.generationMeta.model ?? null;
      memoryJob.aiInputTokens = memoryJob.result.generationMeta.tokensUsed?.input ?? null;
      memoryJob.aiOutputTokens = memoryJob.result.generationMeta.tokensUsed?.output ?? null;
      memoryJob.aiCostUSD = memoryJob.result.generationMeta.costUSD ?? null;
      memoryJob.aiLatencyMs =
        memoryJob.result.generationMeta.latencyMs === undefined
          ? null
          : Math.round(memoryJob.result.generationMeta.latencyMs);
      memoryJob.status = 'completed';
      memoryJob.error = null;
      await trackLoveFunnelEvent('love_report_completed', {
        jobId: memoryJob.id,
        sessionId: memoryJob.sessionId,
        readingMode: memoryJob.readingMode,
        source: memoryJob.result.generationMeta.source,
        model: memoryJob.aiModel,
        costUSD: memoryJob.aiCostUSD,
      });
    } catch (error) {
      memoryJob.status = 'failed';
      memoryJob.error = error instanceof Error ? error.message : 'Report generation failed';
    }
    memoryJob.updatedAt = new Date().toISOString();
    return;
  }

  if (!hasDatabaseUrl()) return;

  const { rows } = await getPool().query('select input, status from report_jobs where id = $1', [id]);
  if (rows[0]?.status === 'completed') return;
  const input = rows[0]?.input as LoveReportInput | undefined;
  if (!input) return;

  await getPool().query("update report_jobs set status = 'running', updated_at = now() where id = $1", [
    id,
  ]);

  try {
    const report = await generateLoveReport(input);
    const meta = report.generationMeta;
    await getPool().query(
      `
        update report_jobs
        set status = 'completed',
            result = $2,
            ai_provider = $3,
            ai_model = $4,
            ai_input_tokens = $5,
            ai_output_tokens = $6,
            ai_cost_usd = $7,
            ai_latency_ms = $8,
            error = null,
            updated_at = now()
        where id = $1
      `,
      [
        id,
        JSON.stringify(report),
        meta.provider ?? null,
        meta.model ?? null,
        meta.tokensUsed?.input ?? null,
        meta.tokensUsed?.output ?? null,
        meta.costUSD ?? null,
        meta.latencyMs === undefined ? null : Math.round(meta.latencyMs),
      ]
    );
    await trackLoveFunnelEvent('love_report_completed', {
      jobId: id,
      sessionId: input.sessionId,
      readingMode: input.readingMode,
      source: report.generationMeta.source,
      model: meta.model ?? null,
      costUSD: meta.costUSD ?? null,
    });
  } catch (error) {
    await getPool().query(
      `
        update report_jobs
        set status = 'failed',
            error = $2,
            updated_at = now()
        where id = $1
      `,
      [id, error instanceof Error ? error.message : 'Report generation failed']
    );
  }
}
