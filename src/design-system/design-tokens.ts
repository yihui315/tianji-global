/**
 * TianJi Design System — Design Tokens
 *
 * Single source of truth for brand colors, typography, spacing,
 * border-radius, and shadow / glass tokens.
 *
 * Every page (homepage, report, pricing, FAQ, dashboard) consumes
 * these tokens instead of defining ad-hoc values.
 */

// ────────────────────────────────────────────
// 1. Brand Color Tokens
// Theme: Moonlit Goldline / 月夜金线
// ────────────────────────────────────────────
export const colors = {
  /** Core backgrounds — Moonlit Goldline: deep violet + moonlit surface */
  bgPrimary: '#1C1533',
  bgNebula: 'rgba(30, 20, 60, 0.5)',
  bgSurface: 'rgba(255, 255, 255, 0.06)',
  bgSurfaceStrong: 'rgba(255, 255, 255, 0.10)',

  /** Brand accents — Warm rose-gold + muted lavender (Moonlit Goldline) */
  gold: '#D8B77B',
  goldLight: '#E8CFA0',
  goldDim: 'rgba(216, 183, 123, 0.15)',

  /** Rose blush accent — relationship/love warmth */
  rose: '#D99B93',
  roseLight: '#E8C4B8',
  roseDim: 'rgba(217, 155, 147, 0.15)',

  /** Muted lavender (replaces aggressive purple) */
  purple: '#9B8DC8',
  purpleLight: '#BDB0D8',
  purpleDark: '#7A6FAE',
  purpleDim: 'rgba(155, 141, 200, 0.15)',

  /** Functional palette */
  dataCyan: '#8BB8C8',
  dataCyanDim: 'rgba(139, 184, 200, 0.15)',
  riskRed: '#D99B93',
  riskRedDim: 'rgba(217, 155, 147, 0.15)',
  successGreen: '#9ED8C4',
  successGreenDim: 'rgba(158, 216, 196, 0.15)',

  /** Glow — warm gold (replaces purple glow) */
  glowPurple: 'rgba(216, 183, 123, 0.3)',
  glowGold: 'rgba(216, 183, 123, 0.4)',

  /** Text hierarchy — warm ivory tones (Moonlit Goldline) */
  textPrimary: '#F7F1E8',
  textSecondary: '#CDBFAD',
  textTertiary: 'rgba(205, 191, 173, 0.5)',
  textMuted: 'rgba(205, 191, 173, 0.3)',

  /** Borders — gold hairline (Moonlit Goldline) */
  borderSubtle: 'rgba(216, 183, 123, 0.12)',
  borderMedium: 'rgba(216, 183, 123, 0.20)',
  borderStrong: 'rgba(216, 183, 123, 0.32)',
} as const;

// ────────────────────────────────────────────
// 2. Typography Tokens
// ────────────────────────────────────────────
export const typography = {
  hero: {
    fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
    fontWeight: 400,
    lineHeight: 0.9,
    letterSpacing: '-2px',
    fontFamily: 'var(--font-instrument-serif), serif',
    fontStyle: 'italic' as const,
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: '-1px',
    fontFamily: 'var(--font-instrument-serif), serif',
    fontStyle: 'normal' as const,
  },
  cardTitle: {
    fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: '0',
    fontFamily: 'var(--font-barlow), sans-serif',
    fontStyle: 'normal' as const,
  },
  insightText: {
    fontSize: 'clamp(0.875rem, 1.2vw, 1rem)',
    fontWeight: 300,
    lineHeight: 1.7,
    letterSpacing: '0.02em',
    fontFamily: 'var(--font-barlow), sans-serif',
    fontStyle: 'normal' as const,
  },
  finePrint: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.03em',
    fontFamily: 'var(--font-barlow), sans-serif',
    fontStyle: 'normal' as const,
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: 600,
    lineHeight: 1,
    letterSpacing: '0.05em',
    fontFamily: 'var(--font-barlow), sans-serif',
    fontStyle: 'normal' as const,
  },
} as const;

// ────────────────────────────────────────────
// 3. Spacing Tokens
// ────────────────────────────────────────────
export const spacing = {
  /** Vertical gaps between major page sections */
  sectionGap: 'clamp(4rem, 10vw, 8rem)',
  sectionGapSm: 'clamp(3rem, 6vw, 5rem)',

  /** Card internal padding */
  cardPadding: 'clamp(1.25rem, 3vw, 2rem)',
  cardPaddingLg: 'clamp(1.5rem, 4vw, 2.5rem)',

  /** Grid gap for card layouts */
  gridGap: 'clamp(1rem, 2vw, 1.5rem)',
  gridGapLg: 'clamp(1.5rem, 3vw, 2rem)',

  /** Chart-specific internal spacing */
  chartGap: '0.75rem',
  chartPadding: '1rem',

  /** Inline / component-level spacing */
  inlineSm: '0.25rem',
  inlineMd: '0.5rem',
  inlineLg: '1rem',
  inlineXl: '1.5rem',
} as const;

// ────────────────────────────────────────────
// 4. Border Radius Tokens
// ────────────────────────────────────────────
export const radii = {
  heroGlass: '2rem',
  card: '1rem',
  cardLg: '1.5rem',
  badge: '9999px',
  input: '0.5rem',
  tooltip: '0.375rem',
  button: '9999px',
} as const;

// ────────────────────────────────────────────
// 5. Shadow / Glass Tokens
// ────────────────────────────────────────────
export const shadows = {
  softGlass:
    'inset 0 1px 1px rgba(216, 183, 123, 0.08)',
  strongGlass:
    '4px 4px 4px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(216, 183, 123, 0.12)',
  glow: (color: string = colors.glowGold) =>
    `0 0 40px ${color}`,
  glowStrong: (color: string = colors.glowGold) =>
    `0 0 60px ${color}, 0 0 120px ${color}`,
  focusRing: `0 0 0 2px ${colors.purple}, 0 0 0 4px rgba(155, 141, 200, 0.3)`,
  cardHover:
    '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(216, 183, 123, 0.15)',
} as const;

// ────────────────────────────────────────────
// 6. Glass Backdrop Tokens
// ────────────────────────────────────────────
export const glass = {
  soft: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(4px)',
    border: 'none',
    boxShadow: shadows.softGlass,
  },
  strong: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(50px)',
    border: 'none',
    boxShadow: shadows.strongGlass,
  },
  card: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: shadows.softGlass,
  },
} as const;

// ────────────────────────────────────────────
// 7. Z-Index Tokens
// ────────────────────────────────────────────
export const zIndex = {
  background: 0,
  particles: 2,
  stars: 3,
  overlay: 4,
  vignette: 6,
  content: 10,
  nav: 50,
  modal: 100,
  toast: 200,
} as const;
