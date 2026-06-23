# TianJi Love Day 011 Review Checklist

Purpose: manual safety checklist before publishing Day011 assets.

## Scope

- Publishing date: 2026-06-28
- Theme: Understanding a pattern is not the same as acting on it tonight
- Pack: `assets/marketing/daily/day-011-publishing-pack.md`
- Queue: `assets/marketing/publishing-queue/day-011-publishing-queue.csv`
- KPI template: `data/love-test-day-011-kpi-entry.csv`

## Content Safety

```text
No fake metric, user count, revenue, ranking, or testimonial: pass_pending_manual_review
No guaranteed outcome or reunion promise: pass_pending_manual_review
No mind-reading claim about the other person's intent: pass_pending_manual_review
No diagnosis, shame, manipulation, or fear-based urgency: pass_pending_manual_review
No "text them now", chasing, testing, or pressure framing: pass_pending_manual_review
No real chat screenshot, name, photo, birth data, or account data: pass_pending_manual_review
Understanding-vs-action framing preserved (no immediate action push): pass_pending_manual_review
CTA starts at /love-test: pass_pending_manual_review
```

## Publishing Gate

```text
Manual review completed by human operator: pending
Platform account login required by Codex: no
Auto-posting used: no
Platform API used: no
Cookies/tokens/credentials used: no
Published URL entered by human: pending
```

## KPI And Revenue Gate

```text
KPI template exists: yes
Placeholder zeros only before publish: yes
Real metrics entered by human after publish: pending
KPI analysis allowed before real values: no
Stripe checkout execution: not_run
Paid smoke: not_run
Webhook replay: not_run
Supabase mutation: not_run
Production deploy: not_run
Revenue execution: no_go
Secret access (.env, tokens, credentials): not_performed
```

## Risk-Specific Reminders For This Pack

```text
- This pack deliberately separates understanding from acting; reject any copy that pressures the reader to act tonight.
- Avoid "do not wait" or "you are running out of time" language.
- Avoid "send this exact text" instruction patterns.
- Privacy non-negotiables remain in force: no birth data, no chat screenshots, no identifying details.
- The trust pillar copy in COPY_BANK.md is the only authority we claim.
```
