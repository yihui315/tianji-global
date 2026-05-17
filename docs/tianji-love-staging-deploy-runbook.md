# TianJi Love Staging Degraded Deploy Runbook

## Purpose

Package the current implementation-first degraded mode into a staging-deployable, rollbackable, smoke-ready layer without changing Ask, Draw, Stripe, email, Supabase, or model gateway runtime business logic.

This runbook is for staging only. It does not authorize production deploy, paid smoke, Stripe test-live calls, webhook smoke, live AI provider calls, Resend sends, or Supabase mutations.

## Staging Degraded Mode Strategy

Degraded mode keeps the public and non-paid surfaces available while disabling live provider, payment, email, and database mutation paths that are not yet approved for staging evidence.

Expected behavior:

- Public pages can build and load.
- Relationship free analysis can run without requiring Supabase mutation evidence.
- Ask preview remains a locked non-paid preview.
- Draw preview remains a locked non-paid preview.
- Paid Ask and Draw unlock paths remain locked when Stripe is disabled or unavailable.
- Model provider live calls return the degraded disabled response instead of calling external providers.
- Email send paths are disabled.
- Production deploy remains blocked.

## Current Target Decision

Current status: no real staging host is configured in this repository.

Recommended manual target: Vercel Preview or a dedicated Vercel staging project.

Rationale:

- This is a Next.js application.
- `vercel.json` exists, but no local `.vercel/project.json` link is present.
- No separate server staging domain, Nginx `server_name`, PM2 app, or deploy path is configured.
- The documented self-hosted server path is production-shaped and must not be used as staging without a separate hostname and process.

Do not deploy to `https://tianji.love` as part of staging degraded execution. That would be a production canary decision, not staging.

## Vercel Staging Profile

Use this profile after a human creates or links a Vercel Preview/staging project.

```text
Platform: Vercel
Environment: Preview or dedicated staging project
Project name: manual input required
STAGING_BASE_URL: manual input required
Production domain: must not be used
```

Required degraded flags in the Vercel environment:

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

Deploy command status:

```bash
npm run deploy:staging:degraded
```

This wrapper only runs the degraded build gate. It intentionally does not call `vercel deploy` because no non-production Vercel target is linked in this checkout.

After Vercel returns a real Preview/staging URL, configure:

```text
STAGING_BASE_URL=<vercel-preview-or-staging-url>
```

Then run:

```bash
STAGING_BASE_URL=<vercel-preview-or-staging-url> STAGING_NONPAID_SMOKE_ALLOW_LIVE=true npm run smoke:staging:nonpaid
```

Rollback for Vercel staging:

1. Disable the preview deployment in Vercel or promote the previous known-good preview.
2. Keep degraded flags enabled until the failing route is understood.
3. Do not promote to production.
4. Re-run `npm run audit:staging:degraded` before another staging smoke.

## Server Staging Profile

Use server staging only after a distinct non-production target exists.

Required manual inputs:

```text
Host alias: manual input required, no password in docs
Deploy path: must not be /opt/tianji-global production path
PM2 app name: must not be tianji-global production app
Nginx server_name: must not be tianji.love or www.tianji.love
STAGING_BASE_URL: manual input required
Rollback command/path: manual input required
```

Until those values exist, server staging is No-Go.

## Required Minimal Env

Set these non-secret flags for degraded staging build and runtime:

```text
NEXT_PUBLIC_APP_ENV=staging
STAGING_BASE_URL=<staging-url-after-host-is-created>
STAGING_DEGRADED_MODE=true
AI_PROVIDER_LIVE_DISABLED=true
STRIPE_LIVE_DISABLED=true
EMAIL_SEND_DISABLED=true
SUPABASE_MUTATION_DISABLED=true
NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=false
TIANJI_VEDIC_REPORT_MODE=disabled
```

Use staging or local-only values for normal application host/auth names when the target requires them. Do not paste secrets into chat, docs, or evidence.

## Optional Env

Optional non-paid smoke controls:

```text
STAGING_BASE_URL=https://staging.example.com
SMOKE_LOCALE=en
SMOKE_TIMEOUT_MS=15000
```

Optional local fallback metadata may be present for readiness classification, but degraded mode does not require live provider calls:

```text
OLLAMA_BASE_URL=http://localhost:11434
DEFAULT_OLLAMA_MODEL=gemma4:31b
DEFAULT_MODEL_PROVIDER=ollama
DEFAULT_MODEL=gemma4:31b
```

## Disabled Services Behavior

| Service | Degraded staging behavior |
| --- | --- |
| AI providers | Live calls disabled by `AI_PROVIDER_LIVE_DISABLED=true`; gateway returns a safe disabled response. |
| Stripe live/payment unlock | Disabled by `STRIPE_LIVE_DISABLED=true`; paid unlock routes stay locked/unavailable. |
| Email | Disabled by `EMAIL_SEND_DISABLED=true`; no Resend send should be attempted. |
| Supabase mutation | Disabled by `SUPABASE_MUTATION_DISABLED=true`; do not rely on staging writes. |
| Production deploy | Blocked while `STAGING_DEGRADED_MODE=true` unless a separate production approval explicitly changes the gate. |

## Build Command

```bash
npm run build:staging:degraded
```

This script sets the degraded staging flags in-process and runs `npm run build`. It does not add dependencies and does not require `cross-env`.

## Start Command

After deploying the built artifact to a staging target, start with the same degraded flags present in the hosting environment:

```bash
npm run start
```

Do not start staging with live provider, live Stripe, email send, or Supabase mutation flags enabled until the relevant gates are approved.

## Non-Paid Smoke Command

Only after a staging URL is approved:

```bash
STAGING_BASE_URL=https://staging.example.com npm run smoke:staging:nonpaid
```

This smoke covers public pages plus Relationship, Ask preview, and Draw preview non-paid routes. It must not run paid checkout, Stripe webhook smoke, live provider smoke, or production deploy.

## What Not To Run

Do not run these from this degraded deploy package:

- production deploy
- paid smoke
- Stripe test-live smoke
- Stripe webhook smoke
- live AI provider smoke
- Resend send tests
- Supabase mutation smoke
- real checkout sessions
- provider calls with real user content

## Rollback

If degraded staging build, start, audit, or non-paid smoke fails:

1. Stop new smoke commands.
2. Keep production deploy No-Go.
3. Keep paid smoke No-Go.
4. Remove or disable the staging deploy candidate from the hosting target.
5. Keep `STAGING_DEGRADED_MODE=true` and disabled-service flags in place until the issue is understood.
6. Use `docs/tianji-love-model-gateway-rollback.md` for route-level gateway fallback notes.
7. Re-run `npm run audit:staging:degraded` before re-attempting staging smoke.

## Go / Conditional Go / No-Go Table

| Decision | Conditions |
| --- | --- |
| Go | `npm run build:staging:degraded`, `npm run audit:staging:degraded`, required local checks, and approved non-paid staging smoke all pass with no live calls, no paid smoke, and no secret output. |
| Conditional Go | Build and degraded audit pass, but hosted staging URL or non-paid smoke evidence is missing. Deploy only to a controlled staging target with degraded flags and rollback ready. |
| No-Go | Any required check fails, degraded flags are absent, live provider/payment/email/Supabase mutation paths are enabled, secrets are exposed, production deploy is requested, or paid/live smoke is required. |
