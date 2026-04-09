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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/30 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-6 border-b border-white/10">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3">
              <span className="text-2xl">🔮</span>
              <div>
                <h1 className="text-xl font-bold text-white">天机全球 TianJi</h1>
                <p className="text-purple-300 text-xs">TianJi Global</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <div className="flex items-center gap-2 bg-white/10 rounded-full p-1">
                <button
                  onClick={() => setLanguage('zh')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    language === 'zh'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    language === 'en'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Auth Links */}
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition"
                >
                  {language === 'zh' ? '控制台' : 'Dashboard'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm transition"
                >
                  {language === 'zh' ? '登录' : 'Sign In'}
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Pricing Section */}
        <section className="px-6 py-16 max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t.title}
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm text-center">
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
                  className={`relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                    isYearly
                      ? 'bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border-2 border-amber-400/50 shadow-2xl shadow-amber-500/20'
                      : 'bg-slate-800/60 border border-white/10'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isYearly && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-slate-900 text-xs font-bold px-4 py-1 rounded-bl-lg">
                      ⭐ {t.recommended}
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Name */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {language === 'zh' ? plan.nameZh : plan.name}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        {language === 'zh' ? plan.descriptionZh : plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                          ${plan.price}
                        </span>
                        <span className="text-slate-400">
                          {isYearly ? t.perYear : t.perMonth}
                        </span>
                      </div>
                      {isYearly && (
                        <p className="text-amber-400 text-sm mt-1 font-medium">
                          {t.save}
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white/10 mb-6" />

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {(language === 'zh' ? plan.features.zh : plan.features.en).map(
                        (feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                            <svg
                              className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5"
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
                      className={`w-full py-3 rounded-lg font-semibold transition-all ${
                        isYearly
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-900'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
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
          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold text-white mb-8">{t.features}</h3>
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
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-purple-500/30 transition"
                >
                  <span className="text-2xl mb-2 block">{item.icon}</span>
                  <p className="text-white text-sm font-medium">
                    {language === 'zh' ? item.label : item.labelEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 text-slate-500 text-sm border-t border-white/10">
          <div className="flex justify-center gap-4 mb-2">
            <Link href="/about" className="hover:text-purple-400 transition-colors">
              {language === 'zh' ? '关于我们' : 'About'}
            </Link>
            <span>·</span>
            <Link href="/legal" className="hover:text-purple-400 transition-colors">
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
