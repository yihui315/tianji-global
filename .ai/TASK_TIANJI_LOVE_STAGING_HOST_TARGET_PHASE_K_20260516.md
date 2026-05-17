# TianJi Love Lane K - Create Real Staging Host Target

## Current State

Code is ready, but no real staging host exists.

Completed:

- Gateway
- Ask revenue gate
- Draw revenue gate
- Runtime degraded guards
- Staging degraded build
- Revenue funnel polish
- Vedic paid route wiring behind flags
- Production canary prep

Current blocker:

- No explicit non-production staging target
- No `STAGING_BASE_URL`
- Hosted non-paid smoke cannot run

## Objective

Create or document a real staging host target so degraded staging can be deployed and smoke-tested.

Preferred path:

- Vercel Preview / Vercel staging project if available
- Otherwise server staging with PM2/Nginx

This task must not deploy production.

## Strict Constraints

- Do not deploy production.
- Do not use production Stripe.
- Do not run paid smoke.
- Do not run provider live smoke.
- Do not run webhook smoke.
- Do not print secrets.
- Do not commit `.env`.
- Do not mutate production Supabase.
- Do not send email.

## Required Output

- `.ai/TIANJI_LOVE_STAGING_HOST_TARGET_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_STAGING_HOST_TARGET_EVIDENCE_20260516.md`
- Safe `.env.example` key-name slots only
- Safe package wrapper only if it cannot deploy production
- Updated changelog and review packet

## Verification

Run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run build:staging:degraded
npm run audit:staging:degraded
git diff --check
```

Do not run hosted smoke unless `STAGING_BASE_URL` is real.
