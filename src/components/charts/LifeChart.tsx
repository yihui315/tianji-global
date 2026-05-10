'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  BarController,
  CategoryScale,
  LinearScale,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface FortunePoint {
  ageStart: number;
  ageEnd: number;
  phase: string;
  phaseEn: string;
  overall: number;
  career: number;
  wealth: number;
  love: number;
  health: number;
}

interface LifeChartProps {
  data: FortunePoint[];
  language?: 'zh' | 'en';
  className?: string;
}

const PHASE_NAMES_ZH: Record<number, string> = {
  0: 'Age 0',
  10: 'Age 10',
  20: 'Age 20',
  30: 'Age 30',
  40: 'Age 40',
  50: 'Age 50',
  60: 'Age 60',
  70: 'Age 70',
  80: 'Age 80',
  90: 'Age 90',
};

const PHASE_NAMES_EN: Record<number, string> = {
  0: 'Childhood',
  10: 'Youth',
  20: 'Young Adult',
  30: 'Establishing',
  40: 'Clarifying',
  50: 'Wisdom',
  60: 'Harmony',
  70: 'Retirement',
  80: 'Longevity',
  90: 'Elder',
};

const TREND_LABELS = { up: 'up', down: 'down', stable: 'flat' };

export default function LifeChart({ data, language = 'zh', className = '' }: LifeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const isZH = language === 'zh';
    const labels = data.map((point) => {
      const phase = isZH ? PHASE_NAMES_ZH[point.ageStart] : PHASE_NAMES_EN[point.ageStart];
      return `${phase ?? point.phaseEn} (${point.ageStart}-${point.ageEnd})`;
    });

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const barGradient = ctx.createLinearGradient(0, 0, 0, 420);
    barGradient.addColorStop(0, 'rgba(167, 139, 250, 0.84)');
    barGradient.addColorStop(0.55, 'rgba(124, 58, 237, 0.34)');
    barGradient.addColorStop(1, 'rgba(10, 10, 10, 0.02)');

    const lineGradient = ctx.createLinearGradient(0, 0, 560, 0);
    lineGradient.addColorStop(0, '#D4AF37');
    lineGradient.addColorStop(0.5, '#F5D76E');
    lineGradient.addColorStop(1, '#A78BFA');

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Overall Fortune',
            data: data.map((point) => point.overall),
            backgroundColor: barGradient,
            borderColor: 'rgba(167,139,250,0.72)',
            borderWidth: 1,
            borderRadius: 12,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: 'Fortune Trend',
            data: data.map((point) => point.overall),
            borderColor: lineGradient,
            borderWidth: 3,
            tension: 0.42,
            pointBackgroundColor: '#D4AF37',
            pointBorderColor: 'rgba(255,255,255,0.65)',
            pointBorderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 8,
            fill: false,
            yAxisID: 'y',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgba(255,255,255,0.74)',
              font: { size: 13 },
            },
          },
          tooltip: {
            backgroundColor: 'rgba(10,10,10,0.92)',
            titleColor: '#D4AF37',
            bodyColor: 'rgba(255,255,255,0.82)',
            borderColor: 'rgba(212,175,55,0.24)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (context) => {
                const index = context.dataIndex;
                const point = data[index];
                const trend = index > 0 ? point.overall - data[index - 1].overall : 0;
                const trendLabel =
                  trend > 5 ? TREND_LABELS.up : trend < -5 ? TREND_LABELS.down : TREND_LABELS.stable;
                return [
                  `Overall: ${point.overall} (${trendLabel})`,
                  `Career: ${point.career}`,
                  `Wealth: ${point.wealth}`,
                  `Love: ${point.love}`,
                  `Health: ${point.health}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: 'rgba(255,255,255,0.42)', font: { size: 11 } },
            grid: { color: 'rgba(255,255,255,0.06)' },
          },
          y: {
            min: 0,
            max: 100,
            ticks: { color: 'rgba(255,255,255,0.42)', stepSize: 20 },
            grid: { color: 'rgba(255,255,255,0.07)' },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [data, language]);

  return (
    <div
      className={`w-full h-80 rounded-[2rem] border border-white/10 bg-black/35 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl ${className}`}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
