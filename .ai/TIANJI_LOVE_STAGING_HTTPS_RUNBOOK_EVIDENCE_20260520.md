# TianJi Love Staging HTTPS Runbook Evidence - 2026-05-20

## Goal

Prepare a safe operator runbook for fixing the user-observed `https://staging.tianji.love` 502 path, without changing production or enabling paid/live side effects.

## Current Facts

```text
production free canary: Go
production free routes: Go
staging HTTP hosted smoke: Go from prior evidence
user-observed staging HTTPS: 502
production deploy status: not-run by Codex
paid launch: No-Go
```

## What Changed

- Added `docs/tianji-love-staging-https-runbook.md`.
- Documented staging-only `certbot --nginx -d staging.tianji.love` procedure.
- Documented required staging upstream `127.0.0.1:3058`.
- Documented production guard checks for `https://tianji.love`.
- Documented evidence fields for the eventual server operator run.

## What Was Not Run

```text
certbot: not-run
nginx reload: not-run
production deploy: not-run
PM2 restart: not-run
Stripe/webhook/provider live/email/Supabase mutation: not-run
paid unlock: not enabled
Vedic paid public exposure: not enabled
env or secrets read: no
```

## Safety Decision

```text
staging HTTPS remediation runbook: Go
actual staging HTTPS server change: Not-run
production impact: none
paid/live impact: none
```

## Next Step

Server operator can execute the runbook on the staging host only, then record:

```text
nginx -t before
certbot staging.tianji.love result
nginx -t after
nginx reload result
staging HTTPS smoke
production guard smoke
PM2 status
```
