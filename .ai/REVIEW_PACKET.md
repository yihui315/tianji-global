# TianJi Love Review Packet

## Revenue Autopilot v1 launch status (2026-07-23)

- Task ID: `20260723-revenue-autopilot-v1-launch`.
- Working tree: branch `feat/revenue-self-run-v1-20260723` from `origin/main@00039ba` (post-PR #164 merge), clean before this run. Not committed yet — pending user review.
- Goal: ship the minimal Human-approved Revenue Autopilot v1 toolchain (4 Node 20 scripts + 5 npm script aliases + 1 seed queue + 1 launch review evidence file) so the project can move from "Revenue OS source exists" to "Revenue Autopilot v1 can run daily, but requires human-approved publishing and real KPI evidence."
- Corrected contract vs. original spec:
  1. Default manual evidence path is `.ai/MANUAL_PUBLISH_EVIDENCE_<DATE>.md`, not the historical 20260629 file. If today's file does not exist, the script creates an empty 3-block YAML template.
  2. `AUTOPILOT_STATUS.json` is safe-merged: only `revenue_self_run_v1` is updated, all other top-level keys are preserved verbatim. If the existing file is unreadable / not valid JSON, the orchestrator does NOT overwrite it and instead emits `.ai/AUTOPILOT_STATUS_WRITE_SKIPPED_<DATE>.md`.
  3. Business No-Go (Revenue Evidence, KPI Learning Input, Paid Smoke) exits 0; only fatal parse / write failures exit 2.
- What changed:
  - New files: 4 scripts under `scripts/revenue/`, 1 seed queue `data/publishing-queue/revenue-autopilot-seed-20260723.csv`, plus 8 evidence files under `.ai/`.
  - Updated files: `package.json` (added 5 `revenue:self-run:*` scripts), `.ai/ORCHESTRATOR_GATE_DECISION.json` (regenerated), `.ai/AUTOPILOT_STATUS.json` (safe-merged), `.ai/CHANGELOG_AI.md`, this packet.
- Validation evidence:
  - `npm run revenue:self-run:select` → 3 posts selected, Gate Go (after fixing a `text.includes("published")` substring bug that falsely excluded every seed row).
  - `npm run revenue:self-run:pack` → publishing pack written with 3 candidates × 3 copy variants × checklist × YAML evidence block.
  - `npm run revenue:self-run:validate` → template auto-created; Revenue Evidence No-Go; KPI Learning Input No-Go; exit 0.
  - `npm run revenue:self-run:gate` → decision=no_go, execution_go=false, exit 0.
  - `npm run typecheck` / `npm run lint` → exit 0.
  - `npm run audit:routes` → audit-routes: OK.
  - `npm run audit:adsense` → RESULT: PASS (SOURCE GATE).
  - `npm run build:staging:degraded` → exit 0.
  - Post-run `.ai/AUTOPILOT_STATUS.json` check: 19 top-level keys, original 18 preserved, only `revenue_self_run_v1` added.
  - `git diff --check` clean; secret-shape scan over the diff returned 0 raw-shape hits.
- Gate decision: **Source Go — pending user review.** Execution gate is `no_go` by design on this run because there are no real public URLs, no real KPI rows, and paid smoke is hard-locked.
- Risks: STAGING-004 admin wildcard RBAC patch and the US server live verification remain blocked on `154.217.241.238` SSH recovery; both are out of scope for this packet. The seed queue lives in `data/publishing-queue/` and ships 5 sample candidates — reviewer should confirm whether the seed queue should remain in the repo or be moved to a private ops location.
- Detailed evidence: see `.ai/REVENUE_AUTOPILOT_V1_LAUNCH_REVIEW_20260723.md`, `.ai/REVENUE_SELF_RUN_V1_REVIEW_20260723.md`, `.ai/KPI_REAL_DATA_EVIDENCE_20260723.md`, `.ai/ORCHESTRATOR_GATE_DECISION.json`.
- Suggested commit message: `feat(revenue): add human-approved self-run autopilot v1`.

## PILOT-001 P2 status (2026-07-23)

- Task ID: `20260723-pilot-001-p2-recovery`.
- Working tree: branch `pilot-001-p2-recovery-20260723` from `origin/main@490d450`, clean before this run. Not committed yet — pending user review.
- Goal: close the two PILOT-001 P2 items that do not require the US server (`154.217.241.238`), whose SSH is currently blocked on a manual cloud console / VNC restart. STAGING-004 admin wildcard RBAC patch and S01–S20 full validation remain out of scope for this packet.
- Source base: `origin/main@490d450 chore(model): all-in to MiniMax-M3 on minimax provider`.
- Diagnosis:
  - Sitemap: the original PILOT-001 P2 claim that `/legal/privacy` and `/legal/terms` were missing from the sitemap was already resolved in PR #162. The current build artifact at `.next/server/app/sitemap.xml.body` contains both canonical entries plus `/en/love-reading` and `/zh-CN/love-reading`. No code change needed; a regression contract was added to lock the composition.
  - US server health 500: root cause is `src/app/api/version/route.ts`, which returned HTTP 500 when `SERVICE_VERSION_BUILT_AT` was missing in production. There was no `src/app/api/health/route.ts` before this patch. The version route is the actual health probe target.
- What changed:
  - `src/app/api/version/route.ts` — now always returns HTTP 200 with `status: 'ok' | 'degraded'` and a typed `degradedReasons: string[]`. Malformed timestamps are treated as missing. The response adds `runtimeAt` so operators can confirm the handler actually ran.
  - `src/app/api/health/route.ts` (new) — lightweight liveness/readiness endpoint that does NOT call into external services (Supabase / Stripe / AI providers), so it stays green when downstream integrations are temporarily broken. Returns `status`, `checks.version`, and `degradedReasons`.
  - `src/__tests__/adsense-readiness-contract.test.ts` — added a contract assertion that forbids the literal `status: 500` shape from being reintroduced into the version route.
  - `src/__tests__/api/version-health-route.test.ts` (new, 8 cases) — covers the ok/degraded paths for both routes, including production-with-missing-env and malformed-timestamp scenarios.
  - `src/__tests__/sitemap-route-contract.test.ts` (new, 6 cases) — locks the canonical legal + locale-variant love-reading sitemap composition and the locale-alias redirect targets.
- Validation evidence:
  - `npm run typecheck` → exit 0.
  - `npm run lint` → exit 0, "No ESLint warnings or errors".
  - Targeted vitest run on the three affected suites → 20/20 PASS in ~0.5s.
  - `npm run build:staging:degraded` → exit 0; sitemap emitted as static route; built artifacts contain the expected legal + locale-variant entries (verified via `.next/server/app/sitemap.xml.body`).
  - `npm run audit:routes` → "audit-routes: OK".
  - `npm run audit:adsense` → "RESULT: PASS (SOURCE GATE)". Live route audit intentionally skipped (per the existing workflow: needs `ADSENSE_AUDIT_BASE_URL` + `ADSENSE_EXPECTED_COMMIT` together, which only exist post-deployment).
  - Secret-shape scan over the diff → 0 raw-shape hits. Only matches were the word "Stripe" inside JSDoc comments, which is acceptable narration.
- Gate decision: **Source Go — pending user review.** US server live verification is intentionally deferred (SSH blocked). Re-run `npm run audit:adsense` with `ADSENSE_AUDIT_BASE_URL` + `ADSENSE_EXPECTED_COMMIT` after the next US deploy and append the `/api/version` and `/api/health` response bodies to the recovery review.
- Risks:
  - STAGING-004 admin wildcard RBAC patch and S01–S20 full validation remain blocked on the US server reboot. They are NOT addressed by this packet and must be retried in track A after the SSH path is restored.
  - Future regression risk is mitigated by the new contract assertion in `src/__tests__/adsense-readiness-contract.test.ts`, which will fail CI if either route is changed to return HTTP 500 again.
- Detailed evidence: see `.ai/PILOT_001_P2_RECOVERY_REVIEW_20260723.md`.
- Suggested commit message: `fix(health): /api/version and /api/health return degraded instead of 500`.

## Current task

- Task ID: `20260717-tianji-adsense-final-remediation`
- Goal: implement the source-code remediations in the final Tianji.love AdSense audit and push a reviewable branch.
- Source base: `origin/main@bfa77cd8810e39f349db61028a5d95a6f6c42da7`
- Branch: `codex/adsense-final-remediation-20260717`
- Environment scope: local source worktree only.
- Execution scope: source, tests, CI/release checks, manual deployment workflow hardening, governance records, commit, branch push, PR creation, and PR CI observation.
- Approval: user instruction `落实并推送` plus the attached 2026-07-17 follow-up review directing the exact-SHA workflow, CMP responsibility split, PR creation, and Node 20 CI gate.
- Excluded: production deployment, AdSense/Google dashboard changes, live payments, production data, `.env`/secret access, and changing the external final verdict without public evidence.

## What changed

1. Added `src/config/products.ts` as the shared price/product catalog and switched checkout, pricing UI, structured data, and revenue contracts to it. The unavailable Love Premium Report remains coming soon and is excluded from JSON-LD offers.
2. Consolidated `/en|zh-CN/{pricing,privacy,terms}` through permanent redirects to the canonical routes, and removed the obsolete privacy-center URL from sitemap generation.
3. Rebuilt first-party consent controls with default-denied storage, persistent settings access, withdrawal, versioned storage, and document-language synchronization. After follow-up review, the first-party panel controls analytics only and never grants `ad_storage`, `ad_user_data`, or `ad_personalization`; advertising/TCF authority is reserved for a Google-certified CMP.
4. Corrected the Love Reading CTA to `/relationship/new?lang=en|zh` and covered the route contract in tests.
5. Replaced stale package/service/site brand signals, made footer years dynamic, and added `noindex, nofollow` headers to the six legacy product routes.
6. Updated privacy copy, removed the production deployment job from the generic CI workflow, rewrote the AdSense source/live audit, added an AdSense readiness contract test, and included the audit in `release:check`.
7. Hardened the separately manual production workflow without running it: dispatch requires a 40-character commit SHA, the remote SHA must equal current `origin/main`, the exact commit is checked out detached, `SERVICE_VERSION_COMMIT` and `SERVICE_VERSION_BUILT_AT` are exported before build/restart, and the post-restart smoke is followed by the SHA-aware live AdSense audit.

## Validation evidence

- `npm ci`: failed locally because this machine uses Node 24 and the native `sweph` package requires unavailable Visual Studio C++ build prerequisites. Project CI specifies Node 20.
- `npm ci --ignore-scripts`: passed; used only to restore dependencies for source validation.
- `npm run typecheck -- --pretty false`: passed.
- `npm run lint`: passed with no warnings or errors.
- `npm run test`: passed, 83 files / 643 tests.
- `npm run audit:adsense`: source gate passed; live gate intentionally skipped without an approved public base URL and expected deployed commit.
- `npm run build`: passed; 75 static pages generated. Existing Next/jose Edge-runtime and static-generation warnings remain non-blocking.
- `npm run release:check`: passed.
- Deployment workflow YAML parsing with Python/PyYAML: passed.
- Focused AdSense readiness contract: 5 tests passed. An initial follow-up run found a v2 consent-migration TypeScript narrowing error and a mismatched test timestamp; both were fixed before the final full gate.
- Local HTTP smoke: canonical pages and localized CTA returned 200; duplicate locale routes returned 308; `/bazi` returned `X-Robots-Tag: noindex, nofollow`; sitemap, robots, and `/api/version` checks passed.

## Gate decision and risks

- Source gate: `CONDITIONAL GO` and ready for PR review.
- PR Node 20 clean-install CI: pending until the PR is created and `Build & Test` completes.
- Production deployment: not run and not authorized by this packet.
- AdSense submission: remains `NO-GO`.
- External blockers: a Google-certified CMP/TCF message must be published; the exact reviewed commit must be deployed and matched through `/api/version`; public multi-region crawl, responsive UX, canonical, consent, and legacy-route checks must pass; Google must report `ads.txt` as Authorized; remaining legal/business identity evidence must be reviewed outside source code.
- Consent implementation in this branch controls first-party analytics only, cannot grant advertising consent, and does not claim to be a Google-certified CMP.

## Reviewer focus

1. Confirm the shared catalog values and the decision to keep Love Premium Report unavailable.
2. Confirm the canonical redirect strategy and legacy-route noindex policy.
3. Review consent UX/copy and verify the future certified CMP remains the sole advertising/TCF authority.
4. Confirm the generic CI has no deployment and the separately manual production workflow correctly fails closed unless the supplied SHA is the current remote `main` SHA.
5. Require GitHub Node 20 `Build & Test` to pass before merge.
6. After merge, certified CMP publication, and separately approved deployment, attach the exact `/api/version` SHA and live-audit evidence before changing the final verdict.
