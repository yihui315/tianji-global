/**
 * YiJing API Tests — TianJi Global
 */
import { describe, it, expect } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const yijing = require('../../lib/yijing');

describe('YiJing API', () => {
  describe('castHexagram', () => {
    it('returns a hexagram with 6 yao lines', () => {
      const result = yijing.castHexagram();
      expect(result.lines).toHaveLength(6);
      result.lines.forEach((line: number) => {
        expect([6, 7, 8, 9]).toContain(line);
      });
    });

    it('returns a valid hexagram object with number 1-64', () => {
      const result = yijing.castHexagram();
      expect(result.hexagram).toBeDefined();
      expect(result.hexagram.number).toBeGreaterThanOrEqual(1);
      expect(result.hexagram.number).toBeLessThanOrEqual(64);
    });

    it('hasChangingLines is a boolean', () => {
      const result = yijing.castHexagram();
      expect(typeof result.hasChangingLines).toBe('boolean');
    });
  });

  describe('getHexagramByNumber', () => {
    it('returns hexagram 1 with correct properties', () => {
      const h = yijing.getHexagramByNumber(1);
      expect(h).not.toBeNull();
      expect(h!.name).toBe('乾');
      expect(h!.pinyin).toBe('Qián');
      expect(h!.english).toBe('The Creative');
    });

    it('returns hexagram 43 (夬) correctly', () => {
      const h = yijing.getHexagramByNumber(43);
      expect(h).not.toBeNull();
      expect(h!.number).toBe(43);
      expect(h!.name).toBe('夬');
    });

    it('returns null for number outside 1-64', () => {
      expect(yijing.getHexagramByNumber(0)).toBeNull();
      expect(yijing.getHexagramByNumber(65)).toBeNull();
      expect(yijing.getHexagramByNumber(99)).toBeNull();
    });
  });

  describe('YiJing route validation logic', () => {
    function validateHexagramNumber(numberStr: string | null) {
      if (!numberStr) return null; // no number param, return all
      const number = parseInt(numberStr, 10);
      if (isNaN(number) || number < 1 || number > 64) {
        return { status: 400, error: 'Hexagram number must be between 1 and 64.' };
      }
      return { status: 200, number };
    }

    it('returns 400 for hexagram number > 64', () => {
      const result = validateHexagramNumber('65');
      expect(result?.status).toBe(400);
      expect(result?.error).toContain('1 and 64');
    });

    it('returns 400 for hexagram number < 1', () => {
      const result = validateHexagramNumber('0');
      expect(result?.status).toBe(400);
    });

    it('returns 400 for non-numeric hexagram number', () => {
      const result = validateHexagramNumber('abc');
      expect(result?.status).toBe(400);
    });

    it('returns 200 for valid hexagram number', () => {
      const result = validateHexagramNumber('42');
      expect(result?.status).toBe(200);
      expect(result?.number).toBe(42);
    });

    it('returns null for missing number param (returns all hexagrams)', () => {
      const result = validateHexagramNumber(null);
      expect(result).toBeNull();
    });
  });

  describe('HEXAGRAMS dataset', () => {
    it('contains all 64 hexagrams', () => {
      expect(yijing.HEXAGRAMS).toHaveLength(64);
    });

    it('each hexagram has required fields', () => {
      for (const h of yijing.HEXAGRAMS) {
        expect(h).toHaveProperty('number');
        expect(h).toHaveProperty('name');
        expect(h).toHaveProperty('pinyin');
        expect(h).toHaveProperty('english');
        expect(h.number).toBeGreaterThanOrEqual(1);
        expect(h.number).toBeLessThanOrEqual(64);
      }
    });

    it('hexagram numbers are unique', () => {
      const numbers = yijing.HEXAGRAMS.map((h: { number: number }) => h.number);
      const unique = new Set(numbers);
      expect(unique.size).toBe(64);
    });
  });
});
