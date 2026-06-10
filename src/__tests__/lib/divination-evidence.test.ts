import { describe, expect, it } from 'vitest';

import { sanitizeAnalyticsPayload } from '@/lib/trust-copy-guard';
import {
  DIVINATION_EVIDENCE_EVENTS,
  buildAskEvidence,
  buildDivinationEvidenceAnalyticsPayload,
  buildDrawEvidence,
  buildRelationshipEvidence,
  normalizeEvidence,
  redactUnsafeEvidence,
} from '@/lib/divination/evidence';
import type { RelationshipReading } from '@/types/relationship';

const PRIVATE_QUESTION = 'Should I text Jamie tonight at 10pm from Shanghai?';

const sampleRelationshipReading: RelationshipReading = {
  id: 'rel_test',
  relationType: 'romantic',
  personA: { nickname: 'Jamie' },
  personB: { nickname: 'Taylor' },
  overallScore: 68,
  dimensions: {
    attraction: {
      score: 82,
      label: 'Very strong',
      summary: 'The attraction is strong but needs pacing.',
      strengths: ['Magnetic chemistry'],
      risks: ['Risk of idealization'],
      advice: ['Slow down expectation-building'],
    },
    communication: {
      score: 61,
      label: 'Good communication',
      summary: 'Communication is workable with check-ins.',
      strengths: ['Honest expression'],
      risks: ['Misreading tone'],
      advice: ['Confirm understanding before responding'],
    },
    conflict: {
      score: 43,
      label: 'Visible conflict',
      summary: 'Conflict needs active repair.',
      strengths: ['Willingness to repair'],
      risks: ['Old grievances resurface'],
      advice: ['Establish pause-and-return rules'],
    },
    rhythm: {
      score: 56,
      label: 'Generally aligned',
      summary: 'Timing is workable but uneven.',
      strengths: ['Flexible timing'],
      risks: ['Pacing friction'],
      advice: ['Name pace differences directly'],
    },
    longTerm: {
      score: 72,
      label: 'Good long-term potential',
      summary: 'Long-term potential depends on shared habits.',
      strengths: ['Aligned values'],
      risks: ['Unspoken expectations'],
      advice: ['Discuss long-term expectations regularly'],
    },
  },
  summary: {
    headline: 'Strong pull, uneven repair rhythm',
    oneLiner: 'The bond is real, but the next move should be paced.',
    keywords: ['attraction', 'repair', 'timing'],
  },
  timeline: {
    currentPhase: 'Calibration phase',
    next30Days: 'Use the next 30 days for low-pressure clarity.',
  },
  isPremium: false,
  accessLevel: 'free',
  lockedSections: ['dimensions', 'next30Days'],
  createdAt: '2026-05-25T00:00:00.000Z',
};

