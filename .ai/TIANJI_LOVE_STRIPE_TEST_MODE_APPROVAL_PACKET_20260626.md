# TianJi Love Stripe Test-Mode Approval Packet - 2026-06-26

Submitted in source PR on 2026-06-27.

## Scope

This packet prepares human review for a future TianJi Love Stripe test-mode paid smoke. It is approval documentation only.

Codex did not run checkout, create a Stripe Checkout Session, execute a payment, replay a webhook, mutate Supabase, deploy, touch a server, read `.env*`, or post to social channels.

## Current Operator Facts

| Area | Status |
| --- | --- |
| PR #114 | Merged, per operator report |
| Cloud deploy | Go, per operator report |
| `https://tianji.love` | `200 OK`, per operator report |
| Supabase `marketing_leads` schema drift repair | Complete, per operator report |
| Lead Capture Live Write | Go, per operator report |
| `/api/marketing/leads` smoke | `HTTP 201`, per operator report |
| Stripe Test-mode Approval Packet | Go for human review |
| Revenue Execution | No-Go until Stripe test-mode readiness and paid smoke evidence are complete |
| Social auto-posting | No-Go |
| Stripe Live | No-Go |

## Source-Side Readiness Summary

| Surface | Source Status | Notes |
| --- | --- | --- |
| Love premium product contract | Source Go | Canonical product is `love_premium_report`; amount is `1990`; currency is `cny`; display is `¥19.9`. |
| Love premium checkout route | Source Go | `/api/checkout` checks `ENABLE_PAY_PER_USE`, validates the product/reference, requires a configured Stripe Price ID, then creates one-time Checkout. |
| Webhook source | Source Go | `/api/stripe/webhook` verifies signatures, records idempotency, marks paid orders, and handles report/relationship unlock behavior. |
| Ask paid-intent flow | Conditional Go | Source remains gated before Stripe by readiness/approval flags. |
| Customer-facing paid launch copy | Go in this PR | Old `$4.99` / `$12.99` Love report copy is replaced by canonical `¥19.9 CNY`; copy states depth, not certainty. |

## Required Masked Human Evidence

Codex must not read or infer raw environment values. A human operator must provide masked evidence only.

| Evidence | Required Format |
| --- | --- |
| Target URL | Approved test target, no secrets. |
| Stripe secret key mode | `present`, `sk_test_...masked`; any live marker is No-Go. |
| Stripe publishable key mode | `present`, `pk_test_...masked`; any live marker is No-Go. |
| Webhook signing secret | `present`, masked only, tied to the same test endpoint. |
| Love premium Price ID | `present`, test-mode Stripe Price for `love_premium_report`; no live marker. |
| `ENABLE_PAY_PER_USE` | Explicit test window status only. |
| Approval | Dated statement from a masked human operator with exact scope. |
| Secret hygiene | `secretHitCount=0`; no `.env*` contents copied into evidence. |

## Approval Boundary

This packet is not paid-smoke execution approval. It only makes the next human approval step reviewable.

Required approval must be explicit and separate from this PR:

```text
Approved: execute TianJi Love Stripe test-mode paid smoke only on <approved target>, with Stripe test keys and Stripe test card only; no live mode, no production paid launch, no webhook replay by Codex, no Supabase production mutation, no deploy, no social posting.
```

## Gate Table

| Gate | Status | Reason |
| --- | --- | --- |
| Stripe Approval Packet | Go | Packet is present in this PR. |
| Stripe Test-mode Readiness | No-Go | Masked env and target evidence still required. |
| Stripe Test-mode Paid Smoke | No-Go | Not approved or executed by Codex. |
| Stripe Live | No-Go | Out of scope and forbidden. |
| Revenue Execution | No-Go | Requires successful test-mode paid smoke plus separate launch approval. |
| Social Auto-posting | No-Go | Manual review/publishing only. |
