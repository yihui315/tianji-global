'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface NarrativeBlock {
  label: string;
  heading: string;
  body: string;
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

function tianjiLoveAccent(color: string, fallback: string) {
  return color.toLowerCase() === '#7c3aed' || color.toLowerCase() === '#a78bfa' ? fallback : color;
}

export default function ScrollNarrativeSection({
  accentColor = '#ff7c82',
  goldColor = '#d8b77b',
  blocks,
}: ScrollNarrativeSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const loveAccent = tianjiLoveAccent(accentColor, '#ff7c82');
  const loveGold = tianjiLoveAccent(goldColor, '#d8b77b');

  return (
    <section
      ref={ref}
      className="relative py-24 sm:py-36"
      style={{ background: 'linear-gradient(180deg, #03040a 0%, #050812 55%, #03040a 100%)' }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 50%, ${loveAccent}16 0%, transparent 70%)`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-6 sm:px-8">
        {blocks.map((block, i) => {
          const align = block.align ?? 'center';
          return (
            <motion.div
              key={`${block.label}-${i}`}
              custom={i}
              variants={blockVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className={`mb-20 last:mb-0 ${
                align === 'left' ? 'ml-0' : align === 'right' ? 'ml-auto max-w-lg' : 'mx-auto max-w-xl'
              }`}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 + 0.1 }}
                className="mb-5 flex items-center gap-3"
              >
                <div className="h-px w-8" style={{ background: `linear-gradient(to right, transparent, ${loveGold})` }} />
                <span className="text-[10px] font-medium uppercase tracking-[0.25em]" style={{ color: `${loveGold}CC` }}>
                  {block.label}
                </span>
                <div className="h-px w-8" style={{ background: `linear-gradient(to left, transparent, ${loveGold})` }} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15 + 0.2 }}
                className={`mb-4 font-serif font-bold ${
                  align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
                }`}
                style={{
                  fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
                  background: `linear-gradient(135deg, ${loveGold} 0%, #ffe3b4 50%, ${loveGold}99 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0',
                }}
              >
                {block.heading}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.15 + 0.3 }}
                className={`text-sm leading-relaxed ${
                  align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
                }`}
                style={{ color: 'rgba(244,215,163,0.66)', letterSpacing: '0' }}
              >
                {block.body}
              </motion.p>

              {i < blocks.length - 1 ? (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1.2, delay: i * 0.15 + 0.5 }}
                  className="mt-12 h-px origin-center"
                  style={{
                    background: `linear-gradient(to right, transparent, ${loveAccent}33, transparent)`,
                  }}
                />
              ) : null}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
