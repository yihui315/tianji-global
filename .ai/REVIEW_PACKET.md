# TianJi Love Daily Growth Publishing Pack - Review Packet

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
