# TianJi Love Next Conversion Backlog 20260525

Status: Draft implementation backlog. Do not edit app code until a specific task is approved.

## P0 - Evidence layer / 准感 system for Ask, Draw, and Relationship

Impact: High. Makes AI output feel grounded, trustworthy, and worth unlocking.

Effort: Medium.

Risk: Medium. Must avoid claiming certainty or revealing private data.

Files likely affected:

```text
src/lib/ai-prompts.ts
src/app/relationship/new/**
src/components/relationship/**
src/app/(main)/ask/**
src/app/(main)/draw/**
```

Codex task title:

```text
feat(tianji-love): add evidence layer to relationship and question previews
```

Acceptance criteria:
- Free previews include 2-3 “why this reading says that” evidence bullets.
- Evidence references user-provided relationship context or reading structure, not hidden certainty.
- Copy says “based on signals” or “relationship pattern,” never “guaranteed.”
- No birth date/time/location/timezone leaks in share surfaces.

## P0 - Relationship paid unlock verification

Impact: High. Required before scaling paid-intent traffic.

Effort: Medium.

Risk: High. Touches paid funnel validation; must stay test/staging-only until approved.

Files likely affected:

```text
src/components/relationship/RelationshipResult.tsx
src/app/api/stripe/**
src/app/api/relationship/**
docs/tianji-love-paid-smoke-runbook.md
```

Codex task title:

```text
test(tianji-love): verify relationship paid unlock readiness without live payment
```

Acceptance criteria:
- Document free result -> unlock click -> checkout start path.
- Confirm paid smoke remains No-Go unless separately approved.
- Add or update tests for unlock CTA visibility and safe route behavior.
- No production Stripe checkout run.

## P0 - Analytics for free preview -> unlock click -> checkout start

Impact: High. Without this, Day 1 traffic cannot be tied to conversion intent.

Effort: Medium.

Risk: Medium. Must avoid PII and secrets.

Files likely affected:

```text
src/lib/analytics/**
src/app/relationship/new/**
src/app/(main)/ask/**
src/app/(main)/draw/**
src/app/(main)/pricing/**
```

Codex task title:

```text
feat(analytics): track TianJi Love preview and unlock funnel events
```

Acceptance criteria:
- Track route entry, test start, preview generated, unlock click, checkout start.
- Include source/campaign query labels when present.
- No PII, secret, or sensitive birth data in event payloads.
- Add focused tests for event shape if analytics utilities exist.

## P1 - Daily Tianji retention loop

Impact: Medium. Supports repeat visits after the first post.

Effort: Medium.

Risk: Low.

Files likely affected:

```text
src/app/(main)/draw/**
src/app/(main)/profile/**
src/lib/ai-prompts.ts
```

Codex task title:

```text
feat(tianji-love): add daily love energy retention loop
```

Acceptance criteria:
- `/draw` can position 今日天机 as a daily reflective check-in.
- Result CTA routes users to `/ask` for one specific relationship question.
- Copy remains reflective and non-deterministic.

## P1 - A/B CTA copy test

Impact: Medium. Helps identify which CTA drives more free-test starts.

Effort: Low.

Risk: Low.

Files likely affected:

```text
src/components/home/TianjiLoveHome.tsx
src/app/relationship/new/client.tsx
src/__tests__/**
```

Codex task title:

```text
test(tianji-love): compare relationship CTA copy variants
```

Acceptance criteria:
- Define two CTA variants for `/relationship/new`.
- Keep routes unchanged.
- Add a small contract test or documentation note for copy variants.

## P1 - Pricing page trust block

Impact: Medium. Improves confidence before paid unlock.

Effort: Low to Medium.

Risk: Medium. Do not alter Stripe behavior.

Files likely affected:

```text
src/app/(main)/pricing/page.tsx
```

Codex task title:

```text
feat(pricing): add TianJi Love trust and refund reassurance block
```

Acceptance criteria:
- Pricing page explains free test, single-question interpretation, and deep report ladder.
- Adds privacy, refund/support, and “not guaranteed outcome” reassurance.
- Does not change checkout execution.

## P2 - User feedback scoring loop

Impact: Medium. Helps improve “准感” over time.

Effort: Medium.

Risk: Medium. Must avoid sensitive data capture.

Files likely affected:

```text
src/components/relationship/**
src/app/(main)/ask/**
src/lib/analytics/**
```

Codex task title:

```text
feat(feedback): collect safe TianJi Love reading usefulness scores
```

Acceptance criteria:
- Users can mark a reading as useful / not useful.
- Optional text feedback is privacy-warned or deferred.
- No private relationship data is exposed in share or analytics.

## P2 - Weekly content automation refinement

Impact: Medium. Improves future MiniMax output quality after real traffic arrives.

Effort: Low.

Risk: Low.

Files likely affected:

```text
scripts/tianji-love/generate-daily-growth.mjs
scripts/tianji-love/generate-content-calendar.mjs
scripts/tianji-love/generate-kpi-analysis.mjs
scripts/tianji-love/generate-conversion-suggestions.mjs
.ai/publishing/**
```

Codex task title:

```text
chore(marketing): refine TianJi Love prompts from weekly publishing KPI
```

Acceptance criteria:
- Use real manually entered KPI rows only.
- Do not invent views, clicks, conversions, testimonials, or platform stats.
- Update prompts only after content scoring shows C/D patterns or weak CTA quality.

