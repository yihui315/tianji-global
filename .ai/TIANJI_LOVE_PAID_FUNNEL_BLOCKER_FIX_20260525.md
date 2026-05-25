# TianJi Love Paid Funnel Blocker Fix 20260525

## 1. What changed

Merged PR #63 first, then created `fix/tianji-paid-funnel-blockers-20260525` from latest `origin/main`.

App-side paid funnel blocker fixes:

- Added exact client analytics event `checkout_start_from_free_preview`.
- Wired the event from Ask, Draw, and Relationship free-preview unlock CTAs.
- Kept event payloads limited to route/source/paid/confidence/evidence signal count.
- Added client analytics sanitizer coverage for name, partner name, birthday, email, phone, raw report, reading text, Stripe session, checkout session, and payment id fields.
- Added `isUuidReadingId(value: unknown): boolean`.
- Blocked Relationship checkout before `/api/checkout` when reading id is not UUID-shaped.
- Added safe blocker event `relationship_checkout_blocked_missing_persisted_reading`.
- Hardened Stripe webhook Relationship completion so entitlement marking requires `compatibility_report` plus UUID-shaped relationship reading metadata.
- Extended Stripe readiness script with Relationship UUID guard, `rel_*` fallback block, and webhook/entitlement target checks.

No production deploy, Stripe live mode, paid checkout, webhook replay, `.env` read, or secret printing was performed.

## 2. Blockers fixed

```text
checkout_start_from_free_preview implemented: Go
Ask checkout-start analytics: Go
Draw checkout-start analytics: Go
Relationship UUID guard: Go
Relationship fallback checkout blocked: Go
Relationship blocked-checkout analytics: Go
Webhook metadata UUID/product guard: Go static
Readiness script relationship UUID guard reporting: Go
```

## 3. Remaining blockers

```text
Stripe test env readiness: Blocked unless test env present
Supabase staging UUID persistence: Blocked until staging can create UUID relationship readings
Stripe test-mode checkout session: Not run
Stripe webhook/entitlement test-mode: Not run
Return-to-app paid unlock proof: Not run
Production deploy: Not run
Paid smoke: No-Go unless test-mode checkout actually ran
```

## 4. Analytics privacy

`checkout_start_from_free_preview` sends only:

```ts
{
  route: 'ask' | 'draw' | 'relationship',
  source: 'evidence_card' | 'result_unlock',
  paid: false,
  confidence,
  evidenceSignalCount,
}
```

The event does not send question, names, partner names, birthday, birth time, birth place, email, phone, raw report, reading text, Stripe session id, checkout session id, or payment id.

Focused tests also prove `sanitizeClientAnalyticsPayload` strips those private fields if they are accidentally passed by a future caller.

## 5. Relationship UUID persistence guard

Relationship checkout now checks `isUuidReadingId(reading.id)` before starting checkout.

If the reading id is local fallback-shaped such as `rel_*`, checkout is blocked before `/api/checkout` and the UI shows:

```text
We need to save this reading before checkout. Please try again in a moment.
```

Blocked event payload:

```ts
{
  route: 'relationship',
  reason: 'missing_uuid_reading_id',
}
```

No raw reading id is sent.

## 6. Webhook / entitlement readiness

Static app-side readiness is improved:

- `/api/checkout` already writes metadata with `productId`, `source`, `readingSessionId`, and relationship reading id.
- `/api/stripe/webhook` now requires UUID-shaped Relationship metadata before `markOrderPaid`, `love_checkout_success`, and `markRelationshipReadingPremium`.
- Relationship entitlement still requires Stripe test-mode webhook execution to be proven end to end.

Result:

```text
Webhook/entitlement readiness: Partial - static metadata and guard tests pass; test-mode webhook not run.
```

## 7. Commands run

```text
GitHub connector merge PR #63: Pass, merged sha 3b8be5197b5f6a0f4eec505b69e0506aeb08b678
git fetch origin main
git worktree add tianji-global-paid-funnel-blockers-20260525 -b fix/tianji-paid-funnel-blockers-20260525 origin/main
git status --short --branch
rg paid-funnel inspection terms across src, scripts, tests, .ai, package.json
npm ci --ignore-scripts --no-audit --no-fund
npx vitest run src/__tests__/revenue-funnel-polish-contract.test.ts src/__tests__/relationship-flow-contract.test.ts src/__tests__/stripe-checkout-contract.test.ts
npm run typecheck
npm run lint
npm run test
npm run build
npm run audit:routes
npm run audit:copy
npm run audit:share
npm run audit:upgrade
npm run smoke:stripe:test-readiness
git diff --check
targeted secret-shape scan over changed files
```

## 8. Test results

```text
npm ci --ignore-scripts --no-audit --no-fund: Pass, added 936 packages
targeted vitest: Pass, 3 files / 17 tests
npm run typecheck: Pass
npm run lint: Pass, Next.js lint deprecation warning only
npm run test: Pass, 48 files / 477 tests
npm run build: Pass, jose Edge Runtime warnings and webpack cache warning only
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
npm run smoke:stripe:test-readiness: Pass non-strict, reports Blocked because test env is missing
git diff --check: Pass, CRLF warnings only
targeted secret-shape scan over changed files: Pass
```

## 9. Gate status

```text
PR #63 merged: Go
checkout_start_from_free_preview implemented: Go
Ask checkout-start analytics: Go
Draw checkout-start analytics: Go
Relationship UUID guard: Go
Relationship fallback checkout blocked: Go
Webhook/entitlement readiness: Partial
Stripe test env readiness: Blocked unless test env present
Typecheck: Go
Lint: Go
Tests: Go
Build: Go
Production deploy: Not run
Stripe live mode: Not run
Paid smoke: No-Go unless test-mode checkout actually ran
Secrets printed: No
```

## 10. Next required action

Add masked Stripe and Supabase staging test env, then run:

```text
npm run smoke:stripe:test-readiness -- --strict
```

After strict readiness passes, run Stripe test-mode paid smoke for:

```text
/relationship/new -> UUID reading -> checkout_start_from_free_preview -> Stripe test checkout -> webhook -> entitlement unlock
/ask -> checkout_start_from_free_preview -> Stripe test checkout -> paid completion
/draw -> checkout_start_from_free_preview -> Stripe test checkout -> paid completion
```

Keep formal traffic and production deploy blocked until test-mode paid funnel is Go.
