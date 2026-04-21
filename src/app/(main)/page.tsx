'use client';

import Link from 'next/link';
import LifeChart, { type FortunePoint } from '@/components/charts/LifeChart';
import {
  BackgroundVideoHero,
  LandingSection,
  TrustStrip,
} from '@/components/landing';

const coreModules = [
  {
    href: '/ziwei',
    label: 'Zi Wei',
    title: 'Palace-level destiny structure',
    description: 'Twelve palaces, major stars, and an elegant chart-first reading flow.',
    video: '/assets/videos/cards/ziwei-card-preview-3s-768p.mp4',
  },
  {
    href: '/bazi',
    label: 'BaZi',
    title: 'Four pillars and elemental rhythm',
    description: 'Day master, five elements, ten gods, and AI interpretation in one premium surface.',
    video: '/assets/videos/cards/bazi-card-preview-3s-768p.mp4',
  },
  {
    href: '/yijing',
    label: 'Yi Jing',
    title: 'Question-driven oracle',
    description: 'Hexagram casting and line interpretation, presented as a focused decision ritual.',
    video: '/assets/videos/cards/yijing-card-preview-3s-768p.mp4',
  },
  {
    href: '/tarot',
    label: 'Tarot',
    title: 'Card spread and AI synthesis',
    description: 'Single card, three-card, and Celtic Cross spreads with share-ready output.',
    video: '/assets/videos/cards/tarot-card-preview-3s-768p.mp4',
  },
  {
    href: '/western',
    label: 'Western',
    title: 'Natal chart observatory',
    description: 'Big Three, planetary positions, and AstroChart visualization stay intact.',
    video: '/assets/videos/cards/western-card-preview-3s-768p.mp4',
  },
  {
    href: '/fortune',
    label: 'Fortune',
    title: 'Life K-line timing curve',
    description: 'Career, wealth, love, health, and timing windows as a cinematic life curve.',
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
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <BackgroundVideoHero
        eyebrow="TianJi Global"
        title="A luxury AI destiny platform for people who want timing, not noise."
        subtitle="AI Destiny Scan / Zi Wei / BaZi / Yi Jing / Tarot / Western Astrology"
        description="TianJi turns multiple metaphysical systems into a premium reading journey: emotional entry, structured result, shareable output, and a unified destiny profile over time."
        videoSrc="/assets/videos/hero/home-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/home-hero-poster-16x9.jpg"
        ctaLabel="Start AI Destiny Scan"
        ctaHref="/destiny/scan"
        secondaryCtaLabel="Explore modules"
        secondaryCtaHref="#modules"
        stats={[
          { label: 'Core modules', value: '6' },
          { label: 'Primary funnel', value: 'Scan' },
          { label: 'Output style', value: 'Shareable' },
        ]}
      />

      <LandingSection
        id="modules"
        eyebrow="Module showcase"
        title="Six entry points. One premium visual language."
        description="Each module keeps its original route and backend contract, but now opens inside a consistent deep-space narrative shell."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {coreModules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] transition duration-500 hover:-translate-y-1 hover:border-amber-200/35"
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.22),transparent_42%),linear-gradient(180deg,rgba(10,10,10,0.1),rgba(10,10,10,0.88))]" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-amber-100/55">{module.label}</p>
                  <h2 className="mt-5 max-w-xs font-serif text-3xl text-white/92">{module.title}</h2>
                </div>
                <div>
                  <p className="text-sm leading-7 text-white/58">{module.description}</p>
                  <p className="mt-5 text-xs uppercase tracking-[0.22em] text-white/35">Open {module.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="LifeChart preview"
        title="The fortune curve becomes the visual spine."
        description="Fortune is more than a module. It becomes the homepage proof layer for timing, momentum, and premium interpretation."
      >
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-white/35">Timing layer</p>
            <h2 className="mt-4 font-serif text-4xl text-white/90">Your path has pressure windows and expansion windows.</h2>
            <p className="mt-5 text-sm leading-7 text-white/58">
              The upgraded homepage points users toward the revenue funnel first, then lets module exploration feel like evidence instead of clutter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/fortune"
                className="rounded-full border border-amber-300/35 bg-amber-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100"
              >
                Open fortune curve
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/72"
              >
                View premium
              </Link>
            </div>
          </div>
          <LifeChart data={previewCurve} language="en" className="min-h-[420px]" />
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="Trust"
        title="Mystical, but structured."
        description="The redesign keeps the product grounded: clear forms, visible disclaimers, privacy-safe sharing, and upgrade paths that do not hide the basic result."
      >
        <TrustStrip
          eyebrow="Product safeguards"
          items={[
            { label: 'Business logic preserved', description: 'API routes, Stripe, Supabase, and auth flows are outside this visual pass.' },
            { label: 'Privacy-safe sharing', description: 'Public share surfaces remain constrained by the existing safeguards.' },
            { label: 'One dominant funnel', description: 'AI Destiny Scan leads to result, unlock, sharing, and repeat use.' },
            { label: 'Responsive first', description: 'The premium layout uses large negative space without breaking mobile forms.' },
          ]}
        />
      </LandingSection>

      <LandingSection
        eyebrow="Premium"
        title="Unlock the deeper layer when the partial result creates belief."
        description="Pricing is not a separate island. It is the continuation of the destiny scan result and module reading journey."
      >
        <div className="rounded-[2.5rem] border border-amber-300/20 bg-[radial-gradient(circle_at_20%_0%,rgba(212,175,55,0.18),transparent_40%),rgba(255,255,255,0.035)] p-8 text-center shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
          <p className="text-xs uppercase tracking-[0.28em] text-amber-100/55">Conversion path</p>
          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl text-white/92 md:text-5xl">
            Start with a scan. Upgrade when the missing turning point matters.
          </h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/destiny/scan"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-100"
            >
              Start scan
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/78 transition hover:border-amber-200/40"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </LandingSection>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-xs uppercase tracking-[0.24em] text-white/30">
        TianJi Global / AI destiny platform / visual redesign preview
      </footer>
    </main>
  );
}
