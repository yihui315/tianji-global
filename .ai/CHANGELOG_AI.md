# AI Changelog

## 2026-05-26 - PR #67 owner Vercel ack gate

### What changed

Recorded the final owner Vercel acknowledgement gate for PR #67. GitHub connector still reports PR #67 as open and mergeable at head `304b675654c54b8c958f8ad3130928b2cb79f0b0`, but Vercel remains failed and no owner rerun/log acknowledgement has been provided in this task. No workflow or business code was changed.

### Validation

```text
PR #67 state: open
PR #67 mergeable: true
PR #67 head: 304b675654c54b8c958f8ad3130928b2cb79f0b0
Vercel status: failure
Owner acknowledgement: No
Production deploy: Not run
Paid smoke: Not run
Social auto-posting: Not run
```

### Gate status

```text
PR #67 merge readiness: Conditional Go
Vercel failure: Unknown
Owner acknowledgement: No
Manual-first enforcement: Go
Production deploy: No-Go
Paid smoke: No-Go
Social auto-posting: No-Go
```

## 2026-05-26 - PR #67 Vercel failure triage and PR #60 cleanup

### What changed

Triaged the failing Vercel status on PR #67 without reading secrets or deploying. Local validation confirms the manual-first workflow changes remain valid: both target workflows retain `workflow_dispatch` and have no active `schedule` or `cron` keys. Public Vercel status only exposes a failed check and overview page; deployment metadata/log details require Vercel authentication, so merge readiness remains Conditional Go pending owner rerun or private log review. Added a superseded comment to PR #60 through the GitHub connector.

### Files changed

```text
.ai/TIANJI_LOVE_PR67_VERCEL_TRIAGE_20260526.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
.ai/TASKS.md
.ai/AUTOPILOT_STATUS.json
.ai/AUTOPILOT_REPORT.md
```

### Validation

```text
PR #67 metadata via GitHub connector: Open, mergeable
PR #67 Vercel status: Failure
origin/main Vercel status: Success
Vercel public dashboard: overview page only, no public build error summary
Vercel public deployment API: 403 without auth token
Vercel public events API: 404
JSON status parse: Pass
YAML parse: Pass for both changed workflows
Trigger audit: Pass, no schedule or cron keys remain in the two changed workflows
workflow_dispatch audit: Pass, retained in both changed workflows
Requested .ai plus workflow secret-pattern scan: 2 redacted matches in pre-existing 20260525 evidence docs
Current changed-file secret-pattern scan: Pass, no matches
YiHui ValidateLight: Pass via restricted MCP
npm build/test: Not run
```

### Gate status

```text
PR #67 merge readiness: Conditional Go
Vercel failure: Unknown
Manual-first enforcement: Go
PR #60 cleanup: Done
Production deploy: No-Go
Paid smoke: No-Go
Social auto-posting: No-Go
```

## 2026-05-26 - TianJi Love automation manual-first enforcement

### What changed

Created a clean PR branch from `origin/main@1c188ff0b062b28952f25b785f4fd1ad66465b72` and disabled active scheduled triggers for the two TianJi Love content-generation workflows. Both workflows retain manual `workflow_dispatch` so the first supervised week can use owner-run, reviewable artifact generation instead of unattended scheduled runs.

### Files changed

```text
.github/workflows/tianji-love-content-calendar.yml
.github/workflows/tianji-love-daily-growth.yml
.ai/TIANJI_LOVE_AUTOMATION_MANUAL_FIRST_ENFORCEMENT_20260526.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
.ai/TASKS.md
.ai/AUTOPILOT_STATUS.json
.ai/AUTOPILOT_REPORT.md
```

### Validation

