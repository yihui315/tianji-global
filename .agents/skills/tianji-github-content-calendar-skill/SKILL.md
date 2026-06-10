---
name: tianji-github-content-calendar-skill
description: Maintain the TianJi Love seven-day marketing content calendar and future hook/script/caption pools. Use when GitHub automation or Codex needs to ensure at least seven future days of content without social auto-posting or fake claims.
---

# TianJi GitHub Content Calendar Skill

## Purpose

Maintain at least seven future days of TianJi Love content and keep hook, script, and caption pools fresh without posting to platforms or making unsafe claims.

## Allowed Actions

- Update `assets/marketing/content-calendar-7day.md`.
- Update `assets/marketing/love-test-next-30-hooks.md`.
- Update `assets/marketing/love-test-next-20-video-scripts.md`.
- Update `assets/marketing/love-test-next-20-share-captions.md`.
- Update `.ai/CHANGELOG_AI.md`.
- Update `.ai/REVIEW_PACKET.md`.

## Forbidden Actions

- Do not auto-post to social platforms.
- Do not use account credentials, cookies, tokens, or login sessions.
- Do not create fake testimonials, fake user numbers, fake revenue, or fake KPI claims.
- Do not guarantee relationship outcomes, reunion outcomes, medical outcomes, or financial outcomes.
- Do not run Stripe, paid smoke, deployment, server mutation, or provider live calls.
- Do not read, print, copy, diff, or infer `.env` files or secrets.

## Inputs

- Existing content calendar and marketing asset files.
- Current product gate status.
- Current rotation themes:
  - What is he thinking now?
  - Should I take the initiative in ambiguity?
  - Will they come back after no contact?
  - Is this relationship worth continuing?

## Outputs

- Updated `assets/marketing/content-calendar-7day.md`.
- Updated hook, script, and caption pool files.
- `.ai/CHANGELOG_AI.md`.
- `.ai/REVIEW_PACKET.md`.

## Workflow

1. Inspect current calendar and content pools.
2. Count future content days.
3. If fewer than seven future days exist, add only the missing number of days.
4. Rotate themes so the calendar does not repeat one emotional angle too often.
5. Keep copy helpful, grounded, and non-guaranteed.
6. Preserve manual publishing and review steps.
7. Record what changed and what remains blocked.

## Validation Commands

Use the narrowest commands that match the actual changes:

```bash
npm run typecheck
npm run lint
git diff --check
```

Also run a targeted secret-shape scan over:

```text
.ai/
assets/marketing/
data/
```

## Commit Rules

- Commit only content calendar, hook, script, caption, and AI record updates created by this skill.
- Use explicit path staging when unrelated changes exist.
- Suggested commit shape: `chore(marketing): refresh love-test content calendar`.
- Do not commit source code changes unless a separate confirmed implementation task requires them.

## Gate Status Format

```text
Seven-day content calendar: Go | No-Go - fewer than 7 days
Hook pool: Go | Needs refill
Video script pool: Go | Needs refill
Share caption pool: Go | Needs refill
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
