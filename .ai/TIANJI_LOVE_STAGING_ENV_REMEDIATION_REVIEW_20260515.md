# TianJi Love Staging Env Remediation Review - 2026-05-15

## Executive Verdict

Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: obtain explicit approval and secret-safe masked staging env/server evidence, then rerun source/env readiness review.

This review used the TianJi skills committed in `4551488`. It inspected local source contracts and local runtime metadata only. It did not inspect real env values, remote server env, Stripe, Supabase, Resend, Auth provider, AI provider, PM2, or Nginx live state.

## Gate Matrix

| Gate | Verdict | Reason | Required Next Action |
|---|---|---|---|
| Git/source baseline | Conditional Go | Local HEAD is `4551488` on `redesign-home-landing-20260420`, but the branch is ahead and the worktree has many pre-existing dirty files. | Decide clean RC source candidate before deploy eligibility. |
| Runtime readiness | No-Go | Local Node/npm are present, but server Node/PM2/Nginx/runtime evidence was not collected. | Provide masked live server runtime evidence without secrets. |
| Auth origin | Conditional Go | Source has forwarded-host redirect helpers, but hosted Auth provider callback/origin evidence is missing. | Provide masked hosted origin and provider callback evidence. |
| Stripe staging safety | No-Go | Source supports Stripe, but test/live key mode, webhook endpoint, callback origin, and DB staging evidence are unknown. | Provide masked test-mode Stripe env and webhook evidence. |
| Supabase staging readiness | No-Go | Source requires Supabase URL and service-role key for admin flows; staging separation is unproven. | Provide masked staging Supabase URL/key classification and schema evidence. |
| Resend/email readiness | No-Go | Daily digest requires provider key and sender; source uses `FROM_EMAIL` while env example lists `EMAIL_FROM`. | Normalize sender key and provide masked provider evidence. |
| AI provider readiness | No-Go | Source supports provider fallback, but hosted provider/model env evidence is missing. | Provide masked provider/model evidence or documented safe local fallback. |
| DESTINY_SCAN_SECRET | No-Go | Source has fallback secret behavior, but staging-specific secret presence is unproven. | Provide masked presence of dedicated staging secret. |
| Non-paid smoke eligibility | Blocked | Routes exist, but deploy/source/server/env readiness is not proven. | Complete masked staging env/server review before smoke. |
| Paid smoke eligibility | No-Go | Paid smoke requires test-mode Stripe, webhook, callbacks, price evidence, and explicit approval; all remain missing or unknown. | Keep paid smoke blocked. |
| Secret hygiene | Go | Reports use key names and status labels only; targeted secret-pattern scan passed for the new/updated `.ai` docs. | Keep future scans scoped to changed evidence docs. |

## Blocking Issues

1. Server source/env readiness is still not proven.
2. PM2, Nginx, server Node, and active runtime evidence are missing in this session.
3. Stripe test/live classification is unknown, so paid smoke remains No-Go.
4. Stripe webhook secret, endpoint, price ID mapping, and callback origin evidence are missing.
5. Subscription checkout still uses inline price construction while webhook tier mapping expects env price IDs.
6. Supabase staging separation and service-role key classification are missing.
7. Resend provider evidence is missing, and sender env naming is inconsistent.
8. Hosted AI provider/model readiness is missing.
9. `DESTINY_SCAN_SECRET` dedicated staging evidence is missing.
10. The local worktree is dirty and source candidate remains ambiguous for deploy.

## Non-Blocking Risks

1. `next.config.js` ignores TypeScript and ESLint errors during build, which may hide quality failures.
2. React runtime and React type package major versions differ in `package.json`.
3. Relationship analysis can return in-memory results if Supabase persistence fails, which is useful for local resilience but not enough for launch evidence.
4. Ask and Draw have local fallback behavior, but fallback success must not be mistaken for hosted AI provider readiness.
5. `.vercel` linkage is absent locally even though `vercel.json` exists.

## Recommended Next Task

Collect a masked staging server/env inventory with explicit approval, including source commit, active runtime path, Node/npm, PM2, Nginx, app origin, Stripe test-mode classification, webhook endpoint, Supabase staging classification, Resend provider/sender evidence, AI provider/model evidence, and `DESTINY_SCAN_SECRET` masked presence.

## Explicitly Not Approved

- Deploy
- Paid smoke
- Live Stripe testing
- Production env modification
- Secret exposure
