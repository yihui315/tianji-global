'use client';

/* ═══════════════════════════════════════════════════════════════
   ZiweiPage — 紫微斗数星盘 (Taste Rule redesign)
   Branch: redesign-landing-pages-20260419
   Fixes in this version:
   - REMOVED module-level let (was bug: shared across SSR requests)
   - Palace/Iztrolabe/Share render only after aiResult is set
   - Button uses explicit z-index + overflow-visible to stay visible
   ═══════════════════════════════════════════════════════════════ */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Iztrolabe } from 'react-iztro';
import ZiWeiPalaceAnimation from '@/components/animations/ZiWeiPalaceAnimation';
import { GlassCard, LanguageSwitch } from '@/components/ui';
import { ModuleHero, ScrollNarrativeSection, InsightGrid, ShareSection } from '@/components/landing';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import { saveReading } from '@/lib/save-reading';
import { colors } from '@/design-system';

/* ── Types ── */
interface ZiweiAIResponse {
  aiInterpretation?: string;
  disclaimer?: string;
  aiMeta?: { provider: string; model: string; latencyMs: number; costUSD: number };
  aiError?: string;
}

/* ── Narrative blocks ── */
const NARRATIVE_BLOCKS = [
  {
    label: '01 · 命宫',
    heading: '星耀入命，格局已定',
    body: '紫微斗数以命宫为核心，七十二颗星曜分布于十二宫位，每一颗星都在述说你与生俱来的特质与命运走向。',
  },
  {
    label: '02 · 宫垣',
    heading: '宫位流转，大限变迁',
    body: '流年、大限、小限层层叠加，每十年的能量相位告诉你何时该进，何时该守，何时是命运的转折点。',
  },
  {
    label: '03 · 星曜',
    heading: '星曜解读，性格全息',
    body: '紫微、天机、贪狼、太阳——每一颗星都有其独特光芒，与宫位结合，呈现你性格中最深处的原貌。',
  },
];

/* ── Build insight items from AI text ── */
function buildInsightItems(aiText: string): Array<{ icon: string; label: string; value: string }> {
  const sentences = aiText.split(/[。！？\n]/).filter(Boolean).slice(0, 6);
  const icons = ['✦', '◈', '✧', '◉', '✦', '◈'];
  return sentences.map((s, i) => ({
    icon: icons[i % icons.length],
    label: `洞察 ${i + 1}`,
    value: s.trim().slice(0, 80) + (s.length > 80 ? '…' : ''),
  }));
}

