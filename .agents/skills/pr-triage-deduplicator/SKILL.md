---
name: pr-triage-deduplicator
description: Triage Tianji Global pull requests and branches. Use to find duplicate PRs, overlapping work, risky changes, stale automation output, and a safe merge or close order without modifying product code.
---

# PR Triage Deduplicator

## Purpose

Reduce parallel PR noise and identify the safest merge sequence.

## When to use

Use at the start of a workday, before release, after automated agents create multiple branches, or when several PRs touch the same surface.

## Inputs

- Git branch list
- Open PR list
- PR diffs and titles
- CI status
- `AGENTS.md`
- `.ai/TASKS.md` when available

## Actions

1. Group PRs by touched surface: CI, env, AGENTS, billing, privacy, UI, copy, database, docs.
2. Identify duplicates and overlapping diffs.
3. Mark risk level for each PR.
4. Recommend at most four active PRs to keep in flight.
5. Recommend merge order based on dependency and blast radius.
6. Recommend close, pause, or rebase actions; do not perform destructive actions without explicit approval.

## Constraints

- Do not close PRs automatically.
- Do not force push.
- Do not rewrite or revert user work.
- Do not combine unrelated surfaces into one PR.
- Treat payment, privacy, database, and authentication changes as high risk.

## Definition of Done

- PRs are grouped by intent and touched files.
- Duplicate or conflicting PRs are identified.
- A merge order is proposed.
- High-risk PRs are flagged for Brain and human review.

## Validation

- `git status --short`
- `git branch --all`
- GitHub PR list or equivalent connector output when available.
