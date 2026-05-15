# Tianji Design Rules

Use this prompt context for `celestial-ui-implementer`, `relationship-flow-builder`, `share-card-og-builder`, and visual QA tasks.

## Visual Direction

- Premium celestial romance, not generic astrology stock.
- Deep navy, black plum, antique gold, rose amber, and restrained luminous accents.
- Use real Tianji product states, report surfaces, relationship flows, or generated brand assets where visual inspection matters.
- Avoid one-off decorative layouts when a reusable component is appropriate.

## Expected Components

- `StarField`
- `DestinyThread`
- `MysticCard`
- `CompassSeal`
- `BirthChartInput`
- `RelationshipOrbit`
- `RitualCTA`
- `CosmicFooter`

## Required States

Each reusable visual component should consider:

- Desktop layout
- Mobile layout
- Loading state
- Empty state
- Error state
- Reduced-motion mode
- Accessible labels or names for interactive controls

## UI Constraints

- Keep primary CTA visible early on mobile.
- Preserve pricing, FAQ, trust, disclaimer, and premium upgrade paths.
- Do not let text overflow or overlap on mobile or desktop.
- Do not add dependencies without explicit approval.
- For visual PRs, include screenshots or browser QA notes in the review packet.
