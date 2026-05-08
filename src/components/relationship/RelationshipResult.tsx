'use client';

import { useState } from 'react';
import { ChartNoAxesCombined, Copy, Lock, Share2, Sparkles } from 'lucide-react';

import { GlassCard } from '@/components/ui/GlassCard';
import { DimensionCard } from './RelationshipDimensionCard';
import { RelationshipRadar } from './RelationshipRadar';
import type { RelationshipReading } from '@/types/relationship';
import type { Language } from '@/types/reading';

interface RelationshipResultProps {
  reading: RelationshipReading;
  lang?: Language;
}

const DIMENSION_KEYS = ['attraction', 'communication', 'conflict', 'rhythm', 'longTerm'] as const;

const resultCopy = {
  zh: {
    eyebrow: '关系合盘报告',
    score: '综合匹配',
    radar: '关系雷达',
    dimensions: '五维详情',
    currentPhase: '当前阶段',
    next30Days: '未来 30 天',
    copyLink: '复制安全分享链接',
    copied: '链接已复制',
    share: '分享关系摘要',
    shareFailed: '分享生成失败，请稍后再试。',
    privacy: '分享内容默认不包含出生日期、出生时辰、出生地点或时区。',
  },
  en: {
    eyebrow: 'Relationship Analysis',
    score: 'Overall score',
    radar: 'Relationship radar',
    dimensions: 'Five dimensions',
    currentPhase: 'Current phase',
    next30Days: 'Next 30 days',
    copyLink: 'Copy safe share link',
    copied: 'Link copied',
    share: 'Share relationship summary',
    shareFailed: 'Share link failed. Please try again.',
    privacy: 'Shared content excludes birth date, birth time, birth location, and timezone by default.',
  },
} as const;

function scoreColor(score: number) {
  if (score >= 70) return '#34D399';
  if (score >= 50) return '#F5B35D';
  return '#FF8F83';
}

export function RelationshipResult({ reading, lang = 'zh' }: RelationshipResultProps) {
  const [activeTab, setActiveTab] = useState<'radar' | 'dimensions'>('radar');
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const copy = resultCopy[lang] ?? resultCopy.zh;

  const handleCopyLink = async () => {
    setShareLoading(true);
    setShareError(null);

    try {
      const res = await fetch('/api/relationship/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readingId: reading.id,
          shareSettings: { includeNames: true, includeBirthData: false, shareMode: 'summary' },
        }),
      });
      const json = await res.json();

      if (json.success && json.data?.shareUrl) {
        await navigator.clipboard.writeText(json.data.shareUrl);
        setShareUrlCopied(true);
        setTimeout(() => setShareUrlCopied(false), 3000);
      } else {
        setShareError(copy.shareFailed);
      }
    } catch {
      setShareError(copy.shareFailed);
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <GlassCard level="card" className="overflow-hidden p-7 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,124,130,0.14),transparent_44%)]" />
        <div className="relative z-10">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#d8b77b]/70">{copy.eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-[0.04em] text-[#ffe3b4]">
            {reading.personA.nickname} & {reading.personB.nickname}
          </h1>
          <div className="mx-auto mt-5 inline-flex items-center gap-3 rounded-full border border-[#d8b77b]/24 bg-black/24 px-5 py-3">
            <span className="text-3xl font-bold" style={{ color: scoreColor(reading.overallScore) }}>
              {reading.overallScore}
            </span>
            <span className="text-sm text-[#f4d7a3]/60">{copy.score}</span>
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-xl font-semibold text-[#ffe3b4]">{reading.summary.headline}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#f4d7a3]/70">{reading.summary.oneLiner}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {reading.summary.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/8 px-3 py-1 text-xs text-[#f4d7a3]/72"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 rounded-full border border-[#d8b77b]/32 bg-black/26 p-1">
        <button
          type="button"
          onClick={() => setActiveTab('radar')}
          aria-pressed={activeTab === 'radar'}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition ${
            activeTab === 'radar' ? 'bg-[#ff6c73]/28 text-[#fff7e6]' : 'text-[#f4d7a3]/58 hover:text-[#ffe3b4]'
          }`}
        >
          <ChartNoAxesCombined className="h-4 w-4" aria-hidden />
          {copy.radar}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dimensions')}
          aria-pressed={activeTab === 'dimensions'}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold transition ${
            activeTab === 'dimensions' ? 'bg-[#ff6c73]/28 text-[#fff7e6]' : 'text-[#f4d7a3]/58 hover:text-[#ffe3b4]'
          }`}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {copy.dimensions}
        </button>
      </div>

      {activeTab === 'radar' ? (
        <GlassCard level="card" className="p-6">
          <RelationshipRadar
            dimensions={reading.dimensions}
            personANickname={reading.personA.nickname}
            personBNickname={reading.personB.nickname}
            lang={lang}
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {DIMENSION_KEYS.map((key) => (
            <DimensionCard
              key={key}
              dimensionKey={key}
              data={reading.dimensions[key]}
              lang={lang}
              isPremium={reading.isPremium}
              onUnlock={() => {}}
            />
          ))}
        </div>
      )}

      {reading.timeline && (
        <GlassCard level="card" className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-[#d8b77b]/18 bg-black/22 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/66">{copy.currentPhase}</p>
              <p className="mt-2 text-sm leading-7 text-[#f4d7a3]/76">{reading.timeline.currentPhase}</p>
            </article>
            <article className="rounded-xl border border-[#d8b77b]/18 bg-black/22 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/66">{copy.next30Days}</p>
              <p className="mt-2 text-sm leading-7 text-[#f4d7a3]/76">{reading.timeline.next30Days}</p>
            </article>
          </div>
        </GlassCard>
      )}

      {shareError && (
        <div className="rounded-xl border border-[#ff7f80]/30 bg-[#ff5264]/10 p-4 text-center text-sm text-[#ffb4a3]">
          {shareError}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={shareLoading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d8b77b]/24 bg-black/24 px-5 text-sm font-semibold text-[#f4d7a3]/76 transition hover:border-[#ffe3b4]/44 hover:text-[#ffe3b4] disabled:opacity-55"
        >
          <Copy className="h-4 w-4" aria-hidden />
          {shareUrlCopied ? copy.copied : copy.copyLink}
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={shareLoading}
          className="relationship-form-submit inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          {copy.share}
        </button>
      </div>

      <p className="mx-auto flex max-w-3xl items-start justify-center gap-2 text-center text-xs leading-6 text-[#f4d7a3]/42">
        <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-[#d8b77b]/68" aria-hidden />
        <span>{copy.privacy}</span>
      </p>
    </div>
  );
}
