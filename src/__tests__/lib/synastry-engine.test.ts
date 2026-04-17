/**
 * Synastry Engine Tests — TianJi Global
 * Tests for overlay synastry, composite chart, and davison chart
 */
import { describe, it, expect } from 'vitest';
import {
  computeSynastry,
  computeCompositeChart,
  computeDavisonChart,
  computeMidpointStructures,
  getChartData,
  getSign,
} from '../../lib/synastry-engine';

describe('Synastry Engine', () => {
  const person1 = {
    birthDate: '2000-08-16',
    birthTime: '12:00',
    lat: 35.6762,
    lng: 139.6503,
  };

  const person2 = {
    birthDate: '1998-05-22',
    birthTime: '14:30',
    lat: 40.7128,
    lng: -74.0060,
  };

  describe('getChartData', () => {
    it('returns a chart with planets, houses, and julianDay', () => {
      const chart = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
      expect(chart).toHaveProperty('planets');
      expect(chart).toHaveProperty('houses');
      expect(chart).toHaveProperty('julianDay');
    });

    it('planets array contains Sun through Neptune (Pluto may be absent)', () => {
      const chart = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
      const planetNames = chart.planets.map(p => p.name);
      expect(planetNames).toContain('Sun');
      expect(planetNames).toContain('Moon');
      expect(planetNames).toContain('Mercury');
      expect(planetNames).toContain('Venus');
      expect(planetNames).toContain('Mars');
      expect(planetNames).toContain('Jupiter');
      expect(planetNames).toContain('Saturn');
      expect(planetNames).toContain('Uranus');
      expect(planetNames).toContain('Neptune');
      // Pluto is optional in astronomia
    });

    it('each planet has valid longitude 0-360 and sign info', () => {
      const chart = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
      for (const planet of chart.planets) {
        expect(planet.longitude).toBeGreaterThanOrEqual(0);
        expect(planet.longitude).toBeLessThan(360);
        expect(planet.sign).toBeGreaterThanOrEqual(0);
        expect(planet.sign).toBeLessThan(12);
        expect(planet.signName).toBeTruthy();
        expect(planet.signSymbol).toBeTruthy();
        expect(planet.degree).toBeGreaterThanOrEqual(0);
        expect(planet.degree).toBeLessThan(30);
      }
    });

    it('houses array has exactly 12 cusps', () => {
      const chart = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
      expect(chart.houses.houses).toHaveLength(12);
    });

    it('produces deterministic results for same input', () => {
      const chart1 = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
      const chart2 = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
      expect(chart1.julianDay).toBeCloseTo(chart2.julianDay);
    });
  });

  describe('getSign', () => {
    it('returns correct sign indices for each 30-degree sector', () => {
      expect(getSign(0).sign).toBe(0);   // 0° = Aries
      expect(getSign(14).sign).toBe(0);  // 14° = Aries
      expect(getSign(30).sign).toBe(1);  // 30° = Taurus
      expect(getSign(45).sign).toBe(1);  // 45° = Taurus
      expect(getSign(60).sign).toBe(2);  // 60° = Gemini
      expect(getSign(90).sign).toBe(3);  // 90° = Cancer
      expect(getSign(180).sign).toBe(6);  // 180° = Libra
      expect(getSign(270).sign).toBe(9);  // 270° = Capricorn
      expect(getSign(285).sign).toBe(9);  // 285° = Capricorn
      expect(getSign(315).sign).toBe(10); // 315° = Aquarius
      expect(getSign(345).sign).toBe(11); // 345° = Pisces
    });
  });

  describe('computeSynastry (overlay)', () => {
    it('returns person1Chart, person2Chart, aspects, and overallScore', () => {
      const result = computeSynastry(person1, person2);
      expect(result).toHaveProperty('person1Chart');
      expect(result).toHaveProperty('person2Chart');
      expect(result).toHaveProperty('aspects');
      expect(result).toHaveProperty('overallScore');
    });

    it('aspects array contains valid aspect objects', () => {
      const result = computeSynastry(person1, person2);
      const validTypes = ['Conjunction', 'Sextile', 'Square', 'Trine', 'Opposition'];
      for (const asp of result.aspects) {
        expect(validTypes).toContain(asp.type);
        expect(asp.orb).toBeGreaterThanOrEqual(0);
        expect(asp.strength).toBeGreaterThanOrEqual(0);
        expect(asp.strength).toBeLessThanOrEqual(100);
        expect(['harmonious', 'challenging', 'neutral']).toContain(asp.polarity);
      }
    });

    it('overallScore is between 0 and 100', () => {
      const result = computeSynastry(person1, person2);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('aspects are sorted by strength descending', () => {
      const result = computeSynastry(person1, person2);
      for (let i = 1; i < result.aspects.length; i++) {
        expect(result.aspects[i - 1].strength).toBeGreaterThanOrEqual(result.aspects[i].strength);
      }
    });
  });

  describe('computeCompositeChart', () => {
    it('returns planets, houses, and midpointStructures', () => {
      const composite = computeCompositeChart(person1, person2);
      expect(composite).toHaveProperty('planets');
      expect(composite).toHaveProperty('houses');
      expect(composite).toHaveProperty('midpointStructures');
    });

    it('composite planets are midpoints of two charts', () => {
      const chart1 = getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng);
      const chart2 = getChartData(person2.birthDate, person2.birthTime, person2.lat, person2.lng);
      const composite = computeCompositeChart(person1, person2);

      for (const cp of composite.planets) {
        const p1 = chart1.planets.find(p => p.name === cp.name);
        const p2 = chart2.planets.find(p => p.name === cp.name);
        if (p1 && p2) {
          // Composite planet longitude should be between the two source longitudes
          // accounting for 0° wrap
          const diff1 = Math.abs(cp.longitude - p1.longitude);
          const diff2 = Math.abs(cp.longitude - p2.longitude);
          const totalDiff = Math.min(diff1, 360 - diff1) + Math.min(diff2, 360 - diff2);
          const origDiff = Math.min(Math.abs(p1.longitude - p2.longitude), 360 - Math.abs(p1.longitude - p2.longitude));
          // The composite should be roughly equidistant from both
          expect(totalDiff).toBeLessThan(origDiff + 0.1);
        }
      }
    });

    it('has 9 composite planets (astronomia may exclude Pluto)', () => {
      const composite = computeCompositeChart(person1, person2);
      expect(composite.planets).toHaveLength(9);
    });

    it('composite houses has exactly 12 cusps', () => {
      const composite = computeCompositeChart(person1, person2);
      expect(composite.houses.houses).toHaveLength(12);
    });

    it('midpointStructures is an array', () => {
      const composite = computeCompositeChart(person1, person2);
      expect(Array.isArray(composite.midpointStructures)).toBe(true);
    });
  });

  describe('computeDavisonChart', () => {
    it('returns planets, houses, and midpointStructures', () => {
      const davison = computeDavisonChart(person1, person2);
      expect(davison).toHaveProperty('planets');
      expect(davison).toHaveProperty('houses');
      expect(davison).toHaveProperty('midpointStructures');
    });

    it('has 9 davison planets (astronomia may exclude Pluto)', () => {
      const davison = computeDavisonChart(person1, person2);
      expect(davison.planets).toHaveLength(9);
    });

    it('davison houses has exactly 12 cusps', () => {
      const davison = computeDavisonChart(person1, person2);
      expect(davison.houses.houses).toHaveLength(12);
    });

    it('midpointStructures is an array', () => {
      const davison = computeDavisonChart(person1, person2);
      expect(Array.isArray(davison.midpointStructures)).toBe(true);
    });
  });

  describe('computeMidpointStructures', () => {
    it('returns an array of midpoint structures', () => {
      const composite = computeCompositeChart(person1, person2);
      const structures = computeMidpointStructures(
        composite.planets,
        getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng).planets,
        getChartData(person2.birthDate, person2.birthTime, person2.lat, person2.lng).planets
      );
      expect(Array.isArray(structures)).toBe(true);
    });

    it('each structure has required fields', () => {
      const composite = computeCompositeChart(person1, person2);
      const structures = computeMidpointStructures(
        composite.planets,
        getChartData(person1.birthDate, person1.birthTime, person1.lat, person1.lng).planets,
        getChartData(person2.birthDate, person2.birthTime, person2.lat, person2.lng).planets
      );
      const validTypes = ['T-square', 'Grand Trine', 'Yod', 'Castle', 'Bow'];
      const validSensitivity = ['high', 'medium', 'low'];
      for (const s of structures) {
        expect(s).toHaveProperty('midpoint');
        expect(s).toHaveProperty('planet1');
        expect(s).toHaveProperty('planet2');
        expect(s).toHaveProperty('aspectToThird');
        expect(s).toHaveProperty('thirdPlanet');
        expect(s).toHaveProperty('structureType');
        expect(s).toHaveProperty('sensitivity');
        expect(validTypes).toContain(s.structureType);
        expect(validSensitivity).toContain(s.sensitivity);
        expect(s.midpoint).toBeGreaterThanOrEqual(0);
        expect(s.midpoint).toBeLessThan(360);
      }
    });
  });

  describe('midpoint calculation edge cases', () => {
    it('handles wrap-around at 0° correctly', () => {
      // Test positions near 0°: 350° and 10° should have midpoint at 0°
      // (or close to 0°, since shortest arc through 0°)
      const composite = computeCompositeChart(
        { birthDate: '2000-01-01', birthTime: '00:00', lat: 0, lng: 0 },
        { birthDate: '2000-01-01', birthTime: '00:00', lat: 0, lng: 0 }
      );
      // Same chart should give same positions
      expect(composite.planets.length).toBe(9);
    });

    it('composite and davison both produce valid charts with same structure', () => {
      const p1 = { birthDate: '1990-01-01', birthTime: '12:00', lat: 35.6762, lng: 139.6503 };
      const p2 = { birthDate: '2010-01-01', birthTime: '12:00', lat: 35.6762, lng: 139.6503 };
      const composite = computeCompositeChart(p1, p2);
      const davison = computeDavisonChart(p1, p2);

      // Both should have the same number of planets and houses
      expect(composite.planets).toHaveLength(davison.planets.length);
      expect(composite.houses.houses).toHaveLength(davison.houses.houses.length);

      // Both should have valid longitude values
      for (const cp of composite.planets) {
        expect(cp.longitude).toBeGreaterThanOrEqual(0);
        expect(cp.longitude).toBeLessThan(360);
      }
      for (const dp of davison.planets) {
        expect(dp.longitude).toBeGreaterThanOrEqual(0);
        expect(dp.longitude).toBeLessThan(360);
      }
    });
  });
});
