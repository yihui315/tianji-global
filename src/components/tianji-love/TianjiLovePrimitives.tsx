import Image from 'next/image';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

const COMPASS_MARK = '/assets/images/brand/tianji-love-compass-mark.png';

type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

export type TianjiLoveNavItem = {
  label: string;
  href: string;
  mobile?: boolean;
};

export type TianjiLoveLanguage = 'en' | 'zh';

const PRIMARY_NAV: Record<TianjiLoveLanguage, TianjiLoveNavItem[]> = {
  en: [
    { label: 'Love Reading', href: '/relationship/new', mobile: true },
    { label: 'Ask', href: '/ask', mobile: true },
    { label: 'Draw Timing', href: '/draw', mobile: true },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Login', href: '/login' },
  ],
  zh: [
    { label: '关系解读', href: '/relationship/new', mobile: true },
    { label: '提问', href: '/ask', mobile: true },
    { label: '抽牌', href: '/draw', mobile: true },
    { label: '价格', href: '/pricing' },
    { label: '关于', href: '/about' },
    { label: '登录', href: '/login' },
  ],
};

const FOOTER_NAV: Record<TianjiLoveLanguage, TianjiLoveNavItem[]> = {
  en: [
    ...PRIMARY_NAV.en,
    { label: 'Privacy', href: '/legal/privacy' },
    { label: 'Terms', href: '/legal/terms' },
  ],
  zh: [
    ...PRIMARY_NAV.zh,
    { label: '隐私', href: '/legal/privacy' },
    { label: '条款', href: '/legal/terms' },
  ],
};

export function getTianjiLovePrimaryNav(
  language: TianjiLoveLanguage,
  href: (path: string) => string = (path) => path
): TianjiLoveNavItem[] {
  return PRIMARY_NAV[language].map((item) => ({ ...item, href: href(item.href) }));
}

export function getTianjiLoveFooterNav(
  language: TianjiLoveLanguage,
  href: (path: string) => string = (path) => path
): TianjiLoveNavItem[] {
  return FOOTER_NAV[language].map((item) => ({ ...item, href: href(item.href) }));
}

export function getTianjiLovePrimaryCta(
  language: TianjiLoveLanguage,
  href: (path: string) => string = (path) => path
) {
  return {
    label: language === 'zh' ? '开始关系解读' : 'Start Relationship Reading',
    href: href('/relationship/new'),
  };
}

export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function TianjiLoveShell({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <main className={cx('tianji-love-page relative min-h-screen overflow-x-hidden bg-[#03040a] text-[#f7e8c8]', className)} aria-label={ariaLabel}>
      <TianjiLoveSystemStyles />
      <div className="tianji-love-bg pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="tianji-love-stars pointer-events-none fixed inset-0 z-0" aria-hidden />
      {children}
    </main>
  );
}

export function TianjiLoveLogo({
  href,
  label = 'Tianji Love',
  sublabel = 'tianji.love',
  compact = false,
}: {
  href: string;
  label?: string;
  sublabel?: string;
  compact?: boolean;
}) {
  return (
    <Link href={href} className="tianji-love-logo-lockup flex items-center gap-3">
      <span className={cx('tianji-love-logo-mark grid shrink-0 place-items-center overflow-visible', compact ? 'h-10 w-10' : 'h-12 w-12')}>
        <Image src={COMPASS_MARK} alt="" width={96} height={96} className="h-full w-full object-contain" priority aria-hidden />
      </span>
      <span className="min-w-0">
        <span className={cx('block font-serif font-semibold leading-none text-[#ffe3b4]', compact ? 'text-lg' : 'text-2xl')}>
          {label}
        </span>
        <span className="mt-1 block text-xs tracking-[0.22em] text-[#f4d7a3]/78">{sublabel}</span>
      </span>
    </Link>
  );
}