```text
JSON status parse: Pass
YAML parse: Pass for both changed workflows
Trigger audit: Pass, no schedule or cron keys remain in the two changed workflows
workflow_dispatch audit: Pass, retained in both changed workflows
Requested .ai plus workflow secret-pattern scan: 2 redacted matches in pre-existing 20260525 evidence docs, not in this task's changed files
Changed-file secret-pattern scan: Pass, no matches
YiHui ValidateLight: Pass via restricted MCP
```

### Gate status

```text
Manual-first enforcement PR: Go
Content calendar schedule: Disabled
Daily growth schedule: Disabled
workflow_dispatch retained: Go
Production deploy: No-Go
Paid smoke: No-Go
Social auto-posting: No-Go
```

## 2026-05-25 - TianJi Love prelaunch paid funnel hardening

### What changed

Created a clean worktree from latest `origin/main` after confirming PR #63 content is already present in repository truth. Added the exact checkout-start analytics event, Relationship UUID checkout guard, safe blocked relationship analytics, webhook metadata validation, readiness-script app-side checks, focused tests, and final prelaunch Go/No-Go evidence docs.

### Files changed

```text
src/lib/analytics/funnel-events.ts
src/lib/analytics/client.ts
src/lib/analytics/relationship-events.ts
src/lib/trust-copy-guard.ts
src/lib/reading-id.ts
src/lib/stripe-checkout-metadata.ts
src/lib/relationship-reading-store.ts
src/components/divination/DivinationEvidenceCard.tsx
src/components/relationship/RelationshipResult.tsx
src/app/(main)/ask/page.tsx
src/app/(main)/draw/page.tsx
src/app/api/analytics/relationship/route.ts
src/app/api/checkout/route.ts
src/app/api/stripe/webhook/route.ts
scripts/smoke-stripe-test-readiness.mjs
src/__tests__/prelaunch-paid-funnel-contract.test.ts
.ai/TIANJI_LOVE_PRELAUNCH_PAID_FUNNEL_FIX_20260525.md
.ai/TIANJI_LOVE_PRELAUNCH_GO_NO_GO_20260525.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

### Validation

```text
gh pr view 63: Blocked locally - gh unauthenticated
Repository truth for PR #63: Go - origin/main contains 6bbcc22 via 3b8be51
npm ci --ignore-scripts --no-audit --prefer-offline: Pass
Targeted tests: Pass, 4 files / 19 tests
npm run typecheck: Pass
npm run lint: Pass, Next.js lint deprecation warning only
npm run test: Pass, 49 files / 479 tests
npm run build: Pass, existing jose Edge Runtime warnings only
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
npm run smoke:stripe:test-readiness: Pass command exit, reports Blocked because test env is missing
npm run smoke:stripe:test-readiness -- --strict: Blocked as expected because Stripe/Supabase test env is missing
Puppeteer Browser QA on /ask, /draw, /tarot, /relationship/new: Pass
```

### Gate status

```text
PR #63 merged: Go
checkout_start_from_free_preview implemented: Go
Ask checkout-start analytics: Go
Draw checkout-start analytics: Go
Relationship checkout-start analytics: Go
Relationship UUID guard: Go
Relationship rel_* fallback blocked: Go
Webhook metadata validation: Go
Entitlement readiness: Partial
Stripe test env readiness: Blocked
Supabase staging UUID persistence: Blocked
Strict readiness: Blocked
Typecheck: Go
Lint: Go
Tests: Go
Build: Go
Audits: Go
Browser QA: Go
Production deploy: Not run
Stripe live mode: Not run
Paid smoke: No-Go unless test-mode checkout actually ran
Secrets printed: No
Formal traffic / Day 1 publishing: No-Go unless paid smoke Go
```

### Follow-up

- Configure masked Stripe test-mode env.
- Configure Supabase staging persistence and prove Relationship UUID readings.
- Run strict readiness and real test-mode paid smoke for Relationship, Ask, and Draw.
- Keep production deploy and Day 1 formal traffic blocked until paid smoke is Go.

## 2026-05-25 - TianJi Love paid funnel test readiness after evidence layer

### What changed

Merged PR #62 first, then created an isolated readiness worktree from latest `origin/main`. Added a safe Stripe test-readiness script and evidence docs for Ask, Draw, and Relationship paid funnel readiness without running live Stripe, production deploy, real `.env` reads, paid checkout, or webhook replay.

### Files changed

```text
package.json
scripts/smoke-stripe-test-readiness.mjs
.ai/TIANJI_LOVE_PAID_FUNNEL_TEST_READINESS_20260525.md
.ai/TIANJI_LOVE_PAID_FUNNEL_SMOKE_PLAN_20260525.md
.ai/CHANGELOG_AI.md
.ai/REVIEW_PACKET.md
```

### Validation

```text
GitHub connector merge PR #62: Pass, merged sha 271dcd84bbed5b47ecea40b628685a66d34bd954
node --check scripts/smoke-stripe-test-readiness.mjs: Pass
npm run smoke:stripe:test-readiness: Pass, reports Blocked because test env is missing
npm ci --ignore-scripts --no-audit --no-fund: Pass
npm run typecheck: Pass
npm run lint: Pass, Next.js lint deprecation warning only
npm run test: Pass, 48 files / 473 tests
npm run build: Pass, jose Edge Runtime warnings only
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
Puppeteer non-paid browser QA on /ask, /draw, /relationship/new: Pass
```

### Gate status

```text
PR #62 merged: Go
Ask evidence/CTA/checkout-start readiness: Go static, paid completion Blocked
Draw evidence/CTA/checkout-start readiness: Go static, paid completion Blocked
Relationship evidence/CTA/checkout-start readiness: Go static, paid completion Blocked
Stripe test env readiness: Blocked
Webhook/entitlement test-mode: Not run
Analytics privacy: Go
Production deploy: Not run
Stripe live mode: Not run
Secrets printed: No
```

### Follow-up

- Provide masked Stripe test-mode env and run `npm run smoke:stripe:test-readiness -- --strict`.
- Prove Relationship persists a UUID reading in Supabase staging before checkout.
- Run Stripe test-mode checkout/webhook/entitlement smoke in a narrow follow-up PR.
- Keep Day 1 formal traffic blocked until test-mode paid funnel passes.

## 2026-05-25 - TianJi Love Divination Evidence Layer clean narrow PR

### What changed

Recreated the TianJi Love Divination Evidence Layer from latest `origin/main` on a clean worktree branch, avoiding PR #60's broad 53-commit / 325-file diff. The clean branch reapplies only the Evidence Layer implementation, its direct Ask/Draw/Relationship dependencies, focused tests, local QA evidence, required docs, and four referenced Tianji Love visual assets.

### Branch

```text
Branch: feat/tianji-divination-evidence-layer-clean-20260525
Base: origin/main cb12208
Old PR #60: Not merged
Old source commit referenced: 7333e68fbd3e0891051deb8cd2b420d2557f4dda
Changed files before docs append: 47
Production deploy: Not run
Paid smoke: No-Go
```

### Validation

```text
npm run typecheck: Pass
npm run lint: Pass
focused Evidence/Ask/Draw/Relationship tests: Pass, 5 files / 24 tests
npm run test: Pass, 48 files / 473 tests
npm run build: Pass
npm run audit:routes: Pass
npm run audit:copy: Pass
npm run audit:share: Pass
npm run audit:upgrade: Pass
git diff --check: Pass, CRLF warnings only
targeted secret scan over changed files: Pass
```

### Local QA

```text
/ask?lang=en: Go
/draw?lang=en: Go
/relationship/new?lang=en: Go
Evidence card: Go
Feedback event trigger: Go
Analytics private sentinel leakage: 0 detected
Mobile horizontal overflow: 0 detected
```

### Gate status

```text
Divination Evidence Layer implementation: Go
Clean narrow PR recreation: Go
Non-paid local QA: Go
Paid smoke: No-Go - not approved / not run
Production deploy: No-Go
Secrets printed: No
```

## 2026-05-25 - TianJi Love post-merge artifact review and Day 1 publishing packet

### What changed

Completed the post-merge quality loop after PR #58. Verified the conversion suggestions workflow runtime on `main`, recorded artifact availability, reviewed the publishing/conversion assets, created a polished Day 1 manual publishing packet, and created the next conversion implementation backlog.

### Runtime status

```text
PR #58 merged: Go
Merge commit: 5b9a3e53fec905efe675b8f856c108e7263e9cec
Vercel: Go
Workflow present on main: Go
TianJi Love Conversion Suggestions: Go
Conversion Suggestions run: 26374543902
Conversion Suggestions artifact: tianji-love-conversion-suggestions / 7188891555
Artifact body download: Blocked locally - GitHub auth required
```

### Artifact quality

```text
KPI Analysis quality: C
Daily Growth quality: B
Content Calendar quality: B
Conversion Suggestions quality: B
```

Scores are conservative because artifact zip body download requires authenticated GitHub access in this shell. Review used verified metadata, merged prompt contracts, checked-in publishing assets, and local conversion backlog.

### Outputs

```text
.ai/TIANJI_LOVE_ARTIFACT_REVIEW_20260525.md: Created
.ai/TIANJI_LOVE_DAY1_PUBLISHING_PACKET_20260525.md: Created
.ai/TIANJI_LOVE_NEXT_CONVERSION_BACKLOG_20260525.md: Created
```

### Gate status

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

### Follow-up

- Manually publish the Day 1 Xiaohongshu post only after final human review in the platform editor.
- Track profile visits, website clicks, comments, and paid-intent signals in `.ai/publishing/publish-checklist.md`.
- Download artifact bodies with authenticated GitHub access and update scores if the actual generated content differs.
- Next implementation task should be the P0 evidence layer / 准感 system plus funnel analytics, not another workflow expansion.

## 2026-05-25 - TianJi Love publishing pack and conversion backlog

### What changed

Turned the verified MiniMax growth pipeline state into draft-only manual publishing assets and an implementation-ready conversion backlog. The publishing pack was created from the approved TianJi Love growth direction and safety rules because artifact body download is still blocked by unauthenticated GitHub artifact access in this local shell.

### Runtime state

```text
KPI Analysis workflow: Go
Daily Growth workflow: Go
Content Calendar workflow: Go
Conversion Suggestions workflow: Pending runtime after merge
Artifacts downloaded: No - artifact metadata verified, body download blocked by GitHub auth
```

### Artifact quality

```text
KPI Analysis quality: Pending artifact body review
Daily Growth quality: Pending artifact body review
Content Calendar quality: Pending artifact body review
Conversion Suggestions quality: Pending runtime and artifact body review
```

### Publishing pack

```text
Xiaohongshu posts: Created
Douyin scripts: Created
WeChat Video scripts: Created
Publish checklist: Created
Conversion backlog: Created
Source artifact status note: Created
```

### Gate status

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

### Follow-up

- Merge `28e7aff feat(marketing): add TianJi Love conversion suggestions artifact` to `main`.
- Run `TianJi Love Conversion Suggestions` on `main`.
- Download four artifacts with authenticated GitHub access and replace the source-artifact status note with reviewed copies.
- Score each artifact A/B/C/D before posting.
- Manually publish one Xiaohongshu draft first, track clicks and paid intent, then choose one P0 CTA implementation task.

## 2026-05-25 - TianJi Love MiniMax growth pipeline verification and conversion suggestions

### What changed

Verified the latest MiniMax-backed TianJi Love growth workflow runs on `main` through public GitHub Actions metadata, confirmed all three expected artifacts were uploaded, tightened growth prompts toward publishable Chinese short-form content and revenue CTAs, and added a draft-only conversion suggestions generator/workflow.

### Runtime verification

```text
MiniMax API Smoke: Go
TianJi Love KPI Analysis: Go
TianJi Love Daily Growth: Go
TianJi Love Content Calendar: Go
Artifacts uploaded: Yes

