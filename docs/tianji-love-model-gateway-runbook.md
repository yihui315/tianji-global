# TianJi Love Model Gateway Runbook

## Scope

This runbook covers the first landing slice of the mixed model gateway from the research plan:

- local Ollama for high-frequency public preview, support, safety rewrite, and first-pass vision work
- DeepSeek V4 for paid/high-value Ask unlocks and cloud fallback
- MiniMax M2.7 for internal research and content workflows only, guarded by token-plan quota checks

No real API keys are committed here. Do not put secrets in docs, commits, reports, screenshots, or logs.

## Implemented Entry Points

- `src/lib/tianji-model-gateway.ts`
  - maps TianJi Love intents to provider/model routes
  - attempts each route's configured `fallbackModels` in order before surfacing provider failure
  - rewrites deterministic public relationship predictions before returning output
  - builds non-sensitive audit events that exclude prompts and generated content
  - exposes a MiniMax token-plan quota gate shape
- `src/app/api/relationship/analyze/route.ts`
  - uses the `relationship-report` gateway route as the first public adoption point
  - runs rule-engine output through deterministic-prediction safety rewrite before response/persistence
  - attaches non-sensitive `aiMeta` route metadata to the relationship reading
  - does not make live provider calls in this slice
- `src/app/api/ask/preview/route.ts`
  - returns only a locked local teaser and an encrypted question token
  - does not call a paid AI route before checkout
  - does not expose provider/model metadata to unpaid users
- `src/app/api/ask/unlock/route.ts`
  - creates the Ask one-time Stripe Checkout session
  - verifies payment status and the `ask-question` metadata flow before generation
  - calls the `paid_ask` gateway route only after paid unlock verification
  - returns non-sensitive `aiMeta` for paid generation
- `src/app/api/draw/preview/route.ts`
  - draws three cards server-side and returns a useful but limited locked preview
  - calls the `tarot_draw` gateway route for the free/limited Draw reading when AI is available
  - stores only the card/question context in the encrypted unlock token; it does not store the paid full reading before checkout
  - preserves local fallback preview behavior when AI times out or fails
- `src/app/api/draw/unlock/route.ts`
  - creates the Draw one-time Stripe Checkout session
  - verifies payment status and the `quick-draw` metadata flow before paid/pro generation
  - calls the `tarot_draw` gateway route only after paid unlock verification
  - returns non-sensitive `aiMeta` for paid/pro Draw generation
- `src/app/api/tarot/route.ts`
  - routes enhanced Tarot interpretations through `tarot_draw`
  - returns non-sensitive `aiMeta` when an enhanced model reading is requested
- `src/lib/ai-orchestrator.ts`
  - supports DeepSeek and MiniMax through OpenAI-compatible chat completions
  - keeps Ollama as the no-key local provider
- `scripts/check-minimax-quota.ts`
  - checks the MiniMax token-plan remains endpoint when `MINIMAX_TOKEN_PLAN_KEY` is present
  - outputs only status and allowlisted quota fields, never the key

## Intent Routing

| Intent | Default route | Public? | Safety rewrite? | Fallback candidates |
|---|---|---:|---:|---|
| `love-preview` | `ollama/gemma4:31b` | yes | yes | `ollama/gpt-oss:20b`, `deepseek/deepseek-v4-flash` |
| `relationship-report` | `ollama/gemma4:31b` | yes | yes | `deepseek/deepseek-v4-flash` |
| `ask-unlock` | `deepseek/deepseek-v4-flash` | yes | yes | `deepseek/deepseek-v4-pro`, `ollama/gemma4:31b` |
| `paid_ask` | `deepseek/deepseek-v4-flash` | yes | yes | `deepseek/deepseek-v4-pro`, `ollama/gemma4:31b` |
| `ask_preview` | `ollama/gemma4:31b` | yes | yes | `ollama/gpt-oss:20b` |
| `tarot-draw` | `ollama/gemma4:31b` | yes | yes | `ollama/gpt-oss:20b`, `deepseek/deepseek-v4-flash` |
| `tarot_draw` | `ollama/gemma4:31b` | yes | yes | `deepseek/deepseek-v4-flash` |
| `support-faq` | `ollama/gpt-oss:20b` | yes | yes | `deepseek/deepseek-v4-flash` |
| `safety-rewrite` | `ollama/gpt-oss:20b` | yes | yes | `deepseek/deepseek-v4-flash` |
| `safety_rewrite` | `ollama/gpt-oss:20b` | yes | yes | `deepseek/deepseek-v4-flash` |
| `internal-research` | `minimax/MiniMax-M2.7` | no | no | `deepseek/deepseek-v4-flash`, `ollama/gemma4:31b` |
| `visual-first-pass` | `ollama/llava:7b` | no | no | `minimax/MiniMax-M2.7` |
| `judge-replay` | `ollama/deepseek-r1:32b` | no | no | `deepseek/deepseek-v4-pro` |

