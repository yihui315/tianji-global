'use client';

import { useEffect, useRef } from 'react';
import type { RelationshipDimensions } from '@/types/relationship';

interface RelationshipRadarProps {
  dimensions: RelationshipDimensions;
  personANickname: string;
  personBNickname: string;
  lang?: 'zh' | 'en';
}

const DIMENSION_KEYS = ['attraction', 'communication', 'conflict', 'rhythm', 'longTerm'] as const;

const DIMENSION_LABELS: Record<string, Record<string, string>> = {
  zh: {
    attraction: '吸引力',
    communication: '沟通',
    conflict: '冲突',
    rhythm: '节奏',
    longTerm: '长期',
  },
  en: {
    attraction: 'Attraction',
    communication: 'Communication',
    conflict: 'Conflict',
    rhythm: 'Rhythm',
    longTerm: 'Long-term',
  },
};

const DIMENSION_COLORS = ['#F472B6', '#A78BFA', '#F87171', '#34D399', '#F59E0B'];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function RelationshipRadar({ dimensions, personANickname, personBNickname, lang = 'zh' }: RelationshipRadarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const labels = DIMENSION_LABELS[lang] ?? DIMENSION_LABELS.zh;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const width = svg.viewBox.baseVal.width || 400;
    const height = svg.viewBox.baseVal.height || 400;
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(cx, cy) * 0.65;
    const numAxes = 5;
    const angleStep = 360 / numAxes;

    // Clear previous content
    svg.innerHTML = '';

    // Draw grid circles
    for (let level = 1; level <= 4; level++) {
      const r = (maxR * level) / 4;
      const points: string[] = [];
      for (let i = 0; i < numAxes; i++) {
        const { x, y } = polarToCartesian(cx, cy, r, i * angleStep);
        points.push(`${x},${y}`);
      }
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', points.join(' '));
      polygon.setAttribute('fill', 'none');
      polygon.setAttribute('stroke', 'rgba(255,255,255,0.06)');
      polygon.setAttribute('stroke-width', '1');
      svg.appendChild(polygon);
    }

    // Draw axes
    for (let i = 0; i < numAxes; i++) {
      const { x, y } = polarToCartesian(cx, cy, maxR, i * angleStep);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(cx));
      line.setAttribute('y1', String(cy));
      line.setAttribute('x2', String(x));
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', 'rgba(255,255,255,0.08)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }

    // Draw data polygon for person A (solid)
    const dataPointsA: string[] = [];
    for (let i = 0; i < numAxes; i++) {
      const key = DIMENSION_KEYS[i];
      const score = dimensions[key].score;
      const r = (score / 100) * maxR;
      const { x, y } = polarToCartesian(cx, cy, r, i * angleStep);
      dataPointsA.push(`${x},${y}`);
    }
    const polyA = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polyA.setAttribute('points', dataPointsA.join(' '));
    polyA.setAttribute('fill', 'rgba(167,139,250,0.25)');
    polyA.setAttribute('stroke', '#A78BFA');
    polyA.setAttribute('stroke-width', '2');
    svg.appendChild(polyA);

    // Draw data points for A
    for (let i = 0; i < numAxes; i++) {
      const key = DIMENSION_KEYS[i];
      const score = dimensions[key].score;
      const r = (score / 100) * maxR;
      const { x, y } = polarToCartesian(cx, cy, r, i * angleStep);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(x));
      circle.setAttribute('cy', String(y));
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#A78BFA');
      svg.appendChild(circle);
    }

    // Draw axis labels
    for (let i = 0; i < numAxes; i++) {
      const key = DIMENSION_KEYS[i];
      const score = dimensions[key].score;
      const labelR = maxR + 28;
      const { x, y } = polarToCartesian(cx, cy, labelR, i * angleStep);
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x));
      text.setAttribute('y', String(y));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', 'rgba(226,232,240,0.7)');
      text.setAttribute('font-size', '11');
      text.setAttribute('font-family', 'serif');
      text.textContent = labels[key] ?? key;
      g.appendChild(text);

      // Score value
      const scoreText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      scoreText.setAttribute('x', String(x));
      scoreText.setAttribute('y', String(y + 14));
      scoreText.setAttribute('text-anchor', 'middle');
      scoreText.setAttribute('fill', DIMENSION_COLORS[i]);
      scoreText.setAttribute('font-size', '10');
      scoreText.setAttribute('font-weight', 'bold');
      scoreText.textContent = `${score}`;
      g.appendChild(scoreText);
      svg.appendChild(g);
    }
  }, [dimensions, labels]);

  return (
    <div className="w-full flex flex-col items-center">
      <svg
        ref={svgRef}
        viewBox="0 0 400 420"
        className="w-full max-w-md"
        style={{ overflow: 'visible' }}
      />
      <div className="flex items-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#A78BFA' }} />
          <span className="text-xs" style={{ color: 'rgba(226,232,240,0.6)' }}>
            {personANickname}
          </span>
        </div>
      </div>
    </div>
  );
}
