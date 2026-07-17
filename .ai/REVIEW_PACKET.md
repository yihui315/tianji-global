# TianJi Love Review Packet

## Current task

- Task ID: `20260717-tianji-adsense-final-remediation`
- Goal: implement the source-code remediations in the final Tianji.love AdSense audit and push a reviewable branch.
- Source base: `origin/main@bfa77cd8810e39f349db61028a5d95a6f6c42da7`
- Branch: `codex/adsense-final-remediation-20260717`
- Environment scope: local source worktree only.
- Execution scope: source, tests, CI/release checks, governance records, commit, and branch push.
- Approval: user instruction `落实并推送` on 2026-07-17.
- Excluded: production deployment, AdSense/Google dashboard changes, live payments, production data, `.env`/secret access, and changing the external final verdict without public evidence.

## What changed

1. Added `src/config/products.ts` as the shared price/product catalog and switched checkout, pricing UI, structured data, and revenue contracts to it. The unavailable Love Premium Report remains coming soon and is excluded from JSON-LD offers.
2. Consolidated `/en|zh-CN/{pricing,privacy,terms}` through permanent redirects to the canonical routes, and removed the obsolete privacy-center URL from sitemap generation.
3. Rebuilt first-party consent controls with default-denied analytics and advertising consent, granular choices, persistent settings access, withdrawal, versioned storage, and document-language synchronization.
4. Corrected the Love Reading CTA to `/relationship/new?lang=en|zh` and covered the route contract in tests.
5. Replaced stale package/service/site brand signals, made footer years dynamic, and added `noindex, nofollow` headers to the six legacy product routes.
6. Updated privacy copy, removed the production deployment job from the generic CI workflow, rewrote the AdSense source/live audit, added an AdSense readiness contract test, and included the audit in `release:check`.

## Validation evidence

- `npm ci`: failed locally because this machine uses Node 24 and the native `sweph` package requires unavailable Visual Studio C++ build prerequisites. Project CI specifies Node 20.
- `npm ci --ignore-scripts`: passed; used only to restore dependencies for source validation.
- `npm run typecheck -- --pretty false`: passed.
- `npm run lint`: passed with no warnings or errors.
- `npm run test`: passed, 83 files / 643 tests.
- `npm run audit:adsense`: source gate passed; live gate intentionally skipped without an approved public base URL and expected deployed commit.
- `npm run build`: passed; 75 static pages generated. Existing Next/jose Edge-runtime and static-generation warnings remain non-blocking.
- `npm run release:check`: passed.
- Local HTTP smoke: canonical pages and localized CTA returned 200; duplicate locale routes returned 308; `/bazi` returned `X-Robots-Tag: noindex, nofollow`; sitemap, robots, and `/api/version` checks passed.

## Gate decision and risks

- Source gate: `GO` for review.
- Production deployment: not run and not authorized by this packet.
- AdSense submission: remains `NO-GO`.
- External blockers: a Google-certified CMP/TCF message must be published; the exact reviewed commit must be deployed and matched through `/api/version`; public multi-region crawl, responsive UX, canonical, consent, and legacy-route checks must pass; Google must report `ads.txt` as Authorized; remaining legal/business identity evidence must be reviewed outside source code.
- Consent implementation in this branch controls first-party source behavior but does not claim to be a Google-certified CMP.

## Reviewer focus

1. Confirm the shared catalog values and the decision to keep Love Premium Report unavailable.
2. Confirm the canonical redirect strategy and legacy-route noindex policy.
3. Review consent UX/copy and verify the configured certified CMP does not conflict with the first-party controls.
4. Confirm removal of the CI production deploy job matches the intended release architecture.
5. After merge and approved deployment, rerun the live audit with `ADSENSE_AUDIT_BASE_URL` and `ADSENSE_EXPECTED_COMMIT` and attach fresh public evidence before changing the final verdict.
