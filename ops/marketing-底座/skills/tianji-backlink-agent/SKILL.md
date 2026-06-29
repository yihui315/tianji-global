---
name: tianji-backlink-agent
description: Use when discovering and submitting backlinks for tianji.love. Reads demand-mining reports for content angles, scans candidate directories (DA≥15), submits to Chinese 命理/玄学 directories and Web 2.0 platforms, records to ops/marketing-底座/backlink-tracker.md.
metadata:
  hermes:
    recipe:
      schedule: "0 10 * * 2,4"
      deliver: skill
      prompt: |
        Clone/fetch the yihui315/tianji-global repo first.
        Work in /root/tianji-global directory.
        Run tianji-backlink-agent operations:
        1. Read ops/marketing-底座/backlink-tracker.md to understand current status
        2. Read the latest demand-mining report from ops/demand-mining/ for content angles
        3. Scan candidate sites from tracker A-E lists (DA≥15, 命理/玄学 niche)
        4. Attempt submissions to Chinese 命理/玄学 directories and Web 2.0 platforms
        5. Update backlink-tracker.md with new status records (pending/approved)
---

# TianJi Backlink Agent Skill

## Purpose

Find DA≥15 sites in the 命理/玄学 niche and submit tianji.love for backlink opportunities. Generate backlink submissions to Chinese 命理/玄学 directories and Web 2.0 platforms without posting to social platforms or touching revenue, production, accounts, credentials, or runtime systems.

## Allowed Actions

- Read `ops/marketing-底座/backlink-tracker.md`.
- Read `ops/demand-mining/` reports for content angles.
- Scan candidate directories for URL submission forms.
- Write submission records to `ops/marketing-底座/backlink-tracker.md`.
- Update tracker status to `pending` or `approved`.
- Commit and push tracker updates when the worktree scope is clean and intentional.

## Forbidden Actions

- Do not submit spam or low-quality content.
- Do not submit to gambling or pornographic sites.
- Do not create fake accounts for submissions.
- Do not engage in paid link buying schemes.
- Do not use account credentials, login cookies, browser sessions, or platform tokens.
- Do not deploy production or mutate server state.
- Do not perform database, Supabase, or API server mutations.
- Do not read, print, copy, diff, or infer `.env` files or secrets.
- Do not invent or falsify submission outcomes or DA scores.

## Inputs

- Current backlink tracker: `ops/marketing-底座/backlink-tracker.md`.
- Demand-mining reports under `ops/demand-mining/` for content angles.
- Target site: `tianji.love`.
- Minimum DA threshold: 15.

## Outputs

- Updated `ops/marketing-底座/backlink-tracker.md` with new status records.
- New submission entries with `pending` or `approved` status.

## Workflow

1. Read `ops/marketing-底座/backlink-tracker.md` to understand current backlink status.
2. Read the latest demand-mining report from `ops/demand-mining/` for content angles.
3. Scan candidate sites from tracker A-E lists (DA≥15, 命理/玄学 niche).
4. Attempt submissions to Chinese 命理/玄学 directories and Web 2.0 platforms.
5. Update `backlink-tracker.md` with new status records (pending/approved).
6. Validate changes limited to allowed tracker paths.
7. Commit and push tracker updates.

## Validation

- Verify tracker is updated with new status records.
- Confirm submission records include site name, DA, category, date, and status.
- Ensure changes are limited to `ops/marketing-底座/backlink-tracker.md`.

## Commit Rules

- Commit only files created or updated by this skill.
- Use explicit path staging, not broad `git add -A`, when unrelated changes exist.
- Allowed commit shape: `chore(backlink): update backlink tracker with new submissions`.
- Do not commit `.env`, logs, screenshots, deploy archives, build output, credentials, or unrelated source changes.
