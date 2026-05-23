'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import AnimatedShareButton from '@/components/AnimatedShareButton';
import { GlassCard } from '@/components/ui';

type ShareCardType = 'ziwei' | 'bazi' | 'tarot' | 'synastry';

interface ShareSectionProps {
  type?: ShareCardType;
  resultData?: Record<string, unknown>;
  ogBgSrc?: string;
  accentColor?: string;
  goldColor?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}

function tianjiLoveAccent(color: string, fallback: string) {
  return color.toLowerCase() === '#7c3aed' || color.toLowerCase() === '#a78bfa' ? fallback : color;
}

export default function ShareSection({
  type,
  resultData,
  ogBgSrc,
  accentColor = '#ff7c82',
  goldColor = '#d8b77b',
  title = 'Your reading is share-ready.',
  subtitle = 'Export a quiet, premium card for memory, reflection, or a private share.',
  children,
}: ShareSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const loveAccent = tianjiLoveAccent(accentColor, '#ff7c82');
  const loveGold = tianjiLoveAccent(goldColor, '#d8b77b');

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-32"
      style={{
        background: ogBgSrc
          ? `url(${ogBgSrc}) center/cover no-repeat`
          : 'linear-gradient(180deg, #03040a 0%, #050812 50%, #03040a 100%)',
      }}
    >
      {ogBgSrc ? <div className="pointer-events-none absolute inset-0" style={{ background: 'rgba(3,4,10,0.74)' }} /> : null}

      <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(to bottom, ${loveAccent}16 0%, transparent 30%)` }} />

      <div className="relative mx-auto max-w-2xl px-6 text-center sm:px-8">
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div
            className="mx-auto h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${loveGold}80, transparent)`,
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
            className="mb-3 font-serif font-bold"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              background: `linear-gradient(135deg, ${loveGold} 0%, #ffe3b4 50%, ${loveGold} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0',
              filter: `drop-shadow(0 0 20px ${loveGold}33)`,
            }}
          >
            {title}
          </h2>
          <p className="text-sm" style={{ color: 'rgba(244,215,163,0.58)', letterSpacing: '0' }}>
            {subtitle}
          </p>
        </motion.div>

        {type && resultData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <AnimatedShareButton type={type} resultData={resultData} format="webp" language="zh" variant="primary" />
            <AnimatedShareButton type={type} resultData={resultData} format="png" language="zh" variant="secondary" />
          </motion.div>
        ) : null}

        {children ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mb-8"
          >
            {children}
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <GlassCard level="soft" className="inline-block rounded-lg border border-[#b57248]/26 bg-[#070b16]/66 p-5">
            <p className="text-xs" style={{ color: 'rgba(244,215,163,0.46)', letterSpacing: '0' }}>
              The visual background stays text-free. The share title is rendered in code.
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
