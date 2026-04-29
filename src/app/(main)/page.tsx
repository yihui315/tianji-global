'use client';

import Link from 'next/link';
import LifeChart, { type FortunePoint } from '@/components/charts/LifeChart';
import {
  BackgroundVideoHero,
  LandingSection,
  TrustStrip,
} from '@/components/landing';
import { TestimonialCard } from '@/components/ui';

/**
 * 首页 — "看清你正处在哪个人生阶段"
 *
 * 文案 P0 改造（来自研究报告 deep-research-report v5）：
 *   定位从"能力导向"改为"问题导向"
 *   信任锚点：先算准，再解读；AI 只解释不猜盘
 *   路径：先免费体验 → 注册保存 → 升级深读
 *   首屏 stats 改成"排盘 / AI / 数据"三段信任短句
 */

const coreModules = [
  {
    href: '/bazi',
    label: '八字',
    title: '看底层气质与阶段节律',
    description: '四柱、五行、十神，看你擅长的路径与人生里的天然推力。',
    glyph: '☯',
    video: '/assets/videos/cards/bazi-card-preview-3s-768p.mp4',
  },
  {
    href: '/ziwei',
    label: '紫微',
    title: '看人生展开方式',
    description: '十二宫、主星、四化，看关键转折与宫位之间的命运结构。',
    glyph: '✦',
    video: '/assets/videos/cards/ziwei-card-preview-3s-768p.mp4',
  },
  {
    href: '/yijing',
    label: '易经',
    title: '判断这件事该不该做',
    description: '六十四卦、爻辞、用神。适合带着具体一件事来求问与决策。',
    glyph: '䷀',
    video: '/assets/videos/cards/yijing-card-preview-3s-768p.mp4',
  },
  {
    href: '/tarot',
    label: '塔罗',
    title: '获得直觉型洞察',
    description: '单牌、三牌、凯尔特十字。适合在情绪、关系与选择上向内观看。',
    glyph: '⚝',
    video: '/assets/videos/cards/tarot-card-preview-3s-768p.mp4',
  },
  {
    href: '/western',
    label: '西方星盘',
    title: '看人格结构与年度主题',
    description: '本命盘、相位、宫位，使用 Swiss Ephemeris 真太阳时排盘。',
    glyph: '♋',
    video: '/assets/videos/cards/western-card-preview-3s-768p.mp4',
  },
  {
    href: '/fortune',
    label: '命运曲线',
    title: '看接下来的关键窗口',
    description: '事业、财富、爱情、健康拆成可视化的人生时机节律图。',
    glyph: '☾',
    video: '/assets/videos/cards/fortune-card-preview-3s-768p.mp4',
  },
];

const previewCurve: FortunePoint[] = [
  { ageStart: 0, ageEnd: 9, phase: '0-9', phaseEn: 'Foundation', overall: 48, career: 40, wealth: 35, love: 50, health: 72 },
  { ageStart: 10, ageEnd: 19, phase: '10-19', phaseEn: 'Awakening', overall: 58, career: 52, wealth: 44, love: 60, health: 70 },
  { ageStart: 20, ageEnd: 29, phase: '20-29', phaseEn: 'Search', overall: 64, career: 68, wealth: 55, love: 62, health: 66 },
  { ageStart: 30, ageEnd: 39, phase: '30-39', phaseEn: 'Ascent', overall: 78, career: 82, wealth: 76, love: 70, health: 63 },
  { ageStart: 40, ageEnd: 49, phase: '40-49', phaseEn: 'Authority', overall: 84, career: 86, wealth: 88, love: 74, health: 60 },
  { ageStart: 50, ageEnd: 59, phase: '50-59', phaseEn: 'Refinement', overall: 73, career: 76, wealth: 78, love: 72, health: 58 },
  { ageStart: 60, ageEnd: 69, phase: '60-69', phaseEn: 'Legacy', overall: 80, career: 70, wealth: 82, love: 84, health: 66 },
];

