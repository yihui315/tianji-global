# TianJi Love Phase 5 - Staging Test Smoke Execution

## Current State

Phase 1-4 are complete and must not be redone.

- Relationship gateway integration: Go.
- Ask gateway integration: Go.
- Draw/Tarot gateway integration: Go.
- Ask revenue contract: Conditional Go.
- Draw revenue contract: Conditional Go.
- Staging smoke readiness framework: Go.
- Phase 4 commit: `2040f66 feat: add tianji love staging smoke readiness gate`.
- Staging env readiness is currently expected to remain No-Go unless staging/test env names are configured in this shell.
- No live Stripe, webhook, DeepSeek, Ollama, MiniMax, Supabase, Resend, paid smoke, or production deploy was run in Phase 4.

## Objective

Execute controlled Phase 5 staging smoke evidence. This phase may move staging env/readiness toward Go only if staging/test configuration is present and explicit live-smoke approval exists. It is not a production deploy phase.

Expected safe default when env is still missing:

```text
Staging env readiness: No-Go
Non-paid staging smoke: Not-run
AI provider live smoke: Not-run
Stripe test-live: Not-run
Production deploy: No-Go
```

## Strict Safety Constraints

- Do not read, print, echo, cat, or log real secret values.
- Do not commit `.env` files.
- Do not modify production database.
- Do not use production Stripe keys.
- Do not use production webhook secrets.
- Do not run live payment with a real card.
- Do not send real emails.
- Do not deploy production.
- Do not mutate production Supabase.
- Do not expose birthDate, birthTime, birthLocation, timezone, raw user question, raw provider prompt, or provider response bodies in logs.
- Use staging/test credentials only.
- All live calls require explicit approval.
- If key/env mode is ambiguous, stop and mark No-Go.

## Required Staging Inputs

The human operator must configure these outside Codex or provide masked confirmation only. Codex must not print values.

- App: `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- Supabase staging: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Stripe test mode: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRO_MONTHLY_PRICE_ID`, `STRIPE_PRO_YEARLY_PRICE_ID`, `STRIPE_ASK_PRICE_ID`, `STRIPE_DRAW_PRICE_ID`
- AI runtime: `AI_RUNTIME_MODE`, `AI_FREE_PREVIEW_PROVIDER`, `AI_FREE_PREVIEW_MODEL`, `AI_ROUTER_PROVIDER`, `AI_ROUTER_MODEL`, `AI_PAID_ASK_PROVIDER`, `AI_PAID_ASK_MODEL`, `AI_PAID_ASK_FALLBACK_MODEL`, `AI_INTERNAL_AGENT_PROVIDER`, `AI_ENABLE_SAFETY_REWRITE`, `AI_ENABLE_COST_LOGGING`, `AI_ENABLE_FALLBACK_LOGGING`
- Ollama: `OLLAMA_BASE_URL`
- DeepSeek staging/test: `DEEPSEEK_API_KEY`, `DEEPSEEK_BASE_URL`, `DEEPSEEK_MODEL_FLASH`, `DEEPSEEK_MODEL_PRO`
- MiniMax: `MINIMAX_API_KEY`, `MINIMAX_BASE_URL`, `MINIMAX_MODEL`, `MINIMAX_TOKEN_PLAN_KEY`
- Staging smoke: `STAGING_BASE_URL`, `SMOKE_LOCALE`, `SMOKE_TIMEOUT_MS`

## Execution Steps

1. Run worktree and commit review.
2. Run `npm run audit:staging-env-readiness` and record group-level result only.
3. Run dry-run/readiness gates:
   - `npm run smoke:ai-providers`
   - `npm run smoke:stripe:test-readiness`
   - `npm run audit:staging-launch-gate`
4. Run non-paid staging smoke only when `STAGING_BASE_URL` is configured and human approval exists.
5. Run AI provider live smoke only with explicit approval and staging/test credentials:
   - `AI_PROVIDER_SMOKE_MODE=live AI_PROVIDER_SMOKE_ALLOW_LIVE=true npm run smoke:ai-providers`
6. Run Stripe test-live readiness only with explicit approval and test-mode keys:
   - `STRIPE_SMOKE_MODE=test-live STRIPE_SMOKE_ALLOW_LIVE=true npm run smoke:stripe:test-readiness`
7. Keep Stripe CLI webhook smoke as documented-only unless explicitly approved.
8. Run aggregate launch gate and required local verification.

## Required Evidence Files

- `.ai/TIANJI_LOVE_PHASE5_WORKTREE_REVIEW_20260516.md`
- `.ai/TIANJI_LOVE_PHASE5_ENV_READINESS_20260516.md`
- `.ai/TIANJI_LOVE_PHASE5_DRY_RUN_GATE_20260516.md`
- `.ai/TIANJI_LOVE_PHASE5_NONPAID_SMOKE_20260516.md`
- `.ai/TIANJI_LOVE_PHASE5_AI_PROVIDER_LIVE_SMOKE_20260516.md`
- `.ai/TIANJI_LOVE_PHASE5_STRIPE_TEST_READINESS_20260516.md`
- `.ai/TIANJI_LOVE_PHASE5_STAGING_TEST_SMOKE_EVIDENCE_20260516.md`

## Required Verification

Always run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run audit:ask-revenue-contract
npm run audit:draw-revenue-contract
npm run audit:staging-env-readiness
npm run smoke:ai-providers
npm run smoke:stripe:test-readiness
npm run audit:staging-launch-gate
git diff --check
```

Do not run live smoke or hosted non-paid smoke unless the explicit approval and staging/test configuration conditions are met.

## Final Decision Boundary

Production deploy remains No-Go after Phase 5. If staging env readiness is still No-Go, no live smoke may run.