KPI Analysis run: 26361421145
Daily Growth run: 26361417380
Content Calendar run: 26361415667

KPI Analysis artifact: tianji-love-kpi-analysis / 7185793229
Daily Growth artifact: tianji-love-daily-growth / 7185824316
Content Calendar artifact: tianji-love-content-calendar / 7185823452
```

### Content quality review

```text
KPI Analysis artifact quality: Blocked - artifact zip download requires authenticated GitHub access in this local shell
Daily Growth artifact quality: Blocked - artifact zip download requires authenticated GitHub access in this local shell
Content Calendar artifact quality: Blocked - artifact zip download requires authenticated GitHub access in this local shell
```

Because artifact body download was blocked, prompts were proactively improved to require stronger CTA, clearer product entry, Chinese short-video hooks, less generic advice, no fake data, no guaranteed outcomes, and a direct monetization angle.

### Conversion suggestion artifact

```text
Added script: scripts/tianji-love/generate-conversion-suggestions.mjs
Added npm script: tianji:conversion-suggestions
Added workflow: .github/workflows/tianji-love-conversion-suggestions.yml
Output: .ai/generated/tianji-love-conversion-suggestions.md
Auto code changes: Not run
```

### Validation

```text
node --check scripts/ai/minimax-chat.mjs: Pass
node --check scripts/tianji-love/generate-content-calendar.mjs: Pass
node --check scripts/tianji-love/generate-daily-growth.mjs: Pass
node --check scripts/tianji-love/generate-kpi-analysis.mjs: Pass
node --check scripts/tianji-love/generate-conversion-suggestions.mjs: Pass
package.json parse: Pass
YAML parse for tianji-love workflows: Pass
git diff --check: Pass
Targeted secret-shape scan: Pass - only intentional redaction regex matched
```

### Gate status

```text
MiniMax API runtime: Go
TianJi Love draft pipeline: Go
OpenAI API runtime: Bypassed
Codex Action dependency in TianJi workflows: Removed
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

