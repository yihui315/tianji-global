import { checkCoherence, validateReport } from '@/lib/cultural-coherence';

describe('Cultural Coherence Checker', () => {
  describe('Bazi reports', () => {
    it('should reject bazi report with zodiac signs', () => {
      const content = '你的太阳星座在白羊座，与上升星座狮子座形成相位。';
      const result = checkCoherence(content, 'bazi');
      expect(result.valid).toBe(false);
      expect(result.violations.some(v => v.code === 'CROSS_SYSTEM_CONTAMINATION')).toBe(true);
    });

    it('should reject bazi report with ziwei concepts', () => {
      const content: string = '紫微星入命宫，贪狼化禄在此。';
      const result = checkCoherence(content, 'bazi');
      expect(result.valid).toBe(false);
    });

    it('should pass clean bazi content', () => {
      const content = '日主旺相，八字用神为火，大运流年运势平稳。';
      const result = checkCoherence(content, 'bazi');
      expect(result.valid).toBe(true);
    });
  });

  describe('Western reports', () => {
    it('should reject western report with five elements', () => {
      const content = '你的星盘中木星与土星形成五行相克的结构。';
      const result = checkCoherence(content, 'western');
      expect(result.valid).toBe(false);
    });

    it('should pass clean western content', () => {
      const content = 'Sun in Aries trine Moon in Leo indicates emotional clarity.';
      const result = checkCoherence(content, 'western');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateReport convenience function', () => {
    it('should return structured errors and warnings', () => {
      const result = validateReport('紫微星在白羊座', 'bazi');
      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
