# TianJi Love Credential Rotation Checklist

## Scope

Any API/server credentials pasted into chat earlier must be rotated.

This checklist is for manual credential rotation planning only. Do not store rotated secrets in repo, chat, screenshots, evidence docs, logs, tickets, or commit messages. Record only masked status labels such as `rotated`, `disabled`, `pending`, `test`, `staging`, `production-risk`, or `unknown`.

## Rotation Checklist

| Area | Rotate | Required verification |
| --- | --- | --- |
| Server SSH/password/API keys | Rotate any pasted root password, deploy password, SSH key, host API key, panel token, or server automation credential. | Verify old keys disabled and old password access revoked. |
| Stripe | Rotate any pasted `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, webhook secret, restricted key, API key, or test/live dashboard credential. | Verify old keys disabled; confirm staging uses test mode only before paid smoke. |
| Supabase service role | Rotate any pasted `SUPABASE_SERVICE_ROLE_KEY`, database password, project API key, service token, or SQL/admin credential. | Verify old keys disabled; confirm staging project is separate from production. |
| Resend | Rotate any pasted `RESEND_API_KEY`, SMTP/API credential, sender-domain token, or webhook credential. | Verify old keys disabled; confirm staging sender/domain is approved. |
| DeepSeek/MiniMax | Rotate any pasted `DEEPSEEK_API_KEY`, `MINIMAX_API_KEY`, `MINIMAX_TOKEN_PLAN_KEY`, provider dashboard token, or proxy/API credential. | Verify old keys disabled; confirm provider smoke uses test/staging-approved keys only. |

## Required Human Steps

1. Inventory every credential that may have appeared in chat, terminal scrollback, screenshots, evidence files, or temporary notes.
2. Rotate server SSH/password/API keys first because they can grant broad infrastructure access.
3. Rotate Stripe, Supabase service role, Resend, DeepSeek, and MiniMax credentials in their provider dashboards.
4. Configure the rotated values only in the approved staging secret store or server env.
5. Do not store rotated secrets in repo.
6. Verify old keys disabled before running any staging smoke.
7. Rerun masked readiness checks and record only status labels, never raw values.

## Evidence Fields To Record

| Field | Allowed values |
| --- | --- |
| Credential area | server, Stripe, Supabase, Resend, DeepSeek, MiniMax |
| Rotation status | `pending`, `rotated`, `not-applicable`, `unknown` |
| Old key status | `disabled`, `pending-disable`, `unknown` |
| New key storage | `staging-secret-store`, `server-env`, `provider-dashboard`, `unknown` |
| Smoke approval | `not-approved`, `approved-nonpaid`, `approved-provider`, `approved-paid` |

## Gate Decision

Credential rotation remains a manual blocker until all pasted API/server credentials are rotated, old keys are disabled, and masked readiness confirms staging/test classifications without exposing raw values.