### Follow-up

- Authenticate GitHub CLI or use GitHub UI to download artifact zips and complete A/B/C/D body quality scoring.
- If all artifacts are A/B, begin manual content publishing.
- If artifacts are C/D, continue prompt tuning before publishing.
- After the conversion suggestions workflow is merged and run, turn the top 3 suggestions into implementation PRs.

## 2026-05-24 - TianJi Love GitHub automation skill stack

- Task ID: 20260524-tianji-github-marketing-automation-skills
- Files changed: `.agents/skills/tianji-github-daily-growth-skill/SKILL.md`, `.agents/skills/tianji-github-kpi-analysis-skill/SKILL.md`, `.agents/skills/tianji-github-content-calendar-skill/SKILL.md`, `.agents/skills/tianji-github-funnel-optimizer-skill/SKILL.md`, `.agents/skills/tianji-github-paid-gate-skill/SKILL.md`, `.agents/skills/tianji-github-safe-publisher-bridge-skill/SKILL.md`, `.github/workflows/tianji-love-daily-growth.yml`, `.github/workflows/tianji-love-kpi-analysis.yml`, `.github/workflows/tianji-love-content-calendar.yml`, `.github/workflows/tianji-love-safety-audit.yml`, `.ai/TIANJI_LOVE_GITHUB_AUTOMATION_SKILL_STACK.md`, `.ai/TIANJI_LOVE_GITHUB_ACTIONS_SECURITY_RULES.md`, `.ai/CHANGELOG_AI.md`, `.ai/REVIEW_PACKET.md`.
- Summary: Added a safe GitHub automation skill stack for TianJi Love marketing operations. The stack covers daily publishing packs, KPI analysis, seven-day calendar maintenance, funnel copy optimization, payment gate reminders, and credential-free publisher bridge preparation.
- Workflow summary: Added four GitHub workflow templates with minimal permissions, path guards, validation commands, and targeted secret-shape scans. Commit-capable workflows use `contents: write` only for generated docs/assets/data. The safety audit workflow uses `contents: read`.
- Gates: Social auto-posting remains No-Go. Stripe checkout execution was not run. Paid smoke remains No-Go pending exact approval phrase. Production deploy remains No-Go.
- Validation: `npm run typecheck` passed. `npm run lint` passed with the existing Next.js deprecation notice. `git diff --check` passed. Workflow YAML parsed with PyYAML. All six new skills passed `quick_validate.py`; the paid-gate skill required `PYTHONUTF8=1` because it includes the exact Chinese approval phrase. Refined targeted secret-shape scan over `.agents/skills/`, `.github/workflows/`, `.ai/`, `assets/marketing/`, and `data/` returned no matches. Workflow trigger/permission scan returned no forbidden YAML entries.

