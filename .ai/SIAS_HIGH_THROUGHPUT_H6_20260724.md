# SIAS High-Throughput H6 — 2026-07-24

## Ownership

- round: H6
- code PR: #179
- code branch: `sias/high-throughput-h6-20260724` (deleted after squash merge)
- original commits:
  - `e525185fb053b6d0b16ae8fdc01b3e989ee7ec93` test(sias): add locale schema and redirect contracts
  - `17215f4ff144e5ae3e160593dd88e6bdb21e2b34` fix(analytics): preserve UTM parameters across love-reading redirects
- code base at rebase point: `e4faa04c0c3b085464e9f1f263fd0563e69c5f20` (#178 merge)
- final squash merge commit (in `origin/main`): `e861d81bf2551d3cb57cbd372013142de943e8b2` (PR #179 squash, author `yihui315`)
- docs PR: this file is the sole H6 evidence owner (companion docs PR will be opened on `docs/sias-h6-evidence-20260725`)

## Selected tasks

- T0-016: daily-oracle locale variants decision/audit
- T0-017: meta-tool JsonLd schema type audit
- T0-018: localized alias redirect UTM preservation contract

No task was replaced. Self-monitor found no autonomous-actionable regression.

## Decisions and findings

### T0-016 — `/daily-oracle`

- A real canonical page exists at `src/app/(main)/daily-oracle/page.tsx` with a matching layout.
- No `src/app/[locale]/daily-oracle` implementation exists.
- The layout has canonical metadata but no locale alternates/hreflang surface.
- `localizedPublicRoutes` therefore correctly leaves `hasLocaleVariant` unset/false.
- Added a regression contract so this remains explicit until real locale pages and metadata exist.
- Decision: keep `hasLocaleVariant` unset. Do not falsely advertise a locale variant.

### T0-017 — meta-tool JsonLd

- Audited every `(main)` layout owning a `layout.tsx` (19 layouts including non-meta informational hubs).
- Service-like reading/divination tools consistently expose `@type: Service`, `name`, `description`, `url`, and an organization provider.
- About/collection/product/application-like layouts use their existing schema semantics and organization/site references.
- No schema type was upgraded speculatively; all changes are audit-only.
- Decision: keep `Service` for reading/divination surfaces. Do not relabel as `SoftwareApplication`.

### T0-018 — localized love-reading aliases

- **Initial review finding**: the alias pages were server components without `searchParams`. They literally could not preserve UTM parameters, so the first-pass contract documented the limitation rather than claiming preservation.
- **Reviewer feedback**: T0-018 must actively preserve attribution, not merely document the loss.
- **Amendment** (`17215f4`): added `src/lib/analytics/redirect-query.ts` with a strict UTM whitelist (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) and explicit drops for `lang`, `token`, `userId`, `name`, `birthDate`, `birthTime`, `relationship`, `session`, `id`, `cancelled`, and any other key. Updated both aliases to accept `searchParams` and forward through `buildRedirectHref`. Result `[id]` stays in the path; query parameters cannot change the redirect destination or trigger an external URL.
- Real localized implementations are `/en/love-reading` and `/zh-CN/love-reading`, generated from the supported locale list.
- No production URL was fetched.

## Validation

Final post-rebase run on `sias/high-throughput-h6-20260724` at head `17215f4`:

- Targeted H6 + existing route/meta tests: 7 files, 89 tests passed.
- Full Vitest: 101 files, 825 tests passed.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, no warnings/errors (Next.js deprecation notice only).
- `npm run audit:routes`: PASS.
- `npm run audit:share`: PASS.
- `npm run audit:adsense`: PASS, two non-blocking external/live-audit warnings.
- `node scripts/sias-self-monitor.mjs`: PASS, 6 known blocked issues, 0 fresh, 0 regressions, 0 autonomous-actionable.
- `npm run build:staging:degraded`: PASS; Next.js generated 76/76 static pages including the rewritten alias surfaces.
- `git diff --check`: PASS.
- Changed-file secret-shape scan: PASS; no secret-shaped values found.

## Parked blockers

Self-monitor remains at 6 known blockers. None of them are H6-introduced; H6 surfaced no new blocked issues:

- BLOCKED-011: human Apple Team ID/appID required for `apple-app-site-association`.
- BLOCKED-012: human-authored `humans.txt` content required.
- BLOCKED-013: human-authored `security.txt` Contact/Expires required.

These are human-required or missing-content blockers and were not touched.

## External / non-code observations

- Vercel Preview deployment for both H6 commits was reported as `Canceled from the Vercel Dashboard` (not a code failure). Classification: `external_required`. No production deploy.
- GitHub Actions Build & Test passed after the rebase push (3m4s, run 30140288153).
- H6 evidence was protected at `/tmp/tianji-h6-evidence-20260725/.ai-current` before the rebase and was restored via `git stash pop` after the force-push.

## Safety

Source-side only; no production access/fetch, no secrets/.env read, no workflow changes, no data changes, no `.ai/` files in the H6 code commit (PR #179 touched only `src/`).