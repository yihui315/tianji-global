'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Iztrolabe } from 'react-iztro';
import ZiWeiPalaceAnimation from '@/components/animations/ZiWeiPalaceAnimation';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import {
  BackgroundVideoHero,
  InsightGrid,
  LandingSection,
  ModuleInputShell,
  ResultScaffold,
  ScrollNarrativeSection,
  ShareSection,
  TrustStrip,
} from '@/components/landing';
import { GlassCard, LanguageSwitch, MysticButton } from '@/components/ui';
import { colors } from '@/design-system';
import { saveReading } from '@/lib/save-reading';

interface ZiweiAIResponse {
  aiInterpretation?: string;
  disclaimer?: string;
  aiMeta?: { provider: string; model: string; latencyMs: number; costUSD: number };
  aiError?: string;
}

const NARRATIVE_BLOCKS = [
  {
    label: '01 命宫',
    heading: '星曜入命，格局初定',
    body: '紫微斗数以命宫为核心，十二宫位铺开一张人生结构图。主星落位、辅星相拱，会共同勾勒你的气质、节奏与命运重心。',
  },
  {
    label: '02 大限',
    heading: '宫垣流转，运势起伏',
    body: '大限、流年、小限层层推进，告诉你何时适合主动推进，何时需要守住边界，也指出真正值得你把握的转折窗口。',
  },
  {
    label: '03 星曜',
    heading: '主星落位，性格成形',
    body: '紫微、天机、贪狼、太阳等主星并非抽象符号，而是你在关系、事业与选择中反复显露的底层驱动力。',
  },
];

const HERO_TRUST_ITEMS = [
  { label: '12 宫结构', description: '命宫、事业、关系与财富同屏展开' },
  { label: 'AI 深度解读', description: '保留原有 /api/ziwei 结果结构' },
  { label: '动态图盘', description: '紫微宫位动画与 Iztrolabe 联动展示' },
  { label: '可分享输出', description: '沿用现有保存与分享入口' },
];

function buildInsightItems(aiText: string): Array<{ icon: string; label: string; value: string }> {
  const sentences = aiText
    .split(/[。！？\n]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 6);

  const icons = ['✦', '✧', '⬢', '✺', '✦', '✧'];

  return sentences.map((sentence, index) => ({
    icon: icons[index % icons.length],
    label: `洞察 ${index + 1}`,
    value: sentence.length > 72 ? `${sentence.slice(0, 72)}…` : sentence,
  }));
}

function extractLead(aiText?: string) {
  if (!aiText) return '你的命盘正在显现出一条可被看见的人生结构。';

  const firstSentence = aiText
    .split(/[。！？\n]/)
    .map((sentence) => sentence.trim())
    .find(Boolean);

  return firstSentence ?? aiText.slice(0, 80);
}

