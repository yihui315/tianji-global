# TianJi Love Staging Host Target Review

## 1. Is Vercel Configured?

Status: No-Go / not linked locally.

Findings:

- `vercel.json` exists, but it only defines `.next` as `outputDirectory` and a cron path.
- No `.vercel` directory exists in this worktree.
- No `.vercel/project.json` exists, so no linked Vercel project name, org, project ID, Preview URL, or staging URL can be verified locally.
- No Vercel deploy command is present in `package.json`.

Decision: Vercel is the safest recommended manual staging target, but it is not configured in this checkout.

## 2. Is Server Deploy Configured?

Status: Production-shaped only.

Findings:

- `docs/DEPLOY.md` and `docs/US_SERVER_DEPLOY.md` describe the self-hosted production path.
- The documented host/domain pair is `https://tianji.love` on server `186.244.244.81`.
- The documented app path is `/opt/tianji-global`.
- The documented PM2 app is `tianji-global`.

Decision: Server deploy docs exist for production. They must not be reused as staging without a separate staging hostname, deploy path, PM2 app name, and rollback plan.

## 3. Is PM2/Nginx Configured?

Status: Production-shaped only.

Findings:

- PM2/Nginx examples exist in `docs/US_SERVER_DEPLOY.md`.
- No separate staging Nginx `server_name` is defined.
- No separate staging PM2 app name is defined.
- No ecosystem config for staging was found.

Decision: PM2/Nginx can support server staging later, but staging is not configured now.

## 4. Is STAGING_BASE_URL Configured?

Status: No-Go / missing.

Findings:

- `STAGING_BASE_URL` appears in smoke docs and scripts, but only with placeholder examples.
- No real staging URL was found.
- `.env.example` did not contain a dedicated `STAGING_BASE_URL` slot before this task.

Decision: Hosted non-paid smoke remains Not-run until a real `STAGING_BASE_URL` exists.

## 5. Is Production Distinguishable From Staging?

Status: No-Go for hosted staging.

Findings:

- Production is distinguishable in docs as `https://tianji.love`.
- Staging is not distinguishable because no staging domain, Vercel Preview URL, PM2 app, server path, or deploy project is configured.

Decision: Do not deploy. A production-shaped target must not be treated as staging.

## 6. Safe Recommended Target

Recommended target: Vercel Preview / Vercel staging project.

Reason:

- This is a Next.js application.
- `vercel.json` already exists.
- Vercel Preview can provide a non-production URL quickly.
- Degraded flags can keep paid/provider/email/Supabase mutation paths disabled while the free path is smoke-tested.

Recommended manual target profile:

```text
Platform: Vercel
Environment: Preview or a dedicated staging project
Suggested URL class: https://tianji-love-staging.vercel.app or https://staging.tianji.love
Production domain: must not be used
```

## 7. Missing Manual Inputs

Required before hosted staging deploy:

1. Choose Vercel Preview/staging project or server staging.
2. Provide the staging URL as `STAGING_BASE_URL`.
3. Configure degraded flags in the staging host environment.
4. Configure auth/app origin names for the staging URL if the host requires them.
5. Confirm rollback path.
6. Approve hosted non-paid smoke.

For Vercel staging, the minimum non-secret/degraded flag set is:

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

## 8. No Secrets Printed Confirmation

- No `.env` or `.env.local` file was read.
- No deployment secret store was read.
- No provider, Stripe, Supabase, Resend, auth, webhook, or server credential value was printed.
- `.vercel/project.json` was not present; therefore no Vercel project identifiers were printed.
