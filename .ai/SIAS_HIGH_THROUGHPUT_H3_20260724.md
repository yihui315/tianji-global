# SIAS High-Throughput H3 — 2026-07-24

## Mode

Second batch run. Same protocol as H1 (2026-07-23): up to 3 autonomous-safe
tasks → 1 code PR, daily docs PR for evidence. Triggered by explicit user
instruction `start H3`.

This run is **batch**, **source-only**, and **autonomous-safe**. No production
deploy. No live Stripe. No production Supabase. No auto-publish. No fake URL.
No fake KPI. No empty placeholder files.

## Pre-flight state

- `main` HEAD = `3150373f228b5e31ef5c8ba4f38cc6161bcbec04` (PR #172 merge commit).
- All 5 prior PRs merged: #168 / #169 / #170 / #171 / #172.
- Local branches from merge train: deleted. Working tree clean except
  untracked evidence docs.
- `node scripts/sias-self-monitor.mjs` pre-run:
  `fresh_unclassified_count: 0`, `regression_count: 0`, `known_blocked_count: 6`
  (BLOCKED-011/012/013 — unchanged). No fresh action items before H3 started.

## Tasks selected (3/3 autonomous-safe)

| ID    | Title                                | Files                                                                                              | Tests |
|-------|--------------------------------------|-----------------------------------------------------------------------------------------------------|-------|
| T0-005 | pricing CTA UTM propagation          | `src/app/(main)/pricing/page.tsx` (M)                                                                | 7     |
| T0-007 | privacy-safe OG image verification   | `src/__tests__/privacy-safe-og-image.test.ts` (new, no source change — OG already privacy-safe)      | 7     |
| T0-008 | localizedPublicRoutes audit contract | `src/__tests__/localized-public-routes-coverage.test.ts` (new)                                       | 49    |

Total new tests in this PR: **63** (7 + 7 + 49).

## Tasks deliberately skipped (autonomous-unsafe / blocked / external)

| ID            | Reason                                                                                       |
|---------------|----------------------------------------------------------------------------------------------|
| BLOCKED-001   | human_required: real public URLs with UTM evidence                                           |
| BLOCKED-002   | infra_blocked: `154.217.241.238` SSH dead, STAGING-004 untouched                              |
| BLOCKED-003   | approval_required: Stripe test paid smoke                                                     |
| BLOCKED-005   | external_required: real non-zero KPI traffic (kpi-entry-scanner correctly reports no_real_candidate) |
| BLOCKED-006   | unsafe_for_autonomy: production deploy                                                        |
| BLOCKED-007   | unsafe_for_autonomy: live Stripe / production Supabase mutation                              |
| BLOCKED-008   | external_required: AdSense verdict                                                            |
| BLOCKED-009   | external_required: real visit data for SEO impact validation                                  |
| BLOCKED-010   | human_required: public social profiles for `sameAs`                                          |
| BLOCKED-011   | human_required: public/apple-app-site-association                                            |
| BLOCKED-012   | human_required: public/humans.txt                                                            |
| BLOCKED-013   | human_required: public/.well-known/security.txt                                              |
| BLOCKED-014   | **NEW (H3 T0-008 discovery)** — `/about` has full SEO+OG layout but is NOT in `localizedPublicRoutes`. Parked as design_decision_required. |

## Code PR

`https://github.com/yihui315/tianji-global/pull/<NUMBER>` — Draft, MERGEABLE.

PR title: `feat(sias): improve pricing tracking and SEO contracts`

PR body sections:

- Result
- Selected H3 tasks
- Skipped / parked tasks (including BLOCKED-014 new discovery)
- What changed (per task)
- Validation (full output)
- Self-monitor result (pre/post)
- Safety boundaries
- Not touched
- Rollback
- Evidence left uncommitted
- Next batch candidates

## Validation (all pass on `/Users/yihui/tianji-global`)

- `npm run typecheck` → exit 0
- `npm run lint` → "No ESLint warnings or errors"
- `npx vitest run` → **774 / 774 PASS** (63 new tests in this PR; up from 711
  on H1 merged main)
- `npm run audit:routes` → `audit-routes: OK`
- `npm run audit:share` → `audit-share: OK`
- `npm run audit:adsense` → `RESULT: PASS (SOURCE GATE)` (2 external warnings
  unrelated to H3: CMP/TCF + live route/SHA audit skipped)
- `node scripts/sias-self-monitor.mjs` →
  `total=6 known_blocked=6 fresh=0 regressions=0` (clean — no new issues
  introduced; BLOCKED-011/012/013 unchanged)
- `npm run build:staging:degraded` → exit 0; pricing route still visible
  in route table
- `git diff --check` → clean
- changed-file secret-shape scan → 0 hits

## T0-005 detail: pricing CTA UTM propagation

`src/app/(main)/pricing/page.tsx` line 252 (the in-component `href()` wrapper)
now threads the in-product UTM triplet through every CTA on the pricing page:

```ts
const href = (path: string) =>
  withLanguageParam(buildUtmHref(path, { source: 'pricing' }), language);
```

Result for a typical CTA like `href('/relationship/new')` (FinalCta + hero
secondary + header + footer):

```
/relationship/new?utm_source=pricing&utm_medium=in_product&utm_campaign=organic_funnel_h1&lang=en
```

This mirrors the H1 daily-oracle pattern (`buildUtmHref` wraps `withLanguageParam`
inside out so `?lang=` stays at the end of the query string).

Boundaries respected:
- No price change. `PRODUCT_CATALOG` and `PLANS` imports unchanged.
- No Stripe checkout mutation. `handleSubscribe(planId)` still calls the same
  existing endpoint.
- No new analytics service / external endpoint.
- The static OG image URL on the pricing layout is untouched
  (`/api/og?title=Tianji+Love+Pricing&...&module=tianji`).

The `pricing_viewed`, `unlock_click`, and `login_started` funnel events
(`@/lib/analytics/funnel-events`) are intact so the UTM triplet has real
downstream events to attribute.

## T0-007 detail: privacy-safe OG image verification

`/api/og/route.tsx` and the two privacy-critical pages (`/love-test`,
`/daily-oracle`) are audited:

- `/api/og` reads ONLY three whitelist query params: `title`, `subtitle`,
  `module`. None of the forbidden params (`birthDate`, `birthTime`,
  `birthLocation`, `name`, `userId`, `token`, …) are read by the route.
- `/love-test/layout.tsx` OG_URL is a hard-coded constant
  (`/api/og?title=Tianji+Love+Test&subtitle=...&module=tianji`).
- `/daily-oracle/layout.tsx` OG_URL is a hard-coded constant
  (`/api/og?title=Tianji+Love+Daily+Oracle&subtitle=...&module=tianji`).
- A cross-page sweep across all `.ts` / `.tsx` files under
  `src/app/(main)/love-test` and `src/app/(main)/daily-oracle` confirms no
  page dynamically builds an `/api/og?` URL with a forbidden param.

`AGENTS.md` §3 ("Do not expose birth date, birth time, birth location, or
timezone on public share pages by default") is now enforced at the OG-image
layer specifically. A future page that pipes user input into its OG URL
will FAIL this test and the agent must remove the dynamic param before
shipping.

**No source change** — this task verified that the existing code is
already privacy-safe and locks that property into a regression contract.
The 7 new tests are pure read-only audits of the source tree.

## T0-008 detail: localizedPublicRoutes audit contract

The new `src/__tests__/localized-public-routes-coverage.test.ts` enforces
the relationship between `localizedPublicRoutes` (SEO/sitemap source of
truth in `src/lib/i18n.ts`) and the actual `layout.tsx` / `page.tsx` files.

For each registered public route, the contract verifies:
1. It exists in `localizedPublicRoutes` with the expected priority.
2. At least one of the listed `layoutFiles` exists on disk.
3. The primary `layout.tsx` exports `metadata` + (except for `/`)
   `alternates.canonical` + references the route path.
4. The OG image URL contains the expected title substring for the route.
5. No forbidden privacy param leaks into the OG URL.

It also runs two coverage-gap detectors:
- Reverse: every entry in `localizedPublicRoutes` MUST have a
  `PUBLIC_ROUTE_AUDITS` entry (else a future public-route addition is
  missing its contract).
- Forward: every `(main)/<segment>/layout.tsx` that is registered in
  `localizedPublicRoutes` MUST be audited; meta-tool layouts
  (`/bazi`, `/tarot`, `/yijing`, `/horary`, `/electional`, `/fengshui`,
  `/fortune`, `/love-match`, `/numerology`, `/sky-chart`,
  `/solar-return`, `/synastry`, `/transit`, `/western`, `/ziwei`,
  `/celebrities`, `/celebrity-match`) are intentionally excluded because
  they are NOT advertised in the public sitemap.

### BLOCKED-014 — discovered by this audit

The forward detector surfaced a real gap: `/about` has its own
`src/app/(main)/about/layout.tsx` with a complete `metadata` +
`alternates.canonical` + JsonLd (Organization + Website + AboutPage),
but `/about` is NOT in `localizedPublicRoutes`. The current design treats
`/about` as an in-product informational page that crawlers reach via
internal links from `/`, `/pricing`, `/legal/privacy`, etc., but is not
advertised in the public sitemap.

Decision parked at `.ai/SIAS_BLOCKED_REGISTRY_20260723.md#BLOCKED-014`
as `type: design_decision_required`. The agent cannot make this call
unilaterally because adding `/about` to `localizedPublicRoutes` would
change the public sitemap contract and surface `/about` in
`/sitemap.xml` — a real SEO surface decision the user owns.

## Evidence docs left uncommitted for the daily docs PR

Per H3 rule (code PR carries source + tests only; evidence docs ship in
the daily docs PR):

- `.ai/SIAS_HIGH_THROUGHPUT_H3_20260724.md` — this file
- `.ai/SIAS_BLOCKED_REGISTRY_20260723.md` — BLOCKED-014 appended
- `.ai/SIAS_SELF_MONITOR_2026-07-24.md` — re-generated by self-monitor
- `.ai/reports/sias-self-monitor-2026-07-24.json` — re-generated by self-monitor
- `.ai/FINAL_SYNC_AFTER_172_20260724.md` — from the merge-train hold phase,
  intentionally left untracked since the H3 evidence docs ship together
- `.ai/reports/kpi-entry-scan-2026-07-24.json` — kpi-entry-scanner output,
  intentionally untracked (the scanner writes it on every run)

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

## Next batch candidates (H4)

- **T0-009** — `pricing/page.tsx` plan checkout CTA copy — minor Wording
  cleanup once a real Stripe test smoke runs (BLOCKED-003 dependency).
- **T0-010** — love-match + synastry + celebrity-match OG parity
  (mirror T0-007 audit for the cross-tradition surfaces).
- **T0-011** — daily-oracle locale variants in `localizedPublicRoutes`
  (currently daily-oracle is in zh-CN-only? Need to check.
  If not in zh-CN alias, add it OR explicitly park as intentional).
- **T0-012** — `pricing/page.tsx` funnel-event payload `surface` value
  should match `utm_source` (`pricing_page` vs `pricing`). Minor
  inconsistency to align.

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
- BLOCKED-014 (NEW — `/about` design decision: sitemap inclusion or not)

## Outcome

H3 is complete: 3 autonomous-safe tasks shipped in 1 PR, 63 new tests
passing, all source-side validations green, self-monitor reports no
regression, BLOCKED-005 still correctly `no_real_candidate`, BLOCKED-014
discovered and parked.

Awaiting non-author reviewer approval on this PR.