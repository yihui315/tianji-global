import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 *
 * Lightweight liveness/readiness endpoint for uptime monitors and smoke
 * checks. Always returns HTTP 200 with a structured body so callers can
 * distinguish "reachable" from "fully healthy".
 *
 * Response shape:
 * - status:    'ok' | 'degraded'
 * - service:   fixed service name
 * - runtimeAt: server-side ISO timestamp when this handler ran
 * - checks: {
 *     version: 'ok' | 'degraded' (reflects /api/version contract)
 *   }
 * - degradedReasons: string[] (empty when status=ok)
 *
 * Unlike /api/version, this endpoint intentionally does NOT call into
 * external services (Supabase, Stripe, AI providers). It is meant to
 * stay green even when downstream integrations are temporarily broken,
 * so operators can isolate routing/build/version problems from real
 * dependency outages.
 *
 * Policy change (2026-07-23, PILOT-001 P2 recovery):
 * - US server smoke probes were failing with HTTP 500 from /api/version
 *   whenever SERVICE_VERSION_BUILT_AT was missing. This route exists
 *   to give operators a stable diagnostic surface that does not 500 on
 *   missing build metadata.
 */
export async function GET() {
  const runtimeAt = new Date().toISOString();
  const degradedReasons: string[] = [];

  const builtAtRaw = process.env.SERVICE_VERSION_BUILT_AT;
  let versionOk = true;
  if (!builtAtRaw) {
    versionOk = false;
    degradedReasons.push('SERVICE_VERSION_BUILT_AT is not set');
  } else if (!Number.isFinite(Date.parse(builtAtRaw))) {
    versionOk = false;
    degradedReasons.push('SERVICE_VERSION_BUILT_AT is not a valid ISO timestamp');
  }

  return NextResponse.json({
    status: versionOk ? 'ok' : 'degraded',
    service: 'tianji-love',
    runtimeAt,
    checks: {
      version: versionOk ? 'ok' : 'degraded',
    },
    degradedReasons,
  });
}