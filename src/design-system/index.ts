/**
 * TianJi Design System — Barrel Export
 *
 * Import everything from '@/design-system' or cherry-pick sub-modules.
 *
 * Usage:
 *   import { colors, typography, variants } from '@/design-system';
 *   import { radarPalette } from '@/design-system/chart-tokens';
 */

export {
  colors,
  typography,
  spacing,
  radii,
  shadows,
  glass,
  zIndex,
} from './design-tokens';

export {
  easings,
  durations,
  transitions,
  variants,
  breathing,
  scrollReveal,
} from './motion-tokens';

export {
  radarPalette,
  timelineGradient,
  signalLayerFills,
  compatibilityColors,
  palaceAccents,
  chartSizing,
  chartMotion,
  chartLabels,
} from './chart-tokens';

export {
  heroHeadlines,
  heroSubtitles,
  ctaLabels,
  sectionHeadings,
  disclaimers,
  pricingPlans,
  testimonials,
  trustPillars,
} from './content-tokens';

export { landingTokens } from './landing-tokens';
export type { LandingTokens } from './landing-tokens';
