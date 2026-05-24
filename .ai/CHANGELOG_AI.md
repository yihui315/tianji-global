# AI Changelog

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
