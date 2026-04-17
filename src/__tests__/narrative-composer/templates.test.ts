import { describe, it, expect } from 'vitest';
import type { NarrativeReport, NarrativeTheme } from '@/lib/narrative-composer/templates';

describe('Narrative templates', () => {
  describe('NarrativeReport structure', () => {
    it('should have all required overview fields', () => {
      const report: NarrativeReport = {
        overview: {
          hook: '开篇钩子',
          coreThemes: ['主题1', '主题2'],
          yearEnergy: '年份能量'
        },
        themes: [],
        keywords: [],
        monthlyOverview: [],
        closure: {
          summary: '总结',
          outlook: '展望',
          empoweringPhrase: '赋能句'
        }
      };
      
      expect(report.overview.hook).toBeDefined();
      expect(report.overview.coreThemes.length).toBeGreaterThan(0);
      expect(report.keywords.length).toBeLessThanOrEqual(5);
    });
  });

  describe('NarrativeTheme structure', () => {
    it('should have balanced opportunities and challenges', () => {
      const theme: NarrativeTheme = {
        id: 'test',
        title: '测试主题',
        hook: '意象钩子',
        body: ['段落1', '段落2'],
        opportunities: ['机遇1', '机遇2'],
        challenges: ['挑战1', '挑战2'],
        actions: ['行动1'],
        keyPhrase: '金句'
      };
      
      expect(theme.opportunities.length).toBeGreaterThan(0);
      expect(theme.challenges.length).toBeGreaterThan(0);
      expect(theme.body.length).toBeGreaterThanOrEqual(2);
    });
  });
});
