/**
 * Pricing surface constants (T0-012, SIAS H4 2026-07-24).
 *
 * Centralizes the surface labels that the pricing page uses for both:
 *   1. `buildUtmHref(..., { source })` (the canonical UTM source triplet)
 *   2. `trackRevenueFunnelEvent(..., { surface })` (the funnel-event payload)
 *
 * Why this file exists: before H3 / H4, the pricing page used:
 *   - `utm_source=pricing` (via H3 buildUtmHref integration)
 *   - `surface: 'pricing_page'` for `pricing_viewed`
 *   - `surface: 'pricing_plan'` for `unlock_click`
 *   - `source: 'pricing_plan_click'` for `login_started`
 *
 * Three different surface labels for the same surface means downstream
 * attribution cannot reliably correlate "pricing_viewed" with the click
 * that started it. This file freezes the canonical mapping so a future
 * round cannot silently drift the labels again.
 *
 * Backward compatibility: the historical surface labels
 * (`'pricing_page'`, `'pricing_plan'`, `'pricing_plan_click'`) are still
 * exported as the values the funnel events use today. New code that
 * wants to correlate across surfaces should derive the canonical UTM
 * source via `PRICING_UTM_SOURCE` and then look up the funnel surface
 * via `PRICING_SURFACE_LABELS`.
 *
 * Hard rule from `.ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-005`:
 *   No fabricated traffic. These labels are in-product surface labels,
 *   not fabricated campaign metrics.
 *
 * Boundaries:
 *   - Does NOT change PLANS / PRODUCT_CATALOG / stripe.ts.
 *   - Does NOT change the pricing page text / FAQ / prices.
 *   - Does NOT change the Stripe checkout endpoint.
 *   - Does NOT change the funnel event names themselves.
 */

/**
 * Canonical UTM source for the pricing surface.
 * MUST match the `source` passed to `buildUtmHref` in `pricing/page.tsx`.
 * MUST match the `utm_source` query param in the resulting URL.
 */
export const PRICING_UTM_SOURCE = 'pricing' as const;

/**
 * Canonical campaign tag for pricing UTM triplets.
 * Matches `utm_campaign=organic_funnel_h1` (the H1 default).
 */
export const PRICING_UTM_CAMPAIGN = 'organic_funnel_h1' as const;

/**
 * Canonical medium for pricing UTM triplets.
 * Matches `utm_medium=in_product` (the H1 default).
 */
export const PRICING_UTM_MEDIUM = 'in_product' as const;

/**
 * The funnel-event `surface` payload values used by `pricing/page.tsx`.
 * These are the historical labels — kept verbatim so the existing
 * analytics pipeline does not break. New code should derive them
 * from `PRICING_UTM_SOURCE` when correlating across surfaces.
 */
export const PRICING_SURFACE_LABELS = {
  /** `pricing_viewed` — fired once per visit via `useEffect`. */
  pricingViewed: 'pricing_page',
  /** `unlock_click` — fired when the user clicks a plan subscribe button. */
  unlockClick: 'pricing_plan',
  /** `login_started` — fired when the user is bounced through /login first. */
  loginStarted: 'pricing_plan_click',
} as const;

/**
 * Type alias for the surface labels. Use this in event payload types
 * so a typo at a call site fails the type check.
 */
export type PricingSurfaceLabel =
  (typeof PRICING_SURFACE_LABELS)[keyof typeof PRICING_SURFACE_LABELS];

/**
 * Sanity guard: every label in PRICING_SURFACE_LABELS must NOT equal
 * the canonical UTM source. They live in different attribution layers
 * (UTM = URL query param, surface = funnel-event payload) so the
 * downstream classifier expects two distinct strings per surface.
 *
 * If a future round changes the labels, this guard fails first to
 * surface the intent. The historical separation is intentional:
 *   utm_source=pricing      (URL attribution)
 *   surface=pricing_page    (in-app view event)
 *   surface=pricing_plan    (in-app click event)
 *
 * That way a single visit is captured as `pricing_viewed`
 * (surface=`pricing_page`) when the page loads, and the click that
 * follows is captured as `unlock_click` (surface=`pricing_plan`),
 * preserving the page → click → checkout funnel even though all
 * three share the same canonical UTM source.
 *
 * Note: typed as `boolean` rather than the obvious `true` because the
 * literal comparison is meaningful at the type level (the two strings
 * are distinct literal types), but we want the assignment to type-check
 * whether or not the labels happen to be string-literal-distinct. The
 * test file asserts the runtime truth.
 */
export const PRICING_SURFACE_LABELS_ARE_DISTINCT_FROM_UTM_SOURCE: boolean =
  (PRICING_SURFACE_LABELS.pricingViewed as string) !==
    (PRICING_UTM_SOURCE as string) &&
  (PRICING_SURFACE_LABELS.unlockClick as string) !==
    (PRICING_UTM_SOURCE as string) &&
  (PRICING_SURFACE_LABELS.loginStarted as string) !==
    (PRICING_UTM_SOURCE as string);