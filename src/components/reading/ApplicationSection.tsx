'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
import type { ReadingApplications, ApplicationModule, Language } from '@/types/reading';

interface ApplicationSectionProps {
  applications: ReadingApplications;
  isPremium: boolean;
  onUnlock: () => void;
  lang: Language;
}

interface AppModuleCardProps {
  title: string;
  icon: string;
  data: ApplicationModule;
  accentColor: string;
  isLocked: boolean;
  onUnlock: () => void;
  lang: Language;
}

function AppModuleCard({ title, icon, data, accentColor, isLocked, onUnlock, lang }: AppModuleCardProps) {
  const advice = data?.advice ?? [];

  return (
    <GlassCard level="card" className="p-5 relative">
      {isLocked && (
        <div
          className="absolute inset-0 rounded-xl z-10 flex flex-col items-center justify-center gap-2"
          style={{
            background: 'rgba(10,10,15,0.85)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-card-lg, 1rem)',
          }}
        >
          <div className="text-2xl">{icon}</div>
          <div className="text-sm font-serif font-bold" style={{ color: accentColor }}>{title}</div>
          <div
            className="text-xs px-3 py-1 rounded-full border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(226,232,240,0.4)' }}
          >
            🔒 {lang === 'zh' ? '解锁后可见' : 'Unlock to view'}
          </div>
          <button
            onClick={onUnlock}
            className="text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}40`, color: accentColor }}
          >
            {lang === 'zh' ? '解锁此模块' : 'Unlock this'}
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-base font-serif font-bold text-white">{title}</h3>
      </div>

      <div className="space-y-3">
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: accentColor }}>
            {lang === 'zh' ? '当前状态' : 'Current State'}
          </div>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>
            {data?.current ?? '—'}
          </p>
        </div>
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: accentColor }}>
            {lang === 'zh' ? '未来趋势' : 'Future Trend'}
          </div>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>
            {data?.trend ?? '—'}
          </p>
        </div>
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: accentColor }}>
            {lang === 'zh' ? '行动建议' : 'Action Items'}
          </div>
          <ul className="space-y-1">
            {advice.map((s, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'rgba(226,232,240,0.8)' }}>
                <span style={{ color: accentColor }}>→</span>{s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}

export function ApplicationSection({ applications, isPremium, onUnlock, lang }: ApplicationSectionProps) {
  const modules = [
    {
      title: lang === 'zh' ? '感情关系' : 'Relationships',
      icon: '❤️',
      data: applications.love,
      accentColor: '#F472B6',
    },
    {
      title: lang === 'zh' ? '事业发展' : 'Career',
      icon: '💼',
      data: applications.career,
      accentColor: '#F59E0B',
    },
    {
      title: lang === 'zh' ? '财富运势' : 'Wealth',
      icon: '💰',
      data: applications.wealth,
      accentColor: '#34D399',
    },
  ];

  return (
    <section>
      <div className="text-center mb-4">
        <h2 className="text-xs tracking-widest uppercase mb-1" style={{ color: 'rgba(251,191,36,0.6)' }}>
          {lang === 'zh' ? '应用模块' : 'Application Modules'}
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map((m) => (
          <AppModuleCard
            key={m.title}
            title={m.title}
            icon={m.icon}
            data={m.data}
            accentColor={m.accentColor}
            isLocked={!isPremium}
            onUnlock={onUnlock}
            lang={lang}
          />
        ))}
      </div>
    </section>
  );
}
