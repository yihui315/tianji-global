import { describe, expect, it } from 'vitest';

import { buildAuthConfig, getAuthProviderStatus } from '@/lib/auth-options';

const baseEnv = {
  AUTH_SECRET: 'test-auth-secret',
} as NodeJS.ProcessEnv;

function providerIds(config: ReturnType<typeof buildAuthConfig>) {
  return config.providers.map((provider) => (typeof provider === 'function' ? provider().id : provider.id));
}

describe('auth provider configuration', () => {
  it('does not expose fake providers when auth env is missing', () => {
    const config = buildAuthConfig(baseEnv);
    const status = getAuthProviderStatus(baseEnv);

    expect(status.googleReady).toBe(false);
    expect(status.resendReady).toBe(false);
    expect(config.providers).toHaveLength(0);
    expect(config.adapter).toBeUndefined();
  });

  it('enables Google only when both OAuth values are configured', () => {
    const missingSecret = buildAuthConfig({
      ...baseEnv,
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: undefined,
    });
    const ready = buildAuthConfig({
      ...baseEnv,
      GOOGLE_CLIENT_ID: 'client-id',
      GOOGLE_CLIENT_SECRET: 'client-secret',
    });

    expect(providerIds(missingSecret)).toEqual([]);
    expect(providerIds(ready)).toEqual(['google']);
  });

  it('enables Resend only when email, database, and send guard allow it', () => {
    const disabled = buildAuthConfig({
      ...baseEnv,
      DATABASE_URL: 'postgresql://example',
      RESEND_API_KEY: 're_test',
      EMAIL_FROM: 'TianJi <noreply@example.test>',
      EMAIL_SEND_DISABLED: 'true',
    });
    const ready = buildAuthConfig({
      ...baseEnv,
      DATABASE_URL: 'postgresql://example',
      RESEND_API_KEY: 're_test',
      EMAIL_FROM: 'TianJi <noreply@example.test>',
      EMAIL_SEND_DISABLED: 'false',
    });

    expect(providerIds(disabled)).toEqual([]);
    expect(disabled.adapter).toBeUndefined();
    expect(providerIds(ready)).toEqual(['resend']);
    expect(ready.adapter).toBeDefined();
  });
});
