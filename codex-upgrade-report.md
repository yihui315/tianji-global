# Relationship A/B Pass

## What changed
- Ran one focused A/B evolution pass on the `hero summary` surface for the Relationship module.
- Implemented the stronger winner in `src/lib/relationship-engine.ts`.
- Added experiment artifacts:
  - `experiments/relationship/variant-a.json`
  - `experiments/relationship/variant-b.json`
  - `ab-result.json`
  - updated `experiments/manifest.json`
- Added a regression test for the new hero-summary structure.

## Why it changed
- The previous hero summary was generic and underused the computed relationship pattern.
- The winning variant makes the pattern visible immediately and gives a clearer next step based on the weakest dimension.

## Winner
- Winner: `Variant B`
- Reason: stronger clarity, better actionability, better share-readability, and no privacy regression.

## Scope
- `src/lib/relationship-engine.ts`
- `src/__tests__/lib/relationship-engine.test.ts`
- `experiments/**`
- `ab-result.json`

## Required checks
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test` ✅
- `npm run build` ✅
- `npm run audit:routes` ✅
- `npm run audit:copy` ✅
- `npm run audit:share` ✅
- `npm run audit:upgrade` ✅

## Validation notes
- `lint` still reports pre-existing warnings outside this experiment scope, but exits successfully.
- `build` still reports a non-blocking Edge runtime warning, but exits successfully.

## Risks / follow-ups
- This pass improved wording only; it did not change premium gating or share modes.
- A next pass could target either `dimension card wording` or the `premium upgrade section`, but not both in one run.
