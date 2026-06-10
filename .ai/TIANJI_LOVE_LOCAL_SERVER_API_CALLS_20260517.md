# TianJi Love Local Server and API Call Reference - 2026-05-17

## Safety Boundary

This file is a local reference for safe server/API checks only.

Do not put secrets in this file. Do not paste root passwords, API keys, webhook secrets, Supabase keys, Stripe keys, or `.env` values into docs, git, command logs, or chat.

The previously pasted server password and provider keys must be treated as exposed and rotated before any staging/live smoke.

## Known Server Target

```text
serverIp: 186.244.244.81
sshPort: 22
os: Ubuntu 24.04.1 x64
sshUser: root
sshPassword: rotate-required-do-not-use-in-codex
```

Preferred runtime targets:

```text
productionDomain: https://tianji.love
stagingDomain: configure-before-phase-5b
stagingBaseUrlEnv: STAGING_BASE_URL
```

Do not run production deploy from this reference.

## Local Readiness Commands

Run from the local project root:

```powershell
cd "D:\BrainSystem\💼 工作专项\ai占卜\tianji-global"
npm run audit:staging-env-readiness
npm run smoke:ai-providers
npm run smoke:stripe:test-readiness
npm run audit:staging-launch-gate
```

Do not run live provider smoke or Stripe test-live until explicitly approved.

## Safe Public HTTP Checks

These checks do not require secrets and should not mutate server state:

```powershell
curl.exe -I https://tianji.love/
curl.exe -I https://tianji.love/ask
curl.exe -I https://tianji.love/draw
curl.exe -I https://tianji.love/pricing
curl.exe -I https://tianji.love/relationship/new
```

For staging, replace the domain with the approved staging domain:

```powershell
$env:STAGING_BASE_URL="https://staging.example.com"
npm run smoke:staging:nonpaid
```

Only run `smoke:staging:nonpaid` after `audit:staging-env-readiness` is Go or explicitly accepted as Conditional Go.

## Safe Non-Paid API Surfaces

The Phase 4/5 non-paid smoke script covers these surfaces:

```text
GET /
GET /ask
GET /draw
GET /pricing
POST /api/relationship/analyze
POST /api/ask/preview
POST /api/draw/preview
```

Rules:

- use synthetic data only
- do not call unlock endpoints
- do not call Stripe checkout
- do not call provider APIs directly
- do not log request or response bodies
- do not include birthTime, birthLocation, timezone, raw user question, or raw provider prompt in logs

## Approval-Required Commands

Do not run these until explicitly approved after staging env readiness is Go:

```powershell
$env:AI_PROVIDER_SMOKE_MODE="live"
$env:AI_PROVIDER_SMOKE_ALLOW_LIVE="true"
npm run smoke:ai-providers
```

```powershell
$env:STRIPE_SMOKE_MODE="test-live"
$env:STRIPE_SMOKE_ALLOW_LIVE="true"
npm run smoke:stripe:test-readiness
```

Do not run production deploy from this phase.

## SSH Boundary

SSH access must not use a password pasted in chat. Rotate the exposed root password first, then prefer a non-root deploy user with SSH key access.

Allowed future SSH checks, only after credential rotation and explicit approval:

```bash
whoami
hostname
node -v
npm -v
pm2 -v
pm2 list
nginx -v
```

Forbidden without separate approval:

```text
editing env files
printing env values
restarting PM2
editing Nginx
deploying production
running paid smoke
running live Stripe
running live provider smoke
```

## Phase 5B Gate

Next safe command after staging env is configured in the server panel:

```powershell
npm run audit:staging-env-readiness
```

If the result is not Go:

```text
Staging env readiness: No-Go
Non-paid staging smoke: Not-run
Live smoke: Not-run
Production deploy: No-Go
```
