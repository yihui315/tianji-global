export type DegradedStatus = 'go' | 'no-go' | 'unknown';

export type EnvLike = Record<string, string | undefined>;

export const STAGING_DEGRADED_PAYMENT_UNAVAILABLE_CODE = 'payment_unavailable';
export const STAGING_DEGRADED_PROVIDER_DISABLED_CODE = 'ai_provider_live_disabled';

export function isFlagEnabled(env: EnvLike, name: string): boolean {
  return env[name] === 'true';
}

export function isStagingDegradedMode(env: EnvLike = process.env): boolean {
  return isFlagEnabled(env, 'STAGING_DEGRADED_MODE');
}

export function isAiProviderLiveDisabled(env: EnvLike = process.env): boolean {
  return isFlagEnabled(env, 'AI_PROVIDER_LIVE_DISABLED');
}

export function isStripeLiveDisabled(env: EnvLike = process.env): boolean {
  return isFlagEnabled(env, 'STRIPE_LIVE_DISABLED');
}

export function isEmailSendDisabled(env: EnvLike = process.env): boolean {
  return isFlagEnabled(env, 'EMAIL_SEND_DISABLED');
}

export function isSupabaseMutationDisabled(env: EnvLike = process.env): boolean {
  return isFlagEnabled(env, 'SUPABASE_MUTATION_DISABLED');
}

export function isStripePaymentAvailable(env: EnvLike = process.env): boolean {
  return Boolean(env.STRIPE_SECRET_KEY) && !isStripeLiveDisabled(env);
}

export function isProductionDeployBlocked(env: EnvLike = process.env): boolean {
  if (env.PRODUCTION_DEPLOY_ALLOWED === 'true') {
    return false;
  }

  return env.NODE_ENV === 'production' || isStagingDegradedMode(env);
}

export function degradedModeEnvStatus(env: EnvLike = process.env): DegradedStatus {
  const requiredFlags = [
    'STAGING_DEGRADED_MODE',
    'AI_PROVIDER_LIVE_DISABLED',
    'STRIPE_LIVE_DISABLED',
    'EMAIL_SEND_DISABLED',
    'SUPABASE_MUTATION_DISABLED',
  ];

  return requiredFlags.every((name) => isFlagEnabled(env, name)) ? 'go' : 'no-go';
}

export function buildPaymentUnavailableBody() {
  return {
    success: false,
    locked: true,
    error: 'Paid unlock is temporarily unavailable in staging degraded mode.',
    code: STAGING_DEGRADED_PAYMENT_UNAVAILABLE_CODE,
  };
}

export function buildProviderDisabledContent(): string {
  return 'AI provider live calls are disabled for staging degraded mode. This is a safe disabled response.';
}
