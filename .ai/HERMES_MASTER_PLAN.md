# Hermes Master Plan — Tianji Love Premium Design Upgrade

## Mission
Turn tianji.love into a premium, trustworthy, high-conversion relationship divination product using the research-backed design direction:

> Deep moonlit purple + warm gold linework + private, explainable relationship guidance.

## Business Priorities
1. Increase first-payment conversion.
2. Reduce trust friction before payment.
3. Create a premium visual identity without hurting performance.
4. Unify brand/domain/pricing copy.
5. Build a repeatable design system for future Love Reading, Ask, Draw, Daily Oracle, and Dashboard pages.

## Recommended Sprint Structure

### Sprint 1 — Trust and Consistency Gate
**Goal:** Remove contradictions that hurt trust.

Tasks:
- Audit metadata, domain, email, brand names, pricing text, CTA labels.
- Replace inconsistent `tianji.global` public metadata with `tianji.love` where appropriate.
- Unify user-facing brand name as `Tianji Love`.
- Create evidence report.

Acceptance:
- No accidental public `tianji.global` copy in Tianji Love pages unless deliberately parent-brand context.
- No mixed contact email policy.
- No obvious price contradictions on homepage/pricing/About.

### Sprint 2 — Moonlit Goldline Design System
**Goal:** Implement visual tokens and component styling.

Tasks:
- Add or update theme tokens.
- Apply theme to global background, text, cards, buttons, form fields, trust cards.
- Keep reduced motion and accessibility intact.

Acceptance:
- Homepage and core cards visually align with Moonlit Goldline.
- Primary CTA is visually dominant; secondary CTA is clear but lower weight.
- Contrast is readable on mobile and desktop.

### Sprint 3 — Homepage Conversion Rewrite
**Goal:** Make the homepage guide users into a short funnel.

Tasks:
- Reduce hero CTAs to two.
- Add intent selector.
- Move trust layer above or near first form.
- Add unlock explanation and evidence cards.
- Remove or replace fake-looking testimonials with anonymous scenario cards/method cards.

Acceptance:
- Above the fold answers: What is this? Is it private? What do I do first?
- The page leads to Love Reading and Ask clearly.
- No fake claims added.

### Sprint 4 — Pricing Clarity
**Goal:** Make buying decision simple.

Tasks:
- Present a product ladder: Free Preview / One Question / Full Love Report / Monthly Pass / Annual Pass.
- Clarify “best for” per plan.
- Add “what you get” checklists.
- Link to refund/terms/privacy if real routes exist.

Acceptance:
- User can understand which product to buy in under 10 seconds.
- No backend price changes unless existing contract is confirmed.

### Sprint 5 — Method / Trust Center
**Goal:** Make Tianji Love feel safer and more explainable than generic divination sites.

Tasks:
- Add/upgrade method section.
- Explain reflective guidance boundary.
- Explain privacy handling and data deletion path if supported.
- Add “not for crisis / medical / legal / financial advice” disclaimer.

Acceptance:
- Payment-adjacent pages link to Method/Trust.
- Trust page is scannable, not just legal text.

### Sprint 6 — QA Gate
**Goal:** Confirm no regression.

Tasks:
- Run lint/typecheck/build/test scripts available in `package.json`.
- Run text scans for risky claims and stale brand/domain strings.
- Record results in `.ai/TIANJI_LOVE_DESIGN_QA_GATE.md`.

Acceptance:
- Go only if build/test pass and no safety claim issues.
- Otherwise mark No-Go with exact blockers.

## Stop Conditions
Hermes must stop and report instead of continuing if:
- A task requires live payment credentials.
- A task requires production deployment.
- A task requires production database mutation.
- Tests reveal critical checkout/webhook regression.
- The repository has unrelated dirty changes that would be overwritten.
