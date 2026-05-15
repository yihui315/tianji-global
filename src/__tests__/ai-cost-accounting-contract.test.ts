import { describe, expect, it } from 'vitest';
import { estimateCost } from '../lib/ai-orchestrator';

describe('AI cost accounting contract', () => {
  it('uses legacy per-1k registry prices when estimating per-report cost', () => {
    expect(estimateCost('openai/gpt-4o', 1000, 1000)).toBeCloseTo(0.02, 6);
    expect(estimateCost('anthropic/claude-sonnet-4', 1000, 1000)).toBeCloseTo(0.018, 6);
  });

  it('does not silently report zero cost for known paid models', () => {
    expect(estimateCost('openai/gpt-4o-mini', 10_000, 10_000)).toBeGreaterThan(0);
    expect(estimateCost('gemini/gemini-1.5-pro', 10_000, 10_000)).toBeGreaterThan(0);
  });
});
