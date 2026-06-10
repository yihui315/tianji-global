# TianJi Love Conversion Implementation Backlog

Status: Draft backlog only. Do not edit app code until a specific implementation PR is approved.

## Homepage

### P0 - Make the first CTA route to relationship intent

Business goal: Turn cold social traffic into free relationship test starts.

Target route: /

Implementation files likely affected: `src/app/(main)/page.tsx`, `src/components/home/TianjiLoveHome.tsx`

Acceptance criteria: First viewport has one dominant CTA to `/relationship/new`; secondary CTA can point to `/ask`; copy mentions private relationship clarity without guarantees.

Risk notes: Do not remove pricing, trust, FAQ, or disclaimer content.

Suggested priority: P0

### P1 - Add low-price question bridge below hero

Business goal: Move users who do not want a full test into `/ask` paid intent.

Target route: /

Implementation files likely affected: `src/components/home/TianjiLoveHome.tsx`

Acceptance criteria: A compact section offers “问一个具体问题” with examples like “我现在要不要主动联系他？” and routes to `/ask`.

Risk notes: Avoid exact price claims unless product pricing is already confirmed in UI.

Suggested priority: P1

## /relationship/new

### P0 - Strengthen free test promise and next-step CTA

Business goal: Increase free test completion from social emotional hooks.

Target route: /relationship/new

Implementation files likely affected: `src/app/relationship/new/**`, `src/components/relationship/**`

Acceptance criteria: Above-the-fold copy says users get a private relationship stage, risk point, and next action; CTA text is action-specific, not generic.

Risk notes: No guaranteed reconciliation, no supernatural certainty.

Suggested priority: P0

### P1 - Add post-result upgrade bridge

Business goal: Convert free relationship result viewers into deep report intent.

Target route: /relationship/new result state

Implementation files likely affected: `src/components/relationship/RelationshipResult.tsx`

Acceptance criteria: Result page offers a deeper report CTA after free summary, with clear value bullets and privacy-safe wording.

Risk notes: Do not expose birth date/time/location/timezone in share outputs.

Suggested priority: P1

## /ask

### P0 - Package /ask around one painful question

Business goal: Increase low-price conversion from social posts about断联/主动/暧昧.

Target route: /ask

Implementation files likely affected: `src/app/(main)/ask/**`, `src/lib/ai-prompts.ts`

Acceptance criteria: Page examples include “他现在到底在想什么？”, “我现在要不要主动联系？”, and “暧昧对象是不是认真？”; CTA frames the answer as an interpretation, not certainty.

Risk notes: Avoid fake urgency and guaranteed outcome language.

Suggested priority: P0

## /draw

### P1 - Reframe draw as daily love action guidance

Business goal: Use lighter daily content to capture repeat traffic and route to paid questions.

Target route: /draw

Implementation files likely affected: `src/app/(main)/draw/**`, `src/lib/ai-prompts.ts`

Acceptance criteria: Draw copy supports “今日爱情能量 / 今日天机”; result CTA recommends `/ask` for a specific follow-up question.

Risk notes: Keep guidance reflective; do not claim supernatural certainty.

Suggested priority: P1

## /pricing

### P1 - Repackage low-price and deep-report ladder

Business goal: Make monetization path clear: free test -> single question -> deep report.

Target route: /pricing

Implementation files likely affected: `src/app/(main)/pricing/page.tsx`

Acceptance criteria: Pricing page clearly distinguishes free entry, single-question interpretation, and deep relationship report; CTA routes are consistent.

Risk notes: Do not change Stripe checkout behavior without separate paid-smoke approval.

Suggested priority: P1

## /report/share

### P2 - Add privacy-safe share prompt

Business goal: Encourage organic sharing without exposing sensitive relationship data.

Target route: report/share surfaces

Implementation files likely affected: `src/components/share/**`, relationship result/share components

Acceptance criteria: Share prompt uses a safe one-liner and does not expose birth date, birth time, birth location, timezone, or private answer details.

Risk notes: Must pass share privacy audit.

Suggested priority: P2

## Analytics

### P0 - Track social-to-route funnel events

Business goal: Know which themes produce clicks and paid intent.

Target route: /, /relationship/new, /ask, /draw, /pricing

Implementation files likely affected: `src/lib/analytics/**`, route client components

Acceptance criteria: Track route entry, CTA click, test start, ask start, paid unlock click, and source campaign label when available.

Risk notes: No PII, no secret keys, no production analytics provider changes without approval.

Suggested priority: P0

