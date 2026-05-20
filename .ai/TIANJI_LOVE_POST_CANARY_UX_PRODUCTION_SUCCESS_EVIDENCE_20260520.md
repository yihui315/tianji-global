# TianJi Love Post-Canary UX Production Success Evidence - 2026-05-20

## Goal

Record successful production free canary evidence for the post-canary UX polish release.

## Current Verdict

```text
Production UX polish canary: Go
Production free routes: Go
Staging remains online: Go
Rollback release preserved: Go
Paid launch: No-Go
Stripe/webhook/email/Supabase mutation/provider live/Vedic paid public exposure: disabled or not enabled
```

## Source And Release

```text
branch/source: post-canary-ux-polish-20260520
current release: /var/www/tianji-global/releases/20260520-122348-free-canary
previous release / rollback: /var/www/tianji-global/releases/20260519-222548-free-canary
older rollback point to preserve: /var/www/tianji-global/releases/20260502-155434
```

## Preflight Evidence

```text
preflight PM2 app: tianji-canary-preflight
preflight port: 3068
preflight_home=200
preflight_pricing=200
preflight_ask=200
preflight_draw=200
preflight_login=200
preflight cleanup: 3068 not present after cleanup
```

## Production Readiness Evidence

```text
readiness_home=502
readiness_home=200
```

Interpretation: readiness wait observed an initial transient 502 after production PM2 restart, then production home recovered to 200 before full smoke proceeded.

## Production Smoke Evidence

```text
home=200
pricing=200
ask=200
draw=200
login=200
relationship=200
```

## Runtime Evidence

```text
PM2 tianji-global: online
PM2 tianji-staging: online
listener 3000: production online
listener 3058: staging online
listener 3068: not present after preflight cleanup
listener 3103: still present
```

## Paid / Live Side Effects

```text
paid launch: No-Go
Stripe live: not enabled
webhook: not run
email automation: not enabled
Supabase production mutation: not run
provider live scaling: not enabled
Vedic paid public exposure: disabled
Ask/Draw paid unlock public launch: not enabled
```

## Rollback Preservation

Keep both rollback points for at least 24 hours:

```text
/var/www/tianji-global/releases/20260519-222548-free-canary
/var/www/tianji-global/releases/20260502-155434
```

## Next Step

```text
Lane O2: continue production UX canary observation for 24 hours.
Lane N2: prepare paid smoke test environment and masked evidence.
No paid/live activation without separate explicit approval and test/staging smoke evidence.
```
