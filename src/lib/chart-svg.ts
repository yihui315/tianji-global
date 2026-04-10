/**
 * Chart SVG Generator for PDF Reports
 * TianJi Global | 天机全球
 * 
 * Generates SVG strings for natal and synastry charts
 * that can be embedded directly in PDFs.
 */

import { ZODIAC_SIGNS } from './synastry-engine';

export interface PlanetPoint {
  name: string;
  longitude: number;
  signSymbol: string;
  signName: string;
  degree: number;
}

export interface ChartSvgOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  circleColor?: string;
  pointsColor?: string;
  signsColor?: string;
}

// ─── Coordinate Helpers ───────────────────────────────────────────────────────

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

// ─── Natal Chart SVG ──────────────────────────────────────────────────────────

export function generateNatalChartSvg(
  planets: PlanetPoint[],
  cusps: number[],
  options: ChartSvgOptions = {}
): string {
  const {
    width = 500,
    height = 500,
    backgroundColor = '#1e293b',
    circleColor = '#475569',
    pointsColor = '#e2e8f0',
    signsColor = '#64748b',
  } = options;

  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(width, height) / 2 - 20;
  const innerR = outerR * 0.85;
  const signsR = outerR * 0.92;
  const pointsR = outerR * 0.75;

  const PLANET_COLORS: Record<string, string> = {
    Sun: '#FFD700',
    Moon: '#C0C0C0',
    Mercury: '#B8860B',
    Venus: '#98FB98',
    Mars: '#FF6347',
    Jupiter: '#DAA520',
    Saturn: '#708090',
    Uranus: '#40E0D0',
    Neptune: '#4169E1',
    Pluto: '#8B008B',
  };

  const PLANET_SYMBOLS: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  };

  // Generate zodiac sign segments
  const signSegments = ZODIAC_SIGNS.map((sign, i) => {
    const startAngle = i * 30;
    const endAngle = (i + 1) * 30;
    const path = describeArc(cx, cy, outerR, startAngle, endAngle);
    const color = [
      '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
      '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
      '#FF9F43', '#786FA6', '#63CDDA', '#7B68EE',
    ][i];
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="12" opacity="0.3"/>`;
  }).join('\n    ');

  // Generate house cusp lines
  const cuspLines = cusps.map((cusp, i) => {
    const outer = polarToCartesian(cx, cy, outerR, cusp);
    const inner = polarToCartesian(cx, cy, innerR, cusp);
    return `<line x1="${outer.x}" y1="${outer.y}" x2="${inner.x}" y2="${inner.y}" stroke="${circleColor}" stroke-width="1" opacity="0.6"/>`;
  }).join('\n    ');

  // Generate planet points
  const planetPoints = planets.map((planet) => {
    const pos = polarToCartesian(cx, cy, pointsR, planet.longitude);
    const color = PLANET_COLORS[planet.name] || pointsColor;
    const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];
    return `
    <g class="planet" data-name="${planet.name}">
      <circle cx="${pos.x}" cy="${pos.y}" r="8" fill="${color}" opacity="0.9"/>
      <text x="${pos.x + 12}" y="${pos.y - 4}" font-size="12" fill="${color}" font-weight="bold">${symbol}</text>
      <title>${planet.name} ${planet.signSymbol} ${planet.signName} ${planet.degree}°</title>
    </g>`;
  }).join('\n');

  // Generate zodiac sign labels
  const signLabels = ZODIAC_SIGNS.map((sign, i) => {
    const angle = i * 30 + 15; // center of each sign
    const pos = polarToCartesian(cx, cy, signsR, angle);
    return `
    <g class="sign" data-name="${sign.name}">
      <text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="middle" font-size="14" fill="${signsColor}">${sign.symbol}</text>
    </g>`;
  }).join('\n');

  // Ascendant, IC, Descendant, MC markers
  const asc = cusps[0];
  const ic = (cusps[3] + 180) % 360;
  const dsc = (cusps[0] + 180) % 360;
  const mc = cusps[3];

  const angleMarkers = [
    { angle: asc, label: 'As', color: '#22c55e' },
    { angle: ic, label: 'Ic', color: '#6366f1' },
    { angle: dsc, label: 'Ds', color: '#f59e0b' },
    { angle: mc, label: 'Mc', color: '#ec4899' },
  ].map(({ angle, label, color }) => {
    const outer = polarToCartesian(cx, cy, outerR - 5, angle);
    const inner = polarToCartesian(cx, cy, innerR + 10, angle);
    return `
    <g class="angle-marker" data-label="${label}">
      <line x1="${outer.x}" y1="${outer.y}" x2="${inner.x}" y2="${inner.y}" stroke="${color}" stroke-width="2.5"/>
      <text x="${outer.x}" y="${outer.y}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="${color}" font-weight="bold">${label}</text>
    </g>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="12"/>
  
  <!-- Zodiac sign colored segments -->
  <g class="zodiac-segments">
    ${signSegments}
  </g>
  
  <!-- Outer circle -->
  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="${circleColor}" stroke-width="2"/>
  
  <!-- Inner circle (house boundary) -->
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="${circleColor}" stroke-width="1" opacity="0.5"/>
  
  <!-- House cusp lines -->
  <g class="house-cusps">
    ${cuspLines}
  </g>
  
  <!-- Angle markers (Ascendant, IC, Descendant, MC) -->
  <g class="angle-markers">
    ${angleMarkers}
  </g>
  
  <!-- Zodiac sign labels -->
  <g class="sign-labels">
    ${signLabels}
  </g>
  
  <!-- Planet points -->
  <g class="planets">
    ${planetPoints}
  </g>
  
  <!-- Center decoration -->
  <circle cx="${cx}" cy="${cy}" r="25" fill="${backgroundColor}" stroke="${circleColor}" stroke-width="2"/>
  <text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="9" fill="${signsColor}">NATAL</text>
  <text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="11" fill="${pointsColor}" font-weight="bold">星盘</text>
</svg>`;
}

// ─── Synastry Chart SVG ───────────────────────────────────────────────────────

export interface SynastryPlanetData {
  name: string;
  longitude: number;
  signSymbol: string;
  signName: string;
  degree: number;
}

export function generateSynastryChartSvg(
  person1Planets: SynastryPlanetData[],
  person2Planets: SynastryPlanetData[],
  options: ChartSvgOptions = {}
): string {
  const {
    width = 500,
    height = 500,
    backgroundColor = '#1e293b',
    circleColor = '#475569',
    pointsColor = '#e2e8f0',
    signsColor = '#64748b',
  } = options;

  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(width, height) / 2 - 20;
  const innerR = outerR * 0.7;
  const signsR = outerR * 0.92;

  const PLANET_COLORS_P1 = '#3b82f6'; // Blue for Person A
  const PLANET_COLORS_P2 = '#ef4444'; // Red for Person B

  const PLANET_SYMBOLS: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  };

  // Generate zodiac sign segments
  const signSegments = ZODIAC_SIGNS.map((sign, i) => {
    const startAngle = i * 30;
    const endAngle = (i + 1) * 30;
    const path = describeArc(cx, cy, outerR, startAngle, endAngle);
    const color = [
      '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3',
      '#F38181', '#AA96DA', '#FCBAD3', '#A8D8EA',
      '#FF9F43', '#786FA6', '#63CDDA', '#7B68EE',
    ][i];
    return `<path d="${path}" fill="none" stroke="${color}" stroke-width="10" opacity="0.25"/>`;
  }).join('\n    ');

  // Generate zodiac sign labels
  const signLabels = ZODIAC_SIGNS.map((sign, i) => {
    const angle = i * 30 + 15;
    const pos = polarToCartesian(cx, cy, signsR, angle);
    return `
    <g class="sign" data-name="${sign.name}">
      <text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="${signsColor}">${sign.symbol}</text>
    </g>`;
  }).join('\n');

  // Generate Person A planets (outer ring)
  const p1Planets = person1Planets.map((planet) => {
    const pos = polarToCartesian(cx, cy, outerR - 15, planet.longitude);
    const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];
    return `
    <g class="planet-p1" data-name="${planet.name}">
      <circle cx="${pos.x}" cy="${pos.y}" r="7" fill="${PLANET_COLORS_P1}" opacity="0.9"/>
      <circle cx="${pos.x}" cy="${pos.y}" r="5" fill="#60a5fa"/>
      <text x="${pos.x + 10}" y="${pos.y - 3}" font-size="10" fill="#93c5fd" font-weight="bold">${symbol}</text>
      <title>Person A: ${planet.name} ${planet.signSymbol} ${planet.signName} ${planet.degree}°</title>
    </g>`;
  }).join('\n');

  // Generate Person B planets (inner ring)
  const p2Planets = person2Planets.map((planet) => {
    const pos = polarToCartesian(cx, cy, innerR + 10, planet.longitude);
    const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];
    return `
    <g class="planet-p2" data-name="${planet.name}">
      <circle cx="${pos.x}" cy="${pos.y}" r="7" fill="${PLANET_COLORS_P2}" opacity="0.9"/>
      <circle cx="${pos.x}" cy="${pos.y}" r="5" fill="#f87171"/>
      <text x="${pos.x - 10}" y="${pos.y - 3}" font-size="10" fill="#fca5a5" font-weight="bold" text-anchor="end">${symbol}</text>
      <title>Person B: ${planet.name} ${planet.signSymbol} ${planet.signName} ${planet.degree}°</title>
    </g>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${backgroundColor}" rx="12"/>
  
  <!-- Zodiac sign colored segments -->
  <g class="zodiac-segments">
    ${signSegments}
  </g>
  
  <!-- Outer ring (Person A) -->
  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#3b82f6" stroke-width="2" opacity="0.4"/>
  
  <!-- Inner ring (Person B) -->
  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#ef4444" stroke-width="2" opacity="0.4"/>
  
  <!-- Signs ring -->
  <circle cx="${cx}" cy="${cy}" r="${signsR}" fill="none" stroke="${circleColor}" stroke-width="1" stroke-dasharray="4 4" opacity="0.4"/>
  
  <!-- Zodiac sign labels -->
  <g class="sign-labels">
    ${signLabels}
  </g>
  
  <!-- Person A planets (outer ring) -->
  <g class="planets-p1">
    ${p1Planets}
  </g>
  
  <!-- Person B planets (inner ring) -->
  <g class="planets-p2">
    ${p2Planets}
  </g>
  
  <!-- Center decoration -->
  <circle cx="${cx}" cy="${cy}" r="30" fill="${backgroundColor}" stroke="${circleColor}" stroke-width="2"/>
  <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="9" fill="${signsColor}">SYN-ASTRY</text>
  <text x="${cx}" y="${cy + 8}" text-anchor="middle" font-size="11" fill="${pointsColor}" font-weight="bold">天机合盘</text>
  
  <!-- Legend -->
  <g transform="translate(${width - 180}, ${height - 35})">
    <rect x="-5" y="-12" width="180" height="24" fill="${backgroundColor}" opacity="0.8" rx="4"/>
    <circle cx="8" cy="0" r="5" fill="#3b82f6"/>
    <text x="18" y="4" font-size="9" fill="#93c5fd">Person A</text>
    <circle cx="85" cy="0" r="5" fill="#ef4444"/>
    <text x="95" y="4" font-size="9" fill="#fca5a5">Person B</text>
  </g>
</svg>`;
}

// ─── SVG to Image Data URL ────────────────────────────────────────────────────

export function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
