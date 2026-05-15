'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, FileText, History, Lock, Sparkles } from 'lucide-react';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import {
  TianjiLoveButton,
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
      pricing: 'Pricing',
      privacy: 'Privacy',
    },
    eyebrow: 'Tianji Love / Checkout',
    title: 'Your deeper love practice is open.',
    body:
      'Thank you. Your plan is active, and the next reading can carry more history, depth, and report-ready clarity.',
    order: 'Order reference',
    primary: 'Go to Dashboard',
    secondary: 'Start a Love Reading',
    included: [
      { icon: History, title: 'Reading history', body: 'Return to love, timing, and compatibility patterns over time.' },
      { icon: FileText, title: 'Deeper reports', body: 'Keep fuller interpretations when a reading matters enough to revisit.' },
      { icon: Lock, title: 'Privacy stays first', body: 'Public share surfaces still hide birth date, time, location, and timezone by default.' },
    ],
    footer:
      'Subscriptions unlock deeper reflection and history. Readings remain for self-reflection and communication, not medical, legal, financial, or crisis advice.',
  },
  zh: {
    nav: {
      compatibility: '关系合盘',
      loveReading: '爱情解读',
      timing: '时机',
      pricing: '会员权益',
      privacy: '隐私',
    },
    eyebrow: 'Tianji Love / 结账',
    title: '更深入的爱情练习已经开启。',
    body: '谢谢你。会员权益已生效，下一次解读可以承载更多历史、深度和更适合保存的报告清晰度。',
    order: '订单参考',
    primary: '进入 Dashboard',
    secondary: '开始爱情解读',
    included: [
      { icon: History, title: '解读历史', body: '长期回看爱情、时机和关系合盘中的重复模式。' },
      { icon: FileText, title: '更深报告', body: '当一次解读值得保留时，获得更完整的解释和报告结构。' },
      { icon: Lock, title: '隐私优先', body: '公开分享默认仍不展示出生日期、时间、地点和时区。' },
    ],
    footer: '订阅解锁更深入的反思与历史记录。所有解读仅用于自我理解与沟通参考，不构成医疗、法律、财务或危机建议。',
  },
} as const;

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [language] = useSyncedLanguage('en');
  const t = copy[language];
  const href = (path: string) => withLanguageParam(path, language);

  return (
    <TianjiLoveShell className="tianji-love-checkout-success" ariaLabel="Tianji Love checkout success page">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={[
          { label: t.nav.compatibility, href: href('/relationship/new') },
          { label: t.nav.loveReading, href: href('/ask') },
          { label: t.nav.timing, href: href('/draw') },
          { label: t.nav.pricing, href: href('/pricing'), mobile: true },
          { label: t.nav.privacy, href: href('/legal/privacy') },
        ]}
        cta={{ label: t.secondary, href: href('/ask') }}
      />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-5xl items-center px-5 py-14 sm:px-8">
        <TianjiLovePanel className="w-full p-7 text-center sm:p-10">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[radial-gradient(circle,rgba(255,124,130,0.22),rgba(216,183,123,0.08)_48%,transparent_76%)]">
            <CheckCircle2 className="h-10 w-10 text-[#ffe3b4]" aria-hidden />
          </div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8b77b]/66">{t.eyebrow}</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#f4d7a3]/72">{t.body}</p>
          {sessionId ? (
            <p className="mt-5 text-xs text-[#f4d7a3]/42">
              {t.order}: <span className="font-mono">{sessionId.slice(0, 20)}...</span>
            </p>
          ) : null}

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {t.included.map((item) => (
              <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
            ))}
          </div>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <TianjiLoveButton href={href('/dashboard')}>{t.primary}</TianjiLoveButton>
            <TianjiLoveButton href={href('/ask')} variant="secondary">
              {t.secondary}
              <Sparkles className="ml-3 h-4 w-4" aria-hidden />
            </TianjiLoveButton>
          </div>
        </TianjiLovePanel>
      </section>

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={t.footer}
        links={[
          { label: t.nav.compatibility, href: href('/relationship/new') },
          { label: t.nav.loveReading, href: href('/ask') },
          { label: t.nav.timing, href: href('/draw') },
          { label: t.nav.pricing, href: href('/pricing') },
          { label: t.nav.privacy, href: href('/legal/privacy') },
        ]}
      />
    </TianjiLoveShell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <SuccessContent />
    </Suspense>
  );
}

function CheckoutFallback() {
  return (
    <TianjiLoveShell>
      <div className="relative z-10 flex min-h-screen items-center justify-center text-[#ffe3b4]">Loading...</div>
    </TianjiLoveShell>
  );
}
