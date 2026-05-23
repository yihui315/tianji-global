'use client';

import type { ReactNode } from 'react';
import { GlassCard } from '@/components/ui';
import { colors, landingTokens, typography } from '@/design-system';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export interface ModuleInputShellProps {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function ModuleInputShell({
  eyebrow,
  title,
  description,
  footer,
  className,
  children,
}: ModuleInputShellProps) {
  return (
    <GlassCard
      level="strong"
      className={cx(
        'relative overflow-hidden rounded-xl border border-[#b57248]/34 bg-[#070b16]/72 p-6 shadow-[0_0_46px_rgba(181,114,72,0.14)] sm:p-8',
        className
      )}
      style={{
        boxShadow: '0 0 46px rgba(181,114,72,0.14), inset 0 1px 0 rgba(255,227,180,0.04)',
        border: landingTokens.glass.strongOutline,
      }}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: landingTokens.section.divider }} />

      {(eyebrow || title || description) ? (
        <div className="mb-6 flex flex-col gap-3">
          {eyebrow ? (
            <span className="text-[0.68rem] uppercase tracking-[0.28em]" style={{ color: colors.textTertiary }}>
              {eyebrow}
            </span>
          ) : null}
          {title ? (
            <h3
              style={{
                ...typography.cardTitle,
                color: colors.textPrimary,
                fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
              }}
            >
              {title}
            </h3>
          ) : null}
          {description ? (
            <div className="text-sm leading-6" style={{ color: colors.textSecondary }}>
              {description}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-5">{children}</div>

      {footer ? (
        <div
          className="mt-6 border-t pt-4 text-xs"
          style={{
            borderColor: colors.borderSubtle,
            color: colors.textTertiary,
          }}
        >
          {footer}
        </div>
      ) : null}
    </GlassCard>
  );
}
