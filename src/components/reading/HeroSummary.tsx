'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
import type { ReadingSummary, Language } from '@/types/reading';

interface HeroSummaryProps {
  summary: ReadingSummary;
  user: { name?: string; birthDate: string; birthTime?: string; location?: string };
  type: string;
  isPremium: boolean;
  onUnlock?: () => void;
  lang: Language;
  readingId: string;
}

function KeywordTag({ text }: { text: string }) {
  return (
    <span
      className="px-4 py-1.5 rounded-full text-xs font-medium border"
      style={{
        background: 'rgba(255,255,255,0.05)',
        borderColor: 'rgba(251,191,36,0.3)',
        color: '#FCD34D',
      }}
    >
      {text}
    </span>
  );
}

export function HeroSummary({
  summary, user, type, isPremium, onUnlock, lang, readingId,
}: HeroSummaryProps) {
  const typeLabels = {
    western: lang === 'zh' ? '西方星盘' : 'Western Chart',
    bazi: lang === 'zh' ? '八字命理' : 'BaZi',
    ziwei: lang === 'zh' ? '紫微斗数' : 'ZiWei',
  };

  const handleShare = async () => {
    const shareText = `${summary.headline}\n\n${summary.keywords.join(' · ')}\n\n🔮 TianJi Global - ${typeLabels[type as keyof typeof typeLabels] || type}`;
    if (navigator.share) {
      await navigator.share({ title: 'TianJi Global', text: shareText, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
      alert(lang === 'zh' ? '已复制到剪贴板！' : 'Copied to clipboard!');
    }
  };

  return (
    <section>
      <GlassCard level="strong" className="p-8 text-center relative overflow-hidden">
        {/* Premium gradient bg */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(251,191,36,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10">
          {/* Reading type badge */}
          <div
            className="inline-block px-3 py-1 rounded-full text-xs mb-4 border"
            style={{
              background: 'rgba(251,191,36,0.08)',
              borderColor: 'rgba(251,191,36,0.2)',
              color: 'rgba(251,191,36,0.7)',
            }}
          >
            {typeLabels[type as keyof typeof typeLabels] || type}
          </div>

          {/* User info */}
          <p className="text-xs mb-3" style={{ color: 'rgba(226,232,240,0.4)' }}>
            {user.name && <span>{user.name} · </span>}
            {user.birthDate}
            {user.birthTime && ` · ${user.birthTime}`}
            {user.location && ` · ${user.location}`}
          </p>

          {/* Keywords */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {summary.keywords.map((k, i) => (
              <KeywordTag key={i} text={k} />
            ))}
          </div>

          {/* Headline */}
          <h1 className="text-xl font-serif font-bold text-white mb-3 leading-snug max-w-2xl mx-auto">
            {summary.headline}
          </h1>

          {/* Tagline */}
          {summary.tagline && (
            <p className="text-sm mb-6" style={{ color: 'rgba(226,232,240,0.5)' }}>
              {summary.tagline}
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <MysticButton variant="outline" size="md" onClick={handleShare}>
              {lang === 'zh' ? '↗ 分享报告' : '↗ Share Report'}
            </MysticButton>
            {!isPremium && (
              <MysticButton variant="solid" size="md" onClick={onUnlock}>
                {lang === 'zh' ? '解锁完整解读 →' : 'Unlock Full Reading →'}
              </MysticButton>
            )}
            {isPremium && (
              <div
                className="px-4 py-3 rounded-xl text-sm font-medium border"
                style={{
                  background: 'rgba(251,191,36,0.08)',
                  borderColor: 'rgba(251,191,36,0.3)',
                  color: '#FCD34D',
                }}
              >
                ✦ {lang === 'zh' ? '完整版已解锁' : 'Full Version Unlocked'}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
