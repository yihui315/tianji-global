# TianJi Love Daily Growth Publishing Pack - Review Packet

## 2026-06-22 tianji-github-content-calendar auto run (cron)

Branch `infra/tianji-love-production-baseline-20260531` received the rolling-window refresh from the `tianji-github-content-calendar` cron skill. No code, env, secrets, Stripe, Supabase, deployment, or paid-side change was introduced. The skill is docs/assets/AI-records-only and produces a refreshed 7-day window plus a planned next-week preview.

### Goal

Keep at least seven future days of TianJi Love publishing content, refresh the active Days 1-7 window starting today (2026-06-22) with themes, hooks, scripts, captions, channel mix, CTAs, and risk-safe notes preserved verbatim from the previous Days 9-15 window, and add a Days 8-14 preview so the next cron refresh has planned continuity.

### Changed Files

```text
assets/marketing/content-calendar-7day.md            (refreshed: Days 1-7 + new Days 8-14 preview)
assets/marketing/love-test-next-30-hooks.md         (refreshed rotation window + Days 8-14 preview)
assets/marketing/love-test-next-20-video-scripts.md  (refreshed rotation window + Days 8-14 preview)
assets/marketing/love-test-next-20-share-captions.md (refreshed rotation window + Days 8-14 preview)
.ai/CHANGELOG_AI.md                                  (entry prepended)
.ai/REVIEW_PACKET.md                                 (this section prepended)
```

### Key Diff Summary

- `assets/marketing/content-calendar-7day.md` — renumbered Days 9-15 to Days 1-7 (identical content, only the Day column changed). Added a "Next-week preview" table for Days 8-14 (2026-06-29 → 2026-07-05) with seven supporting themes: closing ambiguity, familiar patterns, asking without scaring, conflict avoidance, sensitivity, long-distance rhythm, growth signals. All new copy keeps the safety baseline (no fake numbers, no guaranteed outcomes, no diagnosis, no live payment claims).
- `assets/marketing/love-test-next-30-hooks.md` — refreshed the rotation window header from Days 9-15 to Days 1-7 (same hook indices). Added a Days 8-14 preview using only existing hook indices (no new hook copy invented).
- `assets/marketing/love-test-next-20-video-scripts.md` — refreshed the rotation window header from Days 9-15 to Days 1-7 (same script picks). Added a Days 8-14 preview using only existing scripts (no new script copy invented).
- `assets/marketing/love-test-next-20-share-captions.md` — refreshed the rotation window header from Days 9-15 to Days 1-7 (same caption indices). Added a Days 8-14 preview using only existing caption indices 1-20 (no new caption copy invented).
- CHANGELOG entry prepended to `.ai/CHANGELOG_AI.md` summarizing the run.
- This packet updated to summarize the run.

### Validation

```text
git diff --check
  -> exit 0, no whitespace errors

Targeted secret-shape scan over .ai/, assets/marketing/, data/
  -> 0 matches for sk_live_*, sk_test_*, whsec_*, price_*, AIza*, ghp_*,
     -----BEGIN *PRIVATE KEY-----, SUPABASE_SERVICE_ROLE_KEY=<value>
     (new content contains only day numbers, theme labels, and pool indices)

npm run typecheck
  -> not run; no node_modules in this cron environment; source code scope is zero

npm run lint
  -> not run; same reason; source code scope is zero
```

### Out-of-Scope Confirmations

- No `.env`, secrets, Stripe Price IDs, webhook secrets, or production configuration values were read, printed, copied, diffed, or inferred.
- No Stripe checkout was executed.
- No paid smoke was executed.
- No production deploy, Vercel deploy, or production Supabase mutation was attempted.
- No social auto-posting, account credential use, or browser session was used.
- No KPI row was modified with invented values.
- No pool copy was invented; only the rotation-window headers and Days 8-14 preview blocks were touched.

### Gate Status

