---
name: tianji-love-clean-rc-freeze
description: Use this skill when Tianji Love local gates pass but the worktree is dirty. It separates a clean release candidate branch from risky env, CI, API, Stripe, Supabase, migration, auth, middleware, AI orchestration, or deployment changes. It combines Tianji RC rules with gstack-careful, gstack-review, and gstack-ship.
---

# Tianji Love Clean RC Freeze

## Purpose

Create or review a clean Tianji Love release candidate without deploying the dirty tree.

## Required GStack Skills

Use:

```text
gstack-careful
gstack-review
gstack-ship
gstack-context-save
```

## Core Rule

Never deploy or commit the full dirty worktree.

## Product Rules

Tianji Love is the only active product direction.
TianJi Global as a broad tools product is cancelled or deprioritized.
Legacy routes may remain, but must not dominate the main customer path.
Primary customer path is Love Reading / relationship compatibility.
Secondary paths are Ask and Draw.
Cloud deployment requires clean RC plus SSH/server/env evidence.

## File Classification

### Class A - Include if validated

```text
Tianji Love UX pages
Tianji Love navigation
metadata / JSON-LD
legal/privacy/terms copy
share audit copy fix
homepage render-loop fix
relationship localization fix
customer-flow tests
browser QA scripts/evidence
```

### Class C1 - Include only after promotion review

```text
Ask/Draw preview timeout/fallback
AI safe fallback needed by local gate
Auth active-origin redirect helper
smoke-ask-draw-auth script
local audit/release-gate dependencies
related regression tests
```

### Class C2 - Exclude by default

```text
.env*
real secrets
Stripe webhook
Pro subscription price-ID refactor
Supabase migrations
database/RLS
deployment config
server config
live payment logic
production deploy CI
unreviewed middleware/auth/payment changes
```

## Required Process

1. Read latest local release gate report.
2. Inspect `git status --short --branch`.
3. Inspect `git diff --stat`.
4. Create include/exclude table.
5. If Class A cannot pass gate alone, review C1 dependencies.
6. Stop if C1 and C2 cannot be safely separated.
7. Create RC branch only if include set is clean.
8. Commit only reviewed files.
9. Rerun full local gate.
10. Report commit hash.

## Required Gate

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run audit:copy
npm run audit:share
npm run audit:routes
npm run audit:upgrade
npm run audit:release-gate
node scripts/smoke-ask-draw-auth.mjs http://127.0.0.1:3057
```

Also run desktop/mobile browser QA.

## Stop Conditions

Stop if:

- secrets would be printed
- production Stripe/Supabase could be touched
- deploy source is dirty or ambiguous
- a task would require reset/stash/revert
- a task would silently include env/CI/API/Stripe/Supabase/migration risk
- local customer flow has old TianJi Global leakage
- English routes leak Chinese core content
- protected routes redirect to localhost
- mobile overflow appears

## Output

For freeze packet:

```text
.ai/TIANJI_LOVE_CLEAN_RC_FREEZE_YYYYMMDD.md
```

For branch gate:

```text
.ai/TIANJI_LOVE_CLEAN_RC_BRANCH_GATE_YYYYMMDD.md
```

For C1 promotion:

```text
.ai/TIANJI_LOVE_C1_DEPENDENCY_PROMOTION_AND_RC_GATE_YYYYMMDD.md
```

## Go Criteria

Go only if:

- branch exists
- commit hash exists
- included files are reviewed
- C2 surfaces are excluded
- full local gate passes
- browser QA passes
- no secrets are included

## No-Go Criteria

No-Go if:

- clean RC requires unreviewed payment/database/deploy files
- whole dirty tree would need to be committed
- env/secret files are involved
- RC cannot be reproduced
