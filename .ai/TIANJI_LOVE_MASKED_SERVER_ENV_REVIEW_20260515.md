# TianJi Love Masked Server/Env Review - 2026-05-15

## Executive Verdict

Launch: No-Go
Deploy: No-Go
Paid smoke: No-Go
Next safe milestone: remediate staging env to test/safe classifications and rerun masked server/env inventory.

## Gate Matrix

| Gate | Verdict | Reason | Required Next Action |
|---|---|---|---|
| SSH/server access | Go | Git for Windows SSH returned stable read-only status output as `tianji-prod`. | Continue using Git SSH for status-only checks. |
| Server runtime | Conditional Go | Node `v20.20.2`, npm `10.8.2`, and active/enabled Nginx are present; app process ownership/source remains ambiguous. | Prove app process cwd/source and avoid PM2 daemon side effects. |
| Server source | No-Go | `/var/www/tianji-global/current` points to old release `20260502-155434`; no Git worktree was visible. | Prepare clean RC source candidate before deploy eligibility. |
| Masked env inventory | No-Go | Live-shaped Stripe keys are present; Supabase, Resend, AI provider keys, price IDs, and `DESTINY_SCAN_SECRET` are missing. | Remediate env to test/safe staging classifications. |
| Auth origin | Conditional Go | Auth URL keys and secrets are present, but exact origin/callback was not printed or externally verified. | Verify origin/callback out-of-band with masked proof. |
| Stripe staging safety | No-Go | Stripe secret and publishable keys appear live-shaped; Pro price IDs are missing. | Replace/isolate test-mode Stripe keys before any paid smoke. |
| Supabase staging readiness | No-Go | Supabase URL, anon key, and service-role key are missing. | Add staging Supabase evidence, masked only. |
| Resend/email readiness | No-Go | Resend key and sender keys are missing. | Add provider key and canonical sender evidence or keep email smoke blocked. |
| AI provider readiness | No-Go | Hosted AI provider keys are missing; only local Ollama base URL is present. | Prove local model health or add hosted staging provider evidence. |
| DESTINY_SCAN_SECRET | No-Go | Dedicated staging secret is missing. | Add dedicated masked staging secret. |
| Non-paid deploy eligibility | No-Go | Server/source/env readiness is not safe enough for clean RC deploy eligibility. | Remediate env and source candidate, then rerun review. |
| Paid smoke eligibility | No-Go | Live-shaped Stripe keys, missing price IDs, and incomplete provider evidence block paid smoke. | Keep paid smoke blocked. |
| Secret hygiene | Go | Reports use statuses and classifications only; targeted secret-pattern scan passed for new/updated docs. | Keep future scans scoped to changed evidence docs. |

## Blocking Issues

1. Current server source is an old release path, not the clean RC/current local evidence commit.
2. Stripe staging env is unsafe because secret and publishable keys appear live-shaped.
3. Stripe Pro monthly/yearly price IDs are missing.
4. Supabase staging URL, anon key, and service-role key are missing.
5. Resend key and sender env are missing.
6. Hosted AI provider keys are missing; local Ollama model readiness is not proven.
7. `DESTINY_SCAN_SECRET` is missing.
8. App process ownership/source is ambiguous; visible Next processes run under `deploy` and `root`, while `tianji-prod` PM2 list is empty.

## Non-Blocking Risks

1. `pm2 list` spawned an empty `tianji-prod` PM2 daemon; no cleanup was run due the read-only boundary.
2. `DATABASE_URL` is present but staging/prod separation was not proven from masked output alone.
3. Auth origin keys are present, but exact hosted callback alignment still needs masked proof.
4. Nginx routes domain traffic to a local app port, but that does not prove the app source/env is clean.
5. The local worktree still contains many unrelated dirty files outside this task.

## Explicitly Not Approved

- Deploy
- Restart services
- Paid smoke
- Live Stripe testing
- Production env modification
- Secret exposure

## Recommended Next Task

Prepare a secret-safe staging env remediation plan that replaces or isolates live-shaped Stripe keys with test-mode staging keys, adds missing Supabase/Resend/AI/Destiny evidence, and selects a clean RC source candidate; then rerun masked server/env inventory.
