---
name: tianji-github-paid-gate-skill
description: Enforce TianJi Love payment approval gates in GitHub automation and Codex runs. Use for checkout readiness evidence, approval packets, paid smoke No-Go reminders, and preparing a paid smoke task only after the exact required approval phrase.
---

# TianJi GitHub Paid Gate Skill

## Purpose

Enforce the TianJi Love payment approval gate. This skill reports readiness and prepares task instructions only after the exact approval phrase is present. It does not execute payment or provider actions.

## Allowed Actions

- Read checkout readiness evidence.
- Read approval packets.
- Report the current payment gate.
- Prepare a paid smoke task only after the exact approval phrase is present.
- Update `.ai/CHANGELOG_AI.md`.
- Update `.ai/REVIEW_PACKET.md`.

## Required Approval Phrase

```text
批准跑 Stripe test-mode paid smoke
```

## Forbidden Actions

- Do not create a Stripe checkout session without the exact approval phrase.
- Do not run paid smoke without the exact approval phrase.
- Do not run live Stripe.
- Do not replay webhooks.
- Do not mutate Supabase or database state.
- Do not deploy production or mutate server state.
- Do not read, print, copy, diff, or infer `.env` files or secrets.
- Do not treat similar wording as approval.

## Inputs

- Checkout readiness audit evidence.
- Stripe test-mode paid smoke approval packet.
- Current gate state from `.ai` evidence or user instructions.
- User message containing or not containing the exact approval phrase.

## Outputs

- Current payment gate report.
- Optional paid smoke execution task draft only when exact approval exists.
- `.ai/CHANGELOG_AI.md`.
- `.ai/REVIEW_PACKET.md`.

## Workflow

1. Inspect only non-secret evidence and approval packets.
2. Check whether the exact required approval phrase is present in the current user instruction.
3. If absent, report paid smoke as No-Go and stop before execution planning.
4. If present, prepare a narrowly scoped test-mode paid smoke task, but do not execute it unless that is separately requested in the same approved task.
5. Preserve test-mode, staging-only, masked-evidence, and no-live-Stripe boundaries.
6. Record the gate status and skipped actions.

## Validation Commands

For gate-report-only work:

```bash
git diff --check
```

Also run a targeted secret-shape scan over:

```text
.ai/
.agents/skills/
.github/workflows/
```

For any later approved paid-smoke task, follow the active paid smoke runbook and do not infer missing commands from this skill.

## Commit Rules

- Commit only gate reports, task drafts, and AI records created by this skill.
- Use explicit path staging when unrelated changes exist.
- Suggested commit shape: `docs(revenue): record paid smoke gate status`.
- Do not commit payment execution artifacts unless a separately approved test-mode paid smoke task produced them safely.

## Gate Status Format

```text
Checkout readiness audit: Go | Conditional Go | No-Go
Approval packet: Go | No-Go
Approval phrase: Present | Missing
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
