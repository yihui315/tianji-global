import { describe, it, expect } from 'vitest';

// ─── Inlined from scripts/calculate-relationship-score.ts ─────────────────────

interface RelationshipVariantMetrics {
  hasHeroSummary: boolean;
  hasPattern: boolean;
  hasFiveDimensions: boolean;
  hasCurrentWindow: boolean;
  hasPracticalGuidance: boolean;
  hasPremiumSection: boolean;
  shareModes: number;
  headlineStrength: number;    // 0-20
  patternClarity: number;      // 0-15
  emotionalResonance: number;  // 0-15
  upgradeStrength: number;     // 0-15
}

function calculateRelationshipScore(m: RelationshipVariantMetrics): number {
  let score = 0;
  score += m.hasHeroSummary ? 10 : 0;
  score += m.hasPattern ? 10 : 0;
  score += m.hasFiveDimensions ? 15 : 0;
  score += m.hasCurrentWindow ? 10 : 0;
  score += m.hasPracticalGuidance ? 10 : 0;
  score += m.hasPremiumSection ? 10 : 0;
  score += Math.min(m.shareModes, 3) * 3;
  score += m.headlineStrength;
  score += m.patternClarity;
  score += m.emotionalResonance;
  score += m.upgradeStrength;
  return score;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

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

  it('scores a fully featured variant at 125 pts', () => {
    // Base: 10+10+15+10+10+10 + 3*3=9 → 74
    // Copy: 15+12+12+12 → 51
    // Total: 125
    expect(calculateRelationshipScore(baseMetrics)).toBe(125);
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
