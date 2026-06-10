import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';
import { Sparkles } from 'lucide-react';

type PageParams = { params: Promise<{ locale: string }> };

const copy = {
  en: {
    title: 'How to Make Him Regret Losing Me',
    description: 'Discover personalized cosmic guidance for your relationship situation. Get clarity on what the universe has planned for your love life.',
    cta: 'Get My Free Reading',
    paidCta: 'Unlock Full Report — $4.99',
    howWorks: 'How it works',
    steps: [
      'Enter your birth details',
      'Receive your personalized cosmic reading',
      'Get clarity on your next best step',
    ],
    faq: [
      { q: 'How accurate is this reading?', a: 'Our readings combine ancient divination systems with modern AI analysis, personalized based on your unique birth chart.' },
      { q: 'Is my information kept private?', a: 'Yes. All data is encrypted and never shared. Your birth details are used solely for generating your personalized reading.' },
      { q: 'Can I get a full detailed report?', a: 'Yes. Upgrade to our Deep Love Report ($19.99) for a complete 8-module analysis covering every dimension of your relationship.' },
    ],
  },
  'zh-CN': {
    title: '爱情关系解析',
    description: '获取你的专属爱情关系解读，揭示命运与情感真相。',
    cta: '获取免费解读',
    paidCta: '解锁完整报告 — $4.99',
    howWorks: '如何使用',
    steps: ['输入你的出生信息', '接收个性化宇宙解读', '获得下一步的清晰指引'],
    faq: [
      { q: '这个解读有多准确？', a: '我们的解读结合古老占卜系统与现代AI分析，结果根据你的独特出生星图个性化生成。' },
      { q: '我的信息会保密吗？', a: '是的。所有数据都经过加密且绝不分享。' },
      { q: '可以获得详细的完整报告吗？', a: '是的。升级到深度爱情报告（$19.99）获取完整8模块分析。' },
    ],
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};
  const t = copy[locale as keyof typeof copy];
  return buildLocalizedMetadata({ locale, path: '/how-to-make-him-regret-losing-me', title: t.title, description: t.description });
}

export default async function Page({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = copy[locale as keyof typeof copy];

  return (
    <main className="min-h-screen bg-[#050508] text-white">
      <section className="relative mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/08 px-4 py-2">
          <Sparkles className="h-4 w-4 text-[#d8b77b]" />
          <span className="text-xs font-medium tracking-widest text-[#d8b77b]">FREE LOVE READING</span>
        </div>
        <h1 className="font-serif text-5xl leading-tight text-[#ffe3b4] sm:text-6xl">{t.title}</h1>
        <p className="mt-6 text-lg text-white/62">{t.description}</p>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link href={getLocalizedPath(locale, '/love-reading')} className="inline-flex items-center gap-2 rounded-full bg-[rgba(212,175,119)] px-8 py-4 text-sm font-semibold text-black transition hover:bg-[rgba(232,195,139)]">
            {t.cta}
          </Link>
          <Link href={getLocalizedPath(locale, '/pricing')} className="text-xs text-white/38 hover:text-[#d8b77b]">
            {t.paidCta}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <h2 className="mb-10 text-center font-serif text-2xl text-[#ffe3b4]">{t.howWorks}</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {t.steps.map((step, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center">
              <div className="mb-4 text-3xl font-semibold text-[rgba(212,175,119)]">{i + 1}</div>
              <p className="text-sm text-white/62">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <h2 className="mb-10 text-center font-serif text-2xl text-[#ffe3b4]">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {t.faq.map((item, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-sm font-semibold text-[#d8b77b]">{item.q}</h3>
              <p className="mt-2 text-sm text-white/62">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap justify-center gap-3">
          {["will-my-ex-come-back", "does-my-ex-still-love-me", "should-i-text-my-ex", "how-to-get-over-my-ex"].map((s) => (
            <Link key={s} href={getLocalizedPath(locale, `/${s}`)} className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/50 hover:border-[#d8b77b] hover:text-[#d8b77b]">
              {s.replace(/-/g, ' ')}
            </Link>
          ))}
        </div>
      </section>

      <section className="pb-20 text-center">
        <Link href={getLocalizedPath(locale, '/')} className="text-sm text-white/38 hover:text-white/62">
          ← Back to Tianji Love
        </Link>
      </section>
    </main>
  );
}