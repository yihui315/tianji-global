'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
import type { ReadingInsights, Language, NarrativeBlock } from '@/types/reading';

interface InsightSectionProps {
  insights: ReadingInsights;
  isPremium: boolean;
  onUnlock: () => void;
  lang: Language;
}

const INSIGHT_CONFIG = [
  { key: 'structure' as const, icon: '⚡', labelZh: '能量结构', labelEn: 'Energy Structure', color: '#A78BFA', free: true },
  { key: 'relationship' as const, icon: '💫', labelZh: '关系模式', labelEn: 'Relationships', color: '#F472B6', free: false },
  { key: 'career' as const, icon: '💼', labelZh: '事业发展', labelEn: 'Career Path', color: '#F59E0B', free: false },
  { key: 'risk' as const, icon: '⚠️', labelZh: '风险预警', labelEn: 'Risk Signals', color: '#F87171', free: false },
];

function NarrativeBlock({ block, color, lang }: { block: NarrativeBlock; color: string; lang: Language }) {
  return (
    <div className="space-y-3">
      {/* Layer 1: Resonance Hook — styled as a highlighted callout */}
      <p
        className="text-sm leading-relaxed italic"
        style={{ color: 'rgba(251,191,36,0.9)' }}
      >
        ✦ {block.hook}
      </p>

      {/* Divider */}
      <div className="h-px w-8" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />

      {/* Layer 2: Deep Dive — body text */}
      <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,232,240,0.85)' }}>
        {block.body}
      </p>

      {/* Divider */}
      <div className="h-px w-8" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />

      {/* Layer 3: Action Closure — styled as guidance */}
      <p className="text-sm leading-relaxed" style={{ color: `${color}cc` }}>
        → {block.closure}
      </p>
    </div>
  );
}

export function InsightSection({ insights, isPremium, onUnlock, lang }: InsightSectionProps) {
  return (
    <section>
      <div className="text-center mb-4">
        <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
          {lang === 'zh' ? 'AI 深度解读' : 'AI Deep Interpretation'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INSIGHT_CONFIG.map(({ key, icon, labelZh, labelEn, color, free }) => {
          const block = insights[key];
          const locked = !free && !isPremium;

          return (
            <GlassCard key={key} level="card" className="p-5 relative">
              {/* Lock overlay for premium content */}
              {locked && (
                <div
                  className="absolute inset-0 rounded-xl z-10 flex flex-col items-center justify-center gap-3"
                  style={{
                    background: 'rgba(10,10,15,0.75)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="text-2xl">{icon}</div>
                  <div className="text-sm font-serif font-bold" style={{ color }}>
                    {lang === 'zh' ? labelZh : labelEn}
                  </div>
                  <div
                    className="text-xs px-3 py-1 rounded-full border"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      color: 'rgba(226,232,240,0.4)',
                    }}
                  >
                    🔒 {lang === 'zh' ? '解锁后可见' : 'Unlock to view'}
                  </div>
                  <button
                    onClick={onUnlock}
                    className="text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                    style={{
                      background: 'rgba(251,191,36,0.1)',
                      border: `1px solid rgba(251,191,36,0.3)`,
                      color: '#FCD34D',
                    }}
                  >
                    {lang === 'zh' ? '解锁此模块' : 'Unlock this'}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-sm font-serif font-bold" style={{ color }}>
                  {lang === 'zh' ? labelZh : labelEn}
                </h3>
              </div>

              {/* Three-layer narrative rendering */}
              <NarrativeBlock block={block} color={color} lang={lang} />
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
