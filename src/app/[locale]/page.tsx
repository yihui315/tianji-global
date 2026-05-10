import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';

type PageParams = {
  params: Promise<{ locale: string }>;
};

type HomeCopy = {
  title: string;
  description: string;
  promise: string[];
  primaryCta: string;
  secondaryCta: string;
  footnote: string;
  steps: string[];
  eyebrow: string;
};

const copy = {
  en: {
    eyebrow: 'Private cosmic relationship reading',
    title: 'Love is the one force that bends fate.',
    description:
      'Discover your romantic patterns, emotional timing, and relationship compatibility through a private cosmic reading designed for modern love.',
    promise: ['Discover patterns.', 'Understand timing.', 'Make clearer relationship choices.'],
    primaryCta: 'Start a free love reading',
    secondaryCta: 'View pricing',
    footnote: 'Private by design. Birth details are never placed in share URLs.',
    steps: [
      'Share only the birth context needed for the reading.',
      'Receive a free teaser with reflective relationship themes.',
      'Unlock deeper sections when you are ready.',
    ],
  },
  'zh-CN': {
    eyebrow: '私密的关系洞察',
    title: '爱，是唯一能改变命运的变量。',
    description: '通过私密的 TianJi Love 关系报告，理解你的情感模式、关系节奏与相处选择。',
    promise: ['发现情感模式。', '理解关系节奏。', '做出更清晰的相处选择。'],
    primaryCta: '开始免费关系洞察',
    secondaryCta: '查看价格',
    footnote: '默认保护隐私。出生资料不会出现在分享链接中。',
    steps: ['只提交生成报告所需的最少出生信息。', '先获得一份免费的关系主题预览。', '准备好后再解锁更完整的深度章节。'],
  },
} satisfies Record<Locale, HomeCopy>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  return buildLocalizedMetadata({
    locale,
    path: '/',
    title: locale === 'zh-CN' ? 'TianJi Love | 私密关系洞察' : 'TianJi Love | Private Cosmic Love Reading',
    description: copy[locale].description,
  });
}

export default async function LocalizedHomePage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = copy[locale];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(244,114,182,0.24),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(212,175,119,0.18),transparent_28%),linear-gradient(180deg,#050508,#120712_62%,#050508)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8">
        <nav className="flex items-center justify-between text-sm text-white/62">
          <Link href={getLocalizedPath(locale, '/')} className="font-semibold tracking-[0.18em] text-white">
            TianJi Love
          </Link>
          <div className="flex gap-3">
            {locales.map((item) => (
              <Link
                key={item}
                href={getLocalizedPath(item, '/')}
                className={item === locale ? 'text-[rgb(252,230,191)]' : 'hover:text-white'}
              >
                {item}
              </Link>
            ))}
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1fr_0.8fr] lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(252,230,191)]">{t.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{t.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={getLocalizedPath(locale, '/love-reading/result/demo')}
                className="rounded-full border border-[rgba(212,175,119,0.5)] bg-[rgb(212,175,119)] px-6 py-3 text-sm font-semibold text-black shadow-[0_20px_70px_rgba(212,175,119,0.28)]"
              >
                {t.primaryCta}
              </Link>
              <Link
                href={getLocalizedPath(locale, '/pricing')}
                className="rounded-full border border-white/16 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white/82 hover:border-white/34 hover:text-white"
              >
                {t.secondaryCta}
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/46">{t.footnote}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)]">
            <div className="grid gap-3">
              {t.promise.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-lg text-white/88">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4 text-sm leading-7 text-white/62">
              {t.steps.map((step, index) => (
                <p key={step}>
                  <span className="mr-3 text-[rgb(252,230,191)]">0{index + 1}</span>
                  {step}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
