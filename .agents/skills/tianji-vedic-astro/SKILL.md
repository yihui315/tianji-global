---
name: tianji-vedic-astro
description: Use for TianJi Love Vedic/Jyotish relationship-report work, including Kundli text parsing, sidereal chart interpretation prompts, love destiny reports, compatibility reports, marriage timing windows, relationship red flags, and 5-year love forecasts. Use when building or reviewing Vedic astrology report logic, prompts, safety boundaries, or high-ticket relationship report templates.
---

# TianJi Vedic Astro

## Purpose

Build Vedic/Jyotish relationship readings for TianJi Love as a premium report layer, not as a standalone toy tool.

Default assumptions:

- Zodiac: sidereal.
- Ayanamsa: Lahiri unless source chart data states otherwise.
- Output: reflective relationship guidance, not deterministic prediction.

## Core Concepts

Use these chart signals when present:

- Moon sign and Moon Nakshatra for emotional needs.
- Ascendant and 7th house for relationship orientation.
- Venus, Mars, and Jupiter for attraction, desire, repair, and long-term bonding themes.
- Dasha and Antardasha periods for timing windows.
- House/planet/nakshatra facts as calculation inputs; keep them distinct from interpretation.

## Use Cases

- TianJi Love Vedic Relationship Destiny Report.
- Compatibility report.
- Marriage or long-term bond timing window.
- Relationship red flags and growth lessons.
- 5-year love forecast.

## Workflow

1. Confirm the feature is behind Vedic flags and not production-default.
2. Parse only explicit Kundli text fields or trusted structured chart data.
3. Never fabricate missing birth, chart, planet, house, nakshatra, or dasha data.
4. Build prompts that cite exact chart fields used.
5. Separate calculation facts from interpretation.
6. Use timing-window language and observable relationship signals.
7. Generate report sections with chart signal, relationship meaning, and practical guidance.
8. Keep Ask/Draw/Stripe/Supabase/Resend integration out of V1 unless explicitly assigned.

## Safety

Always include an entertainment and self-reflection disclaimer.

Do not:

- claim guaranteed marriage, divorce, breakup, death, pregnancy, illness, legal, or financial outcomes
- make deterministic statements about another person's future choices
- use fear-based upsells
- pressure users into expensive remedies
- provide medical, legal, or financial advice
- expose birth date, birth time, birth location, timezone, raw prompts, or private profile data in logs or public output

Prefer:

- "This points to a possible pattern..."
- "Treat this as reflection, not certainty."
- "Look for observable signals..."
- "A practical next step is..."
