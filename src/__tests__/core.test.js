'use strict';

const { calculateBaZi, HEAVENLY_STEMS, EARTHLY_BRANCHES } = require('../utils/bazi');
const { castHexagram, getHexagramByNumber, HEXAGRAMS } = require('../utils/yijing');

describe('BaZi calculation engine', () => {
  test('returns all four pillars with valid stems and branches', () => {
    const chart = calculateBaZi({ year: 1990, month: 5, day: 15, hour: 8 });
    ['year', 'month', 'day', 'hour'].forEach(pillar => {
      expect(chart[pillar]).toBeDefined();
      expect(HEAVENLY_STEMS).toContain(chart[pillar].heavenlyStem);
      expect(EARTHLY_BRANCHES).toContain(chart[pillar].earthlyBranch);
    });
  });

  test('dayMasterElement is one of the five elements', () => {
    const chart = calculateBaZi({ year: 1985, month: 3, day: 22, hour: 14 });
    const FIVE_ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
    expect(FIVE_ELEMENTS).toContain(chart.dayMasterElement);
  });

  test('produces deterministic results for the same input', () => {
    const input = { year: 2000, month: 1, day: 1, hour: 0 };
    const chart1 = calculateBaZi(input);
    const chart2 = calculateBaZi(input);
    expect(chart1).toEqual(chart2);
  });
});

describe('Yi Jing oracle', () => {
  test('castHexagram returns a valid hexagram with 6 lines', () => {
    const result = castHexagram();
    expect(result.hexagram).toBeDefined();
    expect(result.hexagram.number).toBeGreaterThanOrEqual(1);
    expect(result.lines).toHaveLength(6);
    result.lines.forEach(line => expect([6, 7, 8, 9]).toContain(line));
  });

  test('getHexagramByNumber returns the correct hexagram for number 1', () => {
    const h = getHexagramByNumber(1);
    expect(h).not.toBeNull();
    expect(h.name).toBe('乾');
    expect(h.english).toBe('The Creative');
  });

  test('getHexagramByNumber returns null for an unknown number', () => {
    expect(getHexagramByNumber(99)).toBeNull();
  });

  test('HEXAGRAMS contains all 64 entries with unique numbers 1–64', () => {
    expect(HEXAGRAMS).toHaveLength(64);
    const numbers = HEXAGRAMS.map(h => h.number);
    for (let i = 1; i <= 64; i++) {
      expect(numbers).toContain(i);
    }
  });
});
