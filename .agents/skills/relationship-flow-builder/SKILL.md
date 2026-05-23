---
name: relationship-flow-builder
description: Build Tianji relationship analysis flows. Use for single-person and two-person relationship input, result, premium upgrade, share, and report flows with privacy-safe handling.
---

# Relationship Flow Builder

## Purpose

Build relationship analysis flows that are useful, private, and monetizable.

## When to use

Use for relationship product work after repo gates and safety rules are stable.

## Inputs

- Relationship pages and components
- Relationship engines
- Share components
- Billing and entitlement rules
- Copy guardrails

## Actions

1. Map input, free summary, upgrade, full report, save, and share states.
2. Keep birth data private by default.
3. Preserve or improve premium upgrade paths.
4. Add tests for logic and privacy-sensitive payloads.
5. Include mobile and error state handling.

## Constraints

- Do not expose birth date, birth time, birth location, or timezone in share output by default.
- Do not make deterministic claims about relationships.
- Do not modify billing or database schema unless the task explicitly includes it.

## Definition of Done

- Flow has clear states and privacy-safe payloads.
- Upgrade path remains visible.
- Relevant tests or audits cover the changed behavior.

## Validation

- `npm run test`
- `npm run audit:share`
- `npm run typecheck`
- Browser smoke test.
