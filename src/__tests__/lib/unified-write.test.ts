import { describe, expect, it } from 'vitest';
import { buildNormalizedPayloadForModule } from '@/lib/unified-normalization';

describe('buildNormalizedPayloadForModule', () => {
  it('uses core normalizers before falling back to the empty default payload', () => {
    const payload = buildNormalizedPayloadForModule(
      'bazi',
      {
        chart: {
          dayMasterElement: 'Metal',
          day: { heavenlyStem: 'Geng', earthlyBranch: 'Chen', element: 'Metal' },
        },
        aiInterpretation: 'You thrive when structure and judgment work together.',
      },
      {
        title: 'BaZi Reading',
        summary: 'Strategic metal-water structure',
      }
    );

    expect(payload.summary.headline).toBe('BaZi Reading');
    expect(payload.identity?.headline).toContain('Metal');
    expect(payload.wealth?.summary).toContain('pace');
  });
});
