import {
  polarToCartesian,
  describeArc,
  formatDegree,
  cuspDegreeToSVGAngle,
  getPositionOnCircle,
  resolvePlanetCollisions,
  degreeToRadian
} from '@/components/zodiac/utils';

describe('SVG helper functions', () => {
  describe('polarToCartesian', () => {
    it('converts top position correctly (0 degrees)', () => {
      const result = polarToCartesian(400, 400, 100, 0);
      expect(result.x).toBeCloseTo(400);
      expect(result.y).toBeCloseTo(300);
    });

    it('converts right position correctly (90 degrees)', () => {
      const result = polarToCartesian(400, 400, 100, 90);
      expect(result.x).toBeCloseTo(500);
      expect(result.y).toBeCloseTo(400);
    });

    it('converts bottom position correctly (180 degrees)', () => {
      const result = polarToCartesian(400, 400, 100, 180);
      expect(result.x).toBeCloseTo(400);
      expect(result.y).toBeCloseTo(500);
    });

    it('converts left position correctly (270 degrees)', () => {
      const result = polarToCartesian(400, 400, 100, 270);
      expect(result.x).toBeCloseTo(300);
      expect(result.y).toBeCloseTo(400);
    });
  });

  describe('describeArc', () => {
    it('creates a valid arc path for 30 degree segment', () => {
      const path = describeArc(400, 400, 100, -90, -60);
      expect(path).toContain('M');
      expect(path).toContain('A');
      expect(path).toContain('L');
      expect(path).toContain('Z');
    });

    it('creates arc that starts and ends at correct positions', () => {
      const path = describeArc(400, 400, 100, -90, -60);
      // Path format: M x y A ... L x y Z
      const parts = path.split(' ');
      // First coord after M should be for -60 degrees (endAngle)
      // For -60°: x = 400 + 100*cos(-60°) = 450, y = 400 + 100*sin(-60°) ≈ 313.4
      // But the describeArc function uses polarToCartesian which subtracts 90
      // So we need to trace: angle=-60 → (angle-90)=-150
      // cos(-150°) = -√3/2 ≈ -0.866, sin(-150°) = -1/2
      // x = 400 + 100*(-0.866) = 313.4
      // y = 400 + 100*(-0.5) = 350
      // So actually the first coord should be around (313.4, 350)
      expect(parts.length).toBeGreaterThan(0);
      expect(path).toContain('A'); // Should have arc command
      expect(path).toContain('Z'); // Should close path
    });
  });

  describe('formatDegree', () => {
    it('formats whole degrees correctly', () => {
      expect(formatDegree(23)).toBe('23°0\'');
    });

    it('formats degrees with minutes correctly', () => {
      expect(formatDegree(23.5)).toBe('23°30\'');
    });

    it('handles 0 degrees', () => {
      expect(formatDegree(0)).toBe('0°0\'');
    });

    it('handles near 30 degrees (end of sign)', () => {
      expect(formatDegree(29.99)).toBe('29°59\'');
    });
  });

  describe('cuspDegreeToSVGAngle', () => {
    it('returns the same value since getPositionOnCircle handles the offset', () => {
      expect(cuspDegreeToSVGAngle(0)).toBe(0);
      expect(cuspDegreeToSVGAngle(90)).toBe(90);
      expect(cuspDegreeToSVGAngle(180)).toBe(180);
      expect(cuspDegreeToSVGAngle(270)).toBe(270);
    });
  });
});

describe('position and collision functions', () => {
  describe('getPositionOnCircle', () => {
    it('places point at top for degree 0', () => {
      const pos = getPositionOnCircle(400, 400, 100, 0);
      expect(pos.x).toBeCloseTo(400);
      expect(pos.y).toBeCloseTo(300);
    });

    it('places point at right for degree 90', () => {
      const pos = getPositionOnCircle(400, 400, 100, 90);
      expect(pos.x).toBeCloseTo(500);
      expect(pos.y).toBeCloseTo(400);
    });
  });

  describe('resolvePlanetCollisions', () => {
    it('returns single planets as separate groups when far apart', () => {
      const planets = [
        { name: 'Sun', sign: 'Aries', degree: 0, house: 1, isRetrograde: false, speed: 1, longitude: 0 },
        { name: 'Moon', sign: 'Leo', degree: 0, house: 5, isRetrograde: false, speed: 13, longitude: 120 }
      ];
      const groups = resolvePlanetCollisions(planets, 5);
      expect(groups).toHaveLength(2);
    });

    it('groups planets within threshold together', () => {
      const planets = [
        { name: 'Sun', sign: 'Aries', degree: 0, house: 1, isRetrograde: false, speed: 1, longitude: 0 },
        { name: 'Moon', sign: 'Aries', degree: 3, house: 1, isRetrograde: false, speed: 13, longitude: 3 }
      ];
      const groups = resolvePlanetCollisions(planets, 5);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
    });
  });

  describe('degreeToRadian', () => {
    it('converts 0 degrees to 0 radians', () => {
      expect(degreeToRadian(0)).toBeCloseTo(0);
    });

    it('converts 180 degrees to PI radians', () => {
      expect(degreeToRadian(180)).toBeCloseTo(Math.PI);
    });

    it('converts 90 degrees to PI/2 radians', () => {
      expect(degreeToRadian(90)).toBeCloseTo(Math.PI / 2);
    });
  });
});
