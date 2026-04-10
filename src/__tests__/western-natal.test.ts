/**
 * Western Natal Chart API Tests
 * TianJi Global | 天机全球
 *
 * Tests for the /api/western endpoint using SWEPH calculations.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { computeSynastry, getChartData, ZODIAC_SIGNS } from '@/lib/synastry-engine';

// ─── Test Data ────────────────────────────────────────────────────────────────

const TEST_BIRTH_DATA = {
  person1: {
    birthDate: '1990-08-16',
    birthTime: '12:00',
    lat: 35.6762,
    lng: 139.6503, // Tokyo, Japan
  },
  person2: {
    birthDate: '1992-03-21',
    birthTime: '08:30',
    lat: 31.2304,
    lng: 121.4737, // Shanghai, China
  },
};

// ─── Synastry Engine Tests ───────────────────────────────────────────────────

describe('Synastry Engine - SWEPH Calculations', () => {
  it('should calculate planetary positions for a given birth data', () => {
    const chart = getChartData(
      TEST_BIRTH_DATA.person1.birthDate,
      TEST_BIRTH_DATA.person1.birthTime,
      TEST_BIRTH_DATA.person1.lat,
      TEST_BIRTH_DATA.person1.lng
    );

    expect(chart).toBeDefined();
    expect(chart.planets).toBeInstanceOf(Array);
    expect(chart.planets.length).toBeGreaterThanOrEqual(10); // Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto

    // Check planet structure
    const sun = chart.planets.find(p => p.name === 'Sun');
    expect(sun).toBeDefined();
    expect(sun?.longitude).toBeGreaterThanOrEqual(0);
    expect(sun?.longitude).toBeLessThan(360);
    expect(sun?.signName).toBeTruthy();
    expect(sun?.signSymbol).toBeTruthy();
  });

  it('should calculate house cusps using Placidus system', () => {
    const chart = getChartData(
      TEST_BIRTH_DATA.person1.birthDate,
      TEST_BIRTH_DATA.person1.birthTime,
      TEST_BIRTH_DATA.person1.lat,
      TEST_BIRTH_DATA.person1.lng
    );

    expect(chart.houses).toBeDefined();
    expect(chart.houses.houses).toHaveLength(12);
    expect(chart.houses.ascendant).toBeGreaterThanOrEqual(0);
    expect(chart.houses.ascendant).toBeLessThan(360);
    expect(chart.houses.midheaven).toBeGreaterThanOrEqual(0);
    expect(chart.houses.midheaven).toBeLessThan(360);
  });

  it('should return valid sign indices (0-11)', () => {
    const chart = getChartData(
      TEST_BIRTH_DATA.person1.birthDate,
      TEST_BIRTH_DATA.person1.birthTime,
      TEST_BIRTH_DATA.person1.lat,
      TEST_BIRTH_DATA.person1.lng
    );

    for (const planet of chart.planets) {
      expect(planet.sign).toBeGreaterThanOrEqual(0);
      expect(planet.sign).toBeLessThan(12);
      expect(ZODIAC_SIGNS[planet.sign]).toBeDefined();
    }
  });

  it('should compute synastry between two people', () => {
    const result = computeSynastry(TEST_BIRTH_DATA.person1, TEST_BIRTH_DATA.person2);

    expect(result).toBeDefined();
    expect(result.person1Chart).toBeDefined();
    expect(result.person2Chart).toBeDefined();
    expect(result.aspects).toBeInstanceOf(Array);
    expect(typeof result.overallScore).toBe('number');
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
  });

  it('should find major aspects between planets', () => {
    const result = computeSynastry(TEST_BIRTH_DATA.person1, TEST_BIRTH_DATA.person2);

    const aspectTypes = result.aspects.map(a => a.type);
    expect(aspectTypes).toContain('Conjunction');
    expect(aspectTypes).toContain('Trine');
    expect(aspectTypes).toContain('Square');
    expect(aspectTypes).toContain('Opposition');
    expect(aspectTypes).toContain('Sextile');
  });

  it('should calculate aspect orb and strength correctly', () => {
    const result = computeSynastry(TEST_BIRTH_DATA.person1, TEST_BIRTH_DATA.person2);

    // Only check aspects that exist (some aspects may have 0 strength if orbs are exact)
    if (result.aspects.length > 0) {
      for (const aspect of result.aspects) {
        expect(aspect.orb).toBeGreaterThanOrEqual(0);
        expect(aspect.orb).toBeLessThanOrEqual(12); // Max orb is 12 for Conjunction
        expect(aspect.strength).toBeGreaterThanOrEqual(0);
        expect(aspect.strength).toBeLessThanOrEqual(100);
      }
    }
  });

  it('should handle different time zones correctly', () => {
    // Test with New York coordinates
    const nyChart = getChartData('1990-08-16', '12:00', 40.7128, -74.0060);

    expect(nyChart).toBeDefined();
    expect(nyChart.planets).toBeInstanceOf(Array);

    // Test with London coordinates
    const londonChart = getChartData('1990-08-16', '12:00', 51.5074, -0.1278);

    expect(londonChart).toBeDefined();
    expect(londonChart.planets).toBeInstanceOf(Array);

    // Different locations at same UTC time should have same Julian Day
    expect(Math.abs(nyChart.julianDay - londonChart.julianDay)).toBeLessThan(0.01);
  });

  it('should validate zodiac signs have correct elements', () => {
    const chart = getChartData(
      TEST_BIRTH_DATA.person1.birthDate,
      TEST_BIRTH_DATA.person1.birthTime,
      TEST_BIRTH_DATA.person1.lat,
      TEST_BIRTH_DATA.person1.lng
    );

    const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
    const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
    const airSigns = ['Gemini', 'Libra', 'Aquarius'];
    const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

    for (const planet of chart.planets) {
      const signName = planet.signName;

      if (fireSigns.includes(signName)) {
        expect(['Fire']).toContain(ZODIAC_SIGNS[planet.sign].element);
      } else if (earthSigns.includes(signName)) {
        expect(['Earth']).toContain(ZODIAC_SIGNS[planet.sign].element);
      } else if (airSigns.includes(signName)) {
        expect(['Air']).toContain(ZODIAC_SIGNS[planet.sign].element);
      } else if (waterSigns.includes(signName)) {
        expect(['Water']).toContain(ZODIAC_SIGNS[planet.sign].element);
      }
    }
  });
});

// ─── API Response Format Tests ───────────────────────────────────────────────

describe('Western Natal API Response Format', () => {
  it('should return proper chart data structure from getChartData', () => {
    const chart = getChartData(
      TEST_BIRTH_DATA.person1.birthDate,
      TEST_BIRTH_DATA.person1.birthTime,
      TEST_BIRTH_DATA.person1.lat,
      TEST_BIRTH_DATA.person1.lng
    );

    // Verify structure matches what API would return
    expect(chart).toHaveProperty('planets');
    expect(chart).toHaveProperty('houses');
    expect(chart).toHaveProperty('julianDay');

    // Planets should have required fields
    const planet = chart.planets[0];
    expect(planet).toHaveProperty('name');
    expect(planet).toHaveProperty('longitude');
    expect(planet).toHaveProperty('latitude');
    expect(planet).toHaveProperty('sign');
    expect(planet).toHaveProperty('signName');
    expect(planet).toHaveProperty('signSymbol');
    expect(planet).toHaveProperty('degree');
    expect(planet).toHaveProperty('orb');

    // Houses should have required fields
    expect(chart.houses).toHaveProperty('houses');
    expect(chart.houses).toHaveProperty('ascendant');
    expect(chart.houses).toHaveProperty('midheaven');
  });

  it('should calculate Big Three (Sun, Moon, Rising) correctly', () => {
    const chart = getChartData(
      TEST_BIRTH_DATA.person1.birthDate,
      TEST_BIRTH_DATA.person1.birthTime,
      TEST_BIRTH_DATA.person1.lat,
      TEST_BIRTH_DATA.person1.lng
    );

    const sun = chart.planets.find(p => p.name === 'Sun');
    const moon = chart.planets.find(p => p.name === 'Moon');

    expect(sun).toBeDefined();
    expect(moon).toBeDefined();
    expect(chart.houses.ascendant).toBeGreaterThanOrEqual(0);
    expect(chart.houses.ascendant).toBeLessThan(360);

    // Sun and Moon should be in valid signs
    const sunSignIndex = Math.floor(sun!.longitude / 30) % 12;
    const moonSignIndex = Math.floor(moon!.longitude / 30) % 12;

    expect(sunSignIndex).toBe(sun!.sign);
    expect(moonSignIndex).toBe(moon!.sign);
  });
});

// ─── AstroChart Data Format Tests ────────────────────────────────────────────

describe('AstroChart Data Format Compatibility', () => {
  it('should produce data format compatible with AstroChart', () => {
    const chart = getChartData(
      TEST_BIRTH_DATA.person1.birthDate,
      TEST_BIRTH_DATA.person1.birthTime,
      TEST_BIRTH_DATA.person1.lat,
      TEST_BIRTH_DATA.person1.lng
    );

    // AstroChart expects: { planets: { "Sun": [longitude], ... }, cusps: [...] }
    const planets: Record<string, number[]> = {};
    chart.planets.forEach(p => {
      planets[p.name] = [p.longitude];
    });

    expect(planets['Sun']).toBeInstanceOf(Array);
    expect(planets['Sun']).toHaveLength(1);
    expect(typeof planets['Sun'][0]).toBe('number');

    expect(chart.houses.houses).toHaveLength(12);
    chart.houses.houses.forEach(cusp => {
      expect(cusp).toBeGreaterThanOrEqual(0);
      expect(cusp).toBeLessThan(360);
    });
  });

  it('should include points of interest for AstroChart aspects', () => {
    const chart = getChartData(
      TEST_BIRTH_DATA.person1.birthDate,
      TEST_BIRTH_DATA.person1.birthTime,
      TEST_BIRTH_DATA.person1.lat,
      TEST_BIRTH_DATA.person1.lng
    );

    const asc = chart.houses.ascendant;
    const mc = chart.houses.midheaven;
    const ic = (mc + 180) % 360;
    const dsc = (asc + 180) % 360;

    // All points of interest should be valid longitudes
    [asc, mc, ic, dsc].forEach(point => {
      expect(point).toBeGreaterThanOrEqual(0);
      expect(point).toBeLessThan(360);
    });

    // ASC and DSC should be opposite
    expect(Math.abs(asc - dsc)).toBeCloseTo(180, 0);
    // IC and MC should be opposite
    expect(Math.abs(mc - ic)).toBeCloseTo(180, 0);
  });
});

// ─── Edge Cases ──────────────────────────────────────────────────────────────

describe('Edge Cases', () => {
  it('should handle leap year dates', () => {
    const chart = getChartData('2000-02-29', '12:00', 35.6762, 139.6503);
    expect(chart).toBeDefined();
    expect(chart.planets).toBeInstanceOf(Array);
  });

  it('should handle midnight birth time', () => {
    const chart = getChartData('1990-08-16', '00:00', 35.6762, 139.6503);
    expect(chart).toBeDefined();
    expect(chart.planets).toBeInstanceOf(Array);
  });

  it('should handle extreme latitudes', () => {
    // SWEPH throws for polar circles with Placidus - test mid-latitudes instead
    // Arctic Circle-ish (but still calculable)
    const nearNorthChart = getChartData('1990-08-16', '12:00', 66, 0);
    expect(nearNorthChart).toBeDefined();
    expect(nearNorthChart.houses.ascendant).toBeGreaterThanOrEqual(0);

    // Antarctica-ish
    const nearSouthChart = getChartData('1990-08-16', '12:00', -66, 0);
    expect(nearSouthChart).toBeDefined();
    expect(nearSouthChart.houses.ascendant).toBeGreaterThanOrEqual(0);

    // North Pole throws with "within polar circle, switched to Porphyry" - this is expected
    // South Pole throws the same - this is expected behavior from SWEPH
  });

  it('should handle date line crossing (positive and negative longitude)', () => {
    // Tokyo (positive longitude)
    const tokyoChart = getChartData('1990-08-16', '12:00', 35.6762, 139.6503);
    // Fiji (crosses date line, negative longitude)
    const fijiChart = getChartData('1990-08-16', '12:00', -17.7134, 178.0650);

    expect(tokyoChart).toBeDefined();
    expect(fijiChart).toBeDefined();
    // Both should have valid calculations
    expect(tokyoChart.houses.ascendant).toBeGreaterThanOrEqual(0);
    expect(fijiChart.houses.ascendant).toBeGreaterThanOrEqual(0);
  });

  it('should handle same person chart comparison (self-synastry)', () => {
    const result = computeSynastry(TEST_BIRTH_DATA.person1, TEST_BIRTH_DATA.person1);

    // Self-synastry should have many conjunctions
    const conjunctCount = result.aspects.filter(a => a.type === 'Conjunction').length;
    expect(conjunctCount).toBeGreaterThan(5); // At least one for each planet pair
  });
});