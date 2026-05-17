# TianJi Love Staging Host Target Evidence

## 1. What Changed

- Created the Lane K task record.
- Created a staging host target review.
- Added `STAGING_BASE_URL` and Vedic disabled flags to `.env.example` as names/defaults only.
- Added `deploy:staging:degraded` as a safe wrapper that only runs `npm run build:staging:degraded`.
- Updated the staging deploy runbook with:
  - current target decision
  - Vercel staging profile
  - server staging profile
  - required degraded flags
  - rollback/smoke instructions

No real staging deploy was run.

## 2. Files Changed

- `.ai/TASK_TIANJI_LOVE_STAGING_HOST_TARGET_PHASE_K_20260516.md`
- `.ai/TIANJI_LOVE_STAGING_HOST_TARGET_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_STAGING_HOST_TARGET_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`
- `.env.example`
- `package.json`
- `docs/tianji-love-staging-deploy-runbook.md`

## 3. Commands Run

| Command | Result |
| --- | --- |
| `git status --short --branch` | Pass; Lane K worktree started clean. |
| `git log --oneline -5` | Pass; Lane K started from `438a251`. |
| `git worktree add ..\tianji-global-lane-k -b chore/staging-host-target` | Pass. |
| `node -e "JSON.parse(...package.json...)"` | Pass, `package.json OK`. |
| `npm run typecheck` | Pass. |
| `npm run lint` | Pass. |
| `npm run test` | Pass, 67 files / 553 tests. |
| `npm run build` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings. |
| `npm run build:staging:degraded` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings. |
| `npm run audit:staging:degraded` | Pass, `overall: go`. |
| `npm run deploy:staging:degraded` | Pass; wrapper only ran degraded build, no external deployment. |
| `git diff --check` | Pass with LF/CRLF working-copy warnings only. |

## 4. Staging Target Decision

```text
Vercel configured locally: No-Go
Server staging configured: No-Go
PM2/Nginx staging configured: No-Go
Recommended target: Vercel Preview / dedicated Vercel staging project
Production target distinguishable from staging: No-Go until a staging URL exists
```

Vercel is the recommended next target because the app is Next.js and `vercel.json` exists. However, this checkout has no `.vercel/project.json`, no Vercel Preview URL, and no staging project metadata.

Server staging remains No-Go because the only concrete server docs describe the production-shaped `https://tianji.love` / `186.244.244.81` target.

## 5. STAGING_BASE_URL Status

```text
STAGING_BASE_URL slot in .env.example: Go
Real STAGING_BASE_URL configured: No-Go / missing
Hosted non-paid smoke: Not-run
```

## 6. Deploy Command Status

```text
deploy:staging:degraded script: Go / build-only wrapper
Real Vercel deploy command: No-Go / not configured
Real server staging deploy command: No-Go / not configured
Production deploy: No-Go / not-run
```

The new wrapper is intentionally conservative:

```bash
npm run deploy:staging:degraded
```

It runs only:

```bash
npm run build:staging:degraded
```

It does not call `vercel deploy`, SSH, PM2, Nginx, Stripe, providers, Supabase, or email.

## 7. Non-Paid Smoke Status

Not-run.

Reason: no real `STAGING_BASE_URL` exists.

Once the staging URL exists:

```bash
STAGING_BASE_URL=<staging-url> STAGING_NONPAID_SMOKE_ALLOW_LIVE=true npm run smoke:staging:nonpaid
```

## 8. Production Deploy Status

No-Go / not-run.

No production deploy, paid smoke, Stripe test-live, provider live smoke, webhook smoke, email send, or Supabase mutation was run.

## 9. Manual Action Needed

Choose and configure one real staging host:

1. Preferred: create/link a Vercel Preview or dedicated Vercel staging project.
2. Alternative: create server staging with a distinct hostname, deploy path, PM2 app name, Nginx `server_name`, and rollback path.

Required human-provided result:

```text
STAGING_BASE_URL=<real non-production staging URL>
```

Required degraded flags on the staging host:

```text
NEXT_PUBLIC_APP_ENV=staging
STAGING_DEGRADED_MODE=true
AI_PROVIDER_LIVE_DISABLED=true
STRIPE_LIVE_DISABLED=true
EMAIL_SEND_DISABLED=true
SUPABASE_MUTATION_DISABLED=true
NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false
TIANJI_VEDIC_REPORT_MODE=disabled
```

## 10. Suggested Commit Message

```text
chore: define tianji love staging host target
```
