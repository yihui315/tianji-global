'use client';

import { BookOpen, Brain, Calendar, CheckCircle2, Clock, Globe, Heart, Lock, Mail, MessageCircle, Rocket, Shield, Sparkles, Star, Users } from 'lucide-react';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import {
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryNav,
  TianjiLoveButton,
  TianjiLoveFinalCta,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

const copy = {
  en: {
    nav: {
      compatibility: 'Compatibility',
      loveReading: 'Love Reading',
      timing: 'Timing',
      guide: 'Guide',
      pricing: 'Pricing',
      about: 'About',
      services: 'Services',
    },
    hero: {
      eyebrow: 'Professional Services',
      title: 'When you need a human expert',
      body: 'Our specialists offer 1-on-1 relationship readings, corporate astrology consulting, and custom AI system deployment. Every service combines human expertise with privacy-first principles.',
    },
    tiersTitle: 'Three ways we can work together',
    tiers: [
      {
        icon: Heart,
        name: 'Personal Reading',
        price: '¥299+',
        desc: '1-on-1 relationship reading with a human specialist',
        features: ['45–60 minute video or written session', 'Human astrologer + AI-assisted analysis', 'Report delivered within 48 hours', 'Follow-up summary included'],
        cta: 'Book a Reading',
        ctaHref: 'mailto:hello@tianji.love?subject=Personal%20Reading%20Inquiry',
      },
      {
        icon: Users,
        name: 'Corporate & Bulk',
        price: '¥999+',
        desc: 'Batch reports, team compatibility, quarterly forecasts',
        features: ['Up to 50 relationship reports', 'Team compatibility matrix', 'Quarterly love forecast', 'Dedicated consultant'],
        cta: 'Inquire Now',
        ctaHref: 'mailto:hello@tianji.love?subject=Corporate%20Inquiry',
      },
      {
        icon: Rocket,
        name: 'Private AI Deployment',
        price: '¥9,999+',
        desc: 'Custom Tianji Love-style system for your platform',
        features: ['White-label AI relationship engine', 'API integration', 'Custom training data', 'Branded experience'],
        cta: 'Contact Us',
        ctaHref: 'mailto:hello@tianji.love?subject=Private%20AI%20Deployment',
      },
    ],
    processTitle: 'How it works',
    steps: [
      { num: '01', title: 'Submit an inquiry', body: 'Email hello@tianji.love with your service needs and timeline.' },
      { num: '02', title: 'Book your consultation', body: 'We respond within 24 hours to schedule and confirm scope.' },
      { num: '03', title: 'Receive your deliverable', body: 'Human reading or system deliverable within 5–7 business days.' },
    ],
    trustTitle: 'Why clients choose us',
    trust: [
      { icon: Brain, title: 'Human + AI hybrid', body: 'Human judgment combined with AI precision — not one or the other.' },
      { icon: Shield, title: 'Your data stays private', body: 'Birth data and reading content are used for the service only, not sold to third parties.' },
      { icon: Star, title: 'Specialist focus only', body: 'We work exclusively in relationship astrology and timing — no generalist readings.' },
    ],
    ctaTitle: 'Ready to start a conversation?',
    ctaBody: 'Email us at hello@tianji.love with your name, service type, and preferred timeline.',
    ctaButton: 'Send an Email',
    footer: 'Tianji Love services are for relationship reflection and communication, not medical, legal, financial, or crisis advice.',
    internalLinks: [
      { label: 'About the team', href: '/about' },
      { label: 'Free guides', href: '/guide' },
      { label: 'Privacy policy', href: '/privacy-center' },
      { label: 'Free tools', href: '/love-test' },
    ],
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      guide: '指南',
      pricing: '会员权益',
      about: '关于',
      services: '服务',
    },
    hero: {
      eyebrow: '专业服务',
      title: '当你需要人工专家时',
      body: '我们的专家提供一对一关系解读、企业命理咨询和定制 AI 系统部署。每项服务都遵循隐私优先原则。',
    },
    tiersTitle: '三种合作方式',
    tiers: [
      {
        icon: Heart,
        name: '个人解读',
        price: '¥299+',
        desc: '专业关系命理师一对一解读',
        features: ['45–60分钟视频或文字沟通', '人工命理师 + AI 辅助分析', '48小时内交付报告', '包含跟进摘要'],
        cta: '预约解读',
        ctaHref: 'mailto:hello@tianji.love?subject=个人解读咨询',
      },
      {
        icon: Users,
        name: '企业与合作',
        price: '¥999+',
        desc: '批量报告、团队合盘、季度预测',
        features: ['最多50份关系报告', '团队合盘分析', '季度爱情运势预测', '专属顾问'],
        cta: '立即咨询',
        ctaHref: 'mailto:hello@tianji.love?subject=企业合作咨询',
      },
      {
        icon: Rocket,
        name: '私有化 AI 部署',
        price: '¥9,999+',
        desc: '为你的平台定制 Tianji Love 风格系统',
        features: ['白标 AI 关系引擎', 'API 集成', '自定义训练数据', '品牌化体验'],
        cta: '联系我们',
        ctaHref: 'mailto:hello@tianji.love?subject=私有化AI部署咨询',
      },
    ],
    processTitle: '服务流程',
    steps: [
      { num: '01', title: '提交咨询', body: '发邮件至 hello@tianji.love，说明服务需求和时间安排。' },
      { num: '02', title: '预约沟通', body: '我们在24小时内回复，确认范围并安排时间。' },
      { num: '03', title: '交付成果', body: '人工解读或系统交付物在5–7个工作日内完成。' },
    ],
    trustTitle: '为什么选择我们',
    trust: [
      { icon: Brain, title: '人工 + AI 结合', body: '人类判断与 AI 精确性结合——不是二选一。' },
      { icon: Shield, title: '数据完全保密', body: '出生资料和解读内容绝不分享或转售。' },
      { icon: Star, title: '专注关系领域', body: '我们只做关系命理和时机分析——不提供泛化解读。' },
    ],
    ctaTitle: '准备好开始对话了吗？',
    ctaBody: '发邮件至 hello@tianji.love，说明你的姓名、服务类型和期望时间。',
    ctaButton: '发送邮件',
    footer: 'Tianji Love 服务仅用于关系反思与沟通，不构成医疗、法律、财务或危机干预建议。',
    internalLinks: [
      { label: '关于我们', href: '/about' },
      { label: '免费指南', href: '/guide' },
      { label: '隐私政策', href: '/privacy-center' },
      { label: '免费工具', href: '/love-test' },
    ],
  },
};

