import { describe, expect, it } from 'vitest';
import { normalizeModulePayload } from '@/lib/normalizers';

describe('normalizeModulePayload', () => {
  it('normalizes bazi readings into identity, career, and wealth sections', () => {
    const payload = normalizeModulePayload(
      'bazi',
      {
        chart: {
          dayMasterElement: 'Metal',
          year: { heavenlyStem: 'Geng', earthlyBranch: 'Zi', element: 'Metal' },
          month: { heavenlyStem: 'Ren', earthlyBranch: 'Yin', element: 'Water' },
          day: { heavenlyStem: 'Geng', earthlyBranch: 'Chen', element: 'Metal' },
          hour: { heavenlyStem: 'Xin', earthlyBranch: 'Si', element: 'Metal' },
        },
        interpretation: 'You are strategic and patient.',
        aiInterpretation: 'You thrive when structure and judgment work together.',
      },
      {
        title: 'BaZi Reading',
        summary: 'Strategic metal-water structure',
      }
    );

    expect(payload.summary.headline).toBe('BaZi Reading');
    expect(payload.summary.oneLiner).toBe('You thrive when structure and judgment work together.');
    expect(payload.identity?.headline).toContain('Metal');
    expect(payload.identity?.summary).toContain('structure');
    expect(payload.career?.summary).toContain('judgment');
    expect(payload.wealth?.summary).toContain('pace');
    expect(payload.structure?.dayMasterElement).toBe('Metal');
  });

  it('normalizes ziwei readings into identity and relationship sections', () => {
    const payload = normalizeModulePayload(
      'ziwei',
      {
        lifePalaceName: 'Destiny Palace',
        bodyPalaceName: 'Body Palace',
        fiveElementsClass: 'Water Second局',
        soul: 'Zi Wei',
        body: 'Tian Xiang',
        sign: 'Cancer',
        zodiac: 'Dog',
        aiInterpretation: 'Your chart favors synthesis, emotional precision, and steady trust.',
      },
      {
        title: 'Zi Wei Reading',
        summary: 'Life palace emphasizes emotional precision',
      }
    );

    expect(payload.summary.headline).toBe('Zi Wei Reading');
    expect(payload.identity?.headline).toContain('Destiny Palace');
    expect(payload.identity?.summary).toContain('emotional precision');
    expect(payload.relationship?.summary).toContain('trust');
    expect(payload.structure?.lifePalaceName).toBe('Destiny Palace');
  });

  it('normalizes fortune readings into timing windows', () => {
    const payload = normalizeModulePayload(
      'fortune',
      {
        summary: 'You are in a restructuring phase.',
        aiInterpretation: 'The next quarter rewards disciplined repositioning.',
        currentPhase: 'Clarifying',
        bestPeriods: ['Wisdom (50-59): Score 86', 'Harmony (60-69): Score 81'],
        challengingPeriods: ['Youth (10-19): Score 43'],
        fortuneCycles: [
          { ageStart: 40, ageEnd: 49, phase: 'Clarifying', overall: 74, career: 82, wealth: 68, love: 70, health: 76 },
        ],
      },
      {
        title: 'Fortune Timeline',
        summary: 'Current timing overview',
      }
    );

    expect(payload.summary.headline).toBe('Fortune Timeline');
    expect(payload.timing?.headline).toBe('Current timing window');
    expect(payload.timing?.summary).toContain('Clarifying');
    expect(payload.timing?.opportunities).toEqual(['Wisdom (50-59): Score 86', 'Harmony (60-69): Score 81']);
    expect(payload.timing?.risks).toEqual(['Youth (10-19): Score 43']);
    expect(payload.timeline?.currentPhase).toBe('Clarifying');
  });

  it('normalizes relationship readings into relationship, timing, advice, and risk sections', () => {
    const payload = normalizeModulePayload(
      'relationship',
      {
        overallScore: 78,
        summary: {
          headline: 'Selective but deep',
          oneLiner: 'The pull is real, but the bond needs clearer rhythm.',
          keywords: ['timing', 'clarity', 'steady trust'],
        },
        dimensions: {
          attraction: {
            score: 82,
            label: 'High attraction',
            summary: 'There is a strong magnetic pull.',
            strengths: ['strong pull'],
            risks: ['idealization'],
            advice: ['name expectations early'],
          },
          communication: {
            score: 68,
            label: 'Good communication',
            summary: 'Needs are readable when both sides slow down.',
            strengths: ['clearer pacing'],
            risks: ['mixed signals'],
            advice: ['speak plainly'],
          },
          conflict: {
            score: 54,
            label: 'Mixed conflict style',
            summary: 'Tension rises when timing is mismatched.',
            strengths: ['repair potential'],
            risks: ['timing friction'],
            advice: ['pause before reacting'],
          },
          rhythm: {
            score: 61,
            label: 'Steady rhythm',
            summary: 'The relationship improves with slower alignment.',
            strengths: ['sustainable pace'],
            risks: ['drift'],
            advice: ['set the next check-in'],
          },
          longTerm: {
            score: 74,
            label: 'Long-term potential',
            summary: 'There is enough structure here to deepen the bond.',
            strengths: ['future potential'],
            risks: ['unclear direction'],
            advice: ['define the next milestone'],
          },
        },
        timeline: {
          currentPhase: 'Alignment',
          next30Days: 'A practical conversation changes the tone of the connection.',
          next90Days: 'Steadier pacing improves trust and long-term clarity.',
        },
      },
      {
        title: 'Relationship Reading',
        summary: 'Selective but deep',
      }
    );

    expect(payload.summary.headline).toBe('Relationship Reading');
    expect(payload.summary.oneLiner).toContain('bond');
    expect(payload.relationship?.headline).toBe('Selective but deep');
    expect(payload.relationship?.strengths).toContain('strong pull');
    expect(payload.timing?.summary).toContain('practical conversation');
    expect(payload.advice?.advice).toContain('name expectations early');
    expect(payload.risk?.risks).toContain('timing friction');
  });
});
