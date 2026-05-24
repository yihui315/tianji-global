# TianJi Love Automation Controller

## Purpose

Control the TianJi Love automated growth system with explicit gates. The system may generate content, track KPIs, and recommend optimizations, but paid smoke and production deploy remain blocked until separate explicit approval.

## Gate 1: Marketing Asset Generation

Allowed actions:

- Generate channel-specific posts, scripts, captions, SEO outlines, landing copy, KOL templates, and UGC templates.
- Store outputs in `assets/marketing/`.

Forbidden actions:

- Fake testimonials.
- Fake user counts.
- Guaranteed relationship outcome claims.
- Provider live AI calls.

Required evidence:

- Asset files exist.
- Risk-safe language scan passes.

Go/No-Go result:

```text
Marketing asset generation: Go when assets exist and contain guardrails.
```

Next action:

```text
Manual content review before publishing.
```

## Gate 2: KPI Tracking

Allowed actions:

- Create and update CSV templates.
- Record aggregate, non-sensitive metrics.

Forbidden actions:

- Store private questions, names, birth data, or raw personal messages.
- Mutate Supabase production data.

Required evidence:

- KPI CSVs exist with funnel columns.
- No personal data fields are required.

Go/No-Go result:

```text
KPI tracking: Go for CSV/manual tracking.
```

Next action:

```text
Operator enters daily metrics after publishing.
```

## Gate 3: Staging Content Review

Allowed actions:

- Review content assets.
- Run local lint/typecheck if source changes occur.
- Run hosted HTTP smoke only after staging deployment is separately proven.

Forbidden actions:

- Production deploy.
- Paid smoke.
- Server mutation without explicit operator task.

Required evidence:

- Review packet lists files and validation.
- Content avoids forbidden claims.

Go/No-Go result:

```text
Staging content review: Go for docs/assets; hosted smoke remains separate.
```

Next action:

```text
Publish selected content manually or schedule through approved tooling.
```

## Gate 4: Stripe Test-Mode Paid Smoke Approval

Allowed actions:

- Prepare approval packets.
- Run readiness audits.

Forbidden actions:

- Stripe checkout execution before exact approval phrase.
- Live Stripe.
- Webhook replay unless separately approved.

Required evidence:

- Approval packet source ref exists.
- User explicitly says `批准跑 Stripe test-mode paid smoke`.

Go/No-Go result:

```text
Stripe test-mode paid smoke approval: No-Go until exact approval phrase is present.
```

Next action:

```text
Wait for explicit approval or continue non-paid growth work.
```

## Gate 5: Production Canary Approval

Allowed actions:

- Prepare production canary plan.
- Define rollback metrics.

Forbidden actions:

- Production deploy before exact production approval.
- Full paid unlock for all users.
- Provider live AI expansion without gate.

Required evidence:

- Staging evidence and paid-smoke evidence, if paid canary is involved.
- User explicitly says `批准 production canary`.

Go/No-Go result:

```text
Production canary: No-Go until exact approval phrase is present.
```

Next action:

```text
Prepare canary runbook after paid smoke Go.
```

## Gate 6: Daily Growth Loop

Allowed actions:

- Read KPI CSV.
- Generate content ideas.
- Update content calendar.
- Recommend copy/CTA tests.

Forbidden actions:

- Fake data.
- Paid smoke.
- Production deploy.

Required evidence:

- Daily growth log updated.
- REVIEW_PACKET updated for material changes.

Go/No-Go result:

```text
Daily growth loop: Go for docs/assets/data-only automation.
```

Next action:

```text
Run daily after operator enters real metrics.
```

## Gate 7: Weekly Optimization Loop

Allowed actions:

- Summarize aggregate KPI.
- Recommend A/B tests.
- Recommend price tests only after paid smoke approval.

Forbidden actions:

- Price changes without approval.
- Checkout execution without approval.
- Production deploy.

Required evidence:

- Weekly KPI summary.
- Experiment recommendation with scope and rollback.

Go/No-Go result:

```text
Weekly optimization loop: Go for recommendations; execution remains separately gated.
```

Next action:

```text
Brain review selects the next safe experiment.
```
