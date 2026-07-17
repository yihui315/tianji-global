import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MessageCircleHeart, ShieldCheck, Sparkles, Timer, type LucideIcon } from 'lucide-react';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';

type PageParams = {
  params: Promise<{ locale: string }>;
};

type LoveReadingFeature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

type LoveReadingCta = {
  primary: string;
  secondary: string;
  note: string;
};

type LoveReadingPageCopy = {
  metadataTitle: string;
  metadataDescription: string;
  back: string;
  eyebrow: string;
  title: string;
  description: string;
  cardTitle: string;
  samplePrompt: string;
  privacyLabel: string;
  privacyBody: string;
};

const pageCopy: Record<Locale, LoveReadingPageCopy> = {
  en: {
    metadataTitle: 'Love Reading - Tianji Love',
    metadataDescription:
      "Get clarity on the question you can't stop replaying with a private relationship reading.",
    back: 'Back to home',
    eyebrow: 'Love Reading',
    title: "Get clarity on the question you can't stop replaying.",
    description: 'Enter both birth dates for a private compatibility and timing preview before you decide the next step.',
    cardTitle: 'Start Your Love Reading',
    samplePrompt: 'Want to see what a report looks like first?',
    privacyLabel: 'Privacy',
    privacyBody:
      'We use only birth dates for analysis. No birth times, locations, or private questions are stored by this preview flow.',
  },
  'zh-CN': {
    metadataTitle: '关系解读 - Tianji Love',
    metadataDescription:
      '把你反复想不明白的那段关系，交给天机解读一次。',
    back: '返回首页',
    eyebrow: '关系解读',
    title: '把你反复想不明白的那段关系，交给天机解读一次。',
    description: '输入双方生日，先获得一份私密的兼容性与时机预览，再决定下一步。',
    cardTitle: '开始关系解读',
    samplePrompt: '想先看看报告的样子？',
    privacyLabel: '隐私',
    privacyBody:
      '本预览流程仅使用出生日期进行分析，不存储出生时间、出生地点或私人问题。',
  },
};

const features: Record<Locale, LoveReadingFeature[]> = {
  en: [
    {
      icon: MessageCircleHeart,
      title: 'Compatibility Themes',
      desc: 'Five relationship dimensions: attraction, communication, conflict, rhythm, and long-term alignment.',
    },
    {
      icon: Sparkles,
      title: 'Relationship Archetype',
      desc: 'Discover a reflective pattern for the relationship without treating it as a fixed outcome.',
    },
    {
      icon: Timer,
      title: 'Timing Preview',
      desc: 'See a gentle 30-day timing lens for connection, communication, and clearer choices.',
    },
    {
      icon: ShieldCheck,
      title: 'Privacy Protected',
      desc: 'Birth dates only. No names, locations, birth times, or private questions are required here.',
    },
  ],
  'zh-CN': [
    {
      icon: MessageCircleHeart,
      title: '兼容主题',
      desc: '从吸引、沟通、冲突、节奏和长期契合五个维度理解关系。',
    },
    {
      icon: Sparkles,
      title: '关系原型',
      desc: '用反思视角理解你们的关系模式，而不是把它当成固定结论。',
    },
    {
      icon: Timer,
      title: '时机预览',
      desc: '用温和的 30 天视角观察连接、沟通与选择时机。',
    },
    {
      icon: ShieldCheck,
      title: '隐私保护',
      desc: '这里只需要出生日期，不要求姓名、地点、出生时间或私人问题。',
    },
  ],
};

const ctas: Record<Locale, LoveReadingCta> = {
  en: {
    primary: 'Get clarity now',
    secondary: 'See sample report',
    note: 'Free preview includes: overall score, archetype, top 2 dimensions, and shareable summary.',
  },
  'zh-CN': {
    primary: '交给天机解读一次',
    secondary: '查看示例报告',
    note: '免费预览包括：综合评分、关系原型、两个核心维度和可分享摘要。',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const copy = pageCopy[locale];

  return buildLocalizedMetadata({
    locale,
    path: '/love-reading',
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  });
}

export default async function LoveReadingPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  const copy = pageCopy[locale];
  const featureItems = features[locale];
  const cta = ctas[locale];
  const relationshipHref = `/relationship/new?lang=${locale === 'zh-CN' ? 'zh' : 'en'}`;

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href={getLocalizedPath(locale, '/')}
          className="mb-8 inline-flex items-center gap-2 text-sm text-white/58 hover:text-white"
        >
          &lt;- {copy.back}
        </Link>

        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/8 px-4 py-2 text-sm text-[#f4d7a3]">
            <Sparkles className="h-4 w-4" />
            {copy.eyebrow}
          </div>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[#ffe3b4] sm:text-5xl">
            {copy.title}
          </h1>
          <p className="text-lg text-[#f4d7a3]/70">{copy.description}</p>
        </div>

        <div className="mb-10 rounded-2xl border border-[#d8b77b]/24 bg-gradient-to-b from-[#1a1209] to-[#0d0b07] p-8 text-center">
          <h2 className="mb-2 text-2xl font-semibold text-[#ffe3b4]">{copy.cardTitle}</h2>
          <p className="mb-6 text-sm text-[#f4d7a3]/60">{cta.note}</p>
          <Link
            href={relationshipHref}
            className="inline-block rounded-full bg-[#ff6c73] px-8 py-4 text-base font-semibold text-white transition hover:bg-[#ff6c73]/90"
          >
            {cta.primary}
          </Link>
        </div>

        <div className="mb-10 grid gap-6 sm:grid-cols-2">
          {featureItems.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-[#d8b77b]/16 bg-[#ffffff]/04 p-5"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6c73]/14 text-[#ff9c8b]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-base font-semibold text-[#ffe3b4]">{title}</h3>
              <p className="text-sm text-[#f4d7a3]/60">{desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="mb-4 text-sm text-[#f4d7a3]/50">{copy.samplePrompt}</p>
          <Link
            href={relationshipHref}
            className="text-sm text-[#d8b77b] underline hover:text-[#f4d7a3]"
          >
            {cta.secondary} -&gt;
          </Link>
        </div>

        <div className="mt-12 rounded-xl border border-[#d8b77b]/12 bg-[#ffffff]/03 p-5">
          <p className="mb-2 text-center text-xs uppercase tracking-widest text-[#d8b77b]/60">
            {copy.privacyLabel}
          </p>
          <p className="text-center text-xs text-[#f4d7a3]/40">{copy.privacyBody}</p>
        </div>
      </div>
    </main>
  );
}
