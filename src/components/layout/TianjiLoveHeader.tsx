// Re-export from tianji-love primitives with optional props for blog pages
import { TianjiLoveHeader as BaseHeader } from '@/components/tianji-love/TianjiLovePrimitives';
import { getTianjiLovePrimaryNav } from '@/components/tianji-love/TianjiLovePrimitives';
import Link from 'next/link';

export function TianjiLoveHeader({
  homeHref = '/',
  languageLabel,
  onLanguageToggle,
}: {
  homeHref?: string;
  navItems?: never;
  cta?: never;
  languageLabel?: string;
  onLanguageToggle?: () => void;
}) {
  const navItems = getTianjiLovePrimaryNav('en', (path: string) => path);
  return (
    <BaseHeader
      homeHref={homeHref}
      navItems={navItems}
      cta={{ label: 'Free Love Test', href: '/love-test' }}
      languageLabel={languageLabel}
      onLanguageToggle={onLanguageToggle}
    />
  );
}
