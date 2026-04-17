'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui';

/* ═══════════════════════════════════════════
   Pulsing dot for loading animation
   ═══════════════════════════════════════════ */
function PulsingOrb({ delay = 0, size = 8, color = 'rgba(168,130,255,0.6)' }: { delay?: number; size?: number; color?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.1, 0.85] }}
      transition={{ repeat: Infinity, duration: 1.8, delay, ease: 'easeInOut' }}
      className="rounded-full inline-block"
      style={{ width: size, height: size, background: color }}
    />
  );
}

/* ═══════════════════════════════════════════
   Loading skeleton card
   ═══════════════════════════════════════════ */
export default function ZiweiLoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <GlassCard level="card" className="overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20 backdrop-blur-md">
        {/* Top accent */}
        <div className="h-px w-full" style={{
          background: 'linear-gradient(90deg, transparent, rgba(168,130,255,0.3), transparent)',
        }}/>

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 mb-6">
            {/* Animated orb cluster */}
            <div className="flex items-center gap-3">
              <PulsingOrb delay={0} size={10} color="rgba(212,175,55,0.7)" />
              <PulsingOrb delay={0.2} size={7} color="rgba(168,130,255,0.6)" />
              <PulsingOrb delay={0.4} size={12} color="rgba(168,130,255,0.8)" />
              <PulsingOrb delay={0.1} size={6} color="rgba(212,175,55,0.5)" />
              <PulsingOrb delay={0.3} size={9} color="rgba(168,130,255,0.7)" />
            </div>

            <div className="text-center">
              <p className="text-sm font-serif mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                正在调用 AI 分析你的命盘
              </p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Ziwei chart analysis in progress
              </p>
            </div>
          </div>

          {/* Skeleton text lines */}
          <div className="space-y-3 mb-6">
            {[
              { w: '100%', delay: 0.1 },
              { w: '90%', delay: 0.15 },
              { w: '75%', delay: 0.2 },
              { w: '85%', delay: 0.25 },
              { w: '60%', delay: 0.3 },
            ].map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: line.delay,
                  ease: 'easeInOut',
                }}
                className="h-3 rounded-full"
                style={{
                  width: line.w,
                  background: 'linear-gradient(90deg, rgba(168,130,255,0.12), rgba(212,175,55,0.08), rgba(168,130,255,0.12))',
                  backgroundSize: '200% 100%',
                }}
              />
            ))}
          </div>

          {/* Subtle progress bar */}
          <div className="rounded-full h-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="h-full rounded-full"
              style={{ width: '40%', background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }}
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
