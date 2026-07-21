'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Check, CreditCard, Lock, Sparkles, Star } from 'lucide-react';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { isPayPerUseEnabled } from '@/lib/pay-per-use';
import { withLanguageParam } from '@/lib/language-routing';
import { trackRevenueFunnelEvent } from '@/lib/analytics/funnel-events';
import { PRODUCT_CATALOG } from '@/config/products';
import {
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

const paymentCopy = {
  en: {
    nav: {
      loveReading: 'Love Reading',
      ask: 'Ask',
      draw: 'Draw Timing',
      pricing: 'Pricing',
      about: 'About',
      login: 'Login',
      privacy: 'Privacy',
    },
    hero: {
      eyebrow: 'Tianji Love / Unlock',
      title: 'One question. One clearer answer.',
      body:
        'A single paid unlock gives you deeper interpretation, practical next steps, and a more complete reflection on the question that brought you here.',
      primary: 'See options below',
      comingSoon: 'Coming soon',
    },
    optionsTitle: 'One-time unlocks',
    guestCta: 'Sign in to unlock',
    authCta: 'Unlock now',
    redirecting: 'Redirecting to checkout...',
    trust: [
      { icon: Lock, title: 'Secure Stripe checkout', body: 'Your card details never touch our servers. All payments processed by Stripe.' },
      { icon: Sparkles, title: 'Instant access', body: 'After payment, your unlock is available immediately on the reading page.' },
      { icon: CreditCard, title: 'No subscription required', body: 'Pay once for a single question or timing reading. No recurring billing.' },
    ],
    footer:
      'One-time unlocks add depth, not certainty. All readings are for self-reflection and communication, not medical, legal, financial, or crisis advice.',
  },
  zh: {
    nav: {
      loveReading: '关系解读',
      ask: '提问',
      draw: '时机抽牌',
      pricing: '会员权益',
      about: '关于',
      login: '登录',
      privacy: '隐私',
    },
    hero: {
      eyebrow: 'Tianji Love / 解锁',
      title: '一个问题的更清晰答案。',
      body: '单次付费解锁后，你可以获得更深入的解释、可执行的下一步，以及对引导你来到这里的问题的更完整反思。',
      primary: '见下方选项',
      comingSoon: '即将开放',
    },
    optionsTitle: '单次解锁',
    guestCta: '登录后解锁',
    authCta: '立即解锁',
    redirecting: '正在跳转到结账...',
    trust: [
      { icon: Lock, title: '安全 Stripe 结账', body: '卡号信息不经过我们的服务器，所有支付由 Stripe 处理。' },
      { icon: Sparkles, title: '即时访问', body: '支付完成后，解锁权限立即在解读页面可用。' },
      { icon: CreditCard, title: '无需订阅', body: '为单个问题或时机解读一次性付费，无周期性扣款。' },
    ],
    footer: '单次解锁增加的是深度，不是确定性。所有解读仅用于自我理解与沟通参考，不构成医疗、法律、财务或危机建议。',
  },
} as const;

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const readingSessionId = searchParams.get('session_id') || searchParams.get('readingSessionId') || '';
  const source = searchParams.get('source') || 'love_reading';
  const [language] = useSyncedLanguage('en');
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null);
  const [error, setError] = useState('');
  const copy = paymentCopy[language];
  const href = (path: string) => withLanguageParam(path, language);
  const payPerUseEnabled = isPayPerUseEnabled();

  useEffect(() => {
    void trackRevenueFunnelEvent('pricing_view', {
      lang: language,
      surface: 'payment_page',
      source,
      hasReadingSessionId: !!readingSessionId,
    });
  }, [language, source, readingSessionId]);

  const handleUnlock = async (productId: string) => {
    if (!payPerUseEnabled) return;

    void trackRevenueFunnelEvent('unlock_click', {
      lang: language,
      surface: 'payment_page',
      productId,
      authenticated: true,
      source,
    });

    setLoadingProduct(productId);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          readingSessionId,
          source,
          locale: language === 'zh' ? 'zh-CN' : 'en',
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.code || 'Checkout failed');
      }
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoadingProduct(null);
    }
  };

  const oneTimeProducts = [
    {
      id: 'ask_unlock',
      product: PRODUCT_CATALOG.ASK_UNLOCK,
      cta: copy.authCta,
      loading: loadingProduct === 'ask_unlock',
      badge: null,
    },
    {
      id: 'draw_unlock',
      product: PRODUCT_CATALOG.DRAW_UNLOCK,
      cta: copy.authCta,
      loading: loadingProduct === 'draw_unlock',
      badge: null,
    },
  ];

  return (
    <TianjiLoveShell className="tianji-love-payment-page" ariaLabel="Tianji Love payment page">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={[
          { label: copy.nav.loveReading, href: href('/relationship/new') },
          { label: copy.nav.ask, href: href('/ask') },
          { label: copy.nav.draw, href: href('/draw') },
          { label: copy.nav.pricing, href: href('/pricing') },
          { label: copy.nav.about, href: href('/about') },
          { label: copy.nav.login, href: href('/login'), mobile: true },
        ]}
        cta={{ label: copy.hero.primary, href: '#options' }}
      />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-12 pt-16 sm:px-8 lg:min-h-[480px] lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{copy.hero.eyebrow}</p>
          <h1 className="font-serif text-[2.7rem] font-semibold leading-[1.08] text-[#ffe3b4] sm:text-[4.2rem]">
            {copy.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f5d8aa]/78">{copy.hero.body}</p>
        </div>

        <TianjiLovePanel className="p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-3">
            {copy.trust.map((item) => (
              <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
            ))}
          </div>
        </TianjiLovePanel>
      </section>

      <section id="options" className="relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <TianjiLoveSectionTitle title={copy.optionsTitle} className="mb-10" />
        {error ? (
          <div className="mx-auto mb-6 max-w-md rounded-lg border border-[#ff7f80]/30 bg-[#ff5264]/10 px-4 py-3 text-center text-sm text-[#ffb4a3]">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          {oneTimeProducts.map(({ id, product, cta, loading }) => (
            <TianjiLovePanel key={id} as="article" className="p-7">
              <p className="text-xs uppercase tracking-[0.28em] text-[#d8b77b]/64">One-time</p>
              <h2 className="mt-4 font-serif text-3xl text-[#ffe3b4]">
                {language === 'zh' ? product.nameZh : product.name}
              </h2>
              <div className="mt-6 flex items-end gap-2">
                <span className="font-serif text-5xl text-[#fff4dd]">{product.displayPrice}</span>
                <span className="pb-2 text-sm text-[#f4d7a3]/48">one-time</span>
              </div>
              <div className="my-7 h-px bg-[#b57248]/24" />
              <button
                type="button"
                onClick={() => handleUnlock(id)}
                disabled={loading || !payPerUseEnabled}
                className="tianji-love-primary mt-2 inline-flex min-h-14 w-full items-center justify-center rounded-lg border border-[#ffb49e]/60 px-6 text-base font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {!payPerUseEnabled ? copy.hero.comingSoon : loading ? copy.redirecting : cta}
                {!payPerUseEnabled ? null : <Star className="ml-3 h-4 w-4" aria-hidden />}
              </button>
            </TianjiLovePanel>
          ))}
        </div>
      </section>

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
