# SIAS Problem Discovery — 2026-07-23

## Scope

Global static pass across `tianji-global` working tree (post-merge main = `eba5c7c`). Sources read:

- `AGENTS.md`, `.ai/REVIEW_PACKET.md`, `.ai/CHANGELOG_AI.md`
- `.ai/AUTOPILOT_STATUS.json` (20 keys)
- `.ai/ORCHESTRATOR_GATE_DECISION.json`
- `package.json` (36 npm scripts)
- `src/app/**` route tree (86 dirs), `src/app/api/**` (60 routes), `src/__tests__/**` (85 test files)
- `scripts/audit-*.{mjs,ts}` (14 audit scripts)
- `data/` (love-test KPI day 001-016, growth-events-contract, publishing-queue seed)
- `src/app/{layout,sitemap,robots}.tsx`, `src/app/{(main)/love-test,(main)/pricing,(main)/daily-oracle}/page.tsx`
- `src/components/seo/JsonLd.tsx`

## Discovered issues (sorted by autonomous feasibility, not priority)

### T0-001 — `/daily-oracle` has no SEO metadata and is missing from sitemap
- **Category**: SEO gap / funnel surface
- **Source**: `src/app/(main)/daily-oracle/page.tsx` (client component, no `export const metadata`), `src/lib/i18n.ts` `localizedPublicRoutes` (no entry)
- **Evidence**:
  - Page tracks 5 funnel events (`growth_daily_oracle_view`, `_draw`, `_share_click`, `_love_test_click`, `_love_reading_click`) but has neither `<title>`, `<meta description>`, OpenGraph, Twitter, nor canonical from a server export.
  - Sitemap enumerator iterates over `localizedPublicRoutes`; `/daily-oracle` is absent. Build artifact at `.next/server/app/sitemap.xml.body` confirms no `<loc>` for it.
  - `/pricing` has the right pattern (`(main)/pricing/layout.tsx` injects breadcrumb + product + FAQ JsonLd), and `(main)/pricing/page.tsx` is also `'use client'` — so the **layout-vs-page metadata pattern** is already established in repo.
