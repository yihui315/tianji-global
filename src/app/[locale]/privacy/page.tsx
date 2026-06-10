import type { Metadata } from 'next';
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
  return buildLocalizedMetadata({ locale, path: '/privacy', title: 'Privacy Policy' });
}

const t = {
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: June 2025',
    intro: 'TianJi Love ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.',
    collection: {
      title: 'Information We Collect',
      items: [
        'Birth information (date, time, location) — used solely for divination calculations',
        'Questions and preferences you share with our AI oracle',
        'Payment information processed securely by Stripe (we never store card details)',
        'Usage data including pages visited and features used (anonymous only)',
        'Email address if you subscribe to our newsletter or create an account',
      ],
    },
    usage: {
      title: 'How We Use Your Information',
      items: [
        'To generate personalized divination readings',
        'To process payments and deliver purchased reports',
        'To send transactional emails (order confirmations, account updates)',
        'To improve our AI prediction accuracy and service quality',
        'To respond to your support requests',
      ],
    },
    sharing: {
      title: 'Information Sharing',
      items: [
        'We never sell your personal data to third parties',
        'Payment processing handled exclusively by Stripe',
        'Anonymous usage analytics (no personal information shared with ad networks)',
        'Legal compliance: we may disclose information when required by law',
      ],
    },
    rights: {
      title: 'Your Rights',
      items: [
        'Request deletion of your personal data at any time',
        'Access a copy of data we hold about you',
        'Opt out of marketing emails via unsubscribe link',
        'Withdraw consent for data processing where applicable',
      ],
    },
    contact: {
      title: 'Contact Us',
      text: 'For privacy concerns, email hello@tianji.love or visit our Contact page.',
    },
  },
  'zh-CN': {
    title: '隐私政策',
    updated: '最后更新：2025年6月',
    intro: '天机Love（"我们"）致力于保护您的隐私。本隐私政策说明了我们如何收集、使用、披露和保护您在使用我们的网站和服务时的信息。',
    collection: {
      title: '我们收集的信息',
      items: [
        '出生信息（日期、时间、地点）— 仅用于命理计算',
        '您向AI Oracle分享的问题和偏好',
        '由Stripe安全处理的支付信息（我们从不存储卡详细信息）',
        '使用数据，包括访问的页面和使用的功能（仅匿名）',
        '如果您订阅我们的新闻通讯或创建账户，我们会收集电子邮件地址',
      ],
    },
    usage: {
      title: '我们如何使用您的信息',
      items: [
        '生成个性化命理解读',
        '处理付款并交付已购买的报告',
        '发送交易电子邮件（订单确认、账户更新）',
        '改进我们的AI预测准确性和服务质量',
        '回应您的支持请求',
      ],
    },
    sharing: {
      title: '信息共享',
      items: [
        '我们绝不会将您的个人数据出售给第三方',
        '支付处理由Stripe独家处理',
        '匿名使用分析（不与广告网络共享个人信息）',
        '法律合规：必要时我们可能披露信息',
      ],
    },
    rights: {
      title: '您的权利',
      items: [
        '随时请求删除您的个人数据',
        '访问我们持有的关于您的数据副本',
        '通过退订链接选择退出营销电子邮件',
        '在适用情况下撤回对数据处理的同意',
      ],
    },
    contact: {
      title: '联系我们',
      text: '如对隐私有疑虑，请发送邮件至 hello@tianji.love 或访问我们的联系页面。',
    },
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="font-serif text-lg text-[#ffe3b4]">{title}</h2>
      <div className="mt-3 text-sm text-white/60 leading-relaxed">{children}</div>
    </div>
  );
}

function ListItems({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm text-white/60">
          <span className="mt-1 text-[#d8b77b]">•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function PrivacyPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const c = t[locale as keyof typeof t];
  const isZh = locale === 'zh-CN';

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 text-xs font-medium tracking-widest text-[#d8b77b]/60 uppercase">TianJi Love</div>
        <h1 className="font-serif text-4xl text-[#ffe3b4]">{c.title}</h1>
        <p className="mt-2 text-xs text-white/40">{c.updated}</p>
        <div className="mt-6 text-sm text-white/50 leading-relaxed">{c.intro}</div>

        <div className="mt-10 space-y-2">
          <Section title={c.collection.title}>
            <ListItems items={c.collection.items} />
          </Section>
          <Section title={c.usage.title}>
            <ListItems items={c.usage.items} />
          </Section>
          <Section title={c.sharing.title}>
            <ListItems items={c.sharing.items} />
          </Section>
          <Section title={c.rights.title}>
            <ListItems items={c.rights.items} />
          </Section>
          <Section title={c.contact.title}>
            <p className="text-sm text-white/50">{c.contact.text}</p>
          </Section>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-white/30">
            {isZh
              ? '本政策最后更新于2025年6月。如有重大变更，我们将通过网站通知您。'
              : 'This policy was last updated in June 2025. We will notify you of significant changes via our website.'}
          </p>
        </div>
      </div>
    </main>
  );
}