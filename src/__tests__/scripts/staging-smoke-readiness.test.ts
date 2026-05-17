import { describe, expect, it } from 'vitest';
import { auditStagingEnvReadiness } from '../../../scripts/audit-staging-env-readiness';
import { createAiProviderSmokeResult } from '../../../scripts/smoke-ai-providers';
import { createStripeTestReadinessResult } from '../../../scripts/smoke-stripe-test-readiness';
import { buildStagingLaunchGateResult } from '../../../scripts/audit-staging-launch-gate';

describe('Phase 4 staging readiness scripts', () => {
  it('reports missing env names without exposing configured values', () => {
    const result = auditStagingEnvReadiness({
      NEXT_PUBLIC_APP_URL: 'https://staging.example.test',
      NEXTAUTH_URL: 'https://staging.example.test',
      NEXTAUTH_SECRET: 'do-not-print',
      OLLAMA_BASE_URL: 'http://127.0.0.1:11434',
    });

    expect(result.app).toBe('go');
    expect(result.ollama).toBe('go');
    expect(result.supabase).toBe('no-go');
    expect(result.missingNamesOnly).toContain('SUPABASE_SERVICE_ROLE_KEY');
    expect(JSON.stringify(result)).not.toContain('do-not-print');
    expect(JSON.stringify(result)).not.toContain('staging.example.test');
  });

  it('keeps AI provider smoke in dry-run mode by default', async () => {
    const result = await createAiProviderSmokeResult({
      AI_PROVIDER_SMOKE_MODE: undefined,
      AI_PROVIDER_SMOKE_ALLOW_LIVE: undefined,
      OLLAMA_BASE_URL: 'http://127.0.0.1:11434',
      DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
    });

    expect(result.mode).toBe('dry-run');
    expect(result.ollama).toBe('go');
    expect(result.deepseekFlash).toBe('unknown');
    expect(result.overall).toBe('conditional-go');
  });

  it('blocks Stripe test-live mode unless live execution is explicitly allowed', async () => {
    const result = await createStripeTestReadinessResult({
      STRIPE_SMOKE_MODE: 'test-live',
      STRIPE_SMOKE_ALLOW_LIVE: 'false',
      STRIPE_SECRET_KEY: 'sk_test_do_not_print',
    });

    expect(result.mode).toBe('test-live');
    expect(result.stripeKeysLookTestMode).toBe('unknown');
    expect(result.overall).toBe('no-go');
    expect(JSON.stringify(result)).not.toContain('sk_test_do_not_print');
  });

  it('prevents the aggregate gate from going green without staging smoke', () => {
    const result = buildStagingLaunchGateResult({
      envReadiness: 'go',
      askRevenueContract: 'conditional-go',
      drawRevenueContract: 'conditional-go',
      nonPaidStagingSmoke: 'not-run',
      aiProviderSmoke: 'conditional-go',
      stripeTestReadiness: 'conditional-go',
    });

    expect(result.nonPaidStagingSmoke).toBe('not-run');
    expect(result.overall).toBe('conditional-go');
  });
});