function ZiweiInputForm({
  birthday,
  setBirthday,
  birthTime,
  setBirthTime,
  birthdayType,
  setBirthdayType,
  gender,
  setGender,
  onSubmit,
  isLoading,
}: {
  birthday: string;
  setBirthday: (value: string) => void;
  birthTime: number;
  setBirthTime: (value: number) => void;
  birthdayType: 'solar' | 'lunar';
  setBirthdayType: (value: 'solar' | 'lunar') => void;
  gender: 'male' | 'female';
  setGender: (value: 'male' | 'female') => void;
  onSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
          生日类型
        </label>
        <select
          value={birthdayType}
          onChange={(event) => setBirthdayType(event.target.value as 'solar' | 'lunar')}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all focus:border-purple-500/40 focus:outline-none"
        >
          <option value="solar">阳历 / Solar</option>
          <option value="lunar">农历 / Lunar</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
          生日
        </label>
        <input
          type="date"
          value={birthday}
          onChange={(event) => setBirthday(event.target.value)}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all focus:border-purple-500/40 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
          出生时辰
        </label>
        <select
          value={birthTime}
          onChange={(event) => setBirthTime(Number(event.target.value))}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all focus:border-purple-500/40 focus:outline-none"
        >
          {[
            '子时 (23:00-00:59)',
            '丑时 (01:00-02:59)',
            '寅时 (03:00-04:59)',
            '卯时 (05:00-06:59)',
            '辰时 (07:00-08:59)',
            '巳时 (09:00-10:59)',
            '午时 (11:00-12:59)',
            '未时 (13:00-14:59)',
            '申时 (15:00-16:59)',
            '酉时 (17:00-18:59)',
            '戌时 (19:00-20:59)',
            '亥时 (21:00-22:59)',
            '子时尾 (23:00-23:59)',
          ].map((label, index) => (
            <option key={index} value={index}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.28em] text-white/35">
          性别
        </label>
        <select
          value={gender}
          onChange={(event) => setGender(event.target.value as 'male' | 'female')}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white/80 transition-all focus:border-purple-500/40 focus:outline-none"
        >
          <option value="male">男 / Male</option>
          <option value="female">女 / Female</option>
        </select>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full rounded-2xl py-4 text-base font-semibold tracking-[0.08em] text-[#0a0a0a] transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #D4AF37 0%, #7c3aed 100%)',
            boxShadow:
              '0 4px 32px rgba(124,58,237,0.35), 0 0 60px rgba(212,175,55,0.15)',
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              AI 解读中...
            </span>
          ) : (
            '开启 AI 命盘'
          )}
        </button>
      </div>
    </form>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8">
          <div className="h-4 w-28 rounded-full bg-white/[0.06]" />
          <div className="h-12 w-3/4 rounded-2xl bg-white/[0.05]" />
          <div className="h-5 w-full rounded-full bg-white/[0.04]" />
          <div className="h-5 w-5/6 rounded-full bg-white/[0.04]" />
        </div>
        <div className="space-y-3 rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-14 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

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
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8">
        <GlassCard
          level="card"
          className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.015] p-8 text-center"
        >
          <p style={{ color: '#F87171' }}>AI 解读失败：{result.aiError}</p>
        </GlassCard>
      </div>
    );
  }

  const aiInterpretation = result.aiInterpretation ?? '';
  const insightItems = buildInsightItems(aiInterpretation);
  const lead = extractLead(aiInterpretation);
  const resultData = { birthday, birthTime, birthdayType, gender };

  return (
    <>
      <ScrollNarrativeSection
        accentColor="#7c3aed"
        goldColor="#D4AF37"
        blocks={NARRATIVE_BLOCKS}
      />

      <ResultScaffold
        eyebrow="AI destiny result"
        title="The imperial chart is now readable."
        subtitle="保留原有紫微数据与解读逻辑，只升级结果区的结构、层次与阅读节奏。"
        overview={
          <div className="space-y-4">
            <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
              Overview
            </div>
            <p className="max-w-3xl font-serif text-2xl text-white/90 sm:text-3xl">
              {lead}
            </p>
            <p className="max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              你的命盘已经从结构层、时间层与主星层开始显现。接下来你会看到高亮洞察、完整 AI 解读，以及宫位图与 Iztrolabe 的可视化展开。
            </p>
          </div>
        }
        highlights={
          <div className="space-y-4">
            <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
              Key highlights
            </div>
            <div className="space-y-3">
              {insightItems.slice(0, 4).map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-white/40">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <p className="text-sm leading-7 text-white/70">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        }
        details={
          <div className="space-y-4">
            <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
              Full interpretation
            </div>
            <div className="whitespace-pre-wrap text-sm leading-7 text-white/72 sm:text-base">
              {aiInterpretation}
            </div>
            {result.disclaimer && (
              <p className="border-t border-white/[0.06] pt-4 text-[11px] italic text-white/28">
                {result.disclaimer}
              </p>
            )}
          </div>
        }
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                Reading stack
              </div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-white/65">
                <p>紫微宫位动画</p>
                <p>Iztrolabe 星盘结构</p>
                <p>AI 结构解读</p>
                <p>分享与保存入口</p>
              </div>
            </div>
            {result.aiMeta && (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  AI meta
                </div>
                <div className="mt-3 space-y-2 text-sm text-white/60">
                  <p>Model: {result.aiMeta.model}</p>
                  <p>Latency: {result.aiMeta.latencyMs} ms</p>
                  <p>Cost: ${result.aiMeta.costUSD?.toFixed(4)}</p>
                </div>
              </div>
            )}
          </div>
        }
      />

      {insightItems.length > 0 && (
        <InsightGrid
          title="命盘洞察"
          subtitle="从原始 AI 结果中抽取出的高亮信息层"
          items={insightItems}
          accentColor="#7c3aed"
          goldColor="#D4AF37"
        />
      )}

      <LandingSection
        eyebrow="Visual structure"
        title="Palace motion reveals the chart architecture."
        subtitle="保留原有紫微宫位动画逻辑，只升级外层容器、标题节奏与视觉质感。"
      >
        <TrustStrip items={HERO_TRUST_ITEMS} className="mb-8" />
        <GlassCard
          level="card"
          className="overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-black/20"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-1 rounded-full"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(212,175,55,0.8), rgba(168,130,255,0.8))',
                }}
              />
              <span className="text-xs uppercase tracking-[0.28em] text-white/40">
                紫微星盘 · Zi Wei Palace
              </span>
            </div>
            <span
              className="rounded-full border px-2.5 py-1 text-[10px]"
              style={{
                color: 'rgba(168,130,255,0.72)',
                background: 'rgba(168,130,255,0.08)',
                borderColor: 'rgba(168,130,255,0.18)',
              }}
            >
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
              playing
            />
          </div>
        </GlassCard>
      </LandingSection>

      <LandingSection
        eyebrow="Chart canvas"
        title="Inspect the complete astrolabe without leaving the page."
        subtitle="Iztrolabe 与上方解读、保存、分享链路保持原样，只把容器升级为更适合高端落地页的展示方式。"
      >
        <div
          className="mx-auto overflow-hidden rounded-[1.5rem] border border-white/[0.06]"
          style={{
            maxWidth: '1100px',
            boxShadow: '0 0 25px rgba(124,58,237,0.15)',
          }}
        >
          <Iztrolabe
            birthday={birthday}
            birthTime={birthTime}
            birthdayType={birthdayType}
            gender={gender}
          />
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="Share-ready"
        title="Keep the original share flow, wrapped in a clearer luxury surface."
        subtitle="这里继续沿用现有 AnimatedShareButton 与 OG share 背景，只升级版式和节奏。"
      >
        <GlassCard
          level="card"
          className="relative mx-auto max-w-3xl rounded-[1.75rem] border border-white/[0.06] bg-black/20 p-8 text-center"
        >
          <div
            className="absolute left-0 right-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
            }}
          />
          <h3
            className="mb-2 font-serif text-xl tracking-[0.1em]"
            style={{ color: 'rgba(212,175,55,0.9)' }}
          >
            命盘已解锁
          </h3>
          <p className="mb-6 text-sm tracking-[0.06em] text-white/35">
            将你的命盘分享给朋友，或保存留念
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <AnimatedShareButton
              type="ziwei"
              resultData={resultData}
              format="webp"
              language="zh"
              variant="primary"
            />
            <AnimatedShareButton
              type="ziwei"
              resultData={resultData}
              format="png"
              language="zh"
              variant="secondary"
            />
          </div>
        </GlassCard>
      </LandingSection>

      <ShareSection
        type="ziwei"
        resultData={resultData}
              ogBgSrc="/assets/images/og/ziwei-og-bg-1200x630.jpg"
        accentColor="#7c3aed"
        goldColor="#D4AF37"
      />
    </>
  );
}

