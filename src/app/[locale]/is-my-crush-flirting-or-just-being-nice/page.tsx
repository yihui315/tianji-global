import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata, articleSchema } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales } from '@/lib/i18n';

type PageParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};
  return buildLocalizedMetadata({
    locale,
    path: '/is-my-crush-flirting-or-just-being-nice',
    title: 'Is My Crush Flirting or Just Being Friendly?',
    description: 'Confused by mixed signals? Learn the subtle signs of genuine romantic interest versus friendly behavior.',
    type: 'article',
    publishedTime: '2025-06-10T00:00:00Z',
    authors: ['TianJi Love'],
  });
}

const t = {
  en: {
    title: 'Is My Crush Flirting or Just Being Friendly?',
    subtitle: 'Confused by mixed signals? Learn the subtle signs of genuine romantic interest versus friendly behavior.',
    cta: 'Get Your Personal Reading',
    ctaLink: '/love-reading',
    moreTitle: 'Explore More',
    moreLinks: [
      { label: 'Daily Love Oracle', href: '/daily-oracle' },
      { label: 'Does My Ex Still Love Me?', href: '/does-my-ex-still-love-me' },
      { label: 'Love Compatibility Reading', href: '/love-reading' },
      { label: 'View All Readings', href: '/pricing' },
    ],
  },
  'zh-CN': {
    title: 'Is My Crush Flirting or Just Being Friendly?',
    subtitle: 'Confused by mixed signals? Learn the subtle signs of genuine romantic interest versus friendly behavior.',
    cta: '获取个人解读',
    ctaLink: '/love-reading',
    moreTitle: '探索更多',
    moreLinks: [
      { label: '每日爱情签', href: '/daily-oracle' },
      { label: '前任还爱我吗？', href: '/does-my-ex-still-love-me' },
      { label: '爱情兼容性解读', href: '/love-reading' },
      { label: '查看所有解读', href: '/pricing' },
    ],
  },
};

export default async function mycrushflirtingorjustbeingnicePage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const c = t[locale as keyof typeof t];
  const schema = articleSchema({
    title: c.title,
    description: c.subtitle,
    url: `https://tianji.love/${locale}/is-my-crush-flirting-or-just-being-nice`,
    publishedTime: '2025-06-10T00:00:00Z',
    locale,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
      <main className="min-h-screen bg-[#050508] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-xs text-white/40">
            <Link href={getLocalizedPath('/', locale)} className="hover:text-[#d8b77b]">TianJi</Link>
            <span className="mx-2">/</span>
            <span className="text-white/60">Love Reading</span>
          </nav>

          <div className="mb-3 text-xs font-medium tracking-widest text-[#d8b77b]/70 uppercase">Astrology & Love</div>
          <h1 className="font-serif text-4xl text-[#ffe3b4] sm:text-5xl">{c.title}</h1>
          <p className="mt-5 text-lg text-white/60 leading-relaxed">{c.subtitle}</p>

          <div className="mt-10 rounded-2xl bg-gradient-to-b from-[#1a1215] to-[#0d0a0c] border border-[#d8b77b]/20 p-8 text-center">
            <p className="text-sm text-white/60">Ready for personalized insights?</p>
            <Link href={getLocalizedPath(c.ctaLink, locale)}
              className="mt-4 inline-block rounded-full bg-[#d8b77b] px-8 py-3 text-sm font-medium text-[#0a0812] hover:bg-[#e8c98b] transition-colors">
              {c.cta}
            </Link>
          </div>

          <section className="mt-12">
            <h2 className="font-serif text-xl text-[#ffe3b4]">{c.moreTitle}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {c.moreLinks.map((link) => (
                <Link key={link.href} href={getLocalizedPath(link.href, locale)}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/60 hover:border-[#d8b77b]/40 hover:text-[#d8b77b]">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
