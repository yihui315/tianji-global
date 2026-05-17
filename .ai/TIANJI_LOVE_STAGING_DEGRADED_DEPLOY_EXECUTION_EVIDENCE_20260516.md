# TianJi Love Staging Degraded Deploy Execution Evidence - 2026-05-16

## What Changed

Codex E attempted the degraded staging deploy execution gate from branch `chore/staging-degraded-deploy-execution` at `c04a4bd`.

No staging deploy was executed. The execution stopped because required local validation commands could not run in this lane: `node_modules` is absent, so project-local binaries such as `tsc`, `next`, `vitest`, and `tsx` are unavailable. The read-only deploy target scan also did not identify a concrete non-production staging target.

No application source, deployment code, env files, secrets, production config, Stripe, Supabase, provider settings, or runtime services were modified.

## Deploy Target

Status: No-Go / not explicit enough to deploy.

Read-only files checked:

- `package.json`
- `docs/tianji-love-staging-deploy-runbook.md`
- `docs/tianji-love-staging-smoke-runbook.md`
- `docs/DEPLOY.md`
- `docs/US_SERVER_DEPLOY.md`
- `vercel.json`
- `next.config.js`
- `ops/**` if present
- `scripts/**` deploy/staging references
- ecosystem / PM2 config search

Findings:

- `docs/tianji-love-staging-deploy-runbook.md` defines a degraded staging build/start/smoke profile, but uses placeholder `STAGING_BASE_URL=https://staging.example.com` and does not name a real staging target.
- `vercel.json` only declares `.next` output and a cron path; it does not identify a staging project or URL.
- `docs/DEPLOY.md` and `docs/US_SERVER_DEPLOY.md` describe the self-hosted production shape for `https://tianji.love`, server `186.244.244.81`, `/opt/tianji-global`, and PM2 app `tianji-global`.
- No `ops` deployment files or ecosystem/PM2 config were found for a distinct staging target.
- Therefore the only concrete deploy instructions found are production-shaped or generic. Per task constraint, production/generic server instructions were not used.

## Files Changed

- `.ai/TIANJI_LOVE_STAGING_DEGRADED_DEPLOY_EXECUTION_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Commands Run

| Command | Result |
| --- | --- |
| `git status --short` | Pass, no output at start. |
| `git log --oneline -8` | Pass; latest commits included `c04a4bd chore: add staging degraded deploy package` and `6aa56a5 feat: wire staging degraded runtime guards`. |
| `npm run typecheck` | Fail / not runnable: `tsc` is not recognized because dependencies are absent. |
| `npm run lint` | Fail / not runnable: `next` is not recognized because dependencies are absent. |
| `npm run test` | Fail / not runnable: `vitest` is not recognized because dependencies are absent. |
| `npm run build:staging:degraded` | Fail / not runnable: nested `npm run build` cannot find `next`. |
| `npm run audit:staging-degraded-mode` | Fail / not runnable: `tsx` is not recognized because dependencies are absent. |
| `npm run audit:staging:degraded` | Fail / not runnable: nested audit cannot find `tsx`. |
| `Test-Path node_modules` / `Test-Path package-lock.json` / `Test-Path node_modules/.bin/tsc.cmd` | Confirmed `node_modules` absent, `package-lock.json` present, `tsc` bin missing. |
| Deploy target scan with `Get-Content`, `rg`, and `Get-ChildItem` over docs/scripts/config | Completed read-only without reading `.env` files. |

## Build Result

No-Go.

`npm run build:staging:degraded` did not complete because project dependencies are not installed in this lane and `next` is unavailable. Because the task write scope was limited to three `.ai` files, no `npm install` or `npm ci` was run.

## Deploy Result

Not-run.

Reasons:

- Required local validation/build gate did not pass.
- A concrete non-production staging deploy target was not identified.
- Production-shaped deployment instructions exist, but production deploy is explicitly No-Go.

## Non-Paid Smoke Result

Not-run.

Reason: deploy did not run and no usable `STAGING_BASE_URL` was established.

## Paid Routes Locked Status

Not-run in hosted staging.

Source/config evidence from the degraded package says paid unlock, Stripe live/payment, webhook smoke, and paid smoke remain locked/out of scope under degraded staging flags. This was not revalidated by script because dependencies are absent.

## Live Calls Status

Not-run.

No Stripe test-live, webhook smoke, paid smoke, live AI provider smoke, Resend send, Supabase mutation, or production provider call was executed.

## Production Deploy Status

No-Go / not-run.

The production server docs were read only to classify target risk. No production deploy command was run.

## Risks

- This lane is missing dependencies, so the current checkout cannot prove typecheck, lint, tests, staging degraded build, or staging degraded audit.
- The repository does not currently provide a concrete staging deploy target separate from production.
- The production self-hosted path is concrete, but it is explicitly outside this task and must not be used for staging degraded deploy execution.

## Next Step

Provide or create a secret-safe, explicit non-production staging target and rerun from a dependency-ready worktree. The next run should:

1. Restore dependencies from the existing lockfile in an approved way.
2. Rerun `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build:staging:degraded`, `npm run audit:staging-degraded-mode`, and `npm run audit:staging:degraded`.
3. Deploy only if the target is clearly non-production and degraded flags are present.
4. Run `npm run smoke:staging:nonpaid` only after a real `STAGING_BASE_URL` exists.