- **autonomous_possible**: true
- **blocker_type**: none
- **expected_impact**: 4 / 5 — daily-oracle is a tracked funnel entry but currently invisible to crawlers and social previews.
- **risk**: 1 / 5 — additive metadata + 1-line i18n registration + optional JsonLd; no behavior change.
- **effort**: 2 / 5 — small.
- **suggested_next_action**: Move tracked events page to a server-friendly structure OR add `metadata` export via a sibling `layout.tsx` (mirroring pricing's pattern). Add `/daily-oracle` to `localizedPublicRoutes`. Optionally add breadcrumb + product JsonLd.

### T0-002 — `/love-test` has no SEO metadata
- **Category**: SEO gap / top funnel page
- **Source**: `src/app/(main)/love-test/page.tsx`
- **Evidence**: Same as T0-001. Page is `'use client'`, no `metadata`, no JsonLd. Already in sitemap (priority 0.9) so crawlers can find it, but the SERP preview is the generic layout-level `Tianji Love | AI Relationship Reading`. Competitor pages with explicit title/description win CTR.
- **autonomous_possible**: true
- **blocker_type**: none
- **expected_impact**: 4 / 5 — the love-test is the single highest-volume entry surface (per the AGENTS.md scoring and the existing seed queue).
- **risk**: 1 / 5
- **effort**: 2 / 5
- **suggested_next_action**: Add `(main)/love-test/layout.tsx` exporting `metadata` + inject breadcrumb + product JsonLd via `JsonLd` component.

### T0-003 — daily-oracle CTA hrefs don't propagate UTM parameters
- **Category**: Funnel analytics gap
- **Source**: `src/app/(main)/daily-oracle/page.tsx`
- **Evidence**: Hardcoded `LOVE_TEST_HREF = '/love-test?source=daily_oracle'` and `LOVE_READING_HREF = '/relationship/new?source=daily_oracle'`. The `?source=…` survives in URL but is not a full UTM triplet, and downstream event payloads (`growth_daily_oracle_love_test_click` etc.) do not propagate it. So when the user lands on `/love-test` from `/daily-oracle`, the love-test funnel events cannot attribute the visit.
- **autonomous_possible**: true
- **blocker_type**: none
- **expected_impact**: 3 / 5
- **risk**: 1 / 5
- **effort**: 3 / 5 — touches analytics layer
- **suggested_next_action**: Add proper `utm_source`/`utm_medium`/`utm_campaign` triplet to the CTA hrefs; thread `?source=` through to downstream `trackRevenueFunnelEvent` calls.

### T0-004 — `/pricing` has no entry in `localizedPublicRoutes`
- **Category**: SEO gap
- **Source**: `src/lib/i18n.ts`
- **Evidence**: `/pricing` exists in `localizedPublicRoutes` as `{ path: '/pricing', …, priority: 0.9 }` (verified earlier). **T0-004 is a false alarm — already covered by existing sitemap.**

### T0-005 — `ORCHESTRATOR_GATE_DECISION.json` is a dated, non-date-stamped single file
- **Category**: Audit trail clarity
- **Source**: `.ai/ORCHESTRATOR_GATE_DECISION.json` (no `<date>` in filename)
- **Evidence**: Same pattern as `AUTOPILOT_STATUS.json` (single, current-state). Both are intentional. But the orchestrator also emits `REVENUE_SELF_RUN_V1_REVIEW_<DATE>.md` (dated). The decision JSON lacks a date stamp, so re-running the orchestrator on a new day overwrites history with no easy diff.
- **autonomous_possible**: true
- **blocker_type**: none
- **expected_impact**: 2 / 5 — minor operator ergonomics
- **risk**: 1 / 5 — additive
- **effort**: 2 / 5 — small
- **suggested_next_action**: Either (a) rename to `ORCHESTRATOR_GATE_DECISION_<DATE>.json` (matching the MD pattern) and keep a `current.json` symlink, or (b) embed a `date` field in the existing JSON and add a thin history file.

### T0-006 — `data/kpi/` directory missing; validate script accepts `data/kpi/ (recursive, *.csv)` but the directory doesn't exist
- **Category**: Discovery / dead path
- **Source**: `scripts/revenue/self-run-validate-evidence.mjs` (line 11), repo file tree
- **Evidence**: Script reads `data/kpi/`. Directory does not exist. `listFiles` returns `[]`. KPI gate always No-Go even when real KPI rows exist somewhere else (e.g. in `data/love-test-day-NNN-kpi-entry.csv`).
- **autonomous_possible**: true
- **blocker_type**: none
- **expected_impact**: 3 / 5 — unblocks KPI learning gate
- **risk**: 1 / 5 — additive directory + relaxed scan paths
- **effort**: 2 / 5
- **suggested_next_action**: Widen the KPI scanner to also scan `data/love-test-*kpi-entry.csv` and `data/growth-events-contract.csv` with a documented allowlist, OR explicitly document `data/kpi/` as the only allowed location and require new files to land there.

### T0-007 — KPI CSV schema not formally documented
- **Category**: Schema documentation
- **Source**: Multiple day-N KPI entry CSVs use heterogeneous schemas (different column counts, capitalization).
- **Evidence**: Read first 5 lines of `data/love-test-day-001-kpi-entry.csv` and `day-016-kpi-entry.csv`. Columns differ; some include `manual entry after publish`, others don't.
- **autonomous_possible**: true
- **blocker_type**: none
- **expected_impact**: 2 / 5 — drift cost
- **risk**: 1 / 5
- **effort**: 3 / 5 — needs careful audit
- **suggested_next_action**: Document a canonical schema in `.ai/DATA_SCHEMA_KPI.md` with an enforcement check that flags schema drift in CI.

### T0-008 — `/relationship/new` lives outside `(main)` group
- **Category**: Routing consistency
- **Source**: `src/app/relationship/new/page.tsx` (vs `src/app/(main)/...`)
- **Evidence**: This is a free entry funnel page (linked from `/daily-oracle` CTA). It is NOT in `(main)` group and therefore NOT in sitemap's `localizedPublicRoutes`. No `metadata` export visible. CTR-affecting surface currently invisible.
- **autonomous_possible**: partial — moving a route is risky; adding a `layout.tsx` with metadata is safe.
- **blocker_type**: none for layout-only change.
- **expected_impact**: 3 / 5
- **risk**: 2 / 5 — middleware-aware route group.
- **effort**: 3 / 5
- **suggested_next_action**: Add `src/app/relationship/new/layout.tsx` exporting `metadata` + breadcrumb JsonLd. Defer moving into `(main)` group.

### T0-009 — 60+ API routes lack a unified healthz / readiness contract test
- **Category**: Test coverage
- **Source**: `src/app/api/**/route.ts` (60 routes), `src/__tests__/api/version-health-route.test.ts` (covers 2 routes only)
- **Evidence**: New `/api/health` exists but the orchestrator gate does not validate it. No contract test enforces that all 60 routes return JSON, declare `export const dynamic`, or respect the established status pattern.
- **autonomous_possible**: true
- **blocker_type**: none
- **expected_impact**: 2 / 5 — test infrastructure
- **risk**: 1 / 5 — additive
- **effort**: 4 / 5 — many routes
- **suggested_next_action**: Add a generic "API route contract" test that asserts every `src/app/api/**/route.ts` exports a GET/POST/etc. handler returning a `NextResponse` (not raw Response). Lower-priority than SEO.

### T0-010 — 14 audit scripts have no unified runner that exits 0 on pass
- **Category**: CI ergonomics
- **Source**: `scripts/audit-*.{mjs,ts}`
- **Evidence**: Each audit has its own exit logic; `release:check` chains 9 of them but the `audit-staging-*` family is left out.
- **autonomous_possible**: true
- **blocker_type**: none
- **expected_impact**: 2 / 5
- **risk**: 1 / 5
- **effort**: 3 / 5
- **suggested_next_action**: Add `npm run audit:all` that runs every `audit:*` script and aggregates PASS / FAIL into `.ai/SIAS_AUDIT_RUN_<DATE>.json`.

### T0-011 — AUTOPILOT_STATUS `branch` / `worktree` fields reference stale paths
- **Category**: Documentation drift
- **Source**: `.ai/AUTOPILOT_STATUS.json` (`branch`, `worktree`)
- **Evidence**: `branch: "codex/revenue-os-7day-day1-20260624"`, `worktree: "C:\\Users\\Administrator\\codex-worktrees\\tianji-revenue-os-7day-day1-20260624"`. Branch doesn't exist in this checkout, worktree path is a Windows path on a macOS machine.
- **autonomous_possible**: true
- **blocker_type**: none
- **expected_impact**: 1 / 5 — cosmetic
- **risk**: 1 / 5 — overwrite careful
- **effort**: 1 / 5
- **suggested_next_action**: Set `branch: "main"`, drop `worktree`, add `last_run_at` field for the current branch.

### T0-012 — `data/love-test-kpi-tracking.csv` and friends carry only `0` / `manual entry after publish`
- **Category**: Pre-existing blocker (cannot autoupdate)
- **Source**: `.ai/CHANGELOG_AI.md` 2026-07-01 entry already documents this.
- **autonomous_possible**: false (need real traffic)
- **blocker_type**: external_required (real user behavior)
- **expected_impact**: 3 / 5 (when filled)
- **risk**: n/a
- **suggested_next_action**: Park in blocked registry; resume signal = "real visit data present".

## Summary

- **autonomous_safe_now**: T0-001, T0-002, T0-003, T0-005, T0-006, T0-007, T0-008 (layout-only), T0-009, T0-010, T0-011
- **needs_human_input / external_required / approval_required**: T0-012, plus the revenue/URL/KPI/Stripe/reviewer gates already documented.
- **infra_blocked**: 154.217.241.238 / STAGING-004 (already in BLOCKED-002).
- **unsafe_for_autonomy**: production deploy, live Stripe, etc. (already documented in AGENTS.md and PRs).

Highest single-task score from formula `score = impact + confidence − risk − effort`:
- **T0-001** = 4 + 5 − 1 − 2 = **6**
- T0-002 = 4 + 5 − 1 − 2 = 6 (tied)
- T0-006 = 3 + 5 − 1 − 2 = 5
- T0-008 = 3 + 4 − 2 − 3 = 2

T0-001 wins on impact (the daily-oracle is the *most-tracked but least-SEO'd* surface) and on confidence (mirror of an existing pattern).