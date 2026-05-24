# TianJi Love Autonomous Money-Making Automation Controller

## Mission

Turn TianJi Love into a semi-autonomous revenue engine.

Codex should automatically execute all safe tasks end-to-end:

- Generate daily marketing content
- Prepare publishing packs
- Update KPI files
- Analyze yesterday's performance
- Improve hooks, CTA, copy, and share-card text
- Improve `/love-test` and `/ask` funnel copy when safe
- Run tests/build/audits when source changes
- Update `.ai/CHANGELOG_AI.md`
- Update `.ai/REVIEW_PACKET.md`
- Create branches, commits, and pushes for safe work
- Produce operator packets when server/payment/production approval is needed

Codex must stop and request explicit approval only for:

- Stripe test-mode paid smoke
- Real/live Stripe payment
- Production deploy
- Webhook replay
- Supabase mutation
- Provider live AI call
- PM2/Nginx/certbot/server mutation
- `.env` access
- Social platform auto-posting with account credentials

## Current Project Gate

```text
/love-test product funnel: Go
Share-card PNG: Go
/ask paid-intent: Go
9.9 one-question intent: Go
Locked preview: Go
Checkout readiness audit: Go
Paid smoke approval packet: Go
Marketing asset system: Go
KPI tracking system: Go
Daily growth loop: Go
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```

## Absolute Safety Rules

Never do these without explicit user approval:

```text
No production deploy.
No Stripe checkout execution.
No paid smoke.
No live payment.
No webhook replay.
No Supabase mutation.
No provider live AI call.
No .env read, print, copy, upload, or diff.
No PM2/Nginx/certbot/server mutation.
No social account auto-posting with credentials.
No destructive git operation.
No fake testimonials.
No fake user numbers.
No guaranteed relationship outcome.
No "100% accurate" claims.
```

Explicit approval phrases required:

```text
批准跑 Stripe test-mode paid smoke
批准 production canary
批准服务器 staging 操作
批准真实发布到社交平台
```

Without these exact approvals, keep those gates as No-Go.

## Autonomous Loop

Codex should run this loop every time this task is executed.

### Step 1: Read State

Read:

```text
.ai/TIANJI_LOVE_AUTOMATION_CONTROLLER.md
.ai/TIANJI_LOVE_DAILY_GROWTH_AUTOMATION_LOOP.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
data/love-test-marketing-kpi.csv
data/love-test-daily-growth-log.csv
data/love-test-content-calendar.csv
data/love-test-funnel-metrics.csv
assets/marketing/
```

If some files do not exist, create safe placeholders.

### Step 2: Determine Mode

Codex should determine one of these modes automatically:

```text
Mode A: Day 1 launch pack needed
Mode B: Daily KPI analysis needed
Mode C: New marketing content needed
Mode D: Funnel copy improvement needed
Mode E: Source code changed, tests needed
Mode F: Payment approval needed
Mode G: Production approval needed
```

Decision rules:

```text
If no daily publishing pack exists for today:
  run Mode A.

If KPI file has yesterday's data:
  run Mode B.

If content calendar has fewer than 7 future days:
  run Mode C.

If paid-intent CTR or unlock click is weak:
  run Mode D.

If source files changed:
  run Mode E.

If checkout readiness is Go but paid smoke is No-Go:
  prepare reminder that explicit approval is required, but do not run paid smoke.

If production deploy is requested but no approval:
  stop and request exact approval phrase.
```

## Mode A: Create Daily Publishing Pack

Create today's publishing pack:

```text
assets/marketing/daily/day-XXX-publishing-pack.md
assets/marketing/daily/day-XXX-review-checklist.md
data/love-test-day-XXX-kpi-entry.csv
```

Include:

```text
3 Xiaohongshu posts
2 Douyin scripts
1 Videohao script
5 share-card captions
2 KOL DM templates
3 SEO keyword/page outlines
```

Each item must include:

```text
channel
title
hook
body/script
CTA
target audience
posting note
risk-safe check
```

CTA should point to:

```text
/love-test
/ask?source=love_test&intent=what_are_they_thinking
```

Do not invent fake data.

## Mode B: Analyze KPI and Improve

Read KPI CSVs and analyze:

```text
Top 3 hooks by clicks
Top 3 hooks by love_test_starts
Top 3 hooks by ask_next_clicks
Lowest 3 performers
Best channel
Best emotional angle
Best CTA
```