```text
Seven-day content calendar: Go (Days 1-7, 2026-06-22 → 2026-06-28)
Next-week preview (Days 8-14): planned (2026-06-29 → 2026-07-05)
Hook pool: Go (no refill)
Video script pool: Go (no refill)
Share caption pool: Go (no refill)
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

## 2026-06-22 tianji-github-daily-growth auto run (cron)

Branch `infra/tianji-love-production-baseline-20260531` received the Day 003 publishing pack from the `tianji-github-daily-growth` cron skill. No code, env, secrets, Stripe, Supabase, deployment, or paid-side change was introduced. The skill is docs/assets/data-only and produces one narrow publishing pack, one review checklist, and one KPI CSV scaffold per day, plus the AI-record updates.

### Goal

Ship the Day 003 manual publishing pack for `/love-test` traffic under the theme "他现在到底在想什么？先别急着追问，先看你们的互动模式", with a separate manual review checklist and a zero/empty KPI entry scaffold. No social auto-posting, no live payment, no production deploy.

### Changed Files

```text
assets/marketing/daily/day-003-publishing-pack.md  (new)
assets/marketing/daily/day-003-review-checklist.md  (new)
data/love-test-day-003-kpi-entry.csv                (new)
.ai/CHANGELOG_AI.md                                 (entry prepended)
.ai/REVIEW_PACKET.md                                (this section prepended)
```

### Key Diff Summary

- New `assets/marketing/daily/day-003-publishing-pack.md` records the Day 003 theme (mind-reading loop, distinct from Day 001 ambiguity and Day 002 waiting posture), the safety baseline, 3 Xiaohongshu posts, 2 Douyin scripts, 1 Videohao script, 5 share-card captions, 2 KOL DM templates, 3 SEO outlines, the Day 3 posting order, and the manual metric to watch.
- New `assets/marketing/daily/day-003-review-checklist.md` enumerates required safety checks, theme-specific checks (no mind-reading claims, no coercion, no impulsive outreach framing), channel-specific checks for Xiaohongshu, Douyin, Videohao, and KOL outreach, and a Go / No-Go summary that keeps Stripe checkout, paid smoke, and production deploy as No-Go.
- New `data/love-test-day-003-kpi-entry.csv` contains 16 placeholder rows (Xiaohongshu, Douyin, Videohao, share_card, KOL, SEO) with all numeric columns at `0` and `paid_smoke_result=not_run`. No invented numbers.
- CHANGELOG entry prepended to `.ai/CHANGELOG_AI.md` summarizing the run.
- This packet updated to summarize the run.

### Validation

```text
git diff --check
  -> exit 0, no whitespace errors

Targeted secret-shape scan over .agents/skills/, .github/workflows/, .ai/, assets/marketing/, data/
  -> 0 matches for sk_live_*, sk_test_*, whsec_*, price_*, AIza*, ghp_*,
     -----BEGIN *PRIVATE KEY-----, SUPABASE_SERVICE_ROLE_KEY=<value>

npm run typecheck
  -> not run; no node_modules in this cron environment; source code scope is zero

npm run lint
  -> not run; same reason; source code scope is zero
```

### Out-of-Scope Confirmations

- No `.env`, secrets, Stripe Price IDs, webhook secrets, or production configuration values were read, printed, copied, diffed, or inferred.
- No Stripe checkout was executed.
- No paid smoke was executed.
- No production deploy, Vercel deploy, or production Supabase mutation was attempted.
- No social auto-posting, account credential use, or browser session was used.
- No KPI row was modified with invented values.

## 2026-06-21 tianji-github-paid-gate auto run (cron)

Branch `infra/tianji-love-production-baseline-20260531` received the AUTO-mode gate-status commit from the `tianji-github-paid-gate` cron skill. No code, env, secrets, Stripe, Supabase, deployment, or paid-side change was introduced. The skill is read-only against `.ai/` evidence, performs a secret-shape scan, and produces a gate status report plus a narrow test-mode smoke task draft.

### Goal

Monitor Stripe checkout readiness, validate test-mode paid-smoke readiness, and commit a gate status report on the daily 06:00 UTC cron schedule - no human approval required, no live-Stripe touch.

### Changed Files

```text
.ai/TIANJI_LOVE_GATE_STATUS_2026-06-21.md  (new)
.ai/CHANGELOG_AI.md                        (entry prepended)
.ai/REVIEW_PACKET.md                       (this section prepended)
```

### Key Diff Summary

- New `.ai/TIANJI_LOVE_GATE_STATUS_2026-06-21.md` records the gate verdict (`Checkout readiness audit: Conditional Go`, `Test-mode smoke readiness: No-Go`, `Stripe test-mode boundary: Verified`, `Gate status: CONDITIONAL-GO`), lists every evidence file inspected, shows the `git diff --check` and secret-shape scan results, and includes the narrow test-mode smoke task draft.
- CHANGELOG entry prepended to `.ai/CHANGELOG_AI.md` summarizing the AUTO run.
- This packet updated to summarize the run.

### Validation

```text
git diff --check
  -> exit 0, no whitespace errors

