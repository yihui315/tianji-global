import { describe, expect, it } from 'vitest';
import { analyzeRelationship } from '../../lib/relationship-engine';

describe('relationship-engine hero summary', () => {
  it('builds a pattern-led headline and next-step one-liner for romantic readings', () => {
    const { reading } = analyzeRelationship(
      '1990-01-15',
      '1992-08-20',
      'romantic',
      'Alex',
      'Jamie',
      '09:30',
      '21:15',
      'en',
    );

    expect(reading.summary.headline).toContain(':');
    expect(reading.summary.headline.length).toBeGreaterThan(20);
    expect(reading.summary.oneLiner).toContain('Your strongest layer is');
    expect(reading.summary.oneLiner).toContain('Next move:');
    expect(reading.summary.keywords).toHaveLength(3);
  });
});
