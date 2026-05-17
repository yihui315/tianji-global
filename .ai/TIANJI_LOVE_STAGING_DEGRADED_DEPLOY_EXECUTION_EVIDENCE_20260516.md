# TianJi Love Staging Degraded Deploy Execution Evidence - 2026-05-16

## What Changed

Lane E was continued after merging the latest implementation baseline into `redesign-home-landing-20260420`.

Current merged baseline includes:

- runtime degraded guards
- staging degraded deploy package
- revenue funnel polish
- Vedic paid route wiring behind flags

No staging deploy was executed in this continuation. The dependency/build blocker from the earlier Lane E attempt is resolved in the main worktree, but a concrete non-production staging deploy target is still not identified in repository docs/scripts/config.

No application source, deployment code, env files, secrets, production config, Stripe, Supabase, provider settings, or runtime services were modified.

## Deploy Target

Status: No-Go / not explicit enough to deploy.

Read-only files checked:

- `package.json`
- `README.md`
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

- `docs/tianji-love-staging-deploy-runbook.md` defines the degraded staging build/start/smoke profile, but uses placeholder `STAGING_BASE_URL=https://staging.example.com` and does not name a real staging target.
- `vercel.json` only declares `.next` output and a cron path; it does not identify a staging project or URL.
- `docs/DEPLOY.md` and `docs/US_SERVER_DEPLOY.md` describe the self-hosted production shape for `https://tianji.love`, server `186.244.244.81`, `/opt/tianji-global`, and PM2 app `tianji-global`.
- `ops/**` files found in this worktree are growth/sales planning docs, not a staging deployment target.
- No ecosystem/PM2 config was found for a distinct staging target.
- Therefore the only concrete deploy instructions found remain production-shaped or generic. Per task constraint, production/generic server instructions were not used as staging.

## Files Changed

- `.ai/TIANJI_LOVE_STAGING_DEGRADED_DEPLOY_EXECUTION_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Commands Run

| Command | Result |
| --- | --- |
| `git status --short --branch` | Pass; tracked worktree clean, unrelated untracked local artifacts remain. |
| `git log --oneline -10` | Pass; latest commit is `b7515d5 feat: wire vedic relationship paid route behind flags`. |
| `git merge feat/wire-vedic-relationship-paid-route` | Pass; fast-forward from `cd372d3` to `b7515d5`. |
| `npm run typecheck` | Pass. |
| `npm run lint` | Pass. |
| `npm run test` | Pass, 67 files / 553 tests. |
| `npm run build` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings. |
| `npm run build:staging:degraded` | Pass, 106 static pages; existing NextAuth/jose Edge runtime warnings. |
| `npm run audit:routes` | Pass. |
| `npm run audit:copy` | Pass. |
| `npm run audit:share` | Pass. |
| `npm run audit:upgrade` | Pass. |
| `npm run audit:ask-revenue-contract` | Pass, `overall: conditional-go`. |
| `npm run audit:draw-revenue-contract` | Pass, `overall: conditional-go`. |
| `npm run audit:staging:degraded` | Pass, `overall: go`. |
| `git diff --check` | Pass. |
| Read-only deploy target scan with `Get-Content`, `rg`, and `Test-Path` over docs/scripts/config | Completed without reading `.env` files. |

## Build Result

Go.

Both normal production build and degraded staging build passed in the dependency-ready main worktree.

## Deploy Result

Not-run / No-Go.

Reasons:

- A concrete non-production staging deploy target was not identified.
- The only concrete server path in docs points to the production-shaped `tianji.love` deployment.
- Production deploy is explicitly No-Go.
- No explicit `STAGING_BASE_URL` exists for hosted non-paid smoke.

## Staging URL

Not established.

No staging URL was configured, discovered, or approved in repository docs/scripts/config.

## Non-Paid Smoke Result

Not-run.

Reason: deploy did not run and no usable `STAGING_BASE_URL` was established.

## Paid Routes Locked Status

Source/runtime contract evidence remains Go under degraded flags:

- `npm run audit:staging:degraded` returned `overall: go`.
- Ask revenue contract returned `overall: conditional-go`.
- Draw revenue contract returned `overall: conditional-go`.

Hosted staging locked-route smoke was not run because no staging target exists.

## Live Calls Status

Not-run.

No Stripe test-live, webhook smoke, paid smoke, live AI provider smoke, Resend send, Supabase mutation, or production provider call was executed.

## Production Deploy Status

No-Go / not-run.

The production server docs were read only to classify target risk. No production deploy command was run.

## Risks

- The code is ready for a degraded staging build, but deployment is blocked by missing non-production target evidence.
- Reusing `https://tianji.love` or `186.244.244.81` as staging would be a production canary decision, not Lane E staging degraded deployment.
- Hosted non-paid smoke remains Not-run until `STAGING_BASE_URL` is configured for a real non-production target.

## Next Step

Provide or create a secret-safe, explicit non-production staging target. Acceptable next evidence would include one of:

1. A staging subdomain and server path separate from production, with degraded flags configured.
2. A Vercel preview/staging project URL with degraded flags configured.
3. An approved local/staging server port exposed only for smoke testing, with clear rollback and no production routing.

After that, run:

```bash
npm run build:staging:degraded
npm run audit:staging:degraded
STAGING_BASE_URL=<staging-url> STAGING_NONPAID_SMOKE_ALLOW_LIVE=true npm run smoke:staging:nonpaid
```
