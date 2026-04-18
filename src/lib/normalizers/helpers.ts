import type { TimelinePhase, UnifiedSection } from '@/types/module-result';

export function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  return items.length > 0 ? items.map((item) => item.trim()) : undefined;
}

export function unique(items: Array<string | undefined>): string[] {
  return Array.from(new Set(items.filter((item): item is string => Boolean(item && item.length > 0))));
}

export function compactSection(section: UnifiedSection): UnifiedSection {
  const next: UnifiedSection = {};

  if (section.headline) next.headline = section.headline;
  if (section.summary) next.summary = section.summary;
  if (section.strengths?.length) next.strengths = section.strengths;
  if (section.risks?.length) next.risks = section.risks;
  if (section.opportunities?.length) next.opportunities = section.opportunities;
  if (section.advice?.length) next.advice = section.advice;
  if (typeof section.confidence === 'number') next.confidence = section.confidence;

  return next;
}

export function createTimelinePhases(labels: string[] | undefined): TimelinePhase[] | undefined {
  if (!labels?.length) {
    return undefined;
  }

  return labels.map((label, index) => ({
    range: `${index + 1}`,
    label,
    description: label,
  }));
}
