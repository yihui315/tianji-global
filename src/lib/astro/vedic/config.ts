export type VedicReportMode = 'disabled' | 'preview' | 'full';

export interface VedicReportConfig {
  enabled: boolean;
  mode: VedicReportMode;
}

function isTruthy(value: string | undefined) {
  return value === 'true' || value === '1';
}

function normalizeMode(value: string | undefined): VedicReportMode {
  if (value === 'preview' || value === 'full') return value;
  return 'disabled';
}

export function getVedicReportConfig(env: Record<string, string | undefined> = process.env): VedicReportConfig {
  const enabled = isTruthy(env.NEXT_PUBLIC_TIANJI_VEDIC_ENABLED);
  const mode = enabled ? normalizeMode(env.TIANJI_VEDIC_REPORT_MODE) : 'disabled';

  return {
    enabled: enabled && mode !== 'disabled',
    mode,
  };
}
