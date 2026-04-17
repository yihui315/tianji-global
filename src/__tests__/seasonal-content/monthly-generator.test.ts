import { describe, it, expect } from 'vitest';
import { generateMonthlyFortune, generateYearlyFortune, MONTH_CONFIG } from '@/lib/seasonal-content/monthly-generator';

describe('Seasonal content generator', () => {
  describe('generateMonthlyFortune', () => {
    it('generates fortune for all 12 months', () => {
      for (let month = 1; month <= 12; month++) {
        const fortune = generateMonthlyFortune(month, 2025);
        expect(fortune.month).toBe(month);
        expect(fortune.season).toBeDefined();
        expect(fortune.element).toBeDefined();
        expect(fortune.loveHoroscope.length).toBeGreaterThan(10);
        expect(fortune.careerHoroscope.length).toBeGreaterThan(10);
        expect(fortune.wealthHoroscope.length).toBeGreaterThan(10);
        expect(fortune.affirmation.length).toBeGreaterThan(5);
      }
    });

    it('includes key dates for festival months', () => {
      const janFortune = generateMonthlyFortune(1, 2025);
      const mayFortune = generateMonthlyFortune(5, 2025);
      expect(janFortune.keyDates.some(d => d.description.includes('元宵'))).toBe(true);
      expect(mayFortune.keyDates.some(d => d.description.includes('端午'))).toBe(true);
    });

    it('includes solstices/equinoxes', () => {
      const marchFortune = generateMonthlyFortune(3, 2025);
      expect(marchFortune.keyDates.some(d => d.description === '春分')).toBe(true);
    });
  });

  describe('generateYearlyFortune', () => {
    it('generates complete yearly overview', () => {
      const yearly = generateYearlyFortune(2025, '蛇', '火');
      expect(yearly.year).toBe(2025);
      expect(yearly.animal).toBe('蛇');
      expect(yearly.quarterlyForecasts.length).toBe(4);
      expect(yearly.keyTransformationDates.length).toBe(4);
    });
  });

  describe('MONTH_CONFIG', () => {
    it('has 12 entries', () => {
      expect(MONTH_CONFIG.length).toBe(12);
    });
  });
});