Targeted secret-shape scan over .ai/, .agents/skills/, .github/workflows/
  -> 0 matches for sk_live_*, sk_test_*, whsec_*, price_*, AIza*, ghp_*,
     -----BEGIN *PRIVATE KEY-----, SUPABASE_SERVICE_ROLE_KEY=<value>
```

### Out-of-Scope Confirmations

- No `.env`, secrets, Stripe Price IDs, webhook secrets, or production configuration values were read, printed, copied, diffed, or inferred.
- No Stripe checkout was executed.
- No paid smoke was executed.
- No production deploy, Vercel deploy, or production Supabase mutation was attempted.
- No provider live AI call, no email send, no webhook replay, no Supabase mutation, no Vedic paid public exposure.

### Gate Status

```text
Checkout readiness audit: Conditional Go
Test-mode smoke readiness: No-Go
Stripe test-mode boundary: Verified
Gate status: CONDITIONAL-GO
Next scheduled run: 0 6 * * * (tomorrow 06:00 UTC)
Production paid launch: No-Go
```

## 2026-06-21 7-day content calendar refresh (week of 2026-06-22)

Branch `infra/tianji-love-production-baseline-20260531` received the docs/assets-only content calendar refresh from the `tianji-github-content-calendar` cron skill. The previous 7-day window (2026-05-25 → 2026-05-31) was already in the past, so the calendar was replaced with seven future publishing days (2026-06-22 → 2026-06-28, Days 9–15) and an explicit theme rotation. Hook, video-script, and share-caption pools were preserved verbatim and topped with a current rotation window plus refill-signal note.

## Goal

Keep at least seven future days of TianJi Love content ready for manual review, rotate the four core emotional angles so the calendar does not stack the same one twice, keep all copy helpful / grounded / non-guaranteed, and preserve the manual publishing boundary. No auto-post, no paid smoke, no Stripe checkout, no production deploy.

## Changed Files

```text
assets/marketing/content-calendar-7day.md
assets/marketing/love-test-next-30-hooks.md
assets/marketing/love-test-next-20-video-scripts.md
assets/marketing/love-test-next-20-share-captions.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Diff Summary

- `content-calendar-7day.md` — replaced the seven stale 2026-05-25 → 2026-05-31 rows with seven fresh rows for 2026-06-22 → 2026-06-28 (Days 9–15). Added a "Theme rotation" section that explicitly lists the seven daily angles and notes the closing day re-centers on self-steadiness to avoid back-to-back *what is he thinking* days. Channel mix is spread across Xiaohongshu / Douyin / Videohao / share push / KOL DM batch / SEO draft / weekly recap.
- `love-test-next-30-hooks.md` — all 30 hooks preserved verbatim. Added a "Current rotation window (2026-06-22 → 2026-06-28)" block that maps each calendar day to a subset of hook indices, plus a refill signal (pool ≥ 30 unused across the week; no refill needed this run).
- `love-test-next-20-video-scripts.md` — all 20 scripts preserved verbatim. Added a "Current rotation window" block that maps each calendar day to a specific script (and a second script for Days 11 and 15), plus a refill signal.
- `love-test-next-20-share-captions.md` — all 20 captions preserved verbatim. Added a "Current rotation window" block that maps each calendar day to a subset of caption indices, plus a refill signal.
- CHANGELOG entry prepended to `.ai/CHANGELOG_AI.md` summarizing the run, validation, gate status, and risks.
- This packet updated to summarize the run.

## Validation

```text
git diff --check
Pass: no whitespace errors on the modified files
(assets/marketing/content-calendar-7day.md,
assets/marketing/love-test-next-30-hooks.md,
assets/marketing/love-test-next-20-video-scripts.md,
assets/marketing/love-test-next-20-share-captions.md,
.ai/CHANGELOG_AI.md, .ai/REVIEW_PACKET.md).

Targeted secret-shape scan over .ai/, assets/marketing/, data/
Clean for the new content. The new rotation-window notes contain only
day numbers, theme labels, and pool indices — no credential patterns,
no token shapes, no Stripe Price IDs, no webhook secrets, no .env
references, no real customer data.

npm run typecheck / npm run lint
Not run in this cron environment (no node_modules); source code scope
is zero for this skill, so typecheck/lint impact is nil.
```

