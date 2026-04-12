'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
import type { ReadingActions, Language } from '@/types/reading';

interface ActionSectionProps {
  actions: ReadingActions;
  isPremium: boolean;
  onUnlock: () => void;
  lang: Language;
}

export function ActionSection({ actions, isPremium, onUnlock, lang }: ActionSectionProps) {
  return (
    <section>
      <div className="text-center mb-4">
        <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
          {lang === 'zh' ? '行动指南' : 'Action Guide'}
        </h2>
      </div>

      {!isPremium ? (
        <GlassCard level="card" className="p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="text-3xl">📋</div>
            <div>
              <p className="text-sm text-white mb-1">{lang === 'zh' ? '解锁完整行动指南' : 'Unlock Full Action Guide'}</p>
              <p className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>
                {lang === 'zh' ? '获取针对性的宜忌清单与具体行动建议' : 'Get targeted do/avoid lists with specific action advice'}
              </p>
            </div>
            <button onClick={onUnlock}
              className="text-sm font-medium px-6 py-3 rounded-xl"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#FCD34D' }}>
              {lang === 'zh' ? '解锁行动指南' : 'Unlock Action Guide'}
            </button>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Do */}
          <GlassCard level="card" className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">✅</span>
              <h3 className="text-base font-serif font-bold" style={{ color: '#34D399' }}>
                {lang === 'zh' ? '宜 · 应该做' : 'Do · Should Do'}
              </h3>
            </div>
            <ul className="space-y-2">
              {(actions.do ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>
                  <span style={{ color: '#34D399' }}>✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          {/* Avoid */}
          <GlassCard level="card" className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🚫</span>
              <h3 className="text-base font-serif font-bold" style={{ color: '#F87171' }}>
                {lang === 'zh' ? '忌 · 应该避免' : 'Avoid · Should Not'}
              </h3>
            </div>
            <ul className="space-y-2">
              {(actions.avoid ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>
                  <span style={{ color: '#F87171' }}>✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      )}
    </section>
  );
}