/* ── Input form (inside hero) ── */
function ZiweiInputForm({
  birthday, setBirthday,
  birthTime, setBirthTime,
  birthdayType, setBirthdayType,
  gender, setGender,
  onSubmit,
  isLoading,
}: {
  birthday: string; setBirthday: (v: string) => void;
  birthTime: number; setBirthTime: (v: number) => void;
  birthdayType: 'solar' | 'lunar'; setBirthdayType: (v: 'solar' | 'lunar') => void;
  gender: 'male' | 'female'; setGender: (v: 'male' | 'female') => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    /* Form wrapper: explicit z-index + overflow-visible to prevent clip */
    <div
      className="w-full max-w-sm rounded-2xl"
      style={{
        background: 'rgba(5,5,15,0.82)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-[10px] font-serif text-white/30 mb-1.5 tracking-widest uppercase">生日类型</label>
          <select
            value={birthdayType}
            onChange={e => setBirthdayType(e.target.value as 'solar' | 'lunar')}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-purple-500/40 transition-all"
          >
            <option value="solar">阳历 / Solar</option>
            <option value="lunar">农历 / Lunar</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-serif text-white/30 mb-1.5 tracking-widest uppercase">生日</label>
          <input
            type="date"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-purple-500/40 transition-all"
          />
        </div>
        <div>
          <label className="block text-[10px] font-serif text-white/30 mb-1.5 tracking-widest uppercase">出生时辰</label>
          <select
            value={birthTime}
            onChange={e => setBirthTime(Number(e.target.value))}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-purple-500/40 transition-all"
          >
            {[
              '子时 (23:00-00:59)', '丑时 (01:00-02:59)', '寅时 (03:00-04:59)',
              '卯时 (05:00-06:59)', '辰时 (07:00-08:59)', '巳时 (09:00-10:59)',
              '午时 (11:00-12:59)', '未时 (13:00-14:59)', '申时 (15:00-16:59)',
              '酉时 (17:00-18:59)', '戌时 (19:00-20:59)', '亥时 (21:00-22:59)',
              '子时尾 (23:00-23:59)',
            ].map((t, i) => <option key={i} value={i}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-serif text-white/30 mb-1.5 tracking-widest uppercase">性别</label>
          <select
            value={gender}
            onChange={e => setGender(e.target.value as 'male' | 'female')}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white/80 bg-white/[0.04] border border-white/[0.08] focus:outline-none focus:border-purple-500/40 transition-all"
          >
            <option value="male">男 / Male</option>
            <option value="female">女 / Female</option>
          </select>
        </div>
        {/* Submit button — explicit overflow-visible + relative zIndex */}
        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full rounded-2xl py-4 text-base font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              overflow: 'visible',
              position: 'relative',
              zIndex: 20,
              background: 'linear-gradient(135deg, #D4AF37 0%, #7c3aed 100%)',
              color: '#0a0a0a',
              boxShadow: '0 4px 32px rgba(124,58,237,0.35), 0 0 60px rgba(212,175,55,0.15)',
              letterSpacing: '0.06em',
            }}
            onMouseEnter={e => {
              if (!isLoading) {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 40px rgba(124,58,237,0.45), 0 0 80px rgba(212,175,55,0.25)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 32px rgba(124,58,237,0.35), 0 0 60px rgba(212,175,55,0.15)';
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                AI 解读中...
              </span>
            ) : '✨ AI 解读'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Loading skeleton ── */
function LoadingSkeleton() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto px-4 pt-24 pb-12">
      <div className="space-y-4">
        {[240, 160, 200].map((w, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/[0.04]" style={{ width: `${w}px`, margin: '0 auto' }} />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Result block: Palace + Iztrolabe + Share (ONLY after aiResult is set) ── */
function ResultBlock({
  result,
  birthday,
  birthTime,
  birthdayType,
  gender,
}: {
  result: ZiweiAIResponse;
  birthday: string;
  birthTime: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
}) {
  if (result.aiError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <GlassCard level="card" className="p-8 border border-white/[0.06] bg-white/[0.015] rounded-2xl text-center">
          <p style={{ color: '#F87171' }}>AI 解读失败: {result.aiError}</p>
        </GlassCard>
      </div>
    );
  }

  const insightItems = result.aiInterpretation ? buildInsightItems(result.aiInterpretation) : [];

  return (
    <>
      {/* Scroll Narrative */}
      <ScrollNarrativeSection
        accentColor="#7c3aed"
        goldColor="#D4AF37"
        blocks={NARRATIVE_BLOCKS}
      />

      {/* Insight Grid */}
      {insightItems.length > 0 && (
        <InsightGrid
          title="命盘解析"
          subtitle="以下为 AI 深度解读要点"
          items={insightItems}
          accentColor="#7c3aed"
          goldColor="#D4AF37"
        />
      )}

      {/* Full AI interpretation */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <GlassCard level="card" className="p-8 border border-white/[0.06] bg-black/20 backdrop-blur-md rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }} />
          <div className="flex items-center gap-2 mb-5">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(212,175,55,0.85)' }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1L6.2 3.8L9 4.2L7 6.2L7.6 9L5 7.6L2.4 9L3 6.2L1 4.2L3.8 3.8L5 1Z" fill="currentColor"/>
              </svg>
              AI 命盘解读
            </div>
          </div>
          <div className="whitespace-pre-wrap leading-relaxed text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {result.aiInterpretation}
          </div>
          {result.disclaimer && (
            <p className="mt-5 pt-4 text-[11px] italic border-t border-white/[0.06]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              {result.disclaimer}
            </p>
          )}
          {result.aiMeta && (
            <div className="mt-4 pt-3 flex justify-between text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
              <span>{result.aiMeta.model}</span>
              <span>{result.aiMeta.latencyMs}ms · ${result.aiMeta.costUSD?.toFixed(4)}</span>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Palace Chart */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <GlassCard level="card" className="rounded-2xl border border-white/[0.06] bg-black/20 backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(212,175,55,0.8), rgba(168,130,255,0.8))' }} />
              <span className="text-xs font-serif tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                紫微星盘 · Zi Wei Palace
              </span>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full"
              style={{ color: 'rgba(168,130,255,0.6)', background: 'rgba(168,130,255,0.08)', border: '1px solid rgba(168,130,255,0.15)' }}>
              Animated
            </span>
          </div>
          <div className="flex justify-center py-6">
            <ZiWeiPalaceAnimation
              birthDate={birthday}
              birthTime={birthTime}
              gender={gender}
              birthdayType={birthdayType}
              width={480}
              height={480}
              playing={true}
            />
          </div>
        </GlassCard>
      </div>

      {/* Iztrolabe */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div
          style={{
            width: '100%',
            maxWidth: '1100px',
            margin: '0 auto',
            boxShadow: '0 0 25px rgba(124,58,237,0.15)',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Iztrolabe birthday={birthday} birthTime={birthTime} birthdayType={birthdayType} gender={gender} />
        </div>
      </div>

      {/* Share buttons (inline, immediately after results) */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <GlassCard level="card" className="relative p-8 border border-white/[0.06] bg-black/20 backdrop-blur-md rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }} />
          <div className="text-center mb-6">
            <h3 className="font-serif text-xl mb-2" style={{ color: 'rgba(212,175,55,0.9)', letterSpacing: '0.1em' }}>
              命盘已解锁
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
              将你的命盘分享给朋友，或保存留念
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <AnimatedShareButton type="ziwei" resultData={{ birthday, birthTime, birthdayType, gender }} format="webp" language="zh" variant="primary" />
            <AnimatedShareButton type="ziwei" resultData={{ birthday, birthTime, birthdayType, gender }} format="png" language="zh" variant="secondary" />
          </div>
        </GlassCard>
      </div>

      {/* Share Section */}
      <ShareSection
        type="ziwei"
        resultData={{ birthday, birthTime, birthdayType, gender }}
        ogBgSrc="/assets/share/ziwei-og.jpg"
        accentColor="#7c3aed"
        goldColor="#D4AF37"
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Page — all state, no module-level variables
   ═══════════════════════════════════════════════════════════════ */
export default function ZiweiPage() {
  const [birthday, setBirthday] = useState<string>('2000-08-16');
  const [birthTime, setBirthTime] = useState<number>(2);
  const [birthdayType, setBirthdayType] = useState<'solar' | 'lunar'>('solar');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [aiResult, setAiResult] = useState<ZiweiAIResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoadingAI(true);
      setAiResult(null);

      try {
        const params = new URLSearchParams({
          birthday,
          birthTime: String(birthTime),
          birthdayType,
          gender,
          enhanceWithAI: 'true',
          language: 'zh-CN',
        });
        const res = await fetch(`/api/ziwei?${params.toString()}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data: ZiweiAIResponse = await res.json();
        setAiResult(data);
        saveReading({
          reading_type: 'ziwei',
          title: `${birthday} ${birthdayType === 'lunar' ? '农历' : '阳历'} ${gender === 'male' ? '男' : '女'} 紫微斗数`,
          summary: data.aiInterpretation?.slice(0, 120) ?? '',
          reading_data: data as unknown as Record<string, unknown>,
        });
      } catch (err) {
        setAiResult({ aiError: err instanceof Error ? err.message : 'Failed to get AI interpretation' });
      } finally {
        setIsLoadingAI(false);
      }
    },
    [birthday, birthTime, birthdayType, gender]
  );

  return (
    <div className="text-white min-h-screen" style={{ background: colors.bgPrimary }}>
      {/* Fixed LanguageSwitch */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitch />
      </div>

      {/* ── Hero Section ── */}
      <ModuleHero
        titleCn="紫微斗数"
        titleEn="Zi Wei Dou Shu"
        tagline="星耀入命，格局已定"
        ogBgSrc="/assets/hero/hero-cosmic-interface.png"
        accentColor="#7c3aed"
        goldColor="#D4AF37"
      >
        <ZiweiInputForm
          birthday={birthday} setBirthday={setBirthday}
          birthTime={birthTime} setBirthTime={setBirthTime}
          birthdayType={birthdayType} setBirthdayType={setBirthdayType}
          gender={gender} setGender={setGender}
          onSubmit={handleSubmit}
          isLoading={isLoadingAI}
        />
      </ModuleHero>

      {/* ── Loading state ── */}
      {isLoadingAI && <LoadingSkeleton />}

      {/* ── Result state: ONLY show Palace + Iztrolabe + Share when aiResult exists ── */}
      {aiResult && !isLoadingAI && (
        <ResultBlock
          result={aiResult}
          birthday={birthday}
          birthTime={birthTime}
          birthdayType={birthdayType}
          gender={gender}
        />
      )}

      {/* ── Default state: show narrative CTA before user submits ── */}
      {!aiResult && !isLoadingAI && (
        <>
          <ScrollNarrativeSection
            accentColor="#7c3aed"
            goldColor="#D4AF37"
            blocks={NARRATIVE_BLOCKS}
          />
          <div className="max-w-xl mx-auto px-6 py-20 text-center">
            <p className="text-white/30 text-sm mb-6">填写上方表单，开启你的命盘解析</p>
            <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.3), transparent)' }} />
          </div>
        </>
      )}
    </div>
  );
}
