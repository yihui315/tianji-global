# Review Packet - TianJi Love Divination Evidence Layer Clean Narrow PR

## Background

PR #60 is intentionally not merged because it is too broad and not mergeable enough for `main`:

```text
PR #60: No-Go
Reason: 53 commits / 325 files / mergeable=false / Vercel failed / remote CI missing / paid smoke not run
```

This packet records the clean-room recreation from latest `origin/main`.

## Task Goal

Recreate only the Divination Evidence Layer and direct wiring needed for Ask, Draw, and Relationship. Preserve payment and production gates: no live Stripe, no production deploy, no secrets, no PR #60 merge.

## Branch

```text
Branch: feat/tianji-divination-evidence-layer-clean-20260525
Base: origin/main cb12208
Old source commit referenced: 7333e68fbd3e0891051deb8cd2b420d2557f4dda
Worktree: C:\Users\Administrator\.config\superpowers\worktrees\tianji-global\feat-tianji-divination-evidence-layer-clean-20260525
```

## Changed Scope

```text
Structured evidence types and builders
Divination evidence card UI
Ask preview/unlock evidence wiring
Draw preview/unlock evidence wiring
Relationship analyze/result evidence wiring
Privacy-safe analytics sanitizer/events
Focused tests
.ai evidence docs
Four referenced Tianji Love visual assets
```

The diff is narrow relative to PR #60: 47 files before this changelog/review append, plus the required AI evidence updates.

## Validation Result

```text
npm run typecheck: Pass
npm run lint: Pass
npm run test -- --run src/__tests__/lib/divination-evidence.test.ts src/__tests__/api/ask-paid-gateway.test.ts src/__tests__/api/draw-gateway.test.ts src/__tests__/relationship-flow-contract.test.ts src/__tests__/revenue-funnel-polish-contract.test.ts: Pass, 5 files / 24 tests
npm run test: Pass, 48 files / 473 tests
npm run build: Pass
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
npm run audit:ask-revenue-contract: Not available on clean main
npm run audit:draw-revenue-contract: Not available on clean main
npm run smoke:stripe:test-readiness: Not available on clean main
git diff --check: Pass, CRLF warnings only
targeted secret-shape scan over changed files: Pass
```

## Non-Paid QA

Puppeteer QA ran against local `next start` on port `3107` with a local dummy auth secret, not a real secret.

```text
/ask?lang=en: route render Go, preview evidence Go, confidence Go, timing Go, feedback Go, unlock CTA Go, mobile overflow Go
/draw?lang=en: route render Go, preview evidence Go, confidence Go, timing Go, feedback Go, unlock CTA Go, mobile overflow Go
/relationship/new?lang=en: route render Go, result evidence Go, confidence Go, timing Go, feedback Go, unlock CTA Go, mobile overflow Go
Analytics events seen: divination_evidence_viewed, divination_accuracy_feedback_submitted
Private sentinel leakage in analytics: 0 detected
```

## Safety Result

```text
Secrets printed: No
.env read: No
Stripe live mode: Not used
Paid smoke: Not run
Production deploy: Not run
DNS/Nginx/PM2/server production state: Not touched
Raw question/name/birth/payment leakage in analytics QA: 0 detected
```

## Gate Status

```text
Divination Evidence Layer idea: Go
Clean implementation: Go
Ask preview / paid unlock wiring: Go
Draw preview / paid unlock wiring: Go
Relationship reading/result wiring: Go
Analytics privacy: Go
Tests/build/audits: Go
Non-paid local QA: Go
PR #60 merge: No-Go
Paid smoke: No-Go
Production deploy: No-Go
```

## Risks And Follow-up

- The clean PR still requires remote GitHub checks and mergeability verification after push.
- Paid smoke remains No-Go until explicit Stripe test-mode approval and environment readiness.
- The clean branch includes direct Ask/Draw support dependencies because latest `main` did not already contain those surfaces.
- Ask/Draw revenue audit scripts and Stripe readiness smoke script are not present on clean `main`; they were recorded as not available, not as failing runtime gates.

## Suggested Next Codex Instruction

Push `feat/tianji-divination-evidence-layer-clean-20260525`, open a clean PR to `main`, wait for remote checks, and keep production deploy blocked until Stripe test-mode paid smoke passes.

---

# Review Packet - TianJi Love Post-Merge Artifact Review and Day 1 Publishing

## Background

PR #58 merged into `main` at `5b9a3e53fec905efe675b8f856c108e7263e9cec`. The MiniMax draft pipeline, publishing pack, and conversion backlog are now on main. The remaining business task is artifact review plus Day 1 manual publishing readiness.

