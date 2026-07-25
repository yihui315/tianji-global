# SIAS High-Throughput H7 — 2026-07-25

## Evidence ownership

- round: H7
- code PR: #181
- original H7 code commit: ece0b942e33d3067caf92732265503e8e36e23d3
- H7 test commit (in same PR): e525185fb053b6d0b16ae8fdc01b3e989ee7ec93
- final squash merge: c26319976ac1cef6b96b4e4896d9cd0e78706cde
- tasks: T0-019 / T0-020
- GitHub Actions run: 30142543332
- Vercel: irrelevant_external

## Selected tasks

- T0-019: localized pricing/privacy/terms alias UTM preservation
- T0-020: bare `/love-compatibility` alias UTM preservation

No task was replaced. Self-monitor found no autonomous-actionable regression.

## Discovery summary

Six surfaces scanned (route, attribution, SEO, privacy, accessibility, funnel):

- **Route**: `localizedPublicRoutes` table is the SEO single-source-of-truth. H6 already locked it down. No fresh issue.
- **Attribution**: surfaced two real defect-class extensions of the H6 T0-018 issue:
  - `[locale]/pricing`, `[locale]/privacy`, `[locale]/terms` redirect to canonical pages with hard-coded `?lang=` and **drop** any incoming UTM.
  - `(main)/love-compatibility` server-redirects to `/relationship/new` and **drops every** query parameter.
- **SEO**: meta-tool OG coverage and sitemap composition locked by H5/H6. No fresh issue.
- **Privacy**: consent / adsense / privacy contracts in place. No autonomous regression.
- **Accessibility**: 10+ files reference a11y primitives, but no autonomous gap surfaced.
- **Funnel**: H5 already covered (`T0-013/T0-014/T0-015`). No fresh issue.

Two tasks selected because they continue the same defect class H6 fixed and reuse the existing helper, not because they add more tests.

## Decisions and findings

### T0-019 — `[locale]/pricing`, `[locale]/privacy`, `[locale]/terms`

- These three pages are server components that perform `permanentRedirect` to a canonical path with `?lang=`.
- The old construction literally could not forward UTM parameters because the handler had no `searchParams` input.
- After amendment they accept `searchParams`, route through `buildRedirectHref`, and preserve the strict UTM whitelist (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) while dropping everything else, including incoming `lang` (the canonical `lang` from the destination is preserved).
- Existing `sitemap-route-contract`, `i18n-seo-contract`, and `adsense-readiness-contract` tests previously asserted the literal `permanentRedirect(`/legal/privacy?lang=`)` string. Those assertions are now updated to the helper-routed equivalent `permanentRedirect(buildRedirectHref(`/legal/privacy?lang=`, query))` which preserves the same intent (destination path + lang hint) and adds the searchParams plumbing.

### T0-020 — `(main)/love-compatibility`

- Old behavior: `redirect('/relationship/new')` with no `searchParams` input. All caller attribution was lost.
- After amendment: accepts `searchParams`, routes through `buildRedirectHref('/relationship/new', query)`. Only the strict UTM whitelist is forwarded. The destination is fixed.

## What changed

- `src/app/[locale]/pricing/page.tsx` — accept `searchParams`, route through `buildRedirectHref`, preserve canonical `lang` and UTM whitelist.
- `src/app/[locale]/privacy/page.tsx` — same.
- `src/app/[locale]/terms/page.tsx` — same.
- `src/app/(main)/love-compatibility/page.tsx` — accept `searchParams`, route through `buildRedirectHref`.
- `src/__tests__/alias-redirect-utm-preservation-contract.test.ts` — renamed from `localized-love-reading-redirect-contract.test.ts` and broadened to cover all 6 aliases (2 love-reading + 3 [locale] redirects + 1 love-compatibility). 11 tests.
- `src/__tests__/sitemap-route-contract.test.ts` — updated 2 assertions to the helper-routed construction.
- `src/__tests__/adsense-readiness-contract.test.ts` — updated 3 assertions to the helper-routed construction.
- `src/__tests__/i18n-seo-contract.test.ts` — updated 3 assertions to the helper-routed construction.

## Validation

Final run on `sias/high-throughput-h7-20260725`:

- Targeted H7 + existing route/meta/i18n-seo/adsense tests: 9 files / 100 tests passed.
- Full Vitest: 101 files / 826 tests passed.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, no warnings/errors.
- `npm run audit:routes`: PASS.
- `npm run audit:share`: PASS.
- `npm run audit:adsense`: PASS, two non-blocking external/live-audit warnings.
- `node scripts/sias-self-monitor.mjs`: PASS, 6 known blocked issues, 0 fresh, 0 regressions, 0 autonomous-actionable.
- `npm run build:staging:degraded`: PASS; Next.js generated 76/76 static pages including the rewritten alias surfaces.
- `git diff --check`: PASS.
- Changed-file secret-shape scan: PASS.

## Parked blockers

Self-monitor remains at 6 known blockers. None of them are H7-introduced; H7 surfaced no new blocked issues:

- BLOCKED-011: human Apple Team ID/appID required for `apple-app-site-association`.
- BLOCKED-012: human-authored `humans.txt` content required.
- BLOCKED-013: human-authored `security.txt` Contact/Expires required.

These are human-required or missing-content blockers and were not touched.

## Safety

Source-side only; no production access/fetch, no secrets/.env read, no workflow changes, no data changes, no `.ai/` files in the H7 code commit. The code PR touches only `src/app/` and `src/__tests__/`.

## External / non-code observations

- Vercel Preview deployment for H7 will again be reported as `Canceled from the Vercel Dashboard` (per H6 history). Classification: `external_required`. No production deploy.
- The H7 evidence batch report (this file) is intentionally uncommitted per the H7 plan; it will be promoted to the H7 docs PR after the H7 code PR merges.