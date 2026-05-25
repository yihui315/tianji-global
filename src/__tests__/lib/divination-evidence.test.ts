import { describe, expect, it } from 'vitest';
import {
  buildAskEvidence,
  buildDrawEvidence,
  buildRelationshipEvidence,
  limitEvidenceForPreview,
  sanitizeEvidenceForAnalytics,
} from '../../lib/divination/evidence';
import { sanitizeAnalyticsPayload } from '../../lib/trust-copy-guard';
import {
  buildAccuracyFeedbackAnalyticsPayload,
  buildDivinationAnalyticsPayload,
} from '../../lib/analytics/divination';

const forbiddenCopy = /guaranteed|will definitely|100%|destined|curse|doom|unavoidable fate/i;

describe('divination evidence layer', () => {
  it('builds safe evidence for Ask, Draw, and Relationship', () => {
    const ask = buildAskEvidence({ hasQuestionContext: true, hasAiMeta: true });
    const draw = buildDrawEvidence({
      spreadName: 'Three Card',
      cardCount: 3,
      reversedCount: 1,
      hasAiInterpretation: true,
    });
    const relationship = buildRelationshipEvidence({
      relationType: 'romantic',
      overallScore: 76,
      dimensions: {
        attraction: { score: 82, summary: 'Warm pull with clear emotional charge.' },
        communication: { score: 61, summary: 'Needs slower pacing.' },
        conflict: { score: 44, summary: 'Pressure rises when silence stretches.' },
      },
      timeline: {
        currentPhase: 'A quiet testing phase.',
        next30Days: 'Watch how both sides respond to one direct conversation.',
      },
    });

    for (const evidence of [ask, draw, relationship]) {
      expect(evidence.summary).toBeTruthy();
      expect(evidence.signals.length).toBeGreaterThanOrEqual(3);
      expect(['low', 'medium', 'high']).toContain(evidence.confidence);
      expect(JSON.stringify(evidence)).not.toMatch(forbiddenCopy);
    }
  });

  it('limits free preview evidence and keeps more paid evidence', () => {
    const evidence = buildRelationshipEvidence({
      overallScore: 84,
      dimensions: {
        attraction: { score: 86, summary: 'Strong pull.' },
        communication: { score: 72, summary: 'Clear enough to test.' },
        conflict: { score: 58, summary: 'Manageable pressure.' },
        rhythm: { score: 80, summary: 'Similar pacing.' },
        longTerm: { score: 77, summary: 'Stable direction.' },
      },
      timeline: { next30Days: 'Observe the next communication window.' },
    });

    const preview = limitEvidenceForPreview(evidence);
    const paid = limitEvidenceForPreview(evidence, { paid: true });

    expect(preview.signals.length).toBeLessThanOrEqual(3);
    expect(paid.signals.length).toBeGreaterThan(preview.signals.length);
    expect(paid.signals.length).toBeLessThanOrEqual(8);
  });

  it('sanitizes analytics to non-sensitive evidence metadata only', () => {
    const evidence = buildAskEvidence({ hasQuestionContext: true });
    const sanitized = sanitizeEvidenceForAnalytics(evidence);

    expect(sanitized).toEqual({
      confidence: evidence.confidence,
      evidenceSignalCount: evidence.signals.length,
      sourceTypes: ['question', 'safety', 'timing'],
    });

    const analyticsPayload = buildDivinationAnalyticsPayload({
      route: 'ask',
      paid: false,
      evidence,
    });
    expect(analyticsPayload).toEqual({
      route: 'ask',
      paid: false,
      confidence: evidence.confidence,
      evidenceSignalCount: evidence.signals.length,
      sourceTypes: ['question', 'safety', 'timing'],
    });

    const stripped = sanitizeAnalyticsPayload({
      route: 'ask',
      sourceTypes: ['question', 'safety'],
      question: 'raw private question',
      name: 'private name',
      birthday: '1990-01-01',
      birthTime: '09:30',
      partnerName: 'private partner',
      rawReport: 'private report',
      email: 'private@example.com',
      phone: '123',
      ip: '127.0.0.1',
    });

    expect(stripped).toEqual({
      route: 'ask',
      sourceTypes: ['question', 'safety'],
    });
  });

  it('builds accuracy feedback payload without raw report data', () => {
    expect(
      buildAccuracyFeedbackAnalyticsPayload({
        route: 'relationship',
        paid: false,
        confidence: 'medium',
        rating: 'somewhat',
      })
    ).toEqual({
      route: 'relationship',
      paid: false,
      confidence: 'medium',
      rating: 'somewhat',
    });
  });
});
