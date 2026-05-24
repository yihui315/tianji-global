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
