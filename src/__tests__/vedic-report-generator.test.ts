import { describe, expect, it } from 'vitest';
import { generateRelationshipReportMarkdown } from '@/lib/astro/vedic/report-generator';
import type { RelationshipAstroReport } from '@/lib/astro/vedic/types';

describe('Vedic relationship report generator', () => {
  it('renders the required markdown sections and avoids deterministic claims', () => {
    const report: RelationshipAstroReport = {
      summary: 'Moon and Venus signals point to a reflective love signature.',
      chartSignals: ['Moon in Cancer', 'Venus in Taurus'],
      emotionalPattern: 'Emotional safety matters before commitment talk.',
      attractionPattern: 'Slow trust and embodied warmth are strong themes.',
      relationshipChallenges: ['Avoid using silence as a test.'],
      timingWindows: ['The current Moon dasha is a useful reflection window.'],
      marriagePotential: 'Long-term bonding should be treated as potential, not certainty.',
      compatibilityNotes: ['Repair pacing matters more than instant intensity.'],
      practicalGuidance: ['Ask for clarity directly before withdrawing.'],
      disclaimer: 'This report is for entertainment and self-reflection only.',
    };

    const markdown = generateRelationshipReportMarkdown(report);

    expect(markdown).toContain('# TianJi Love Vedic Relationship Destiny Report');
    expect(markdown).toContain('## 1. Core Love Signature');
    expect(markdown).toContain('## 2. Emotional Pattern');
    expect(markdown).toContain('## 3. Attraction Pattern');
    expect(markdown).toContain('## 4. Love Timing Windows');
    expect(markdown).toContain('## 5. Marriage / Long-Term Bond Potential');
    expect(markdown).toContain('## 6. Red Flags & Growth Lessons');
    expect(markdown).toContain('## 7. Practical Guidance');
    expect(markdown).toContain('## 8. Disclaimer');
    expect(markdown).not.toMatch(/100%|guarantee|definitely|destined|will marry|disaster/i);
  });
});
