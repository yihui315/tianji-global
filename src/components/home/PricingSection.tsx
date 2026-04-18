'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { pricingPlans } from '@/design-system/content-tokens';

type Language = 'zh' | 'en';
type PlanKey = 'free' | 'premium' | 'deep';

const STRIPE_PLANS: Record<PlanKey, string> = {
  free: '',
  premium: '/api/stripe/create-checkout-session?plan=stellar',
  deep: '/api/stripe/create-checkout-session?plan=tianji-pro',
};

const PLAN_FEATURES: Record<PlanKey, Array<Record<Language, string>>> = {
  free: [
    { zh: '基础命运扫描入口', en: 'Basic destiny scan access' },
    { zh: '部分结果预览', en: 'Partial result preview' },
    { zh: '有限历史记录', en: 'Limited reading history' },
    { zh: '基础时间窗口提示', en: 'Basic timing window hints' },
  ],
  premium: [
    { zh: '完整命运解读', en: 'Full destiny reading' },
    { zh: '关系、财富、行动建议解锁', en: 'Relationship, wealth, and action unlocks' },
    { zh: '更长时间线与关键窗口', en: 'Longer timeline with turning points' },
    { zh: '可分享的一句话与图卡', en: 'Shareable one-liners and cards' },
    { zh: '统一画像持续累积', en: 'Persistent unified destiny profile' },
  ],
  deep: [
    { zh: '包含 Premium 全部能力', en: 'Everything in Premium' },
    { zh: '深度关系与多档案管理', en: 'Deep relationship and multi-profile support' },
    { zh: '更长周期的趋势观察', en: 'Longer-range trend visibility' },
    { zh: '优先生成与导出能力', en: 'Priority generation and export support' },
    { zh: '更适合顾问式使用场景', en: 'Best for advisor-style workflows' },
  ],
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0 mt-0.5">
      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5L8 1Z" fill="currentColor" />
    </svg>
  );
}

interface PricingCardProps {
  planKey: PlanKey;
  delay?: number;
}

function PricingCard({ planKey, delay = 0 }: PricingCardProps) {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [loading, setLoading] = useState(false);

  const plan = pricingPlans[planKey];
  const features = PLAN_FEATURES[planKey];
  const isHighlighted = planKey === 'premium';
  const isDark = planKey === 'deep';

  const handleCTAClick = () => {
    const href = STRIPE_PLANS[planKey];
    if (!href) return;

    setLoading(true);
    window.location.href = href;
  };

  const ctaLabel =
    planKey === 'free'
      ? lang === 'zh'
        ? '免费开始'
        : 'Get Started Free'
      : planKey === 'premium'
        ? lang === 'zh'
          ? '立即订阅'
          : 'Subscribe Now'
        : lang === 'zh'
          ? '预约深度解读'
          : 'Book Deep Reading';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {isHighlighted && (
        <div
          className="absolute -inset-px rounded-3xl opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(124,58,237,0.2) 100%)',
            filter: 'blur(20px)',
          }}
          aria-hidden="true"
        />
      )}

      <div
        className="relative h-full rounded-3xl border overflow-hidden flex flex-col"
        style={{
          background: isHighlighted
            ? 'linear-gradient(160deg, #0a0a0a 0%, #1a0a2e 100%)'
            : isDark
              ? 'linear-gradient(160deg, #0f0a1e 0%, #0a0a0a 100%)'
              : '#0a0a0a',
          borderColor: isHighlighted ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.06)',
          boxShadow: isHighlighted
            ? '0 0 60px rgba(212,175,55,0.06), inset 0 1px 0 rgba(255,255,255,0.05)'
            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {isHighlighted && (
          <div
            className="h-px w-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }}
          />
        )}

        <div className="p-7 sm:p-8 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p
                className="text-[10px] tracking-[0.2em] uppercase mb-1"
                style={{ color: isHighlighted ? 'rgba(212,175,55,0.7)' : 'rgba(255,255,255,0.3)' }}
              >
                {plan.identity[lang]}
              </p>
              <h3 className="text-xl font-serif" style={{ color: '#FFFFFFE6' }}>
                {plan.name[lang]}
              </h3>
            </div>

            {isHighlighted && (
              <div
                className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: 'rgba(212,175,55,0.9)',
                }}
              >
                <SparkleIcon className="text-amber-400/80" />
                {lang === 'zh' ? '最受欢迎' : 'Most Popular'}
              </div>
            )}
          </div>

          <div className="mb-7">
            <div className="flex items-end gap-1">
              <span className="text-4xl font-serif tracking-tight" style={{ color: '#FFFFFFCC' }}>
                {plan.price}
              </span>
              <span className="text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {plan.period[lang]}
              </span>
            </div>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {plan.tagline[lang]}
            </p>
          </div>

          <div className="h-px mb-7" style={{ background: 'rgba(255,255,255,0.06)' }} />

          <ul className="space-y-3.5 flex-1">
            {features.map((feature, index) => (
              <li key={`${planKey}-${index}`} className="flex items-start gap-2.5">
                <span style={{ color: isHighlighted ? 'rgba(212,175,55,0.7)' : 'rgba(168,130,255,0.6)' }}>
                  <CheckIcon />
                </span>
                <span className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {feature[lang]}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            {planKey === 'free' ? (
              <a
                href="/western"
                className="block w-full text-center py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {ctaLabel}
              </a>
            ) : (
              <button
                onClick={handleCTAClick}
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-60"
                style={{
                  background: isHighlighted
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.9) 0%, rgba(196,145,40,0.9) 100%)'
                    : 'rgba(124,58,237,0.2)',
                  border: isHighlighted ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(124,58,237,0.3)',
                  color: isHighlighted ? '#0a0a0a' : 'rgba(255,255,255,0.85)',
                  boxShadow: isHighlighted ? '0 4px 24px rgba(212,175,55,0.15)' : '0 4px 24px rgba(124,58,237,0.1)',
                }}
              >
                {loading ? (lang === 'zh' ? '跳转中...' : 'Redirecting...') : ctaLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PricingSection() {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section className="relative z-10 py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: 'rgba(212,175,55,0.5)' }}>
            {lang === 'zh' ? '定价方案' : 'Pricing'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {lang === 'zh' ? '解锁你的完整命运画像' : 'Unlock Your Complete Destiny'}
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {lang === 'zh'
              ? '从探索到深度解读，选择适合你当前阶段的方案。'
              : 'Choose the level that fits your current stage, from discovery to deep insight.'}
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(212,175,55,0.4)' }} />
            <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          <PricingCard planKey="free" delay={0} />
          <PricingCard planKey="premium" delay={0.1} />
          <PricingCard planKey="deep" delay={0.2} />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-[11px] mt-10"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {lang === 'zh'
            ? '所有交易受 Stripe 银行级加密保护 · 可随时取消 · 隐私优先'
            : 'All transactions are protected by Stripe bank-grade encryption · Cancel anytime · Privacy first'}
        </motion.p>
      </div>
    </section>
  );
}