## Out-of-Scope Confirmations

- No `.env`, secrets, Stripe Price IDs, webhook secrets, or production configuration values were read, printed, copied, diffed, or inferred.
- No Stripe checkout was executed.
- No paid smoke was executed.
- No production deploy, Vercel deploy, or production Supabase mutation was attempted.
- No social auto-posting, account credential use, cookie use, or login session was performed.
- No fake testimonials, fake user counts, fake revenue, or fake KPI claims were introduced.
- No guaranteed relationship / reunion / medical / financial outcome claim was introduced.
- No KPI row in `data/love-test-day-XXX-kpi-entry.csv` was modified.

## Gate Status

```text
Seven-day content calendar: Go (2026-06-22 → 2026-06-28)
Hook pool: Go (no refill)
Video script pool: Go (no refill)
Share caption pool: Go (no refill)
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

## 2026-06-21 day 002 love-test KPI analysis run (placeholder-only)

Branch `infra/tianji-love-production-baseline-20260531` received the Day-002 KPI-analysis artifacts from the `tianji-github-kpi-analysis` cron skill. Theme being measured: 一直等对方先开口吗？先把主动权放回自己手里 (waiting posture, Day 002). No new content was generated and no KPI rows were modified.

## Goal

Run the KPI analysis cron job on Day 002 data, or — when the KPI source is still placeholder-only — produce a No-Go report that records the data gap, the gate status, and the operator unblock checklist instead of fabricating a hook ranking or Day 003 plan.

## Changed Files

```text
.ai/reports/love-test-growth-report-2026-06-21.md
assets/marketing/daily/day-002-optimization-notes.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Diff Summary

- New `.ai/reports/love-test-growth-report-2026-06-21.md` explicitly marked `SKIPPED — Real KPI data required`, lists every KPI source inspected under `data/`, records the Gate Status (KPI source file: No-Go; KPI analysis report: Not run; Optimization notes: Not run; Fake metrics: No-Go; Stripe checkout execution: Not run; Paid smoke: No-Go; Production deploy: No-Go), enumerates the seven analyses that are deferred, and lists the six concrete data gaps that block analysis.
- New `assets/marketing/daily/day-002-optimization-notes.md` is a non-recommendation stub that records the seven blocked Day-003 content-direction decisions, the seven input-blocker mappings, and the operator unblock checklist.
- CHANGELOG entry appended at the top of `.ai/CHANGELOG_AI.md` summarizing the No-Go run.
- This packet updated to summarize the run.

## Validation

```text
git diff --check
Pass: no whitespace errors on the staged + untracked files
(.ai/reports/love-test-growth-report-2026-06-21.md,
assets/marketing/daily/day-002-optimization-notes.md,
.ai/CHANGELOG_AI.md, .ai/REVIEW_PACKET.md).

Targeted secret-shape scan over .agents/skills/, .github/workflows/, .ai/, assets/marketing/, data/
Clean for the newly created files. Pre-existing matches in .github/workflows/*.yml
(GitHub Actions `${{ secrets.* }}`) and .ai/* evidence docs (env names with masked values only)
were not introduced by this skill.

npm run typecheck / npm run lint
Not run in this cron environment (no node_modules); source code scope is zero for this skill,
so typecheck/lint impact is nil.
```

## Out-of-Scope Confirmations

- No `.env`, secrets, Stripe Price IDs, webhook secrets, or production configuration values were read, printed, copied, diffed, or inferred.
- No Stripe checkout was executed.
- No paid smoke was executed.
- No production deploy, Vercel deploy, or production Supabase mutation was attempted.
- No KPI row in `data/love-test-day-001-kpi-entry.csv` or `data/love-test-day-002-kpi-entry.csv` was overwritten.
- No Day 003 publishing pack was generated in this run.

## 2026-06-21 day 002 daily growth publishing pack

Branch `infra/tianji-love-production-baseline-20260531` received the Day 002 docs/assets/data-only publishing pack for `/love-test` manual distribution. Theme: 一直等对方先开口吗？先把主动权放回自己手里 (waiting posture).

## Goal

