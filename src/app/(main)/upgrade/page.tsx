'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, FileText, History, Lock, Sparkles, Star, Zap } from 'lucide-react';

import { PLANS, type PlanId } from '@/lib/stripe';
import { isPayPerUseEnabled } from '@/lib/pay-per-use';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import { trackRevenueFunnelEvent } from '@/lib/analytics/funnel-events';
import {
  TianjiLoveButton,
  TianjiLoveFinalCta,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

const PLAN_ORDER: PlanId[] = ['PRO_MONTHLY', 'PRO_YEARLY'];

const upgradeCopy = {
  en: {
    nav: {
      loveReading: 'Love Reading',
      ask: 'Ask',
      draw: 'Draw Timing',
      pricing: 'Pricing',
      upgrade: 'Upgrade',
      about: 'About',
      login: 'Login',
      privacy: 'Privacy',
    },
    hero: {
      eyebrow: 'Tianji Love / Upgrade',
      title: 'When the reading resonates, go deeper.',
      body:
        'Your first reading is a preview. Upgrade to unlock deeper AI interpretation, longer history, report-ready surfaces, and priority processing.',
      primary: 'Choose your plan',
      secondary: 'Start free first',
      comingSoon: 'Coming soon',
    },
    plansTitle: 'Plans available',
    guestCta: 'Sign in to continue',
    authCta: 'Continue to checkout',
    redirecting: 'Redirecting...',
    trust: [
      { icon: Lock, title: 'Privacy First', body: 'Personal birth details stay private and are not exposed on public shares by default.' },
      { icon: CreditCard, title: 'Stripe Checkout', body: 'Checkout is handled through secure Stripe. Your card details never touch our servers.' },
      { icon: Sparkles, title: 'No inflated promise', body: 'Paid plans unlock depth and history, not guaranteed predictions.' },
    ],
    compareTitle: 'What Pro adds',
    monthly: {
      name: 'Love Monthly',
      description: 'For active reflection across love questions, compatibility, and timing windows.',
      interval: 'month',
      features: [
        'Unlimited saved readings',
        'Deeper AI interpretation',
        'Relationship and timing history',
        'Report-ready reading pages',
        'Priority processing',
      ],
    },
    yearly: {
      name: 'Love Yearly',
      description: 'For a long-term practice with the best value and the same full feature set.',
      interval: 'year',
      features: [
        'Everything in Love Monthly',
        'Save 17% vs monthly',
        'Year-round report archive',
        'Priority support',
        'Best for couples tracking patterns',
      ],
    },
    compare: [
      { icon: Check, title: 'Complete free readings remain', body: 'The free path still gives usable guidance before any upgrade.' },
      { icon: History, title: 'Longer reading history', body: 'Return to patterns and timing windows without losing the thread.' },
      { icon: FileText, title: 'Report-ready output', body: 'Use cleaner, fuller reports when the reading matters enough to keep.' },
      { icon: Zap, title: 'Priority processing', body: 'Higher priority for AI interpretation during busy periods.' },
    ],
    final: {
      title: 'The first signal is free. The deeper pattern is there when you need it.',
      button: 'Begin With A Love Reading',
    },
    footer:
      'Pricing unlocks deeper reflection, history, and report surfaces. Readings remain for self-reflection and communication, not medical, legal, financial, or crisis advice.',
  },
  zh: {
    nav: {
      loveReading: '关系解读',
      ask: '提问',
      draw: '时机抽牌',
      pricing: '会员权益',
      upgrade: '升级',
      about: '关于',
      login: '登录',
      privacy: '隐私',
    },
    hero: {
      eyebrow: 'Tianji Love / 升级',
      title: '当解读引起共鸣时，走向更深。',
      body:
        '你的第一次解读只是预览。升级后解锁更深入的 AI 解读、更长的历史记录、报告就绪的展示页面和优先处理。',
      primary: '选择方案',
      secondary: '先开始免费',
      comingSoon: '即将开放',
    },
    plansTitle: '可用的方案',
    guestCta: '登录后继续',
    authCta: '继续结账',
    redirecting: '正在跳转...',
    trust: [
      { icon: Lock, title: '隐私优先', body: '出生资料默认保持私密，公开分享不展示生日、时间、地点或时区。' },
      { icon: CreditCard, title: 'Stripe 结账', body: '通过安全 Stripe 结账。卡号信息不经过我们的服务器。' },
      { icon: Sparkles, title: '不过度承诺', body: '付费解锁的是深度和历史，不是确定性的未来保证。' },
    ],
    compareTitle: 'Pro 增加什么',
    monthly: {
      name: 'Love 月度',
      description: '适合持续探索爱情问题、关系合盘和关键时机窗口。',
      interval: '月',
      features: [
        '不限次数保存解读',
        '更深入的 AI 解读',
        '关系与时机历史',
        '适合保存的报告页面',
        '优先处理',
      ],
    },
    yearly: {
      name: 'Love 年度',
      description: '适合长期练习，价格更优，功能完整一致。',
      interval: '年',
      features: [
        '包含月度全部能力',
        '相比月付节省 17%',
        '全年报告归档',
        '优先支持',
        '适合长期观察关系模式',
      ],
    },
    compare: [
      { icon: Check, title: '免费解读仍然完整', body: '升级前依然可以获得可用的基础指引。' },
      { icon: History, title: '更长历史记录', body: '可以回看关系模式和时机窗口，不丢失上下文。' },
      { icon: FileText, title: '更完整报告', body: '当一次解读值得保留时，可以得到更清晰的报告输出。' },
      { icon: Zap, title: '优先处理', body: '高峰期获得更高优先级的 AI 解读处理。' },
    ],
    final: {
      title: '第一段信号免费开始。更深的模式，在你需要时再打开。',
      button: '从爱情解读开始',
    },
    footer: '会员权益解锁更深入的反思、历史和报告页面。所有解读仅用于自我理解与沟通参考，不构成医疗、法律、财务或危机建议。',
  },
} as const;

function planCopyFor(language: 'zh' | 'en', planId: PlanId) {
  const copy = upgradeCopy[language];
  return planId === 'PRO_YEARLY' ? copy.yearly : copy.monthly;
}

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [language] = useSyncedLanguage('en');
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState('');
  const copy = upgradeCopy[language];
  const isAuthenticated = !!session?.user;
  const href = (path: string) => withLanguageParam(path, language);
  const payPerUseEnabled = isPayPerUseEnabled();

  useEffect(() => {
    void trackRevenueFunnelEvent('pricing_view', {
      lang: language,
      surface: 'upgrade_page',
    });
  }, [language]);

  const handleSubscribe = async (planId: PlanId) => {
    if (!payPerUseEnabled) return;

    void trackRevenueFunnelEvent('unlock_click', {
      lang: language,
      surface: 'upgrade_page',
      planId,
      product: planId,
      authenticated: isAuthenticated,
    });

    if (!isAuthenticated) {
      void trackRevenueFunnelEvent('login_started', {
        lang: language,
        source: 'upgrade_page_plan_click',
        planId,
      });
      router.push(href('/login'));
      return;
    }

    setLoadingPlan(planId);
    setError('');

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoadingPlan(null);
    }
  };

  return (
    <TianjiLoveShell className="tianji-love-upgrade-page" ariaLabel="Tianji Love upgrade page">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={[
          { label: copy.nav.loveReading, href: href('/relationship/new') },
          { label: copy.nav.ask, href: href('/ask') },
          { label: copy.nav.draw, href: href('/draw') },
          { label: copy.nav.pricing, href: href('/pricing') },
          { label: copy.nav.upgrade, href: href('/upgrade'), mobile: true },
          { label: copy.nav.about, href: href('/about') },
          { label: copy.nav.login, href: href('/login'), mobile: true },
        ]}
        cta={{ label: copy.hero.secondary, href: href('/relationship/new') }}
      />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-12 pt-16 sm:px-8 lg:min-h-[520px] lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{copy.hero.eyebrow}</p>
          <h1 className="font-serif text-[2.7rem] font-semibold leading-[1.08] text-[#ffe3b4] sm:text-[4.2rem]">
            {copy.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f5d8aa]/78">{copy.hero.body}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <TianjiLoveButton href="#plans">{copy.hero.primary}</TianjiLoveButton>
            <TianjiLoveButton href={href('/relationship/new')} variant="secondary">{copy.hero.secondary}</TianjiLoveButton>
          </div>
        </div>

        <TianjiLovePanel className="p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-3">
            {copy.trust.map((item) => (
              <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
            ))}
          </div>
        </TianjiLovePanel>
      </section>

      <section id="plans" className="relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle title={copy.plansTitle} className="mb-10" />
        {error ? (
          <div className="mx-auto mb-6 max-w-md rounded-lg border border-[#ff7f80]/30 bg-[#ff5264]/10 px-4 py-3 text-center text-sm text-[#ffb4a3]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const localPlan = planCopyFor(language, planId);
            const isYearly = planId === 'PRO_YEARLY';
            const isLoading = loadingPlan === planId;

            return (
              <TianjiLovePanel key={planId} as="article" className="p-7">
                {isYearly ? (
                  <div className="absolute right-5 top-5 rounded-full border border-[#ffb49e]/48 bg-[#ff6c73]/18 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#ffe3b4]">
                    Best value
                  </div>
                ) : null}
                <p className="text-xs uppercase tracking-[0.28em] text-[#d8b77b]/64">{localPlan.interval}</p>
                <h2 className="mt-4 font-serif text-3xl text-[#ffe3b4]">{localPlan.name}</h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#f4d7a3]/66">{localPlan.description}</p>
                <div className="mt-8 flex items-end gap-2">
                  <span className="font-serif text-5xl text-[#fff4dd]">${plan.price}</span>
                  <span className="pb-2 text-sm text-[#f4d7a3]/48">/{localPlan.interval}</span>
                </div>
                <div className="my-7 h-px bg-[#b57248]/24" />
                <ul className="space-y-3">
                  {localPlan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-[#f4d7a3]/72">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#d8b77b]" aria-hidden />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleSubscribe(planId)}
                  disabled={isLoading || !payPerUseEnabled}
                  className="tianji-love-primary mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-lg border border-[#ffb49e]/60 px-6 text-base font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {!payPerUseEnabled ? copy.hero.comingSoon : isLoading ? copy.redirecting : isAuthenticated ? copy.authCta : copy.guestCta}
                  {!payPerUseEnabled ? null : <Star className="ml-3 h-4 w-4" aria-hidden />}
                </button>
              </TianjiLovePanel>
            );
          })}
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle title={copy.compareTitle} className="mb-10" />
        <div className="grid gap-5 md:grid-cols-4">
          {copy.compare.map((item) => (
            <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      <TianjiLoveFinalCta
        imageSrc="/assets/images/hero/tianji-love-moon-pavilion-16x9.png"
        title={copy.final.title}
        buttonLabel={copy.final.button}
        href={href('/relationship/new')}
      />

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={copy.footer}
        links={[
          { label: copy.nav.loveReading, href: href('/relationship/new') },
          { label: copy.nav.ask, href: href('/ask') },
          { label: copy.nav.draw, href: href('/draw') },
          { label: copy.nav.pricing, href: href('/pricing') },
          { label: copy.nav.about, href: href('/about') },
          { label: copy.nav.login, href: href('/login') },
          { label: copy.nav.privacy, href: href('/legal/privacy') },
        ]}
      />
    </TianjiLoveShell>
  );
}
