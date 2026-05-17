# TianJi Love Revenue Funnel Review - Lane B

Date: 2026-05-16
Worktree: `tianji-global-lane-b`
Scope: Frontend revenue funnel polish only.

## Current Homepage Journey

- `/` renders `src/components/home/TianjiLoveHome.tsx`.
- The route already offers Love Reading, Ask, Draw, Pricing, About, and Login.
- Primary CTA currently starts a relationship reading; Ask and Draw are secondary CTAs.
- The hero promise and testimonial language contain stronger fate/accuracy implications than the Lane B boundary allows.
- Product cards are currently abstract pattern cards rather than a clear Free Love Reading -> Ask One Question -> Draw Three Cards journey.
- The birth-chart form posts to the existing love-reading session route and falls back to `/ask` or `/relationship/new`; no backend change is needed for Lane B.

## Current Ask Preview Journey

- `/ask` preserves the existing preview and one-time unlock API calls.
- The preview displays the free answer, then a paid unlock block.
- The CTA is present, but it frames a "complete love reading" rather than a clearer relationship-answer unlock.
- No full answer is intentionally exposed before unlock, but the page needs stronger copy around what is unlocked and why it is reflection rather than certainty.

## Current Draw Preview Journey

- `/draw` preserves the existing preview and one-time unlock API calls.
- The free preview shows three timing card backs and a preview text.
- The paywall is present, but the copy is timing-first; Lane B needs explicit three-card relationship reading framing, one practical next step, and no guaranteed prediction language.

## Current Pricing Clarity

- `/pricing` preserves the existing Stripe subscription checkout contract.
- Monthly and Yearly plans are clear, but Free preview, one-time Ask unlock, and Draw unlock are not distinguished as separate funnel choices.
- The page already says paid plans unlock depth and history, not guaranteed predictions.
- It should more explicitly state that paid unlocks give depth, not certainty, and that subscriptions provide history/report-ready output where implemented.

## Current CTA Issues

- Homepage primary CTA should become "Start Free Love Reading".
- Ask preview CTA should become "Unlock the full relationship answer".
- Draw preview CTA should become "Unlock the full three-card relationship reading".
- Pricing unauthenticated plan clicks route to login but do not emit a login-start funnel event.

## Current Trust/Safety Copy Issues

- Homepage copy currently includes fate language and testimonial claims that imply prediction accuracy.
- Trust copy should emphasize private by default, reflection not certainty, no fear-based selling, and secure payment for unlocks.
- No medical, legal, or financial claims are needed for this funnel.

## Current Analytics Coverage

- Relationship module has relationship analytics events, but Lane B events are not fully mapped.
- Generic client analytics exists in `src/lib/analytics/client.ts`.
- Current client helper does not strip every Lane B sensitive payload key before sending.
- Required Lane B events to add or verify:
  - `relationship_start_click`
  - `relationship_free_result_view`
  - `relationship_upgrade_click`
  - `ask_preview_view`
  - `ask_unlock_click`
  - `draw_preview_view`
  - `draw_unlock_click`
  - `pricing_view`
  - `pricing_plan_click`
  - `login_start`

## Recommended Edits

1. Add a privacy-safe funnel event helper in `src/lib/analytics`.
2. Track homepage relationship/Ask/Draw starts without sending birth date, birth time, birth location, timezone, raw question, or result text.
3. Track Ask and Draw preview views after successful preview generation and unlock clicks before checkout start.
4. Track pricing view, plan click, and login-start redirect from pricing.
5. Update homepage hero, three product cards, trust strip, and upgrade logic copy.
6. Update Ask and Draw preview paywall copy.
7. Add pricing path clarity for Free preview, one-time Ask unlock, Draw unlock, Monthly, and Yearly.
8. Add focused contract tests for copy, CTA, and analytics payload privacy.
