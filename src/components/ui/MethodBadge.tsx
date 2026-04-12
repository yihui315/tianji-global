'use client';

import { colors, radii, glass } from '@/design-system';
import { disclaimers } from '@/design-system/content-tokens';
import { useLanguage } from '@/hooks/useLanguage';

export interface MethodBadgeProps {
  /** Extra class names */
  className?: string;
}

/**
 * MethodBadge — Compact trust badge showing the calculation methodology.
 *
 * Displays the method disclaimer from content-tokens in a pill-shaped badge.
 */
export function MethodBadge({ className = '' }: MethodBadgeProps) {
  const { lang } = useLanguage();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] ${className}`}
      style={{
        ...glass.soft,
        borderRadius: radii.badge,
        color: colors.textTertiary,
        border: `1px solid ${colors.borderSubtle}`,
      }}
    >
      <span aria-hidden="true">⚙</span>
      {disclaimers.method[lang]}
    </span>
  );
}
