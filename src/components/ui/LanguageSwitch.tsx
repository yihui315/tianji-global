'use client';

import { colors, radii, glass } from '@/design-system';
import { useLanguage } from '@/hooks/useLanguage';

export interface LanguageSwitchProps {
  /** Extra class names */
  className?: string;
}

/**
 * LanguageSwitch — Compact zh/en toggle following TianJi glass style.
 *
 * Consumes the LanguageProvider context to switch locale globally.
 */
export function LanguageSwitch({ className = '' }: LanguageSwitchProps) {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
      className={`flex items-center gap-1.5 text-[10px] rounded-full px-3 py-1.5 transition-all duration-200 hover:scale-105 cursor-pointer ${className}`}
      style={{
        ...glass.soft,
        borderRadius: radii.badge,
        border: `1px solid ${colors.borderSubtle}`,
        color: colors.textMuted,
      }}
    >
      <span
        style={{ color: lang === 'zh' ? colors.textSecondary : colors.textMuted }}
      >
        中
      </span>
      <span style={{ color: colors.borderMedium }}>|</span>
      <span
        style={{ color: lang === 'en' ? colors.textSecondary : colors.textMuted }}
      >
        EN
      </span>
    </button>
  );
}