## Task Goal

Review generated/merged artifacts, score quality, prepare Day 1 publishing, and create the next conversion backlog. Do not deploy production, run Stripe checkout, run paid smoke, print secrets, or enable social auto-posting.

## Runtime Verification

```text
PR #58 merged: Go
Vercel: Go
Workflow present on main: Go
TianJi Love Conversion Suggestions run: 26374543902
Workflow conclusion: success
Artifact uploaded: Yes
Artifact id: 7188891555
Artifact body download: Blocked locally - GitHub auth required
```

## Artifact Scores

```text
KPI Analysis quality: C
Daily Growth quality: B
Content Calendar quality: B
Conversion Suggestions quality: B
```

Scoring is conservative because artifact zip body download requires authenticated GitHub access. The review used verified workflow metadata, merged script prompt contracts, checked-in `.ai/publishing` material, and local conversion backlog.

## Files Changed

```text
.ai/TIANJI_LOVE_ARTIFACT_REVIEW_20260525.md
.ai/TIANJI_LOVE_DAY1_PUBLISHING_PACKET_20260525.md
.ai/TIANJI_LOVE_NEXT_CONVERSION_BACKLOG_20260525.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Decisions

- Day 1 publishing should use “他现在到底在想什么？” because it is the strongest cold-traffic emotional hook and cleanly routes to `/relationship/new`.
- KPI Analysis is scored C until actual artifact body and real Day 1 metrics are available.
- Daily Growth and Content Calendar are scored B because they are directionally usable but require human platform polish.
- Conversion Suggestions is scored B because runtime/artifact upload are Go and the backlog is actionable, but the artifact body still needs authenticated download.
- Next implementation should be the P0 evidence layer / 准感 system plus analytics, not more workflow expansion.

## Commands Run

```text
git status --short
git branch --show-current
git fetch origin main
git log --oneline -5
git show --stat 5b9a3e53fec905efe675b8f856c108e7263e9cec
git switch -c chore/tianji-artifact-review-day1-20260525 origin/main
Get-ChildItem .github/workflows
rg workflow/search terms in .github/workflows
gh auth status
curl.exe GitHub workflow run metadata
curl.exe GitHub workflow job metadata
curl.exe GitHub artifact metadata
curl.exe artifact zip probe
rg relationship/CTA/conversion terms in .ai and src
```

## Validation Plan

```text
git diff --check
targeted secret-shape scan
```

Full npm build/test is not required for this doc-only branch; no app source, package, workflow, or runtime code is changed in this branch.

## Gate Status

```text
MiniMax draft pipeline: Go
Manual publishing pack: Go
Conversion backlog: Go
Artifact review: Go
Day 1 publishing packet: Go
Social auto-posting: No-Go
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Secrets printed: No
```

## Suggested Next Codex Instruction

Implement the P0 TianJi Love evidence layer / 准感 system and funnel analytics after Day 1 manual publishing has at least one traffic signal.

---

# Review Packet - TianJi Love Publishing Pack and Conversion Backlog

## Background

The MiniMax-backed KPI Analysis, Daily Growth, and Content Calendar workflows are verified Go with uploaded artifacts. The next business step is turning the pipeline into manual publishing and conversion work, while keeping social auto-posting, production deploy, Stripe checkout, and paid smoke disabled.

## Task Goal

Create a draft-only manual publishing pack and implementation-ready conversion backlog. Do not auto-post, deploy, run Stripe, run paid smoke, invent fake testimonials, invent fake metrics, or claim guaranteed relationship outcomes.

## Runtime State

```text
KPI Analysis workflow: Go
Daily Growth workflow: Go
Content Calendar workflow: Go
Conversion Suggestions workflow: Pending runtime after merge
Artifacts downloaded: No - GitHub artifact body download requires authenticated access
```

## Artifact Review

```text
KPI Analysis quality: Pending artifact body review
Daily Growth quality: Pending artifact body review
Content Calendar quality: Pending artifact body review
Conversion Suggestions quality: Pending runtime and artifact body review
```

Artifact metadata was verified, but reviewed artifact bodies were not copied because local `gh` is not authenticated and the artifact zip probe failed before content download. A status note was written to `.ai/publishing/source-artifacts/ARTIFACT_DOWNLOAD_STATUS.md`.

## Publishing Pack

```text
Xiaohongshu posts: Created - 7 drafts
Douyin scripts: Created - 5 drafts
WeChat Video scripts: Created - 5 drafts
Publish checklist: Created
Conversion backlog: Created
```

## Changed Files

```text
.ai/publishing/source-artifacts/ARTIFACT_DOWNLOAD_STATUS.md
.ai/publishing/xiaohongshu-posts.md
.ai/publishing/douyin-scripts.md
.ai/publishing/wechat-video-scripts.md
.ai/publishing/publish-checklist.md
.ai/publishing/conversion-backlog.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Content Decisions

