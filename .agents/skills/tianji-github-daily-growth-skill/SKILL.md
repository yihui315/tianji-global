---
name: tianji-github-daily-growth-skill
description: Generate TianJi Love daily marketing publishing packs from existing assets in GitHub automation or local Codex runs. Use for daily growth content packs, review checklists, KPI entry CSV scaffolds, docs/assets/data-only commits, and safe manual publishing handoff.
---

# TianJi GitHub Daily Growth Skill

## Purpose

Generate daily TianJi Love publishing packs from existing marketing assets without posting to social platforms or touching revenue, production, accounts, credentials, or runtime systems.

## Allowed Actions

- Read `assets/marketing/**`.
- Create `assets/marketing/daily/day-XXX-publishing-pack.md`.
- Create `assets/marketing/daily/day-XXX-review-checklist.md`.
- Create `data/love-test-day-XXX-kpi-entry.csv`.
- Update `.ai/CHANGELOG_AI.md`.
- Update `.ai/REVIEW_PACKET.md`.
- Commit and push docs/assets/data-only changes when the worktree scope is clean and intentional.

## Forbidden Actions

- Do not auto-post to social platforms.
- Do not use account credentials, login cookies, browser sessions, or platform tokens.
- Do not run Stripe, checkout, paid smoke, webhook replay, or billing actions.
- Do not deploy production or mutate server state.
- Do not perform database, Supabase, or API server mutations.
- Do not read, print, copy, diff, or infer `.env` files or secrets.
- Do not invent KPI values, testimonials, customer counts, or guaranteed relationship outcomes.

## Inputs

- Target day number, formatted as `day-XXX`.
- Existing marketing source files under `assets/marketing/**`.
- Existing KPI schema files under `data/**` when available.
- Current gate status from `.ai` evidence or user instructions.

## Outputs

- `assets/marketing/daily/day-XXX-publishing-pack.md`
- `assets/marketing/daily/day-XXX-review-checklist.md`
- `data/love-test-day-XXX-kpi-entry.csv`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Workflow

1. Confirm the task is docs/assets/data-only.
2. Inspect existing marketing assets and KPI schema before writing.
3. Choose a small daily theme from the current content calendar or hook pool.
4. Create one publishing pack with platform-specific copy, captions, manual posting notes, and no credential use.
5. Create a review checklist for manual approval before posting.
6. Create a KPI entry CSV with empty or zero placeholders only.
7. Validate that all changes are limited to allowed docs/assets/data paths.
8. Record gate status and commands in `.ai/CHANGELOG_AI.md` and `.ai/REVIEW_PACKET.md`.

## Validation Commands

Use the narrowest commands that match the actual changes:

```bash
npm run typecheck
npm run lint
git diff --check
```

Also run a targeted secret-shape scan over:

```text
.agents/skills/
.github/workflows/
.ai/
assets/marketing/
data/
```

## Commit Rules

- Commit only files created or updated by this skill.
- Use explicit path staging, not broad `git add -A`, when unrelated changes exist.
- Allowed commit shape: `chore(marketing): add love-test day XXX publishing pack`.
- Do not commit `.env`, logs, screenshots, deploy archives, build output, credentials, or unrelated source changes.

## Gate Status Format

```text
Daily growth publishing pack: Go
Manual review checklist: Go
KPI entry scaffold: Go
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