export default function ZiweiPage() {
  const [birthday, setBirthday] = useState('2000-08-16');
  const [birthTime, setBirthTime] = useState(2);
  const [birthdayType, setBirthdayType] = useState<'solar' | 'lunar'>('solar');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [aiResult, setAiResult] = useState<ZiweiAIResponse | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
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

        const response = await fetch(`/api/ziwei?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: ZiweiAIResponse = await response.json();
        setAiResult(data);

        saveReading({
          reading_type: 'ziwei',
          title: `${birthday} ${birthdayType === 'lunar' ? '农历' : '阳历'} ${gender === 'male' ? '男' : '女'} 紫微斗数`,
          summary: data.aiInterpretation?.slice(0, 120) ?? '',
          reading_data: data as unknown as Record<string, unknown>,
        });
      } catch (error) {
        setAiResult({
          aiError:
            error instanceof Error ? error.message : 'Failed to get AI interpretation',
        });
      } finally {
        setIsLoadingAI(false);
      }
    },
    [birthday, birthTime, birthdayType, gender]
  );

  return (
    <div className="min-h-screen text-white" style={{ background: colors.bgPrimary }}>
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitch />
      </div>

      <BackgroundVideoHero
        eyebrow="Imperial destiny atlas"
        title={
          <>
            紫微斗数
            <br />
            <span className="text-white/78">帝星落宫，命盘初显</span>
          </>
        }
        subtitle="Zi Wei Dou Shu"
        description="输入你的生日、时辰与历法类型，立即展开一张结构化的紫微命盘。你会保留原有 TianJi 的 AI 解读、图盘可视化、保存与分享链路，只是阅读体验被升级为更沉浸、更高级的落地页样式。"
        videoSrc="/assets/videos/hero/ziwei-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/ziwei-hero-poster-16x9.jpg"
        imageSrc="/assets/images/hero/ziwei-hero-master-16x9.jpg"
        meta={<TrustStrip items={HERO_TRUST_ITEMS} className="w-full max-w-3xl" />}
      >
        <ModuleInputShell
          eyebrow="Fast input"
          title="Cast your chart in seconds"
          description="表单字段、查询参数与 `/api/ziwei` 请求保持不变。这里升级的是视觉壳层、留白节奏与表单可读性。"
          footer="命盘生成后，仍会进入原有 AI 解读、保存记录与分享流程。"
        >
          <ZiweiInputForm
            birthday={birthday}
            setBirthday={setBirthday}
            birthTime={birthTime}
            setBirthTime={setBirthTime}
            birthdayType={birthdayType}
            setBirthdayType={setBirthdayType}
            gender={gender}
            setGender={setGender}
            onSubmit={handleSubmit}
            isLoading={isLoadingAI}
          />
        </ModuleInputShell>
      </BackgroundVideoHero>

      {isLoadingAI && <LoadingSkeleton />}

      {aiResult && !isLoadingAI && (
        <ResultBlock
          result={aiResult}
          birthday={birthday}
          birthTime={birthTime}
          birthdayType={birthdayType}
          gender={gender}
        />
      )}

      {!aiResult && !isLoadingAI && (
        <>
          <ScrollNarrativeSection
            accentColor="#7c3aed"
            goldColor="#D4AF37"
            blocks={NARRATIVE_BLOCKS}
          />

          <LandingSection
            eyebrow="Before you cast"
            title="A premium reading page should promise structure before mystery."
            subtitle="在真正提交命盘之前，先告诉用户这套系统将给出什么：宫位结构、时间节奏、主星性格，以及一份可以保存与分享的 AI 解读。"
          >
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <GlassCard
                level="card"
                className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8"
              >
                <div className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  What opens after submit
                </div>
                <div className="space-y-3 text-sm leading-7 text-white/65">
                  <p>完整 AI 解读与摘要层次</p>
                  <p>宫位动画与 Iztrolabe 双重展示</p>
                  <p>保存到 readings 历史记录</p>
                  <p>原有分享流程继续可用</p>
                </div>
              </GlassCard>

              <GlassCard
                level="strong"
                className="rounded-[1.75rem] border border-white/[0.08] bg-black/25 p-6 sm:p-8"
              >
                <div className="mb-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/35">
                  Ready when you are
                </div>
                <p className="mb-6 text-sm leading-7 text-white/60">
                  这一步不新增任何业务路径。你点击上方表单后，仍会走当前的 API、保存与分享链路，只是命盘第一页更像一个真正可转化的高端产品入口。
                </p>
                <MysticButton
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  回到顶部开始解盘
                </MysticButton>
              </GlassCard>
            </div>
          </LandingSection>
        </>
      )}
    </div>
  );
}
