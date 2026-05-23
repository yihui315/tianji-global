'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { GlassCard } from '@/components/ui';
import { colors, scrollReveal, variants } from '@/design-system';
import LandingSection from './LandingSection';

export interface ResultScaffoldProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  summary?: ReactNode;
  overview?: ReactNode;
  highlights?: ReactNode | Array<{ label: string; value: ReactNode }>;
  details?: ReactNode;
  aside?: ReactNode;
  className?: string;
}

export default function ResultScaffold({
  eyebrow,
  title,
  subtitle,
  summary,
  overview,
  highlights,
  details,
  aside,
  className,
}: ResultScaffoldProps) {
  return (
    <LandingSection eyebrow={eyebrow} title={title} subtitle={subtitle} className={className} contentClassName="space-y-8">
      {overview || summary ? (
        <motion.div initial="hidden" whileInView="visible" viewport={scrollReveal} variants={variants.fadeUp}>
          <GlassCard level="card" className="rounded-xl border border-[#b57248]/30 bg-[#070b16]/70 p-6 sm:p-8">
            {overview ?? <p className="text-sm leading-7 text-[#f4d7a3]/66">{summary}</p>}
          </GlassCard>
        </motion.div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          {highlights ? (
            <motion.div initial="hidden" whileInView="visible" viewport={scrollReveal} variants={variants.fadeUp}>
              <GlassCard
                level="card"
                className="rounded-xl border border-[#b57248]/28 bg-[#070b16]/62 p-5 sm:p-6"
                style={{ borderColor: colors.borderSubtle }}
              >
                {Array.isArray(highlights) ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {highlights.map((item) => (
                      <div key={item.label} className="rounded-lg border border-[#b57248]/28 bg-[#03040a]/52 p-4">
                        <div className="text-[0.65rem] uppercase tracking-[0.2em] text-[#d8b77b]/50">{item.label}</div>
                        <div className="mt-2 text-sm leading-6 text-[#f4d7a3]/72">{item.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  highlights
                )}
              </GlassCard>
            </motion.div>
          ) : null}

          {details ? (
            <motion.div initial="hidden" whileInView="visible" viewport={scrollReveal} variants={variants.fadeUp}>
              <GlassCard
                level="card"
                className="rounded-xl border border-[#b57248]/28 bg-[#070b16]/62 p-5 sm:p-6"
                style={{ borderColor: colors.borderSubtle }}
              >
                {details}
              </GlassCard>
            </motion.div>
          ) : null}
        </div>

        {aside ? (
          <motion.div initial="hidden" whileInView="visible" viewport={scrollReveal} variants={variants.fadeUp}>
            <GlassCard level="strong" className="h-full rounded-xl border border-[#b57248]/34 bg-[#070b16]/72 p-5 sm:p-6">
              {aside}
            </GlassCard>
          </motion.div>
        ) : null}
      </div>
    </LandingSection>
  );
}