describe('divination evidence layer', () => {
  it('builds a limited safe Ask preview evidence object', () => {
    const evidence = buildAskEvidence({
      question: PRIVATE_QUESTION,
      answer: 'A grounded reading should look for observable signals over certainty.',
      paid: false,
      language: 'en',
    });

    expect(evidence.summary).toContain('observable');
    expect(evidence.signals).toHaveLength(3);
    expect(evidence.signals.map((signal) => signal.source)).toEqual(
      expect.arrayContaining(['question', 'timing', 'safety']),
    );
    expect(evidence.confidence).toMatch(/low|medium|high/);
    expect(evidence.timingWindow).toEqual(expect.any(String));
    expect(evidence.actionAdvice?.length).toBeGreaterThan(0);
    expect(JSON.stringify(evidence)).not.toContain(PRIVATE_QUESTION);
    expect(JSON.stringify(evidence)).not.toMatch(/Jamie|Shanghai|guaranteed|definitely|medical|legal|financial/i);
  });

  it('builds deeper paid Ask evidence without leaking raw private text', () => {
    const evidence = buildAskEvidence({
      question: PRIVATE_QUESTION,
      answer: 'The paid answer references hidden tension, timing, and one next move.',
      paid: true,
      language: 'en',
    });

    expect(evidence.signals.length).toBeGreaterThanOrEqual(5);
    expect(evidence.signals.length).toBeLessThanOrEqual(8);
    expect(evidence.userCanVerify?.length).toBeGreaterThanOrEqual(2);
    expect(evidence.actionAdvice?.length).toBeGreaterThanOrEqual(2);
    expect(JSON.stringify(evidence)).not.toContain(PRIVATE_QUESTION);
  });

  it('uses card slots and timing sources for Draw evidence', () => {
    const evidence = buildDrawEvidence({
      question: PRIVATE_QUESTION,
      paid: false,
      language: 'en',
      draw: [
        {
          slot: 'yesterday',
          card: { id: 0, name: 'The Fool', nameChinese: '愚者', arcana: 'major' },
          isReversed: false,
          miniReading: 'Old impulse is still echoing.',
        },
        {
          slot: 'today',
          card: { id: 1, name: 'The Magician', nameChinese: '魔术师', arcana: 'major' },
          isReversed: true,
          miniReading: 'Clarity is needed before action.',
        },
        {
          slot: 'tomorrow',
          card: { id: 2, name: 'The High Priestess', nameChinese: '女祭司', arcana: 'major' },
          isReversed: false,
          miniReading: 'The next opening depends on behavior.',
        },
      ],
    });

    expect(evidence.signals).toHaveLength(3);
    expect(evidence.signals.every((signal) => ['tarot', 'timing', 'safety'].includes(signal.source))).toBe(true);
    expect(evidence.timingWindow).toContain('Yesterday');
    expect(JSON.stringify(evidence)).not.toContain(PRIVATE_QUESTION);
  });

  it('builds paid relationship evidence from scores without exposing names or birth data', () => {
    const evidence = buildRelationshipEvidence({
      reading: {
        ...sampleRelationshipReading,
        accessLevel: 'full',
        isPremium: true,
      },
      paid: true,
      language: 'en',
    });

    expect(evidence.signals.length).toBeGreaterThanOrEqual(5);
    expect(evidence.signals.length).toBeLessThanOrEqual(8);
    expect(evidence.signals.map((signal) => signal.source)).toEqual(
      expect.arrayContaining(['relationship', 'timing', 'safety']),
    );
    expect(evidence.userCanVerify).toEqual(expect.arrayContaining([expect.stringMatching(/communication|consistent/i)]));
    expect(JSON.stringify(evidence)).not.toMatch(/Jamie|Taylor|birthDate|birthTime|birthLocation|timezone/i);
  });

  it('normalizes limits and redacts unsafe or deterministic language', () => {
    const evidence = normalizeEvidence(
      {
        summary: 'The cards guarantee Jamie will definitely marry you.',
        confidence: 'high',
        signals: [
          {
            label: 'Raw private question',
            source: 'question',
            strength: 'high',
            explanation: PRIVATE_QUESTION,
          },
          {
            label: 'Safe timing cue',
            source: 'timing',
            strength: 'medium',
            explanation: 'Use a short observation window before acting.',
          },
        ],
        timingWindow: 'exactly tonight at 10pm',
        userCanVerify: ['Jamie replies from Shanghai'],
        actionAdvice: ['Pay now or disaster will happen'],
      },
      { paid: false, privateValues: [PRIVATE_QUESTION, 'Jamie', 'Shanghai'] },
    );

    expect(evidence.signals).toHaveLength(2);
    expect(JSON.stringify(evidence)).not.toMatch(/Jamie|Shanghai|guarantee|definitely|pay now|disaster|exactly tonight/i);
    expect(evidence.summary).toContain('possible');
    expect(evidence.timingWindow).toContain('observation');
  });

  it('redacts unsafe evidence directly', () => {
    const redacted = redactUnsafeEvidence(
      {
        summary: '100% guaranteed future',
        confidence: 'high',
        signals: [
          {
            label: 'Provider prompt',
            source: 'question',
            strength: 'high',
            explanation: 'prompt raw provider response sk_test_secret',
          },
        ],
      },
      { privateValues: ['sk_test_secret'] },
    );

    expect(JSON.stringify(redacted)).not.toMatch(/100%|guaranteed|prompt|provider|sk_test_secret/i);
  });

  it('builds analytics payloads with sourceTypes and no private content', () => {
    const evidence = buildAskEvidence({
      question: PRIVATE_QUESTION,
      answer: 'Look for observable timing signals.',
      paid: true,
      language: 'en',
    });
    const payload = buildDivinationEvidenceAnalyticsPayload({
      route: 'ask',
      paid: true,
      evidence,
      feedback: 'somewhat',
    });

    expect(DIVINATION_EVIDENCE_EVENTS).toEqual([
      'divination_evidence_viewed',
      'divination_evidence_expand_clicked',
      'divination_accuracy_feedback_submitted',
      'paid_unlock_from_evidence_clicked',
    ]);
    expect(payload).toMatchObject({
      route: 'ask',
      paid: true,
      confidence: evidence.confidence,
      evidenceSignalCount: evidence.signals.length,
      feedback: 'somewhat',
    });
    expect(payload.sourceTypes).toEqual(expect.arrayContaining(['question', 'timing', 'safety']));
    expect(JSON.stringify(payload)).not.toContain(PRIVATE_QUESTION);

    expect(sanitizeAnalyticsPayload(payload)).toEqual(payload);
  });
});
