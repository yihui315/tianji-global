# TianJi Love Model Gateway Rollback

## Staging Degraded Deploy Package

For the current implementation-first staging package, start with `docs/tianji-love-staging-deploy-runbook.md`. The package keeps `AI_PROVIDER_LIVE_DISABLED=true`, `STRIPE_LIVE_DISABLED=true`, `EMAIL_SEND_DISABLED=true`, and `SUPABASE_MUTATION_DISABLED=true` so gateway rollback work is not used to bypass disabled staging services.

Before any gateway-specific route rollback, run:

```bash
npm run audit:staging:degraded
```

If the degraded audit fails, treat staging deploy as No-Go and fix the disabled-service contract before attempting non-paid smoke.

## When To Roll Back

Roll back this gateway slice if any of these happen:

- public output includes deterministic predictions after gateway adoption
- paid Ask output cannot reach DeepSeek and has no acceptable local fallback
- paid/pro Draw output cannot reach the `tarot_draw` route and has no acceptable fallback
- gateway fallback attempts skip configured local fallback models
- MiniMax quota checks fail repeatedly or expose more than status/quota metadata
- `npm run typecheck` or focused gateway tests fail after route wiring

## Safe Rollback Steps

1. Stop new route adoption of `generateTianjiModelResponse`.
2. For `/api/relationship/analyze`, remove the `aiMeta` attachment and safety wrapper only if the wrapper is identified as the regression source.
3. For `/api/ask/preview`, keep the locked local teaser behavior. Do not restore pre-payment full-answer generation.
4. For `/api/ask/unlock`, temporarily return a user-safe paid-generation-unavailable error if the `paid_ask` gateway path regresses. Do not expose the old token `fullAnswer` path to unpaid users.
5. For `/api/draw/preview`, keep the locked limited preview and local fallback. Do not restore paid/pro full-reading generation before checkout.
6. For `/api/draw/unlock`, temporarily return a user-safe paid-generation-unavailable error if the `tarot_draw` gateway path regresses. Do not expose token-stored full readings to unpaid users.
7. For `/api/tarot`, disable `enhanceWithAI` or return `aiError` while preserving deterministic card draws if `tarot_draw` regresses.
8. If fallback ordering is the regression, keep callers on deterministic/local output and fix `generateTianjiModelResponse` before wiring additional routes.
9. Revert future callers to the previous `generateReport` or deterministic engine path only after confirming the route is still behind payment/entitlement checks.
10. Keep `src/lib/tianji-model-gateway.ts` unused until a fixed route-level patch is ready.
11. Disable MiniMax internal workflows by removing `MINIMAX_API_KEY` and `MINIMAX_TOKEN_PLAN_KEY` from the active environment manager.
12. Keep Ollama enabled for local fallback if `OLLAMA_BASE_URL` is healthy.
13. Re-run:

```bash
npm run test -- src/__tests__/lib/tianji-model-gateway.test.ts
npm run test -- src/__tests__/api/relationship-analyze-localization.test.ts
npm run test -- src/__tests__/api/ask-paid-gateway.test.ts
npm run test -- src/__tests__/api/draw-gateway.test.ts
npm run audit:ask-revenue-contract
npm run audit:draw-revenue-contract
npm run audit:staging-env-readiness
npm run smoke:ai-providers
npm run smoke:stripe:test-readiness
npm run audit:staging-launch-gate
npm run typecheck
```

## Phase 4 Staging Smoke Rollback

If a staging readiness or smoke command fails:

1. Stop live smoke execution and keep production deploy No-Go.
2. Preserve unpaid Ask and Draw gating. Do not bypass checkout/session verification to recover a smoke.
3. Keep `AI_PROVIDER_SMOKE_MODE=dry-run` and `STRIPE_SMOKE_MODE=readiness` until the failing staging/test configuration is corrected.
4. If a hosted non-paid smoke fails, remove `STAGING_NONPAID_SMOKE_ALLOW_LIVE=true` from subsequent runs until the route issue is fixed.
5. If Stripe test-readiness flags production-shaped keys, remove those variables from staging before any test-live command.
6. If provider smoke fails, keep gateway fallback and safety rewrite in place and repair provider-specific env/config outside production.
7. Re-run the aggregate gate only after the specific failing readiness command returns `go` or an accepted `conditional-go`.

## Data Safety Notes

The gateway audit event intentionally excludes prompts and generated content. If future wiring persists gateway telemetry, store only:

- intent
- provider
- model
- fallback flag
- latency
- token counts
- cost
- non-secret error class

Do not store raw birth data, user questions, generated relationship content, API keys, Stripe IDs, Supabase tokens, or `.env` values in gateway telemetry.
