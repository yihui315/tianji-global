# Brain Review Packet

## Task Goal

Define a real TianJi Love staging host target path so degraded staging can move from local build readiness to hosted non-paid smoke, without deploying production or running live/paid smoke.

## Status

```text
Code build: Go
Staging degraded build: Go
Runtime degraded guards: Go
Staging host target review: Go
Vercel local link: No-Go / missing
Server staging target: No-Go / missing
STAGING_BASE_URL slot: Go
Real STAGING_BASE_URL: No-Go / missing
deploy:staging:degraded wrapper: Go / build-only
Hosted non-paid smoke: Not-run
Production deploy: No-Go / not-run
Paid/live smoke: No-Go / not-run
Real secrets read/printed: No
```

## What Changed

- Added the Lane K task file.
- Added a staging host target review.
- Added a staging host target evidence packet.
- Added `STAGING_BASE_URL`, `NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false`, and `TIANJI_VEDIC_REPORT_MODE=disabled` to `.env.example`.
- Added `deploy:staging:degraded` as a safe build-only wrapper.
- Updated `docs/tianji-love-staging-deploy-runbook.md` with Vercel and server staging target profiles.
- Updated changelog and this review packet.

## Files Changed

- `.ai/TASK_TIANJI_LOVE_STAGING_HOST_TARGET_PHASE_K_20260516.md`
- `.ai/TIANJI_LOVE_STAGING_HOST_TARGET_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_STAGING_HOST_TARGET_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`
- `.env.example`
- `package.json`
- `docs/tianji-love-staging-deploy-runbook.md`

## Commands Run

| Command | Result |
| --- | --- |
| `git status --short --branch` | Pass; Lane K worktree started clean. |
| `git log --oneline -5` | Pass; base commit `438a251`. |
| `git worktree add ..\tianji-global-lane-k -b chore/staging-host-target` | Pass. |
| `node -e "JSON.parse(...package.json...)"` | Pass. |
| `npm run typecheck` | Pass. |
| `npm run lint` | Pass. |
| `npm run test` | Pass, 67 files / 553 tests. |
| `npm run build` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings. |
| `npm run build:staging:degraded` | Pass, 106 static pages; existing warnings. |
| `npm run audit:staging:degraded` | Pass, `overall: go`. |
| `npm run deploy:staging:degraded` | Pass; build-only wrapper, no external deploy. |
| `git diff --check` | Pass with LF/CRLF working-copy warnings only. |

## Target Decision

Recommended target: Vercel Preview or a dedicated Vercel staging project.

Reason:

- The project is a Next.js app.
- `vercel.json` exists.
- Vercel Preview/staging can provide a non-production URL quickly.
- Degraded flags keep provider/payment/email/Supabase mutation paths disabled while free flows are tested.

Current blocker:

- No `.vercel/project.json`
- No Vercel staging URL
- No server staging hostname/path/PM2 app/Nginx server block
- No real `STAGING_BASE_URL`

## Safety Notes

- No `.env` or `.env.local` file was read.
- No secret values were printed or recorded.
- No Vercel deploy, server deploy, SSH, PM2, Nginx, Stripe, provider, Supabase, or Resend command was run.
- Production deploy remains No-Go.

## Risks And Follow-Up

1. Lane K defines the host target path; it does not create the external Vercel/server resource.
2. Hosted non-paid smoke remains blocked until a real `STAGING_BASE_URL` exists.
3. `deploy:staging:degraded` is intentionally only a build wrapper; it does not deploy anywhere.
4. Paid Ask/Draw, Vedic paid exposure, Stripe test/live, provider live, webhook smoke, email send, Supabase mutation, and production deploy remain blocked.

## Suggested Commit Message

```text
chore: define tianji love staging host target
```
