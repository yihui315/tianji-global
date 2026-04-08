'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

Chart.register(
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
}

const PHASE_NAMES_ZH: Record<number, string> = {
  0: '童年', 10: '少年', 20: '青年', 30: '而立',
  40: '不惑', 50: '知命', 60: '耳顺', 70: '花甲',
  80: '古稀', 90: '耄耋',
};

const PHASE_NAMES_EN: Record<number, string> = {
  0: 'Childhood', 10: 'Youth', 20: 'Young Adult', 30: 'Establishing',
  40: 'Clarifying', 50: 'Wisdom', 60: 'Harmony', 70: 'Retirement',
  80: 'Longevity', 90: 'Elder',
};

const TREND_ICONS = { up: '↑', down: '↓', stable: '→' };

export default function LifeChart({ data, language = 'zh' }: LifeChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const isZH = language === 'zh';
    const labels = data.map(d =>
      `${isZH ? PHASE_NAMES_ZH[d.ageStart] : PHASE_NAMES_EN[d.ageStart]} (${d.ageStart}-${d.ageEnd})`
    );

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create gradient for bars
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.2)');

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: isZH ? '综合运势' : 'Overall Fortune',
            data: data.map(d => d.overall),
            backgroundColor: gradient,
            borderColor: '#7C3AED',
            borderWidth: 1,
            borderRadius: 6,
            yAxisID: 'y',
          },
          {
            type: 'line',
            label: isZH ? '运势趋势' : 'Fortune Trend',
            data: data.map(d => d.overall),
            borderColor: '#F59E0B',
            borderWidth: 3,
            tension: 0.4,
            pointBackgroundColor: '#F59E0B',
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
              color: '#E2E8F0',
              font: { size: 13 },
            },
          },
          tooltip: {
            backgroundColor: '#1F2937',
            titleColor: '#F59E0B',
            bodyColor: '#E2E8F0',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: (ctx) => {
                const idx = ctx.dataIndex;
                const d = data[idx];
                const trend = idx > 0 ? d.overall - data[idx - 1].overall : 0;
                const trendIcon = trend > 5 ? TREND_ICONS.up : trend < -5 ? TREND_ICONS.down : TREND_ICONS.stable;
                return [
                  `${isZH ? '综合运势' : 'Overall'}: ${d.overall} ${trendIcon}`,
                  `${isZH ? '事业' : 'Career'}: ${d.career}`,
                  `${isZH ? '财富' : 'Wealth'}: ${d.wealth}`,
                  `${isZH ? '感情' : 'Love'}: ${d.love}`,
                  `${isZH ? '健康' : 'Health'}: ${d.health}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#94A3B8', font: { size: 11 } },
            grid: { color: '#374151' },
          },
          y: {
            min: 0,
            max: 100,
            ticks: { color: '#94A3B8', stepSize: 20 },
            grid: { color: '#374151' },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, language]);

  return (
    <div className="w-full h-80 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <canvas ref={canvasRef} />
    </div>
  );
}
