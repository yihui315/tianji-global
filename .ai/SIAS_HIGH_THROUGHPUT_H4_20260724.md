# SIAS High-Throughput H4 — 2026-07-24

## Mode

Fourth batch run. Same conveyor-mode protocol as H1 / H3: up to 3
autonomous-safe tasks → 1 code PR, daily docs PR for evidence. H4 ran
**concurrently with the H3 evidence docs PR** (PR #174) — the A 线
shipped the H3 docs evidence while the B 线 cut a fresh
`sias/high-throughput-h4-20260724` branch off clean main and shipped
three autonomous-safe tasks in PR #175.

Triggered by explicit user instruction `start SIAS Autonomous Conveyor
Mode` and the per-line A / B brief that followed.

This run is **batch**, **source-only**, and **autonomous-safe**. No
production deploy. No live Stripe. No production Supabase. No
auto-publish. No fake URL. No fake KPI. No empty placeholder files.

## Pre-flight state

- `main` HEAD at H4 start = `2a3a86a2412161c0fdd3b9d4e7a233eba863bf63` (PR #173 squash merge commit).
- Prior PRs merged before H4: #168 / #169 / #170 / #171 / #172 / #173.
- `node scripts/sias-self-monitor.mjs` pre-run:
  `fresh_unclassified_count: 0`, `regression_count: 0`,
  `known_blocked_count: 6` (BLOCKED-011/012/013).
- BLOCKED-014 was carried over from H3 (design_decision_required).

## Tasks selected (3/3 autonomous-safe)

| ID    | Title                                          | Files                                                                                                                                  | New tests |
|-------|------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|-----------|
| T0-014 | BLOCKED-014 resolution — `/about` sitemap     | `src/lib/i18n.ts` (M, +7), `src/__tests__/localized-public-routes-coverage.test.ts` (M, +/about audit entry)                              | 5 (in audit) |
| T0-010 | OG parity audit (love-match / synastry / celebrity-match) | `src/__tests__/privacy-safe-og-image.test.ts` (M, +3 describe blocks)                                                                  | 6         |
| T0-012 | pricing funnel surface alignment               | `src/lib/analytics/pricing-surface.ts` (A, new file), `src/app/(main)/pricing/page.tsx` (M, import swap), `src/__tests__/pricing-utm-propagation.test.ts` (M, regex update), `src/__tests__/pricing-funnel-surface-alignment.test.ts` (A, new file) | 11        |

Total new tests in this PR: **22** (5 from /about audit + 6 from OG parity + 11 from T0-012).

## Tasks deliberately skipped (autonomous-unsafe / blocked / external)

| ID            | Reason                                                                                       |
|---------------|----------------------------------------------------------------------------------------------|
| BLOCKED-001   | human_required: real public URLs with UTM evidence                                           |
| BLOCKED-002   | infra_blocked: `154.217.241.238` SSH dead, STAGING-004 untouched                              |
| BLOCKED-003   | approval_required: Stripe test paid smoke                                                     |
| BLOCKED-005   | external_required: real non-zero KPI traffic (kpi-entry-scanner still `no_real_candidate`)  |
| BLOCKED-006   | unsafe_for_autonomy: production deploy                                                        |
| BLOCKED-007   | unsafe_for_autonomy: live Stripe / production Supabase mutation                              |
| BLOCKED-008   | external_required: AdSense verdict                                                            |
| BLOCKED-009   | external_required: real visit data for SEO impact validation                                  |
| BLOCKED-010   | human_required: public social profiles for `sameAs`                                          |
| BLOCKED-011   | human_required: public/apple-app-site-association                                            |
| BLOCKED-012   | human_required: public/humans.txt                                                            |
| BLOCKED-013   | human_required: public/.well-known/security.txt                                              |
| **BLOCKED-014** | **RESOLVED** by T0-014 — decision A (register `/about` in `localizedPublicRoutes`) applied this round. The registry status will flip to `completed` in a follow-up docs PR. |

## Code PR

`https://github.com/yihui315/tianji-global/pull/175` — Draft, MERGEABLE.

PR title: `feat(sias): expand public route and attribution contracts`

PR body sections:

- Result
- Self-discovered issues (T0-014 / T0-010 / T0-012)
- Selected tasks
- Parked tasks (including BLOCKED-014 → resolved)
- What changed (per task)
- Validation (full output)
- Self-monitor result
- Safety boundaries
- Not touched
- Evidence left uncommitted
- Next autonomous candidates

## Validation (all pass on `/Users/yihui/tianji-global`)

- `npm run typecheck` → exit 0
- `npm run lint` → "No ESLint warnings or errors"
- `npx vitest run` → **796 / 796 PASS** (22 new tests in this PR; up from 774 on H3 merged main)
- `npm run audit:routes` → `audit-routes: OK`
- `npm run audit:share` → `audit-share: OK`
- `npm run audit:adsense` → `RESULT: PASS (SOURCE GATE)` (2 external warnings unrelated to H4)
- `node scripts/sias-self-monitor.mjs` →
  `total=6 known_blocked=6 fresh=0 regressions=0` (clean — BLOCKED-011/012/013 unchanged)
- `npm run build:staging:degraded` → exit 0
  - `.next/server/app/sitemap.xml.body` contains `<loc>https://tianji.love/about</loc>` (T0-014 confirmed)
- `git diff --check` → clean
- changed-file secret-shape scan → 0 hits

## T0-014 detail: BLOCKED-014 resolution — `/about` sitemap

H3 T0-008 audit discovered that `/about` had a complete SEO+OG
`layout.tsx` (Organization + Website + AboutPage JsonLd, full OG image,
canonical, Twitter card) but was NOT registered in
`localizedPublicRoutes`. The user picked **decision A** on 2026-07-24:
register `/about` in `localizedPublicRoutes` so it enters the public
sitemap.

H4 implementation:

```ts
// src/lib/i18n.ts
{ path: '/about', changeFrequency: 'monthly', priority: 0.6 },
```

The existing `src/app/(main)/about/layout.tsx` is unchanged. Only the
sitemap registration is new.

Verified post-build (`.next/server/app/sitemap.xml.body`):

```
<loc>https://tianji.love/about</loc>
```

The audit entry was also added to
`src/__tests__/localized-public-routes-coverage.test.ts` so the T0-008
coverage contract now enforces that `/about` has both layout metadata
and the OG image URL present.

## T0-010 detail: OG parity audit (love-match / synastry / celebrity-match)

`src/__tests__/privacy-safe-og-image.test.ts` extends the T0-007 audit
to three additional surfaces. All three already pass — their OG URLs
are hard-coded constants with no user-data interpolation:

- `/love-match/layout.tsx`: `/api/og?title=Love+Compatibility&subtitle=BaZi+%2B+Western+Synastry&module=love`
- `/synastry/layout.tsx`: `/api/og?title=Relationship+Synastry&subtitle=Aspects+%C2%B7+Composite+%C2%B7+Cross-tradition&module=synastry`
- `/celebrity-match/layout.tsx`: `/api/og?title=Celebrity+Compatibility&subtitle=BaZi+%2B+Synastry+overlay&module=love`

The cross-page sweep is also extended to the three new directories,
and a new `describe` block enforces each layout + page individually.

Test count: 7 → 13 (+6).

`AGENTS.md` §3 ("Do not expose birth date, birth time, birth location,
or timezone on public share pages by default") is now enforced on the
cross-tradition surfaces too.

## T0-012 detail: pricing funnel surface alignment

Before H4, `src/app/(main)/pricing/page.tsx` used three different bare
string literals (`'pricing_page'`, `'pricing_plan'`,
`'pricing_plan_click'`) for funnel-event `surface` / `source` payloads.
A typo in any one of them would silently break attribution without
breaking the build.

H4 fix:

```ts
// src/lib/analytics/pricing-surface.ts (new file)
export const PRICING_UTM_SOURCE = 'pricing' as const;
export const PRICING_UTM_CAMPAIGN = 'organic_funnel_h1' as const;
export const PRICING_UTM_MEDIUM = 'in_product' as const;

export const PRICING_SURFACE_LABELS = {
  pricingViewed: 'pricing_page',         // pricing_viewed event
  unlockClick: 'pricing_plan',           // unlock_click event
  loginStarted: 'pricing_plan_click',    // login_started event
} as const;

export type PricingSurfaceLabel =
  (typeof PRICING_SURFACE_LABELS)[keyof typeof PRICING_SURFACE_LABELS];

// Build-time guard: surface labels are intentionally distinct from
// the UTM source so URL attribution and in-app event attribution
// stay layered. Typed as boolean (not literal true) so type-check
// passes regardless of literal type narrowing.
export const PRICING_SURFACE_LABELS_ARE_DISTINCT_FROM_UTM_SOURCE: boolean = ...;
```

`pricing/page.tsx` swaps bare strings for `PRICING_UTM_SOURCE` and
`PRICING_SURFACE_LABELS.*`. **Zero behavioral change** — same events,
same UTM triplet, same labels.

`src/__tests__/pricing-funnel-surface-alignment.test.ts` (11 cases)
locks the surface alignment so a future round cannot silently drift
the funnel labels again. The T0-005 test (`pricing-utm-propagation.test.ts`)
regex was also updated to match the new `PRICING_UTM_SOURCE` constant
import (was a bare `'pricing'` string literal).

## Evidence docs left uncommitted for the daily docs PR

Per H4 rule (code PR carries source + tests only; evidence docs ship
in the daily docs PR):

- `.ai/SIAS_HIGH_THROUGHPUT_H4_20260724.md` — this file
- `.ai/SIAS_BLOCKED_REGISTRY_20260723.md` — BLOCKED-014 status flip to
  `completed` (decision A recorded)
- `.ai/SIAS_SELF_MONITOR_2026-07-24.md` — re-generated by self-monitor
- `.ai/reports/sias-self-monitor-2026-07-24.json` — re-generated by
  self-monitor
- `.ai/reports/kpi-entry-scan-2026-07-24.json` — kpi-entry-scanner
  output, intentionally untracked (the scanner writes it on every run)

## Boundaries respected

```
no_production_deploy
no_live_stripe
no_production_supabase
no_real_paid_smoke
no_auto_publish
no_fake_url
no_fake_kpi
no_auto_merge
no_env_touch
no_workflow_change
no_ssh_to_154_217_241_238
no_staging_004_touch
no_commit_to_data_dir
evidence_docs_out_of_code_pr
no_empty_placeholder_public_assets
no_invented_contact_team_id_contributor_list
no_fake_green_app_route_fallback
```

## Conveyor mode specifics (H3 → H4)

This round was the first to run **concurrently with its own evidence
docs PR**:

- A 线 (`docs/sias-h3-evidence-20260724` → PR #174) shipped H3 evidence
  while
- B 线 (`sias/high-throughput-h4-20260724` → PR #175) cut a fresh
  branch off clean main and shipped 3 autonomous-safe tasks.

The user explicitly approved this split so code PRs no longer block on
docs PR review (and vice versa). The merge order remains user-driven —
#174 first (docs) then #175 (code) — but neither blocks the other.

Both PRs are now MERGED on `main` as of 2026-07-24T13:21Z.

## Next batch candidates (H5)

- **T0-013** — extend `localizedPublicRoutes` audit to the meta-tool
  surfaces (bazi / tarot / yijing / etc.) for parity — verify their
  SEO/OG self-consistency even though they are intentionally not in
  the public sitemap.
- **T0-015** — meta-tool OG parity audit (extend T0-010 to ALL public
  meta-tools: bazi / yijing / tarot / western / fortune / numerology /
  fengshui / electional / sky-chart / horary / solar-return / transit
  / celebrities).
- **T0-016** — daily-oracle `hasLocaleVariant` audit. Currently
  daily-oracle is registered as a canonical public route only; check
  if it needs `hasLocaleVariant: true` so `/en/daily-oracle` and
  `/zh-CN/daily-oracle` show up in the sitemap.
- **T0-009** — pricing plan checkout CTA copy cleanup (BLOCKED-003
  dependency — Stripe test smoke).

## Remaining human-only items

- BLOCKED-001 (publish ≥ 3 posts with real URLs and back-fill evidence)
- BLOCKED-002 (SSH recovery for STAGING-004)
- BLOCKED-003 (Stripe test smoke approval)
- BLOCKED-004 (non-author reviewer approvals for past PRs)
- BLOCKED-006 (production deploy)
- BLOCKED-007 (live Stripe / production Supabase)
- BLOCKED-008 (AdSense verdict)
- BLOCKED-010 (public social profiles for `sameAs`)
- BLOCKED-011/012/013 (Apple / humans / security.txt content)

## Outcome

H4 is complete: 3 autonomous-safe tasks shipped in 1 PR (PR #175), 22
new tests passing, all source-side validations green, self-monitor
reports no regression, BLOCKED-014 resolved (decision A), `/about` now
in public sitemap, pricing-surface.ts centralizes the funnel surface
labels, OG audit extended to all cross-tradition surfaces.

The conveyor-mode H4 run (A 线 + B 线 parallel) closed without blocking
on either branch — the docs PR #174 merged first, then the code PR #175
merged second as the user dictated.

Awaiting the next user signal to start H5.