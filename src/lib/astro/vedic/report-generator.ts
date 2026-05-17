import { VEDIC_ENTERTAINMENT_DISCLAIMER, assertVedicOutputSafe } from './safety';
import type { RelationshipAstroReport } from './types';

function bulletList(items: string[]) {
  if (!items.length) return '- No specific chart signal was provided.';
  return items.map((item) => `- ${item}`).join('\n');
}

export function generateRelationshipReportMarkdown(report: RelationshipAstroReport): string {
  const disclaimer = report.disclaimer || VEDIC_ENTERTAINMENT_DISCLAIMER;
  const markdown = [
    '# TianJi Love Vedic Relationship Destiny Report',
    '',
    '## 1. Core Love Signature',
    '',
    report.summary,
    '',
    'Chart Signals:',
    bulletList(report.chartSignals),
    '',
    '## 2. Emotional Pattern',
    '',
    report.emotionalPattern,
    '',
    '## 3. Attraction Pattern',
    '',
    report.attractionPattern,
    '',
    '## 4. Love Timing Windows',
    '',
    bulletList(report.timingWindows),
    '',
    '## 5. Marriage / Long-Term Bond Potential',
    '',
    report.marriagePotential,
    '',
    '## 6. Red Flags & Growth Lessons',
    '',
    bulletList(report.relationshipChallenges),
    '',
    'Compatibility Notes:',
    bulletList(report.compatibilityNotes),
    '',
    '## 7. Practical Guidance',
    '',
    bulletList(report.practicalGuidance),
    '',
    '## 8. Disclaimer',
    '',
    disclaimer,
    '',
  ].join('\n');

  assertVedicOutputSafe(markdown);
  return markdown;
}