export default function HomePage() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <CosmicLayers />
      <BackgroundVideoHero
        eyebrow="天机全球 · TianJi Global"
        title="看清你正处在哪个人生阶段"
        subtitle="不是替你决定命运，而是帮你看清时机、关系与选择背后的结构"
        description='结合八字、紫微、易经、塔罗与西方星盘，用可解释的排盘逻辑与 AI 深度解读，把"我该怎么做"说得更具体。'
        videoSrc="/assets/videos/hero/home-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/home-hero-poster-16x9.jpg"
        ctaLabel="开始一次免费解读"
        ctaHref="/destiny/scan"
        secondaryCtaLabel="先看我的命盘结构"
        secondaryCtaHref="#modules"
        stats={[
          { label: '排盘', value: '真太阳时 / 天体历法' },
          { label: 'AI', value: '只解释，不猜盘' },
          { label: '数据', value: '可匿名 / 可删除' },
        ]}
      />

      <LandingSection
        id="modules"
        eyebrow="你现在最想看清什么"
        title="选你现在最需要的那一种解读"
        description='如果你还不知道从哪里开始，先从"最近最困扰你的问题"开始，而不是从"哪门术数最高级"开始。'
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {coreModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="module-card group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.40)] transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-[rgba(212,175,119,0.42)] hover:shadow-[0_40px_100px_rgba(0,0,0,0.55),0_0_60px_rgba(212,175,119,0.06)]"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-35"
              >
                <source src={module.video} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.22),transparent_42%),linear-gradient(180deg,rgba(10,10,10,0.1),rgba(10,10,10,0.92))]" />
              <span
                aria-hidden
                className="pointer-events-none absolute right-6 top-6 select-none font-serif text-[2.6rem] leading-none text-[rgba(212,175,119,0.16)] transition duration-500 group-hover:-translate-y-0.5 group-hover:-rotate-3 group-hover:text-[rgba(212,175,119,0.36)]"
              >
                {module.glyph}
              </span>
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[rgba(212,175,119,0.62)]">{module.label}</p>
                  <h2 className="mt-5 max-w-xs font-serif text-3xl text-white/92">{module.title}</h2>
                </div>
                <div>
                  <p className="text-sm leading-7 text-white/60">{module.description}</p>
                  <p className="mt-5 text-xs uppercase tracking-[0.22em] text-white/40">进入 {module.label} →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="时机层"
        title="为什么同样努力，节奏却总不一样"
        description="命运曲线把事业、财富、爱情、健康与时机窗口拆成可视化的人生节律。"
      >
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">阶段判断</p>
            <h2 className="mt-4 font-serif text-4xl text-white/90">
              你正处在哪个阶段，比&ldquo;命好不好&rdquo;更重要。
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/58">
              天机全球先完成排盘，再用 AI 把关键结构翻译成你能理解、能执行的建议——无论你想判断这份工作要不要换、这段关系为什么总在重复，还是今年是否适合做大决定。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/fortune"
                className="rounded-full border border-[rgba(212,175,119,0.32)] bg-[rgba(212,175,119,0.08)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[rgb(252,230,191)] transition hover:border-[rgba(212,175,119,0.55)]"
              >
                查看完整命运曲线
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-white/14 bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/78 transition hover:border-[rgba(212,175,119,0.45)] hover:text-white"
              >
                了解付费方案
              </Link>
            </div>
          </div>
          <LifeChart data={previewCurve} language="zh" className="min-h-[420px]" />
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="我们怎么让你能信"
        title="先算准，再解读"
        description="排盘与时间计算独立完成，AI 只负责把结构讲清楚。每一条结论都对应一处可指认的盘面依据。"
      >
        <TrustStrip
          eyebrow="可信机制"
          items={[
            {
              label: '规则引擎先算',
              description: '时间、历法、宫位、四柱、卦象、牌阵、相位都由确定性算法生成。',
            },
            {
              label: 'AI 只负责解释',
              description: '没有结构依据的内容不会进入最终报告，不会"猜盘"。',
            },
            {
              label: '边界与可控',
              description: '用于自我反思与时机判断，不替代医疗、法律、投资与心理危机处理。',
            },
            {
              label: '资料可删除',
              description: '出生资料是个人数据，你可以随时导出、删除、撤回授权。',
            },
          ]}
        />
      </LandingSection>

      <LandingSection
        eyebrow="用户之声 · Voices"
        title="真实使用者怎么说"
        description="以下为信任栏占位结构，正式上线后将替换为 beta 用户的真实反馈节选。我们不在产品页放置虚构的名字与故事。"
      >
        <div className="grid gap-6 md:grid-cols-3">
          <TestimonialCard
            quote="此处保留给真实 beta 用户的反馈。请勿替换为虚构内容。Reserved for a real beta-user quote."
            author="占位 · 待补充"
            location="Beta tester"
            avatar="✦"
          />
          <TestimonialCard
            quote="此处保留给真实 beta 用户的反馈。请勿替换为虚构内容。Reserved for a real beta-user quote."
            author="占位 · 待补充"
            location="Beta tester"
            avatar="☾"
          />
          <TestimonialCard
            quote="此处保留给真实 beta 用户的反馈。请勿替换为虚构内容。Reserved for a real beta-user quote."
            author="占位 · 待补充"
            location="Beta tester"
            avatar="☯"
          />
        </div>
        <p className="mt-6 text-center text-xs uppercase tracking-[0.24em] text-white/45">
          Authentic quotes only · 仅放真实引述
        </p>
      </LandingSection>

      <LandingSection
        eyebrow="进一步深读"
        title="先免费认识自己，再决定要不要深读"
        description="免费版给你一份结构摘要与一条核心建议；阶段深读适合正处在转折期的人；年度导航适合高频回访与未来 12 个月的窗口规划。"
      >
        <div className="rounded-[2.5rem] border border-[rgba(212,175,119,0.24)] bg-[radial-gradient(circle_at_18%_-10%,rgba(212,175,119,0.18),transparent_45%),radial-gradient(circle_at_80%_110%,rgba(124,58,237,0.18),transparent_50%),rgba(255,255,255,0.035)] p-8 text-center shadow-[0_50px_140px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(212,175,119,0.18)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(212,175,119,0.62)]">付费路径</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl text-white/95 md:text-5xl">
            可先预览报告结构，再决定升级；不会被强制年付。
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/destiny/scan"
              className="rounded-full bg-gradient-to-br from-[#f8e7c2] to-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#1a1208] shadow-[0_12px_30px_rgba(212,175,119,0.22),inset_0_1px_0_rgba(255,255,255,0.7)] transition hover:shadow-[0_16px_40px_rgba(212,175,119,0.32),inset_0_1px_0_rgba(255,255,255,0.7)]"
            >
              开始免费解读
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/14 bg-white/[0.04] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/78 transition hover:border-[rgba(212,175,119,0.45)] hover:text-white"
            >
              查看方案对比
            </Link>
          </div>
        </div>
      </LandingSection>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-xs text-white/35">
        <nav className="mb-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 uppercase tracking-[0.22em]">
          <Link href="/about" className="transition hover:text-[rgba(212,175,119,0.92)]">
            关于天机
          </Link>
          <span aria-hidden className="text-white/15">·</span>
          <Link href="/pricing" className="transition hover:text-[rgba(212,175,119,0.92)]">
            会员方案
          </Link>
          <span aria-hidden className="text-white/15">·</span>
          <Link href="/legal/privacy" className="transition hover:text-[rgba(212,175,119,0.92)]">
            隐私政策
          </Link>
          <span aria-hidden className="text-white/15">·</span>
          <Link href="/legal/terms" className="transition hover:text-[rgba(212,175,119,0.92)]">
            服务条款
          </Link>
          <span aria-hidden className="text-white/15">·</span>
          <a
            href="mailto:privacy@tianji.global?subject=%E8%AF%B7%E6%B1%82%E5%88%A0%E9%99%A4%E6%88%91%E7%9A%84%E5%A4%A9%E6%9C%BA%E8%B4%A6%E5%8F%B7%E4%B8%8E%E6%95%B0%E6%8D%AE"
            className="transition hover:text-[rgba(212,175,119,0.92)]"
          >
            数据删除
          </a>
        </nav>
        <p className="uppercase tracking-[0.24em] text-white/30">
          天机全球 · 用于自我理解与时机判断 · 不替代专业建议
        </p>
      </footer>
    </main>
  );
}

