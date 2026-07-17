export const CONSENT_STORAGE_KEY = 'tianji_cookie_consent';
export const CONSENT_CHANGE_EVENT = 'tianji:consent-changed';
export const CONSENT_VERSION = 3;

export type ConsentPreferences = {
  version: typeof CONSENT_VERSION;
  necessary: true;
  analytics: boolean;
  updatedAt: string;
};

export const DEFAULT_CONSENT_PREFERENCES: ConsentPreferences = {
  version: CONSENT_VERSION,
  necessary: true,
  analytics: false,
  updatedAt: '',
};

export function createConsentPreferences(
  analytics: boolean,
  updatedAt = new Date().toISOString()
): ConsentPreferences {
  return {
    version: CONSENT_VERSION,
    necessary: true,
    analytics,
    updatedAt,
  };
}

export function parseConsentPreferences(raw: string | null): ConsentPreferences | null {
  if (!raw) return null;

  // The legacy banner only disclosed experience/traffic analytics. Preserve
  // that choice without silently treating it as advertising consent.
  if (raw === 'accepted') return createConsentPreferences(true);

  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      necessary?: boolean;
      analytics?: boolean;
      advertising?: boolean;
      updatedAt?: string;
    };
    if (
      parsed.version === 2 &&
      parsed.necessary === true &&
      typeof parsed.analytics === 'boolean' &&
      typeof parsed.updatedAt === 'string'
    ) {
      return createConsentPreferences(parsed.analytics, parsed.updatedAt);
    }

    if (
      parsed.version !== CONSENT_VERSION ||
      parsed.necessary !== true ||
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.updatedAt !== 'string'
    ) {
      return null;
    }

    return parsed as ConsentPreferences;
  } catch {
    return null;
  }
}

export function serializeConsentPreferences(preferences: ConsentPreferences): string {
  return JSON.stringify(preferences);
}
