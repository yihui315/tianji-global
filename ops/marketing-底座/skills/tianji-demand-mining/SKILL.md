---
name: tianji-demand-mining
description: Use when daily demand mining for TianJi Love content topics is needed. Mine hot trends from Baidu, Toutiao, Bilibili, and Douban to surface 5-10 relevant topics aligned with 命理/情感/身心灵/紫微/八字/塔罗. Write demand-daily reports to ops/marketing-底座/handoffs/ for content planning.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    recipe:
      schedule: "0 8 * * *"
      deliver: skill
      prompt: |
        Clone/fetch the yihui315/tianji-global repo first.
        Work in /root/tianji-global directory.
        Run tianji-demand-mining skill operations:
        1. Check data source availability (Baidu top.baidu.com/board, api.toutiao.io hot-board, Bilibili ranking API, Douban group explore).
        2. Curl or fetch hot trends from each source.
        3. Filter and pick 5-10 topics aligned with 命理/情感/身心灵/紫微/八字/塔罗.
        4. Write demand-daily-YYYY-MM-DD.md report to ops/marketing-底座/handoffs/.
        5. Verify report is non-empty and topics are relevant.
---

# TianJi Demand Mining Skill

## Purpose

Mine daily content demand signals from Chinese social platforms to identify hot topics aligned with TianJi Love's niche: 命理, 情感, 身心灵, 紫微, 八字, 塔罗. Generate demand-daily reports for content planning without touching production systems, credentials, or posting workflows.

## Allowed Actions

- Read hot trends from Baidu top.baidu.com/board via curl.
- Read hot trends from api.toutiao.io hot-board endpoint.
- Read Bilibili ranking API for trending topics.
- Read Douban group explore for niche discussions.
- Filter topics aligned with 命理/情感/身心灵/紫微/八字/塔罗.
- Write demand-daily-YYYY-MM-DD.md reports to ops/marketing-底座/handoffs/.
- Commit and push report files when the worktree scope is clean and intentional.

## Forbidden Actions

- Do not auto-post to social platforms.
- Do not use account credentials, login cookies, browser sessions, or platform tokens.
- Do not run Stripe, checkout, paid smoke, webhook replay, or billing actions.
- Do not deploy production or mutate server state.
- Do not perform database, Supabase, or API server mutations.
- Do not read, print, copy, diff, or infer `.env` files or secrets.
- Do not invent demand metrics, engagement numbers, or guaranteed content outcomes.

## Workflow

1. Clone or fetch the yihui315/tianji-global repo to /root/tianji-global.
2. Check data source availability before querying:
   - Baidu top.baidu.com/board
   - api.toutiao.io hot-board
   - Bilibili ranking API
   - Douban group explore
3. Curl or fetch hot trends from each source.
4. Filter and pick 5-10 topics aligned with: 命理, 情感, 身心灵, 紫微, 八字, 塔罗.
5. Synthesize findings into a demand report.
6. Write report to ops/marketing-底座/handoffs/demand-daily-YYYY-MM-DD.md.
7. Verify report is non-empty and topics are relevant.
8. Commit and push with: chore(demand): add daily demand mining report YYYY-MM-DD

## Verification

- Report file exists at ops/marketing-底座/handoffs/demand-daily-YYYY-MM-DD.md.
- Report contains 5-10 relevant topics aligned with 命理/情感/身心灵/紫微/八字/塔罗.
- Report is non-empty (≥1 line of content).
- Topics are sourced from fetched hot trends data.

## Commit Rules

- Commit only files created or updated by this skill.
- Use explicit path staging, not broad `git add -A`, when unrelated changes exist.
- Allowed commit shape: `chore(demand): add daily demand mining report YYYY-MM-DD`.
- Do not commit `.env`, logs, screenshots, deploy archives, build output, credentials, or unrelated source changes.
