'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GlassCard } from '@/components/ui';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import ZiWeiPalaceAnimation from '@/components/animations/ZiWeiPalaceAnimation';

interface ZiweiResultSectionProps {
  birthday: string;
  birthTime: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
  aiInterpretation?: string;
  disclaimer?: string;
  aiMeta?: {
    provider: string;
    model: string;
    latencyMs: number;
    costUSD: number;
  };
}

/* ═══════════════════════════════════════════
   AI Result Card
   ═══════════════════════════════════════════ */
function AIResultCard({ text, disclaimer, aiMeta }: {
  text: string;
  disclaimer?: string;
  aiMeta?: { model: string; latencyMs: number; costUSD: number };
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard level="card" className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20 backdrop-blur-md">
        {/* Top gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)',
        }}/>

        {/* AI badge */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium"
            style={{
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.2)',
              color: 'rgba(212,175,55,0.85)',
            }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L6.2 3.8L9 4.2L7 6.2L7.6 9L5 7.6L2.4 9L3 6.2L1 4.2L3.8 3.8L5 1Z" fill="currentColor"/>
            </svg>
            AI 命盘解读
          </div>
        </div>

        {/* Interpretation text */}
        <div
          className="whitespace-pre-wrap leading-relaxed text-sm"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {text}
        </div>

        {/* Disclaimer */}
        {disclaimer && (
          <p className="mt-5 pt-4 text-[11px] italic border-t border-white/[0.06]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {disclaimer}
          </p>
        )}

        {/* AI meta */}
        {aiMeta && (
          <div className="mt-4 pt-3 flex justify-between text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            <span>{aiMeta.model}</span>
            <span>{aiMeta.latencyMs}ms · ${aiMeta.costUSD?.toFixed(4)}</span>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Palace Chart + Share
   ═══════════════════════════════════════════ */
function PalaceChartSection({ birthday, birthTime, birthdayType, gender }: {
  birthday: string;
  birthTime: number;
  birthdayType: 'solar' | 'lunar';
  gender: 'male' | 'female';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard level="card" className="rounded-2xl border border-white/[0.06] bg-black/20 backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(212,175,55,0.8), rgba(168,130,255,0.8))' }}/>
            <span className="text-xs font-serif tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
              紫微星盘 · Zi Wei Palace
            </span>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full" style={{ color: 'rgba(168,130,255,0.6)', background: 'rgba(168,130,255,0.08)', border: '1px solid rgba(168,130,255,0.15)' }}>
            Animated
          </span>
        </div>

        {/* Chart */}
        <div className="flex justify-center py-6">
          <ZiWeiPalaceAnimation
            birthDate={birthday}
            birthTime={birthTime}
            gender={gender}
            birthdayType={birthdayType}
            width={380}
            height={380}
            playing={true}
          />
        </div>

        {/* Share button */}
        <div className="flex justify-center pb-6">
          <AnimatedShareButton
            type="ziwei"
            resultData={{ birthday, birthTime, birthdayType, gender }}
            format="webp"
            language="zh"
            variant="primary"
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   Main Result Section
   ═══════════════════════════════════════════ */
export default function ZiweiResultSection(props: ZiweiResultSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="relative z-10 py-16 sm:py-24">
      {/* Background nebula */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 70%)' }}/>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-10" style={{ background: 'rgba(255,255,255,0.08)' }}/>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(212,175,55,0.5)' }}/>
            <div className="h-px w-10" style={{ background: 'rgba(255,255,255,0.08)' }}/>
          </div>
          <h2 className="text-2xl font-serif" style={{ color: 'rgba(255,255,255,0.85)' }}>
            你的紫微命盘
          </h2>
          <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {props.birthday} · {props.birthdayType === 'lunar' ? '农历' : '阳历'} · {props.gender === 'male' ? '男' : '女'}
          </p>
        </motion.div>

        {/* AI Result */}
        {props.aiInterpretation && (
          <div className="mb-8">
            <AIResultCard
              text={props.aiInterpretation}
              disclaimer={props.disclaimer}
              aiMeta={props.aiMeta}
            />
          </div>
        )}

        {/* Palace Chart + Share */}
        <PalaceChartSection {...props} />
      </div>
    </section>
  );
}
