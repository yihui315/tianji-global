# TianJi Global Deployment Guide

TianJi Global is deployed on a self-hosted US server. Do not use Vercel as the
production deployment path for this project.

For the active server runbook, see [`US_SERVER_DEPLOY.md`](US_SERVER_DEPLOY.md).

## Current Production Shape

- Domain: `https://tianji.love`
- Server IP: `186.244.244.81`
- Reverse proxy: Nginx
- Process manager: PM2
- PM2 app: `tianji-global`
- App directory: `/opt/tianji-global`

## Release Gate

Run the full release gate before deploying a commit:

```bash
npm run release:check
```

The release gate runs lint, typecheck, tests, production build, and all audit
scripts.

## Deployment Options

Use one of these paths:

- Manual server deploy from `/opt/tianji-global`.
- GitHub Actions workflow `Deploy US Server` after the production SSH secrets
  are configured.

Both paths should run:

```bash
npm ci --legacy-peer-deps
npm run release:check
pm2 restart tianji-global --update-env
SMOKE_BASE_URL=https://tianji.love npm run smoke:production
```

## External Service Checklist

Configure these in the production service dashboards before sending paid
traffic:

- Stripe webhook endpoint: `https://tianji.love/api/stripe/webhook`
- Google OAuth redirect URI: `https://tianji.love/api/auth/callback/google`
- Resend sender/domain for `EMAIL_FROM`
- Supabase/Postgres migrations from `supabase/migrations`
- AI provider key and cost limits

Never paste secret values into docs, PRs, logs, tickets, or chat.

## Current Preflight Status

Observed on 2026-05-10:

- GitHub release gate for PR #46 passed.
- `tianji.love` and `www.tianji.love` resolve to `186.244.244.81`.
- HTTP with the Tianji host redirects to HTTPS.
- HTTPS closes during handshake from this workstation.
- `http://186.244.244.81/` without a Host header returns the default Nginx
  404 page.
- SSH key login for `deploy`, `root`, and `ubuntu` is not available from this
  workstation.

Before production deploy, fix Nginx/TLS on the server and provision SSH key
access for the deploy user or configure the GitHub Actions deployment secrets.
