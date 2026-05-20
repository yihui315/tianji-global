# TianJi Love Lane O2 Production UX Canary Monitoring - 2026-05-20

## Goal

Record the 72-hour observation plan for the post-canary UX production free canary without changing production.

## Current State

```text
Production UX polish canary: Go
Current release: /var/www/tianji-global/releases/20260520-122348-free-canary
Rollback release 1: /var/www/tianji-global/releases/20260519-222548-free-canary
Rollback release 2: /var/www/tianji-global/releases/20260502-155434
Staging remains online: Go
Paid launch: No-Go
```

## Source Evidence

This monitoring plan is based on the user-provided production success evidence:

```text
prod/=200
prod/pricing=200
prod/ask=200
prod/draw=200
prod/login=200
relationship=200
tianji-global online
tianji-staging online
listener 3000 production online
listener 3058 staging online
listener 3068 absent after preflight cleanup
listener 3103 still present
```

Codex did not rerun server commands in this local evidence step.

## Daily Health Checklist

Run from the server as an operator check:

```bash
bash <<'EOF'
set +e

echo "current=$(readlink -f /var/www/tianji-global/current)"

for path in "/" "/pricing" "/ask" "/draw" "/login"; do
  code=$(curl -k -sS --max-time 20 -o /dev/null -w "%{http_code}" "https://tianji.love${path}")
  echo "prod${path}=${code}"
done

sudo -iu deploy pm2 status
ss -lntp | grep -E ':(3000|3058|3068|3103)' || true
EOF
```

Expected result:

```text
current=/var/www/tianji-global/releases/20260520-122348-free-canary
prod/=200
prod/pricing=200
prod/ask=200
prod/draw=200
prod/login=200 or prod/login=302 if auth redirect changes intentionally
tianji-global online
tianji-staging online
3000 present
3058 present
3068 absent
3103 present or unchanged
```

## PM2 Health Checklist

```text
tianji-global online
tianji-staging online
no crash-loop restart spike
no tianji-canary-preflight process left behind
production cwd/current points to current release
staging remains on 3058
```

## Error Log Watch Checklist

Watch only operational error signals. Do not print secrets or env values.

```text
PM2 logs for repeated 5xx after readiness
Next.js runtime exceptions on home/pricing/ask/draw/login
Nginx 502/504 bursts for tianji.love
Unexpected 3068 listener after preflight cleanup
Webhook, Stripe, email, Supabase mutation, provider-live calls should remain absent
```

## 72-Hour Observation Criteria

Go criteria:

```text
Free routes remain 200 or expected auth redirect
tianji-global remains online
tianji-staging remains online
No repeated production 502/504
No paid/live side effects enabled
Rollback releases remain present
```

No-Go criteria:

```text
Repeated home/pricing/ask/draw/login 5xx
tianji-global offline or crash looping
current symlink unexpectedly changes
3068 remains listening outside preflight
Stripe/webhook/email/Supabase/provider live side effects appear
Paid unlock or Vedic paid public exposure becomes enabled without approval
```

## Rollback Trigger Conditions

Rollback if any severe production regression persists after a short readiness wait:

```text
home remains 5xx
pricing/ask/draw/login repeatedly fail
PM2 tianji-global cannot stay online
Nginx cannot route to 3000
unexpected paid/live side effect is observed
```

Manual rollback target:

```text
/var/www/tianji-global/releases/20260519-222548-free-canary
```

Older rollback target:

```text
/var/www/tianji-global/releases/20260502-155434
```

## Manual Rollback Command

```bash
ln -sfn /var/www/tianji-global/releases/20260519-222548-free-canary /var/www/tianji-global/current
sudo -iu deploy pm2 restart tianji-global --update-env
sleep 8
curl -k -sS --max-time 20 -o /dev/null -w "prod-home-after-rollback=%{http_code}\n" https://tianji.love
```

## Gate Verdict

```text
Production UX canary monitoring plan: Go
Keep current production canary: Conditional Go pending 72-hour samples
Paid launch: No-Go
```

## Not Approved

```text
Stripe live
Webhook mutation
Ask/Draw paid unlock public launch
Vedic paid public exposure
Email automation
Production Supabase mutation
Provider live scaling
Deleting rollback releases
Stopping staging
```