/**
 * 设计 token 对齐 .claude/skills：
 *   /floating-zodiac-particles —— 暖金 rgba(212,175,119) 星尘 + 浅紫 rgba(168,130,255) 黄道符号
 *   /create-mystic-vignette —— 椭圆径向暗角 0.78 强度
 *   /cosmic-breathing-wobble —— prefers-reduced-motion 自动禁用
 * 使用 fixed 层 + pointer-events:none，不影响 BackgroundVideoHero。
 */
function CosmicLayers() {
  return (
    <>
      <style>{`
        @keyframes tj-stardust-twinkle {
          0%   { opacity: 0.45; }
          100% { opacity: 0.92; }
        }
        @keyframes tj-zodiac-drift {
          0%   { transform: translate3d(0, 0, 0) rotate(0deg);     opacity: 0; }
          8%   {                                                     opacity: 1; }
          50%  { transform: translate3d(28px, -22px, 0) rotate(8deg); }
          92%  {                                                     opacity: 1; }
          100% { transform: translate3d(-12px, 18px, 0) rotate(-6deg); opacity: 0; }
        }

        .tj-stardust {
          background-image:
            radial-gradient(1.2px 1.2px at 12% 18%, rgba(212,175,119,0.55), transparent 50%),
            radial-gradient(1px 1px at 27% 33%, rgba(212,175,119,0.42), transparent 50%),
            radial-gradient(1.5px 1.5px at 41% 12%, rgba(212,175,119,0.50), transparent 50%),
            radial-gradient(1px 1px at 56% 47%, rgba(212,175,119,0.38), transparent 50%),
            radial-gradient(0.8px 0.8px at 63% 22%, rgba(212,175,119,0.55), transparent 50%),
            radial-gradient(1.2px 1.2px at 71% 7%, rgba(212,175,119,0.45), transparent 50%),
            radial-gradient(1px 1px at 84% 28%, rgba(212,175,119,0.50), transparent 50%),
            radial-gradient(1.4px 1.4px at 92% 16%, rgba(212,175,119,0.40), transparent 50%),
            radial-gradient(1px 1px at 9% 58%, rgba(212,175,119,0.40), transparent 50%),
            radial-gradient(1.2px 1.2px at 33% 71%, rgba(212,175,119,0.45), transparent 50%),
            radial-gradient(0.9px 0.9px at 49% 86%, rgba(212,175,119,0.42), transparent 50%),
            radial-gradient(1.4px 1.4px at 67% 64%, rgba(212,175,119,0.50), transparent 50%),
            radial-gradient(1px 1px at 79% 81%, rgba(212,175,119,0.40), transparent 50%),
            radial-gradient(1.3px 1.3px at 88% 92%, rgba(212,175,119,0.45), transparent 50%);
          background-size: 1200px 800px;
          animation: tj-stardust-twinkle 5.5s ease-in-out infinite alternate;
          opacity: 0.7;
        }
        .tj-zodiac span {
          position: absolute;
          color: rgba(168,130,255,0.085);
          font-size: 22px;
          user-select: none;
          animation: tj-zodiac-drift 90s linear infinite;
        }
        .tj-zodiac span:nth-child(odd) { color: rgba(212,175,119,0.075); }
        .tj-zodiac .z1  { top:  6%; left:  9%; font-size: 28px; animation-duration: 110s; }
        .tj-zodiac .z2  { top: 14%; left: 38%; font-size: 18px; animation-duration:  88s; animation-delay: -12s; }
        .tj-zodiac .z3  { top:  9%; left: 67%; font-size: 32px; animation-duration: 130s; animation-delay: -25s; }
        .tj-zodiac .z4  { top: 22%; left: 88%; font-size: 22px; animation-duration:  95s; animation-delay:  -8s; }
        .tj-zodiac .z5  { top: 38%; left: 16%; font-size: 26px; animation-duration: 115s; animation-delay: -33s; }
        .tj-zodiac .z6  { top: 44%; left: 52%; font-size: 18px; animation-duration:  82s; animation-delay:  -5s; }
        .tj-zodiac .z7  { top: 51%; left: 78%; font-size: 30px; animation-duration: 105s; animation-delay: -40s; }
        .tj-zodiac .z8  { top: 66%; left:  7%; font-size: 22px; animation-duration:  92s; animation-delay: -18s; }
        .tj-zodiac .z9  { top: 73%; left: 41%; font-size: 28px; animation-duration: 120s; animation-delay: -50s; }
        .tj-zodiac .z10 { top: 81%; left: 68%; font-size: 20px; animation-duration:  98s; animation-delay: -28s; }
        .tj-zodiac .z11 { top: 88%; left: 24%; font-size: 24px; animation-duration: 102s; animation-delay: -14s; }
        .tj-zodiac .z12 { top: 92%; left: 86%; font-size: 26px; animation-duration: 118s; animation-delay: -36s; }

        .tj-vignette {
          background:
            radial-gradient(ellipse 75% 70% at 50% 50%,
              transparent 0%,
              transparent 28%,
              rgba(8, 6, 22, 0.30) 58%,
              rgba(5, 5, 8, 0.65) 82%,
              rgba(0, 0, 0, 0.85) 100%);
          box-shadow:
            inset 0 0 220px 60px rgba(124, 58, 237, 0.08),
            inset 0 0 120px 30px rgba(212, 175, 119, 0.04);
          opacity: 0.55;
        }

        @media (prefers-reduced-motion: reduce) {
          .tj-stardust,
          .tj-zodiac span { animation: none !important; }
        }
        @media (max-width: 640px) {
          .tj-zodiac span { display: none; }
          .tj-vignette { opacity: 0.42; }
        }
      `}</style>
      <div
        aria-hidden
        className="tj-stardust pointer-events-none fixed inset-0 z-0"
      />
      <div
        aria-hidden
        className="tj-zodiac pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <span className="z1">♈</span>
        <span className="z2">♋</span>
        <span className="z3">✦</span>
        <span className="z4">♌</span>
        <span className="z5">♎</span>
        <span className="z6">⚝</span>
        <span className="z7">♓</span>
        <span className="z8">♉</span>
        <span className="z9">✧</span>
        <span className="z10">♊</span>
        <span className="z11">♏</span>
        <span className="z12">☆</span>
      </div>
      <div
        aria-hidden
        className="tj-vignette pointer-events-none fixed inset-0 z-0"
      />
    </>
  );
}
