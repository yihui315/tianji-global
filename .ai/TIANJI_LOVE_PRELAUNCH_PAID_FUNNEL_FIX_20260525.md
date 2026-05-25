# TianJi Love Prelaunch Paid Funnel Fix 20260525

## 1. What changed

This branch hardens the app-side paid funnel blockers before launch. It adds the exact `checkout_start_from_free_preview` analytics event, guards Relationship checkout to UUID-shaped persisted reading IDs only, tightens Stripe webhook metadata validation, extends the Stripe readiness script, and adds focused contract tests.

Branch:

```text
fix/tianji-prelaunch-paid-funnel-20260525
```

Base:

```text
origin/main 3b8be51 chore(tianji-love): verify paid funnel test readiness
```

PR #63 status:

```text
PR #63 merge command: Blocked locally - gh unauthenticated
Repository truth: Go - origin/main contains PR #63 head commit 6bbcc22 through 3b8be51
```

## 2. Blockers fixed

```text
Exact checkout-start event missing: Fixed
Relationship rel_* checkout path: Fixed, blocked before /api/checkout
Relationship missing persisted UUID message: Fixed
Unsafe webhook metadata unlock risk: Fixed by validator and safe ignore path
Readiness script app-side detection gaps: Fixed
```

## 3. Checkout-start analytics

Implemented:

```text
checkout_start_from_free_preview
```

Surfaces:

```text
/ask: Go
/draw: Go
/relationship/new and relationship result: Go when reading id is UUID-shaped
```

Payload shape:

```ts
{
  route: "ask" | "draw" | "relationship";
  source: "evidence_card" | "result_unlock" | "pricing_cta";
  paid: false;
  confidence?: "low" | "medium" | "high";
  evidenceSignalCount?: number;
}
```

Analytics sanitizer coverage was extended for private identity and payment identifiers.

## 4. Relationship UUID guard

Implemented:

```text
isUuidReadingId(value: unknown): boolean
```

Behavior:

```text
UUID-shaped reading ID: allowed
rel_* fallback ID: blocked
empty/null/undefined: blocked
non-string: blocked
```

Blocked checkout user copy:

```text
We need to save this reading before checkout. Please try again in a moment.
```

Safe blocked event:

```text
relationship_checkout_blocked_missing_persisted_reading
```

Payload:

```ts
{
  route: "relationship";
  reason: "missing_uuid_reading_id";
}
```

Raw reading IDs are not included.

## 5. Webhook / entitlement readiness

Added `validateCheckoutSessionMetadata()` and wired it into `/api/stripe/webhook`.

Current status:

```text
Webhook metadata validation: Go
Relationship rel_* webhook unlock block: Go
Relationship UUID metadata requirement: Go
Ask entitlement readiness: Partial - app has direct checkout-session verification, not a completed test-mode smoke
Draw entitlement readiness: Partial - app has direct checkout-session verification, not a completed test-mode smoke
Relationship entitlement readiness: Partial - app-side validator is ready, but Supabase UUID persistence and Stripe webhook smoke are not proven
Unsafe metadata rejected/ignored: Go
```

## 6. Analytics privacy

Checked in tests and Browser QA:

```text
question/raw user input leakage: 0 detected in analytics
name/partner name leakage: 0 detected in analytics
birthday/birth time/birth place leakage: 0 detected in analytics
email/phone leakage: 0 detected in analytics
raw report/reading text leakage: 0 detected in analytics
Stripe session/payment id leakage: 0 detected in analytics
Supabase row id leakage: 0 detected in analytics
```

## 7. Commands run

```powershell
git fetch origin main
gh pr view 63 --json number,state,mergeable,isDraft,headRefName,baseRefName,statusCheckRollup
git fetch origin refs/pull/63/head:refs/remotes/origin/pr/63
git merge-base --is-ancestor 6bbcc22 origin/main
git worktree add C:\Users\Administrator\.config\superpowers\worktrees\tianji-global\fix-tianji-prelaunch-paid-funnel-20260525 -b fix/tianji-prelaunch-paid-funnel-20260525 origin/main
npm ci --ignore-scripts --no-audit --prefer-offline
npm run test -- --run src/__tests__/prelaunch-paid-funnel-contract.test.ts src/__tests__/revenue-funnel-polish-contract.test.ts src/__tests__/relationship-flow-contract.test.ts src/__tests__/stripe-checkout-contract.test.ts
npm run typecheck
npm run lint
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run smoke:stripe:test-readiness
npm run smoke:stripe:test-readiness -- --strict
npm run start -- -p 3063
Puppeteer Browser QA for /ask?lang=en, /draw?lang=en, /tarot?lang=en, /relationship/new?lang=en
```

## 8. Test results

```text
npm ci --ignore-scripts --no-audit --prefer-offline: Go
Targeted tests: Go, 4 files / 19 tests
npm run typecheck: Go
npm run lint: Go, Next.js lint deprecation warning only
npm run test: Go, 49 files / 479 tests
npm run build: Go, existing jose Edge Runtime warnings only
npm run audit:routes: Go
npm run audit:copy: Go
npm run audit:share: Go
npm run audit:upgrade: Go
npm run smoke:stripe:test-readiness: Go command exit, reports Blocked because test env is missing
npm run smoke:stripe:test-readiness -- --strict: Blocked, failed as expected because Stripe/Supabase test env is missing
Browser QA: Go
```

## 9. Remaining blockers

```text
Stripe test env readiness: Blocked - masked test keys/webhook/app URL not provided locally
Supabase staging UUID persistence: Blocked - staging persistence not configured/proven locally
Strict readiness: Blocked - required Stripe/Supabase env missing
Paid smoke: No-Go - no real test-mode checkout/webhook/entitlement run
Production deploy: Not run
Stripe live mode: Not run
Formal traffic / Day 1 publishing: No-Go
```

## 10. Next required action

Configure masked Stripe test-mode env and Supabase staging UUID persistence, then run:

```powershell
npm run smoke:stripe:test-readiness -- --strict
```

After strict readiness passes, run real test-mode paid smoke in this order:

```text
1. Relationship: /relationship/new -> UUID reading -> checkout -> webhook -> entitlement unlock
2. Ask: preview -> unlock -> Stripe test checkout -> paid completion
3. Draw: preview -> unlock -> Stripe test checkout -> paid completion
```

Formal launch remains No-Go until those paid smoke checks pass.