- First publishing route priority is `/relationship/new`, with `/ask` as the low-price single-question intent route.
- Draft themes cover: 他现在到底在想什么, 你们还有没有缘分, 断联后他会不会回来, 暧昧对象是否认真, 复合概率测试, 今日爱情能量, 天机缘分测试.
- All drafts avoid fake testimonials, fake metrics, guaranteed reconciliation, guaranteed love outcomes, and supernatural certainty.
- Conversion backlog stays report-only and does not edit app code.

## Validation Plan

```text
git diff --check
targeted secret-shape scan
```

## Gate Status

```text
MiniMax draft pipeline: Go
Manual publishing pack: Go - draft only
Conversion backlog: Go - draft only
Social auto-posting: No-Go
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Secrets printed: No
```

## Risks And Follow-up

- Publishing drafts were produced from the approved TianJi Love content strategy, not from downloaded artifact bodies. Replace or refine after artifact download.
- Conversion Suggestions workflow still needs merge to `main`, manual dispatch, and artifact review.
- First implementation PR should be a P0 CTA/task only after at least one manual publishing signal is collected.

---

# Review Packet - TianJi Love MiniMax Growth Pipeline Phase 2

## Background

MiniMax API smoke and KPI Analysis had already moved to Go. This task verifies the remaining MiniMax-backed TianJi Love draft workflows, tightens generated content toward publishable/revenue-focused output, and adds a first conversion suggestion artifact without enabling code automation, deployment, Stripe, or social posting.

## Task Goal

Complete runtime verification for Daily Growth and Content Calendar, review artifact availability, improve prompts for content quality, and add a draft-only `TianJi Love Conversion Suggestions` artifact workflow.

## Runtime Verification

```text
MiniMax API Smoke: Go
TianJi Love KPI Analysis: Go - run 26361421145
TianJi Love Daily Growth: Go - run 26361417380
TianJi Love Content Calendar: Go - run 26361415667
Artifacts uploaded: Yes
```

## Artifact Review

```text
KPI Analysis artifact: Go - tianji-love-kpi-analysis, id 7185793229, not expired
Daily Growth artifact: Go - tianji-love-daily-growth, id 7185824316, not expired
Content Calendar artifact: Go - tianji-love-content-calendar, id 7185823452, not expired

KPI Analysis body quality: Blocked - artifact zip download requires authenticated GitHub access
Daily Growth body quality: Blocked - artifact zip download requires authenticated GitHub access
Content Calendar body quality: Blocked - artifact zip download requires authenticated GitHub access
```

## Changed Files

```text
.github/workflows/tianji-love-conversion-suggestions.yml
package.json
scripts/tianji-love/generate-content-calendar.mjs
scripts/tianji-love/generate-conversion-suggestions.mjs
scripts/tianji-love/generate-daily-growth.mjs
scripts/tianji-love/generate-kpi-analysis.mjs
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Diff Summary

- Strengthened Daily Growth prompt to require Xiaohongshu, Douyin, and WeChat Channels drafts, concrete channel actions, TianJi Love CTAs, product entry mapping, and no fake/guaranteed claims.
- Strengthened Content Calendar prompt to require 7-day channel-specific publishable outlines, product entries, conversion goals, and safer Chinese growth themes.
- Strengthened KPI Analysis prompt to identify funnel money leaks and route-level conversion recommendations.
- Added `generate-conversion-suggestions.mjs` to create `.ai/generated/tianji-love-conversion-suggestions.md` from `.ai/generated/tianji-love-kpi-analysis.md` when present, with a fallback to known growth direction when absent.
- Added `tianji:conversion-suggestions` npm script and an artifact-only GitHub workflow.

## Commands Run

```text
Read workspace AGENTS.md, PROJECT_CONTEXT.md, DECISIONS.md, TASKS.md, MODEL_ROUTING.md
Read target AGENTS.md, package.json, growth scripts, and workflow files
git status --short --branch
curl.exe -L https://api.github.com/repos/yihui315/tianji-global/actions/workflows
curl.exe -L workflow run lists for KPI Analysis, Daily Growth, and Content Calendar
curl.exe -L artifact metadata for the three successful runs
gh workflow list --repo yihui315/tianji-global --limit 50
gh auth login -h github.com --web --scopes repo,workflow
curl.exe -L artifact zip download probe
node --check scripts/ai/minimax-chat.mjs
node --check scripts/tianji-love/generate-content-calendar.mjs
node --check scripts/tianji-love/generate-daily-growth.mjs
node --check scripts/tianji-love/generate-kpi-analysis.mjs
node --check scripts/tianji-love/generate-conversion-suggestions.mjs
node package.json parse
python YAML parse for .github/workflows/tianji-love-*.yml
git diff --check
rg secret-shape scans
```

## Validation Result

```text
Script syntax checks: Pass
package.json parse: Pass
YAML parse: Pass, 5 TianJi Love workflow files
git diff --check: Pass
Targeted secret-shape scan: Pass - only intentional redaction regex matched
Full repo secret-shape scan: Informational false positives in README placeholders and ordinary hyphenated English words
```

## Gate Status

```text
MiniMax API runtime: Go
TianJi Love draft pipeline: Go
Conversion suggestions artifact workflow: Prepared
Auto website code changes from KPI: Not enabled
OpenAI API runtime: Bypassed
Codex Action dependency in TianJi workflows: Removed
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

