# TianJi Love Revenue OS 7-Day Plan - 2026-06-24

## Current State

- PR #113: merged.
- Main commit: `59a7ffbc5f2790ee789137835b38e7ef5ad0683b`.
- Source gate: Go.
- Cloud deploy gate: Go from user-supplied production smoke status.
- Production smoke: Go from user-supplied `https://tianji.love` 200 OK.
- Supabase production migration: No-Go, pending human approval.
- Stripe/payment execution: No-Go.
- Social auto-posting: No-Go.

## Safety Boundary

- No `.env` or `.env.*` access.
- No Supabase production mutation.
- No Stripe test/live paid smoke without explicit approval.
- No production deploy or server mutation.
- No webhook replay.
- No social auto-posting.
- No fake users, revenue, conversion rates, testimonials, or guaranteed outcomes.

## Day 1 - Launch Closure And Lead Capture Readiness

- Record Source Go, Cloud Deploy Go, Production Smoke Go, and remaining No-Go gates.
- Review `supabase/migrations/20260624_marketing_leads.sql`.
- Review `/api/marketing/leads` and `LeadCaptureForm`.
- Add local API mock coverage for null optional fields, IP hashing, and user-agent truncation.
- Add migration execution command and rollback plan as pending human approval.
- Add lead capture live smoke plan, blocked until migration is applied by a human operator.
- Generate the 2026-06-24 manual publishing queue.
- Generate the 2026-06-24 growth report with `no real data yet` if no real metrics exist.

## Day 2 - First Manual Publishing Loop

- Human reviews and manually publishes approved queue items only.
- Codex records published URLs and metrics only if supplied by the operator.
- Update `.ai/reports/growth-report-YYYY-MM-DD.md`.
- Do not infer clicks, leads, conversions, or revenue.

## Day 3 - Lead Capture Verification

- After Hermes/human applies the production migration, run a separately approved lead-capture smoke.
- Verify one consented lead can be captured without exposing raw IP or secrets.
- Keep Supabase production mutation blocked for Codex.

## Day 4 - Content Queue Expansion

- Generate the next manual queue with Xiaohongshu, TikTok/Reels, X/Twitter, Reddit/Quora, KOL, and SEO items.
- Keep every item `pending_manual_review` and `not_published`.

## Day 5 - CTA And SEO Review

- Review `/love-reading`, `/relationship/new`, `/ask`, and homepage entry copy.
- Keep claims reflective and non-guaranteed.
- Add SEO outlines only as drafts.

## Day 6 - Email Nurture Readiness

- Review consent/list/provider evidence.
- Keep sending No-Go until list source, consent basis, sender identity, unsubscribe handling, and provider boundary are approved.
- Prepare manual-send templates only.

## Day 7 - Revenue OS Final Gate

- Produce final 7-day gate report.
- Revenue execution remains No-Go unless masked staging/test/payment evidence is complete and explicit approval is supplied.
- Stripe test-mode gate remains Pending Human Approval.
- Stripe live gate remains No-Go.

## Daily Validation Loop

Run once per real execution day:

```text
npm run typecheck
npm run lint
npm run test
npm run build:staging:degraded
git diff --check
```

Then update:

```text
progress.md
.ai/REVIEW_PACKET.md
.ai/CHANGELOG_AI.md
```

## Day 1 Gate Target

- Source changes: PR only.
- Lead Capture Gate: Conditional Go until production migration is applied and a human-approved smoke passes.
- Content Queue: Go for manual review.
- Daily Growth Report: Go for no-real-data fallback.
- Email Funnel: Go for templates only.
- Stripe Test-mode Gate: Pending Human Approval.
- Stripe Live Gate: No-Go.
- Revenue Execution: No-Go.
