# TianJi Love Lane P2 Canary Source Branch Config Evidence - 2026-05-20

## Goal

Allow the production free canary script to deploy an explicitly selected source branch for the post-canary UX polish, while keeping the previous degraded branch as the default.

## Current Context

```text
post-canary UX branch: post-canary-ux-polish-20260520
branch pushed: yes
branch HEAD before this script patch: aca837bd310fe0ea31f782296079688159130568
production free canary: Go from prior evidence
staging deploy of UX polish: not-run by Codex
production deploy: not-run
paid launch: No-Go
```

## What Changed

- Updated `ops/tianji-love-production-free-canary.sh` to use:

```bash
SOURCE_BRANCH="${CANARY_SOURCE_BRANCH:-staging-degraded-20260518}"
```

- Dry-run now prints `Effective source branch`.
- Execution now clones `SOURCE_BRANCH`.
- Rollback metadata now records `source_branch=${SOURCE_BRANCH}`.
- Runbook now documents `CANARY_SOURCE_BRANCH=post-canary-ux-polish-20260520` for this UX canary.

## Safety

```text
CANARY_EXECUTE=true: not-run
production current switch: not-run
production PM2 restart: not-run
production env read/print: no
Stripe/webhook/provider live/email/Supabase mutation: not-run
paid unlock: not enabled
Vedic paid public exposure: disabled / not enabled
```

## Local Validation Note

On this Windows workstation, `C:\Windows\System32\bash.exe` is the WSL launcher and returned exit code `1` without shell output. Validation used Git Bash at `C:\Program Files\Git\bin\bash.exe`. Server execution should use the server's normal `/usr/bin/env bash`.

## Dry-Run Requirement For UX Canary

Before production UX canary, server dry-run must include:

```bash
CANARY_SOURCE_BRANCH=post-canary-ux-polish-20260520 bash ops/tianji-love-production-free-canary.sh
```

Expected dry-run evidence:

```text
DRY RUN ONLY
CANARY_EXECUTE is not true
Effective source branch:
  post-canary-ux-polish-20260520
Candidate preflight:
  port: 3068
  PM2 app: tianji-canary-preflight
No current symlink switch, production PM2 restart, production env write, paid smoke, or live side effect
```

## Gate Decision

```text
canary source branch configurability: Go locally
production UX canary execution: No-Go until staging smoke + server dry-run + explicit approval
paid launch: No-Go
```