## Risks And Follow-up

- Local `gh` remains unauthenticated, so artifact body download and exact A/B/C/D content scoring are still pending authenticated GitHub access.
- The conversion suggestions workflow reads `.ai/generated/tianji-love-kpi-analysis.md` when present; on a clean GitHub checkout it falls back to the known growth direction because prior workflow artifacts are not automatically present.
- After merge, run `TianJi Love Conversion Suggestions` manually and review the artifact before turning recommendations into code PRs.
- Manual publishing remains required; social auto-posting stays No-Go.

## Suggested Next Codex Instruction

After authenticating GitHub artifact access, download the three generated artifacts, score each A-D, and if at least B quality, create the first manual publishing pack plus a separate implementation task for the top 3 conversion suggestions.

---

# Review Packet - TianJi Love GitHub Actions Codex Input Fix

## Background

The post-merge TianJi Love Content Calendar workflow failed before content generation because `openai/codex-action@v1` rejected the input name `openai_api_key`. The action expects `openai-api-key`.

## Task Goal

Fix all TianJi Love GitHub automation workflows that call Codex Action, then apply the same input-key correction to the existing Codex Action workflows so the required repository-wide scan has zero `openai_api_key` matches. Do this without changing production, payment, social publishing, secrets, or application source.

## Changed Files