## TianJi Love GitHub Actions Codex Input Fix - 2026-05-24

### What changed

Fixed invalid Codex Action input from `openai_api_key` to `openai-api-key` in the TianJi Love Daily Growth, KPI Analysis, and Content Calendar workflows. Also fixed the same invalid input in the existing Codex self-evolution, self-upgrade, and relationship evolution workflows so the repository-wide workflow scan has zero `openai_api_key` matches.

### Failure reason

GitHub Actions failed because `openai/codex-action@v1` does not accept `openai_api_key`; the action expects `openai-api-key`.

### Validation result

`git status --short` showed only the intended workflow and AI evidence files. `rg -n "openai_api_key" .github/workflows` returned zero matches. `rg -n "openai-api-key" .github/workflows` returned the six Codex Action call sites. `git diff --check` passed. Workflow YAML parsed successfully for all 11 workflow files. Refined targeted secret-shape scan over changed workflow and AI evidence files passed.

### Gate status

```text
Content Calendar workflow input fix: Go
Daily Growth workflow input fix: Go
KPI Analysis workflow input fix: Go
Existing Codex workflow input fix: Go
Safety Audit workflow: Not changed - no Codex Action input
Secrets printed: No
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
```

### Follow-up

Re-run `TianJi Love Content Calendar` manually on branch `main` after this fix is merged.

