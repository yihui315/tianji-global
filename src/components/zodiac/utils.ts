import { AspectType, Planet } from './types';
import { ASPECT_CONFIG, ZODIAC_SIGNS } from './constants';

export function degreeToRadian(degree: number): number {
  return (degree * Math.PI) / 180;
}

export function getZodiacSign(longitude: number): { sign: string; degree: number } {
  const signIndex = Math.floor(longitude / 30) % 12;
  const degreeInSign = longitude % 30;
  return { sign: ZODIAC_SIGNS[signIndex], degree: degreeInSign };
}

export function getPositionOnCircle(
  centerX: number,
  centerY: number,
  radius: number,
  degree: number
): { x: number; y: number } {
  const radian = degreeToRadian(degree - 90); // -90 to start from top
  return {
    x: centerX + radius * Math.cos(radian),
    y: centerY + radius * Math.sin(radian)
  };
}

export function calculateAspect(
  planet1Long: number,
  planet2Long: number
): { type: AspectType; orb: number } | null {
  let diff = Math.abs(planet1Long - planet2Long);
  if (diff > 180) diff = 360 - diff;

  for (const [type, config] of Object.entries(ASPECT_CONFIG)) {
    if (Math.abs(diff - config.angle) <= config.orb) {
      return { type: type as AspectType, orb: Math.abs(diff - config.angle) };
    }
  }
  return null;
}

export function resolvePlanetCollisions(
  planets: Planet[],
  threshold: number = 5
): Planet[][] {
  const groups: Planet[][] = [];
  const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);

  let currentGroup: Planet[] = [];
  for (const planet of sorted) {
    if (currentGroup.length === 0) {
      currentGroup.push(planet);
    } else {
      const lastPlanet = currentGroup[currentGroup.length - 1];
      if (Math.abs(planet.longitude - lastPlanet.longitude) <= threshold) {
        currentGroup.push(planet);
      } else {
        if (currentGroup.length > 0) groups.push(currentGroup);
        currentGroup = [planet];
      }
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  return groups;
}

export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

export function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', x, y,
    'Z'
  ].join(' ');
}

export function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m}'`;
}

export function cuspDegreeToSVGAngle(cuspDegree: number): number {
  // cuspDegree is zodiac longitude (0-360)
  // SVG angles: 0° = top (-90 in standard math), clockwise positive
  // Zodiac: 0° = Aries at vernal equinox, counter-clockwise from right (3 o'clock)
  // Since getPositionOnCircle already handles the -90 offset, we can use cuspDegree directly
  return cuspDegree;
}