## Environment Contract

Use these key names in local or hosted environment managers. Keep `MINIMAX_API_KEY` and `MINIMAX_TOKEN_PLAN_KEY` separate.

```bash
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:31b
DEFAULT_OLLAMA_MODEL=gemma4:31b
OLLAMA_TIMEOUT_MS=45000

DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

MINIMAX_API_KEY=
MINIMAX_BASE_URL=https://api.minimax.io/v1
MINIMAX_TOKEN_PLAN_KEY=
MINIMAX_TOKEN_PLAN_REMAINS_URL=https://www.minimax.io/v1/token_plan/remains
```

## Validation

Run the focused gateway contract:

```bash
npm run test -- src/__tests__/lib/tianji-model-gateway.test.ts
```

This test covers intent routing, deterministic rewrite, audit redaction, MiniMax quota-gate shape, and ordered provider fallback from DeepSeek to Ollama.

Run the first public route adoption contract:

```bash
npm run test -- src/__tests__/api/relationship-analyze-localization.test.ts
```

Run the Ask paid gateway contract:

```bash
npm run test -- src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/lib/tianji-model-gateway.test.ts
```

Run the Ask revenue contract audit:

```bash
npm run audit:ask-revenue-contract
```

This audit is static and contract-only. It must not make live Stripe, DeepSeek, MiniMax, or email calls.

Run the Draw/Tarot paid-boundary gateway contract:

```bash
npm run test -- src/__tests__/api/draw-gateway.test.ts src/__tests__/lib/tianji-model-gateway.test.ts
```

Run the Draw revenue contract audit:

```bash
npm run audit:draw-revenue-contract
```

This audit is also static and contract-only. It must not make live Stripe, DeepSeek, MiniMax, Ollama, or email calls.

Run the Phase 4 staging readiness gates:

```bash
npm run audit:staging-env-readiness
npm run smoke:ai-providers
npm run smoke:stripe:test-readiness
npm run audit:staging-launch-gate
```

These commands are readiness/dry-run by default. They must not print secret values or create live Stripe/provider side effects. Non-paid hosted staging smoke requires `STAGING_BASE_URL` plus an explicit approval latch:

```bash
STAGING_BASE_URL=https://staging.example.com STAGING_NONPAID_SMOKE_ALLOW_LIVE=true npm run smoke:staging:nonpaid
```

Live provider smoke and Stripe test-live smoke remain approval-required:

```bash
AI_PROVIDER_SMOKE_MODE=live AI_PROVIDER_SMOKE_ALLOW_LIVE=true npm run smoke:ai-providers
STRIPE_SMOKE_MODE=test-live STRIPE_SMOKE_ALLOW_LIVE=true npm run smoke:stripe:test-readiness
```

Run TypeScript validation:

```bash
npm run typecheck
```

When a MiniMax token-plan key is available and network access is approved, run:

```bash
npx tsx scripts/check-minimax-quota.ts
```

The quota check should be treated as blocked when `MINIMAX_TOKEN_PLAN_KEY` is absent. That is safer than silently using MiniMax as a public production pool.

## Current Wiring Status

The relationship analyze API is wired to gateway safety/metadata, but it still uses the deterministic relationship engine for scoring and text. This deliberately avoids introducing external model latency or key requirements into the free public funnel.

Ask preview is now a locked local teaser only. Paid Ask generation is wired through the `paid_ask` gateway route after Stripe session verification. Local tests and contract audit use mocks/static source checks only; no live paid smoke or provider smoke has been run.

Draw preview now returns a locked, limited three-card reading and token. Paid/pro Draw generation is wired through the `tarot_draw` gateway route after Stripe session verification. Enhanced `/api/tarot` interpretations also use `tarot_draw`. Local tests and contract audit use mocks/static source checks only; no live paid smoke or provider smoke has been run.

Phase 4 staging readiness scripts now exist for masked env inventory, non-paid staging smoke planning, AI provider dry-run/live smoke gating, Stripe test-readiness gating, and aggregate launch-gate status. The current safe default is readiness-only. Live Stripe/provider checks and production deploy remain No-Go without explicit staging/test approval and credentials.

## Next Wiring Step

The next safe implementation should collect approved staging evidence and run staged non-paid plus Stripe test-mode checkout/provider smoke only after explicit approval. Production deploy remains No-Go until Stripe test-mode evidence, webhook behavior, and DeepSeek/Ollama provider readiness are proven.
