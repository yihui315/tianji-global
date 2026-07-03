/**
 * Lightweight A/B experiment infrastructure for monetization tests.
 *
 * Uses localStorage for anonymous assignment (no auth required).
 * Experiment assignments are deterministic per user and persist across sessions.
 * Assignments are included in analytics payloads for downstream analysis.
 *
 * Naming convention: experiment_id = "tianji-{surface}-{version}"
 * e.g. "tianji-ad-density-v1"
 */

import { trackClientEvent } from './client';

export type AdDensityVariant = 'low' | 'medium' | 'high';

export interface ABExperiment {
  id: string;
  variant: string;
  /** unix ms timestamp when user was assigned */
  assignedAt: number;
}

/** All active experiments — add new entries here */
export const ACTIVE_EXPERIMENTS = ['tianji-ad-density-v1'] as const;
export type ActiveExperimentId = (typeof ACTIVE_EXPERIMENTS)[number];

const STORAGE_KEY = 'tianji_experiments';

/** Experiment variants for tianji-ad-density-v1 */
export const AD_DENSITY_VARIANTS: Record<AdDensityVariant, number> = {
  low: 0,    // 0 ads per page
  medium: 1, // 1 ad per page
  high: 2,   // 2 ads per page
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function loadExperiments(): Record<string, ABExperiment> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveExperiments(experiments: Record<string, ABExperiment>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments));
  } catch {
    // localStorage may be full or unavailable
  }
}

/**
 * Get or assign a variant for the given experiment.
 * Returns the user's assigned variant (deterministic per experiment id).
 */
export function getOrAssignVariant(experimentId: string): string {
  const experiments = loadExperiments();
  const existing = experiments[experimentId];
  if (existing) return existing.variant;

  // Deterministic assignment based on experiment id + a random seed per client
  // We use a browser fingerprint-like approach: experiment id + a client id
  const clientId =
    typeof window !== 'undefined'
      ? localStorage.getItem('tianji_client_id') ??
        (() => {
          const id = Math.random().toString(36).slice(2);
          localStorage.setItem('tianji_client_id', id);
          return id;
        })()
      : 'server';

  const bucket = hashString(`${experimentId}:${clientId}`) % 100;

  let variant: string;
  if (experimentId === 'tianji-ad-density-v1') {
    // 33% low, 33% medium, 34% high
    if (bucket < 33) variant = 'low';
    else if (bucket < 66) variant = 'medium';
    else variant = 'high';
  } else {
    variant = 'control';
  }

  const experiment: ABExperiment = { id: experimentId, variant, assignedAt: Date.now() };
  const updated = { ...experiments, [experimentId]: experiment };
  saveExperiments(updated);

  // Fire assignment event once
  void trackClientEvent({
    event: 'experiment_assigned',
    moduleType: 'ab_testing',
    payload: { experiment_id: experimentId, variant, bucket },
  });

  return variant;
}

/** Get the current ad density variant for the active user */
export function getAdDensityVariant(): AdDensityVariant {
  const variant = getOrAssignVariant('tianji-ad-density-v1');
  if (variant === 'low' || variant === 'medium' || variant === 'high') return variant;
  return 'medium'; // fallback
}

/**
 * Determine how many ads to show on a page given the current experiment group.
 * Returns the maximum number of ads permitted for the given position.
 *
 * Position-based slot limits:
 *   'top'     — hero/above-fold: always 0 (never disrupt LCP)
 *   'inline'  — in-content: 1 ad every 400px of content
 *   'bottom'  — after content: 1 slot
 *
 * With variant controls:
 *   low    — inline: 0, bottom: 0
 *   medium — inline: 1, bottom: 1
 *   high   — inline: 2, bottom: 1
 */
export function adsAllowed(position: 'top' | 'inline' | 'bottom'): number {
  // Never show ads above the fold
  if (position === 'top') return 0;

  const variant = getAdDensityVariant();

  if (variant === 'low') return 0;
  if (variant === 'medium') return position === 'inline' ? 1 : 1;
  // variant === 'high'
  return position === 'inline' ? 2 : 1;
}

/** Check if an inline ad at a given index should be shown */
export function shouldShowInlineAd(index: number): boolean {
  const allowed = adsAllowed('inline');
  return index < allowed;
}
