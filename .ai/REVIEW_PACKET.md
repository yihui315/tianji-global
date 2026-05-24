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
Default base URL: https://api.minimax.io/v1
China base URL option: https://api.minimaxi.com/v1
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
