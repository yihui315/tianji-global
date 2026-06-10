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
  return buildLocalizedMetadata({ locale, path: '/terms', title: 'Terms of Service' });
}

const t = {
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: June 2025',
    acceptance: 'By accessing or using TianJi Love, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.',
    services: {
      title: 'Services Description',
      text: 'TianJi Love provides AI-powered divination readings including love readings, compatibility analysis, tarot spreads, and fortune predictions. Our services are for entertainment and self-reflection purposes only.',
    },
    payment: {
      title: 'Payment Terms',
      items: [
        'All prices are in USD unless otherwise stated',
        'Payments processed securely via Stripe',
        'Refunds available within 7 days of purchase if technical error prevents service delivery',
        'No refunds for completed readings once delivered',
        'Subscription auto-renews monthly unless cancelled 24h before renewal',
      ],
    },
    disclaimers: {
      title: 'Disclaimers',
      items: [
        'Readings are for entertainment and self-reflection only',
        'Not a substitute for professional counseling, therapy, or medical advice',
        'Accuracy not guaranteed — divination is interpretive, not deterministic',
        'Decisions based on readings are at your own risk',
        'We are not responsible for outcomes resulting from use of our services',
      ],
    },
    restrictions: {
      title: 'User Restrictions',
      items: [
        'Must be 18 years or older to use our services',
        'No reselling or commercial use of our readings',
        'No attempting to reverse-engineer our AI systems',
        'No using our services for illegal purposes',
        'No sharing content that violates others\' rights',
      ],
    },
    intellectual: {
      title: 'Intellectual Property',
      items: [
        'All content on tianji.love is property of TianJi Love',
        'Readings generated for you are for personal use only',
        'Commercial use of generated content prohibited without written consent',
      ],
    },
    termination: {
      title: 'Termination',
      text: 'We reserve the right to terminate access to our services for any user who violates these terms or engages in abusive behavior toward our team.',
    },
    changes: {
      title: 'Changes to Terms',
      text: 'We may update these terms at any time. Continued use of our services after changes constitutes acceptance of new terms.',
    },
    contact: {
      title: 'Contact',
      text: 'Questions about these terms? Email hello@tianji.love',
    },
  },
  'zh-CN': {
    title: '服务条款',
    updated: '最后更新：2025年6月',
    acceptance: '访问或使用天机Love，即表示您同意受本服务条款约束。如果您不同意，请不要使用我们的服务。',
    services: {
      title: '服务说明',
      text: '天机Love 提供AI驱动的命理解读，包括爱情解读、兼容性分析、塔罗牌阵和运势预测。我们的服务仅用于娱乐和自我反思目的。',
    },
    payment: {
      title: '支付条款',
      items: [
        '除非另有说明，所有价格以美元计价',
        '通过 Stripe 安全处理付款',
        '如果技术错误导致服务无法交付，7天内可退款',
        '已完成的解读不予退款',
        '订阅每月自动续订，除非在续订前24小时取消',
      ],
    },
    disclaimers: {
      title: '免责声明',
      items: [
        '解读仅用于娱乐和自我反思',
        '不能替代专业咨询、心理治疗或医疗建议',
        '不保证准确性——命理是解释性的，非确定性的',
        '基于解读的决策由您自行承担风险',
        '对于因使用我们的服务而产生的后果，我们不承担责任',
      ],
    },
    restrictions: {
      title: '用户限制',
      items: [
        '必须年满18岁才能使用我们的服务',
        '禁止转售或商业使用我们的解读',
        '禁止尝试反向工程我们的AI系统',
        '禁止将我们的服务用于非法目的',
        '禁止分享侵犯他人权利的内容',
      ],
    },
    intellectual: {
      title: '知识产权',
      items: [
        'tianji.love 上的所有内容均为天机Love 的财产',
        '为您生成的解读仅供个人使用',
        '未经书面同意，禁止商业使用生成的内容',
      ],
    },
    termination: {
      title: '终止',
      text: '我们保留终止违反本条款或对我们的团队进行滥用行为的用户访问权限的权利。',
    },
    changes: {
      title: '条款变更',
      text: '我们可随时更新这些条款。在条款变更后继续使用我们的服务即表示接受新条款。',
    },
    contact: {
      title: '联系',
      text: '对本条款有疑问？请发送邮件至 hello@tianji.love',
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

export default async function TermsPage({ params }: PageParams) {
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
        <div className="mt-6 text-sm text-white/50 leading-relaxed">{c.acceptance}</div>

        <div className="mt-10 space-y-2">
          <Section title={c.services.title}><p>{c.services.text}</p></Section>
          <Section title={c.payment.title}><ListItems items={c.payment.items} /></Section>
          <Section title={c.disclaimers.title}><ListItems items={c.disclaimers.items} /></Section>
          <Section title={c.restrictions.title}><ListItems items={c.restrictions.items} /></Section>
          <Section title={c.intellectual.title}><ListItems items={c.intellectual.items} /></Section>
          <Section title={c.termination.title}><p>{c.termination.text}</p></Section>
          <Section title={c.changes.title}><p>{c.changes.text}</p></Section>
          <Section title={c.contact.title}><p>{c.contact.text}</p></Section>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-white/30">
            {isZh ? '本条款最后更新于2025年6月。' : 'These terms were last updated in June 2025.'}
          </p>
        </div>
      </div>
    </main>
  );
}