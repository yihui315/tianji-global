'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import type { Language } from '@/types/reading';

interface TrustSectionProps {
  lang: Language;
}

export function TrustSection({ lang }: TrustSectionProps) {
  const items = [
    {
      icon: '🔒',
      title: lang === 'zh' ? '隐私保护' : 'Privacy',
      desc:
        lang === 'zh'
          ? '出生信息仅用于计算，可请求删除'
          : 'Birth data used for calculation only, deletion available',
    },
    {
      icon: '📊',
      title: lang === 'zh' ? '数据来源' : 'Data Sources',
      desc: lang === 'zh'
        ? '使用瑞士星历表(SWEPH)天文计算，精度达0.001角秒'
        : 'Swiss Ephemeris (SWEPH) calculations accurate to 0.001 arcseconds',
    },
    {
      icon: '🤖',
      title: lang === 'zh' ? 'AI边界' : 'AI Limitations',
      desc: lang === 'zh'
        ? 'AI解读基于统计学模型，仅供参考，不构成人生决策依据'
        : 'AI interpretations are statistical models for reference only, not life advice',
    },
    {
      icon: '⚕️',
      title: lang === 'zh' ? '免责声明' : 'Disclaimer',
      desc: lang === 'zh'
        ? '本产品仅供娱乐参考，不能替代专业医疗、法律或心理建议'
        : 'For entertainment only. Does not replace professional medical, legal, or psychological advice',
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <GlassCard key={i} level="soft" className="p-4 text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-xs font-medium text-white mb-1">{item.title}</div>
            <p className="text-xs leading-tight" style={{ color: 'rgba(226,232,240,0.5)' }}>
              {item.desc}
            </p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