## 2026-05-24 - GitHub Actions Codex input fix merge/runtime verification

### What changed

Merged and verified branch:

`fix/tianji-github-actions-codex-input-20260524`

PR: `https://github.com/yihui315/tianji-global/pull/50`

Merge commit: `43a1ceac882b6bbb623d5cd6953593e4160fe65b`

Fixed Codex Action input from `openai_api_key` to `openai-api-key`.

### Files verified

- `.github/workflows/codex-self-evolution.yml`
- `.github/workflows/codex-self-upgrade.yml`
- `.github/workflows/relationship-ab-evolution.yml`
- `.github/workflows/tianji-love-content-calendar.yml`
- `.github/workflows/tianji-love-daily-growth.yml`
- `.github/workflows/tianji-love-kpi-analysis.yml`

### Validation

```text
PR check CI/CD: Pass
openai_api_key in .github/workflows: 0 matches
openai-api-key in .github/workflows: 6 matches
git diff --check: Pass
Workflow YAML parse: Pass
Secret-shape scan: Pass
Secrets printed: No
```

### Runtime verification

```text
OPENAI_API_KEY repo secret: Unknown by direct listing; prior failed runs showed masked input value, so likely present
Workflow dispatch permission from local gh/API: Blocked - gh CLI not authenticated and unauthenticated REST dispatch returned 401

TianJi Love Content Calendar: Blocked for new main rerun; previous pre-fix run failed on openai_api_key at 91d1049
TianJi Love Daily Growth: Blocked for new main rerun; previous pre-fix run failed on openai_api_key at 91d1049
TianJi Love KPI Analysis: Blocked for new main rerun; no main run found and dispatch auth is unavailable
```

