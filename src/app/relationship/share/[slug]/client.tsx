'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { RelationshipRadar } from '@/components/relationship/RelationshipRadar';
import type { RelationshipReading } from '@/types/relationship';

interface ShareData {
  share: {
    public_slug: string;
    share_mode: string;
    include_names: boolean;
    include_birth_data: boolean;
    view_count: number;
  };
  reading: {
    id: string;
    relation_type: string;
    person_a_nickname?: string;
    person_b_nickname?: string;
    score_overall: number;
    dimensions: RelationshipReading['dimensions'];
    summary: RelationshipReading['summary'];
    timeline?: RelationshipReading['timeline'];
  };
}

export default function SharePageClient() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/relationship/share?slug=${slug}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error ?? 'Share not found');
        }
      })
      .catch(() => setError('Failed to load shared relationship'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0a0a1a 100%)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">💫</div>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.4)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0a0a1a 100%)' }}>
        <GlassCard level="card" className="p-8 text-center max-w-md mx-4">
          <div className="text-3xl mb-3">🔍</div>
          <h1 className="text-lg font-serif font-bold mb-2 text-white">Share not found</h1>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.5)' }}>
            This relationship share link may have expired or does not exist.
          </p>
          <a href="/relationship/new" className="mt-4 inline-block text-sm" style={{ color: '#A78BFA' }}>
            Create your own →
          </a>
        </GlassCard>
      </div>
    );
  }

  const { share, reading } = data;
  const personANickname = reading.person_a_nickname ?? 'Person A';
  const personBNickname = reading.person_b_nickname ?? 'Person B';

  // Build a minimal Reading object for the components
  const readingResult: RelationshipReading = {
    id: reading.id,
    relationType: reading.relation_type as RelationshipReading['relationType'],
    personA: { nickname: personANickname },
    personB: { nickname: personBNickname },
    overallScore: reading.score_overall,
    dimensions: reading.dimensions,
    summary: reading.summary,
    timeline: reading.timeline,
    isPremium: false,
    createdAt: '',
  };

  const scoreColor = (score: number) =>
    score >= 70 ? '#34D399' : score >= 50 ? '#F59E0B' : '#F87171';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 50%, #0a0a1a 100%)' }}>
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Shared badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full"
            style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', color: '#A78BFA' }}>
            💕 {personANickname} & {personBNickname} {reading.relation_type === 'romantic' ? '浪漫关系' : reading.relation_type === 'friendship' ? '友谊' : '工作搭档'}
          </div>
        </div>

        {/* Summary card */}
        <GlassCard level="card" className="p-8 text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl font-bold" style={{ color: scoreColor(reading.score_overall) }}>
              {reading.score_overall}
            </span>
            <span className="text-sm" style={{ color: 'rgba(226,232,240,0.4)' }}>综合匹配</span>
          </div>
          <h1 className="text-xl font-serif font-bold mb-2 text-white">
            {reading.summary.headline}
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(226,232,240,0.65)' }}>
            {reading.summary.oneLiner}
          </p>
        </GlassCard>

        {/* Radar */}
        {share.share_mode !== 'insight_card' && (
          <GlassCard level="card" className="p-6 mb-6">
            <div className="text-center mb-4">
              <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(251,191,36,0.5)' }}>
                五维关系图
              </span>
            </div>
            <RelationshipRadar
              dimensions={reading.dimensions}
              personANickname={personANickname}
              personBNickname={personBNickname}
              lang="zh"
            />
          </GlassCard>
        )}

        {/* CTA */}
        <GlassCard level="card" className="p-6 text-center">
          <p className="text-sm mb-4" style={{ color: 'rgba(226,232,240,0.6)' }}>
            {personANickname} & {personBNickname} 在 TianJi Global 生成了关系分析
          </p>
          <a
            href="/relationship/new"
            className="inline-block px-6 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(244,114,182,0.2))',
              border: '1px solid rgba(167,139,250,0.3)',
              color: '#E2E8F0',
            }}
          >
            🔮 创建你的关系分析
          </a>
        </GlassCard>

        {/* Privacy note */}
        <p className="text-center text-xs mt-4" style={{ color: 'rgba(226,232,240,0.2)' }}>
          分享视图 · 不包含精确出生信息 · TianJi Global
        </p>
      </div>
    </div>
  );
}
