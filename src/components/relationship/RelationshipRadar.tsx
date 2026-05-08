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

const DIMENSION_LABELS = {
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
} as const;

const DIMENSION_COLORS = ['#FF8F83', '#D8B77B', '#F87171', '#34D399', '#F5B35D'];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function RelationshipRadar({
  dimensions,
  personANickname,
  personBNickname,
  lang = 'zh',
}: RelationshipRadarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const labels = DIMENSION_LABELS[lang] ?? DIMENSION_LABELS.zh;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const width = svg.viewBox.baseVal.width || 400;
    const height = svg.viewBox.baseVal.height || 420;
    const cx = width / 2;
    const cy = height / 2;
    const maxR = Math.min(cx, cy) * 0.64;
    const numAxes = 5;
    const angleStep = 360 / numAxes;

    svg.innerHTML = '';

    for (let level = 1; level <= 4; level += 1) {
      const r = (maxR * level) / 4;
      const points: string[] = [];
      for (let i = 0; i < numAxes; i += 1) {
        const { x, y } = polarToCartesian(cx, cy, r, i * angleStep);
        points.push(`${x},${y}`);
      }
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', points.join(' '));
      polygon.setAttribute('fill', 'none');
      polygon.setAttribute('stroke', 'rgba(216,183,123,0.13)');
      polygon.setAttribute('stroke-width', '1');
      svg.appendChild(polygon);
    }

    for (let i = 0; i < numAxes; i += 1) {
      const { x, y } = polarToCartesian(cx, cy, maxR, i * angleStep);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(cx));
      line.setAttribute('y1', String(cy));
      line.setAttribute('x2', String(x));
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', 'rgba(216,183,123,0.16)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    }

    const dataPoints: string[] = [];
    for (let i = 0; i < numAxes; i += 1) {
      const key = DIMENSION_KEYS[i];
      const score = dimensions[key].score;
      const r = (score / 100) * maxR;
      const { x, y } = polarToCartesian(cx, cy, r, i * angleStep);
      dataPoints.push(`${x},${y}`);
    }
    const dataPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    dataPolygon.setAttribute('points', dataPoints.join(' '));
    dataPolygon.setAttribute('fill', 'rgba(255,124,130,0.18)');
    dataPolygon.setAttribute('stroke', '#FF8F83');
    dataPolygon.setAttribute('stroke-width', '2');
    dataPolygon.setAttribute('filter', 'drop-shadow(0 0 12px rgba(255,92,99,0.35))');
    svg.appendChild(dataPolygon);

    for (let i = 0; i < numAxes; i += 1) {
      const key = DIMENSION_KEYS[i];
      const score = dimensions[key].score;
      const r = (score / 100) * maxR;
      const { x, y } = polarToCartesian(cx, cy, r, i * angleStep);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(x));
      circle.setAttribute('cy', String(y));
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', DIMENSION_COLORS[i]);
      svg.appendChild(circle);
    }

    for (let i = 0; i < numAxes; i += 1) {
      const key = DIMENSION_KEYS[i];
      const score = dimensions[key].score;
      const labelR = maxR + 34;
      const { x, y } = polarToCartesian(cx, cy, labelR, i * angleStep);
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(x));
      text.setAttribute('y', String(y));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('fill', 'rgba(244,215,163,0.78)');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-family', 'var(--font-tianji-sans), sans-serif');
      text.textContent = labels[key] ?? key;
      group.appendChild(text);

      const scoreText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      scoreText.setAttribute('x', String(x));
      scoreText.setAttribute('y', String(y + 16));
      scoreText.setAttribute('text-anchor', 'middle');
      scoreText.setAttribute('fill', DIMENSION_COLORS[i]);
      scoreText.setAttribute('font-size', '11');
      scoreText.setAttribute('font-weight', '700');
      scoreText.textContent = `${score}`;
      group.appendChild(scoreText);

      svg.appendChild(group);
    }
  }, [dimensions, labels]);

  return (
    <div className="flex w-full flex-col items-center">
      <svg ref={svgRef} viewBox="0 0 400 430" className="w-full max-w-md" style={{ overflow: 'visible' }} />
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-[#f4d7a3]/60">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF8F83]" />
          {personANickname} & {personBNickname}
        </span>
      </div>
    </div>
  );
}
