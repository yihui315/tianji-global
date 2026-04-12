# TianJi Component Guidelines

> Rules and conventions for building and using TianJi UI components. Every component in `src/components/ui/` follows these guidelines.

---

## 1. Component Categories

| Category | Purpose | Examples |
|---|---|---|
| **Base** | Atomic, highly reusable UI primitives | `MysticButton`, `GlassCard`, `SectionHeader`, `StatBadge`, `TrustChip` |
| **Chart** | Data-visualisation wrappers | `EnergyRadar`, `FortuneTimeline`, `SignalLayers`, `CompatibilityGraph`, `PalaceGridMini` |
| **Conversion** | Revenue / engagement drivers | `PricingCard`, `TestimonialCard`, `FAQAccordion`, `FinalCTA` |
| **Trust** | Responsible-use and credibility | `PrivacyNote`, `ResponsibleUseNotice`, `MethodBadge`, `HowItWorksSteps` |

---

## 2. Naming Convention

- **PascalCase** file and export names: `MysticButton.tsx` → `export function MysticButton`
- Component file lives in the category folder: `src/components/ui/`, `src/components/charts/`, etc.
- Prefix internal sub-components with the parent name: `PricingCardFeature`, `FAQAccordionItem`

---

## 3. Token Consumption

Every component **must** import its visual values from the design system:

```ts
import { colors, radii, shadows } from '@/design-system';
```

**Never** hard-code hex colors, pixel spacings, or animation durations inline.

Exception: one-off layout values (e.g. `max-width: 600px` for a specific content area) are acceptable as Tailwind classes.

---

## 4. Props Contract

- All components accept an optional `className?: string` for composition
- Use `React.ComponentPropsWithoutRef<'element'>` for native HTML props passthrough when appropriate
- Document required vs. optional props with JSDoc or inline comments
- Prefer `children` for content injection over string props (except short labels)

---

## 5. Animation Rules

- Use `variants` and `transitions` from `@/design-system/motion-tokens`
- Wrap animating elements in `<motion.div>` with `initial`, `animate`, and `transition` from tokens
- Respect `prefers-reduced-motion` — the global CSS already disables animations, but components should also check when using JS-driven animations
- Ambient / looping animations (breathing, radar pulse) use the `breathing` or `radarPulse` presets

---

## 6. Responsive Rules

- Mobile-first design: base styles target phones, then `sm:`, `md:`, `lg:` breakpoints
- Hide decorative-heavy elements (tarot cards, large particle systems) below `lg:` (1024 px)
- Use `clamp()` for font sizes and spacing (values defined in design tokens)
- Touch targets: minimum `44 × 44 px`

---

## 7. Accessibility

- All interactive elements must be keyboard-navigable
- Use semantic HTML (`<button>`, `<a>`, `<section>`, `<nav>`)
- Provide `aria-label` for icon-only buttons
- Color contrast: text on glass backgrounds must meet WCAG AA (4.5:1 for body text, 3:1 for large text)
- Decorative elements use `aria-hidden="true"`

---

## 8. Glass Pattern

Two glass levels are available via design tokens:

| Level | When to use |
|---|---|
| `glass.soft` | Badges, nav pills, light overlays |
| `glass.strong` | Cards, panels, modals |
| `glass.card` | Content cards with visible borders |

Apply via inline styles or by mapping to Tailwind utilities that reference the token values.

---

## 9. File Structure Target

```
src/components/
├── ui/                  # Base components
│   ├── MysticButton.tsx
│   ├── GlassCard.tsx
│   ├── SectionHeader.tsx
│   ├── StatBadge.tsx
│   ├── TrustChip.tsx
│   ├── FAQAccordion.tsx
│   ├── PricingCard.tsx
│   └── TestimonialCard.tsx
├── charts/              # Chart components (existing + new)
├── hero/                # Hero section components
├── mystic-hero/         # Mystic hero sub-system
└── ...
```

---

## 10. Composition Example

Pages should compose components like building blocks:

```tsx
<SectionHeader titleKey="services" />
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <GlassCard>…</GlassCard>
  <GlassCard>…</GlassCard>
  <GlassCard>…</GlassCard>
</div>
```

Not one large JSX block with inline styles.
