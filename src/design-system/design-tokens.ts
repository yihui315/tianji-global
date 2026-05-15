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
// ────────────────────────────────────────────
export const colors = {
  /** Core backgrounds — Taste Rule: deep space black + nebula */
  bgPrimary: '#03040a',
  bgNebula: 'rgba(167, 45, 62, 0.18)',
  bgSurface: 'rgba(6, 11, 22, 0.74)',

  /** Brand accents — Taste Rule: Gold #D4AF37 / #F5C542, Purple #7C3AED / #A78BFA */
  gold: '#D8B77B',
  goldLight: '#FFE3B4',
  goldDim: 'rgba(216, 183, 123, 0.16)',

  purple: '#B57248',
  purpleLight: '#FF9C8B',
  purpleDark: '#71352E',
  purpleDim: 'rgba(181, 114, 72, 0.16)',

  /** Functional palette */
  dataCyan: '#06B6D4',
  dataCyanDim: 'rgba(6, 182, 212, 0.15)',
  riskRed: '#EF4444',
  riskRedDim: 'rgba(239, 68, 68, 0.15)',
  successGreen: '#10B981',
  successGreenDim: 'rgba(16, 185, 129, 0.15)',

  /** Glow */
  glowPurple: 'rgba(255, 124, 130, 0.28)',
  glowGold: 'rgba(216, 183, 123, 0.34)',

  /** Text hierarchy (on dark backgrounds) */
  textPrimary: '#FFF4DD',
  textSecondary: 'rgba(244, 215, 163, 0.74)',
  textTertiary: 'rgba(216, 183, 123, 0.52)',
  textMuted: 'rgba(244, 215, 163, 0.28)',

  /** Borders */
  borderSubtle: 'rgba(181, 114, 72, 0.26)',
  borderMedium: 'rgba(181, 114, 72, 0.42)',
  borderStrong: 'rgba(216, 183, 123, 0.54)',
} as const;

// ────────────────────────────────────────────
// 2. Typography Tokens
// ────────────────────────────────────────────
export const typography = {
  hero: {
    fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
    fontWeight: 400,
    lineHeight: 0.96,
    letterSpacing: '0',
    fontFamily: 'var(--font-instrument-serif), serif',
    fontStyle: 'italic' as const,
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: '0',
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
  heroGlass: '0.875rem',
  card: '0.75rem',
  cardLg: '0.875rem',
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
    'inset 0 0 0 1px rgba(255, 217, 157, 0.025), 0 20px 60px rgba(0, 0, 0, 0.24)',
  strongGlass:
    'inset 0 0 0 1px rgba(255, 217, 157, 0.035), 0 28px 80px rgba(0, 0, 0, 0.34)',
  glow: (color: string = colors.glowPurple) =>
    `0 0 40px ${color}`,
  glowStrong: (color: string = colors.glowPurple) =>
    `0 0 60px ${color}, 0 0 120px ${color}`,
  focusRing: `0 0 0 2px ${colors.purpleLight}, 0 0 0 4px rgba(255, 124, 130, 0.22)`,
  cardHover:
    '0 16px 46px rgba(0, 0, 0, 0.34), 0 0 24px rgba(181, 114, 72, 0.08)',
} as const;

// ────────────────────────────────────────────
// 6. Glass Backdrop Tokens
// ────────────────────────────────────────────
export const glass = {
  soft: {
    background: 'rgba(6, 11, 22, 0.54)',
    backdropFilter: 'blur(4px)',
    border: `1px solid ${colors.borderSubtle}`,
    boxShadow: shadows.softGlass,
  },
  strong: {
    background: 'rgba(6, 11, 22, 0.78)',
    backdropFilter: 'blur(50px)',
    border: `1px solid ${colors.borderMedium}`,
    boxShadow: shadows.strongGlass,
  },
  card: {
    background: 'rgba(7, 11, 22, 0.68)',
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
