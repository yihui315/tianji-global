'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
import type { Language } from '@/types/reading';

interface UpgradeSectionProps {
  isPremium: boolean;
  lang: Language;
  onUnlock: () => void;
}

export function UpgradeSection({ isPremium, lang, onUnlock }: UpgradeSectionProps) {
  if (isPremium) {
    return (
      <section>
        <GlassCard level="strong" className="p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(167,139,250,0.05))' }} />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-xs font-medium border"
              style={{ background: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.3)', color: '#FCD34D' }}
            >
              ⭐ {lang === 'zh' ? '高级版已激活' : 'Premium Active'}
            </div>
            <h2 className="text-lg font-serif font-bold text-white">
              {lang === 'zh' ? '完整报告已解锁' : 'Full Report Unlocked'}
            </h2>
            <p className="text-sm" style={{ color: 'rgba(226,232,240,0.6)' }}>
              {lang === 'zh' ? '感谢你的支持！所有高级内容均已解锁。' : 'Thank you for your support! All premium content is unlocked.'}
            </p>
          </div>
        </GlassCard>
      </section>
    );
  }

  const features = lang === 'zh'
    ? [
        '详细十年大运逐月分析',
        '关系深度合盘（双人匹配）',
        '个性化年度重点预测',
        '事业发展关键转折点',
        '财富积累最优时间窗口',
        '专属行动方案（AI生成）',
        '可分享的命运卡片',
      ]
    : [
        'Detailed decade-by-decade analysis',
        'Deep relationship synastry (two-person)',
        'Personalized annual forecast',
        'Career turning points',
        'Optimal wealth-building windows',
        'AI-generated personalized action plan',
        'Shareable fortune card',
      ];

  return (
    <section>
      <GlassCard level="strong" className="p-8 text-center relative overflow-hidden">
        {/* Premium gradient */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(251,191,36,0.05), rgba(10,10,15,0.8))' }} />

        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <div className="w-96 h-96 rounded-full border" style={{ borderColor: 'rgba(167,139,250,0.05)' }} />
          <div className="absolute w-64 h-64 rounded-full border" style={{ borderColor: 'rgba(251,191,36,0.04)' }} />
        </div>

        <div className="relative z-10">
          {/* Badge */}
          <div
            className="inline-block px-4 py-1.5 rounded-full text-xs font-medium border mb-4"
            style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)', color: '#FCD34D' }}
          >
            ⭐ {lang === 'zh' ? '高级版' : 'Premium'}
          </div>

          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            {lang === 'zh' ? '解锁完整解读' : 'Unlock Full Reading'}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(226,232,240,0.6)' }}>
            {lang === 'zh' ? '你正在查看基础预览版。升级后获得完整分析。' : "You're viewing the basic preview. Upgrade for complete analysis."}
          </p>

          {/* Features list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8 max-w-lg mx-auto text-left">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(226,232,240,0.75)' }}>
                <span style={{ color: '#FCD34D' }}>✦</span>
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <MysticButton variant="solid" size="lg" onClick={onUnlock} className="font-bold">
              {lang === 'zh' ? '解锁完整版' : 'Unlock Full Reading'}
            </MysticButton>
          </div>

          <p className="text-xs" style={{ color: 'rgba(226,232,240,0.35)' }}>
            {lang === 'zh' ? '退款保证 · 一次购买 · 永久查看' : 'Money-back guarantee · One-time purchase · Lifetime access'}
          </p>
        </div>
      </GlassCard>
    </section>
  );
}
