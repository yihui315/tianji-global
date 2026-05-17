# TianJi Love Dual Track Workflow - Implementation First

## Strategy

Stop blocking progress with endless readiness loops.

New strategy:

1. Push deployable staging forward.
2. Make free/public flows work first.
3. Keep paid routes safely locked when env is missing.
4. Improve revenue funnel in parallel.
5. Test after implementation.
6. Only production deploy after staging evidence.

Do not touch production.
Do not print secrets.
Do not use live Stripe.
Do not mutate production Supabase.
Do not run paid smoke without explicit approval.

Current completed commits:

- `2040f66 feat: add tianji love staging smoke readiness gate`
- `f7aa842 chore: record tianji love staging test smoke evidence`
- `4240918 chore: record phase 5b env readiness recheck`

Known current state:

- Relationship gateway: Go
- Ask gateway: Go
- Draw/Tarot gateway: Go
- AI runtime: Go
- DeepSeek: Go
- MiniMax: Go
- App/Auth env: No-Go
- Supabase env: No-Go
- Stripe test env: No-Go
- Email env: No-Go
- Ollama env: No-Go
- Production deploy: No-Go

Model policy:

- Free/high-frequency flows use local/Ollama where available.
- Paid deep answers use DeepSeek.
- MiniMax remains internal agent/research only, not public production default.

## Parallel Lanes

### Lane A - Implementation-First Staging Deployable Mode

Branch:

```text
feat/implementation-first-staging
```

Goal:

Make staging deployable even when optional services are missing.

Core outcome:

- Homepage loads.
- Relationship free analysis works or safely degrades.
- Ask unpaid preview works.
- Draw free preview works.
- Pricing loads.
- Login page loads.
- Paid routes stay locked if Stripe/Supabase is missing.
- Provider live calls are disabled unless explicitly enabled.
- Production deploy remains blocked.

Allowed files:

- `src/lib/**`
- `src/app/api/**` only for safe degraded guards
- `scripts/**`
- `src/__tests__/scripts/**`
- `src/__tests__/api/**`
- `docs/tianji-love-staging-smoke-runbook.md`
- `docs/tianji-love-model-gateway-runbook.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`
- `.ai/TIANJI_LOVE_IMPLEMENTATION_FIRST_STAGING_EVIDENCE_20260516.md`
- `package.json` if adding scripts

Avoid touching:

- visual homepage redesign
- marketing copy overhaul
- pricing page UI redesign
- SEO metadata overhaul

### Lane B - Revenue Funnel Polish

Branch:

```text
feat/revenue-funnel-polish
```

Goal:

Improve conversion and user journey while Lane A handles staging deployability.

Core outcome:

- Homepage has clearer free to Ask to Draw to Pricing journey.
- Ask preview has stronger upgrade CTA but no fear-based copy.
- Draw preview has stronger upgrade CTA but no guaranteed prediction language.
- Pricing clearly explains Free, Ask unlock, Monthly, Yearly.
- Analytics events are mapped for the funnel.
- No backend payment behavior changes.
- No gateway changes.

Allowed files:

