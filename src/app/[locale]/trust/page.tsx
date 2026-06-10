import type { Metadata } from 'next';
import Link from 'next/link';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { isSupportedLocale, locales } from '@/lib/i18n';
import { notFound } from 'next/navigation';

type PageParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};
  return buildLocalizedMetadata({ locale, path: '/trust', title: 'Trust & Safety' });
}

const t = {
  en: {
    title: 'Trust & Safety',
    subtitle: 'Your privacy, security, and well-being are our priority.',
    privacy: {
      title: 'Privacy Guarantee',
      items: [
        'We never sell or share your personal data',
        'Birth information is used only for divination calculations',
        'All readings are processed anonymously',
        'Payment data is handled exclusively by Stripe',
        'You can request data deletion at any time',
      ],
    },
    security: {
      title: 'Data Security',
      items: [
        '256-bit SSL encryption on all pages',
        'SOC 2 compliant infrastructure via Vercel',
        'No tracking pixels from third-party ad networks',
        'Session data expires after 30 days',
      ],
    },
    accuracy: {
      title: 'Reading Accuracy',
      items: [
        'Our AI system is trained on classical divination texts',
        'Readings are informational, not deterministic',
        'Results should not replace professional counseling',
        'We continuously improve based on user feedback',
      ],
    },
    cta: 'Read our Privacy Policy',
    cta2: 'Read our Terms of Service',
  },
  'zh-CN': {
    title: '信任与安全',
    subtitle: '您的隐私、安全和福祉是我们的首要任务。',
    privacy: {
      title: '隐私保障',
      items: [
        '我们绝不出售或分享您的个人数据',
        '出生信息仅用于命理计算',
        '所有解读均以匿名方式处理',
        '支付数据由 Stripe 独家处理',
        '您可随时请求删除数据',
      ],
    },
    security: {
      title: '数据安全',
      items: [
        '所有页面均使用 256 位 SSL 加密',
        'Vercel 基础设施符合 SOC 2 标准',
        '无第三方广告网络追踪像素',
        '会话数据 30 天后自动失效',
      ],
    },
    accuracy: {
      title: '解读准确性',
      items: [
        'AI 系统基于经典命理典籍训练',
        '解读结果仅供参考，非确定性结论',
        '结果不应替代专业咨询',
        '我们根据用户反馈持续改进',
      ],
    },
    cta: '阅读隐私政策',
    cta2: '阅读服务条款',
  },
};

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="font-serif text-lg text-[#ffe3b4]">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-white/60">
            <span className="mt-1 text-[#d8b77b]">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function TrustPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const c = t[locale as keyof typeof t];
  const isZh = locale === 'zh-CN';

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 text-xs font-medium tracking-widest text-[#d8b77b]/60 uppercase">TianJi Love</div>
        <h1 className="font-serif text-4xl text-[#ffe3b4]">{c.title}</h1>
        <p className="mt-3 text-sm text-white/50">{c.subtitle}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Section title={c.privacy.title} items={c.privacy.items} />
          <Section title={c.security.title} items={c.security.items} />
          <Section title={c.accuracy.title} items={c.accuracy.items} />
          <div className="flex flex-col justify-center gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-6">
            <div className="text-center">
              <div className="text-4xl">🔒</div>
              <div className="mt-3 font-serif text-lg text-[#ffe3b4]">
                {isZh ? '安心使用' : 'Use with Confidence'}
              </div>
              <div className="mt-2 text-sm text-white/50">
                {isZh ? '天机Love 让您安心探索感情和命运' : 'TianJi Love empowers you to explore love and destiny privately'}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Link
                href={isZh ? '/zh-CN/privacy' : '/en/privacy'}
                className="block rounded-lg border border-[#d8b77b]/30 bg-[#d8b77b]/08 px-4 py-3 text-center text-sm text-[#d8b77b] transition hover:bg-[#d8b77b]/16"
              >
                {c.cta} →
              </Link>
              <Link
                href={isZh ? '/zh-CN/terms' : '/en/terms'}
                className="block rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-white/60 transition hover:bg-white/[0.07]"
              >
                {c.cta2} →
              </Link>
            </div>
          </div>
        </div>

        {/* Cookie Consent Banner Logic */}
        <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="font-serif text-lg text-[#ffe3b4]">
            {isZh ? 'Cookie 使用说明' : 'Cookie Notice'}
          </h2>
          <p className="mt-3 text-sm text-white/50">
            {isZh
              ? '天机Love 使用少量 Cookie 来记住您的语言偏好和分析匿名流量。我们不使用第三方追踪像素。如需了解详情，请阅读我们的隐私政策。'
              : 'TianJi Love uses minimal cookies to remember your language preference and analyze anonymous traffic. We do not use third-party tracking pixels. See our Privacy Policy for details.'}
          </p>
        </div>
      </div>
    </main>
  );
}