'use client';

import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';
import { pricingPlans } from '@/design-system/content-tokens';
import { pricingPlans as allPricingPlans } from '@/design-system/content-tokens';
import { prices } from '@/design-system';

const STRIPE_PLANS: Record<string, string> = {
  free: '',
  premium: '/api/stripe/create-checkout-session?plan=stellar',
  deep: '/api/stripe/create-checkout-session?plan=tianji-pro',
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0 mt-0.5">
      <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SparkleIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <path d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5L8 1Z" fill="currentColor"/>
    </svg>
  );
}

interface PricingCardProps {
  planKey: 'free' | 'premium' | 'deep';
  delay?: number;
}

function PricingCard({ planKey, delay = 0 }: PricingCardProps) {
  const { lang } = useLanguage();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [loading, setLoading] = useState(false);

  const plan = pricingPlans[planKey];
  const features = planKey === 'free' ? plan.featuresFree
    : planKey === 'premium' ? plan.featuresPremium
    : plan.featuresDeep;

  const isHighlighted = planKey === 'premium';
  const isDark = planKey === 'deep';

  const handleCTAClick = async () => {
    const href = STRIPE_PLANS[planKey];
    if (!href) return;
    setLoading(true);
    try {
      window.location.href = href;
    } finally {
      setTimeout(() => setLoading(false), 5000);
    }
  };

  const ctaLabel = planKey === 'free'
    ? (lang === 'zh' ? '免费开始' : 'Get Started Free')
    : planKey === 'premium'
    ? (lang === 'zh' ? '立即订阅' : 'Subscribe Now')
    : (lang === 'zh' ? '预约深度解读' : 'Book Deep Reading');

  const href = planKey === 'free' ? '/western' : undefined;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Glow effect for highlighted plan */}
      {isHighlighted && (
        <div className="absolute -inset-px rounded-3xl opacity-40"
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
          borderColor: isHighlighted
            ? 'rgba(212,175,55,0.25)'
            : 'rgba(255,255,255,0.06)',
          boxShadow: isHighlighted
            ? '0 0 60px rgba(212,175,55,0.06), inset 0 1px 0 rgba(255,255,255,0.05)'
            : 'inset 0 1px 0 rgba(255,255,255,0.03)',
        }}
      >
        {/* Top accent bar for highlighted */}
        {isHighlighted && (
          <div className="h-px w-full" style={{
            background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)',
          }}/>
        )}

        <div className="p-7 sm:p-8 flex flex-col flex-1">
          {/* Identity badge */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase mb-1"
                style={{ color: isHighlighted ? 'rgba(212,175,55,0.7)' : 'rgba(255,255,255,0.3)' }}>
                {plan.identity[lang]}
              </p>
              <h3 className="text-xl font-serif" style={{ color: '#FFFFFFE6' }}>
                {plan.name[lang]}
              </h3>
            </div>
            {isHighlighted && (
              <div className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(212,175,55,0.1)',
                  border: '1px solid rgba(212,175,55,0.2)',
                  color: 'rgba(212,175,55,0.9)',
                }}>
                <SparkleIcon className="text-amber-400/80" />
                {lang === 'zh' ? '最受欢迎' : 'Most Popular'}
              </div>
            )}
          </div>

          {/* Price */}
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

          {/* Divider */}
          <div className="h-px mb-7" style={{ background: 'rgba(255,255,255,0.06)' }}/>

          {/* Features */}
          <ul className="space-y-3.5 flex-1">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span style={{ color: isHighlighted ? 'rgba(212,175,55,0.7)' : 'rgba(168,130,255,0.6)' }}>
                  <CheckIcon />
                </span>
                <span className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {f[lang]}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="mt-8">
            {planKey === 'free' ? (
              <a
                href={href}
                className="block w-full text-center py-3.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
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
                  border: isHighlighted
                    ? '1px solid rgba(212,175,55,0.4)'
                    : '1px solid rgba(124,58,237,0.3)',
                  color: isHighlighted ? '#0a0a0a' : 'rgba(255,255,255,0.85)',
                  boxShadow: isHighlighted ? '0 4px 24px rgba(212,175,55,0.15)' : '0 4px 24px rgba(124,58,237,0.1)',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    if (isHighlighted) {
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(212,175,55,0.25)';
                    }
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = isHighlighted ? '0 4px 24px rgba(212,175,55,0.15)' : '0 4px 24px rgba(124,58,237,0.1)';
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const heading = lang === 'zh' ? '解锁你的命运全貌' : 'Unlock Your Complete Destiny';
  const subheading = lang === 'zh'
    ? '选择适合你的能量层级，从探索到深度洞察'
    : 'Choose your energy level — from discovery to deep insight';

  return (
    <section className="relative z-10 py-24 sm:py-32 overflow-hidden">
      {/* Background nebula glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)' }}/>
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.04) 0%, transparent 70%)' }}/>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 relative">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase mb-3"
            style={{ color: 'rgba(212,175,55,0.5)' }}>
            {lang === 'zh' ? '定价方案' : 'Pricing'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-serif mb-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {heading}
          </h2>
          <p className="text-sm max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {subheading}
          </p>

          {/* Subtle divider */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.08)' }}/>
            <div className="w-1 h-1 rounded-full" style={{ background: 'rgba(212,175,55,0.4)' }}/>
            <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.08)' }}/>
          </div>
        </motion.div>

        {/* 3-column cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          <PricingCard planKey="free" delay={0} />
          <PricingCard planKey="premium" delay={0.1} />
          <PricingCard planKey="deep" delay={0.2} />
        </div>

        {/* Trust note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-[11px] mt-10"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {lang === 'zh'
            ? '✦ 所有交易受 Stripe 银行级加密保护 · 随时取消 · 隐私承诺'
            : '✦ All transactions protected by Stripe bank-grade encryption · Cancel anytime · Privacy guaranteed'}
        </motion.p>
      </div>
    </section>
  );
}
