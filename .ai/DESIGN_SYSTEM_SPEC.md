# Tianji Love Design System Spec — Moonlit Goldline

## Core Positioning
Tianji Love should feel like:

- A private relationship insight room
- A calm premium divination product
- A modern AI product with explainability
- Eastern mystery, but not cheap fortune-telling
- Emotional clarity, not anxiety selling

## Default Palette

| Token | Value | Use |
|---|---:|---|
| `--tj-bg` | `#1C1533` | Main page background |
| `--tj-bg-deep` | `#0E0A1F` | Hero and footer depth |
| `--tj-surface` | `rgba(255,255,255,0.06)` | Cards and panels |
| `--tj-surface-strong` | `rgba(255,255,255,0.10)` | Active cards |
| `--tj-text` | `#F7F1E8` | Primary text |
| `--tj-muted` | `#CDBFAD` | Secondary text |
| `--tj-gold` | `#D8B77B` | Primary CTA, border glow, key icons |
| `--tj-rose` | `#D99B93` | Warm emotional accent |
| `--tj-border` | `rgba(216,183,123,0.28)` | Hairline borders |
| `--tj-danger` | `#F4A7A3` | Error copy |
| `--tj-success` | `#9ED8C4` | Success/confirmation |

## Color Ratio
Default page ratio:

- 60% deep purple/black background
- 20% dark translucent surfaces
- 15% cream readable text
- 5% gold/rose accents

## Typography

English:
- Display: `Instrument Serif`, fallback `Playfair Display`, `Georgia`, serif
- Body: `Barlow`, fallback `Inter`, system sans

Chinese:
- Display: `Noto Serif SC` or `Source Han Serif SC`
- Body: `Noto Sans SC`, `Source Han Sans SC`, system sans

Recommended sizes:
- Desktop H1: 44–52px
- Mobile H1: 30–34px
- H2: 28–32px
- Body: 16–18px
- Helper text: minimum 14px
- Body line-height: 1.6–1.75

## Component Rules

### Buttons
Primary:
- Gold fill or gold gradient
- Deep text or high contrast text
- Minimum height 48px
- Border radius 12–16px

Secondary:
- Transparent or low-opacity surface
- Gold border
- Cream text

Do not show three equal-weight CTAs in hero.

### Cards
- Dark translucent surface
- Gold hairline border
- Subtle glow only on hover/focus
- Clear heading, one purpose per card

### Forms
- Label every field clearly.
- Add helper text for sensitive relationship input.
- Error copy must be direct and non-shaming.
- Use `aria-live` or equivalent for async result errors if present.

### Trust Cards
Use four default trust pillars:
1. Private by default
2. Reflective, not deterministic
3. Explainable method
4. Clear next step

### Motifs
Allowed motifs:
- Red thread
- Moon phase
- Gold line map
- Relationship rings
- Compass
- Hourglass
- Sealed letter / lock

Avoid:
- Cheap glitter overload
- Fake crystal-ball clichés
- Aggressive scarcity countdowns
- Guaranteed prediction badges

## Motion
- Use subtle CSS transition only.
- Respect `prefers-reduced-motion`.
- Avoid new heavy animation libraries.
- Avoid autoplay hero video in this pass.

## Accessibility
- Normal text contrast target: WCAG AA 4.5:1 or better.
- Large text/UI component contrast must be visibly clear.
- Keyboard focus state must be obvious.
- Images/icons that convey meaning need alt or accessible labels.
