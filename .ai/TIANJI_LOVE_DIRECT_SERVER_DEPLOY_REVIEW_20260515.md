# TianJi Love Direct Server Deploy Review - 2026-05-15

## Executive Verdict

Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: grant a deploy-capable SSH path or passwordless limited sudo for release deployment and service restart.

## Deployment Result

- Target domain: `https://tianji.love`
- Server hostname: `ser8221021417`
- App directory: `/var/www/tianji-global`
- Branch: target clean RC `rc/tianji-love-clean-local-20260513`
- Deployed commit: not deployed
- Intended commit: `8b099f1`
- Node version: server `v20.20.2`, local `v24.14.0`
- PM2 process: public port `3000` appears under `deploy`; `tianji-prod` PM2 list is empty
- Build result: local clean RC build passed
- Deploy access recheck: `deploy` SSH failed, `root` SSH failed, `tianji-prod` remains read-only for deployment purposes
- Restart result: not performed; SSH user lacks permission to restart deploy/systemd process
- Nginx test/reload result: not run in the recheck because deploy/root access still failed; reload not performed

## Public Smoke Matrix

This matrix reflects the current public site after the blocked deploy attempt. It is not post-deploy evidence.

| Route | Expected | Actual | Redirect | Verdict | Notes |
| --- | --- | --- | --- | --- | --- |
| `/` | `200` | `200` | none | Pass | Current site reachable |
| `/pricing` | `200` | `200` | none | Pass | Current site reachable |
| `/login` | `200` | `200` | none | Pass | Current site reachable |
| `/relationship/new` | `200` | `200` | none | Pass | Current site reachable |
| `/ask` | `200` or safe behavior | `200` | none | Pass | Current site reachable |
| `/draw` | `200` or safe behavior | `200` | none | Pass | Current site reachable |
| `/dashboard` | redirect to `/login` | `307` | `https://tianji.love/login?callbackUrl=%2Fdashboard` | Pass | Same-origin redirect |
| `/profile` | redirect to `/login` | `307` | `https://tianji.love/login?callbackUrl=%2Fprofile` | Pass | Same-origin redirect |

## Visual / UX Effect

- Homepage: Partial Pass; HTML fetch shows Tianji Love hero, CTA, and content.
- Pricing: Route check Pass; screenshot not available.
- Login: Route check Pass; screenshot not available.
- Relationship entry: Route check Pass; screenshot not available.
- Mobile: Not available; browser screenshot automation was not available.
- Hydration/runtime errors: Not available through curl-only public checks.

## Blocking Issues

1. `tianji-prod` cannot deploy: no passwordless sudo and no write access to `/var/www/tianji-global`.
2. Public process restart is not available: port `3000` app runs under `deploy`, while `tianji-prod` PM2 is empty.
3. `deploy` and `root` SSH logins still reject the current key.
4. Server app path is release-based, not a Git worktree, so the requested `git pull --ff-only` flow cannot run in `/var/www/tianji-global/current`.
5. Masked env remains paid-smoke unsafe: Stripe keys appear live-shaped and required Supabase/Resend/AI/Destiny key categories are missing.

## Non-Blocking Risks

1. There are two local Next listeners, ports `3000` and `3103`; public Nginx target is expected to be `3000`, but privileged Nginx config test was unavailable.
2. Running `pm2 list` as `tianji-prod` can spawn an empty `tianji-prod` PM2 daemon; it does not control the public app.
3. Public route checks pass on the current site, but they do not prove the clean RC commit is live.
4. Local current worktree is heavily dirty; the clean RC worktree should remain the deploy source.

## Explicitly Not Approved

- Paid smoke
- Live Stripe testing
- Production Stripe modification
- Secret exposure
- Blind server file deletion/reset
- Nginx reload after failed or unavailable privileged config test

## Recommended Next Task

Provide a deploy-capable SSH path for either `deploy` or `root`, or grant `tianji-prod` tightly scoped passwordless sudo for creating `/var/www/tianji-global/releases/*`, switching `current`, and restarting the verified public app process.

## Suggested Commit Message

```text
ops(staging): record tianji deploy permission blocker
```
