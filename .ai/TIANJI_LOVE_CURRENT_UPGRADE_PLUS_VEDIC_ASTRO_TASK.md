# TianJi Love Current Upgrade + Vedic Astro Integration Task

## Objective

Integrate a Vedic astrology relationship-report capability into the existing TianJi Love upgrade path without blocking the current staging/degraded deployment, Ask/Draw paid unlock guards, or relationship reading flow.

This is an implementation-first V1 task. Production integration, paid unlock integration, live provider calls, Stripe smoke, Supabase mutation, email send, and production deploy are out of scope.

## Baseline

- Ask paid unlock guard: Go
- Draw paid unlock guard: Go
- Stripe webhook degraded guard: Go
- Provider live-disabled guard: Go
- Email send-disabled guard: Go
- Supabase mutation-disabled guard: Go
- `audit:staging:degraded`: Go

## Scope

Create:

- `.agents/skills/tianji-vedic-astro/SKILL.md`
- `src/lib/astro/vedic/types.ts`
- `src/lib/astro/vedic/prompts.ts`
- `src/lib/astro/vedic/report-generator.ts`
- `src/lib/astro/vedic/kundli-pdf-parser.ts`
- `src/lib/astro/vedic/safety.ts`
- `src/lib/astro/vedic/config.ts`
- Vedic fixtures under `src/lib/astro/vedic/__fixtures__/`
- Vedic tests under `src/__tests__/`
- `.ai/TIANJI_LOVE_CURRENT_UPGRADE_PLUS_VEDIC_ASTRO_EVIDENCE.md`

## Constraints

- Do not deploy to production.
- Do not read or print secrets.
- Do not mutate production Supabase.
- Do not call Stripe live mode.
- Do not perform paid smoke.
- Do not break existing Ask/Draw/Relationship routes.
- Keep Vedic production integration No-Go for V1.
- Keep Vedic paid unlock integration No-Go for V1.

## Acceptance Criteria

1. The new Vedic skill exists.
2. Vedic domain types exist.
3. Prompt builders exist.
4. Parser placeholder exists.
5. Markdown report generator exists.
6. Safety/config defaults prevent accidental production activation.
7. Tests exist and pass.
8. Evidence file is created.
9. No production deploy is attempted.
10. Existing Ask/Draw/Relationship flows are not intentionally changed.
