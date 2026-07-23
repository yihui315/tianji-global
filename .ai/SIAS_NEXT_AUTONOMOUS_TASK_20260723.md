# SIAS Next Autonomous Task — 2026-07-23 (Round 1)

## Selected: T0-001 — Daily-oracle SEO + sitemap inclusion + JsonLd

### Why this one

Daily-oracle is the **single most-tracked funnel entry** in the repo (5 funnel events: `growth_daily_oracle_view`, `_draw`, `_share_click`, `_love_test_click`, `_love_reading_click`) yet:

- No `metadata` export → falls back to the generic layout-level `Tianji Love | AI Relationship Reading` title and description. SERP CTR loses to competitors with explicit page titles.
- Not registered in `localizedPublicRoutes` → absent from `/sitemap.xml` → crawlers cannot discover it as a standalone surface.
- No `JsonLd` breadcrumb/product injection → no rich-result eligibility.

The fix mirrors the **already-shipped** pattern at `src/app/(main)/pricing/layout.tsx`, which exports `metadata` and injects breadcrumb + product + FAQ JsonLd. Adding the same shape for daily-oracle is the smallest possible diff with the largest SEO upside.

### Score breakdown

| dimension | value |
|-----------|-------|
| impact (1–5) | 4 — high-volume funnel entry currently invisible to crawlers |
| confidence (1–5) | 5 — exact pattern already in repo (`pricing/layout.tsx`) |
| risk (1–5) | 1 — purely additive metadata + 1-line i18n registration + optional JsonLd |
| effort (1–5) | 2 — small, isolated to two files + sitemap table |
| **score = impact + confidence − risk − effort** | **6** |

### Concrete change list

1. **New file** `src/app/(main)/daily-oracle/layout.tsx`
   - Exports `metadata` with title, description, OpenGraph, Twitter, alternates (en / zh-CN).
   - Renders `<JsonLd>` for breadcrumb and (optionally) a small `WebApplication` payload describing the daily oracle.
   - Mirrors `src/app/(main)/pricing/layout.tsx` shape verbatim where possible.
2. **Edit** `src/lib/i18n.ts`
   - Add `{ path: '/daily-oracle', changeFrequency: 'daily', priority: 0.9 }` to `localizedPublicRoutes`.
   - This automatically registers the page in `/sitemap.xml` because `src/app/sitemap.ts` already iterates over `localizedPublicRoutes` for non-locale-variant paths.
3. **New file** `src/__tests__/daily-oracle-seo.test.ts`
   - Asserts `localizedPublicRoutes` contains `/daily-oracle` with the expected priority.
   - Asserts a fixture file for the new layout contains the expected `metadata.title`, `metadata.description`, `metadata.openGraph.title`.
4. **New file** `.ai/SIAS_LEARNING_NOTE_20260723.md`
   - Documents the pattern so future rounds can replicate it.

### Validation gates (must all pass before commit)

- `npm run typecheck` — exit 0
- `npm run lint` — exit 0
- `npx vitest run src/__tests__/daily-oracle-seo.test.ts` — PASS
- `npm run audit:routes` — `audit-routes: OK`
- `npm run audit:share` — unchanged (no privacy regression)
- `npm run audit:adsense` — `RESULT: PASS (SOURCE GATE)` (no live route check)
- `npm run build:staging:degraded` — exit 0; new `/daily-oracle` entry visible in `.next/server/app/sitemap.xml.body`
- `git diff --check` — clean
- changed-file secret scan — 0 hits

### Boundaries respected

- No production deploy
- No live Stripe
- No production Supabase mutation
- No auto publish / no fake URL / no fake KPI
- No commit until the validator block above passes
- No merge until a non-author reviewer approves
- No connection to `154.217.241.238`
- No STAGING-004 touch

### Rollback

The change is purely additive:

- Removing the new `layout.tsx` reverts daily-oracle to its current generic metadata.
- Removing the `localizedPublicRoutes` entry reverts the sitemap.

No data, schema, or behavior is touched. Rollback = revert the single PR.

### Risk surface

- If Next.js 14 metadata API requires the page to be a server component, the layout-level metadata export is fine because layouts are server components by default. Confirmed by reading `src/app/layout.tsx` (server) and `src/app/(main)/pricing/layout.tsx` (server).
- If `JsonLd` adds duplicate breadcrumb scripts, the existing pattern at `pricing/layout.tsx` already guards against that (each `<JsonLd>` carries a unique payload).
- If the i18n test for `localizedPublicRoutes` was a strict assertion, the new entry will pass it because it's a strict-additive shape.

### Next SIAS round candidate

If T0-001 lands cleanly, the natural follow-up is **T0-002 (love-test SEO + JsonLd)** using the same pattern. After that, T0-006 (KPI scanner widening) unblocks the KPI Learning Input gate for the existing `data/love-test-day-*` CSVs.