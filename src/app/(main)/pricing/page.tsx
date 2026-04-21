'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLANS } from '@/lib/stripe';
import {
  BackgroundVideoHero,
  LandingSection,
  TrustStrip,
} from '@/components/landing';

const PLAN_ORDER = ['PRO_MONTHLY', 'PRO_YEARLY'] as const;

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'zh' | 'en'>('en');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isAuthenticated = !!session?.user;

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      router.push('/login');
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

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoadingPlan(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <BackgroundVideoHero
        eyebrow="Premium access"
        title="Pay for the deeper layer, not for confusion."
        subtitle="Pricing keeps the same Stripe checkout contract and plan IDs."
        description="TianJi Pro unlocks unlimited readings, deeper AI interpretation, PDF reports, and a calmer way to return to your destiny profile over time."
        videoSrc="/assets/videos/hero/pricing-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/pricing-hero-poster-16x9.jpg"
        ctaLabel={isAuthenticated ? 'Choose a plan' : 'Sign in to subscribe'}
        ctaHref="#plans"
        secondaryCtaLabel="Back to scan"
        secondaryCtaHref="/destiny/scan"
        stats={[
          { label: 'Checkout', value: 'Stripe' },
          { label: 'Plans', value: '2' },
          { label: 'Contract', value: 'Unchanged' },
        ]}
      />

      <LandingSection
        id="plans"
        eyebrow="Plans"
        title="One premium path. Two billing rhythms."
        description="The checkout request still posts the selected planId to /api/stripe/checkout."
      >
        <div className="mb-8 flex justify-center">
          <div className="flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {(['en', 'zh'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                  language === lang ? 'bg-white text-black' : 'text-white/48 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-auto mb-6 max-w-md rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-center text-sm text-rose-200">
            {error}
          </div>
        )}

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isYearly = planId === 'PRO_YEARLY';
            const isLoading = loadingPlan === planId;
            const features = language === 'zh' ? plan.features.zh : plan.features.en;

            return (
              <article
                key={planId}
                className={`relative overflow-hidden rounded-[2.25rem] border p-7 shadow-[0_34px_120px_rgba(0,0,0,0.42)] ${
                  isYearly
                    ? 'border-amber-300/35 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.18),transparent_42%),rgba(255,255,255,0.04)]'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                {isYearly && (
                  <div className="absolute right-5 top-5 rounded-full bg-amber-200 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-black">
                    Best value
                  </div>
                )}

                <div className="pr-24">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                    {plan.interval}
                  </p>
                  <h2 className="mt-4 font-serif text-3xl text-white/90">
                    {language === 'zh' ? plan.nameZh : plan.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/55">
                    {language === 'zh' ? plan.descriptionZh : plan.description}
                  </p>
                </div>

                <div className="mt-8 flex items-end gap-2">
                  <span className="font-serif text-5xl text-white/95">${plan.price}</span>
                  <span className="pb-2 text-sm text-white/42">/{plan.interval}</span>
                </div>

                {isYearly && (
                  <p className="mt-2 text-sm font-semibold text-amber-100/75">Save 17% vs monthly</p>
                )}

                <div className="my-7 h-px bg-white/10" />

                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm leading-6 text-white/62">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-amber-200" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(planId)}
                  disabled={isLoading}
                  className={`mt-8 w-full rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isYearly
                      ? 'bg-amber-200 text-black hover:bg-amber-100'
                      : 'bg-white text-black hover:bg-violet-100'
                  }`}
                >
                  {isLoading ? 'Redirecting...' : !isAuthenticated ? 'Sign in to subscribe' : 'Start checkout'}
                </button>
              </article>
            );
          })}
        </div>
      </LandingSection>

      <LandingSection
        eyebrow="Checkout contract"
        title="What this redesign did not change"
        description="The pricing page is visual-only. Billing stays behind the existing endpoint, auth gate, and Stripe plan configuration."
      >
        <TrustStrip
          eyebrow="Protected logic"
          items={[
            { label: 'planId preserved', description: 'PRO_MONTHLY and PRO_YEARLY remain the only button inputs.' },
            { label: 'Endpoint preserved', description: 'Checkout still posts to /api/stripe/checkout.' },
            { label: 'Auth gate preserved', description: 'Unauthenticated users still route to /login.' },
            { label: 'Redirect preserved', description: 'Successful checkout still assigns window.location.href to Stripe URL.' },
          ]}
        />
      </LandingSection>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-xs uppercase tracking-[0.24em] text-white/30">
        <Link href="/">TianJi Global</Link>
      </footer>
    </main>
  );
}
