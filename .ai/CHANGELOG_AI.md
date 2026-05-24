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
