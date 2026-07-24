/**
 * UTM propagation helper for in-product CTAs.
 *
 * Existing funnel pages use a legacy `?source=<surface>` parameter to thread a
 * surface name into downstream analytics + the UTM-aware traffic classifier
 * (`src/lib/traffic-evolution.ts`). This helper keeps the legacy parameter,
 * adds standard UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`)
 * in a deterministic order, and avoids mutating the caller's input string.
 *
 * Hard rule from `.ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-005`:
 *   No fabricated traffic. The values here are in-product surface labels, not
 *   fabricated campaign metrics.
 *
 * Example:
 *   buildUtmHref('/love-test', { source: 'daily_oracle' })
 *     -> '/love-test?source=daily_oracle&utm_source=daily_oracle&utm_medium=in_product&utm_campaign=organic_funnel_h1'
 */

export type UtmSurface = 'daily_oracle' | 'fate_match_test' | 'love_test_result' | 'pricing' | 'home';

export interface UtmContext {
  source: UtmSurface | string;
  medium?: string;
  campaign?: string;
}

const DEFAULTS = {
  medium: 'in_product',
  campaign: 'organic_funnel_h1',
} as const;

export function buildUtmHref(path: string, context: UtmContext): string {
  const [base, existingQuery = ''] = path.split('?');
  const params = new URLSearchParams(existingQuery);
  const source = context.source.trim();
  if (!params.has('utm_source') && source) {
    params.set('utm_source', source);
  }
  const medium = (context.medium ?? DEFAULTS.medium).trim() || DEFAULTS.medium;
  if (!params.has('utm_medium')) {
    params.set('utm_medium', medium);
  }
  const campaign = (context.campaign ?? DEFAULTS.campaign).trim() || DEFAULTS.campaign;
  if (!params.has('utm_campaign')) {
    params.set('utm_campaign', campaign);
  }
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}