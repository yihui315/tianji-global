# TianJi Love Prelaunch Go / No-Go 20260525

## 1. Current release candidate

```text
Branch: fix/tianji-prelaunch-paid-funnel-20260525
Base: origin/main 3b8be51 chore(tianji-love): verify paid funnel test readiness
PR #63: Go in repository truth, because origin/main contains PR #63 head commit 6bbcc22
Local gh merge command: Blocked - gh unauthenticated
```

## 2. Product readiness

```text
Evidence Layer: Go
Non-paid QA: Go
Publishing packet: Go
Paid funnel app-side fixes: Go
Paid funnel test-mode proof: Blocked
Production deploy: No-Go
Formal traffic / Day 1 publishing: No-Go
```

## 3. Non-paid QA

Puppeteer Browser QA ran against local `next start` on port `3063` with dummy local-only auth secrets. No production deploy, live Stripe, or real paid checkout was run.

```text
/ask?lang=en: evidence Go, unlock CTA Go, checkout-start analytics Go, accuracy feedback Go, mobile overflow Go, private analytics leakage 0
/draw?lang=en: evidence Go, unlock CTA Go, checkout-start analytics Go, accuracy feedback Go, mobile overflow Go, private analytics leakage 0
/tarot?lang=en: render Go, mobile overflow Go, guaranteed-prediction language check Go
/relationship/new?lang=en: evidence Go, unlock CTA Go, rel_* fallback blocked before checkout Go, safe blocked event Go, accuracy feedback Go, mobile overflow Go, private analytics leakage 0
```

## 4. Paid funnel readiness

| Funnel | Evidence | Unlock CTA | Checkout Start | Test Checkout | Webhook | Entitlement | Status |
|---|---|---|---|---|---|---|---|
| Ask | Go | Go | Go | Blocked - test env missing | Partial - direct completion path, not webhook smoke | Partial - not test-mode proven | Blocked |
| Draw | Go | Go | Go | Blocked - test env missing | Partial - direct completion path, not webhook smoke | Partial - not test-mode proven | Blocked |
| Relationship | Go | Go | Go for UUID reading, rel_* blocked | Blocked - test env and UUID persistence missing | Go static metadata validation, not smoke-proven | Partial - UUID persistence/webhook smoke missing | Blocked |

## 5. Env readiness, masked

| Env | Status | Notes |
|---|---|---|
| STRIPE_SECRET_KEY | Blocked | Required for strict readiness, value not printed |
| NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | Blocked | Required for strict readiness, value not printed |
| STRIPE_WEBHOOK_SECRET | Blocked | Required for strict readiness, value not printed |
| ENABLE_PAY_PER_USE | Blocked | Required for strict readiness, value not printed |
| NEXT_PUBLIC_APP_URL | Blocked | Required for strict readiness, value not printed |
| NEXT_PUBLIC_SUPABASE_URL | Blocked | Required for relationship UUID persistence proof, value not printed |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Blocked | Required for relationship UUID persistence proof, value not printed |
| SUPABASE_SERVICE_ROLE_KEY | Blocked | Required for relationship UUID persistence proof, value not printed |

## 6. Analytics readiness

```text
checkout_start_from_free_preview implemented: Go
Ask checkout-start analytics: Go
Draw checkout-start analytics: Go
Relationship checkout-start analytics: Go when reading id is UUID-shaped
Relationship blocked fallback analytics: Go
Sensitive payload leakage: 0 detected in tests and Browser QA analytics capture
```

## 7. Safety readiness

```text
No production deploy
No Stripe live mode
No real paid checkout
No destructive database actions
No env files read or printed
No secrets printed
No social publishing
```

## 8. Production deploy readiness

```text
Production deploy: No-Go
Reason: Stripe/Supabase test-mode paid smoke has not passed.
```

## 9. Rollback readiness

```text
Rollback path: standard Git revert of this PR if app-side paid funnel behavior regresses.
Production rollback: Not applicable because production deploy was not run.
Data rollback: Not applicable because no destructive database action was run.
```

## 10. Launch decision

```text
No-Go
```

Reason:

```text
App-side blockers are fixed, but Stripe/Supabase test-mode paid smoke has not run. Formal launch and Day 1 publishing remain blocked until Relationship, Ask, and Draw paid funnel smoke pass in test mode.
```

## 11. Required next actions

```text
1. Configure masked Stripe test env.
2. Configure Supabase staging persistence.
3. Run npm run smoke:stripe:test-readiness -- --strict.
4. Run Relationship test-mode paid smoke: /relationship/new -> UUID reading -> checkout -> webhook -> entitlement unlock.
5. Run Ask test-mode paid smoke.
6. Run Draw test-mode paid smoke.
7. Only then publish Day 1 XiaoHongShu.
```

## Gate Status

```text
PR #63 merged: Go
checkout_start_from_free_preview implemented: Go
Ask checkout-start analytics: Go
Draw checkout-start analytics: Go
Relationship checkout-start analytics: Go
Relationship UUID guard: Go
Relationship rel_* fallback blocked: Go
Webhook metadata validation: Go
Entitlement readiness: Partial
Stripe test env readiness: Blocked
Supabase staging UUID persistence: Blocked
Strict readiness: Blocked
Typecheck: Go
Lint: Go
Tests: Go
Build: Go
Audits: Go
Browser QA: Go
Production deploy: Not run
Stripe live mode: Not run
Paid smoke: No-Go unless test-mode checkout actually ran
Secrets printed: No
Formal traffic / Day 1 publishing: No-Go unless paid smoke Go
```
