'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import type { RelationshipDimensionScore } from '@/types/relationship';
import type { Language } from '@/types/reading';

const DIMENSION_META: Record<string, { icon: string; color: string; bgColor: string }> = {
  attraction:    { icon: '💫', color: '#F472B6', bgColor: 'rgba(244,114,182,0.08)' },
  communication: { icon: '💬', color: '#A78BFA', bgColor: 'rgba(167,139,250,0.08)' },
  conflict:      { icon: '🔥', color: '#F87171', bgColor: 'rgba(248,113,113,0.08)' },
  rhythm:        { icon: '🌊', color: '#34D399', bgColor: 'rgba(52,211,153,0.08)' },
  longTerm:      { icon: '🏛️', color: '#F59E0B', bgColor: 'rgba(245,158,11,0.08)' },
};

const DIMENSION_LABELS: Record<string, Record<string, string>> = {
  zh: {
    attraction: '吸引力',
    communication: '沟通方式',
    conflict: '冲突模式',
    rhythm: '节奏匹配',
    longTerm: '长期稳定',
  },
  en: {
    attraction: 'Attraction',
    communication: 'Communication',
    conflict: 'Conflict Pattern',
    rhythm: 'Rhythm Match',
    longTerm: 'Long-term Stability',
  },
};

interface DimensionCardProps {
  dimensionKey: string;
  data: RelationshipDimensionScore;
  lang: Language;
  isPremium: boolean;
  onUnlock: () => void;
}

export function DimensionCard({ dimensionKey, data, lang, isPremium, onUnlock }: DimensionCardProps) {
  const meta = DIMENSION_META[dimensionKey] ?? { icon: '⚡', color: '#A78BFA', bgColor: 'rgba(167,139,250,0.08)' };
  const labels = DIMENSION_LABELS[lang] ?? DIMENSION_LABELS.zh;
  const label = labels[dimensionKey] ?? dimensionKey;

  // Score bar color
  const scoreBarColor = data.score >= 70 ? '#34D399' : data.score >= 45 ? '#F59E0B' : '#F87171';

  return (
    <GlassCard level="card" className="p-5 relative overflow-hidden">
      {/* Score bar background */}
      <div
        className="absolute top-0 left-0 h-1 rounded-t-xl transition-all duration-700"
        style={{
          width: `${data.score}%`,
          background: `linear-gradient(90deg, ${meta.color}80, ${meta.color})`,
        }}
      />

      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h3 className="text-sm font-serif font-bold" style={{ color: meta.color }}>
            {label}
          </h3>
          <span className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>
            {data.label}
          </span>
        </div>
        <div className="ml-auto">
          <span className="text-2xl font-bold" style={{ color: scoreBarColor }}>
            {data.score}
          </span>
        </div>
      </div>

      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(226,232,240,0.75)' }}>
        {data.summary}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.strengths.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: '#34D399' }}>
              {lang === 'zh' ? '✓ 优势' : '✓ Strengths'}
            </div>
            <ul className="space-y-1">
              {data.strengths.map((s, i) => (
                <li key={i} className="text-xs flex items-start gap-1" style={{ color: 'rgba(226,232,240,0.6)' }}>
                  <span style={{ color: '#34D399' }}>✦</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.risks.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: '#F87171' }}>
              {lang === 'zh' ? '⚠ 注意' : '⚠ Risks'}
            </div>
            <ul className="space-y-1">
              {data.risks.map((r, i) => (
                <li key={i} className="text-xs flex items-start gap-1" style={{ color: 'rgba(226,232,240,0.6)' }}>
                  <span style={{ color: '#F87171' }}>→</span>{r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {data.advice.length > 0 && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs font-medium mb-2" style={{ color: meta.color }}>
            {lang === 'zh' ? '💡 建议' : '💡 Advice'}
          </div>
          <ul className="space-y-1">
            {data.advice.map((a, i) => (
              <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'rgba(226,232,240,0.65)' }}>
                <span style={{ color: meta.color }}>→</span>{a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
