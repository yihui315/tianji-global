/**
 * Psychology Fusion Tests — TianJi Global
 */
import { describe, it, expect } from 'vitest';
import {
  derivePersonalityProfile,
  applyCBTReframe,
  getDisclaimer,
  fuseWithPsychology,
  getTraitDescription,
  isWatermarked,
  type BaziResult,
  type ZiweiResult,
  type PsychologyProfile,
  type CBTReframe,
} from '../../lib/psychology-fusion';

describe('Psychology Fusion', () => {
  describe('derivePersonalityProfile', () => {
    it('returns a valid PsychologyProfile', () => {
      const bazi: BaziResult = {
        ganZhi: '甲子',
        wuXing: ['水'],
        shenSha: [],
        mingGong: '命宫',
        tiYong: { tian: '甲', di: '子' },
      };
      const ziwei: ZiweiResult = {
        mingJu: '命宫',
        tianFu: '天府',
        starList: ['天机', '梁'],
        palace: ['命宫', '福德'],
      };

      const profile = derivePersonalityProfile(bazi, ziwei);

      expect(profile).toHaveProperty('openness');
      expect(profile).toHaveProperty('conscientiousness');
      expect(profile).toHaveProperty('extraversion');
      expect(profile).toHaveProperty('agreeableness');
      expect(profile).toHaveProperty('neuroticism');
      expect(profile).toHaveProperty('dominantTrait');
    });

    it('all trait scores are between 1 and 10', () => {
      const bazi: BaziResult = {
        ganZhi: '戊辰',
        wuXing: ['土'],
        shenSha: [],
        mingGong: '命宫',
        tiYong: { tian: '戊', di: '辰' },
      };
      const ziwei: ZiweiResult = {
        mingJu: '命宫',
        tianFu: '紫微',
        starList: ['太阳', '太阴'],
        palace: ['命宫', '疾厄'],
      };

      const profile = derivePersonalityProfile(bazi, ziwei);

      const traits = [
        profile.openness,
        profile.conscientiousness,
        profile.extraversion,
        profile.agreeableness,
        profile.neuroticism,
      ];
      for (const score of traits) {
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(10);
      }
    });

    it('dominantTrait is one of the five traits', () => {
      const validTraits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      const bazi: BaziResult = { ganZhi: '庚申', wuXing: ['金'], shenSha: [], mingGong: '命宫', tiYong: { tian: '庚', di: '申' } };
      const ziwei: ZiweiResult = { mingJu: '命宫', tianFu: '天机', starList: ['火', '铃'], palace: ['命宫', '疾厄'] };

      const profile = derivePersonalityProfile(bazi, ziwei);
      expect(validTraits).toContain(profile.dominantTrait);
    });

    it('BaZi with 官星 increases conscientiousness', () => {
      const bazi: BaziResult = { ganZhi: '甲戌', wuXing: ['木', '金'], shenSha: [], mingGong: '命宫', tiYong: { tian: '甲', di: '戌' } };
      const ziwei: ZiweiResult = { mingJu: '命宫', tianFu: '天府', starList: [], palace: ['命宫'] };

      const profile = derivePersonalityProfile(bazi, ziwei);
      // conscientiousness starts at 5, +1 for 官 or metal = 6
      expect(profile.conscientiousness).toBeGreaterThanOrEqual(6);
    });

    it('produces deterministic results', () => {
      const bazi: BaziResult = { ganZhi: '甲子', wuXing: ['水'], shenSha: [], mingGong: '命宫', tiYong: { tian: '甲', di: '子' } };
      const ziwei: ZiweiResult = { mingJu: '命宫', tianFu: '天机', starList: ['太阳'], palace: ['命宫', '福德'] };

      const p1 = derivePersonalityProfile(bazi, ziwei);
      const p2 = derivePersonalityProfile(bazi, ziwei);
      expect(p1).toEqual(p2);
    });
  });

  describe('applyCBTReframe', () => {
    it('returns an array of CBTReframe objects', () => {
      const result = applyCBTReframe('此星曜组合显示凶兆');
      expect(Array.isArray(result)).toBe(true);
    });

    it('detects negative pattern 凶', () => {
      const result = applyCBTReframe('命中有凶星');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].technique).toBe('reframing');
    });

    it('detects negative pattern 煞', () => {
      const result = applyCBTReframe('有煞星冲破');
      expect(result.length).toBeGreaterThan(0);
    });

    it('detects multiple negative patterns', () => {
      const result = applyCBTReframe('命中有凶煞，且有破财之兆');
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array when no negative patterns found', () => {
      const result = applyCBTReframe('今日运势平稳');
      expect(result).toHaveLength(0);
    });

    it('each reframe has originalNegative, reframe, and technique', () => {
      const result = applyCBTReframe('命中有凶兆');
      for (const r of result) {
        expect(r).toHaveProperty('originalNegative');
        expect(r).toHaveProperty('reframe');
        expect(r).toHaveProperty('technique');
        expect(['reframing', 'empowerment', 'anxiety_reduction']).toContain(r.technique);
      }
    });
  });

  describe('getDisclaimer', () => {
    it('returns Chinese disclaimer text for psychology', () => {
      const disclaimer = getDisclaimer('psychology');
      expect(disclaimer).toContain('免责声明');
      expect(disclaimer).toContain('心理学');
    });

    it('returns Chinese disclaimer for yijing', () => {
      const disclaimer = getDisclaimer('yijing');
      expect(disclaimer).toContain('免责声明');
      expect(disclaimer).toContain('易经');
    });

    it('returns Chinese disclaimer for tarot', () => {
      const disclaimer = getDisclaimer('tarot');
      expect(disclaimer).toContain('免责声明');
      expect(disclaimer).toContain('塔罗');
    });

    it('returns Chinese disclaimer for bazi', () => {
      const disclaimer = getDisclaimer('bazi');
      expect(disclaimer).toContain('免责声明');
      expect(disclaimer).toContain('八字');
    });

    it('returns Chinese disclaimer for ziwei', () => {
      const disclaimer = getDisclaimer('ziwei');
      expect(disclaimer).toContain('免责声明');
      expect(disclaimer).toContain('紫微');
    });

    it('all disclaimers contain 免责声明', () => {
      for (const type of ['yijing', 'tarot', 'bazi', 'ziwei', 'psychology'] as const) {
        const d = getDisclaimer(type);
        expect(d).toContain('免责声明');
      }
    });
  });

  describe('fuseWithPsychology', () => {
    it('returns a PsychologicalReading with all required fields', () => {
      const bazi: BaziResult = { ganZhi: '甲子', wuXing: ['水'], shenSha: [], mingGong: '命宫', tiYong: { tian: '甲', di: '子' } };
      const ziwei: ZiweiResult = { mingJu: '命宫', tianFu: '天机', starList: ['太阳'], palace: ['命宫'] };

      const result = fuseWithPsychology(bazi, ziwei, '今日运势平稳');

      expect(result).toHaveProperty('combinedProfile');
      expect(result).toHaveProperty('cbtInsights');
      expect(result).toHaveProperty('mentalHealthSafeguard');
      expect(result).toHaveProperty('adaptedInterpretation');
      expect(result).toHaveProperty('watermark');
    });

    it('combinedProfile is a valid PsychologyProfile', () => {
      const bazi: BaziResult = { ganZhi: '甲子', wuXing: ['水'], shenSha: [], mingGong: '命宫', tiYong: { tian: '甲', di: '子' } };
      const ziwei: ZiweiResult = { mingJu: '命宫', tianFu: '天机', starList: [], palace: ['命宫'] };

      const result = fuseWithPsychology(bazi, ziwei, '命中有凶兆');

      const profile = result.combinedProfile;
      expect(profile).toHaveProperty('openness');
      expect(profile).toHaveProperty('conscientiousness');
      expect(profile).toHaveProperty('extraversion');
      expect(profile).toHaveProperty('agreeableness');
      expect(profile).toHaveProperty('neuroticism');
      expect(profile).toHaveProperty('dominantTrait');
    });

    it('mentalHealthSafeguard contains health reminder text', () => {
      const bazi: BaziResult = { ganZhi: '甲子', wuXing: ['水'], shenSha: [], mingGong: '命宫', tiYong: { tian: '甲', di: '子' } };
      const ziwei: ZiweiResult = { mingJu: '命宫', tianFu: '天机', starList: [], palace: ['命宫'] };

      const result = fuseWithPsychology(bazi, ziwei, 'test');

      expect(result.mentalHealthSafeguard).toContain('温馨提示');
    });

    it('watermark contains disclaimer', () => {
      const bazi: BaziResult = { ganZhi: '甲子', wuXing: ['水'], shenSha: [], mingGong: '命宫', tiYong: { tian: '甲', di: '子' } };
      const ziwei: ZiweiResult = { mingJu: '命宫', tianFu: '天机', starList: [], palace: ['命宫'] };

      const result = fuseWithPsychology(bazi, ziwei, 'test');

      expect(result.watermark).toContain('免责声明');
    });

    it('cbtInsights is populated when negative patterns detected', () => {
      const bazi: BaziResult = { ganZhi: '甲子', wuXing: ['水'], shenSha: [], mingGong: '命宫', tiYong: { tian: '甲', di: '子' } };
      const ziwei: ZiweiResult = { mingJu: '命宫', tianFu: '天机', starList: [], palace: ['命宫'] };

      const result = fuseWithPsychology(bazi, ziwei, '命中有凶兆');

      expect(result.cbtInsights.length).toBeGreaterThan(0);
    });
  });

  describe('isWatermarked', () => {
    it('returns true for text containing 免责声明', () => {
      expect(isWatermarked('【免责声明】这是测试')).toBe(true);
    });

    it('returns false for text without watermark', () => {
      expect(isWatermarked('今日运势平稳')).toBe(false);
    });
  });

  describe('getTraitDescription', () => {
    it('returns description, highExpression, lowExpression, and metaphysicsEquivalent', () => {
      const desc = getTraitDescription('openness');
      expect(desc).toHaveProperty('description');
      expect(desc).toHaveProperty('highExpression');
      expect(desc).toHaveProperty('lowExpression');
      expect(desc).toHaveProperty('metaphysicsEquivalent');
    });
  });
});