```text
.github/workflows/tianji-love-daily-growth.yml
.github/workflows/tianji-love-kpi-analysis.yml
.github/workflows/tianji-love-content-calendar.yml
.github/workflows/codex-self-evolution.yml
.github/workflows/codex-self-upgrade.yml
.github/workflows/relationship-ab-evolution.yml
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## Key Diff Summary

- Replaced `openai_api_key` with `openai-api-key` in the three TianJi Love workflows that call `openai/codex-action@v1`.
- Replaced the same invalid input in `codex-self-evolution.yml`, `codex-self-upgrade.yml`, and `relationship-ab-evolution.yml` so `rg -n "openai_api_key" .github/workflows` returns zero matches.
- Left `tianji-love-safety-audit.yml` unchanged because it does not call Codex Action.
- Updated AI records with the root cause, validation, gate status, and follow-up.

## Main Design Decisions

- Work was done in an isolated git worktree from latest `origin/main` because the original `tianji-global` checkout has unrelated dirty changes.
- Only the invalid action input name was changed.
- No app source was changed.
- No dependencies were added.
- No `.env`, secret, production config, Stripe, Supabase, deployment, provider live call, or server files were read or changed.
- The Node 20 warning was recorded as follow-up only; it was not the failure cause.

## Commands Run

```text
git -c safe.directory=* -C tianji-global fetch origin main
git -c safe.directory=* -C tianji-global worktree add tianji-global-fix-actions-codex-input-20260524 -b fix/tianji-github-actions-codex-input-20260524 origin/main
Read AGENTS.md, package.json, and all four TianJi Love workflow files
rg -n "openai_api_key|openai-api-key|OPENAI_API_KEY" .github/workflows
git status --short
rg -n "openai_api_key" .github/workflows
rg -n "openai-api-key" .github/workflows
git diff --check
python -c "import pathlib, yaml; files=sorted(pathlib.Path('.github/workflows').glob('*.yml')); [yaml.safe_load(p.read_text(encoding='utf-8')) for p in files]; print('parsed=' + str(len(files)))"
PowerShell targeted secret-shape scan over changed workflow and AI evidence files
```

## Validation Result

```text
git status --short: Pass - only intended workflow and AI evidence files changed
rg -n "openai_api_key" .github/workflows: Pass - zero matches
rg -n "openai-api-key" .github/workflows: Pass - six Codex Action call sites
git diff --check: Pass
workflow YAML parse: Pass - parsed 11 workflow files
targeted secret-shape scan: Pass - no token/key material found outside intentional workflow regex guard strings
```

## Root Cause

```text
Workflow uses: openai_api_key
Codex Action expects: openai-api-key
```

## Gate Status

```text
Content Calendar workflow input fix: Go
Daily Growth workflow input fix: Go
KPI Analysis workflow input fix: Go
Existing Codex workflow input fix: Go
Safety Audit workflow: Not changed - no Codex Action input
Secrets printed: No
Production deploy: Not run
Stripe checkout execution: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
```

## Risks

- After this fix, the next likely workflow blocker is missing or insufficient `OPENAI_API_KEY` repository secret/config.
- GitHub's Node.js 20 action deprecation warning remains a follow-up and was not addressed in this narrow fix.
- Re-run `TianJi Love Content Calendar` manually on branch `main` after merge.

## Questions For Brain Review

- Should the Node 20 warning be handled in a separate workflow maintenance task after this fix lands?

## Suggested Next Codex Instruction

Merge `fix/tianji-github-actions-codex-input-20260524`, then manually re-run `TianJi Love Content Calendar` on branch `main`.

---

# Review Packet - GitHub Actions Codex Input Fix Merge/Runtime Verification

## Background

PR #50 merged the Codex Action input fix into `main`. This packet records the post-merge validation and the runtime verification boundary.

## Merge Result

```text
Branch: fix/tianji-github-actions-codex-input-20260524
PR: https://github.com/yihui315/tianji-global/pull/50
PR check CI/CD: Pass
Merge method: squash
Merge commit: 43a1ceac882b6bbb623d5cd6953593e4160fe65b
Remote fix branch: Deleted after merge
```

## Files Verified

```text
.github/workflows/codex-self-evolution.yml
.github/workflows/codex-self-upgrade.yml
.github/workflows/relationship-ab-evolution.yml
.github/workflows/tianji-love-content-calendar.yml
.github/workflows/tianji-love-daily-growth.yml
.github/workflows/tianji-love-kpi-analysis.yml
```

## Commands Run

```text
git -c safe.directory=* fetch origin main
git -c safe.directory=* fetch origin fix/tianji-github-actions-codex-input-20260524
git -c safe.directory=* status --short --branch
git -c safe.directory=* log --oneline -5
rg -n "openai_api_key" .github/workflows
rg -n "openai-api-key" .github/workflows
git -c safe.directory=* diff --check
python workflow YAML parse for .github/workflows/*.yml
PowerShell targeted secret-shape scan over changed workflow and AI evidence files
GitHub connector create PR #50
GitHub connector fetch PR run status
GitHub connector squash merge PR #50
git -c safe.directory=* push origin --delete fix/tianji-github-actions-codex-input-20260524
git -c safe.directory=* switch main
git -c safe.directory=* pull --ff-only origin main
curl.exe -L https://api.github.com/repos/yihui315/tianji-global/actions/workflows
curl.exe -L workflow run lists for TianJi Love Content Calendar, Daily Growth, and KPI Analysis
gh auth status
gh workflow list
gh secret list
unauthenticated REST workflow_dispatch probe
GitHub connector fetch failed job steps/logs for pre-fix Content Calendar and Daily Growth runs
```

## Validation Result

```text
openai_api_key in .github/workflows: 0 matches
openai-api-key in .github/workflows: 6 matches
git diff --check: Pass
Workflow YAML parse: Pass, 11 workflow files parsed
Secret-shape scan: Pass
Secrets printed: No
main contains merge commit: 43a1ceac882b6bbb623d5cd6953593e4160fe65b
```

## Runtime Verification

```text
OPENAI_API_KEY repo secret: Unknown by direct listing because gh CLI is not authenticated; prior failed logs showed the input value masked as ***, so the secret is likely present

TianJi Love Content Calendar: Blocked for a new main rerun
TianJi Love Daily Growth: Blocked for a new main rerun
TianJi Love KPI Analysis: Blocked for a new main rerun
```

The runtime block is local GitHub authorization, not the workflow input fix:

```text
gh auth status: Not logged in
GH_TOKEN: Missing
GITHUB_TOKEN: Missing
gh workflow list: blocked by gh auth
gh secret list: blocked by gh auth
workflow_dispatch REST probe: 401 Requires authentication
```

## Prior Failed Run Diagnosis

The previous `main` workflow_dispatch runs were on commit `91d1049590b79792d6d5ffd31c128f59c7fa0348`, before PR #50 merged.

```text
TianJi Love Content Calendar run 26356551158: failed in Codex Action step due openai_api_key
TianJi Love Daily Growth run 26356559331: failed in Codex Action step due openai_api_key
TianJi Love KPI Analysis: no main run found
Node.js 20 warning: Warning only in inspected pre-fix logs
```

## Gate Status

```text
Codex Action input fix: Go
PR merge: Go
Content Calendar rerun: Blocked - workflow_dispatch requires authenticated GitHub CLI/API
Daily Growth rerun: Blocked - workflow_dispatch requires authenticated GitHub CLI/API
KPI Analysis rerun: Blocked - workflow_dispatch requires authenticated GitHub CLI/API
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

## Risks And Follow-up

- Revoke/rotate the previously pasted GitHub token immediately.
- Authenticate `gh` with `repo,workflow` scope, then run the three workflow_dispatch jobs on `main`.
- If the next authenticated run fails because `OPENAI_API_KEY` is missing or unauthorized, configure or rotate the repo secret without printing it.
- Treat Node.js 20 as a warning unless it becomes the actual failing step.

---

# Review Packet - TianJi Love Actions Runtime Rerun After Codex Input Fix

## Background

PR #50 fixed the Codex Action input name and PR #51 recorded the initial post-merge verification boundary. This packet records the authenticated main rerun and the next runtime blocker.

## Main State Verified

```text
Input fix merge commit: 43a1cea
Runtime verification docs merge commit: 608c476
openai_api_key in .github/workflows: 0 matches
openai-api-key in .github/workflows: 6 matches
```

## Dispatch Result

```text
Local gh authentication: No-Go - gh CLI not authenticated
Authenticated workflow_dispatch: Go via GitHub Actions UI
TianJi Love Content Calendar dispatch: Sent
TianJi Love Daily Growth dispatch: Sent
TianJi Love KPI Analysis dispatch: Sent
```

## Runs Reviewed

```text
TianJi Love Content Calendar run: 26357694312
TianJi Love Content Calendar job: 77587333478

TianJi Love Daily Growth run: 26357686684
TianJi Love Daily Growth job: 77587313730

TianJi Love KPI Analysis run: 26357691510
TianJi Love KPI Analysis job: 77587325631
```

## Failure Diagnosis

The old hard failure is resolved:

```text
Unexpected input(s) 'openai_api_key': Not observed in new main runs
openai-api-key input accepted by Codex Action: Yes
```

The new blocker is OpenAI API key readiness:

```text
TianJi Love Content Calendar: Failed in Codex Action runtime with 401 invalid_api_key
TianJi Love Daily Growth: Failed in Codex Action runtime with 401 invalid_api_key
TianJi Love KPI Analysis: Failed in Codex Action runtime with 401 invalid_api_key
OPENAI_API_KEY repo secret: Present but invalid or unauthorized
```

The inspected logs showed the OpenAI key input masked by GitHub Actions. No secret value or key fragment was recorded in this packet.

## Node Runtime

```text
Node.js 20 warning: Warning only
Blocking failure source: OpenAI 401 invalid_api_key
```

## Commands And Evidence Sources

```text
gh auth status
gh auth login -h github.com --web --scopes repo,workflow
gh auth login -h github.com --web --clipboard --scopes repo,workflow
Get-CimInstance Win32_Process -Filter "name = 'gh.exe'"
Stop-Process for hung gh auth login processes
git -c safe.directory=* status --short --branch
git -c safe.directory=* log --oneline -5
rg -n "openai_api_key" .github/workflows
rg -n "openai-api-key" .github/workflows
Start-Process GitHub Actions workflow pages
GitHub connector fetch workflow job steps/logs
```

## Safety Result

```text
Secrets printed: No
Token values printed: No
.env read: No
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
```

## Gate Status

```text
Codex Action input fix: Go
Workflow templates on main: Go
Authenticated workflow_dispatch: Go via GitHub UI
Local gh workflow_dispatch: No-Go - gh CLI not authenticated
Content Calendar runtime: No-Go - invalid OpenAI API key
Daily Growth runtime: No-Go - invalid OpenAI API key
KPI Analysis runtime: No-Go - invalid OpenAI API key
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
GitHub token rotation: Owner action required
```

## Risks And Follow-up

- Revoke/rotate the previously pasted GitHub token.
- Replace or rotate the `OPENAI_API_KEY` repository secret without printing it.
- Re-run the three TianJi Love workflows on `main` after the OpenAI secret is replaced.
- Keep Node.js 20 as a tracked warning; only treat it as No-Go if it becomes the failing step.

---

# Review Packet - TianJi Love MiniMax Workflow Replacement

## Background

The previous authenticated rerun proved that the Codex Action input fix was correct, but all three TianJi Love growth/KPI workflows failed at OpenAI runtime with `401 invalid_api_key`. This packet records the replacement path: remove Codex Action from those workflows and use MiniMax OpenAI-compatible Chat Completions through local scripts.

## Current Behavior Before Change

```text
TianJi Love Content Calendar: openai/codex-action@v1 with OPENAI_API_KEY
TianJi Love Daily Growth: openai/codex-action@v1 with OPENAI_API_KEY
TianJi Love KPI Analysis: openai/codex-action@v1 with OPENAI_API_KEY
Generated content mode: direct repository mutation and commit
Workflow permission: contents: write
Runtime blocker: OpenAI 401 invalid_api_key
```

## New Behavior

```text
GitHub Actions
-> npm script
-> scripts/ai/minimax-chat.mjs
-> MiniMax /v1/chat/completions
-> .ai/generated/*.md
-> actions/upload-artifact@v4
```

The workflows are artifact-only and use `permissions: contents: read`.

## Files Changed

```text
.github/workflows/tianji-love-content-calendar.yml
.github/workflows/tianji-love-daily-growth.yml
.github/workflows/tianji-love-kpi-analysis.yml
package.json
scripts/ai/minimax-chat.mjs
scripts/tianji-love/generate-content-calendar.mjs
scripts/tianji-love/generate-daily-growth.mjs
scripts/tianji-love/generate-kpi-analysis.mjs
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

## MiniMax Contract

```text
API style: OpenAI-compatible Chat Completions
Endpoint: POST /v1/chat/completions
Default base URL: https://api.minimaxi.com/v1
Token Plan URL source: MiniMax M2.7 OpenAI-compatible Token Plan docs
Default model: MiniMax-M2.7
Token limit field: max_completion_tokens
Required secret: MINIMAX_API_KEY
Optional secret/config: MINIMAX_BASE_URL
Optional secret/config: MINIMAX_MODEL
```

## Validation

```text
node --check scripts/ai/minimax-chat.mjs: Pass
node --check scripts/tianji-love/generate-content-calendar.mjs: Pass
node --check scripts/tianji-love/generate-daily-growth.mjs: Pass
node --check scripts/tianji-love/generate-kpi-analysis.mjs: Pass
package.json parse: Pass
npm ci: Timed out locally after 10 minutes
npm ci --ignore-scripts --no-audit --no-fund: Pass
npm run typecheck: Pass
npm run lint: Pass
git diff --check: Pass
TianJi Love workflow YAML parse: Pass
TianJi Love workflows Codex/OpenAI dependency scan: 0 matches
Targeted secret-shape scan: Pass
```

## Local Runtime

```text
npm run tianji:content-calendar: Blocked locally - MINIMAX_API_KEY is missing
npm run tianji:daily-growth: Blocked locally - MINIMAX_API_KEY is missing
npm run tianji:kpi-analysis: Blocked locally - MINIMAX_API_KEY is missing
```

This is expected fail-closed behavior. No API key or token value was printed.

## Safety Result

```text
Secrets printed: No
Token values printed: No
.env read: No
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Auto-commit generated content: Removed
Workflow permissions: contents: read
```

## Gate Status

```text
OpenAI Codex Action dependency removed from TianJi Love workflows: Go
MiniMax artifact workflow templates: Go
MiniMax runtime on GitHub: Pending repo secrets
Content Calendar MiniMax runtime: Pending
Daily Growth MiniMax runtime: Pending
KPI Analysis MiniMax runtime: Pending
Social auto-posting: No-Go
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Secrets printed: No
GitHub token rotation: Owner action required
```

## Risks And Follow-up

- Repository owner must configure `MINIMAX_API_KEY`, `MINIMAX_BASE_URL`, and `MINIMAX_MODEL` in GitHub Actions secrets before runtime can pass.
- After merge and secret configuration, manually dispatch the three workflows on `main` and inspect artifact outputs.
- Revoke/rotate the previously pasted GitHub token.
- Keep generated marketing output in artifact review mode until a separate publisher bridge is approved.

---

# Review Packet - TianJi Love MiniMax Runtime Verification

## Background

PR #53 moved the three TianJi Love growth/KPI workflows from Codex Action to MiniMax-backed project scripts. MiniMax GitHub Actions secrets were configured, then the three workflows were manually dispatched on `main`.

## Main Commit

```text
95f354a fix(actions): run TianJi growth workflows on MiniMax API
```

## Runs Reviewed

```text
TianJi Love Content Calendar run: 26361415667
TianJi Love Content Calendar job: 77597470019

TianJi Love Daily Growth run: 26361417380
TianJi Love Daily Growth job: 77597474090

TianJi Love KPI Analysis run: 26361421145
TianJi Love KPI Analysis job: 77597484443
```

## Runtime Verification

```text
TianJi Love Content Calendar: Fail - MiniMax HTTP 429 rate_limit_error
TianJi Love Daily Growth: Fail - MiniMax HTTP 429 rate_limit_error
TianJi Love KPI Analysis: Fail - MiniMax HTTP 429 rate_limit_error
Expected artifacts uploaded: No
MiniMax API runtime: No-Go - quota/rate limit
```

The workflows reached the MiniMax-backed script route:

```text
Checkout: Pass
Setup Node: Pass
npm ci: Pass
Generate draft step: Fail at MiniMax API call
Upload artifact: Skipped
```

## Failure Classification

```text
401 / 403: Not observed
404 model not found: Not observed
404 endpoint: Not observed
429 / quota: Observed
artifact missing: Consequence of failed generation step
npm ci fail: Not observed
YAML fail: Not observed
```

The MiniMax response reported a 5-hour Token Plan Plus usage limit and a reset at `2026-05-25T00:00:00+08:00`.

## Safety Result

```text
Secrets printed: No
Token values printed: No
.env read: No
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Artifact-only verification: Yes
```

## Gate Status

```text
MiniMax GitHub Secrets: Go
TianJi workflow MiniMax migration: Go
OpenAI API runtime: Bypassed
Codex Action dependency in TianJi workflows: Removed
Content Calendar runtime: No-Go - MiniMax quota/rate limit
Daily Growth runtime: No-Go - MiniMax quota/rate limit
KPI Analysis runtime: No-Go - MiniMax quota/rate limit
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

## Risks And Follow-up

- Retry after the MiniMax quota reset time.
- If 429 persists after reset, verify MiniMax token plan quota or switch to a model/plan with usable quota.
- Artifacts were not produced because generation failed before upload.
- Keep social auto-posting and production deploy disabled.

---

# Review Packet - TianJi Love MiniMax Token Plan Default Alignment

## Background

The MiniMax M2.7 Token Plan docs list the OpenAI-compatible Base URL as `https://api.minimaxi.com/v1`, model `MiniMax-M2.7` or `MiniMax-M2.7-highspeed`, and endpoint `POST /v1/chat/completions`.

## What Changed

Updated the TianJi Love MiniMax client default Base URL to:

```text
https://api.minimaxi.com/v1
```

The script still reads `MINIMAX_BASE_URL` when provided, but the fail-closed default now matches the Token Plan docs.

## Runtime Interpretation

The latest failed GitHub Actions runs already reached MiniMax and returned:

```text
HTTP 429 rate_limit_error
5-hour Token Plan Plus usage limit reached
```

That means the current remaining blocker is Token Plan quota/usage availability. It is not `npm ci`, not missing `MINIMAX_API_KEY`, not a model 404, not an endpoint 404, and not the Node.js 20 warning.

## Gate Status

```text
MiniMax M2.7 Token Plan API config: Go
Default Base URL alignment: Go
MiniMax runtime: No-Go - prior run blocked by 429 quota/rate limit
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

---

# Review Packet - MiniMax API Smoke Workflow

## Background

The TianJi Love growth workflows reached MiniMax but failed with `HTTP 429 rate_limit_error`. A smaller smoke workflow is needed to isolate GitHub Actions runner, secrets, Base URL, model, and Token Plan key connectivity from the longer generation jobs.

## What Changed

Added `.github/workflows/minimax-api-smoke.yml`.

```text
Workflow: MiniMax API Smoke
Trigger: workflow_dispatch only
Permissions: contents: read
Request: tiny /chat/completions call
Prompt: Reply with exactly: OK
temperature: 0
max_completion_tokens: 20
Secrets printed: No
```

## Validation

```text
node --check scripts/ai/minimax-chat.mjs: Pass
YAML parse: Pass
git diff --check: Pass
Targeted secret-shape scan: Pass
Live MiniMax API call: Not run locally
```

## Gate Status

```text
MiniMax API smoke workflow: Prepared
MiniMax API smoke runtime: Pending manual dispatch on main
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

## Follow-up

- Merge this workflow to `main`.
- Manually run `MiniMax API Smoke` on `main`.
- If it returns `MiniMax API smoke: PASS`, run only `TianJi Love KPI Analysis` next.
