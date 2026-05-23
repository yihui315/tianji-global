# Love-Test Personality Logic

The Love-Test MVP uses deterministic result logic. The same answer set must always produce the same score, archetype, headline, keywords, strengths, watchout, next step, and upsell question.

## Inputs

- relationship stage
- communication style
- emotional rhythm
- conflict pattern
- core value

## Output Bands

- 0-54: Tender Realist
- 55-69: Slow-Burn Builder
- 70-84: Heart Compass
- 85-100: Devoted Catalyst

## Public Share Rules

Public share payloads can include score, archetype, headline, one-line insight, keywords, next step, and share URL.

Public share payloads must not include birth date, birth time, birth location, timezone, private questions, raw result text, full report text, or internal prompts.

## Upsell Logic

Every result should include one practical next question that can open `/ask?source=love_test`.
