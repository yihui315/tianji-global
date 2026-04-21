'use client';

import { motion } from 'framer-motion';
import { colors, landingTokens, scrollReveal, variants } from '@/design-system';

export interface TrustStripItem {
  label: string;
  value?: string;
  description?: string;
}

export interface TrustStripProps {
  eyebrow?: string;
  items: TrustStripItem[];
  className?: string;
}

export default function TrustStrip({
  eyebrow = 'Trusted structure',
  items,
  className,
}: TrustStripProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={scrollReveal}
      variants={variants.stagger}
      className={className}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="h-px w-10" style={{ background: landingTokens.section.divider }} />
        <span
          className="text-[0.68rem] uppercase tracking-[0.28em]"
          style={{ color: colors.textTertiary }}
        >
          {eyebrow}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <motion.div
            key={item.label}
            variants={variants.fadeUp}
            className="rounded-full border px-4 py-3 backdrop-blur-xl"
            style={{
              borderColor: landingTokens.trust.chipBorder,
              background: landingTokens.trust.chipBackground,
            }}
          >
            <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
              {item.label}
            </div>
            {(item.description || item.value) && (
              <div
                className="mt-1 text-xs leading-5"
                style={{ color: landingTokens.trust.chipText }}
              >
                {item.description ?? item.value}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
