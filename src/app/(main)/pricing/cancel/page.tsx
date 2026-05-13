'use client';

import { ArrowLeft, HeartHandshake, Lock, Sparkles, XCircle } from 'lucide-react';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { withLanguageParam } from '@/lib/language-routing';
import {
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
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
    title: 'No charge was made.',
    body:
      'You are back on the free path. The first signal is still available whenever you want to continue with love, timing, or compatibility.',
    primary: 'View Plans',
    secondary: 'Back to Home',
    trust: [
      { icon: Lock, title: 'Still private', body: 'Cancelling checkout does not publish or share your questions.' },
      { icon: HeartHandshake, title: 'Free path remains', body: 'You can keep using the preview and compatibility flow before upgrading.' },
      { icon: Sparkles, title: 'Upgrade later', body: 'Return to pricing only when a reading earns deeper attention.' },
    ],
    footer:
      'Tianji Love keeps the free path useful and the paid path optional. Readings are for reflection, not certainty or crisis advice.',
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
    title: '本次没有产生扣款。',
    body: '你已经回到免费路径。想继续时，爱情解读、时机窗口和关系合盘的第一段信号仍然可以使用。',
    primary: '重新查看方案',
    secondary: '返回首页',
    trust: [
      { icon: Lock, title: '仍然私密', body: '取消结账不会公开或分享你的问题。' },
      { icon: HeartHandshake, title: '免费路径保留', body: '升级前仍可以使用预览和关系合盘流程。' },
      { icon: Sparkles, title: '之后再升级', body: '只有当一次解读值得深入时，再回到价格页。' },
    ],
    footer: 'Tianji Love 保持免费路径可用，也让付费路径保持可选。解读用于反思，不承诺确定性或危机建议。',
  },
} as const;

export default function CancelPage() {
  const [language] = useSyncedLanguage('en');
  const t = copy[language];
  const href = (path: string) => withLanguageParam(path, language);

  return (
    <TianjiLoveShell className="tianji-love-checkout-cancel" ariaLabel="Tianji Love checkout cancelled page">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={[
          { label: t.nav.compatibility, href: href('/relationship/new') },
          { label: t.nav.loveReading, href: href('/ask') },
          { label: t.nav.timing, href: href('/draw') },
          { label: t.nav.pricing, href: href('/pricing'), mobile: true },
          { label: t.nav.privacy, href: href('/legal/privacy') },
        ]}
        cta={{ label: t.nav.pricing, href: href('/pricing') }}
      />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-92px)] w-full max-w-5xl items-center px-5 py-14 sm:px-8">
        <TianjiLovePanel className="w-full p-7 text-center sm:p-10">
          <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-[radial-gradient(circle,rgba(244,215,163,0.12),rgba(181,114,72,0.08)_48%,transparent_76%)]">
            <XCircle className="h-10 w-10 text-[#d8b77b]" aria-hidden />
          </div>
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8b77b]/66">{t.eyebrow}</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#f4d7a3]/72">{t.body}</p>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {t.trust.map((item) => (
              <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
            ))}
          </div>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <TianjiLoveButton href={href('/pricing')}>{t.primary}</TianjiLoveButton>
            <TianjiLoveButton href={href('/')} variant="secondary">
              <ArrowLeft className="mr-3 h-4 w-4" aria-hidden />
              {t.secondary}
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
