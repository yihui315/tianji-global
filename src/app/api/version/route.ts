import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/version
 *
 * Returns build-time metadata for smoke testing and audit.
 * - service: fixed service name
 * - commit: build SHA (from env, falls back to 'unknown')
 * - builtAt: build timestamp (from env, REQUIRED for production — endpoint exits 1 if missing in production)
 * - environment: deployment environment
 *
 * No secrets, paths, or full env vars are exposed.
 */
export async function GET() {
  const commit = process.env.SERVICE_VERSION_COMMIT ?? 'unknown';
  const builtAt = process.env.SERVICE_VERSION_BUILT_AT;
  const environment = process.env.NODE_ENV ?? 'development';
  const isProduction = environment === 'production';

  if (isProduction && !builtAt) {
    return NextResponse.json(
      {
        error: 'SERVICE_VERSION_BUILT_AT is not set in production',
        service: 'tianji-love',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    service: 'tianji-love',
    commit,
    builtAt: builtAt ?? new Date().toISOString(),
    environment,
  });
}
