import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

describe('GET /api/version — degraded-on-missing contract (PILOT-001 P2)', () => {
  beforeEach(() => {
    // Reset every variable we touch in this suite to a known baseline.
    delete process.env.SERVICE_VERSION_COMMIT;
    delete process.env.SERVICE_VERSION_BUILT_AT;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns status=ok with builtAt and runtimeAt when build metadata is present', async () => {
    process.env.SERVICE_VERSION_COMMIT = 'abc1234';
    process.env.SERVICE_VERSION_BUILT_AT = '2026-07-23T06:00:00.000Z';
    process.env.NODE_ENV = 'production';

    const { GET } = await import('@/app/api/version/route');
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      service: 'tianji-love',
      commit: 'abc1234',
      builtAt: '2026-07-23T06:00:00.000Z',
      environment: 'production',
      status: 'ok',
    });
    expect(body.degradedReasons).toEqual([]);
    expect(typeof body.runtimeAt).toBe('string');
    expect(Number.isFinite(Date.parse(body.runtimeAt))).toBe(true);
  });

  it('never returns HTTP 500 when SERVICE_VERSION_BUILT_AT is missing in production', async () => {
    process.env.SERVICE_VERSION_COMMIT = 'abc1234';
    // SERVICE_VERSION_BUILT_AT intentionally unset
    process.env.NODE_ENV = 'production';

    const { GET } = await import('@/app/api/version/route');
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.builtAt).toBeNull();
    expect(body.degradedReasons).toContain(
      'SERVICE_VERSION_BUILT_AT is not set in production'
    );
  });

  it('returns degraded with a development-specific reason in non-production', async () => {
    process.env.NODE_ENV = 'development';
    // SERVICE_VERSION_BUILT_AT intentionally unset

    const { GET } = await import('@/app/api/version/route');
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.builtAt).toBeNull();
    expect(body.degradedReasons).toContain(
      'SERVICE_VERSION_BUILT_AT is not set (development fallback in use)'
    );
  });

  it('falls back to commit=unknown and stays ok when only builtAt is supplied', async () => {
    process.env.SERVICE_VERSION_BUILT_AT = '2026-07-22T10:00:00.000Z';
    process.env.NODE_ENV = 'production';

    const { GET } = await import('@/app/api/version/route');
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.commit).toBe('unknown');
    expect(body.status).toBe('ok');
  });

  it('treats malformed SERVICE_VERSION_BUILT_AT as degraded rather than 500', async () => {
    process.env.SERVICE_VERSION_BUILT_AT = 'not-a-real-timestamp';
    process.env.NODE_ENV = 'production';

    const { GET } = await import('@/app/api/version/route');
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.builtAt).toBeNull();
    expect(body.degradedReasons).toContain(
      'SERVICE_VERSION_BUILT_AT is not a valid ISO timestamp'
    );
  });
});

describe('GET /api/health — degraded-on-missing-version contract (PILOT-001 P2)', () => {
  beforeEach(() => {
    delete process.env.SERVICE_VERSION_BUILT_AT;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns status=ok when build metadata is present', async () => {
    process.env.SERVICE_VERSION_BUILT_AT = '2026-07-23T06:00:00.000Z';

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      status: 'ok',
      service: 'tianji-love',
      checks: { version: 'ok' },
    });
    expect(body.degradedReasons).toEqual([]);
    expect(typeof body.runtimeAt).toBe('string');
    expect(Number.isFinite(Date.parse(body.runtimeAt))).toBe(true);
  });

  it('returns status=degraded with explicit reason when SERVICE_VERSION_BUILT_AT is missing', async () => {
    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.checks.version).toBe('degraded');
    expect(body.degradedReasons).toContain('SERVICE_VERSION_BUILT_AT is not set');
  });

  it('returns status=degraded when SERVICE_VERSION_BUILT_AT is malformed', async () => {
    process.env.SERVICE_VERSION_BUILT_AT = 'definitely-not-iso';

    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.status).toBe('degraded');
    expect(body.checks.version).toBe('degraded');
    expect(body.degradedReasons).toContain(
      'SERVICE_VERSION_BUILT_AT is not a valid ISO timestamp'
    );
  });
});