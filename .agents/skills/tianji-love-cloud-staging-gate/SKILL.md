---
name: tianji-love-cloud-staging-gate
description: Use this skill before deploying Tianji Love clean RC to cloud staging. It validates SSH access, DNS, HTTPS, Nginx, Node/npm, build tools, PM2/systemd, /var/www, clean RC source, and masked staging env evidence. It combines Tianji staging rules with gstack-careful, gstack-qa-only, and gstack-review.
---

# Tianji Love Cloud Staging Gate

## Purpose

Decide whether a clean Tianji Love RC can be safely deployed to `https://tianji.love`.

## Required GStack Skills

Use:

```text
gstack-careful
gstack-qa-only
gstack-review
```

Use `gstack-ship` only when an actual deploy is explicitly requested and all evidence is Go.

## Required Inputs

```text
clean RC branch
clean RC commit
server IP
SSH access method
masked env evidence
```

## Hard Non-Goals

Do not:

- deploy unless explicitly requested
- print secrets
- touch production Stripe
- touch production Supabase
- run migrations
- run paid smoke
- deploy dirty tree

## Product Rules

Tianji Love is the only active product direction.
TianJi Global as a broad tools product is cancelled or deprioritized.
Cloud deployment requires clean RC plus SSH/server/env evidence.
Paid smoke requires staging Stripe/Supabase proof.

## Public Baseline

Check:

```text
DNS resolves to target IP
ports 22/80/443 reachable
HTTPS certificate valid
Nginx/Next serving traffic
/dashboard and /profile redirect same-origin
current public site is or is not the clean RC
```

## Server Baseline

Allowed read-only commands:

```bash
whoami
hostname
uname -a
cat /etc/os-release || true
df -h
free -h
ss -tulpn
nginx -v || true
node -v || true
npm -v || true
git --version || true
pm2 -v || true
ls -la /var/www || true
ps aux | grep -E "node|next|pm2" | grep -v grep || true
```

## Env Evidence Categories

Report only as:

```text
ok
missing
wrong-origin
production-risk
unknown
```

Required:

```text
NEXTAUTH_URL=https://tianji.love
AUTH_URL=https://tianji.love
NEXT_PUBLIC_APP_URL=https://tianji.love
AUTH_SECRET exists, staging-only, not printed
ASK_QUESTION_SECRET exists
QUICK_DRAW_SECRET exists
DESTINY_SCAN_SECRET exists or waived if unused
Stripe test mode or paid smoke blocked
Supabase staging/test or data smoke blocked
AI provider or fallback policy
RESEND_API_KEY / FROM_EMAIL status
```

## Build Tool Risk

Specifically check:

```text
Node version
npm version
native build tools
whether sweph/native deps can build
whether artifact deploy is required
```

## Stop Conditions

Stop if:

- SSH access is not safe
- clean RC branch is not on origin and artifact path is not defined
- server source is unknown
- env evidence is missing
- production Stripe/Supabase risk exists
- secrets would need to be printed
- deploy source is dirty or ambiguous
- a task would require reset/stash/revert

## Output

Write:

```text
.ai/TIANJI_LOVE_CLOUD_STAGING_GATE_YYYYMMDD.md
```

or:

```text
.ai/TIANJI_LOVE_CLEAN_RC_CLOUD_STAGING_BASELINE_YYYYMMDD.md
```

## Decision

Return one of:

```text
Go for deploy clean RC
Conditional Go for deploy
No-Go for deploy
```
