'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GlassCard } from '@/components/ui';
import AnimatedShareButton from '@/components/AnimatedShareButton';

interface ShareSectionProps {
  type: 'ziwei' | 'bazi' | 'yijing' | 'tarot' | 'western' | 'fortune';
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
      {/* Dark overlay when using OG bg */}
      {ogBgSrc && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(10,10,10,0.72)' }}
        />
      )}

      {/* Top gradient fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${accentColor}0D 0%, transparent 30%)`,
        }}
      />

      <div className="max-w-2xl mx-auto px-6 sm:px-8 relative text-center">
        {/* Decorative top line */}
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

        {/* Heading */}
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
            命盘已解锁
          </h2>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>
            将你的命盘分享给朋友，或保存留念
          </p>
        </motion.div>

        {/* Share buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          {/* Primary share */}
          <AnimatedShareButton
            type={type}
            resultData={resultData}
            format="webp"
            language="zh"
            variant="primary"
          />

          {/* Secondary share */}
          <AnimatedShareButton
            type={type}
            resultData={resultData}
            format="png"
            language="zh"
            variant="secondary"
          />
        </motion.div>

        {/* Decorative bottom line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div
            className="h-px mx-auto"
            style={{
              background: `linear-gradient(to right, transparent, ${accentColor}44, transparent)`,
              maxWidth: '160px',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
