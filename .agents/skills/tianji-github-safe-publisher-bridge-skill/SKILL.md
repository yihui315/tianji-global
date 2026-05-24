---
name: tianji-github-safe-publisher-bridge-skill
description: Prepare TianJi Love publisher bridge export files for future tools like n8n, Postiz, or Mixpost without credentials. Use for publishing queues, CSV/JSON handoff files, and manual-review bridge documentation that avoids direct social posting.
---

# TianJi GitHub Safe Publisher Bridge Skill

## Purpose

Prepare publisher bridge files for future tools such as n8n, Postiz, or Mixpost while keeping the first phase manual-review only and credential-free.

## Allowed Actions

- Export a publishing queue as JSON or CSV.
- Create `assets/marketing/publishing-queue.json`.
- Create `assets/marketing/publishing-queue.csv`.
- Create `.ai/TIANJI_LOVE_SAFE_PUBLISHER_BRIDGE.md`.
- Update `.ai/CHANGELOG_AI.md`.
- Update `.ai/REVIEW_PACKET.md`.

## Forbidden Actions

- Do not post to social platforms.
- Do not use login cookies, tokens, app secrets, account credentials, or browser login automation.
- Do not bypass captcha, 2FA, platform limits, or account risk controls.
- Do not store credentials in the repo or generated files.
- Do not run Stripe, paid smoke, deployment, server mutation, or provider live calls.
- Do not read, print, copy, diff, or infer `.env` files or secrets.

## Inputs

- Approved publishing pack files under `assets/marketing/daily/**`.
- Content calendar files under `assets/marketing/**`.
- Manual review status.
- Current gate state from `.ai` evidence or user instructions.

## Outputs

- `assets/marketing/publishing-queue.json`
- `assets/marketing/publishing-queue.csv`
- `.ai/TIANJI_LOVE_SAFE_PUBLISHER_BRIDGE.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`

## Workflow

1. Inspect available publishing packs and calendar files.
2. Export only content metadata, captions, platform hints, planned dates, and manual-review status.
3. Leave credential fields absent, not blank placeholders.
4. Mark every queue item as manual-review required unless the user explicitly approves a future platform-safe adapter.
5. Document how to inspect, stop, and keep the bridge credential-free.
6. Record gate status and skipped actions.

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

- Commit only publishing queue exports, bridge docs, and AI records created by this skill.
- Use explicit path staging when unrelated changes exist.
- Suggested commit shape: `chore(marketing): add safe publisher bridge queue`.
- Do not commit credentials, cookies, tokens, screenshots with account data, browser profiles, or platform automation scripts.

## Gate Status Format

```text
Publisher bridge export: Go
Publishing queue JSON: Go | Not generated
Publishing queue CSV: Go | Not generated
Credentials: No-Go - not used or stored
Social auto-posting: No-Go - manual publishing only
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
