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

  it('normalizes tarot readings into advice, timeline, and risk sections', () => {
    const payload = normalizeModulePayload(
      'tarot',
      {
        spread: {
          name: 'Three Card',
          description: 'Past, Present, and Future',
        },
        question: 'What should I understand about this relationship?',
        drawnCards: [
          {
            positionName: 'Past',
            card: { name: 'The Lovers', suit: 'Major Arcana' },
            isReversed: false,
            interpretation: 'A meaningful bond shaped the current situation.',
          },
          {
            positionName: 'Present',
            card: { name: 'Two of Cups', suit: 'Cups' },
            isReversed: true,
            interpretation: 'The connection needs clearer emotional exchange.',
          },
        ],
        aiInterpretation: 'The reading points to a relationship pattern that needs honest pacing.',
      },
      {
        title: 'Tarot Relationship Reading',
        summary: 'Relationship clarity',
      }
    );

    expect(payload.summary.headline).toBe('Tarot Relationship Reading');
    expect(payload.summary.keywords).toContain('The Lovers');
    expect(payload.advice?.summary).toContain('honest pacing');
    expect(payload.relationship?.summary).toContain('relationship pattern');
    expect(payload.risk?.risks).toContain('Two of Cups reversed');
    expect(payload.timeline?.phases?.[0]).toMatchObject({
      label: 'Past',
      description: 'A meaningful bond shaped the current situation.',
    });
  });

  it('normalizes yijing readings into timing, advice, and risk sections', () => {
    const payload = normalizeModulePayload(
      'yijing',
      {
        hexagram: {
          number: 32,
          name: '恒',
          english: 'Duration',
          judgementEn: 'Perseverance furthers.',
          imageEn: 'Thunder and wind: the image of duration.',
        },
        lines: [
          {
            position: 1,
            isChanging: true,
            meaningEn: 'Changing too quickly creates instability.',
          },
        ],
        hasChangingLines: true,
        question: 'Should I keep building this project?',
        aiInterpretation: 'The oracle favors steady continuation, but warns against forcing the timing.',
      },
      {
        title: 'Yi Jing Oracle',
        summary: 'Duration asks for steadiness',
      }
    );

    expect(payload.summary.headline).toBe('Yi Jing Oracle');
    expect(payload.timing?.headline).toContain('Duration');
    expect(payload.advice?.summary).toContain('steady continuation');
    expect(payload.risk?.risks).toContain('Changing too quickly creates instability.');
    expect(payload.timeline?.currentPhase).toBe('Hexagram 32');
  });

  it('normalizes western readings into identity, relationship, and career sections', () => {
    const payload = normalizeModulePayload(
      'western',
      {
        bigThree: {
          sun: { sign: 'Leo', degree: 12 },
          moon: { sign: 'Scorpio', degree: 4 },
          rising: { sign: 'Libra', degree: 18 },
        },
        planets: [
          { name: 'Venus', sign: 'Virgo', degree: 8 },
          { name: 'Mars', sign: 'Cancer', degree: 22 },
        ],
        houses: {
          ascendantSign: 'Libra',
          mcSign: 'Cancer',
        },
      },
      {
        title: 'Western Natal Chart',
        summary: 'Leo Sun, Scorpio Moon, Libra Rising',
      }
    );

    expect(payload.summary.headline).toBe('Western Natal Chart');
    expect(payload.identity?.headline).toContain('Leo Sun');
    expect(payload.relationship?.summary).toContain('Venus in Virgo');
    expect(payload.career?.summary).toContain('Cancer');
    expect(payload.structure?.bigThree).toBeDefined();
  });
});