export default function ServicesPage() {
  const [lang] = useSyncedLanguage('en');
  const c = copy[lang];

  return (
    <TianjiLoveShell>
      <TianjiLoveHeader
        homeHref={withLanguageParam('/', lang)}
        navItems={getTianjiLovePrimaryNav(lang)}
        cta={{ label: c.nav.pricing, href: withLanguageParam('/pricing', lang) }}
      />

      {/* Hero */}
      <section className="relative px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-purple-400">{c.hero.eyebrow}</p>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl">{c.hero.title}</h1>
          <p className="text-lg text-gray-300">{c.hero.body}</p>
        </div>
      </section>

      {/* Service Tiers */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <TianjiLoveSectionTitle title={c.tiersTitle} />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {c.tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <TianjiLovePanel key={tier.name} className="flex flex-col">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-purple-900/50 p-3">
                      <Icon className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                      <p className="text-2xl font-bold text-purple-400">{tier.price}</p>
                    </div>
                  </div>
                  <p className="mb-4 text-sm text-gray-400">{tier.desc}</p>
                  <ul className="mb-6 flex-1 space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <TianjiLoveButton
                    href={tier.ctaHref}
                    className="w-full"
                    variant="primary"
                  >
                    {tier.cta}
                  </TianjiLoveButton>
                </TianjiLovePanel>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <TianjiLoveSectionTitle title={c.processTitle} />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {c.steps.map((step) => (
              <TianjiLovePanel key={step.num} className="text-center">
                <div className="mb-4 text-4xl font-bold text-purple-500/30">{step.num}</div>
                <h3 className="mb-2 font-semibold">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.body}</p>
              </TianjiLovePanel>
            ))}
          </div>
        </div>
      </section>

      {/* Ad placeholder — 3 sections gap above/below */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <div
            id="services-page-ads"
            className="ads-placeholder min-h-[120px] rounded-xl border border-white/10 bg-white/5 flex items-center justify-center"
          >
            <p className="text-sm text-gray-500">Advertisement</p>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <TianjiLoveSectionTitle title={c.trustTitle} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {c.trust.map((t) => {
              const Icon = t.icon;
              return (
                <TianjiLoveTrustCard key={t.title} icon={Icon} title={t.title} body={t.body} />
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold">{c.ctaTitle}</h2>
          <p className="mb-6 text-gray-300">{c.ctaBody}</p>
          <TianjiLoveButton href="mailto:hello@tianji.love">
            <Mail className="mr-2 h-5 w-5" />
            {c.ctaButton}
          </TianjiLoveButton>
        </div>
      </section>

      {/* Internal Links */}
      <section className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-sm text-gray-500">Explore more:</p>
          <div className="flex flex-wrap gap-4">
            {c.internalLinks.map((l) => (
              <a key={l.href} href={withLanguageParam(l.href, lang)} className="text-sm text-purple-400 hover:text-purple-300">
                → {l.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <TianjiLoveFooter
        links={getTianjiLoveFooterNav(lang)}
        disclaimer={c.footer}
        homeHref={withLanguageParam('/', lang)}
      />
    </TianjiLoveShell>
  );
}
