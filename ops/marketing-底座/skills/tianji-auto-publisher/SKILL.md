---
name: tianji-auto-publisher
description: Use when publishing content to social platforms for TianJi Love. Generates platform-specific copy for X/Twitter, Xiaohongshu, Zhihu, WeChat articles, and Douban — but outputs draft files ONLY for human review, does NOT auto-post to any platform.
metadata:
  hermes:
    recipe:
      schedule: "0 9 * * *"
      deliver: skill
      prompt: |
        Clone/fetch the yihui315/tianji-global repo first.
        Work in /root/tianji-global directory.
        Run tianji-auto-publisher skill operations:
        1. Read today's content calendar from ops/marketing-底座/content-calendar.md
        2. Read the daily publishing pack from assets/marketing/daily/day-XXX-publishing-pack.md
        3. Generate draft copy for each platform:
           - X/Twitter: ≤280 chars + hashtags
           - Xiaohongshu/RED: ≤1000 chars + hashtags
           - Zhihu: ≤2000 chars + tags
           - WeChat: title + body draft
           - Douban: draft copy
        4. Write all drafts to ops/marketing-底座/handoffs/day-XXX-manual-post-draft.md with section headers
        5. Verify draft file exists and all platform sections are present
---

# TianJi Auto Publisher Skill

## Purpose

Generate draft copy files for human review before any social posting — this is a safety-critical constraint. This skill produces platform-specific content drafts only and does not perform any actual posting to social platforms.

## Allowed Actions

- Read `ops/marketing-底座/content-calendar.md`.
- Read `assets/marketing/daily/day-XXX-publishing-pack.md`.
- Write draft copy files to `ops/marketing-底座/handoffs/day-XXX-manual-post-draft.md`.
- Clone/fetch the yihui315/tianji-global repository to /root/tianji-global.

## Forbidden Actions

- CRITICAL: Do NOT actually post to any social platform.
- Do NOT use account credentials, tokens, cookies, or sessions.
- Do NOT auto-DM anyone.
- Do NOT use browser automation to post.

## Inputs

- Target day number, formatted as `day-XXX`.
- Content calendar at `ops/marketing-底座/content-calendar.md`.
- Daily publishing pack at `assets/marketing/daily/day-XXX-publishing-pack.md`.

## Outputs

- `ops/marketing-底座/handoffs/day-XXX-manual-post-draft.md`

## Workflow

1. Read today's content calendar from `ops/marketing-底座/content-calendar.md`.
2. Read the daily publishing pack from `assets/marketing/daily/day-XXX-publishing-pack.md`.
3. Generate draft copy for each platform:
   - **X/Twitter**: ≤280 characters + hashtags
   - **Xiaohongshu/RED**: ≤1000 characters + hashtags
   - **Zhihu**: ≤2000 characters + tags
   - **WeChat**: title + body draft
   - **Douban**: draft copy
4. Write all drafts to `ops/marketing-底座/handoffs/day-XXX-manual-post-draft.md` with section headers.
5. Verify the draft file exists and all platform sections are present.

## Verification

- Draft file exists at `ops/marketing-底座/handoffs/day-XXX-manual-post-draft.md`.
- All platform sections present: X/Twitter, Xiaohongshu, Zhihu, WeChat, Douban.
- No actual posting performed — this skill outputs drafts for human review only.
