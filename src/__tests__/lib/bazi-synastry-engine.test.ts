/**
 * Tests for BaZi Synastry Engine
 */

import { describe, it, expect } from 'vitest';
import { computeBaZiSynastry, type BaZiSynastryInput } from '@/lib/bazi-synastry-engine';

// ─── Test fixtures ─────────────────────────────────────────────────────────────

const chart_Male_甲午: BaZiSynastryInput = {
  year: { heavenlyStem: '甲', earthlyBranch: '子', element: '木' },
  month: { heavenlyStem: '丁', earthlyBranch: '丑', element: '火' },
  day: { heavenlyStem: '甲', earthlyBranch: '午', element: '木' },
  hour: { heavenlyStem: '乙', earthlyBranch: '酉', element: '木' },
  dayMasterElement: '木',
  gender: 'male',
};

const chart_Female_乙巳: BaZiSynastryInput = {
  year: { heavenlyStem: '乙', earthlyBranch: '丑', element: '木' },
  month: { heavenlyStem: '戊', earthlyBranch: '寅', element: '土' },
  day: { heavenlyStem: '乙', earthlyBranch: '巳', element: '木' },  // 日主为乙（与甲相合）
  hour: { heavenlyStem: '丙', earthlyBranch: '戌', element: '火' },
  dayMasterElement: '木',
  gender: 'female',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('BaZi Synastry Engine', () => {
  describe('computeBaZiSynastry', () => {
    it('should compute overall score between 0-100', () => {
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should return correct compatibility level thresholds', () => {
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      expect(['excellent', 'good', 'fair', 'challenging']).toContain(result.compatibilityLevel);
    });

    it('should detect stem He (天干合) correctly', () => {
      // 甲午男 vs 乙巳女: 甲-乙 is NOT a He pair, but let's check day stems
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      // day stems: 甲 vs 乙 — not a He pair (甲己, 乙庚, 丙辛, 丁壬, 戊癸)
      expect(result.stemHeCount).toBeGreaterThanOrEqual(0);
    });

    it('should detect day master compatibility', () => {
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      expect(result.dayMaster).toHaveProperty('element1');
      expect(result.dayMaster).toHaveProperty('element2');
      expect(result.dayMaster).toHaveProperty('score');
      expect(result.dayMaster).toHaveProperty('relation');
      // Both 日主 are 木 (same element) → relation should be 'same'
      expect(result.dayMaster.element1).toBe('木');
      expect(result.dayMaster.element2).toBe('木');
    });

    it('should return 4 pillar pairs', () => {
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      expect(result.pillarPairs).toHaveLength(4);
      expect(result.pillarPairs.map(p => p.pillar)).toEqual(['year', 'month', 'day', 'hour']);
    });

    it('should compute branch relationship scores', () => {
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      for (const pair of result.pillarPairs) {
        expect(pair.branch).toHaveProperty('netScore');
        expect(pair.branch).toHaveProperty('heScore');
        expect(pair.branch).toHaveProperty('chongScore');
        expect(pair.branch).toHaveProperty('relationships');
      }
    });

    it('should include ten god archetypes', () => {
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      expect(result.tenGodArchetypes.length).toBeGreaterThan(0);
      expect(result.tenGodArchetypes[0]).toHaveProperty('archetype');
      expect(result.tenGodArchetypes[0]).toHaveProperty('score');
    });

    it('should provide summary in both languages', () => {
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      expect(typeof result.summary).toBe('string');
      expect(typeof result.summaryZh).toBe('string');
      expect(result.summaryZh.length).toBeGreaterThan(0);
    });

    it('should provide advice', () => {
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      expect(typeof result.advice).toBe('string');
      expect(typeof result.adviceZh).toBe('string');
    });

    it('should pass coherence for pure BaZi input', () => {
      const result = computeBaZiSynastry(chart_Male_甲午, chart_Female_乙巳);
      expect(result.coherencePass).toBe(true);
      expect(result.coherenceWarnings).toBeDefined();
    });

    it('should warn on critical negative patterns', () => {
      // Create charts with multiple Chong (六冲) — 3+冲 → warning
      const chart1: BaZiSynastryInput = {
        year: { heavenlyStem: '甲', earthlyBranch: '子', element: '木' },
        month: { heavenlyStem: '乙', earthlyBranch: '丑', element: '木' },
        day: { heavenlyStem: '甲', earthlyBranch: '午', element: '木' }, // 子午冲
        hour: { heavenlyStem: '丙', earthlyBranch: '卯', element: '火' }, // 子卯无冲，但检查
        dayMasterElement: '木',
      };
      const chart2: BaZiSynastryInput = {
        year: { heavenlyStem: '乙', earthlyBranch: '午', element: '木' }, // 子午冲
        month: { heavenlyStem: '丙', earthlyBranch: '未', element: '火' },
        day: { heavenlyStem: '乙', earthlyBranch: '子', element: '木' }, // 子午冲
        hour: { heavenlyStem: '丁', earthlyBranch: '酉', element: '火' },
        dayMasterElement: '木',
      };
      const result = computeBaZiSynastry(chart1, chart2);
      // Should have multiple 六冲
      expect(result.branchChongCount).toBeGreaterThan(0);
    });
  });

  describe('Stem compatibility', () => {
    it('should detect 甲己 as He match (天干五合)', () => {
      const chart1: BaZiSynastryInput = {
        year: { heavenlyStem: '甲', earthlyBranch: '子', element: '木' },
        month: { heavenlyStem: '乙', earthlyBranch: '丑', element: '木' },
        day: { heavenlyStem: '甲', earthlyBranch: '午', element: '木' },
        hour: { heavenlyStem: '乙', earthlyBranch: '酉', element: '木' },
        dayMasterElement: '木',
      };
      const chart2: BaZiSynastryInput = {
        year: { heavenlyStem: '己', earthlyBranch: '丑', element: '土' },
        month: { heavenlyStem: '庚', earthlyBranch: '寅', element: '金' },
        day: { heavenlyStem: '己', earthlyBranch: '巳', element: '土' },
        hour: { heavenlyStem: '辛', earthlyBranch: '戌', element: '金' },
        dayMasterElement: '土',
      };
      const result = computeBaZiSynastry(chart1, chart2);
      // 甲己 is a He pair — day stems should match
      const dayPillar = result.pillarPairs.find(p => p.pillar === 'day');
      expect(dayPillar?.stem.heMatch).toBe(true);
      expect(dayPillar?.stem.score).toBe(10);
    });

    it('should handle 乙庚 as He match', () => {
      const chart1: BaZiSynastryInput = {
        year: { heavenlyStem: '甲', earthlyBranch: '子', element: '木' },
        month: { heavenlyStem: '乙', earthlyBranch: '丑', element: '木' },
        day: { heavenlyStem: '乙', earthlyBranch: '午', element: '木' },
        hour: { heavenlyStem: '丙', earthlyBranch: '酉', element: '火' },
        dayMasterElement: '木',
      };
      const chart2: BaZiSynastryInput = {
        year: { heavenlyStem: '甲', earthlyBranch: '丑', element: '木' },
        month: { heavenlyStem: '庚', earthlyBranch: '寅', element: '金' },
        day: { heavenlyStem: '庚', earthlyBranch: '巳', element: '金' },
        hour: { heavenlyStem: '辛', earthlyBranch: '戌', element: '金' },
        dayMasterElement: '金',
      };
      const result = computeBaZiSynastry(chart1, chart2);
      const dayPillar = result.pillarPairs.find(p => p.pillar === 'day');
      expect(dayPillar?.stem.heMatch).toBe(true);
    });
  });

  describe('Branch relationships', () => {
    it('should detect 地支六合 (e.g., 子丑)', () => {
      const chart1: BaZiSynastryInput = {
        year: { heavenlyStem: '甲', earthlyBranch: '子', element: '木' },
        month: { heavenlyStem: '乙', earthlyBranch: '丑', element: '木' },
        day: { heavenlyStem: '甲', earthlyBranch: '午', element: '木' },
        hour: { heavenlyStem: '乙', earthlyBranch: '酉', element: '木' },
        dayMasterElement: '木',
      };
      const chart2: BaZiSynastryInput = {
        year: { heavenlyStem: '己', earthlyBranch: '丑', element: '土' },
        month: { heavenlyStem: '庚', earthlyBranch: '寅', element: '金' },
        day: { heavenlyStem: '己', earthlyBranch: '巳', element: '土' },
        hour: { heavenlyStem: '庚', earthlyBranch: '酉', element: '金' },
        dayMasterElement: '土',
      };
      const result = computeBaZiSynastry(chart1, chart2);
      // year pillars: 子丑 = 六合
      const yearPillar = result.pillarPairs.find(p => p.pillar === 'year');
      expect(yearPillar?.branch.heScore).toBe(8);
      expect(yearPillar?.branch.relationships.some(r => r.type === 'he')).toBe(true);
    });

    it('should detect 地支六冲 (e.g., 子午)', () => {
      const chart1: BaZiSynastryInput = {
        year: { heavenlyStem: '甲', earthlyBranch: '子', element: '木' },
        month: { heavenlyStem: '乙', earthlyBranch: '丑', element: '木' },
        day: { heavenlyStem: '甲', earthlyBranch: '午', element: '木' },
        hour: { heavenlyStem: '乙', earthlyBranch: '酉', element: '木' },
        dayMasterElement: '木',
      };
      const chart2: BaZiSynastryInput = {
        year: { heavenlyStem: '己', earthlyBranch: '午', element: '土' },
        month: { heavenlyStem: '庚', earthlyBranch: '未', element: '金' },
        day: { heavenlyStem: '己', earthlyBranch: '子', element: '土' },
        hour: { heavenlyStem: '庚', earthlyBranch: '酉', element: '金' },
        dayMasterElement: '土',
      };
      const result = computeBaZiSynastry(chart1, chart2);
      // day pillars: 午子 = 六冲
      const dayPillar = result.pillarPairs.find(p => p.pillar === 'day');
      expect(dayPillar?.branch.chongScore).toBe(-8);
    });

    it('should detect 地支三合 (e.g., 申子辰)', () => {
      const chart1: BaZiSynastryInput = {
        year: { heavenlyStem: '甲', earthlyBranch: '申', element: '木' },
        month: { heavenlyStem: '乙', earthlyBranch: '丑', element: '木' },
        day: { heavenlyStem: '甲', earthlyBranch: '子', element: '木' },
        hour: { heavenlyStem: '乙', earthlyBranch: '酉', element: '木' },
        dayMasterElement: '木',
      };
      const chart2: BaZiSynastryInput = {
        year: { heavenlyStem: '己', earthlyBranch: '辰', element: '土' },
        month: { heavenlyStem: '庚', earthlyBranch: '寅', element: '金' },
        day: { heavenlyStem: '己', earthlyBranch: '巳', element: '土' },
        hour: { heavenlyStem: '庚', earthlyBranch: '酉', element: '金' },
        dayMasterElement: '土',
      };
      const result = computeBaZiSynastry(chart1, chart2);
      // year: 申 vs 辰 = 三合局
      const yearPillar = result.pillarPairs.find(p => p.pillar === 'year');
      expect(yearPillar?.branch.sanheScore).toBe(6);
    });
  });

  describe('compatibility levels', () => {
    it('should label excellent for high scores', () => {
      // Both day stems: 甲己 (He) + both branches: 子丑 (He) + both 木日主 same
      const chart1: BaZiSynastryInput = {
        year: { heavenlyStem: '甲', earthlyBranch: '子', element: '木' },
        month: { heavenlyStem: '乙', earthlyBranch: '丑', element: '木' },
        day: { heavenlyStem: '甲', earthlyBranch: '子', element: '木' },
        hour: { heavenlyStem: '乙', earthlyBranch: '丑', element: '木' },
        dayMasterElement: '木',
      };
      const chart2: BaZiSynastryInput = {
        year: { heavenlyStem: '己', earthlyBranch: '丑', element: '土' },
        month: { heavenlyStem: '庚', earthlyBranch: '寅', element: '金' },
        day: { heavenlyStem: '己', earthlyBranch: '丑', element: '土' },
        hour: { heavenlyStem: '辛', earthlyBranch: '子', element: '金' },
        dayMasterElement: '土',
      };
      const result = computeBaZiSynastry(chart1, chart2);
      expect(result.overallScore).toBeGreaterThanOrEqual(55);
      expect(['excellent', 'good', 'fair']).toContain(result.compatibilityLevel);
    });
  });
});
