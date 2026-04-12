'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Chart from 'chart.js/auto';
import 'chart.js/auto';
import { GlassCard } from '@/components/ui/GlassCard';
import type { ElementScores, ReadingTimeline, Language } from '@/types/reading';
import { ELEMENTS_ORDER, ELEMENTS_ZH, ELEM_COLORS } from '@/lib/chart-engine';

interface ChartSectionProps {
  elements: ElementScores;
  timeline: ReadingTimeline;
  lang: Language;
  isPremium: boolean;
  birthYear: number;
}

const TAB_LABELS_ZH = ['五行能量', '人生曲线', '多维信号'];
const TAB_LABELS_EN = ['Energy', 'Fortune', 'Signals'];

function ElementBars({ elements, lang }: { elements: ElementScores; lang: Language }) {
  return (
    <div className="space-y-3">
      {ELEMENTS_ORDER.map((el, i) => (
        <div key={el} className="flex items-center gap-3">
          <span className="text-xs w-5 font-medium" style={{ color: ELEM_COLORS[el.charAt(0).toUpperCase() + el.slice(1)] }}>
            {ELEMENTS_ZH[el]}
          </span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${elements[el as keyof ElementScores]}%` }}
              transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${ELEM_COLORS[el.charAt(0).toUpperCase() + el.slice(1)]}80, ${ELEM_COLORS[el.charAt(0).toUpperCase() + el.slice(1)]})`,
              }}
            />
          </div>
          <span className="text-xs w-8 text-right" style={{ color: ELEM_COLORS[el.charAt(0).toUpperCase() + el.slice(1)] }}>
            {elements[el as keyof ElementScores]}%
          </span>
        </div>
      ))}
    </div>
  );
}

function EnergyRadar({ elements, lang }: { elements: ElementScores; lang: Language }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = ELEMENTS_ORDER.map(e => ELEMENTS_ZH[e]);
    const values = ELEMENTS_ORDER.map(e => elements[e as keyof ElementScores]);

    chartRef.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [{
          label: lang === 'zh' ? '能量分布' : 'Energy',
          data: values,
          backgroundColor: 'rgba(124,58,237,0.15)',
          borderColor: '#A78BFA',
          borderWidth: 2,
          pointBackgroundColor: ['#A3E635', '#FF6B6B', '#F59E0B', '#60A5FA', '#34D399'],
          pointRadius: 5,
          pointHoverRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { display: false },
            grid: { color: 'rgba(255,255,255,0.07)' },
            angleLines: { color: 'rgba(255,255,255,0.07)' },
            pointLabels: { color: '#E2E8F0', font: { size: 13 } },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: '#1F2937', titleColor: '#A78BFA', bodyColor: '#E2E8F0', borderColor: '#374151', borderWidth: 1 },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [elements, lang]);

  return <canvas ref={canvasRef} className="w-full h-64" />;
}

