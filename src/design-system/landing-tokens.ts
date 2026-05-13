import { colors, radii, shadows, spacing } from './design-tokens';

/**
 * Semantic landing tokens for premium marketing surfaces.
 * These sit on top of the core design tokens and remain visual-only.
 */
export const landingTokens = {
  hero: {
    minHeight: 'min-h-[100svh]',
    overlay:
      'linear-gradient(180deg, rgba(3,4,10,0.18) 0%, rgba(3,4,10,0.48) 58%, rgba(3,4,10,0.92) 100%)',
    vignette:
      'radial-gradient(circle at 54% 28%, rgba(255,124,130,0.14) 0%, rgba(181,114,72,0.06) 38%, rgba(3,4,10,0.82) 100%)',
    topGlow:
      'radial-gradient(circle at 20% 15%, rgba(216,183,123,0.14) 0%, transparent 38%)',
    sideGlow:
      'radial-gradient(circle at 82% 32%, rgba(255,92,99,0.13) 0%, transparent 44%)',
  },
  section: {
    pageBackground:
      'linear-gradient(180deg, #050812 0%, #03040a 40%, #070914 100%)',
    spotlight:
      'radial-gradient(circle at 50% 20%, rgba(255,124,130,0.11) 0%, transparent 44%)',
    divider:
      'linear-gradient(90deg, transparent 0%, rgba(216,183,123,0.58) 50%, transparent 100%)',
    border: colors.borderSubtle,
    maxWidth: 'max-w-7xl',
    proseWidth: 'max-w-3xl',
  },
  glass: {
    borderRadius: radii.cardLg,
    outline: `1px solid ${colors.borderSubtle}`,
    strongOutline: `1px solid ${colors.borderMedium}`,
    softShadow: shadows.softGlass,
    glow: shadows.glow('rgba(181,114,72,0.2)'),
  },
  layout: {
    sectionGap: spacing.sectionGap,
    sectionGapSm: spacing.sectionGapSm,
    gridGap: spacing.gridGapLg,
  },
  trust: {
    chipBackground: 'rgba(7,11,22,0.66)',
    chipBorder: colors.borderSubtle,
    chipText: colors.textSecondary,
  },
} as const;

export type LandingTokens = typeof landingTokens;
