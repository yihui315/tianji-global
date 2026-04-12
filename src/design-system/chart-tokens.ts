/**
 * TianJi Design System — Chart Tokens
 *
 * Unified color palettes, sizing, and configuration for all data
 * visualisation components (radar, timeline, signal layers, palace grid).
 */

import { colors } from './design-tokens';

// ────────────────────────────────────────────
// 1. Chart Color Palettes
// ────────────────────────────────────────────

/** Six-dimension energy radar default palette */
export const radarPalette = [
  colors.gold,
  colors.purple,
  colors.dataCyan,
  colors.successGreen,
  colors.purpleLight,
  colors.goldLight,
] as const;

/** Timeline / fortune curve gradient stops */
export const timelineGradient = {
  positive: [colors.successGreen, colors.dataCyan],
  negative: [colors.riskRed, colors.gold],
  neutral: [colors.purpleLight, colors.purple],
} as const;

/** Signal-layer stacked area fills (low → high opacity) */
export const signalLayerFills = [
  'rgba(124, 58, 237, 0.08)',
  'rgba(124, 58, 237, 0.15)',
  'rgba(124, 58, 237, 0.25)',
  'rgba(245, 158, 11, 0.10)',
  'rgba(245, 158, 11, 0.20)',
] as const;

/** Compatibility graph link colors */
export const compatibilityColors = {
  harmony: colors.successGreen,
  tension: colors.riskRed,
  neutral: colors.textTertiary,
} as const;

/** Palace grid (Zi Wei) accent map */
export const palaceAccents = {
  active: colors.gold,
  highlighted: colors.purpleLight,
  dim: colors.textMuted,
  border: colors.borderSubtle,
} as const;

// ────────────────────────────────────────────
// 2. Chart Sizing Tokens
// ────────────────────────────────────────────
export const chartSizing = {
  /** Radar chart */
  radarSize: 280,
  radarSizeSm: 200,
  radarStroke: 2,
  radarDotRadius: 4,

  /** Timeline chart */
  timelineHeight: 200,
  timelineHeightSm: 140,
  timelineStroke: 2,

  /** Palace grid */
  palaceCellSize: 80,
  palaceCellSizeSm: 56,
  palaceGap: 2,

  /** Axis / grid */
  axisColor: 'rgba(255, 255, 255, 0.08)',
  axisFontSize: 10,
  gridLines: 5,
} as const;

// ────────────────────────────────────────────
// 3. Chart Animation Tokens
// ────────────────────────────────────────────
export const chartMotion = {
  /** Radar polygon draw duration (seconds) */
  radarDrawDuration: 1.2,
  /** Timeline path draw duration */
  timelineDrawDuration: 1.5,
  /** Stagger delay between data points */
  pointStagger: 0.06,
  /** Pulse cycle for active nodes */
  pulseDuration: 2.0,
} as const;

// ────────────────────────────────────────────
// 4. Chart Label Tokens
// ────────────────────────────────────────────
export const chartLabels = {
  /** Default radar dimension labels (zh) */
  radarDimensions: [
    '事业运', '财运', '感情运', '健康运', '人际运', '学业运',
  ] as readonly string[],
  /** English fallback */
  radarDimensionsEn: [
    'Career', 'Wealth', 'Love', 'Health', 'Social', 'Study',
  ] as readonly string[],
} as const;
