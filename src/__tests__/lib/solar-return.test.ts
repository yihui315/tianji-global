/**
 * Solar Return Engine Tests - 太阳返照计算测试
 */

import { describe, test, expect } from 'vitest';
import {
  calculateSolarReturn,
  ZODIAC_SIGNS,
} from '@/lib/solar-return';

describe('Solar Return Engine', () => {
  describe('calculateSolarReturn', () => {
    test('should calculate basic Solar Return correctly', () => {
      const birthDate = '1990-08-16';
      const birthTime = '12:00';
      const targetYear = 2024;

      const result = calculateSolarReturn(birthDate, birthTime, 35.6762, 139.6503, targetYear);

      expect(result.birthDate).toBe(birthDate);
      expect(result.birthTime).toBe(birthTime);
      expect(result.targetYear).toBe(targetYear);
      expect(result.birthSunLongitude).toBeGreaterThan(0);
      expect(result.birthSunLongitude).toBeLessThan(360);
      expect(result.birthdayExactTime).toBeDefined();
      expect(result.birthdayExactJulianDay).toBeGreaterThan(0);
      expect(result.chart).toBeDefined();
    });

    test('should return chart with planets', () => {
      const result = calculateSolarReturn('2000-01-01', '12:00', 35.6762, 139.6503, 2024);

      expect(result.chart.planets).toBeDefined();
      expect(result.chart.planets.length).toBeGreaterThan(0);

      // Should have major planets
      const planetNames = result.chart.planets.map(p => p.name);
      expect(planetNames).toContain('Sun');
      expect(planetNames).toContain('Moon');
      expect(planetNames).toContain('Mercury');
      expect(planetNames).toContain('Venus');
      expect(planetNames).toContain('Mars');
    });

    test('should return chart with houses', () => {
      const result = calculateSolarReturn('2000-01-01', '12:00', 35.6762, 139.6503, 2024);

      expect(result.chart.houses).toBeDefined();
      expect(result.chart.houses.houses).toHaveLength(12);
      expect(result.chart.houses.ascendant).toBeGreaterThan(0);
      expect(result.chart.houses.ascendant).toBeLessThan(360);
      expect(result.chart.houses.midheaven).toBeGreaterThan(0);
      expect(result.chart.houses.midheaven).toBeLessThan(360);
    });

    test('should return planets with correct structure', () => {
      const result = calculateSolarReturn('2000-01-01', '12:00', 35.6762, 139.6503, 2024);

      for (const planet of result.chart.planets) {
        expect(planet).toHaveProperty('name');
        expect(planet).toHaveProperty('longitude');
        expect(planet).toHaveProperty('latitude');
        expect(planet).toHaveProperty('sign');
        expect(planet).toHaveProperty('signName');
        expect(planet).toHaveProperty('signSymbol');
        expect(planet).toHaveProperty('degree');
        expect(planet).toHaveProperty('orb');

        // Validate ranges
        expect(planet.longitude).toBeGreaterThanOrEqual(0);
        expect(planet.longitude).toBeLessThan(360);
        expect(planet.sign).toBeGreaterThanOrEqual(0);
        expect(planet.sign).toBeLessThan(12);
        expect(planet.degree).toBeGreaterThanOrEqual(0);
        expect(planet.degree).toBeLessThan(30);
      }
    });

    test('should find Solar Return time near birthday', () => {
      // For a given birth date, the Solar Return should occur near the birthday
      const birthDate = '1990-06-15';
      const birthTime = '10:30';
      const targetYear = 2024;

      const result = calculateSolarReturn(birthDate, birthTime, 35.6762, 139.6503, targetYear);

      // The exact time should be in June (same month as birth)
      const exactTime = new Date(result.birthdayExactTime);
      expect(exactTime.getMonth()).toBe(5); // June (0-indexed)

      // Should be around the 15th (same day as birth, with some variation)
      const day = exactTime.getDate();
      expect(day).toBeGreaterThanOrEqual(14);
      expect(day).toBeLessThanOrEqual(17);
    });

    test('should return different Solar Return times for different years', () => {
      const birthDate = '1990-01-15';
      const birthTime = '08:00';
      const lat = 40.0;
      const lng = -74.0;

      const sr2023 = calculateSolarReturn(birthDate, birthTime, lat, lng, 2023);
      const sr2024 = calculateSolarReturn(birthDate, birthTime, lat, lng, 2024);

      // Different years should give different exact times
      expect(sr2023.birthdayExactTime).not.toBe(sr2024.birthdayExactTime);
    });

    test('should handle different locations', () => {
      const birthDate = '1990-03-20';
      const birthTime = '14:00';
      const targetYear = 2024;

      // Tokyo
      const tokyo = calculateSolarReturn(birthDate, birthTime, 35.6762, 139.6503, targetYear);
      // New York
      const newYork = calculateSolarReturn(birthDate, birthTime, 40.7128, -74.0060, targetYear);

      // Same birth date/time but different locations
      // The Solar Return moment is when the Sun reaches a specific longitude
      // which doesn't depend on location, but house placements do
      expect(tokyo.chart.houses.ascendant).not.toBe(newYork.chart.houses.ascendant);
      expect(tokyo.chart.houses.midheaven).not.toBe(newYork.chart.houses.midheaven);
    });

    test('should return valid interpretation', () => {
      const result = calculateSolarReturn('2000-01-01', '12:00', 35.6762, 139.6503, 2024);

      expect(result.interpretation).toBeDefined();
      expect(typeof result.interpretation).toBe('string');
      expect(result.interpretation.length).toBeGreaterThan(0);
    });
  });

  describe('ZODIAC_SIGNS', () => {
    test('should have 12 signs', () => {
      expect(ZODIAC_SIGNS).toHaveLength(12);
    });

    test('should have correct sign data', () => {
      expect(ZODIAC_SIGNS[0].name).toBe('Aries');
      expect(ZODIAC_SIGNS[0].symbol).toBe('♈');
      expect(ZODIAC_SIGNS[0].nameZh).toBe('白羊');
      expect(ZODIAC_SIGNS[11].name).toBe('Pisces');
      expect(ZODIAC_SIGNS[11].symbol).toBe('♓');
      expect(ZODIAC_SIGNS[11].nameZh).toBe('双鱼');
    });

    test('each sign should have required properties', () => {
      for (const sign of ZODIAC_SIGNS) {
        expect(sign).toHaveProperty('name');
        expect(sign).toHaveProperty('nameZh');
        expect(sign).toHaveProperty('symbol');
        expect(sign.name.length).toBeGreaterThan(0);
        expect(sign.nameZh.length).toBeGreaterThan(0);
        expect(sign.symbol.length).toBe(1);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle leap year birth dates', () => {
      // February 29 birth date
      const result = calculateSolarReturn('2000-02-29', '12:00', 35.6762, 139.6503, 2024);

      expect(result.targetYear).toBe(2024);
      expect(result.chart.planets.length).toBeGreaterThan(0);
    });

    test('should handle very old birth dates', () => {
      const result = calculateSolarReturn('1950-06-15', '08:00', 35.6762, 139.6503, 2024);

      expect(result.birthSunLongitude).toBeGreaterThan(0);
      expect(result.birthSunLongitude).toBeLessThan(360);
      expect(result.chart.planets.length).toBe(9);
    });

    test('should handle future birth dates', () => {
      const result = calculateSolarReturn('2020-01-01', '12:00', 35.6762, 139.6503, 2030);

      expect(result.targetYear).toBe(2030);
      expect(result.chart.planets.length).toBeGreaterThan(0);
    });

    test('should handle various birth times', () => {
      const times = ['00:00', '06:00', '12:00', '18:00', '23:59'];
      
      for (const time of times) {
        const result = calculateSolarReturn('1990-01-15', time, 35.6762, 139.6503, 2024);
        
        expect(result.birthTime).toBe(time);
        expect(result.chart.planets.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Solar Return Time Precision', () => {
    test('should find precise Solar Return time', () => {
      // The Solar Return is when the Sun returns to the exact longitude of its birth position
      const birthDate = '1985-07-20';
      const birthTime = '15:30';
      const lat = 51.5074; // London
      const lng = -0.1278;
      const targetYear = 2024;

      const result = calculateSolarReturn(birthDate, birthTime, lat, lng, targetYear);

      // Birth Sun longitude should be preserved in the result
      expect(result.birthSunLongitude).toBeGreaterThan(0);
      expect(result.birthSunLongitude).toBeLessThan(360);

      // The exact time should be a valid ISO datetime
      const exactTime = new Date(result.birthdayExactTime);
      expect(isNaN(exactTime.getTime())).toBe(false);

      // The Julian Day should be reasonable (after year 2000, JD > 2450000)
      expect(result.birthdayExactJulianDay).toBeGreaterThan(2450000);
    });

    test('should be consistent for same inputs', () => {
      const birthDate = '1990-03-10';
      const birthTime = '09:15';
      const lat = 35.6762;
      const lng = 139.6503;
      const targetYear = 2024;

      const result1 = calculateSolarReturn(birthDate, birthTime, lat, lng, targetYear);
      const result2 = calculateSolarReturn(birthDate, birthTime, lat, lng, targetYear);

      // Should be identical
      expect(result1.birthdayExactTime).toBe(result2.birthdayExactTime);
      expect(result1.birthSunLongitude).toBe(result2.birthSunLongitude);
      expect(result1.birthdayExactJulianDay).toBe(result2.birthdayExactJulianDay);
    });
  });
});

describe('Solar Return - Chart Validation', () => {
  test('all planets should have valid sign assignments', () => {
    const result = calculateSolarReturn('2000-01-01', '12:00', 35.6762, 139.6503, 2024);

    for (const planet of result.chart.planets) {
      const expectedSign = ZODIAC_SIGNS[planet.sign];
      expect(planet.signName).toBe(expectedSign.name);
      expect(planet.signSymbol).toBe(expectedSign.symbol);

      // Degree should correspond to longitude
      const expectedDegree = planet.longitude % 30;
      expect(Math.abs(planet.degree - expectedDegree)).toBeLessThan(0.01);
    }
  });

  test('house cusps should be in valid range', () => {
    const result = calculateSolarReturn('2000-01-01', '12:00', 35.6762, 139.6503, 2024);

    for (const cusp of result.chart.houses.houses) {
      expect(cusp).toBeGreaterThanOrEqual(0);
      expect(cusp).toBeLessThan(360);
    }
  });

  test('ascendant should be first house cusp', () => {
    const result = calculateSolarReturn('2000-01-01', '12:00', 35.6762, 139.6503, 2024);

    expect(result.chart.houses.ascendant).toBe(result.chart.houses.houses[0]);
  });
});
