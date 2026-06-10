import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';

type PageParams = {
  params: Promise<{ locale: string }>;
};

type PricingCopy = {
  title: string;
  description: string;
  cta: string;
  plans: Array<{
    name: string;
    price: string;
    description: string;
    badge?: string;
    modules?: string[];
  }>;
};

const copy = {
  en: {
    title: 'Simple one-time pricing for modern love readings',
    description:
      'Start free, then unlock deeper self-reflection and relationship guidance only when it feels useful.',
    cta: 'Begin free',
    plans: [
      {
        name: 'Solo love report',
        price: '$4.99',
        description: 'A private reflection on romantic patterns, emotional timing, and relationship choices.',
      },
      {
        name: 'Compatibility report',
        price: '$12.99',
        description: 'A two-person relationship reading focused on patterns, tension, and repair.',
      },
      {
        name: 'Deep Love Report',
        price: '$19.99',
        badge: 'Most complete',
        description:
          'A full 8-module premium relationship reading covering energy, feelings, blockages, timing, next steps, compatibility, karma, and communication.',
        modules: [
          'Relationship Energy — overall energy signature and dominant themes',
          'Partner Feelings — inner emotional world of your partner',
          'Blockages — hidden patterns blocking forward movement',
          'Timing Guidance — when conditions align for milestones',
          'Next Step — concrete next step to move forward',
          'Compatibility Score — calibrated signal with narrative',
          'Karmic Pattern — recurring soul-level patterns',
          'Communication Style — dominant style and how to adapt',
        ],
      },
      {
        name: 'Gift report',
        price: '$9.99',
        description: 'A one-time report credit you can send to someone who wants thoughtful relationship insight.',
      },
    ],
  },
  'zh-CN': {
    title: '面向现代关系洞察的一次性价格',
    description: '先免费体验，在真正需要时再解锁更深层的自我反思与关系建议。',
    cta: '先免费开始',
    plans: [
      {
        name: '个人爱情报告',
        price: '$4.99',
        description: '围绕情感模式、关系节奏与相处选择的私密报告。',
      },
      {
        name: '关系合盘报告',
        price: '$12.99',
        description: '面向两个人的关系模式、张力与修复建议。',
      },
      {
        name: '深度爱情报告',
        price: '$19.99',
        badge: '最完整',
        description:
          '8个模块的深度关系解读：能量、共情、阻碍、时机、下一步、合盘、业力、沟通。',
        modules: [
          '关系能量 — 整体能量签名与主导主题',
          '伴侣感受 — 伴侣内心的情感世界',
          '阻碍因素 — 阻碍关系进展的隐藏模式',
          '时机指引 — 何时条件会对齐',
          '下一步行动 — 推动关系的具体步骤',
          '合盘指数 — 数值化信号与叙事解读',
          '业力模式 — 反复出现的灵魂层面模式',
          '沟通风格 — 主导风格与适应方式',
        ],
      },
      {
        name: '礼物报告',
        price: '$9.99',
        description: '一次性报告额度，适合送给想认真理解关系的人。',
      },
    ],
  },
} satisfies Record<Locale, PricingCopy>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  return buildLocalizedMetadata({
    locale,
    path: '/pricing',
    title: locale === 'zh-CN' ? 'TianJi Love 价格' : 'TianJi Love Pricing',
    description: copy[locale].description,
  });
}

export default async function PricingPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href={getLocalizedPath(locale, '/')} className="text-sm text-white/58 hover:text-white">
          TianJi Love
        </Link>
        <section className="py-14">
          <h1 className="max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">{t.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">{t.description}</p>
          <Link
            href={getLocalizedPath(locale, '/love-reading/result/demo')}
            className="mt-8 inline-flex rounded-full bg-[rgb(212,175,119)] px-6 py-3 text-sm font-semibold text-black"
          >
            {t.cta}
          </Link>
        </section>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.plans.map(({ name, price, badge, description, modules }) => (
            <article key={name} className="rounded-3xl border border-white/10 bg-white/[0.055] p-6">
              {badge && (
                <div className="mb-3 inline-block rounded-full bg-[rgba(212,175,119,0.15)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-[rgba(212,175,119,0.9)]">
                  {badge}
                </div>
              )}
              <h2 className="text-xl font-semibold text-white">{name}</h2>
              <p className="mt-4 font-serif text-4xl text-[rgb(252,230,191)]">{price}</p>
              <p className="mt-5 text-sm leading-7 text-white/62">{description}</p>
              {modules && modules.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {modules.map((mod) => (
                    <li key={mod} className="flex gap-2 text-xs text-white/50">
                      <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-[rgba(212,175,119,0.7)]" />
                      <span>{mod}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
