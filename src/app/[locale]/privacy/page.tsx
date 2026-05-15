import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';

type PageParams = {
  params: Promise<{ locale: string }>;
};

type PrivacyCopy = {
  title: string;
  description: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
};

const copy = {
  en: {
    title: 'Privacy for personal relationship data',
    description:
      'TianJi Love keeps birth details out of share URLs, limits collection to what the reading needs, and supports export or deletion requests.',
    sections: [
      {
        title: 'Data we collect',
        body: 'Birth context and reading preferences are used to create relationship guidance.',
      },
      {
        title: 'How we protect it',
        body: 'Personal data belongs in private records, never public links or social previews.',
      },
      {
        title: 'Your controls',
        body: 'You can request export or deletion through the privacy center when account tools are enabled.',
      },
    ],
  },
  'zh-CN': {
    title: '个人关系数据的隐私说明',
    description: 'TianJi Love 不会把出生资料放进分享链接，只收集生成报告所需的信息，并支持导出或删除请求。',
    sections: [
      {
        title: '我们收集什么',
        body: '出生背景与阅读偏好仅用于生成关系建议。',
      },
      {
        title: '我们如何保护',
        body: '个人数据应保存在私密记录中，不进入公开链接或社交预览。',
      },
      {
        title: '你的控制权',
        body: '账户工具启用后，你可以通过隐私中心申请导出或删除。',
      },
    ],
  },
} satisfies Record<Locale, PrivacyCopy>;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  return buildLocalizedMetadata({
    locale,
    path: '/privacy',
    title: locale === 'zh-CN' ? 'TianJi Love 隐私政策' : 'TianJi Love Privacy',
    description: copy[locale].description,
  });
}

export default async function PrivacyPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const t = copy[locale];

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-10 text-white sm:px-8">
      <article className="mx-auto max-w-3xl">
        <Link href={getLocalizedPath(locale, '/')} className="text-sm text-white/58 hover:text-white">
          TianJi Love
        </Link>
        <h1 className="mt-12 font-serif text-4xl leading-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-5 text-lg leading-8 text-white/68">{t.description}</p>
        <div className="mt-10 space-y-5">
          {t.sections.map(({ title, body }) => (
            <section key={title} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">{body}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
