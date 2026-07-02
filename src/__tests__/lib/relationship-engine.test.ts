import { describe, it, expect } from 'vitest';
import { calculateRelationshipScore, type RelationshipVariantMetrics } from '../../../../scripts/calculate-relationship-score';

describe('calculateRelationshipScore', () => {
  const baseMetrics: RelationshipVariantMetrics = {
    hasHeroSummary: true,
    hasPattern: true,
    hasFiveDimensions: true,
    hasCurrentWindow: true,
    hasPracticalGuidance: true,
    hasPremiumSection: true,
    shareModes: 3,
    headlineStrength: 15,
    patternClarity: 12,
    emotionalResonance: 12,
    upgradeStrength: 12,
  };

  it('scores a fully featured variant at max', () => {
    const score = calculateRelationshipScore(baseMetrics);
    // Base: 10+10+15+10+10+10 + 3*3 = 74
    // Copy: 15+12+12+12 = 51
    // Total: 125
    expect(score).toBe(125);
  });

  it('returns 0 for all-false metrics', () => {
    const empty: RelationshipVariantMetrics = {
      hasHeroSummary: false,
      hasPattern: false,
      hasFiveDimensions: false,
      hasCurrentWindow: false,
      hasPracticalGuidance: false,
      hasPremiumSection: false,
      shareModes: 0,
      headlineStrength: 0,
      patternClarity: 0,
      emotionalResonance: 0,
      upgradeStrength: 0,
    };
    expect(calculateRelationshipScore(empty)).toBe(0);
  });

  it('caps shareModes at 3 (9 pts max)', () => {
    const highShare = { ...baseMetrics, shareModes: 5 };
    const capped = { ...baseMetrics, shareModes: 3 };
    expect(calculateRelationshipScore(highShare)).toBe(calculateRelationshipScore(capped));
  });

  it('headlineStrength contributes 0–20 pts', () => {
    const low = { ...baseMetrics, headlineStrength: 0 };
    const high = { ...baseMetrics, headlineStrength: 20 };
    expect(calculateRelationshipScore(high) - calculateRelationshipScore(low)).toBe(20);
  });
});
