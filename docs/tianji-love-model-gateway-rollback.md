# TianJi Love Model Gateway Rollback

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
npm run typecheck
```

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
