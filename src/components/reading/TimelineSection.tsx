'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
import type { ReadingTimeline, Language } from '@/types/reading';

interface TimelineSectionProps {
  timeline: ReadingTimeline;
  isPremium: boolean;
  onUnlock: () => void;
  lang: Language;
}

export function TimelineSection({ timeline, isPremium, onUnlock, lang }: TimelineSectionProps) {
  return (
    <section>
      <div className="text-center mb-4">
        <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
          {lang === 'zh' ? '人生时间线' : 'Life Timeline'}
        </h2>
      </div>

      {!isPremium ? (
        /* Locked timeline - show preview only */
        <GlassCard level="card" className="p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="text-3xl">🔮</div>
            <div className="text-center">
              <p className="text-sm text-white mb-1">{lang === 'zh' ? '解锁完整时间线' : 'Unlock Full Timeline'}</p>
              <p className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>
                {lang === 'zh' ? '查看你人生每个阶段的详细运势分析' : 'See detailed fortune analysis for every life phase'}
              </p>
            </div>
            <button onClick={onUnlock}
              className="text-sm font-medium px-6 py-3 rounded-xl transition-colors"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#FCD34D' }}>
              {lang === 'zh' ? '解锁完整时间线' : 'Unlock Full Timeline'}
            </button>
          </div>

          {/* Show current phase summary only */}
          {timeline.phases.length > 0 && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-medium mb-2" style={{ color: 'rgba(251,191,36,0.6)' }}>
                {lang === 'zh' ? '当前阶段' : 'Current Phase'}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(167,139,250,0.2)', color: '#A78BFA' }}>
                  {timeline.phases[timeline.currentPhase]?.ageRange}
                </span>
                <span className="text-sm text-white font-medium">
                  {timeline.phases[timeline.currentPhase]?.label}
                </span>
              </div>
            </div>
          )}
        </GlassCard>
      ) : (
        /* Full unlocked timeline */
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

          <div className="space-y-4">
            {timeline.phases.map((phase, i) => (
              <motion.div
                key={phase.ageRange}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative pl-12"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-2.5 top-4 w-3 h-3 rounded-full border-2"
                  style={{
                    background: phase.isCurrent ? '#A78BFA' : 'rgba(255,255,255,0.1)',
                    borderColor: phase.isCurrent ? '#A78BFA' : 'rgba(255,255,255,0.2)',
                    boxShadow: phase.isCurrent ? '0 0 12px rgba(167,139,250,0.5)' : 'none',
                  }}
                />

                <GlassCard
                  level={phase.isCurrent ? 'strong' : 'card'}
                  className={`p-4 ${phase.isCurrent ? 'ring-1' : ''}`}
                  style={phase.isCurrent ? { ringColor: 'rgba(167,139,250,0.3)' } : {}}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: phase.isCurrent ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.05)',
                          color: phase.isCurrent ? '#A78BFA' : 'rgba(226,232,240,0.5)',
                        }}
                      >
                        {phase.ageRange}
                      </span>
                      <span className="text-sm font-serif font-bold text-white">{phase.label}</span>
                      {phase.isCurrent && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(167,139,250,0.2)', color: '#A78BFA' }}
                        >
                          {lang === 'zh' ? '当前' : 'Now'}
                        </span>
                      )}
                    </div>

                    {/* Mini score */}
                    <div className="text-xs font-medium" style={{ color: '#A78BFA' }}>
                      {phase.overall}/100
                    </div>
                  </div>

                  {/* Score bars */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[
                      { label: lang === 'zh' ? '综合' : 'All', val: phase.overall, color: '#A78BFA' },
                      { label: lang === 'zh' ? '事业' : 'Car', val: phase.career, color: '#F59E0B' },
                      { label: lang === 'zh' ? '感情' : 'Love', val: phase.love, color: '#F472B6' },
                      { label: lang === 'zh' ? '财富' : '$', val: phase.wealth, color: '#34D399' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <div className="text-xs mb-0.5" style={{ color: 'rgba(226,232,240,0.4)' }}>{s.label}</div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${s.val}%`, background: s.color }} />
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(226,232,240,0.65)' }}>
                    {phase.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
