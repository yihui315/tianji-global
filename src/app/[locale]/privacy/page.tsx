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
  intro: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  dataCollected: {
    title: string;
    items: string[];
  };
  footer: string;
};

const copy = {
  en: {
    title: 'Privacy for personal relationship data',
    description:
      'Tianji Love keeps birth details out of share URLs, limits collection to what the reading needs, and supports export or deletion requests.',
    intro: 'Tianji Love is committed to protecting your privacy. This page explains what data we collect, how it is used, and your rights regarding your personal information.',
    sections: [
      {
        title: 'Data we collect',
        body: 'Birth context and reading preferences are used to create relationship guidance. We collect account information (email, language), birth details you provide, relationship questions and answers, reading outputs, payment transaction IDs (via Stripe), and basic technical logs.',
      },
      {
        title: 'How we protect it',
        body: 'Personal data belongs in private records, never public links or social previews. Share pages hide birth date, birth time, birth location, and timezone by default. We use encryption for data in transit and reasonable safeguards for data at rest.',
      },
      {
        title: 'Third-party AI services',
        body: 'We use AI services for relationship reading generation and astrology calculations. These services process your input data solely to generate personalized guidance and are not used for profiling or advertising targeting.',
      },
      {
        title: 'International transfers',
        body: 'Your data may be processed on servers outside your country of residence, including in the United States. Appropriate safeguards are in place for international data transfers.',
      },
      {
        title: 'Children\'s privacy',
        body: 'Tianji Love is not directed to children under 13. We do not knowingly collect personal information from children. If we become aware of such collection, we delete the information promptly.',
      },
      {
        title: 'Your controls',
        body: 'You can request export or deletion through the privacy center. Data is retained for up to 2 years after last activity, or until deletion is requested. Contact privacy@tianji.love for privacy inquiries.',
      },
    ],
    dataCollected: {
      title: 'Categories of data collected',
      items: [
        'Account information (email, language preference)',
        'Birth details (date, time, location for readings)',
        'Relationship questions and answers',
        'Generated reading outputs',
        'Payment transaction identifiers (Stripe)',
        'Technical logs (IP, browser, usage metrics)',
      ],
    },
    footer: 'For full details, see our complete Privacy Policy at /legal/privacy.',
  },
  'zh-CN': {
    title: '个人关系数据的隐私说明',
    description: 'Tianji Love 不会把出生资料放进分享链接，只收集生成报告所需的信息，并支持导出或删除请求。',
    intro: 'Tianji Love 致力于保护您的隐私。本页面说明我们收集哪些数据、如何使用数据，以及您对个人信息的权利。',
    sections: [
      {
        title: '我们收集什么',
        body: '出生背景与阅读偏好仅用于生成关系建议。我们收集账号信息（邮箱、语言偏好）、你提供的出生资料、关系问题与答案、生成的解读输出、支付交易标识符（通过Stripe）以及基本技术日志。',
      },
      {
        title: '我们如何保护',
        body: '个人数据应保存在私密记录中，不进入公开链接或社交预览。分享页默认隐藏出生日期、时间、地点和时区。我们对传输中的数据使用加密，对存储中的数据采取合理的安全措施。',
      },
      {
        title: '第三方AI服务',
        body: '我们使用AI服务来生成关系解读和占星计算。这些服务仅处理你的输入数据以生成个性化指导，不用于用户画像或广告定向。',
      },
      {
        title: '国际数据传输',
        body: '你的数据可能在您所在国家/地区以外的服务器上处理，包括美国服务器。我们为国际数据传输提供适当的保护措施。',
      },
      {
        title: '儿童隐私',
        body: 'Tianji Love 不面向13岁以下的儿童。我们不会故意收集儿童的个人信息。如果我们发现此类收集，将立即删除信息。',
      },
      {
        title: '你的控制权',
        body: '你可以通过隐私中心申请导出或删除。数据自最后一次活动起保留最多2年，或直至你请求删除。隐私咨询请联系 privacy@tianji.love。',
      },
    ],
    dataCollected: {
      title: '收集的数据类别',
      items: [
        '账号信息（邮箱、语言偏好）',
        '出生资料（用于解读的日期、时间、地点）',
        '关系问题与答案',
        '生成的解读输出',
        '支付交易标识符（Stripe）',
        '技术日志（IP、浏览器、使用指标）',
      ],
    },
    footer: '完整详情请参阅我们的完整隐私政策 /legal/privacy。',
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
    title: locale === 'zh-CN' ? 'Tianji Love 隐私政策' : 'Tianji Love Privacy',
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
          Tianji Love
        </Link>
        <h1 className="mt-12 font-serif text-4xl leading-tight sm:text-5xl">{t.title}</h1>
        <p className="mt-5 text-lg leading-8 text-white/68">{t.description}</p>
        <p className="mt-4 text-sm leading-7 text-white/50">{t.intro}</p>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.05] p-6">
          <h2 className="text-lg font-semibold">{t.dataCollected.title}</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {t.dataCollected.items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-[#d8b77b]">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 space-y-5">
          {t.sections.map(({ title, body }) => (
            <section key={title} className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/62">{body}</p>
            </section>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-white/40">{t.footer}</p>
      </article>
    </main>
  );
}
