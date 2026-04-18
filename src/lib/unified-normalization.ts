import type { ModuleType, NormalizedPayload } from '@/types/module-result';
import { normalizeModulePayload } from '@/lib/normalizers';

export const CORE_UNIFIED_MODULES: ModuleType[] = ['bazi', 'ziwei', 'fortune', 'relationship'];

export function buildDefaultNormalizedPayload(
  title?: string,
  summary?: string,
  rawPayload?: Record<string, unknown>
): NormalizedPayload {
  return {
    summary: {
      headline: title,
      oneLiner: summary,
      keywords: Array.isArray(rawPayload?.keywords)
        ? rawPayload.keywords.filter((item): item is string => typeof item === 'string')
        : undefined,
    },
    structure: typeof rawPayload?.structure === 'object' && rawPayload.structure ? (rawPayload.structure as Record<string, unknown>) : {},
    chart: typeof rawPayload?.chart === 'object' && rawPayload.chart ? (rawPayload.chart as Record<string, unknown>) : {},
    identity: {},
    relationship: {},
    career: {},
    wealth: {},
    timing: {},
    advice: {},
    risk: {},
    timeline: {},
  };
}

export function buildNormalizedPayloadForModule(
  moduleType: ModuleType,
  rawPayload: Record<string, unknown>,
  options: {
    title?: string;
    summary?: string;
    normalizedPayload?: NormalizedPayload;
  }
): NormalizedPayload {
  if (options.normalizedPayload) {
    return options.normalizedPayload;
  }

  const normalized = normalizeModulePayload(moduleType, rawPayload, {
    title: options.title,
    summary: options.summary,
  });

  const hasMeaningfulContent = Boolean(
    normalized.summary.headline ||
      normalized.summary.oneLiner ||
      normalized.identity?.headline ||
      normalized.relationship?.headline ||
      normalized.career?.headline ||
      normalized.wealth?.headline ||
      normalized.timing?.headline
  );

  return hasMeaningfulContent
    ? normalized
    : buildDefaultNormalizedPayload(options.title, options.summary, rawPayload);
}
