'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GlassCard } from '@/components/ui';

/* ═══════════════════════════════════════════════════════════════
   InsightGrid — Layered AI insight reveal
   Structure: overview → key insights → details
   ═══════════════════════════════════════════════════════════════ */

interface InsightItem {
  icon?: string;
  label: string;
  value: string;
}

interface InsightGridProps {
  title: string;
  subtitle?: string;
  items: InsightItem[];
  accentColor?: string;
  goldColor?: string;
}

export default function InsightGrid({
  title,
  subtitle,
  items,
  accentColor = '#7c3aed',
  goldColor = '#D4AF37',
}: InsightGridProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section ref={ref} className="relative py-16 sm:py-24" style={{ background: '#0a0a0a' }}>
      {/* Nebula bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${accentColor}08 0%, transparent 70%)`,
        }}
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12" style={{ background: `${accentColor}33` }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: `${goldColor}80` }} />
            <div className="h-px w-12" style={{ background: `${accentColor}33` }} />
          </div>
          <h2
            className="font-serif font-bold mb-2"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: 'rgba(255,255,255,0.88)',
              letterSpacing: '0.04em',
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Insight cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <GlassCard
                level="card"
                className="p-5 rounded-xl border border-white/[0.06] bg-black/20 backdrop-blur-md hover:border-white/[0.1] transition-all duration-300 group"
              >
                <div className="flex items-start gap-3">
                  {/* Icon dot */}
                  {item.icon && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: `${accentColor}15`,
                        border: `1px solid ${accentColor}30`,
                      }}
                    >
                      <span className="text-xs" style={{ filter: `drop-shadow(0 0 4px ${accentColor})` }}>
                        {item.icon}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Label */}
                    <p
                      className="text-[10px] tracking-[0.15em] uppercase mb-1"
                      style={{ color: `${accentColor}99` }}
                    >
                      {item.label}
                    </p>
                    {/* Value */}
                    <p
                      className="text-sm leading-snug font-medium"
                      style={{ color: 'rgba(255,255,255,0.75)' }}
                    >
                      {item.value}
                    </p>
                  </div>

                  {/* Gold right border accent on hover */}
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(to bottom, transparent, ${goldColor}, transparent)` }}
                  />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
