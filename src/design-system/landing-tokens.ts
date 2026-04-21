import { colors, radii, shadows, spacing } from './design-tokens';

/**
 * Semantic landing tokens for premium marketing surfaces.
 * These sit on top of the core design tokens and remain visual-only.
 */
export const landingTokens = {
  hero: {
    minHeight: 'min-h-[100svh]',
    overlay:
      'linear-gradient(180deg, rgba(10,10,10,0.22) 0%, rgba(10,10,10,0.52) 58%, rgba(10,10,10,0.9) 100%)',
    vignette:
      'radial-gradient(circle at 50% 28%, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0.04) 38%, rgba(10,10,10,0.82) 100%)',
    topGlow:
      'radial-gradient(circle at 20% 15%, rgba(212,175,55,0.14) 0%, transparent 38%)',
    sideGlow:
      'radial-gradient(circle at 82% 32%, rgba(167,139,250,0.16) 0%, transparent 44%)',
  },
  section: {
    pageBackground:
      'linear-gradient(180deg, #050508 0%, #0a0a0a 18%, #130814 56%, #07070a 100%)',
    spotlight:
      'radial-gradient(circle at 50% 20%, rgba(124,58,237,0.12) 0%, transparent 44%)',
    divider:
      'linear-gradient(90deg, transparent 0%, rgba(212,175,55,0.5) 50%, transparent 100%)',
    border: colors.borderSubtle,
    maxWidth: 'max-w-7xl',
    proseWidth: 'max-w-3xl',
  },
  glass: {
    borderRadius: radii.cardLg,
    outline: `1px solid ${colors.borderSubtle}`,
    strongOutline: `1px solid ${colors.borderMedium}`,
    softShadow: shadows.softGlass,
    glow: shadows.glow('rgba(167,139,250,0.18)'),
  },
  layout: {
    sectionGap: spacing.sectionGap,
    sectionGapSm: spacing.sectionGapSm,
    gridGap: spacing.gridGapLg,
  },
  trust: {
    chipBackground: 'rgba(255,255,255,0.03)',
    chipBorder: colors.borderSubtle,
    chipText: colors.textSecondary,
  },
} as const;

export type LandingTokens = typeof landingTokens;
