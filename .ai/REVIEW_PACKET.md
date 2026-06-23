# TianJi Love Revenue OS v1 P0 / PR #113 CI Repair - Review Packet

## Background

PR #113 restores `LeadCaptureForm`, love-reading pages, and a marketing leads API. Its CI/typecheck failed because localized love-reading copy used `zh` while the app `Locale` type is `en | zh-CN`, and `LeadCaptureForm` passed the full `useLanguage()` context object into analytics payloads.

## Task Goal

Fix the PR #113 typecheck blocker and add source-only Revenue OS P0 assets in an isolated local worktree. Do not push, deploy, run Stripe smoke, mutate production Supabase, replay webhooks, read `.env*`, mutate servers, or auto-post to social platforms.

## Changed Files

```text
progress.md
.ai/AUTOPILOT_REPORT.md
.ai/AUTOPILOT_STATUS.json
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
.ai/TASKS.md
assets/marketing/publishing-queue/README.md
assets/marketing/publishing-queue/schema.json
assets/marketing/publishing-queue/sample-queue.csv
data/growth-events-contract.csv
scripts/growth-daily-report.ts
src/__tests__/api/marketing-leads.test.ts
src/app/[locale]/love-reading/page.tsx
src/app/api/marketing/leads/route.ts
src/components/marketing/LeadCaptureForm.tsx
supabase/migrations/20260624_marketing_leads.sql
```

Removed:

```text
src/app/api/marketing/leads/leads-route.ts
```

## Key Diff Summary

- Moved `/api/marketing/leads` to `route.ts` so Next.js App Router exposes `POST /api/marketing/leads`.
- Added `variant` to the API contract and migration.
- Kept degraded mode at `202 skipped` with no DB write.
- Stored only a SHA-256 IP hash and truncated `user_agent`.
- Returned `400 invalid_payload` without Zod detail leakage and `500 internal_error` without DB detail leakage.
- Fixed `LeadCaptureForm` to destructure `{ lang }`, use `zh/en` only for UI copy, and send `en | zh-CN` locale to API/analytics.
- Rebuilt the localized love-reading page around `Record<Locale, ...>` typed copy maps.
- Added focused API tests covering valid insert, invalid email, missing `source_page`, false/missing consent, degraded skip, and DB failure.
- Added source-only `marketing_leads` SQL migration with RLS and service-role access.
- Added `growth-events-contract.csv`, manual publishing queue schema/sample, and a local daily growth report script that reports `no real data yet` when metrics are absent.

## Commands Run

```text
git fetch --no-tags origin main
git fetch --no-tags origin feature/marketing-rebuild-20260623
git worktree add -b codex/pr113-revenue-os-p0-20260624 C:\Users\Administrator\codex-worktrees\tianji-pr113-revenue-os-p0-20260624 origin/feature/marketing-rebuild-20260623
git status --short --branch
npm ci --ignore-scripts --no-audit --fund=false
npm run typecheck -- --pretty false
npm run lint
npm run test -- src/__tests__/api/marketing-leads.test.ts
npm run test
npm run build:staging:degraded
git diff --check
```

## Validation Result

- Initial `npm run typecheck -- --pretty false`: failed as expected on the PR #113 type mismatch.
- Final `npm run typecheck -- --pretty false`: passed.
- `npm run lint`: passed.
- `npm run test -- src/__tests__/api/marketing-leads.test.ts`: passed, 1 file / 7 tests.
- `npm run test`: passed, 82 files / 633 tests.
- `npm run build:staging:degraded`: passed.
- `git diff --check`: passed with LF/CRLF warnings only.

Continuation verification on 2026-06-24:

- `git status --short --branch`: clean worktree before record updates; branch ahead 1.
- `npm run typecheck -- --pretty false`: passed.
- `npm run lint`: passed.
- `npm run test -- src/__tests__/api/marketing-leads.test.ts`: passed, 1 file / 7 tests.
- `npm run test`: passed, 82 files / 633 tests.
- `npm run build:staging:degraded`: passed.
- `git diff --check`: passed.
- Source repair required during continuation: none.

## Known Noise

- `next lint` reports the existing Next.js deprecation notice.
- `build:staging:degraded` reports existing `jose` Edge Runtime warnings.
- Git prints LF/CRLF normalization warnings for some edited files.

## Safety Boundaries

```text
No .env or .env.* file was read, printed, copied, uploaded, or modified.
No raw secret was printed.
No push was performed.
No production deploy was performed.
No Stripe test/live paid smoke or real payment was performed.
No webhook replay was performed.
No Supabase production mutation was performed.
No PM2/Nginx/certbot/server mutation was performed.
No social account auto-posting was performed.
No fake testimonials, fake user numbers, guaranteed relationship outcomes, or 100% accuracy claims were added.
```

## Gate Status

| Gate | Status |
|---|---|
| PR #113 CI/typecheck | Go |
| Lead Capture Source | Go |
| Marketing Leads Migration | Go |
| API Tests | Go |
| Growth Events Contract | Go |
| Publishing Queue | Go |
| Daily Growth Report | Go for source readiness |
| Revenue Execution | No-Go |
| Stripe paid smoke | No-Go |
| Production deploy | No-Go |
| Supabase production mutation | No-Go |

## Reviewer Focus

- Confirm PR #113 should accept the localized love-reading copy rewrite as part of CI repair.
- Confirm `marketing_leads` RLS/service-role-only policy matches the intended deployment model.
- Confirm `lead_capture_failed` analytics payload remains privacy-safe.
- Confirm daily report script output path is acceptable before scheduling it.

## Suggested Commit Message

```text
feat(marketing): restore lead capture revenue os p0
```
