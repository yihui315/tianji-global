# TianJi Love GitHub Automation Skill Stack

Date: 2026-05-24

## Objective

Create a safe GitHub automation skill stack for TianJi Love marketing automation. The stack supports daily content generation, KPI analysis, seven-day content calendar maintenance, funnel copy optimization, payment gate reminders, and publisher bridge preparation.

This stack does not auto-post to social platforms, run Stripe checkout, run paid smoke, deploy production, read secrets, or use account credentials.

## Current Gate

```text
/love-test product funnel: Go
Marketing asset system: Go
KPI tracking system: Go
Daily growth automation: Go
Checkout readiness audit: Go
Approval packet: Go
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

## Skill Stack

### tianji-github-daily-growth-skill

Purpose: generate daily publishing packs from existing marketing assets.

Automatic actions:

- Create `assets/marketing/daily/day-XXX-publishing-pack.md`.
- Create `assets/marketing/daily/day-XXX-review-checklist.md`.
- Create `data/love-test-day-XXX-kpi-entry.csv`.
- Update `.ai/CHANGELOG_AI.md` and `.ai/REVIEW_PACKET.md`.

Manual actions:

- Review content.
- Publish manually to Xiaohongshu, Douyin, Videohao, or other platforms.
- Fill KPI values after publishing.

Blocked actions:

- Social auto-posting.
- Account credential use.
- Stripe checkout, paid smoke, Supabase mutation, provider live calls, production deploy, and `.env` access.

### tianji-github-kpi-analysis-skill

Purpose: analyze manually entered KPI CSV rows and produce optimization notes.

Automatic actions:

- Read `data/love-test-day-XXX-kpi-entry.csv`.
- Read `data/love-test-marketing-kpi.csv` when present.
- Create `.ai/reports/love-test-growth-report-YYYY-MM-DD.md`.
- Create `assets/marketing/daily/day-XXX-optimization-notes.md`.

Manual actions:

- Enter real KPI values before analysis.
- Review next-day optimization direction.

Blocked actions:

- Fake metrics.
- Invented conversions.
- Paid smoke and production deploy.

### tianji-github-content-calendar-skill

Purpose: maintain at least seven future days of content.

Automatic actions:

- Update `assets/marketing/content-calendar-7day.md`.
- Update `assets/marketing/love-test-next-30-hooks.md`.
- Update `assets/marketing/love-test-next-20-video-scripts.md`.
- Update `assets/marketing/love-test-next-20-share-captions.md`.

Manual actions:

- Select which content to publish.
- Adjust tone before posting.

Blocked actions:

- Fake testimonials.
- Guaranteed outcomes.
- Social auto-posting.

### tianji-github-funnel-optimizer-skill

Purpose: improve `/love-test` and `/ask` funnel copy when KPI evidence shows weak conversion.

Allowed files:

```text
src/app/(main)/love-test/page.tsx
src/app/(main)/ask/page.tsx
src/lib/love-test.ts
assets/love-test-copywriting.md
data/love-test-event-tracking.csv
data/love-test-kpi-tracking.csv
```

Allowed changes:

- CTA text.
- Hero copy.
- Paid-intent explanation.
- Share-card captions.
- Safe tracking names.

Blocked actions:

- Stripe execution.
- Checkout bypass.
- Supabase mutation.
- Provider live AI calls.
- Production deploy.

### tianji-github-paid-gate-skill

Purpose: enforce payment approval gates.

Automatic actions:

- Read non-secret checkout readiness evidence.
- Read approval packets.
- Report current paid-smoke gate.

Approval-required action:

- Prepare a paid smoke task only after the exact phrase:

```text
批准跑 Stripe test-mode paid smoke
```

Blocked actions:

- Create checkout sessions.
- Run paid smoke.
- Run live Stripe.
- Replay webhooks.
- Mutate Supabase.

### tianji-github-safe-publisher-bridge-skill

Purpose: prepare future n8n, Postiz, Mixpost, or similar publisher bridge files without credentials.

Automatic actions:

- Create `assets/marketing/publishing-queue.json`.
- Create `assets/marketing/publishing-queue.csv`.
- Create `.ai/TIANJI_LOVE_SAFE_PUBLISHER_BRIDGE.md`.

Manual actions:

- Review publishing queue.
- Import queue into a platform-safe tool only after separate approval.

Blocked actions:

- Actual platform posting.
- Login cookies.
- Tokens.
- Browser login automation.
- Captcha bypass.
- Credential storage.

## Workflow Templates

### `.github/workflows/tianji-love-daily-growth.yml`

Purpose: run daily docs/assets/data generation.

Triggers:

- `workflow_dispatch`
- Scheduled daily at `17 1 * * *` UTC.

Permission:

- `contents: write`, only because it commits generated docs/assets/data.

### `.github/workflows/tianji-love-kpi-analysis.yml`

Purpose: analyze manually entered KPI rows for a requested day.

Triggers:

- `workflow_dispatch` with required `day` input.

Permission:

- `contents: write`, only because it commits generated reports and optimization notes.

### `.github/workflows/tianji-love-content-calendar.yml`

Purpose: keep the future content calendar and idea pools filled.

Triggers:

- `workflow_dispatch`
- Scheduled daily at `37 1 * * *` UTC.

Permission:

- `contents: write`, only because it commits generated marketing asset updates.

### `.github/workflows/tianji-love-safety-audit.yml`

Purpose: run lightweight safety checks on code and automation files.

Triggers:

- `workflow_dispatch`
- Scheduled daily at `7 2 * * *` UTC.

Permission:

- `contents: read`.

## Automatic Actions

- Generate publishing packs and KPI entry scaffolds.
- Generate KPI reports only from manually entered data.
- Maintain content calendars and content idea pools.
- Run `npm run typecheck`, `npm run lint`, `git diff --check`, and targeted secret-shape scans in workflow templates.
- Commit generated docs/assets/data when the path guard allows the change.

## Actions Requiring Approval

- Any social platform integration beyond a credential-free publishing queue.
- Any n8n, Postiz, Mixpost, or browser automation adapter.
- Any funnel source change outside the allowed file list.
- Any Stripe, checkout, paid smoke, webhook replay, Supabase mutation, provider live call, staging deploy, or production deploy.
- Paid smoke requires the exact approval phrase:

```text
批准跑 Stripe test-mode paid smoke
```

## Manual Runbook

Run daily growth:

```text
GitHub Actions -> TianJi Love Daily Growth -> Run workflow
```

Run KPI analysis:

```text
GitHub Actions -> TianJi Love KPI Analysis -> Run workflow -> day=001
```

Run content calendar maintenance:

```text
GitHub Actions -> TianJi Love Content Calendar -> Run workflow
```

Run safety audit:

```text
GitHub Actions -> TianJi Love Safety Audit -> Run workflow
```

## Stop Automation

1. Open the target workflow in GitHub Actions.
2. Use "Disable workflow".
3. Alternatively remove or comment out the `schedule` block in the workflow file.
4. Keep `workflow_dispatch` if manual runs are still desired.

## Inspect Outputs

- Daily packs: `assets/marketing/daily/`
- KPI reports: `.ai/reports/`
- Calendar and content pools: `assets/marketing/`
- Publisher queue: `assets/marketing/publishing-queue.json` and `assets/marketing/publishing-queue.csv`
- Gate records: `.ai/CHANGELOG_AI.md` and `.ai/REVIEW_PACKET.md`

## Expected Gate

```text
GitHub automation skill stack: Go
Daily growth workflow template: Go
KPI analysis workflow template: Go
Publisher bridge: Prepared but no credentials
Social auto-posting: No-Go - requires explicit approval and platform-safe adapter
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
