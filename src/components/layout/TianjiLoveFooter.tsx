// Re-export from tianji-love primitives with optional props for blog pages
import { TianjiLoveFooter as BaseFooter } from '@/components/tianji-love/TianjiLovePrimitives';
import { getTianjiLoveFooterNav } from '@/components/tianji-love/TianjiLovePrimitives';

export function TianjiLoveFooter({
  homeHref = '/',
  disclaimer,
  links,
}: {
  homeHref?: string;
  disclaimer?: string;
  links?: never;
}) {
  const defaultDisclaimer = 'Love readings are for self-reflection and entertainment only, not medical, legal, financial or crisis advice.';
  return (
    <BaseFooter
      homeHref={homeHref}
      disclaimer={disclaimer ?? defaultDisclaimer}
      links={links ?? getTianjiLoveFooterNav('en', (path: string) => path)}
    />
  );
}
