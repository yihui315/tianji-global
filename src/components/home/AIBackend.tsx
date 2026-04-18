'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Shield, Lock, EyeOff, Cpu, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

/**
 * AIBackend — AI Model Endorsements + Privacy Protection Icons
 *
 * Taste Rule: 克制金紫光效、大留白、神秘奢华感
 *
 * Features:
 * - 3 AI model endorsement badges with animated icons
 * - Privacy protection row (encryption, no-sharing, delete rights)
 * - Subtle animated backgrounds
 */

const AI_MODELS = [
  {
    name: 'MiniMax M2.7',
    role: lang => lang === 'zh' ? '核心推理引擎' : 'Core Reasoning Engine',
    tagline: 'Long-context window · Multi-modal · Token Plan',
    icon: '✦',
    accentColor: 'rgba(168,130,255,',
    href: 'https://www.minimaxi.com',
  },
  {
    name: 'Claude 4',
    role: lang => lang === 'zh' ? '深度命理解读' : 'Deep Interpretation',
    tagline: 'Anthropic · Constitutional AI · Long-context',
    icon: '◈',
    accentColor: 'rgba(245,158,11,',
    href: 'https://anthropic.com',
  },
  {
    name: 'GPT-4o',
    role: lang => lang === 'zh' ? '多模态生成' : 'Multi-modal Generation',
    tagline: 'OpenAI · Real-time data · Vision + Text',
    icon: '⬡',
    accentColor: 'rgba(52,211,153,',
    href: 'https://openai.com',
  },
];

const PRIVACY_ITEMS = [
  {
    icon: Lock,
    label: { zh: '银行级加密', en: 'Bank-Grade Encryption' },
    sub: { zh: 'TLS 256-bit 传输加密', en: 'TLS 256-bit in transit' },
    color: 'rgba(52,211,153,', // emerald
  },
  {
    icon: EyeOff,
    label: { zh: '数据绝不共享', en: 'Zero Data Sharing' },
    sub: { zh: '出生数据不分享给任何第三方', en: 'Birth data never shared with 3rd parties' },
    color: 'rgba(168,130,255,', // purple
  },
  {
    icon: Shield,
    label: { zh: '随时删除权', en: 'Delete Anytime' },
    sub: { zh: '一键清除所有个人数据', en: 'One-click deletion of all personal data' },
    color: 'rgba(245,158,11,', // gold
  },
  {
    icon: Globe,
    label: { zh: '全球化合规', en: 'Global Compliance' },
    sub: { zh: 'GDPR · CCPA · ISO 27001', en: 'GDPR · CCPA · ISO 27001' },
    color: 'rgba(0,212,255,', // cyan
  },
];

function AIModelBadge({ model, index }: { model: typeof AI_MODELS[0]; index: number }) {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const delay = index * 0.12;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="relative group"
    >
      <a
        href={model.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: 'rgba(255,255,255,0.015)',
          border: `1px solid ${model.accentColor}0.12)`,
        }}
      >
        {/* Glow on hover — Taste Rule: restrained */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
          style={{
            boxShadow: `0 0 30px ${model.accentColor}0.08)`,
          }}
        />

        <div className="relative">
          {/* Icon + Name row */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xl transition-transform duration-300 group-hover:scale-110"
              style={{ color: model.accentColor + '0.8)' }}
            >
              {model.icon}
            </span>
            <span
              className="text-sm font-medium"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {model.name}
            </span>
          </div>

          {/* Role */}
          <p
            className="text-xs mb-1.5"
            style={{ color: model.accentColor + '0.7)' }}
          >
            {model.role(lang)}
          </p>

          {/* Tagline */}
          <p
            className="text-[10px]"
            style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.04em' }}
          >
            {model.tagline}
          </p>
        </div>
      </a>
    </motion.div>
  );
}

function PrivacyItem({ item, index }: { item: typeof PRIVACY_ITEMS[0]; index: number }) {
  const { lang } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const Icon = item.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex items-start gap-3"
    >
      {/* Icon circle */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
        style={{
          background: `${item.color}0.08)`,
          border: `1px solid ${item.color}0.15)`,
        }}
      >
        <Icon size={14} style={{ color: item.color + '0.8)' }} />
      </div>

      {/* Text */}
      <div>
        <p
          className="text-xs font-medium mb-0.5"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {item.label[lang]}
        </p>
        <p
          className="text-[10px]"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {item.sub[lang]}
        </p>
      </div>
    </motion.div>
  );
}

export default function AIBackend() {
  const { lang } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  return (
    <section ref={sectionRef} className="relative z-10 py-24 sm:py-32 overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(42,10,58,0.4) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto px-6 sm:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Cpu size={14} style={{ color: 'rgba(168,130,255,0.6)' }} />
            <p
              className="text-[10px] tracking-[0.3em] uppercase"
              style={{ color: 'rgba(168,130,255,0.5)' }}
            >
              {lang === 'zh' ? 'AI 算力支持' : 'AI Infrastructure'}
            </p>
            <Sparkles size={14} style={{ color: 'rgba(245,158,11,0.5)' }} />
          </div>

          <h2
            className="text-center leading-tight mb-3"
            style={{
              fontFamily: 'var(--font-instrument-serif), Georgia, serif',
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            {lang === 'zh' ? '多 AI 模型协同，深度推理保障' : 'Multi-AI Orchestration for Deep Reasoning'}
          </h2>

          <p
            className="text-sm max-w-md mx-auto"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {lang === 'zh'
              ? '每个解读都由多个大语言模型交叉验证，确保命理分析既精准又符合经典框架'
              : 'Every reading is cross-validated by multiple LLMs, ensuring precision and classical framework fidelity'}
          </p>
        </motion.div>

        {/* AI Model Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {AI_MODELS.map((model, i) => (
            <AIModelBadge key={model.name} model={model} index={i} />
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-px mb-12"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)',
          }}
        />

        {/* Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mb-8"
        >
          <p
            className="text-[10px] tracking-[0.25em] uppercase mb-2"
            style={{ color: 'rgba(245,158,11,0.4)' }}
          >
            {lang === 'zh' ? '隐私安全' : 'Privacy & Security'}
          </p>
          <p
            className="text-sm"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {lang === 'zh'
              ? '你的出生数据仅用于计算，绝不用于任何其他目的'
              : 'Your birth data is used solely for calculation, never for anything else'}
          </p>
        </motion.div>

        {/* Privacy Items — 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {PRIVACY_ITEMS.map((item, i) => (
            <PrivacyItem key={item.label.en} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
