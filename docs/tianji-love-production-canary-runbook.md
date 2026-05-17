# TianJi Love Production Canary Runbook

## Scope

This runbook prepares a production canary only. It does not approve or execute deployment.

The canary is limited to free, non-mutating, non-paid customer surfaces:

- homepage
- pricing
- relationship free flow
- Ask preview
- Draw preview
- login page

The canary is intended to prove public navigation, copy, disabled-paid boundaries, free preview rendering, and rollback readiness after a separately approved production release.

## Explicit Exclusions

Do not include these flows in the production canary:

- real paid Ask unlock
- real paid Draw unlock
- Vedic paid public exposure
- Stripe live payment
- provider live scaling or live load testing
- email automation or real outbound email
- webhook replay
- database mutation smoke
- production deploy execution from this runbook

## Required Initial Flags

Before any approved production canary begins, the runtime must be confirmed with these initial flag values. Record evidence as key names and status only; do not print secret values.

| Key | Required value | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | `production` | Confirms the public app is running in production mode. |
| `STAGING_DEGRADED_MODE` | `false` | Confirms this is not the degraded staging profile. |
| `AI_PROVIDER_LIVE_DISABLED` | `true` | Blocks live provider calls during the free canary. |
| `STRIPE_LIVE_DISABLED` | `true` | Blocks live Stripe payment attempts. |
| `EMAIL_SEND_DISABLED` | `true` | Blocks outbound email automation. |
| `SUPABASE_MUTATION_DISABLED` | `true` | Blocks mutation smoke during the canary. |
| `NEXT_PUBLIC_TIANJI_VEDIC_ENABLED` | `false` | Keeps Vedic public exposure disabled. |
| `TIANJI_VEDIC_REPORT_MODE` | `disabled` | Keeps Vedic paid reports disabled in production canary. |

## Go / No-Go Table

| Gate | Go criteria | No-Go criteria | Decision |
| --- | --- | --- | --- |
| Source candidate | Exact commit, branch, and build artifact are recorded from the approved release process. | Candidate is ambiguous, dirty, unbuilt, or different from the approved commit. | No-Go until release evidence is attached. |
| Required flags | All initial flags match the table above, verified without printing secrets. | Any flag is missing, unsafe, unknown, or printed with a secret value. | No-Go until fixed. |
| Free public routes | Homepage, pricing, relationship free, Ask preview, Draw preview, and login page return expected non-paid content. | Any free route is unavailable, redirects to the wrong origin, shows a server error, or exposes paid-only content. | No-Go until fixed or rolled back. |
| Paid boundaries | Paid Ask, paid Draw, Vedic paid reports, live Stripe, live provider calls, email sends, and Supabase mutations are disabled or not exercised. | Any excluded path is reachable, triggered, or unintentionally exposed. | Immediate No-Go and rollback. |
| Privacy | No birth time, birth location, timezone, raw chart data, private report payloads, or secrets appear in public output or evidence. | Sensitive personal data or secret-shaped values appear in output, logs, or docs. | Immediate No-Go and rollback. |
| Observability | HTTP status, route, timestamp, and reviewer are recorded for free canary checks. | Evidence is missing, unreviewable, or includes sensitive values. | No-Go until evidence is corrected. |
| Rollback | A tested rollback owner and command path are named before canary start. | Rollback owner or path is unknown. | No-Go until rollback is ready. |

## Smoke Checklist

Run only after a separately approved production release and only with the required flags confirmed.

| Step | Route or check | Expected result | Evidence to record |
| --- | --- | --- | --- |
| 1 | `/` | Homepage loads with TianJi Love public signals and no server error. | HTTP status, timestamp, commit, screenshot reference if captured. |
| 2 | `/pricing` or localized pricing route | Pricing page loads; paid CTA does not complete a live checkout during canary. | HTTP status and disabled/live-blocked boundary note. |
| 3 | `/relationship/new` | Free relationship entry and preview flow are usable without payment. | HTTP status and free result/preview note. |
| 4 | Ask preview route or UI flow | Free Ask preview renders; paid unlock is not executed. | HTTP status and preview-only note. |
| 5 | Draw preview route or UI flow | Free Draw preview renders; paid unlock is not executed. | HTTP status and preview-only note. |
| 6 | `/login` | Login page loads from the production origin without wrong-origin redirects. | HTTP status and final URL. |
| 7 | Paid boundary spot check | Paid unlock endpoints are not called; live payment is not attempted. | Reviewer attestation only. |
| 8 | Provider/email/database boundary | Live provider scaling, outbound email, and mutation smoke are not run. | Reviewer attestation only. |

Do not run paid smoke, Stripe test-live, provider live, webhook replay, or email automation as part of this checklist.

## Rollback

Rollback must be prepared before canary start.

1. Stop canary immediately if any Go / No-Go row becomes No-Go.
2. Notify the release owner and record the failing route, timestamp, status code, and current commit.
3. Revert to the last known good production release using the approved deployment runbook for the active hosting path.
4. Reconfirm the required initial flags after rollback.
5. Re-run only the free route checks needed to prove the rollback restored public access.
6. Record rollback evidence without secrets, request bodies, payment identifiers, provider payloads, or private user data.

## Evidence Template

Copy this template into the canary evidence packet for each approved production canary. Keep values masked and status-only.

```md
# TianJi Love Production Canary Evidence

## Candidate

- Date/time:
- Reviewer:
- Branch:
- Commit:
- Hosting path:
- Deployment approval reference:
- Production deploy executed by this task: No

## Initial Flag Evidence

| Key | Required value | Observed status | Evidence source |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_ENV` | `production` | unknown | masked runtime inventory |
| `STAGING_DEGRADED_MODE` | `false` | unknown | masked runtime inventory |
| `AI_PROVIDER_LIVE_DISABLED` | `true` | unknown | masked runtime inventory |
| `STRIPE_LIVE_DISABLED` | `true` | unknown | masked runtime inventory |
| `EMAIL_SEND_DISABLED` | `true` | unknown | masked runtime inventory |
| `SUPABASE_MUTATION_DISABLED` | `true` | unknown | masked runtime inventory |
| `NEXT_PUBLIC_TIANJI_VEDIC_ENABLED` | `false` | unknown | masked runtime inventory |
| `TIANJI_VEDIC_REPORT_MODE` | `disabled` | unknown | masked runtime inventory |

## Free Canary Smoke

| Route or flow | Result | Status code | Notes |
| --- | --- | ---: | --- |
| homepage | not-run |  |  |
| pricing | not-run |  |  |
| relationship free | not-run |  |  |
| Ask preview | not-run |  |  |
| Draw preview | not-run |  |  |
| login page | not-run |  |  |

## Exclusion Attestation

- Real paid Ask/Draw: not-run
- Vedic paid public exposure: disabled/not-run
- Stripe live payment: not-run
- Provider live scaling: not-run
- Email automation: not-run
- Supabase mutation smoke: not-run
- Production deploy by this canary prep task: not-run

## Decision

- Canary prep decision:
- Remaining blockers:
- Rollback owner/path:
```