- `src/app/page.tsx` or homepage files
- `src/app/ask/**`
- `src/app/draw/**`
- `src/app/tarot/**`
- `src/app/pricing/**`
- `src/components/**`
- `src/lib/analytics/**`
- `src/__tests__/**` front-end, component, or copy tests
- `docs/tianji-love-revenue-funnel-runbook.md`
- `.ai/TIANJI_LOVE_REVENUE_FUNNEL_POLISH_EVIDENCE_20260516.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

Avoid touching:

- `src/lib/tianji-model-gateway.ts`
- `src/lib/ai-orchestrator.ts`
- `src/app/api/stripe/**`
- `src/app/api/ask/unlock/**`
- `src/app/api/draw/unlock/**`
- `scripts/audit-staging-env-readiness.ts`
- `scripts/smoke-ai-providers.ts`
- `scripts/smoke-stripe-test-readiness.ts`
- production deployment files

## Lane A Task

You are Codex A.

Implement implementation-first staging degraded mode.

### A1. Add Env Flags

Support these env flags:

```text
STAGING_DEGRADED_MODE=true
AI_PROVIDER_LIVE_DISABLED=true
STRIPE_LIVE_DISABLED=true
EMAIL_SEND_DISABLED=true
SUPABASE_MUTATION_DISABLED=true
```

Behavior:

If `STAGING_DEGRADED_MODE=true`:

1. Missing Email env must not crash public/free flows.
2. Missing Stripe env must not crash unpaid flows.
3. Missing Supabase service role must not crash public pages.
4. Paid unlock endpoints return safe locked/503 response when payment env is unavailable.
5. Provider live calls return safe disabled response when `AI_PROVIDER_LIVE_DISABLED=true`.
6. No response exposes secrets.
7. Production deploy remains blocked.

### A2. Add Degraded Mode Audit

Create:

```text
scripts/audit-staging-degraded-mode.ts
```

Output:

```json
{
  "degradedModeEnv": "go|no-go|unknown",
  "publicPagesCanLoad": "go|no-go|unknown",
  "relationshipFreeCanRun": "go|no-go|unknown",
  "askPreviewCanRun": "go|no-go|unknown",
  "drawPreviewCanRun": "go|no-go|unknown",
  "paidRoutesLockedWhenStripeMissing": "go|no-go|unknown",
  "providerLiveCallsDisabled": "go|no-go|unknown",
  "emailSendDisabled": "go|no-go|unknown",
  "productionDeployBlocked": "go|no-go|unknown",
  "overall": "go|conditional-go|no-go"
}
```

Add script:

```json
"audit:staging-degraded-mode": "tsx scripts/audit-staging-degraded-mode.ts"
```

### A3. Update Non-Paid Smoke

Update:

```text
scripts/smoke-staging-nonpaid.ts
```

It should pass public/free flows in degraded mode.

Rules:

- Do not call unlock endpoints.
- Do not call Stripe.
- Do not require email.
- Do not require provider live calls if `AI_PROVIDER_LIVE_DISABLED=true`.
- Do not log response body.
- Log route, status, pass/fail, safe `aiMeta` only.

### A4. Tests

Create:

```text
src/__tests__/scripts/staging-degraded-mode.test.ts
```

Tests:

1. degraded mode can pass with Stripe missing
2. degraded mode can pass with Email missing
3. paid routes are locked when Stripe missing
4. provider live calls are disabled unless explicitly enabled
5. public flows do not require Supabase service role
6. output does not include secrets
7. production deploy remains blocked

### A5. Evidence

Create:

```text
.ai/TIANJI_LOVE_IMPLEMENTATION_FIRST_STAGING_EVIDENCE_20260516.md
```

Include:

1. What changed
2. Files changed
3. Commands run
4. Degraded-mode behavior
5. Public/free flow readiness
6. Paid flow behavior
7. Live provider status
8. Stripe status
9. Production deploy decision
10. Next step

### A6. Verification

Run:

```bash
npm run typecheck
npm run lint
npm run test -- src/__tests__/scripts/staging-degraded-mode.test.ts
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run audit:ask-revenue-contract
npm run audit:draw-revenue-contract
npm run audit:staging-degraded-mode
git diff --check
```

Final output:

1. What changed
2. Files changed
3. Commands run
4. Test/build result
5. Implementation-first staging decision
6. What can be deployed to staging now
7. What remains blocked
8. Conflict risk with Lane B
9. Suggested commit message

Suggested commit:

```text
feat: add implementation-first staging degraded mode
```

## Lane B Task

You are Codex B.

Improve revenue funnel and user journey without touching backend payment/gateway behavior.

### B1. Funnel Review

Create:

```text
.ai/TIANJI_LOVE_REVENUE_FUNNEL_REVIEW_20260516.md
```

Inspect current:

- homepage
- ask page
- draw/tarot page
- pricing page
- login path
- upgrade CTA components
- analytics event helper if present

Document:

1. Current homepage journey
2. Current Ask preview journey
3. Current Draw preview journey
4. Current Pricing clarity
5. Current CTA issues
6. Current trust/safety copy issues
7. Current analytics coverage
8. Recommended edits

### B2. Homepage Conversion Polish

Improve homepage journey:

Required structure:

1. Hero:
   - clear emotional promise
   - no guaranteed prediction
   - primary CTA: Start Free Love Reading
   - secondary CTA: Ask One Question

2. Three product cards:
   - Love Reading
   - Ask One Question
   - Draw Three Cards

3. Trust strip:
   - private by default
   - reflection not certainty
   - no fear-based selling
   - secure payment for unlocks

4. Upgrade logic:
   - free preview first
   - deeper answer when unlocked
   - history/report for subscribers

Avoid:

- guaranteed future prediction
- fear-based urgency
- medical/legal/financial claims
- exposing birth data

### B3. Ask Preview CTA Polish

Ask unpaid preview should show:

1. short reflection
2. what full answer unlocks
3. clear CTA
4. no full answer leak
5. no fear-based copy

CTA copy example:

```text
Unlock the full relationship answer
```

Supporting copy:

```text
Get a deeper interpretation, practical next steps, and a safer reading of the emotional pattern behind this question.
```

### B4. Draw Preview CTA Polish

Draw free preview should show:

1. three cards
2. short card meaning
3. relationship pattern preview
4. one practical next step
5. paid/pro upgrade CTA

CTA copy example:

```text
Unlock the full three-card relationship reading
```

Supporting copy:

```text
See the deeper pattern, current emotional dynamic, and a practical next move - as reflection, not certainty.
```

### B5. Pricing Clarity

Pricing page should clearly distinguish:

- Free preview
- One-time Ask unlock
- Draw unlock if available
- Monthly plan
- Yearly plan

Must say:

- no guaranteed predictions
- paid unlock gives depth, not certainty
- subscription gives history/report-ready output where implemented

### B6. Analytics Mapping

Add or verify events:

- `relationship_start_click`
- `relationship_free_result_view`
- `relationship_upgrade_click`
- `ask_preview_view`
- `ask_unlock_click`
- `draw_preview_view`
- `draw_unlock_click`
- `pricing_view`
- `pricing_plan_click`
- `login_start`

Rules:

- Do not log birthDate
- Do not log birthTime
- Do not log birthLocation
- Do not log timezone
- Do not log raw question
- Do not log full result text

### B7. Tests

Add or update tests for:

1. homepage contains primary free CTA
2. homepage contains Ask CTA
3. Ask preview has unlock CTA but not full answer language
4. Draw preview has unlock CTA but no guaranteed prediction copy
5. Pricing copy includes reflection-not-certainty boundary
6. analytics event payload excludes sensitive fields

### B8. Evidence

Create:

```text
.ai/TIANJI_LOVE_REVENUE_FUNNEL_POLISH_EVIDENCE_20260516.md
```

Include:

1. What changed
2. Files changed
3. Commands run
4. Funnel changes
5. CTA changes
6. Analytics changes
7. Safety copy status
8. Backend untouched confirmation
9. Risks
10. Next step

### B9. Verification

Run:

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
git diff --check
```

Final output:

1. What changed
2. Files changed
3. Commands run
4. Test/build result
5. Revenue funnel decision
6. Backend untouched confirmation
7. Conflict risk with Lane A
8. Suggested commit message

Suggested commit:

```text
feat: polish tianji love revenue funnel
```

## Merge Order

Merge Lane A first, then Lane B.

```powershell
cd D:\BrainSystem\💼 工作专项\ai占卜\tianji-global
git checkout main
git merge feat/implementation-first-staging

cd ..\tianji-global-lane-b
git fetch
git rebase main

cd ..\tianji-global
git merge feat/revenue-funnel-polish
```

After merging, run:

```powershell
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
npm run audit:staging-degraded-mode
npm run audit:staging-env-readiness
npm run smoke:ai-providers
npm run smoke:stripe:test-readiness
npm run audit:staging-launch-gate
git diff --check
```

## Parallel Boundary

Do not touch in parallel:

- `src/lib/tianji-model-gateway.ts`
- `src/lib/ai-orchestrator.ts`
- `src/app/api/stripe/**`
- `src/app/api/ask/unlock/**`
- `src/app/api/draw/unlock/**`
- real Stripe smoke
- real provider smoke
- production deploy

## Fastest Route

```text
Codex A: staging degraded mode, deployable first
Codex B: revenue funnel polish, conversion first

A can move staging deployable build forward.
B can improve page conversion.
Then continue env/smoke/paid-test gates.
```
