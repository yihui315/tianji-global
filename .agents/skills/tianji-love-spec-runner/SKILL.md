---
name: tianji-love-spec-runner
description: Use this skill when the user gives a broad Tianji Love goal and wants Codex to convert it into a Spec-Driven autonomous execution loop. This skill combines Tianji Love product rules with gstack planning, review, QA, ship, and context-save workflows.
---

# Tianji Love Spec Runner

## Purpose

Turn a high-level user goal into a gated Tianji Love execution spec.

Use this skill for broad tasks such as:

- make Tianji Love launch-ready
- fix the whole customer flow
- prepare a clean RC
- prepare cloud staging
- review the release state
- convert a broad idea into execution phases

## Required GStack Skills

Use or invoke these gstack workflows when appropriate:

```text
gstack-careful
gstack-autoplan
gstack-plan-ceo-review
gstack-plan-eng-review
gstack-plan-design-review
gstack-plan-devex-review
gstack-review
gstack-ship
gstack-context-save
```

## Tianji Love Product Direction

Tianji Love is the only active product direction.

TianJi Global as a broad tools product is cancelled or deprioritized. Legacy routes may remain, but they must not dominate the main customer path.

Main routes:

```text
/
/relationship/new
/ask
/draw
/pricing
/about
/login
/dashboard
/profile
/readings
/legal/privacy
/legal/terms
```

Primary conversion path:

```text
Homepage
-> Love Reading
-> relationship form
-> relationship result
-> save/share/Ask/Draw/future paid CTA
```

Secondary paths:

```text
Ask one question
Draw three cards
```

Pricing Pro payment logic remains known-risk until the price-ID contract is fixed.
Cloud deployment requires clean RC plus SSH/server/env evidence.
Paid smoke requires staging Stripe/Supabase proof.
Marketing starts only after customer flow, staging, and revenue smoke pass.

## First Step

Before editing code:

1. Read `AGENTS.md`.
2. Read `tianji-global/AGENTS.md`.
3. Read `.ai/REVIEW_PACKET.md`.
4. Read `.ai/CHANGELOG_AI.md`.
5. Read latest relevant `.ai/TIANJI_*.md`.
6. Inspect `git status --short --branch`.
7. Identify dirty worktree boundaries.

Then write a short execution spec:

```text
Goal:
Scope:
Non-goals:
Risks:
GStack skills to use:
Validation:
Stop conditions:
Expected report:
```

## Hard Non-Goals

Do not:

- Touch production Stripe.
- Touch production Supabase.
- Edit `.env` or secrets.
- Run production migrations.
- Deploy unless the user explicitly asks and staging evidence is Go.
- Run paid smoke unless test-mode evidence is Go.
- Delete legacy routes.
- Reset/stash/revert user work.
- Commit dirty tree without freeze review.

## Stop Conditions

Stop if:

- secrets would be printed
- production Stripe/Supabase could be touched
- deploy source is dirty or ambiguous
- a task would require reset/stash/revert
- a task would silently include env/CI/API/Stripe/Supabase/migration risk
- local customer flow has old TianJi Global leakage
- English routes leak Chinese core content
- protected routes redirect to localhost
- mobile overflow appears

## Execution Loop

1. Freeze scope with `gstack-careful`.
2. If planning is needed, use CEO/Eng/Design/DevEx reviews.
3. If code changes are needed, add tests or contracts first.
4. Implement smallest safe slice.
5. Run targeted tests.
6. Run full gate if release-impacting.
7. Run browser QA for customer flow changes.
8. Review diff using `gstack-review`.
9. Use `gstack-ship` for final Go/No-Go.
10. Save context with `gstack-context-save`.

## Required Output Format

Final response/report must include:

```text
What changed
Files changed
Commands run
Test/build result
Browser QA result
Go/No-Go
Remaining P0
Remaining P1
Next smallest task
Suggested commit message
```