Create:

```text
.ai/reports/love-test-growth-report-YYYY-MM-DD.md
assets/marketing/daily/day-XXX-optimization-notes.md
```

Output:

```text
What worked
What failed
What to repeat
What to stop
Tomorrow's content direction
Recommended CTA variant
Recommended hook pattern
```

## Mode C: Generate Future Content

Maintain at least 7 future days of content.

Create/update:

```text
assets/marketing/content-calendar-7day.md
assets/marketing/love-test-next-30-hooks.md
assets/marketing/love-test-next-20-video-scripts.md
assets/marketing/love-test-next-20-share-captions.md
```

Themes to rotate:

```text
他现在到底在想什么
你们到底有没有缘分
暧昧期该不该主动
断联后还会回来吗
这段关系值不值得继续
他冷淡是不是不喜欢了
什么时候该联系他
为什么你总是被这段关系牵动
```

## Mode D: Improve Funnel Copy Safely

Only modify source code if there is a clear copy improvement and tests can pass.

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

```text
CTA text
hero copy
result section copy
paid-intent explanatory copy
tracking event names if compatible
share-card captions
```

Forbidden changes:

```text
No payment execution.
No Stripe session creation.
No provider live call.
No Supabase mutation.
No production config.
No .env.
```

If source code changes, run Mode E validation.

## Mode E: Validation for Source Changes

If app source changed, run:

```bash
npm run test -- --run src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/love-test-mvp-contract.test.ts src/__tests__/revenue-funnel-polish-contract.test.ts src/__tests__/relationship-share-card-contract.test.ts
npm run typecheck
npm run lint
npm run audit:routes
npm run audit:share
npm run build:staging:degraded
git diff --check
```

If only docs/assets/data changed, run:

```bash
npm run typecheck
npm run lint
git diff --check
```

Always run a targeted secret-shape scan over new/changed docs/assets/data. Do not print secrets.

## Mode F: Payment Gate

If paid smoke is requested but the user did not explicitly say:

```text
批准跑 Stripe test-mode paid smoke
```

Then do not run payment.

Return:

```text
Paid smoke: No-Go - awaiting explicit approval
Required approval phrase: 批准跑 Stripe test-mode paid smoke
```

If the exact phrase exists in the user instruction, then and only then prepare the paid smoke task.

Do not execute paid smoke inside this controller unless the task explicitly says to execute Stripe test-mode paid smoke.

## Mode G: Production Gate

If production canary is requested but the user did not explicitly say:

```text
批准 production canary
```

Then do not deploy.

Return:

```text
Production deploy: No-Go - awaiting explicit approval
Required approval phrase: 批准 production canary
```

## Commit and Push Rules

For docs/assets/data-only work:

```text
branch: chore/love-test-daily-growth-YYYYMMDD
commit: chore(marketing): add love-test daily growth pack
```

For source copy/funnel improvements:

```text
branch: feat/love-test-growth-optimization-YYYYMMDD
commit: feat(love): optimize love-test growth funnel
```

For reports only:

```text
branch: chore/love-test-growth-report-YYYYMMDD
commit: chore(marketing): record love-test growth report
```

Always:

```bash
git status --short
git diff --cached --name-only
git diff --cached --check
git commit
git push
```

Never stage unrelated dirty files.

## Evidence Updates

Always update:

```text
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

Use this format:

```markdown
## TianJi Love Autonomous Growth Run - YYYY-MM-DD

### What changed

...

### Files changed

...

### Commands run

...

### Validation result

...

### Automation result

```text
Daily publishing pack:
KPI analysis:
Funnel optimization:
Tests/build:
Paid smoke:
Production deploy:
```

### Risks and follow-up

...

### Suggested commit message

...
```

## Final Output Format

Return exactly:

```markdown
1. What changed

2. Files changed

3. Commands run

4. Validation result

5. Automation result

6. Gate status

7. Risks and follow-up

8. Suggested commit message

9. Next autonomous task
```

## Expected Safe Gate

```text
Daily growth automation: Go
Marketing content generation: Go
KPI tracking: Go
Funnel optimization: Go if tests pass
Stripe checkout execution: Not run
Paid smoke: No-Go - awaiting explicit approval
Production deploy: No-Go
```
