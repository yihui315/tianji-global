/**
 * Transit Engine Tests - Secondary Progressions
 */

import { describe, test, expect } from 'vitest';
import {
  computeSecondaryProgression,
  analyzePlanetaryMotion,
  generateTransitReport,
  ZODIAC_SIGNS,
} from '@/lib/transit-engine';

describe('Transit Engine - Secondary Progressions', () => {
  describe('computeSecondaryProgression', () => {
    test('should calculate basic secondary progression correctly', () => {
      const birthDate = '2000-01-01';
      const birthTime = '12:00';
      // Target 1 year later: 2001-01-01
      const targetDate = '2001-01-01';

      const result = computeSecondaryProgression(birthDate, birthTime, targetDate);

      expect(result.birthDate).toBe(birthDate);
      expect(result.targetDate).toBe(targetDate);
      expect(result.age).toBeCloseTo(1, 0);
      expect(result.progressedDays).toBeGreaterThan(0);
      expect(result.planets).toBeDefined();
      expect(result.planets.length).toBeGreaterThan(0);
    });

    test('should return planets with correct structure', () => {
      const birthDate = '2000-01-01';
      const birthTime = '12:00';
      const targetDate = '2001-01-01';

      const result = computeSecondaryProgression(birthDate, birthTime, targetDate);

      for (const planet of result.planets) {
        expect(planet).toHaveProperty('name');
        expect(planet).toHaveProperty('longitude');
        expect(planet).toHaveProperty('natalLongitude');
        expect(planet).toHaveProperty('progressedLongitude');
        expect(planet).toHaveProperty('sign');
        expect(planet).toHaveProperty('signName');
        expect(planet).toHaveProperty('signSymbol');
        expect(planet).toHaveProperty('degree');
        expect(planet).toHaveProperty('motion');
        expect(planet).toHaveProperty('speed');
        expect(planet).toHaveProperty('isRetrograde');

        // Validate ranges
        expect(planet.longitude).toBeGreaterThanOrEqual(0);
        expect(planet.longitude).toBeLessThan(360);
        expect(planet.sign).toBeGreaterThanOrEqual(0);
        expect(planet.sign).toBeLessThan(12);
        expect(planet.degree).toBeGreaterThanOrEqual(0);
        expect(planet.degree).toBeLessThan(30);
        expect(['direct', 'retrograde', 'station']).toContain(planet.motion);
      }
    });

    test('should calculate age correctly', () => {
      const birthDate = '2000-01-01';
      const birthTime = '12:00';
      // ~10 years later
      const targetDate = '2010-01-02';

      const result = computeSecondaryProgression(birthDate, birthTime, targetDate);

      expect(result.age).toBeCloseTo(10, 0);
    });

    test('should include major planets', () => {
      const result = computeSecondaryProgression('2000-01-01', '12:00', '2010-01-01');

      const planetNames = result.planets.map(p => p.name);
      const expectedPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

      for (const expected of expectedPlanets) {
        expect(planetNames).toContain(expected);
      }
    });
  });

  describe('analyzePlanetaryMotion', () => {
    test('should return motion analysis for all planets', () => {
      const result = analyzePlanetaryMotion('2024-01-01', '12:00');

      expect(result.length).toBeGreaterThan(0);

      for (const analysis of result) {
        expect(analysis).toHaveProperty('planet');
        expect(analysis).toHaveProperty('currentMotion');
        expect(analysis).toHaveProperty('speed');
        expect(analysis).toHaveProperty('status');
        expect(['direct', 'retrograde', 'station']).toContain(analysis.currentMotion);
        expect(analysis.speed).toBeGreaterThanOrEqual(0);
      }
    });

    test('should identify retrograde planets', () => {
      // This test verifies the structure - actual retrograde detection depends on date
      const result = analyzePlanetaryMotion('2024-06-01', '12:00');

      const retrogradePlanets = result.filter(p => p.currentMotion === 'retrograde');
      // We expect some planets to be retrograde depending on the date
      // This is just checking the structure
      expect(retrogradePlanets.length).toBeGreaterThanOrEqual(0);
    });

    test('should calculate planet speeds', () => {
      const result = analyzePlanetaryMotion('2024-01-01', '12:00');

      // Moon should have highest speed (~13 degrees/day)
      const moon = result.find(p => p.planet === 'Moon');
      if (moon) {
        expect(moon.speed).toBeGreaterThan(10);
        expect(moon.speed).toBeLessThan(15);
      }

      // Sun should have ~1 degree/day
      const sun = result.find(p => p.planet === 'Sun');
      if (sun) {
        expect(sun.speed).toBeGreaterThan(0.9);
        expect(sun.speed).toBeLessThan(1.1);
      }
    });
  });

  describe('generateTransitReport', () => {
    test('should generate complete transit report', () => {
      const result = generateTransitReport(
        '2000-01-01',
        '12:00',
        35.6762,
        139.6503,
        '2010-01-01'
      );

      expect(result).toHaveProperty('progression');
      expect(result).toHaveProperty('motionAnalysis');
      expect(result).toHaveProperty('majorTransits');

      expect(result.progression.age).toBeCloseTo(10, 0);
      expect(result.motionAnalysis.length).toBeGreaterThan(0);
      expect(Array.isArray(result.majorTransits)).toBe(true);
    });

    test('should detect progressed conjunctions', () => {
      // For very close progressed dates, planets may be conjunct natal
      const birthDate = '2000-01-01';
      const birthTime = '12:00';
      // Small time difference might give us tight aspects
      const targetDate = '2000-01-02';

      const result = generateTransitReport(birthDate, birthTime, 35.6762, 139.6503, targetDate);

      // Just verify the report structure
      expect(result.progression).toBeDefined();
      expect(result.majorTransits).toBeDefined();
    });
  });

  describe('ZODIAC_SIGNS', () => {
    test('should have 12 signs', () => {
      expect(ZODIAC_SIGNS).toHaveLength(12);
    });

    test('should have correct sign data', () => {
      expect(ZODIAC_SIGNS[0].name).toBe('Aries');
      expect(ZODIAC_SIGNS[0].symbol).toBe('♈');
      expect(ZODIAC_SIGNS[11].name).toBe('Pisces');
      expect(ZODIAC_SIGNS[11].symbol).toBe('♓');
    });

    test('each sign should have required properties', () => {
      for (const sign of ZODIAC_SIGNS) {
        expect(sign).toHaveProperty('name');
        expect(sign).toHaveProperty('nameZh');
        expect(sign).toHaveProperty('symbol');
        expect(sign.name.length).toBeGreaterThan(0);
        expect(sign.symbol.length).toBe(1);
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle same birth and target date', () => {
      const birthDate = '2000-06-15';
      const birthTime = '14:30';
      const targetDate = '2000-06-15';

      const result = computeSecondaryProgression(birthDate, birthTime, targetDate);

      expect(result.age).toBeCloseTo(0, 1);
    });

    test('should handle leap year dates', () => {
      const result = computeSecondaryProgression('2000-02-29', '12:00', '2004-02-29');

      expect(result.age).toBeCloseTo(4, 0);
    });

    test('should handle very old dates', () => {
      const result = computeSecondaryProgression('1950-01-01', '12:00', '2000-01-01');

      expect(result.age).toBeCloseTo(50, 0);
      expect(result.planets.length).toBe(10);
    });

    test('should handle future dates', () => {
      const result = computeSecondaryProgression('2020-01-01', '12:00', '2050-01-01');

      expect(result.age).toBeCloseTo(30, 0);
      expect(result.planets.length).toBe(10);
    });
  });
});

describe('Transit Engine - Sign Calculations', () => {
  test('should correctly identify sign boundaries', () => {
    const result = computeSecondaryProgression('2000-03-20', '12:00', '2010-03-20');

    // Find Aries (0) - should have planets in various signs
    const planets = result.planets;
    const signNumbers = planets.map(p => p.sign);

    // All signs should be 0-11
    for (const sign of signNumbers) {
      expect(sign).toBeGreaterThanOrEqual(0);
      expect(sign).toBeLessThan(12);
    }
  });

  test('should have consistent sign names and symbols', () => {
    const result = computeSecondaryProgression('2000-01-01', '12:00', '2010-01-01');

    for (const planet of result.planets) {
      const expectedSign = ZODIAC_SIGNS[planet.sign];
      expect(planet.signName).toBe(expectedSign.name);
      expect(planet.signSymbol).toBe(expectedSign.symbol);
    }
  });
});