### Gate status

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

### Follow-up

- Revoke/rotate previously pasted GitHub token.
- Authenticate `gh` with `repo,workflow` scope or trigger the three workflows from the GitHub Actions UI on `main`.
- If `OPENAI_API_KEY` is missing or invalid after an authenticated rerun, configure the repo secret without printing it.
- If the Node.js 20 warning becomes blocking, upgrade affected action/runtime in a separate workflow maintenance task.

## 2026-05-24 - TianJi Love Actions runtime rerun after Codex input fix

### What changed

Triggered authenticated workflow_dispatch runs on `main` after the Codex Action input fix was merged.

Local `gh` authentication remained unavailable, so runtime dispatch was completed through the GitHub Actions UI. GitHub connector logs were then inspected without printing secret values.

### Main commits verified

```text
Input fix merge commit: 43a1cea
Runtime verification docs merge commit: 608c476
```

### Runs inspected

```text
TianJi Love Content Calendar run: 26357694312
TianJi Love Daily Growth run: 26357686684
TianJi Love KPI Analysis run: 26357691510
```

### Commands run

```text
gh auth status
gh auth login -h github.com --web --scopes repo,workflow
gh auth login -h github.com --web --clipboard --scopes repo,workflow
git -c safe.directory=* status --short --branch
git -c safe.directory=* log --oneline -5
rg -n "openai_api_key" .github/workflows
rg -n "openai-api-key" .github/workflows
GitHub Actions UI workflow_dispatch on main
GitHub connector fetch workflow job steps/logs
```

### Validation

```text
openai_api_key in .github/workflows: 0 matches
openai-api-key in .github/workflows: 6 matches
Secrets printed: No
```

### Runtime verification

```text
TianJi Love Content Calendar: Fail - Codex Action reached OpenAI runtime but received 401 invalid_api_key
TianJi Love Daily Growth: Fail - Codex Action reached OpenAI runtime but received 401 invalid_api_key
TianJi Love KPI Analysis: Fail - Codex Action reached OpenAI runtime but received 401 invalid_api_key
OPENAI_API_KEY repo secret: Present but invalid or unauthorized
Node.js 20 warning: Warning only
```

### Gate status

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

### Follow-up

- Revoke/rotate the previously pasted GitHub token.
- Replace or rotate the `OPENAI_API_KEY` repository secret without printing it.
- Re-run the three TianJi Love workflows on `main` after the secret is replaced.
- Treat the Node.js 20 warning as non-blocking unless it becomes the failing step.

## 2026-05-24 - TianJi Love workflows switched to MiniMax artifact generation

### What changed

Replaced the three TianJi Love growth/KPI workflows with project-local MiniMax Chat Completions scripts. The workflows no longer call `openai/codex-action@v1`, no longer read `OPENAI_API_KEY`, and now upload generated Markdown drafts as GitHub Actions artifacts instead of auto-committing generated content.

MiniMax API contract checked against the official compatible OpenAI text chat docs:

```text
Endpoint: POST /v1/chat/completions
Default base URL: https://api.minimaxi.com/v1
Token Plan URL source: MiniMax M2.7 OpenAI-compatible Token Plan docs
Default model: MiniMax-M2.7
Token limit field: max_completion_tokens
```

### Files changed

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