function LifeTimeline({ timeline, lang }: { timeline: ReadingTimeline; lang: Language }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const labels = (timeline.phases ?? []).map(p => p.ageRange);
    const overall = (timeline.phases ?? []).map(p => p.overall);
    const career = (timeline.phases ?? []).map(p => p.career);
    const love = (timeline.phases ?? []).map(p => p.love);
    const wealth = (timeline.phases ?? []).map(p => p.wealth);

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: lang === 'zh' ? '综合' : 'Overall', data: overall, borderColor: '#A78BFA', backgroundColor: 'rgba(167,139,250,0.08)', borderWidth: 3, tension: 0.4, fill: true, pointRadius: 5, pointBackgroundColor: '#A78BFA' },
          { label: lang === 'zh' ? '事业' : 'Career', data: career, borderColor: '#F59E0B', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, borderDash: [5, 5], pointRadius: 3, pointBackgroundColor: '#F59E0B' },
          { label: lang === 'zh' ? '感情' : 'Love', data: love, borderColor: '#F472B6', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#F472B6' },
          { label: lang === 'zh' ? '财富' : 'Wealth', data: wealth, borderColor: '#34D399', backgroundColor: 'transparent', borderWidth: 2, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#34D399' },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#E2E8F0', font: { size: 12 }, usePointStyle: true, pointStyleWidth: 10 } },
          tooltip: { backgroundColor: '#1F2937', titleColor: '#FCD34D', bodyColor: '#E2E8F0', borderColor: '#374151', borderWidth: 1, padding: 12 },
        },
        scales: {
          x: { ticks: { color: '#94A3B8', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { min: 20, max: 100, ticks: { color: '#94A3B8', stepSize: 20 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [timeline, lang]);

  return <canvas ref={canvasRef} className="w-full h-72" />;
}

function SignalLayers({ timeline, lang }: { timeline: ReadingTimeline; lang: Language }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: (timeline.phases ?? []).map(p => p.ageRange),
        datasets: [
          { label: lang === 'zh' ? '事业' : 'Career', data: (timeline.phases ?? []).map(p => p.career), backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 4 },
          { label: lang === 'zh' ? '感情' : 'Love', data: (timeline.phases ?? []).map(p => p.love), backgroundColor: 'rgba(244,114,182,0.7)', borderRadius: 4 },
          { label: lang === 'zh' ? '财富' : 'Wealth', data: (timeline.phases ?? []).map(p => p.wealth), backgroundColor: 'rgba(52,211,153,0.7)', borderRadius: 4 },
          { label: lang === 'zh' ? '健康' : 'Health', data: (timeline.phases ?? []).map(p => p.health), backgroundColor: 'rgba(96,165,250,0.7)', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#E2E8F0', font: { size: 12 }, usePointStyle: true } },
          tooltip: { backgroundColor: '#1F2937', titleColor: '#FCD34D', bodyColor: '#E2E8F0', borderColor: '#374151', borderWidth: 1 },
        },
        scales: {
          x: { stacked: true, ticks: { color: '#94A3B8' }, grid: { display: false } },
          y: { stacked: true, min: 0, max: 400, ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [timeline, lang]);

  return <canvas ref={canvasRef} className="w-full h-64" />;
}

export function ChartSection({ elements, timeline, lang, isPremium, birthYear }: ChartSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const labels = lang === 'zh' ? TAB_LABELS_ZH : TAB_LABELS_EN;

  return (
    <section>
      <div className="text-center mb-4">
        <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
          {lang === 'zh' ? '可视化分析' : 'Visual Analysis'}
        </h2>
      </div>

      {/* Tab switcher */}
      <div className="flex justify-center mb-4">
        <div
          className="inline-flex rounded-xl p-1 gap-1"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          {labels.map((l, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={
                activeTab === i
                  ? { background: 'rgba(167,139,250,0.2)', color: '#A78BFA' }
                  : { background: 'transparent', color: 'rgba(226,232,240,0.4)' }
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <GlassCard level="card" className="p-5">
        <div className="mb-4">
          <div
            className="text-sm font-serif font-bold mb-1"
            style={{ color: 'rgba(251,191,36,0.8)' }}
          >
            {activeTab === 0 && (lang === 'zh' ? '五行能量分布图' : 'Five Elements Energy')}
            {activeTab === 1 && (lang === 'zh' ? '人生运势曲线' : 'Life Fortune Curve')}
            {activeTab === 2 && (lang === 'zh' ? '多维信号叠加' : 'Multi-Dimensional Signals')}
          </div>
          <p className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>
            {activeTab === 0 && (lang === 'zh' ? '木/火/土/金/水 · 能量权重' : 'Wood/Fire/Earth/Metal/Water · Energy Weight')}
            {activeTab === 1 && (lang === 'zh' ? `${birthYear}年出生 · 综合/事业/感情/财富` : `Born ${birthYear} · Overall/Career/Love/Wealth`)}
            {activeTab === 2 && (lang === 'zh' ? '各维度能量累积可视化' : 'Energy accumulation across dimensions')}
          </p>
        </div>

        <div style={{ display: activeTab === 0 ? 'block' : 'none' }}>
          <EnergyRadar elements={elements} lang={lang} />
        </div>
        <div style={{ display: activeTab === 1 ? 'block' : 'none' }}>
          <LifeTimeline timeline={timeline} lang={lang} />
        </div>
        <div style={{ display: activeTab === 2 ? 'block' : 'none' }}>
          <SignalLayers timeline={timeline} lang={lang} />
        </div>

        {/* Element bars summary */}
        {activeTab === 0 && (
          <div className="mt-4">
            <ElementBars elements={elements} lang={lang} />
          </div>
        )}
      </GlassCard>
    </section>
  );
}
