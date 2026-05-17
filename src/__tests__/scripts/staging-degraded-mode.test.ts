import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { auditStagingDegradedMode } from '../../../scripts/audit-staging-degraded-mode';
import { runStagingNonPaidSmoke } from '../../../scripts/smoke-staging-nonpaid';
import {
  buildProviderDisabledContent,
  degradedModeEnvStatus,
  isAiProviderLiveDisabled,
  isStripePaymentAvailable,
} from '@/lib/staging-degraded-mode';

const degradedEnv = {
  STAGING_DEGRADED_MODE: 'true',
  AI_PROVIDER_LIVE_DISABLED: 'true',
  STRIPE_LIVE_DISABLED: 'true',
  EMAIL_SEND_DISABLED: 'true',
  SUPABASE_MUTATION_DISABLED: 'true',
};

function stubDegradedEnv(extra: Record<string, string | undefined> = {}) {
  for (const [name, value] of Object.entries({ ...degradedEnv, ...extra })) {
    vi.stubEnv(name, value);
  }
}

describe('implementation-first staging degraded mode', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('degraded mode can pass public/free checks with Stripe missing', () => {
    const result = auditStagingDegradedMode({
      ...degradedEnv,
      STRIPE_SECRET_KEY: undefined,
    });

    expect(result.degradedModeEnv).toBe('go');
    expect(result.publicPagesCanLoad).toBe('go');
    expect(result.askPreviewCanRun).toBe('go');
    expect(result.drawPreviewCanRun).toBe('go');
    expect(isStripePaymentAvailable({ ...degradedEnv, STRIPE_SECRET_KEY: undefined })).toBe(false);
    expect(result.overall).toBe('conditional-go');
  });

  it('degraded mode can pass public/free checks with Email missing', () => {
    const result = auditStagingDegradedMode({
      ...degradedEnv,
      RESEND_API_KEY: undefined,
      EMAIL_FROM: undefined,
    });

    expect(result.degradedModeEnv).toBe('go');
    expect(result.askPreviewCanRun).toBe('go');
    expect(result.drawPreviewCanRun).toBe('go');
    expect(result.emailSendDisabled).toBe('unknown');
    expect(result.overall).toBe('conditional-go');
  });

  it('paid routes are locked when Stripe missing', () => {
    stubDegradedEnv({ STRIPE_SECRET_KEY: undefined });
    const result = auditStagingDegradedMode(process.env);

    expect(isStripePaymentAvailable(process.env)).toBe(false);
    expect(result.paidRoutesLockedWhenStripeMissing).toBe('unknown');
    expect(result.overall).toBe('conditional-go');
  });

  it('provider live calls are disabled unless explicitly enabled', () => {
    stubDegradedEnv();
    const result = auditStagingDegradedMode(process.env);

    expect(isAiProviderLiveDisabled(process.env)).toBe(true);
    expect(buildProviderDisabledContent()).toContain('AI provider live calls are disabled');
    expect(result.providerLiveCallsDisabled).toBe('unknown');
    expect(result.overall).toBe('conditional-go');
  });

  it('public flows do not require Supabase service role', async () => {
    const result = auditStagingDegradedMode({
      ...degradedEnv,
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      SUPABASE_SERVICE_ROLE_KEY: undefined,
    });

    expect(result.relationshipFreeCanRun).toBe('go');
    expect(result.publicPagesCanLoad).toBe('go');
    expect(result.overall).toBe('conditional-go');
  });

  it('output does not include secrets', async () => {
    const secret = 'sk_test_do_not_print';
    const audit = auditStagingDegradedMode({
      ...degradedEnv,
      STRIPE_SECRET_KEY: secret,
      RESEND_API_KEY: 're_secret_do_not_print',
      NEXTAUTH_SECRET: 'auth_secret_do_not_print',
    });
    const smoke = await runStagingNonPaidSmoke({
      ...degradedEnv,
      STAGING_BASE_URL: undefined,
      STRIPE_SECRET_KEY: secret,
    });

    const output = `${JSON.stringify(audit)}\n${JSON.stringify(smoke)}`;
    expect(degradedModeEnvStatus(degradedEnv)).toBe('go');
    expect(output).not.toContain(secret);
    expect(output).not.toContain('re_secret_do_not_print');
    expect(output).not.toContain('auth_secret_do_not_print');
  });

  it('production deploy remains blocked', () => {
    const result = auditStagingDegradedMode({
      ...degradedEnv,
      NODE_ENV: 'production',
      PRODUCTION_DEPLOY_ALLOWED: undefined,
    });

    expect(result.productionDeployBlocked).toBe('go');
    expect(result.overall).toBe('conditional-go');
  });
});
