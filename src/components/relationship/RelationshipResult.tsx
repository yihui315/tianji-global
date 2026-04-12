'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { MysticButton } from '@/components/ui/MysticButton';
import { RelationshipRadar } from './RelationshipRadar';
import { DimensionCard } from './RelationshipDimensionCard';
import type { RelationshipReading } from '@/types/relationship';
import type { Language } from '@/types/reading';

interface RelationshipResultProps {
  reading: RelationshipReading;
  lang?: Language;
}

const DIMENSION_KEYS = ['attraction', 'communication', 'conflict', 'rhythm', 'longTerm'] as const;

export function RelationshipResult({ reading, lang = 'zh' }: RelationshipResultProps) {
  const [activeTab, setActiveTab] = useState<'radar' | 'dimensions'>('radar');
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);

  const handleCopyLink = async () => {
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
      }
    } catch (e) {
      console.error('Share failed', e);
    }
  };

  const scoreColor = (score: number) =>
    score >= 70 ? '#34D399' : score >= 50 ? '#F59E0B' : '#F87171';

  return (
    <div className="space-y-8">
      {/* Hero Summary */}
      <GlassCard level="card" className="p-8 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: 'radial-gradient(ellipse at center, #A78BFA, transparent 70%)',
          }}
        />
        <div className="relative z-10">
          <div className="text-xs tracking-widest uppercase mb-2" style={{ color: 'rgba(251,191,36,0.6)' }}>
            {lang === 'zh' ? '关系分析报告' : 'Relationship Analysis'}
          </div>
          <h1 className="text-2xl font-serif font-bold mb-2 text-white">
            {reading.personA.nickname} & {reading.personB.nickname}
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-2xl font-bold" style={{ color: scoreColor(reading.overallScore) }}>
              {reading.overallScore}
            </span>
            <span className="text-sm" style={{ color: 'rgba(226,232,240,0.5)' }}>
              {lang === 'zh' ? '综合匹配分' : 'Overall Score'}
            </span>
          </div>
          <h2 className="text-lg font-serif mb-2" style={{ color: 'rgba(226,232,240,0.9)' }}>
            {reading.summary.headline}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,232,240,0.65)' }}>
            {reading.summary.oneLiner}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {reading.summary.keywords.map(k => (
              <span key={k} className="text-xs px-2 py-1 rounded-full"
                style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#A78BFA' }}>
                {k}
              </span>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Radar / Dimensions Toggle */}
      <div className="flex gap-2">
        {(['radar', 'dimensions'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeTab === tab ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.06)'}`,
              color: activeTab === tab ? '#A78BFA' : 'rgba(226,232,240,0.5)',
            }}
          >
            {tab === 'radar'
              ? (lang === 'zh' ? '📊 关系雷达图' : '📊 Relationship Radar')
              : (lang === 'zh' ? '📋 五维详情' : '📋 Five Dimensions')}
          </button>
        ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIMENSION_KEYS.map(key => (
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

      {/* Timeline */}
      {reading.timeline && (
        <GlassCard level="card" className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-xs tracking-widest uppercase" style={{ color: 'rgba(251,191,36,0.6)' }}>
              {lang === 'zh' ? '📅 阶段提醒' : '📅 Phase Reminder'}
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg">🌙</span>
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: 'rgba(251,191,36,0.7)' }}>
                  {lang === 'zh' ? '当前阶段' : 'Current Phase'}
                </div>
                <p className="text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>
                  {reading.timeline.currentPhase}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg">📆</span>
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: 'rgba(251,191,36,0.7)' }}>
                  {lang === 'zh' ? '未来30天' : 'Next 30 Days'}
                </div>
                <p className="text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>
                  {reading.timeline.next30Days}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Share */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleCopyLink}
          disabled={shareLoading}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: shareUrlCopied ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${shareUrlCopied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: shareUrlCopied ? '#34D399' : '#E2E8F0',
          }}
        >
          {shareUrlCopied
            ? (lang === 'zh' ? '✓ 链接已复制' : '✓ Link copied')
            : (lang === 'zh' ? '🔗 复制分享链接' : '🔗 Copy share link')}
        </button>
        <MysticButton
          onClick={handleCopyLink}
          className="flex-1"
        >
          {lang === 'zh' ? '↗ 分享关系图' : '↗ Share Relationship'}
        </MysticButton>
      </div>

      {/* Privacy note */}
      <p className="text-center text-xs" style={{ color: 'rgba(226,232,240,0.25)' }}>
        {lang === 'zh'
          ? '🔒 分享内容默认不包含出生日期和地点，仅显示昵称'
          : '🔒 Shared content does not include birth dates or locations by default'}
      </p>
    </div>
  );
}