### Validation

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
TianJi Love workflows openai/codex-action or OPENAI_API_KEY matches: 0
Targeted secret-shape scan: Pass
```

### Runtime verification

```text
npm run tianji:content-calendar: Blocked locally - MINIMAX_API_KEY is missing
npm run tianji:daily-growth: Blocked locally - MINIMAX_API_KEY is missing
npm run tianji:kpi-analysis: Blocked locally - MINIMAX_API_KEY is missing
```

The missing-key behavior is fail-closed and did not print any secret value.

### Gate status

```text
OpenAI Codex Action dependency removed from TianJi Love workflows: Go
MiniMax artifact workflow templates: Go
Workflow permissions: contents: read
Auto-commit generated content: Removed
Runtime with MiniMax secret: Pending owner configuration
Social auto-posting: No-Go
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Secrets printed: No
GitHub token rotation: Owner action required
```

### Follow-up

- Configure `MINIMAX_API_KEY`, `MINIMAX_BASE_URL`, and `MINIMAX_MODEL` as GitHub Actions repository secrets.
- Re-run the three TianJi Love workflows on `main` after merge and secret configuration.
- Revoke/rotate the previously pasted GitHub token.

## 2026-05-24 - TianJi Love MiniMax workflow runtime verification

### What changed

Verified the MiniMax-backed TianJi Love workflow runtime on `main` after PR #53 merged and MiniMax GitHub Actions secrets were configured.

### Main commit

```text
95f354a fix(actions): run TianJi growth workflows on MiniMax API
```

### Runtime verification

```text
TianJi Love Content Calendar run: 26361415667
TianJi Love Daily Growth run: 26361417380
TianJi Love KPI Analysis run: 26361421145

TianJi Love Content Calendar: Fail - MiniMax HTTP 429 rate_limit_error
TianJi Love Daily Growth: Fail - MiniMax HTTP 429 rate_limit_error
TianJi Love KPI Analysis: Fail - MiniMax HTTP 429 rate_limit_error
Expected artifacts uploaded: No
MiniMax API runtime: No-Go - quota/rate limit
```

The workflow reached the MiniMax API with masked `MINIMAX_*` values. The failure message reported a 5-hour Token Plan Plus usage limit and a reset at `2026-05-25T00:00:00+08:00`.

### Gate status

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

### Follow-up

- Retry after the MiniMax quota reset time.
- If 429 persists after reset, verify the MiniMax token plan or choose a model/plan with available quota.
- Keep generated marketing output in artifact review mode; do not enable social auto-posting.

## 2026-05-24 - TianJi Love MiniMax Token Plan default alignment

### What changed

Aligned the TianJi Love MiniMax growth script default Base URL with the MiniMax M2.7 Token Plan OpenAI-compatible docs.

```text
Default base URL: https://api.minimaxi.com/v1
Default model: MiniMax-M2.7
Endpoint: POST /v1/chat/completions
Token limit field: max_completion_tokens
```

### Runtime interpretation

The prior GitHub Actions failures reached the MiniMax Token Plan API and returned `HTTP 429 rate_limit_error`. This confirms the request path is past npm install, env mapping, and auth shape; the remaining runtime blocker is Token Plan quota/usage availability, not Node.js 20.

### Gate status

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

## 2026-05-24 - MiniMax API smoke workflow

### What changed

Added a manual-only GitHub Actions workflow to verify the minimal MiniMax API path from GitHub Actions without running TianJi Love growth jobs.

```text
Workflow: MiniMax API Smoke
Trigger: workflow_dispatch only
Endpoint: POST /chat/completions under MINIMAX_BASE_URL
Prompt: Reply with exactly: OK
temperature: 0
max_completion_tokens: 20
```

### Validation

```text
node --check scripts/ai/minimax-chat.mjs: Pass
YAML parse: Pass
git diff --check: Pass
Targeted secret-shape scan: Pass
Live MiniMax API call: Not run locally
```

### Gate status

```text
MiniMax API smoke workflow: Prepared
Production deploy: Not run
Stripe checkout: Not run
Paid smoke: No-Go
Social auto-posting: No-Go
Secrets printed: No
```

### Follow-up

- Merge this workflow to `main`.
- Manually run `MiniMax API Smoke` on `main`.
- If smoke passes, run only `TianJi Love KPI Analysis` next.
