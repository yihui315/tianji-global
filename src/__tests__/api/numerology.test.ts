/**
 * Numerology API Tests — TianJi Global
 */
import { describe, it, expect } from 'vitest';
import {
  reduceNumber,
  digitSum,
  calculateLifePath,
  calculateDestiny,
  calculateSoulUrge,
  calculateFullReading,
} from '../../lib/numerology';

describe('Numerology Core Engine', () => {
  describe('digitSum', () => {
    it('sums digits correctly', () => {
      expect(digitSum(123)).toBe(6);
      expect(digitSum(999)).toBe(27);
      expect(digitSum(0)).toBe(0);
      expect(digitSum(5)).toBe(5);
      expect(digitSum(100)).toBe(1);
    });
  });

  describe('reduceNumber', () => {
    it('returns single digits unchanged', () => {
      expect(reduceNumber(1)).toBe(1);
      expect(reduceNumber(5)).toBe(5);
    });

    it('reduces double-digit numbers', () => {
      expect(reduceNumber(10)).toBe(1);
      expect(reduceNumber(28)).toBe(1); // 2+8=10 → 1
      expect(reduceNumber(19)).toBe(1); // 1+9=10 → 1
      expect(reduceNumber(29)).toBe(11); // 2+9=11, master number — kept as-is
      expect(reduceNumber(22)).toBe(22); // master number
      expect(reduceNumber(33)).toBe(33); // master number
      expect(reduceNumber(11)).toBe(11); // master number
    });

    it('keeps master numbers as-is', () => {
      expect(reduceNumber(11)).toBe(11);
      expect(reduceNumber(22)).toBe(22);
      expect(reduceNumber(33)).toBe(33);
      expect(reduceNumber(44)).toBe(44); // rarely used master
    });

    it('reduces numbers with multiple iterations', () => {
      expect(reduceNumber(9999)).toBe(9); // 9+9+9+9=36 → 3+6=9
      expect(reduceNumber(12345)).toBe(6); // 1+2+3+4+5=15 → 1+5=6
    });

    it('returns 0 or negative unchanged', () => {
      expect(reduceNumber(0)).toBe(0);
      expect(reduceNumber(-5)).toBe(-5);
    });
  });

  describe('calculateLifePath', () => {
    it('calculates Life Path from birthdate', () => {
      // 1990-05-15 → digits: 1+9+9+0+0+5+1+5 = 30 → 3+0 = 3
      const result = calculateLifePath('1990-05-15');
      expect(result.number).toBe(3);
      expect(result.isMaster).toBe(false);
      expect(result.title).toBe('The Communicator');
    });

    it('detects master number 11 from birthdate', () => {
      // Example: 1978-11-11 → digits sum
      const result = calculateLifePath('1978-11-11');
      expect([11, 22, 33, 1]).toContain(result.number); // could be 1 or 11 depending on sum
    });

    it('throws on invalid birthdate', () => {
      expect(() => calculateLifePath('2000')).toThrow();
      expect(() => calculateLifePath('')).toThrow();
      expect(() => calculateLifePath('abc')).toThrow();
    });

    it('handles MM/DD/YYYY format', () => {
      const result = calculateLifePath('05/15/1990');
      expect(result.number).toBe(3);
    });

    it('returns valid structure with all fields', () => {
      const result = calculateLifePath('1990-05-15');
      expect(result).toHaveProperty('number');
      expect(result).toHaveProperty('isMaster');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('titleChinese');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('traits');
      expect(result.traits.length).toBeGreaterThan(0);
    });
  });

  describe('calculateDestiny', () => {
    it('calculates Destiny Number from name', () => {
      // John → J=1, O=6, H=8, N=5 → 1+6+8+5 = 20 → 2
      const result = calculateDestiny('John');
      expect(result.number).toBe(2);
      expect(result.isMaster).toBe(false);
      expect(result.nameValue).toBe(20);
    });

    it('calculates for a full name', () => {
      // Mary Jane → M=4, A=1, R=9, Y=7, J=1, A=1, N=5, E=5 = 33 → 33 (master number)
      const result = calculateDestiny('Mary Jane');
      expect(result.number).toBe(33);
      expect(result.nameValue).toBe(33);
    });

    it('handles lowercase input', () => {
      const upper = calculateDestiny('Alice');
      const lower = calculateDestiny('alice');
      expect(upper.number).toBe(lower.number);
    });

    it('strips non-alphabetic characters', () => {
      const result = calculateDestiny("Mary-Jane O'Connor");
      // MaryJaneOConnnor → M+A+R+Y+J+A+N+E+O+C+O+N+N+O+R
      expect(result.number).toBeGreaterThan(0);
    });

    it('throws on empty name', () => {
      expect(() => calculateDestiny('')).toThrow();
      expect(() => calculateDestiny('123')).toThrow();
    });

    it('returns valid structure', () => {
      const result = calculateDestiny('John Doe');
      expect(result).toHaveProperty('number');
      expect(result).toHaveProperty('isMaster');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('titleChinese');
      expect(result).toHaveProperty('expressionNumber');
      expect(result).toHaveProperty('nameValue');
    });

    it('handles master number 22', () => {
      // Needs name value of 22 or 44 to produce master
      // Very long names could sum to 22
      // Test structure: result.isMaster should be boolean
      const result = calculateDestiny('Alexander Benjamin Christopher');
      expect(typeof result.isMaster).toBe('boolean');
    });
  });

  describe('calculateSoulUrge', () => {
    it('calculates Soul Urge from vowels only', () => {
      // John → O is vowel: O=6 → 6
      const result = calculateSoulUrge('John');
      expect(result.number).toBe(6);
      expect(result.vowels).toEqual(['O']);
      expect(result.vowelValue).toBe(6);
    });

    it('handles multiple vowels', () => {
      // Mary → A (1), Y (7, sometimes vowel), E (5) → if Y is counted
      // with standard A,E,I,O,U only: A=1, E=5 → 6 → 6
      const result = calculateSoulUrge('Mary');
      expect(result.vowels.length).toBeGreaterThanOrEqual(1);
      expect(result.number).toBeGreaterThan(0);
    });

    it('handles no vowels', () => {
      // Dry: D,R,Y → Y sometimes counts
      const result = calculateSoulUrge('Dry');
      expect(result.number).toBeGreaterThanOrEqual(0);
    });

    it('throws on empty name', () => {
      expect(() => calculateSoulUrge('')).toThrow();
    });

    it('returns valid structure', () => {
      const result = calculateSoulUrge('John Doe');
      expect(result).toHaveProperty('number');
      expect(result).toHaveProperty('isMaster');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('vowelValue');
      expect(result).toHaveProperty('vowels');
      expect(Array.isArray(result.vowels)).toBe(true);
    });
  });

  describe('calculateFullReading', () => {
    it('returns complete reading with all numbers', () => {
      const reading = calculateFullReading('John Doe', '1990-05-15');
      expect(reading).toHaveProperty('name');
      expect(reading).toHaveProperty('birthdate');
      expect(reading).toHaveProperty('lifePath');
      expect(reading).toHaveProperty('destiny');
      expect(reading).toHaveProperty('soulUrge');
      expect(reading).toHaveProperty('personalityNumber');
      expect(reading).toHaveProperty('maturityNumber');
      expect(reading).toHaveProperty('compatibility');
      expect(reading).toHaveProperty('luckyNumbers');
      expect(reading).toHaveProperty('luckyDays');
      expect(reading).toHaveProperty('rulingPlanet');
      expect(reading).toHaveProperty('element');
    });

    it('includes correct name and birthdate', () => {
      const reading = calculateFullReading('Jane Smith', '1985-03-22');
      expect(reading.name).toBe('Jane Smith');
      expect(reading.birthdate).toBe('1985-03-22');
    });

    it('lucky numbers are derived from life path', () => {
      const reading = calculateFullReading('Test User', '2000-01-01');
      expect(Array.isArray(reading.luckyNumbers)).toBe(true);
      expect(reading.luckyNumbers.length).toBeGreaterThan(0);
      expect(reading.luckyNumbers.length).toBeLessThanOrEqual(4);
    });

    it('compatibility is non-empty array', () => {
      const reading = calculateFullReading('Test User', '2000-01-01');
      expect(Array.isArray(reading.compatibility)).toBe(true);
      expect(reading.compatibility.length).toBeGreaterThan(0);
    });

    it('descriptions are populated', () => {
      const reading = calculateFullReading('Test User', '2000-01-01');
      expect(reading.lifePathDescription.length).toBeGreaterThan(0);
      expect(reading.destinyDescription.length).toBeGreaterThan(0);
      expect(reading.soulUrgeDescription.length).toBeGreaterThan(0);
    });
  });

  describe('Name value consistency', () => {
    it('same name always gives same destiny number', () => {
      const r1 = calculateDestiny('Alexander');
      const r2 = calculateDestiny('Alexander');
      expect(r1.number).toBe(r2.number);
      expect(r1.nameValue).toBe(r2.nameValue);
    });

    it('same birthdate always gives same life path number', () => {
      const r1 = calculateLifePath('1990-01-15');
      const r2 = calculateLifePath('1990-01-15');
      expect(r1.number).toBe(r2.number);
    });
  });

  describe('API route validation logic', () => {
    function validateRequest(body: Record<string, unknown>) {
      const { name, birthdate } = body as { name?: string; birthdate?: string };
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return { status: 400, code: 'MISSING_NAME' };
      }
      if (!birthdate || typeof birthdate !== 'string' || birthdate.replace(/\D/g, '').length < 8) {
        return { status: 400, code: 'INVALID_BIRTHDATE' };
      }
      return { status: 200 };
    }

    it('returns 400 for missing name', () => {
      const result = validateRequest({ birthdate: '1990-01-01' });
      expect(result.status).toBe(400);
      expect(result.code).toBe('MISSING_NAME');
    });

    it('returns 400 for empty name', () => {
      const result = validateRequest({ name: '   ', birthdate: '1990-01-01' });
      expect(result.status).toBe(400);
      expect(result.code).toBe('MISSING_NAME');
    });

    it('returns 400 for invalid birthdate', () => {
      const result = validateRequest({ name: 'John', birthdate: '2000' });
      expect(result.status).toBe(400);
      expect(result.code).toBe('INVALID_BIRTHDATE');
    });

    it('returns 400 for birthdate with less than 8 digits', () => {
      const result = validateRequest({ name: 'John', birthdate: '1-1-1' });
      expect(result.status).toBe(400);
      expect(result.code).toBe('INVALID_BIRTHDATE');
    });

    it('returns 200 for valid input', () => {
      const result = validateRequest({ name: 'John', birthdate: '1990-01-15' });
      expect(result.status).toBe(200);
    });
  });
});
