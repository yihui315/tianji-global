'use client';

import React, { memo, useMemo } from 'react';
import {
  ZodiacChartProps,
  Planet,
  Aspect,
  HouseCusp
} from './types';
import {
  ZODIAC_SIGNS,
  ZODIAC_SIGNS_ZH,
  PLANET_SYMBOLS,
  PLANET_NAMES_ZH,
  ASPECT_CONFIG,
  SIGN_ELEMENTS,
  ELEMENT_COLORS,
  CHART_DIMENSIONS,
  SIGN_SYMBOLS
} from './constants';
import {
  degreeToRadian,
  getPositionOnCircle,
  resolvePlanetCollisions,
  describeArc,
  polarToCartesian,
  formatDegree,
  cuspDegreeToSVGAngle
} from './utils';

const ZodiacChart: React.FC<ZodiacChartProps> = memo((props) => {
  const {
    planets = [],
    aspects = [],
    houseCusps = [],
    size = 800,
    theme = 'dark',
    language = 'zh',
    showAspects = true,
    showHouseCusps = true,
    showSignBoundaries = true,
    showPlanetDegrees = false,
    showCuspDegrees = false,
    onPlanetClick,
    onSignClick,
    onHouseClick
  } = props;

  const { center, outerRing, houseRing, planetRing, innerCircle, signArcDegrees } = CHART_DIMENSIONS;

  // Theme colors
  const colors = useMemo(() => {
    switch (theme) {
      case 'dark':
        return {
          background: '#0a0f1a',
          text: '#E8E8E8',
          houseLines: 'rgba(255,255,255,0.3)',
          signBoundaries: 'rgba(255,255,255,0.6)',
          aspectLines: 'rgba(255,255,255,0.4)'
        };
      case 'light':
        return {
          background: '#F5F5F5',
          text: '#333333',
          houseLines: 'rgba(0,0,0,0.3)',
          signBoundaries: 'rgba(0,0,0,0.6)',
          aspectLines: 'rgba(0,0,0,0.4)'
        };
      case 'transparent':
        return {
          background: 'transparent',
          text: '#E8E8E8',
          houseLines: 'rgba(128,128,128,0.5)',
          signBoundaries: 'rgba(128,128,128,0.8)',
          aspectLines: 'rgba(128,128,128,0.5)'
        };
    }
  }, [theme]);

  // Planet collision groups
  const planetGroups = useMemo(() => {
    return resolvePlanetCollisions(planets, 5);
  }, [planets]);

  // ============================================
  // Phase 1: Zodiac Ring (outermost) - 12 sign arcs
  // ============================================
  const renderZodiacRing = useMemo(() => {
    const signArcs = [];
    for (let i = 0; i < 12; i++) {
      const startAngle = i * 30 - 90; // start from top (-90°)
      const endAngle = startAngle + 30;
      const signName = ZODIAC_SIGNS[i];
      const element = SIGN_ELEMENTS[signName];
      const color = ELEMENT_COLORS[element];

      // Draw arc path
      const path = describeArc(center, center, outerRing, startAngle, endAngle);

      // Sign symbol position at midpoint of arc
      const midAngle = (startAngle + endAngle) / 2;
      const symbolPos = polarToCartesian(center, center, outerRing - 25, midAngle);

      signArcs.push(
        <g key={signName}>
          <path
            d={path}
            fill={color}
            fillOpacity={0.15}
            stroke={color}
            strokeWidth={1}
            onClick={() => onSignClick?.(signName)}
            style={{ cursor: 'pointer' }}
          >
            <title>{language === 'zh' ? ZODIAC_SIGNS_ZH[signName] : signName}</title>
          </path>
          <text
            x={symbolPos.x}
            y={symbolPos.y}
            fill={color}
            fontSize={18}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={() => onSignClick?.(signName)}
          >
            {SIGN_SYMBOLS[signName]}
            <title>{language === 'zh' ? ZODIAC_SIGNS_ZH[signName] : signName}</title>
          </text>
        </g>
      );
    }
    return signArcs;
  }, [center, outerRing, language, onSignClick]);

  // ============================================
  // Phase 2: House Cusps (middle ring)
  // ============================================
  const renderHouseCusps = useMemo(() => {
    if (!showHouseCusps) return null;

    return houseCusps.map((cusp) => {
      const angle = cuspDegreeToSVGAngle(cusp.cuspDegree);
      const outerPoint = polarToCartesian(center, center, outerRing, angle);
      const innerPoint = polarToCartesian(center, center, houseRing, angle);

      return (
        <line
          key={`house-${cusp.house}`}
          x1={innerPoint.x}
          y1={innerPoint.y}
          x2={outerPoint.x}
          y2={outerPoint.y}
          stroke={colors.houseLines}
          strokeWidth={1}
          onClick={() => onHouseClick?.(cusp.house)}
          style={{ cursor: 'pointer' }}
        >
          <title>
            House {cusp.house}: {language === 'zh' ? ZODIAC_SIGNS_ZH[cusp.sign] : cusp.sign} {formatDegree(cusp.signDegree)}°
          </title>
        </line>
      );
    });
  }, [center, outerRing, houseRing, houseCusps, showHouseCusps, colors.houseLines, language, onHouseClick]);

  // ============================================
  // Phase 3: Planet Positions (innermost ring)
  // ============================================
  const renderPlanetSymbol = (planet: Planet, pos: { x: number; y: number }, groupIndex: number) => {
    const symbol = PLANET_SYMBOLS[planet.name] || planet.name[0];
    const isRetrograde = planet.isRetrograde;

    return (
      <g
        key={`planet-${planet.name}-${groupIndex}`}
        onClick={() => onPlanetClick?.(planet)}
        style={{ cursor: 'pointer' }}
      >
        {/* Planet symbol */}
        <text
          x={pos.x}
          y={pos.y}
          fill={colors.text}
          fontSize={16}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ userSelect: 'none' }}
        >
          {symbol}
          {isRetrograde && (
            <tspan fontSize={10} dx={2} dy={-4}>↺</tspan>
          )}
          <title>
            {language === 'zh' ? PLANET_NAMES_ZH[planet.name] : planet.name}
            {isRetrograde ? ' (R)' : ''}
            {' '}{language === 'zh' ? ZODIAC_SIGNS_ZH[planet.sign] : planet.sign} {formatDegree(planet.degree)}°
            {' '}House {planet.house}
          </title>
        </text>
        {/* Optional: show degree */}
        {showPlanetDegrees && (
          <text
            x={pos.x}
            y={pos.y + 12}
            fill={colors.text}
            fontSize={9}
            textAnchor="middle"
            dominantBaseline="middle"
            opacity={0.7}
          >
            {formatDegree(planet.degree)}°
          </text>
        )}
      </g>
    );
  };

  const renderPlanets = useMemo(() => {
    const planetElements: React.ReactNode[] = [];

    planetGroups.forEach((group, groupIndex) => {
      if (group.length === 1) {
        const planet = group[0];
        const pos = getPositionOnCircle(center, center, planetRing, planet.longitude);
        planetElements.push(renderPlanetSymbol(planet, pos, groupIndex));
      } else {
        // Multiple planets at similar positions - stack them
        const baseAngle = group[0].longitude;
        const basePos = getPositionOnCircle(center, center, planetRing, baseAngle);

        // Stack planets vertically
        const stackOffset = 14;
        const totalHeight = (group.length - 1) * stackOffset;

        group.forEach((planet, idx) => {
          const offsetY = idx * stackOffset - totalHeight / 2;
          const pos = { x: basePos.x, y: basePos.y + offsetY };
          planetElements.push(renderPlanetSymbol(planet, pos, groupIndex));
        });
      }
    });

    return planetElements;
  }, [center, planetRing, planetGroups, colors.text, showPlanetDegrees, onPlanetClick, language]);

  // ============================================
  // Phase 4: Aspect Lines
  // ============================================
  const renderAspectLines = useMemo(() => {
    if (!showAspects) return null;

    const lines: React.ReactNode[] = [];

    for (const aspect of aspects) {
      const planet1 = planets.find(p => p.name === aspect.planet1);
      const planet2 = planets.find(p => p.name === aspect.planet2);
      if (!planet1 || !planet2) continue;

      const pos1 = getPositionOnCircle(center, center, planetRing, planet1.longitude);
      const pos2 = getPositionOnCircle(center, center, planetRing, planet2.longitude);

      const config = ASPECT_CONFIG[aspect.type];

      lines.push(
        <line
          key={`${aspect.planet1}-${aspect.planet2}`}
          x1={pos1.x}
          y1={pos1.y}
          x2={pos2.x}
          y2={pos2.y}
          stroke={config.color}
          strokeWidth={aspect.type === 'trine' || aspect.type === 'square' ? 2 : 1}
          strokeDasharray={config.style === 'dotted' ? '4,4' : 'none'}
          opacity={0.6}
        >
          <title>
            {aspect.planet1} {language === 'zh' ? PLANET_NAMES_ZH[aspect.planet1] : ''} 
            {' - '}
            {aspect.type}
            {' - '}
            {aspect.planet2} {language === 'zh' ? PLANET_NAMES_ZH[aspect.planet2] : ''}
            {` (orb: ${aspect.orb.toFixed(1)}°)`}
          </title>
        </line>
      );
    }

    return lines;
  }, [center, planetRing, aspects, planets, showAspects, language]);

  // ============================================
  // Phase 5: Center Design
  // ============================================
  const renderCenter = useMemo(() => {
    const ascCusp = houseCusps.find(c => c.house === 1);

    return (
      <g>
        {/* Earth symbol */}
        <text
          x={center}
          y={center - 15}
          textAnchor="middle"
          fontSize={24}
          fill={colors.text}
          style={{ userSelect: 'none' }}
        >
          ⊕
          <title>Earth</title>
        </text>
        {/* ASC degree */}
        {ascCusp && (
          <text
            x={center}
            y={center + 15}
            textAnchor="middle"
            fontSize={11}
            fill={colors.text}
            opacity={0.9}
          >
            ASC {formatDegree(ascCusp.signDegree)}°
            <title>
              Ascendant: {language === 'zh' ? ZODIAC_SIGNS_ZH[ascCusp.sign] : ascCusp.sign} {formatDegree(ascCusp.signDegree)}°
            </title>
          </text>
        )}
        {/* Inner decorative circle */}
        <circle
          cx={center}
          cy={center}
          r={innerCircle / 2}
          fill="none"
          stroke={colors.signBoundaries}
          strokeWidth={1}
          opacity={0.5}
        />
      </g>
    );
  }, [center, innerCircle, houseCusps, colors.text, colors.signBoundaries, language]);

  return (
    <svg
      viewBox={`0 0 800 800`}
      width={size}
      height={size}
      style={{ background: colors.background }}
      aria-label={language === 'zh' ? '星盘图表' : 'Zodiac Chart'}
    >
      {/* Layer 0: Background circles (decorative) */}
      <circle
        cx={center}
        cy={center}
        r={outerRing}
        fill="none"
        stroke={colors.signBoundaries}
        strokeWidth={2}
        opacity={0.3}
      />
      <circle
        cx={center}
        cy={center}
        r={houseRing}
        fill="none"
        stroke={colors.houseLines}
        strokeWidth={1}
        opacity={0.5}
      />

      {/* Layer 1: Zodiac ring (outer) - 12 sign arcs with element colors */}
      {renderZodiacRing}

      {/* Layer 2: House divisions (middle) */}
      {renderHouseCusps}

      {/* Layer 3: Planet positions (inner) */}
      {renderPlanets}

      {/* Layer 4: Aspect lines */}
      {renderAspectLines}

      {/* Layer 5: Center - Earth symbol + ASC degree */}
      {renderCenter}

      {/* Optional: Cusp degree labels */}
      {showCuspDegrees && houseCusps.map((cusp) => {
        const angle = cuspDegreeToSVGAngle(cusp.cuspDegree);
        const labelPos = polarToCartesian(center, center, houseRing + 15, angle);
        return (
          <text
            key={`cusp-degree-${cusp.house}`}
            x={labelPos.x}
            y={labelPos.y}
            fill={colors.text}
            fontSize={8}
            textAnchor="middle"
            dominantBaseline="middle"
            opacity={0.7}
          >
            {formatDegree(cusp.signDegree)}°
          </text>
        );
      })}
    </svg>
  );
});

ZodiacChart.displayName = 'ZodiacChart';

export default ZodiacChart;
