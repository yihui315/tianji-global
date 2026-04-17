'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PLANS } from '@/lib/stripe';

const PLAN_ORDER = ['PRO_MONTHLY', 'PRO_YEARLY'] as const;

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
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

  const t = {
    title: language === 'zh' ? '选择您的方案' : 'Choose Your Plan',
    subtitle: language === 'zh'
      ? '解锁全部命理功能，解锁命运的奥秘'
      : 'Unlock all fortune features and discover the mysteries of fate',
    perMonth: language === 'zh' ? '/月' : '/month',
    perYear: language === 'zh' ? '/年' : '/year',
    save: language === 'zh' ? '省17%' : 'Save 17%',
    recommended: language === 'zh' ? '推荐' : 'Best Value',
    getStarted: language === 'zh' ? '立即开始' : 'Get Started',
    manage: language === 'zh' ? '管理订阅' : 'Manage Subscription',
    features: language === 'zh' ? '功能特点' : 'Features',
    loginPrompt: language === 'zh' ? '登录后即可订阅' : 'Sign in to subscribe',
    error,
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <div className="star-field" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 py-6 border-b border-white/[0.06]">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl">🔮</span>
              <div>
                <h1 className="text-xl font-serif text-white/90">天机全球 TianJi</h1>
                <p className="text-purple-400/60 text-xs">TianJi Global</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-2 bg-white/[0.04] rounded-full p-1 border border-white/[0.06]">
                <button
                  onClick={() => setLanguage('zh')}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    language === 'zh'
                      ? 'bg-purple-600/80 text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    language === 'en'
                      ? 'bg-purple-600/80 text-white'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Auth Links */}
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-white/05 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg text-sm transition-all duration-300 hover:scale-[1.02]"
                >
                  {language === 'zh' ? '控制台' : 'Dashboard'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/80 rounded-lg text-sm transition-all duration-300 hover:scale-[1.02]"
                >
                  {language === 'zh' ? '登录' : 'Sign In'}
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Pricing Section */}
        <section className="px-4 py-20 lg:py-32 max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white/90 mb-4">
              {t.title}
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400/80 text-sm text-center">
              {error}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {PLAN_ORDER.map((planId) => {
              const plan = PLANS[planId];
              const isYearly = planId === 'PRO_YEARLY';
              const isLoading = loadingPlan === planId;

              return (
                <div
                  key={planId}
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                    isYearly
                      ? 'bg-[#1a0a2e]/60 border-2 border-[#D4AF37]/40 shadow-[0_0_40px_rgba(212,175,55,0.08)]'
                      : 'bg-white/[0.02] border border-white/[0.06]'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isYearly && (
                    <div className="absolute top-0 right-0 bg-[#D4AF37] text-[#0a0a0a] text-xs font-bold px-4 py-1 rounded-bl-lg">
                      ⭐ {t.recommended}
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Name */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-serif text-white/90 mb-1">
                        {language === 'zh' ? plan.nameZh : plan.name}
                      </h3>
                      <p className="text-white/50 text-sm">
                        {language === 'zh' ? plan.descriptionZh : plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-serif text-white/90">
                          ${plan.price}
                        </span>
                        <span className="text-white/50">
                          {isYearly ? t.perYear : t.perMonth}
                        </span>
                      </div>
                      {isYearly && (
                        <p className="text-[#D4AF37]/80 text-sm mt-1 font-medium">
                          {t.save}
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/[0.06] mb-6" />

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {(language === 'zh' ? plan.features.zh : plan.features.en).map(
                        (feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-white/60 text-sm">
                            <svg
                              className="w-5 h-5 text-[#A78BFA] flex-shrink-0 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            {feature}
                          </li>
                        )
                      )}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSubscribe(planId)}
                      disabled={isLoading}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] ${
                        isYearly
                          ? 'bg-[#D4AF37] hover:bg-[#F5C542] text-[#0a0a0a]'
                          : 'bg-[#7C3AED]/80 hover:bg-[#7C3AED] text-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isLoading
                        ? (language === 'zh' ? '跳转中...' : 'Redirecting...')
                        : !isAuthenticated
                        ? t.loginPrompt
                        : t.getStarted}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Features Overview */}
          <div className="mt-20 text-center">
            <h3 className="text-xl font-serif text-white/80 mb-8">{t.features}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { icon: '🌟', label: '紫微斗数', labelEn: 'Zi Wei' },
                { icon: '📊', label: '八字命理', labelEn: 'Ba Zi' },
                { icon: '🔥', label: '易经占卜', labelEn: 'Yi Jing' },
                { icon: '✨', label: '西方占星', labelEn: 'Western' },
                { icon: '🎴', label: '塔罗牌', labelEn: 'Tarot' },
              ].map((item) => (
                <div
                  key={item.labelEn}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 hover:border-[#A78BFA]/30 transition-all duration-300"
                >
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <p className="text-white/70 text-sm font-serif">
                    {language === 'zh' ? item.label : item.labelEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-white/30 text-sm border-t border-white/[0.06]">
          <div className="flex justify-center gap-4 mb-2">
            <Link href="/about" className="hover:text-[#A78BFA] transition-colors duration-300">
              {language === 'zh' ? '关于我们' : 'About'}
            </Link>
            <span>·</span>
            <Link href="/legal" className="hover:text-[#A78BFA] transition-colors duration-300">
              {language === 'zh' ? '法律声明' : 'Legal'}
            </Link>
          </div>
          <p>© 2024 TianJi Global · 天机全球</p>
          <p className="mt-1">
            {language === 'zh'
              ? '融合传统智慧与现代科技'
              : 'Bridging Traditional Wisdom & Modern Technology'}
          </p>
        </footer>
      </div>
    </div>
  );
}
