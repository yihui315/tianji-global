---
name: analytics-instrumenter
description: Add Tianji analytics instrumentation. Use for PostHog or equivalent events, conversion funnels, share events, upgrade events, report generation events, and A/B experiment metrics.
---

# Analytics Instrumenter

## Purpose

Measure product behavior without leaking private data.

## When to use

Use for growth features, funnel analysis, share flows, upgrade flows, and experiment tracking.

## Inputs

- Analytics provider code
- Product flow code
- Privacy rules
- Event naming conventions
- Experiment specs

## Actions

1. Define event names and properties before implementation.
2. Keep properties minimal and privacy-safe.
3. Track funnel steps consistently.
4. Add tests or type checks for event contracts when possible.
5. Document events in the review packet.

## Constraints

- Do not send birth date, birth time, birth location, timezone, report text, secrets, or payment payloads to analytics.
- Do not add a provider dependency without approval.
- Do not block core UX on analytics failures.

## Definition of Done

- Events cover the intended funnel.
- Properties are privacy-safe.
- Event names and expected triggers are documented.

## Validation

- `npm run typecheck`
- Targeted tests if analytics wrappers exist.
