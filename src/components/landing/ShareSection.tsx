'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GlassCard } from '@/components/ui';
import AnimatedShareButton from '@/components/AnimatedShareButton';

type ShareCardType = 'ziwei' | 'bazi' | 'tarot' | 'synastry';

interface ShareSectionProps {
  type: ShareCardType;
  resultData: Record<string, unknown>;
  ogBgSrc?: string;
  accentColor?: string;
  goldColor?: string;
}

export default function ShareSection({
  type,
  resultData,
  ogBgSrc,
  accentColor = '#7c3aed',
  goldColor = '#D4AF37',
}: ShareSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32"
      style={{
        background: ogBgSrc
          ? `url(${ogBgSrc}) center/cover no-repeat`
          : 'linear-gradient(180deg, #0a0a0a 0%, #1a0a3a 50%, #0a0a0a 100%)',
      }}
    >
      {ogBgSrc && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(10,10,10,0.72)' }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, ${accentColor}0D 0%, transparent 30%)` }}
      />

      <div className="max-w-2xl mx-auto px-6 sm:px-8 relative text-center">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div
            className="h-px mx-auto"
            style={{
              background: `linear-gradient(to right, transparent, ${goldColor}80, transparent)`,
              maxWidth: '200px',
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-6"
        >
          <h2
            className="font-serif font-bold mb-3"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              background: `linear-gradient(135deg, ${goldColor} 0%, #F0D875 50%, ${goldColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.1em',
              filter: `drop-shadow(0 0 20px ${goldColor}33)`,
            }}
          >
            Your reading is share-ready.
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
            Export a quiet, premium card for memory, reflection, or a private share.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <AnimatedShareButton
            type={type}
            resultData={resultData}
            format="webp"
            language="zh"
            variant="primary"
          />

          <AnimatedShareButton
            type={type}
            resultData={resultData}
            format="png"
            language="zh"
            variant="secondary"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <GlassCard
            level="soft"
            className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] inline-block"
          >
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>
              The visual background stays text-free. The share title is rendered in code.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
