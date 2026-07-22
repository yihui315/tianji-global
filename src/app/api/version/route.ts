import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/version
 *
 * Returns build-time metadata for smoke testing and audit.
 *
 * Response shape (always 200 in this route; status is carried in body):
 * - service:      fixed service name
 * - commit:       build SHA (from env, falls back to 'unknown')
 * - builtAt:      build timestamp (from env) or null when unset
 * - runtimeAt:    server-side ISO timestamp when this handler ran
 * - environment:  deployment environment
 * - status:       'ok' | 'degraded'
 * - degradedReasons: string[] (empty when status=ok)
 *
 * Policy change (2026-07-23, PILOT-001 P2 recovery):
 * - Never return HTTP 500 from this route. Health probes and smoke
 *   checks must be able to detect "degraded but reachable" so operators
 *   can tell a misconfigured build apart from a fully broken service.
 * - In production, when SERVICE_VERSION_BUILT_AT is missing, we return
 *   status='degraded' with an explicit degradedReason. Callers that
 *   require an authoritative build stamp should inspect the body.
 * - No secrets, paths, or full env vars are exposed.
 */
export async function GET() {
  const commit = process.env.SERVICE_VERSION_COMMIT ?? 'unknown';
  const builtAtRaw = process.env.SERVICE_VERSION_BUILT_AT;
  const environment = process.env.NODE_ENV ?? 'development';
  const isProduction = environment === 'production';

  const degradedReasons: string[] = [];
  if (!builtAtRaw) {
    degradedReasons.push(
      isProduction
        ? 'SERVICE_VERSION_BUILT_AT is not set in production'
        : 'SERVICE_VERSION_BUILT_AT is not set (development fallback in use)'
    );
  }

  // Validate the timestamp shape if provided. A malformed value is treated
  // as missing rather than propagated, to keep this route resilient.
  let builtAt: string | null = null;
  if (builtAtRaw) {
    const parsed = Date.parse(builtAtRaw);
    if (Number.isFinite(parsed)) {
      builtAt = new Date(parsed).toISOString();
    } else {
      degradedReasons.push('SERVICE_VERSION_BUILT_AT is not a valid ISO timestamp');
    }
  }

  const status = degradedReasons.length === 0 ? 'ok' : 'degraded';

  return NextResponse.json({
    service: 'tianji-love',
    commit,
    builtAt,
    runtimeAt: new Date().toISOString(),
    environment,
    status,
    degradedReasons,
  });
}