export function TianjiLoveHeader({
  homeHref,
  navItems,
  cta,
  languageLabel,
  onLanguageToggle,
}: {
  homeHref: string;
  navItems: TianjiLoveNavItem[];
  cta?: { label: string; href: string };
  languageLabel?: string;
  onLanguageToggle?: () => void;
}) {
  return (
    <header className="tianji-love-shell-header relative z-20 border-b border-[#b57248]/28 bg-[#03040a]/76 px-5 py-4 backdrop-blur-xl sm:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <TianjiLoveLogo href={homeHref} />
        <div className="flex items-center gap-3 text-sm text-[#f4d7a3]/78">
          <div className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href} className="transition hover:text-[#ffe3b4]">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="hidden items-center gap-3 sm:flex lg:hidden">
            {navItems
              .filter((item) => item.mobile)
              .map((item) => (
                <Link key={`${item.href}-${item.label}`} href={item.href} className="transition hover:text-[#ffe3b4]">
                  {item.label}
                </Link>
              ))}
          </div>
          {languageLabel && onLanguageToggle ? (
            <button
              type="button"
              onClick={onLanguageToggle}
              className="rounded-full border border-[#b57248]/40 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-[#f4d7a3]/82 transition hover:border-[#ffe3b4]/60 hover:text-[#ffe3b4]"
              aria-label="Switch language"
            >
              {languageLabel}
            </button>
          ) : null}
          {cta ? (
            <Link href={cta.href} className="tianji-love-primary hidden min-h-12 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6] sm:inline-flex">
              {cta.label}
            </Link>
          ) : null}
        </div>
      </nav>
    </header>
  );
}

export function TianjiLoveButton({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        'inline-flex min-h-14 items-center justify-center rounded-lg border px-8 text-base font-semibold transition',
        variant === 'primary'
          ? 'tianji-love-primary border-[#ffb49e]/60 text-[#fff7e6] hover:border-[#ffd6ab]'
          : 'tianji-love-secondary border-[#b57248]/58 bg-black/24 text-[#f7ddb2] hover:border-[#ffe1a6]',
        className
      )}
    >
      {children}
    </Link>
  );
}

export function TianjiLovePanel({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}) {
  return <Tag className={cx('tianji-love-panel relative overflow-hidden rounded-xl border border-[#b57248]/42 bg-[#060b16]/78 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-xl', className)}>{children}</Tag>;
}

export function TianjiLoveSectionTitle({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('text-center', className)}>
      {eyebrow ? <p className="text-xs uppercase tracking-[0.28em] text-[#d8b77b]/64">{eyebrow}</p> : null}
      <div className="mt-3 flex items-center justify-center gap-4">
        <span className="tianji-love-ornament-line hidden h-px w-24 sm:block" />
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <h2 className="font-serif text-2xl font-semibold leading-tight text-[#ffe3b4] sm:text-3xl">{title}</h2>
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <span className="tianji-love-ornament-line hidden h-px w-24 scale-x-[-1] sm:block" />
      </div>
    </div>
  );
}

export function TianjiLoveHeroImage({
  src,
  referenceSignal,
  priority = false,
  sizes = '(min-width: 1024px) 44vw, 100vw',
  className,
}: {
  src: string;
  referenceSignal?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={cx('tianji-love-hero-image-shell relative min-h-[430px] overflow-hidden lg:min-h-[610px]', className)}>
      <Image src={src} alt="" fill priority={priority} sizes={sizes} className="tianji-love-hero-art object-cover object-center" aria-hidden />
      <div className="tianji-love-hero-blend absolute inset-0" aria-hidden />
      {referenceSignal ? <span className="hidden">{referenceSignal}</span> : null}
    </div>
  );
}

