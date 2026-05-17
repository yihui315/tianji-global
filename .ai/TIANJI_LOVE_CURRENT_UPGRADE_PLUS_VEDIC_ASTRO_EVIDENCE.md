# TianJi Love Current Upgrade + Vedic Astro Evidence

## What Changed

Added Vedic/Jyotish V1 as an internal TianJi Love relationship-report capability. The work is additive and feature-flagged: no production route, payment route, database mutation, email send, or live provider path was connected.

## Files Changed

- `.agents/skills/tianji-vedic-astro/SKILL.md`
- `.agents/skills/tianji-vedic-astro/agents/openai.yaml`
- `.ai/TIANJI_LOVE_CURRENT_UPGRADE_PLUS_VEDIC_ASTRO_TASK.md`
- `.ai/TIANJI_LOVE_CURRENT_UPGRADE_PLUS_VEDIC_ASTRO_EVIDENCE.md`
- `.ai/CHANGELOG_AI.md`
- `.ai/REVIEW_PACKET.md`
- `src/lib/astro/vedic/types.ts`
- `src/lib/astro/vedic/config.ts`
- `src/lib/astro/vedic/safety.ts`
- `src/lib/astro/vedic/prompts.ts`
- `src/lib/astro/vedic/kundli-pdf-parser.ts`
- `src/lib/astro/vedic/report-generator.ts`
- `src/lib/astro/vedic/index.ts`
- `src/lib/astro/vedic/__fixtures__/sample-kundli-text.txt`
- `src/lib/astro/vedic/__fixtures__/sample-chart-data.json`
- `src/__tests__/vedic-astro-types.test.ts`
- `src/__tests__/vedic-prompt-safety.test.ts`
- `src/__tests__/vedic-report-generator.test.ts`
- `src/__tests__/vedic-kundli-parser.test.ts`

## Commands Run

- Read workspace and project instructions.
- Read existing package scripts and nearby report/gateway tests.
- RED: `npm run test -- src/__tests__/vedic-astro-types.test.ts src/__tests__/vedic-prompt-safety.test.ts src/__tests__/vedic-report-generator.test.ts src/__tests__/vedic-kundli-parser.test.ts`
- Initialized `.agents/skills/tianji-vedic-astro` with the skill creator helper.
- GREEN: `npm run test -- src/__tests__/vedic-astro-types.test.ts src/__tests__/vedic-prompt-safety.test.ts src/__tests__/vedic-report-generator.test.ts src/__tests__/vedic-kundli-parser.test.ts`
- `npm run typecheck`
- `python C:\Users\Administrator\.codex\skills\.system\skill-creator\scripts\quick_validate.py .agents\skills\tianji-vedic-astro`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run audit:routes`
- `npm run audit:copy`
- `npm run audit:share`
- `npm run audit:upgrade`
- `npm run audit:ask-revenue-contract`
- `npm run audit:draw-revenue-contract`
- `npm run audit:staging:degraded`
- `npm run build:staging:degraded`
- `git diff --check`
- Targeted secret-shape scan over new/updated Vedic files and `.ai` evidence.

## Test Results

Targeted Vedic tests passed:

- `src/__tests__/vedic-astro-types.test.ts`
- `src/__tests__/vedic-prompt-safety.test.ts`
- `src/__tests__/vedic-report-generator.test.ts`
- `src/__tests__/vedic-kundli-parser.test.ts`

Full validation passed:

- Typecheck passed.
- Lint passed.
- Full tests passed: 65 files / 539 tests.
- Build passed: 106 static pages, with existing NextAuth/jose Edge runtime warnings.
- Staging degraded build passed.
- Route/copy/share/upgrade audits passed.
- Ask revenue contract remained `conditional-go`.
- Draw revenue contract remained `conditional-go`.
- `audit:staging:degraded` remained `go`.
- Targeted secret-shape scan found no raw key-shaped values.

## Current Decision Status

```text
Current staging/degraded baseline: unchanged
Ask/Draw paid unlock guards: unchanged
Vedic Skill Scaffold: Go
Vedic Prompt Safety: Go
Vedic PDF Parser: Conditional Go
Vedic Production Integration: No-Go
Vedic Paid Unlock Integration: No-Go
Recommended next step: V2 relationship-flow integration behind feature flag
```

## Known Limitations

- The Kundli parser is a V1 text parser only. It accepts copied PDF text or extracted text and parses obvious fields when present.
- No OCR was added.
- No external API call was added.
- Missing chart data is returned as warnings and is not fabricated.
- Prompt builders do not call AI providers.
- The Vedic module is not wired into `/relationship/new`, Ask, Draw, Stripe, Supabase, Resend, or production deployment.

## Next Step

After staging degraded deploy and non-paid smoke are stable, implement V2 by connecting this Vedic domain layer to the Relationship Reading paid report flow behind:

```text
NEXT_PUBLIC_TIANJI_VEDIC_ENABLED=true
TIANJI_VEDIC_REPORT_MODE=preview
```
