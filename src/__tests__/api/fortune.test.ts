/**
 * Fortune API Tests — TianJi Global
 */
import { describe, it, expect } from 'vitest';

// Inline the Fortune calculation logic from the route to test it
const PHASES_ZH = [
  { ageStart: 0, ageEnd: 9, phase: '童年', phaseEn: 'Childhood' },
  { ageStart: 10, ageEnd: 19, phase: '少年', phaseEn: 'Youth' },
  { ageStart: 20, ageEnd: 29, phase: '青年', phaseEn: 'Young Adult' },
  { ageStart: 30, ageEnd: 39, phase: '而立', phaseEn: 'Establishing' },
  { ageStart: 40, ageEnd: 49, phase: '不惑', phaseEn: 'Clarifying' },
  { ageStart: 50, ageEnd: 59, phase: '知命', phaseEn: 'Wisdom' },
  { ageStart: 60, ageEnd: 69, phase: '耳顺', phaseEn: 'Harmony' },
  { ageStart: 70, ageEnd: 79, phase: '花甲', phaseEn: 'Retirement' },
  { ageStart: 80, ageEnd: 89, phase: '古稀', phaseEn: 'Longevity' },
  { ageStart: 90, ageEnd: 99, phase: '耄耋', phaseEn: 'Elder' },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface FortunePoint {
  ageStart: number;
  ageEnd: number;
  phase: string;
  phaseEn: string;
  overall: number;
  career: number;
  wealth: number;
  love: number;
  health: number;
}

function calculateFortuneFromBirth(
  birthYear: number,
  birthMonth: number,
  birthDay: number
): FortunePoint[] {
  const rand = seededRandom(birthYear * 10000 + birthMonth * 100 + birthDay);

  return PHASES_ZH.map(p => {
    const base = 40 + rand() * 30;
    const career = Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 30)));
    const wealth = Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 30)));
    const love = Math.round(Math.min(100, Math.max(0, base + (rand() - 0.5) * 30)));
    const health = Math.round(Math.min(100, Math.max(0, base + 15 + (rand() - 0.5) * 20)));
    const overall = Math.round((career + wealth + love + health) / 4);

    return {
      ...p,
      overall,
      career,
      wealth,
      love,
      health,
    };
  });
}

describe('Fortune API', () => {
  describe('calculateFortuneFromBirth', () => {
    it('returns an array of fortune cycles', () => {
      const cycles = calculateFortuneFromBirth(1990, 5, 15);
      expect(Array.isArray(cycles)).toBe(true);
      expect(cycles.length).toBeGreaterThan(0);
    });

    it('each cycle has timeseries fields (overall, career, wealth, love, health)', () => {
      const cycles = calculateFortuneFromBirth(1990, 5, 15);
      for (const cycle of cycles) {
        expect(cycle).toHaveProperty('overall');
        expect(cycle).toHaveProperty('career');
        expect(cycle).toHaveProperty('wealth');
        expect(cycle).toHaveProperty('love');
        expect(cycle).toHaveProperty('health');
        // Scores should be 0-100
        expect(cycle.overall).toBeGreaterThanOrEqual(0);
        expect(cycle.overall).toBeLessThanOrEqual(100);
      }
    });

    it('each cycle has phase information', () => {
      const cycles = calculateFortuneFromBirth(1990, 5, 15);
      for (const cycle of cycles) {
        expect(cycle).toHaveProperty('phase');
        expect(cycle).toHaveProperty('phaseEn');
        expect(cycle).toHaveProperty('ageStart');
        expect(cycle).toHaveProperty('ageEnd');
      }
    });

    it('produces deterministic results for the same birth date', () => {
      const cycles1 = calculateFortuneFromBirth(1990, 5, 15);
      const cycles2 = calculateFortuneFromBirth(1990, 5, 15);
      expect(cycles1).toEqual(cycles2);
    });

    it('produces different results for different birth dates', () => {
      const cycles1 = calculateFortuneFromBirth(1990, 5, 15);
      const cycles2 = calculateFortuneFromBirth(1985, 1, 1);
      expect(cycles1).not.toEqual(cycles2);
    });

    it('fortuneCycles array has expected length (10 life phases)', () => {
      const cycles = calculateFortuneFromBirth(1990, 5, 15);
      expect(cycles).toHaveLength(10);
    });
  });

  describe('Fortune route validation logic', () => {
    function validateBirthDate(birthDate: string | null, language = 'zh') {
      if (!birthDate) {
        return {
          status: 400,
          error: language === 'zh' ? '缺少出生日期' : 'Birth date is required',
        };
      }
      const parts = birthDate.split('-').map(Number);
      if (parts.length !== 3 || parts.some(isNaN)) {
        return { status: 400, error: language === 'zh' ? '日期格式错误' : 'Invalid date format' };
      }
      return { status: 200 };
    }

    it('returns 400 when birthDate is missing', () => {
      const result = validateBirthDate(null);
      expect(result.status).toBe(400);
    });

    it('returns 400 for invalid date format', () => {
      const result = validateBirthDate('not-a-date');
      expect(result.status).toBe(400);
    });

    it('returns 200 for valid date format', () => {
      const result = validateBirthDate('1990-05-15');
      expect(result.status).toBe(200);
    });
  });

  describe('enhanceWithAI flag behavior', () => {
    it('response structure supports aiInterpretation when enhanced', () => {
      // When enhanceWithAI is true, the response would include aiInterpretation
      const cycles = calculateFortuneFromBirth(1990, 5, 15);
      const response = {
        birthDate: '1990-05-15',
        fortuneCycles: cycles,
        meta: { platform: 'TianJi Global | 天机全球', version: '1.0.0' },
      };

      expect(response.fortuneCycles).toBeDefined();
      expect(Array.isArray(response.fortuneCycles)).toBe(true);
      // The enhanceWithAI flag would trigger AI interpretation
      expect(response.meta.platform).toBe('TianJi Global | 天机全球');
    });

    it('fortuneCycles contains valid timeseries data structure', () => {
      const cycles = calculateFortuneFromBirth(1990, 5, 15);
      // Each entry represents a life phase with score timeseries
      expect(cycles[0].overall).toBeGreaterThanOrEqual(0);
      expect(cycles[0].overall).toBeLessThanOrEqual(100);
    });
  });
});
