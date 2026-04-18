'use client';

import { useEffect, useRef } from 'react';
import type { DestinyTrendPoint } from '@/lib/destiny-scan';

interface DestinyTrendChartProps {
  points: DestinyTrendPoint[];
  title: string;
  onDownload?: () => void;
}

export function DestinyTrendChart({ points, title, onDownload }: DestinyTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const padding = 28;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#08070d';
    context.fillRect(0, 0, width, height);

    context.strokeStyle = 'rgba(255,255,255,0.08)';
    context.lineWidth = 1;

    for (let index = 0; index < 4; index += 1) {
      const y = padding + ((height - padding * 2) / 3) * index;
      context.beginPath();
      context.moveTo(padding, y);
      context.lineTo(width - padding, y);
      context.stroke();
    }

    const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
    const maxValue = 100;
    const minValue = 20;

    const coordinates = points.map((point, index) => {
      const x = padding + xStep * index;
      const ratio = (point.value - minValue) / (maxValue - minValue);
      const y = height - padding - ratio * (height - padding * 2);
      return { x, y, point };
    });

    const gradient = context.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(245,158,11,0.35)');
    gradient.addColorStop(1, 'rgba(124,58,237,0.05)');

    context.beginPath();
    context.moveTo(coordinates[0].x, height - padding);
    coordinates.forEach((coordinate) => {
      context.lineTo(coordinate.x, coordinate.y);
    });
    context.lineTo(coordinates[coordinates.length - 1].x, height - padding);
    context.closePath();
    context.fillStyle = gradient;
    context.fill();

    context.beginPath();
    coordinates.forEach((coordinate, index) => {
      if (index === 0) {
        context.moveTo(coordinate.x, coordinate.y);
      } else {
        context.lineTo(coordinate.x, coordinate.y);
      }
    });
    context.strokeStyle = '#f59e0b';
    context.lineWidth = 3;
    context.stroke();

    coordinates.forEach((coordinate) => {
      context.beginPath();
      context.arc(coordinate.x, coordinate.y, 5, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();
      context.beginPath();
      context.arc(coordinate.x, coordinate.y, 3, 0, Math.PI * 2);
      context.fillStyle = '#7c3aed';
      context.fill();
    });

    context.fillStyle = 'rgba(255,255,255,0.75)';
    context.font = '12px sans-serif';
    context.textAlign = 'center';
    coordinates.forEach((coordinate) => {
      context.fillText(coordinate.point.label, coordinate.x, height - 8);
    });
  }, [points]);

  async function downloadChart() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const url = canvas.toDataURL('image/png');
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'destiny-timeline.png';
    anchor.click();
    onDownload?.();
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Destiny timeline</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{title}</h3>
        </div>
        <button
          onClick={downloadChart}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Download chart
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={880}
        height={300}
        className="h-[220px] w-full rounded-2xl bg-[#08070d]"
      />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {points.slice(0, 3).map((point) => (
          <div key={point.label} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{point.label}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-lg font-semibold text-white">{point.value}</span>
              <span className="text-xs text-amber-300">{point.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
