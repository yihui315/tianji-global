/**
 * Strict UTM whitelist for localized alias redirects.
 *
 * T0-018 (SIAS H6, 2026-07-24) requires that localized alias redirects
 * preserve only the five approved marketing attribution parameters and
 * drop anything else. This is intentionally a strict whitelist:
 *
 *   - Sensitive / arbitrary params (token, userId, name, birthDate, ...)
 *     must NEVER cross an alias boundary.
 *   - The destination locale is fixed by the redirect target (e.g. /en/).
 *     Incoming `lang` parameters are dropped to avoid duplicate or
 *     conflicting language hints.
 *
 * Helpers are pure and side-effect free so they can be tested hermetically
 * and reused by any localized alias server component.
 */

export const REDIRECT_QUERY_WHITELIST = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type RedirectWhitelistedParam = (typeof REDIRECT_QUERY_WHITELIST)[number];

/** Keys that MUST NOT survive an alias redirect, even if present. */
const ALWAYS_DROPPED_KEYS = new Set([
  'lang',
  'token',
  'userId',
  'name',
  'birthDate',
  'birthTime',
  'birth_date',
  'birth_time',
  'birthLocation',
  'birth_location',
  'relationship',
  'relationshipId',
  'relationship_id',
  'session',
  'sessionId',
  'session_id',
  'id',
  'cancelled',
]);

const WHITELIST_SET = new Set<string>(REDIRECT_QUERY_WHITELIST);

function toRecord(input: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!input) return out;
  const obj = input as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (Array.isArray(value)) {
      // Pick the FIRST NON-EMPTY string entry so empty sentinels from
      // upstream form parsers don't shadow real values. Missing or
      // all-empty arrays are simply omitted — callers must never see
      // an empty string in the produced URL.
      for (const entry of value) {
        if (typeof entry === 'string' && entry.length > 0) {
          out[key] = entry;
          break;
        }
      }
      continue;
    }
    if (typeof value === 'string' && value.length > 0) {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Extract only the whitelisted attribution params from an arbitrary
 * query-like input. Values are normalized to a single string (first entry
 * of any array); empty values are skipped. The locale `lang` key and
 * every sensitive/arbitrary key are dropped.
 */
export function pickRedirectQuery(input: unknown): Record<string, string> {
  const source = toRecord(input);
  const picked: Record<string, string> = {};
  for (const key of REDIRECT_QUERY_WHITELIST) {
    const value = source[key];
    if (typeof value === 'string' && value.length > 0) {
      picked[key] = value;
    }
  }
  return picked;
}

/**
 * Returns true when a given query-like input contains at least one
 * whitelisted attribution parameter with a non-empty value.
 */
export function hasRedirectQuery(input: unknown): boolean {
  return Object.keys(pickRedirectQuery(input)).length > 0;
}

/**
 * Build the search portion of a redirect URL from whitelisted params.
 * Returns "" when no params survive; otherwise returns a string that
 * already begins with "?" and uses standard URL encoding for keys and
 * values (spaces become %20; reserved characters are percent-encoded).
 */
export function buildRedirectSearch(input: unknown): string {
  const picked = pickRedirectQuery(input);
  const params = new URLSearchParams();
  for (const key of REDIRECT_QUERY_WHITELIST) {
    const value = picked[key];
    if (typeof value === 'string' && value.length > 0) {
      params.append(key, value);
    }
  }
  const query = params.toString();
  return query.length > 0 ? `?${query}` : '';
}

/**
 * Convenience: build the full redirect href (path + search), always
 * starting with "/" and applying the whitelist.
 */
export function buildRedirectHref(path: string, input: unknown): string {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  return `${safePath}${buildRedirectSearch(input)}`;
}

/** For tests and audits: list every key that will be dropped on purpose. */
export const REDIRECT_ALWAYS_DROPPED_KEYS: ReadonlySet<string> = new Set(ALWAYS_DROPPED_KEYS);

/** For tests and audits: the whitelist as a set. */
export const REDIRECT_WHITELIST_SET: ReadonlySet<string> = WHITELIST_SET;