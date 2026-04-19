'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   ScrollNarrativeSection — Reveals destiny/unfolding story on scroll
   Taste Rule: cinematic luxury, large negative space, parallax

   modules: ziwei / bazi / yijing / tarot / western / fortune
   ═══════════════════════════════════════════════════════════════ */

interface NarrativeBlock {
  label: string;      // e.g. "01", "命宫"
  heading: string;   // Chinese heading
  body: string;       // Short paragraph
  align?: 'left' | 'center' | 'right';
}

interface ScrollNarrativeSectionProps {
  accentColor?: string;
  goldColor?: string;
  blocks: NarrativeBlock[];
}

const blockVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: i * 0.15,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export default function ScrollNarrativeSection({
  accentColor = '#7c3aed',
  goldColor = '#D4AF37',
  blocks,
}: ScrollNarrativeSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-36"
      style={{ background: '#0a0a0a' }}
    >
      {/* Background nebula */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${accentColor}0A 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 relative">
        {blocks.map((block, i) => {
          const align = block.align ?? 'center';
          return (
            <motion.div
              key={i}
              custom={i}
              variants={blockVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className={`mb-20 last:mb-0 ${
                align === 'left' ? 'ml-0' : align === 'right' ? 'ml-auto max-w-lg' : 'mx-auto max-w-xl'
              }`}
            >
              {/* Label badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 + 0.1 }}
                className="flex items-center gap-3 mb-5"
              >
                <div
                  className="w-8 h-px"
                  style={{ background: `linear-gradient(to right, transparent, ${goldColor})` }}
                />
                <span
                  className="text-[10px] tracking-[0.25em] uppercase font-medium"
                  style={{ color: `${accentColor}CC` }}
                >
                  {block.label}
                </span>
                <div
                  className="w-8 h-px"
                  style={{ background: `linear-gradient(to left, transparent, ${goldColor})` }}
                />
              </motion.div>

              {/* Heading */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15 + 0.2 }}
                className={`font-serif font-bold mb-4 ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
                style={{
                  fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                  background: `linear-gradient(135deg, ${goldColor}CC 0%, #F0D87566 50%, ${goldColor}99 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.05em',
                }}
              >
                {block.heading}
              </motion.h2>

              {/* Body */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15 + 0.3 }}
                className={`text-sm leading-relaxed ${
                  align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
                }`}
                style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.02em' }}
              >
                {block.body}
              </motion.p>

              {/* Bottom divider */}
              {i < blocks.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1.2, delay: i * 0.15 + 0.5 }}
                  className="mt-12 h-px origin-center"
                  style={{
                    background: `linear-gradient(to right, transparent, ${accentColor}33, transparent)`,
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
