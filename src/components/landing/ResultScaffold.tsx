'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui';
import { colors, scrollReveal, variants } from '@/design-system';
import LandingSection from './LandingSection';

export interface ResultScaffoldProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  summary?: React.ReactNode;
  overview?: React.ReactNode;
  highlights?: React.ReactNode | Array<{ label: string; value: React.ReactNode }>;
  details?: React.ReactNode;
  aside?: React.ReactNode;
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
    <LandingSection
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      className={className}
      contentClassName="space-y-8"
    >
      {(overview || summary) && (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={scrollReveal}
          variants={variants.fadeUp}
        >
          <GlassCard
            level="card"
            className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 sm:p-8"
          >
            {overview ?? <p className="text-sm leading-7 text-white/64">{summary}</p>}
          </GlassCard>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          {highlights && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={scrollReveal}
              variants={variants.fadeUp}
            >
              <GlassCard
                level="card"
                className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5 sm:p-6"
                style={{ borderColor: colors.borderSubtle }}
              >
                {Array.isArray(highlights) ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    {highlights.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-[0.65rem] uppercase tracking-[0.2em] text-white/35">
                          {item.label}
                        </div>
                        <div className="mt-2 text-sm leading-6 text-white/72">{item.value}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  highlights
                )}
              </GlassCard>
            </motion.div>
          )}

          {details && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={scrollReveal}
              variants={variants.fadeUp}
            >
              <GlassCard
                level="card"
                className="rounded-[1.5rem] border border-white/8 bg-white/[0.02] p-5 sm:p-6"
                style={{ borderColor: colors.borderSubtle }}
              >
                {details}
              </GlassCard>
            </motion.div>
          )}
        </div>

        {aside && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={scrollReveal}
            variants={variants.fadeUp}
          >
            <GlassCard
              level="strong"
              className="h-full rounded-[1.75rem] border border-white/10 bg-black/25 p-5 sm:p-6"
            >
              {aside}
            </GlassCard>
          </motion.div>
        )}
      </div>
    </LandingSection>
  );
}
