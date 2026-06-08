# TianJi GStack Oracle Upgrade Plan

Date: 2026-05-03

## GStack Skill Stack

- `plan-ceo-review`: collapse TianJi from a feature mall into one core promise.
- `plan-design-review`: make the first screen, preview, and payment moment feel like one guided ritual.
- `plan-eng-review`: keep the change incremental by upgrading `/ask` before adding new systems.
- `tdd`: lock the public money path with tests before and after the UI/prompt change.

## CEO Review

Current diagnosis: TianJi is technically live, but the product story is scattered. Users see many metaphysical modules before they understand what problem TianJi solves. The paid moment exists, but it does not yet create enough desire because the preview does not clearly promise what the full result contains.

New product promise:

> Ask one important question. TianJi turns it into a structured decision reading: situation, hidden tension, timing, next move, and reflection.

This keeps the spiritual tone but makes the value concrete. The first monetizable product is not "AI divination"; it is "a private decision ritual for one stuck question."

## Design Review

The upgraded journey should feel like this:

1. First screen: one question box, one primary CTA.
2. Free preview: show a credible first signal, not a generic paragraph.
3. Paywall: list exactly what unlock includes.
4. Checkout: one-time payment, no subscription anxiety.
5. After payment: full five-part reading, then ask user to save or join.

Conversion copy pattern:

- Free: "Here is the first signal."
- Paid: "Unlock the complete synthesis: situation, hidden tension, timing, next move, reflection."
- Retention: "Save this reading and build your TianJi journal."

## Engineering Review

Phase 1 must be small and shippable:

- Upgrade `/api/ask/preview` system prompt and fallback output to the five-part synthesis format.
- Move `/ask` page copy to a clean `tianji-oracle-copy` module so Chinese product copy is not tied to older mojibake-prone text.
- Add an explicit unlock-benefits list under the preview.
- Route homepage primary CTA to `/ask`.
- Keep existing Stripe unlock APIs unchanged.

Phase 2:

- Add saved reading after payment.
- Add account creation after payment, not before payment.
- Add an "Ask a follow-up" paid or credit-based step.
- Add funnel analytics: visit, preview, unlock click, checkout URL created, paid webhook.

## TDD Acceptance

- Ask preview returns readable Chinese and English.
- Ask fallback includes the synthesis markers.
- `/ask` renders purchase reasons before checkout.
- Typecheck passes.
- Vitest passes.
- Production build passes.

## Competitive Notes

- Crystal Stream Tarot uses free tokens and account save as the retention hook.
- ReadMyCards uses monthly free readings plus premium spreads.
- Phantara's strongest positioning is memory: readings evolve with the user.
- Arcana Noctis sells "a reading that listens back" through guided prompts and credits.
- Tarotia leads with one emotional doubt, free readings, social proof, and native-language breadth.

TianJi should borrow the journey shape, not the surface aesthetics: free signal, clear unlock value, memory after the first meaningful reading.
