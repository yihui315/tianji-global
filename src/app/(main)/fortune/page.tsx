'use client';

import { useState } from 'react';
import LifeChart, { type FortunePoint } from '@/components/charts/LifeChart';
import SharePanel from '@/components/SharePanel';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { moduleLandingCopy } from '@/lib/language-routing';
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

interface FortuneResponse {
  fortuneCycles: FortunePoint[];
  currentAge: number;
  currentPhase: string;
  summary: string;
  bestPeriods: string[];
  challengingPeriods: string[];
  aiInterpretation?: string;
  disclaimer?: string;
  aiMeta?: { provider: string; model: string; latencyMs: number; costUSD: number };
  aiError?: string;
}

export default function FortunePage() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [language, setLanguage] = useSyncedLanguage();
  const [data, setData] = useState<FortuneResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');

  const isZH = language === 'zh';
  const copy = moduleLandingCopy.fortune[language];
  const pageCopy = isZH
    ? {
        errors: {
          birthDate: '请选择出生日期',
          generic: '生成时出现问题',
        },
        loading: {
          generate: '生成中',
          ai: 'AI 解读中',
        },
        stats: {
          primaryOutput: '核心输出',
          dimensions: '维度',
          mode: '模式',
          lifeCurve: '命运曲线',
          aiOptional: 'AI 可选',
        },
        shell: {
          eyebrow: '出生资料',
          title: '生成你的人生命运曲线',
          description: '出生时间可选 只有在你选择深度解读时才会请求 AI 解释',
          footer: '这次改版不改变支付 登录或存储合约',
        },
        fields: {
          birthDate: '出生日期 *',
          birthTime: '出生时间',
          gender: '性别',
          language: '语言',
          unspecified: '不指定',
          male: '男性',
          female: '女性',
          deepReading: 'AI 深度解读',
        },
        narrative: [
          {
            label: '01',
            heading: '人生不是直线 而是一段一段的势能变化',
            body: '这条曲线把承压期 推进期 和修整期放在同一张图里 让时机第一次变得清楚可见',
            align: 'left' as const,
          },
          {
            label: '02',
            heading: '高点有意义 是因为它能变成决策',
            body: '事业 财富 关系 与健康一起出现 你看到的不再是孤立数字 而是当下真正要取舍的地方',
            align: 'center' as const,
          },
          {
            label: '03',
            heading: '更深一层的价值 在于看懂转折',
            body: 'AI 解读不是替代曲线 它是在原有结果之上补足语境 帮你知道为什么现在重要',
            align: 'right' as const,
          },
        ],
        result: {
          eyebrow: '生成结果',
          title: '先看曲线 再看窗口 最后进入细节',
          description: '先建立整体判断 再看高点与低点 最后进入每个阶段的详细变化',
          currentPhase: '当前阶段',
          summary: (age: number, summary: string) => `${age} 岁 ${summary}`,
          highlights: {
            best: '最佳窗口',
            pressure: '承压窗口',
            ai: 'AI 层',
            aiOn: '本次已开启',
            aiOff: '可选',
            waiting: '等待信号',
            safe: '暂无明显预警',
          },
          aiTitle: 'AI 深度解读',
          aiFailed: 'AI 解读失败',
          table: {
            phase: '阶段',
            age: '年龄',
            overall: '总体',
            career: '事业',
            wealth: '财富',
            love: '关系',
            health: '健康',
          },
          asideEyebrow: '适合分享的洞察',
          asideTitle: '这条曲线不是分数 它是一张时机地图',
          asideBody: '高势能窗口适合推进 低势能窗口适合收束 关键是知道什么时候该做哪一种动作',
        },
        share: {
          title: '分享时机框架 不暴露私人出生信息',
          subtitle: '公开分享会回到 Fortune 模块入口 生成结果仍然保留在私有阅读界面里',
        },
        preview: {
          eyebrow: '结果预览',
          title: '生成之后 你会先看到什么',
          description: '先提交上面的原始表单 再在新版界面里看到同一份结果的更强呈现方式',
          gridTitle: '这条曲线会告诉你什么',
          gridSubtitle: '时机 事业 财富 关系',
          items: [
            { label: '当前窗口', value: '你正处在命运曲线的哪个位置' },
            { label: '最佳时期', value: '最适合扩张与推进的窗口' },
            { label: '承压时期', value: '更适合收束与简化的阶段' },
            { label: 'AI 解读', value: '在现有结果上补足叙事层' },
          ],
        },
      }
    : {
        errors: {
          birthDate: 'Please select your birth date',
          generic: 'Something went wrong while generating the curve',
        },
        loading: {
          generate: 'Generating',
          ai: 'AI interpreting',
        },
        stats: {
          primaryOutput: 'Primary output',
          dimensions: 'Dimensions',
          mode: 'Mode',
          lifeCurve: 'Life curve',
          aiOptional: 'AI optional',
        },
        shell: {
          eyebrow: 'Birth data',
          title: 'Generate your life curve',
          description: 'Birth time is optional AI interpretation is only requested when you choose the deeper path',
          footer: 'Birth time stays private. Pro features unlock the deeper AI layer when you want it.',
        },
        fields: {
          birthDate: 'Birth Date *',
          birthTime: 'Birth Time',
          gender: 'Gender',
          language: 'Language',
          unspecified: 'Unspecified',
          male: 'Male',
          female: 'Female',
          deepReading: 'AI deep reading',
        },
        narrative: [
          {
            label: '01',
            heading: 'Life is shaped by changing density not by a straight line',
            body: 'The curve places pressure momentum and recovery on one surface so timing becomes visible at a glance',
            align: 'left' as const,
          },
          {
            label: '02',
            heading: 'A peak matters only when it becomes a decision',
            body: 'Career wealth relationship and health appear together so you can see the real tradeoffs of the moment',
            align: 'center' as const,
          },
          {
            label: '03',
            heading: 'The deeper layer is what makes a turning point usable',
            body: 'AI interpretation does not replace the curve It expands the context around the same result so you know why this phase matters',
            align: 'right' as const,
          },
        ],
        result: {
          eyebrow: 'Generated result',
          title: 'Read the curve first Then the windows Then the details',
          description: 'Start with the full shape then move into stronger and weaker windows before entering the detailed phases',
          currentPhase: 'Current phase',
          summary: (age: number, summary: string) => `Age ${age} ${summary}`,
          highlights: {
            best: 'Best windows',
            pressure: 'Pressure windows',
            ai: 'AI layer',
            aiOn: 'Unlocked in this run',
            aiOff: 'Optional',
            waiting: 'Awaiting signal',
            safe: 'No major warning',
          },
          aiTitle: 'AI deep interpretation',
          aiFailed: 'AI interpretation failed',
          table: {
            phase: 'Phase',
            age: 'Age',
            overall: 'Overall',
            career: 'Career',
            wealth: 'Wealth',
            love: 'Relationship',
            health: 'Health',
          },
          asideEyebrow: 'Share ready insight',
          asideTitle: 'This curve is not a score It is a timing map',
          asideBody: 'Use stronger windows for expansion and quieter windows for simplification The value is knowing when each move fits',
        },
        share: {
          title: 'Share the timing frame not the private birth data',
          subtitle: 'Share the shape of your timing — the windows, the peaks, the quiet stretches — without ever exposing the birth data behind it.',
        },
        preview: {
          eyebrow: 'Preview',
          title: 'What appears after generation',
          description: 'Fill in your birth date above and your life curve will appear here, with strong and quiet windows clearly marked.',
          gridTitle: 'What the curve will reveal',
          gridSubtitle: 'Timing  Career  Wealth  Relationship',
          items: [
            { label: 'Current window', value: 'Where you stand on the curve right now' },
            { label: 'Best periods', value: 'The strongest windows for expansion' },
            { label: 'Pressure periods', value: 'The chapters that ask for restraint' },
            { label: 'AI reading', value: 'An optional narrative layer that explains the curve in plain language' },
          ],
        },
      };

  const handleGenerate = async (withAI: boolean) => {
    if (!birthDate) {
      setError(pageCopy.errors.birthDate);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        birthDate,
        gender,
        language,
        ...(birthTime ? { birthTime } : {}),
        enhanceWithAI: String(withAI),
      });

      const res = await fetch(`/api/fortune?${params}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to generate');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : pageCopy.errors.generic);
    } finally {
      setLoading(false);
      setLoadingAI(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <BackgroundVideoHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
        description={copy.hero.description}
        videoSrc="/assets/videos/hero/fortune-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/fortune-hero-poster-16x9.jpg"
        imageSrc="/assets/images/hero/fortune-hero-master-16x9.jpg"
        ctaLabel={loading ? pageCopy.loading.generate : copy.primaryCta}
        ctaHref="#fortune-form"
        secondaryCtaLabel={copy.secondaryCta}
        secondaryCtaHref="#fortune-narrative"
        stats={[
          { label: pageCopy.stats.primaryOutput, value: pageCopy.stats.lifeCurve },
          { label: pageCopy.stats.dimensions, value: '5' },
          { label: pageCopy.stats.mode, value: pageCopy.stats.aiOptional },
        ]}
      />

      <TrustStrip items={[...copy.trustItems]} />

      <LandingSection
        id="fortune-form"
        eyebrow={copy.form.eyebrow}
        title={copy.form.title}
        description={copy.form.description}
      >
        <ModuleInputShell
          eyebrow={pageCopy.shell.eyebrow}
          title={pageCopy.shell.title}
          description={pageCopy.shell.description}
          footer={pageCopy.shell.footer}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">{pageCopy.fields.birthDate}</span>
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">{pageCopy.fields.birthTime}</span>
              <input
                type="time"
                value={birthTime}
                onChange={(event) => setBirthTime(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">{pageCopy.fields.gender}</span>
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              >
                <option value="unspecified">{pageCopy.fields.unspecified}</option>
                <option value="male">{pageCopy.fields.male}</option>
                <option value="female">{pageCopy.fields.female}</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">{pageCopy.fields.language}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as 'zh' | 'en')}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              >
                <option value="zh">ZH</option>
                <option value="en">EN</option>
              </select>
            </label>
          </div>

          {error && (
            <p className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && !loadingAI ? pageCopy.loading.generate : copy.primaryCta}
            </button>
            <button
              onClick={() => {
                setLoadingAI(true);
                handleGenerate(true);
              }}
              disabled={loading}
              className="rounded-full border border-amber-300/40 bg-amber-300/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingAI ? pageCopy.loading.ai : pageCopy.fields.deepReading}
            </button>
          </div>
        </ModuleInputShell>
      </LandingSection>

      <ScrollNarrativeSection
        blocks={pageCopy.narrative}
      />

      {data ? (
        <>
          <LandingSection
            eyebrow={pageCopy.result.eyebrow}
            title={pageCopy.result.title}
            description={pageCopy.result.description}
          >
            <ResultScaffold
            eyebrow={pageCopy.result.currentPhase}
            title={data.currentPhase}
            summary={pageCopy.result.summary(data.currentAge, data.summary)}
            highlights={[
              { label: pageCopy.result.highlights.best, value: data.bestPeriods.slice(0, 2).join(' / ') || pageCopy.result.highlights.waiting },
              {
                label: pageCopy.result.highlights.pressure,
                value: data.challengingPeriods.slice(0, 2).join(' / ') || pageCopy.result.highlights.safe,
              },
              { label: pageCopy.result.highlights.ai, value: data.aiInterpretation ? pageCopy.result.highlights.aiOn : pageCopy.result.highlights.aiOff },
            ]}
            details={
              <div className="space-y-6">
                <LifeChart data={data.fortuneCycles} language={language} />

                {data.aiInterpretation && (
                  <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/[0.06] p-5">
                    <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-amber-200/70">
                      {pageCopy.result.aiTitle}
                    </h3>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-white/72">{data.aiInterpretation}</p>
                    {data.disclaimer && <p className="mt-4 text-xs text-white/36">{data.disclaimer}</p>}
                    {data.aiMeta && (
                      <p className="mt-3 text-xs text-white/28">
                        {data.aiMeta.provider} / {data.aiMeta.model} / {data.aiMeta.latencyMs}ms
                      </p>
                    )}
                  </div>
                )}

                {data.aiError && (
                  <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200">
                    {pageCopy.result.aiFailed}: {data.aiError}
                  </div>
                )}

                <div className="overflow-x-auto rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-white/36">
                        <th className="py-3">{pageCopy.result.table.phase}</th>
                        <th className="py-3 text-center">{pageCopy.result.table.age}</th>
                        <th className="py-3 text-center">{pageCopy.result.table.overall}</th>
                        <th className="py-3 text-center">{pageCopy.result.table.career}</th>
                        <th className="py-3 text-center">{pageCopy.result.table.wealth}</th>
                        <th className="py-3 text-center">{pageCopy.result.table.love}</th>
                        <th className="py-3 text-center">{pageCopy.result.table.health}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fortuneCycles.map((phase) => (
                        <tr key={`${phase.ageStart}-${phase.ageEnd}`} className="border-b border-white/[0.06]">
                          <td className="py-3 text-white/75">{isZH ? phase.phase : phase.phaseEn}</td>
                          <td className="py-3 text-center text-white/45">
                            {phase.ageStart}-{phase.ageEnd}
                          </td>
                          <td className="py-3 text-center font-semibold text-amber-100">{phase.overall}</td>
                          <td className="py-3 text-center text-white/62">{phase.career}</td>
                          <td className="py-3 text-center text-white/62">{phase.wealth}</td>
                          <td className="py-3 text-center text-white/62">{phase.love}</td>
                          <td className="py-3 text-center text-white/62">{phase.health}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
            aside={
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">{pageCopy.result.asideEyebrow}</p>
                  <p className="mt-3 text-lg font-serif text-white/82">
                    {pageCopy.result.asideTitle}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-violet-300/20 bg-violet-300/[0.06] p-5 text-sm leading-6 text-white/58">
                  {pageCopy.result.asideBody}
                </div>
              </div>
            }
            />
          </LandingSection>

          <ShareSection
            ogBgSrc="/assets/images/og/fortune-og-bg-1200x630.jpg"
            title={pageCopy.share.title}
            subtitle={pageCopy.share.subtitle}
          >
            <div className="mx-auto max-w-md">
              <SharePanel
                serviceType="fortune"
                resultId="life-chart"
                shareUrl="https://tianji.global/fortune"
              />
            </div>
          </ShareSection>
        </>
      ) : (
        <LandingSection
          eyebrow={pageCopy.preview.eyebrow}
          title={pageCopy.preview.title}
          description={pageCopy.preview.description}
        >
          <InsightGrid
            title={pageCopy.preview.gridTitle}
            subtitle={pageCopy.preview.gridSubtitle}
            items={pageCopy.preview.items}
          />
        </LandingSection>
      )}
    </main>
  );
}