export function TianjiLoveTrustCard({
  icon: Icon,
  title,
  body,
  className,
}: {
  icon: IconComponent;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <article className={cx('tianji-love-trust-card rounded-lg border border-[#b57248]/28 bg-[#070b16]/66 p-4 backdrop-blur', className)}>
      <Icon className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
      <h2 className="text-sm font-semibold text-[#ffe3b4]">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-[#f4d7a3]/62">{body}</p>
    </article>
  );
}

export function TianjiLoveFormField({
  label,
  badge,
  children,
}: {
  label: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <label className="tianji-love-form-field block">
      <span className="mb-2 flex items-center justify-between text-xs font-semibold tracking-[0.1em] text-[#f4d7a3]/72">
        {label}
        {badge ? <span className="text-[#ff9c8b]/78">{badge}</span> : null}
      </span>
      <span className="relative block">{children}</span>
    </label>
  );
}

export function TianjiLoveFinalCta({
  imageSrc,
  title,
  buttonLabel,
  href,
}: {
  imageSrc: string;
  title: ReactNode;
  buttonLabel: string;
  href: string;
}) {
  return (
    <section className="tianji-love-final-cta love-final-pavilion-cta relative z-10 mx-auto mb-12 flex min-h-[460px] w-full max-w-7xl items-center overflow-hidden rounded-t-lg border-t border-[#b57248]/26 px-5 py-16 sm:px-10">
      <Image src={imageSrc} alt="" fill sizes="100vw" className="tianji-love-final-image absolute inset-0 object-cover object-center" aria-hidden />
      <div className="tianji-love-final-overlay absolute inset-0" aria-hidden />
      <div className="relative max-w-2xl">
        <span className="tianji-love-ornament-line mb-7 block h-px w-72 max-w-full" aria-hidden />
        <h2 className="font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">{title}</h2>
        <TianjiLoveButton href={href} className="mt-8">
          {buttonLabel}
          <Sparkles className="ml-3 h-4 w-4" aria-hidden />
        </TianjiLoveButton>
      </div>
    </section>
  );
}

export function TianjiLoveFooter({
  disclaimer,
  links,
  homeHref,
}: {
  disclaimer: string;
  links: TianjiLoveNavItem[];
  homeHref: string;
}) {
  return (
    <footer className="relative z-10 border-t border-[#b57248]/20 bg-[#02040c]/94 px-5 py-8 text-[#f4d7a3]/70 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <TianjiLoveLogo href={homeHref} compact />
          <p className="max-w-lg text-xs leading-6 text-[#f4d7a3]/56">{disclaimer}</p>
        </div>
        <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
          {links.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="transition hover:text-[#ffe3b4]">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-[#f4d7a3]/48">© 2024 Tianji Love</p>
      </div>
    </footer>
  );
}

function TianjiLoveSystemStyles() {
  return (
    <style>{`
      .tianji-love-page {
        font-family: var(--font-tianji-sans), "Microsoft YaHei", system-ui, sans-serif;
        --tl-copper: rgba(181, 114, 72, 0.42);
        --tl-copper-soft: rgba(181, 114, 72, 0.22);
        --tl-gold: #d8b77b;
        --tl-cream: #ffe3b4;
      }
      .tianji-love-bg {
        background:
          radial-gradient(circle at 70% 0%, rgba(167,45,62,0.28), transparent 30%),
          radial-gradient(circle at 18% 12%, rgba(216,183,123,0.12), transparent 34%),
          linear-gradient(180deg, #050812 0%, #03040a 58%, #070914 100%);
      }
      .tianji-love-stars {
        background-image:
          radial-gradient(1px 1px at 12% 18%, rgba(255,227,180,0.55), transparent 50%),
          radial-gradient(1px 1px at 26% 32%, rgba(255,120,126,0.45), transparent 50%),
          radial-gradient(1.5px 1.5px at 40% 16%, rgba(216,183,123,0.55), transparent 50%),
          radial-gradient(1px 1px at 58% 28%, rgba(255,227,180,0.35), transparent 50%),
          radial-gradient(1.5px 1.5px at 70% 10%, rgba(255,120,126,0.55), transparent 50%),
          radial-gradient(1px 1px at 84% 24%, rgba(216,183,123,0.55), transparent 50%),
          radial-gradient(1px 1px at 20% 72%, rgba(255,227,180,0.45), transparent 50%),
          radial-gradient(1.4px 1.4px at 62% 82%, rgba(216,183,123,0.45), transparent 50%),
          radial-gradient(1px 1px at 90% 76%, rgba(255,120,126,0.38), transparent 50%);
        background-size: 980px 760px;
        animation: tianji-love-twinkle 5.5s ease-in-out infinite alternate;
      }
      .tianji-love-logo-mark {
        border: 0;
        border-radius: 999px;
        background:
          radial-gradient(circle at 50% 50%, rgba(4,9,19,0.95) 0%, rgba(4,9,19,0.82) 58%, rgba(4,9,19,0) 73%);
        filter: drop-shadow(0 0 18px rgba(216,183,123,0.16));
      }
      .tianji-love-logo-mark img {
        transform: scale(1.05);
      }
      .tianji-love-primary {
        background:
          radial-gradient(circle at 82% 32%, rgba(255,235,204,0.48), transparent 9%),
          linear-gradient(180deg, rgba(255,132,126,0.92), rgba(167,58,65,0.88) 50%, rgba(104,32,41,0.94));
        box-shadow:
          0 0 24px rgba(255,92,99,0.3),
          0 8px 26px rgba(255,92,99,0.13),
          inset 0 1px 0 rgba(255,236,207,0.32),
          inset 0 -12px 28px rgba(75,18,24,0.32);
      }
      .tianji-love-secondary {
        border-color: rgba(181,114,72,0.58) !important;
        background-color: rgba(0,0,0,0.24) !important;
        box-shadow: inset 0 0 0 1px rgba(255,217,157,0.04);
      }
      .tianji-love-shell-header {
        border-color: rgba(181,114,72,0.28) !important;
      }
      .tianji-love-primary {
        border-color: rgba(255,180,158,0.6) !important;
      }
      .tianji-love-panel,
      .tianji-love-trust-card {
        border-color: rgba(181,114,72,0.42) !important;
        background-color: rgba(6,11,22,0.78) !important;
        box-shadow:
          inset 0 0 0 1px rgba(255,217,157,0.025),
          0 20px 60px rgba(0,0,0,0.26);
      }
      .tianji-love-trust-card {
        border-color: rgba(181,114,72,0.32) !important;
        background-color: rgba(7,11,22,0.66) !important;
      }
      .tianji-love-panel::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(circle at 50% 0%, rgba(255,124,130,0.08), transparent 44%);
      }
      .tianji-love-panel > * {
        position: relative;
        z-index: 1;
      }
      .tianji-love-hero-image-shell {
        isolation: auto;
        overflow: visible !important;
        background: transparent;
        filter: saturate(1.04) contrast(1.03);
      }
      .tianji-love-hero-art {
        inset: -8% !important;
        width: 116% !important;
        height: 116% !important;
        max-width: none !important;
        z-index: 0;
        opacity: 0.92;
        mix-blend-mode: lighten;
        transform: scale(1.04);
        transform-origin: 58% 52%;
        -webkit-mask-image:
          radial-gradient(ellipse at 58% 52%, #000 0 38%, rgba(0,0,0,0.82) 50%, rgba(0,0,0,0.28) 64%, transparent 78%);
        mask-image:
          radial-gradient(ellipse at 58% 52%, #000 0 38%, rgba(0,0,0,0.82) 50%, rgba(0,0,0,0.28) 64%, transparent 78%);
      }
      .tianji-love-hero-blend {
        inset: -8% !important;
        z-index: 1;
        background:
          linear-gradient(180deg, rgba(18,6,15,0.92) 0%, rgba(18,6,15,0.5) 13%, transparent 28%, transparent 74%, rgba(3,4,10,0.62) 100%),
          radial-gradient(ellipse at 55% 50%, transparent 0%, transparent 48%, rgba(3,4,10,0.22) 62%, rgba(3,4,10,0.5) 76%, transparent 100%);
      }
      .tianji-love-form-field input,
      .tianji-love-form-field select,
      .tianji-love-form-field textarea,
      .tianji-love-field-input {
        border-color: rgba(181,114,72,0.38) !important;
        background: rgba(3, 4, 10, 0.82) !important;
        color: #ffe3b4 !important;
        color-scheme: dark;
        caret-color: #ffe3b4;
        -webkit-text-fill-color: #ffe3b4;
      }
      .tianji-love-form-field input::placeholder,
      .tianji-love-form-field textarea::placeholder,
      .tianji-love-field-input::placeholder {
        color: rgba(244, 215, 163, 0.32);
        -webkit-text-fill-color: rgba(244, 215, 163, 0.32);
      }
      .tianji-love-form-field input::-webkit-calendar-picker-indicator {
        filter: invert(78%) sepia(26%) saturate(491%) hue-rotate(358deg) brightness(92%) contrast(88%);
        opacity: 0.82;
      }
      .tianji-love-ornament-line {
        background: linear-gradient(90deg, transparent, rgba(216,183,123,0.7), transparent);
      }
      .tianji-love-final-image {
        opacity: 0.94;
      }
      .tianji-love-final-cta {
        border-color: rgba(181,114,72,0.28) !important;
      }
      .tianji-love-relation-choice {
        border-color: rgba(181,114,72,0.3) !important;
        background-color: rgba(0,0,0,0.22) !important;
      }
      .tianji-love-relation-choice[aria-pressed="true"] {
        border-color: rgba(255,156,139,0.62) !important;
        background-color: rgba(255,108,115,0.16) !important;
      }
      .tianji-love-final-overlay {
        background:
          linear-gradient(180deg, rgba(2,4,12,0.03), rgba(2,4,12,0.2) 48%, rgba(2,4,12,0.7) 100%),
          linear-gradient(90deg, rgba(2,4,12,0.9), rgba(2,4,12,0.56) 42%, rgba(2,4,12,0.13) 78%);
      }
      @keyframes tianji-love-twinkle {
        from { opacity: 0.58; }
        to { opacity: 0.96; }
      }
      @media (prefers-reduced-motion: reduce) {
        .tianji-love-stars {
          animation: none !important;
        }
      }
      @media (max-width: 768px) {
        .tianji-love-shell-header nav {
          align-items: flex-start;
        }
        .tianji-love-hero-image-shell {
          min-height: 400px;
        }
        .tianji-love-hero-art {
          transform: scale(1.02);
        }
      }
    `}</style>
  );
}