Continue the daily manual publishing rhythm without any code, schema, payment, env, or deploy changes. Add a Day 002 publishing pack, review checklist, and KPI entry scaffold that the operator can use after manual review.

## Changed Files

```text
assets/marketing/daily/day-002-publishing-pack.md
assets/marketing/daily/day-002-review-checklist.md
data/love-test-day-002-kpi-entry.csv
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Diff Summary

- New `day-002-publishing-pack.md` with 3 Xiaohongshu posts, 2 Douyin scripts, 1 Videohao script, 5 share-card captions, 2 KOL DM templates, and 3 SEO outlines, all under a single narrow theme (waiting posture).
- New `day-002-review-checklist.md` with required checks, theme-specific checks (no "testing the other person" framing, no coercion language, no diagnosis), and channel-specific checks.
- New `love-test-day-002-kpi-entry.csv` with zero/`not_run` placeholders only — no invented metrics.
- CHANGELOG and this packet updated to record the run.

## Validation

```text
git diff --check
Pass: no whitespace errors on the staged + untracked files (assets/marketing/daily/day-002-*, data/love-test-day-002-kpi-entry.csv, .ai/CHANGELOG_AI.md, .ai/REVIEW_PACKET.md).

Targeted secret-shape scan over .agents/skills/, .github/workflows/, .ai/, assets/marketing/, data/
Clean for the newly created files. Pre-existing matches in .github/workflows/*.yml and .ai/* evidence docs were not introduced by this skill.

npm run typecheck / npm run lint
Not run in this cron environment (no node_modules); source code scope is zero for this skill, so typecheck/lint impact is nil.
```

## Safety Boundaries

```text
No .env file was read, printed, modified, or staged.
No Stripe live action, test-mode checkout, webhook replay, paid smoke, production Supabase mutation, Vercel production deploy, server push, or main merge was performed.
No account credentials, login cookies, browser sessions, or platform tokens were used.
No social auto-posting was performed; publishing remains manual.
No invented KPI values, testimonials, customer counts, or guaranteed relationship outcomes were added.
```

## Gate status

```text
Daily growth publishing pack: Go
Manual review checklist: Go
KPI entry scaffold: Go
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

## Reviewer focus

- Confirm Day 002 copy avoids "testing" or provocation framings toward the partner.
- Confirm CTA points users to `/love-test` first, with no live payment claim.
- Confirm the KPI CSV contains only zero/`not_run` placeholders for manual entry.
- Confirm no app source, env, deployment config, or runtime system was changed.

## Suggested commit message

```text
chore(marketing): add love-test day 002 publishing pack
```

---

# TianJi Love Production Baseline Release Readiness - Review Packet

## 2026-06-19 production baseline branch release readiness

Branch `infra/tianji-love-production-baseline-20260531` is source-release ready after repairing invalid UTF-8/mojibake-damaged TianJi Love reading copy modules.

## Goal

Make the current branch pass the project-defined release gate so it can be safely considered for deployment through the approved production path.

## Changed Files

```text
src/lib/love-reading/free-preview-generator.ts
src/lib/love-reading/love-archetypes.ts
src/lib/love-reading/love-dimensions.ts
src/lib/love-reading/love-timing.ts
src/lib/love-reading/premium-report-template.ts
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Diff Summary

- Repaired invalid UTF-8 / mojibake-damaged love-reading copy modules that caused `tsc` parse failures.
- Removed UTF-8 BOMs introduced during recovery and kept the files valid UTF-8.
- Preserved the existing love-reading schema and generator interfaces.
- Used ASCII-safe English fallback copy for `en`, `zh`, and `zh-Hant` to restore buildability without introducing new dependencies.
- Kept payment, Auth, Stripe, Supabase, API routes, middleware, deployment config, and environment files out of scope.

## Validation

```text
git diff --check HEAD
Passed with line-ending warnings only.

npm run release:check
Passed.

release:check includes:
- npm run typecheck
- npm run lint
- npm run test
- npm run build
- npm run audit:routes
- npm run audit:copy
- npm run audit:share
- npm run audit:upgrade

Vitest:
81 files passed / 626 tests passed.

Next build:
Compiled successfully and generated 108 static pages.
```

## Safety Boundaries

```text
No .env file was read, printed, modified, or staged.
No raw secret was printed.
No live Stripe action was run.
No production Supabase action was run.
No paid smoke was run.
No production deploy or Vercel production deploy was run.
No main merge was performed.
```

## Known Noise

```text
Next build reports existing jose Edge Runtime warnings for CompressionStream and DecompressionStream.
next lint reports the existing Next.js 16 deprecation notice.
```

## Risks And Follow-Up

- Source-release readiness is Go for the checked branch, based on the local release gate.
- Production deployment is still a separate approval-controlled action and was not performed.
- Revenue/payment execution remains No-Go until fresh masked test/staging evidence and explicit approval are present.
- Chinese and Traditional Chinese reading copy currently falls back to English copy; this restores buildability but should be followed by a proper localized copy pass.

## Suggested Commit Message

```text
fix(love-reading): restore release-safe copy modules
```

---

# TianJi Love Pretext Layout Merge Readiness - Review Packet

## 2026-05-26 relationship Pretext layout merge readiness

Prepared a small relationship-only Pretext integration for a narrow PR.

## Goal

Use `@chenglou/pretext` to make TianJi Love relationship result text more layout-stable without changing payment, Auth, API, privacy, Ask/Draw, deployment, Stripe, Supabase, or workflow surfaces.

## Changed Files

```text
package.json
package-lock.json
src/components/relationship/usePretextTextLayout.ts
src/components/relationship/RelationshipResult.tsx
src/components/relationship/RelationshipDimensionCard.tsx
src/__tests__/relationship-flow-contract.test.ts
.ai/TIANJI_LOVE_PRETEXT_LAYOUT_QA_20260526.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Diff Summary

- Added `@chenglou/pretext@0.0.7`.
- Added `usePretextTextLayout`, a client-only hook that observes element width, measures text with Pretext, and applies stable `minHeight`.
- Wired the hook into relationship result headline, summary, next move, locked report body, and dimension summaries.
- Kept the hook privacy-agnostic: it receives display text only and does not know about birth dates, birth times, locations, timezones, Stripe, Supabase, or analytics payloads.
- Kept payment closed-loop work out of this PR line.

## Validation

```text
npm run test -- --run src/__tests__/relationship-flow-contract.test.ts
Passed, 11/11.

npm run typecheck -- --pretty false
Passed.

npm run lint
Passed. Existing Next lint deprecation notice only.

npm run build
Passed.

npm run test
Passed, 74 files / 596 tests.

npm run audit:routes
Passed.

npm run audit:copy
Passed.

npm run audit:share
Passed.

npm run audit:upgrade
Passed.

git diff --check
Passed with existing LF/CRLF warnings only.
```

## Visual QA

```text
Desktop:
- scrollWidth: 1365
- clientWidth: 1365
- horizontal overflow: No
- min-height: headline 56px, summary 56px, next move 56px, locked body 56px

Mobile:
- scrollWidth: 390
- clientWidth: 390
- horizontal overflow: No
- min-height: headline 140px, summary 112px, next move 56px, locked body 112px

Known noise:
- Existing /api/analytics/relationship 503 appeared during local smoke.
- No pageerror was observed.
```

## Risks And Follow-Up

- Bundle size increases slightly on the relationship route.
- Analytics 503 is existing local noise and should remain a separate follow-up.
- Payment closed loop remains out of scope and should continue on a separate branch/PR.
- Production deploy and paid smoke remain No-Go.

## Suggested Commit Message

```text
feat(relationship): stabilize result text layout with pretext
```

## 2026-05-25 PR #60 merge and paid smoke gate

PR #60 remains open and should not be merged yet.

```text
PR: https://github.com/yihui315/tianji-global/pull/60
Branch: feat/tianji-divination-evidence-layer-20260525
Source commit: 7333e68fbd3e0891051deb8cd2b420d2557f4dda
Merge commit: N/A
```

Gate review:

```text
CI/CD: No-Go - no GitHub Actions workflow runs found for the source commit.
Vercel: Fail - GitHub combined status reports Vercel failure.
Conflicts: Blocked/unknown detail - GitHub reports mergeable=false.
Mergeable: No.
PR diff risk: No-Go - 53 commits / 325 files, broader than the evidence-layer scope.
PR merge: No-Go / Pending.
Production deploy: Not run.
```

Paid smoke readiness:

```text
npm run smoke:stripe:test-readiness
overall: conditional-go
stripeKeysLookTestMode: unknown

npm run audit:ask-revenue-contract
overall: conditional-go

npm run audit:draw-revenue-contract
overall: conditional-go
```

Paid checkout smoke was not run because safe Stripe test-mode env evidence is not available in the current shell and explicit test-mode paid-smoke approval remains required. Analytics privacy remains source/test verified, but the paid unlock and feedback events were not runtime-verified through checkout in this gate pass.

## What changed

Implemented a safe evidence and accuracy-feeling layer across Ask, Draw, and Relationship.

- Ask preview and paid unlock now return structured evidence.
- Draw preview and paid unlock now return structured tarot/timing evidence.
- Relationship readings now attach or derive structured evidence from score, dimensions, summary, and timeline.
- Added shared evidence UI with confidence, signals, timing, verification points, action advice, feedback, and paid unlock CTA.
- Added privacy-safe analytics events for evidence viewed, expanded, feedback submitted, and unlock clicked from evidence.

## Files changed

```text
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
.ai/TIANJI_LOVE_DIVINATION_EVIDENCE_LAYER_20260525.md
.ai/TIANJI_LOVE_SKILL_MATCH_MATRIX_20260525.md
src/__tests__/api/ask-paid-gateway.test.ts
src/__tests__/api/draw-gateway.test.ts
src/__tests__/lib/divination-evidence.test.ts
src/__tests__/relationship-flow-contract.test.ts
src/__tests__/revenue-funnel-polish-contract.test.ts
src/app/(main)/ask/page.tsx
src/app/(main)/draw/page.tsx
src/app/api/analytics/track/route.ts
src/app/api/ask/preview/route.ts
src/app/api/ask/unlock/route.ts
src/app/api/draw/preview/route.ts
src/app/api/draw/unlock/route.ts
src/app/api/relationship/analyze/route.ts
src/app/relationship/result/[id]/page.tsx
src/components/divination/DivinationEvidenceCard.tsx
src/components/relationship/RelationshipResult.tsx
src/lib/analytics/client.ts
src/lib/analytics/divination-events.ts
src/lib/divination/evidence.ts
src/lib/relationship-engine.ts
src/lib/trust-copy-guard.ts
src/types/divination.ts
src/types/relationship.ts
```

## Safety review

- No secrets, env files, private keys, tokens, cookies, or production logs were read or staged.
- No production deploy, server mutation, DNS, Nginx, PM2, live DB mutation, live Stripe payment, or paid smoke was performed.
- Analytics payloads are restricted to safe fields: `route`, `paid`, `confidence`, `evidenceSignalCount`, `sourceTypes`, and optional feedback.
- Evidence builders redact private values and deterministic/professional/fear-based claims.
- The feature is additive and does not remove existing divination safety disclaimers.

## Validation

```text
npm run test -- --run src/__tests__/lib/divination-evidence.test.ts
Pass: 1 file, 7 tests.

npm run test -- --run src/__tests__/lib/divination-evidence.test.ts src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/relationship-flow-contract.test.ts src/__tests__/revenue-funnel-polish-contract.test.ts
Pass: 5 files, 41 tests.

npm run typecheck
Pass.

npm run lint
Pass.

npm run test
Pass: 74 files, 595 tests.

npm run build
Pass with existing jose Edge Runtime warnings.

npm run audit:routes
Pass.

npm run audit:copy
Pass.

npm run audit:share
Pass.

npm run audit:upgrade
Pass.

npm run audit:ask-revenue-contract
Conditional Go.

npm run audit:draw-revenue-contract
Conditional Go.

git diff --check
Pass with existing CRLF warnings only.

Chrome headless local route QA
Pass: /ask?lang=en, /draw?lang=en, /relationship/new?lang=en.
```

## Gate status

| Gate | Status |
|---|---|
| Skill matching | Go |
| Implementation | Go |
| Typecheck | Go |
| Lint | Go |
| Tests | Go |
| Build | Go |
| Non-paid local QA | Go |
| Paid smoke | No-Go unless explicitly tested in safe Stripe test mode |
| Production deploy | No-Go |

## Reviewer focus

- Confirm free preview depth is compelling but not over-generous.
- Confirm the evidence card CTA is not too aggressive for relationship/divination safety.
- Confirm analytics payloads remain non-sensitive if future builders add fields.
- Confirm Relationship full unlock should show more evidence after an approved paid smoke.

## Suggested commit message

```text
feat(tianji-love): add divination evidence layer
```
