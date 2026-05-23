'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronRight, Globe2, Sparkles, Star, User, Users } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { type AppLanguage, isAppLanguage, withLanguageParam } from '@/lib/language-routing';
import { trackRevenueFunnelEvent } from '@/lib/analytics/funnel-events';

type SelectCopy = {
  label: string;
  placeholder: string;
  options: string[];
};

type LoveCopy = {
  brand: string;
  nav: Array<{ label: string; href: string }>;
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    description: string;
    loveTestCta?: string;
    primaryCta: string;
    secondaryCta: string;
    tertiaryCta: string;
    trustCta: string;
    sampleCta?: string;
    getStarted: string;
    trust: Array<{ label: string; iconAsset: string }>;
  };
  form: {
    title: string;
    selects: {
      year: SelectCopy;
      month: SelectCopy;
      day: SelectCopy;
      time: SelectCopy;
    };
    solo: string;
    relationship: string;
    cta: string;
    helper: string;
  };
  cards: Array<{ title: string; body: string; iconAsset: string }>;
  features: Array<{ title: string; body: string; iconAsset: string }>;
  process: {
    title: string;
    steps: Array<{ number: string; title: string; body: string }>;
  };
  testimonials: {
    title: string;
    cards: Array<{ name: string; tag: string; quote: string; avatar: string; tone: string }>;
  };
  cta: {
    title: string;
    button: string;
  };
  footer: {
    tagline: string;
    disclaimer: string;
    links: Array<{ label: string; href: string }>;
  };
};

const YEARS = Array.from({ length: 77 }, (_, index) => String(2026 - index));
const MONTHS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1));
const TIMES = [
  '00:00',
  '02:00',
  '04:00',
  '06:00',
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
  '22:00',
];
const CHINESE_HOURS = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];

const BRAND_COMPASS_MARK = '/assets/images/brand/tianji-love-compass-mark.png';
const LEGACY_LOGO_MARK_SIGNAL = 'tianji-love-logo-mark.png';
const HERO_COUPLE = '/assets/images/hero/tianji-love-couple-red-thread-16x9.png';
const HERO_COUPLE_REFERENCE = '/assets/images/home-reference/tianji-love-hero-couple-portrait.png';
const FINAL_PAVILION = '/assets/images/hero/tianji-love-moon-pavilion-16x9.png';
const DIVIDER_LONG = '/assets/images/decor/tianji-love-divider-long.png';

const ICONS = {
  privateLock: '/assets/images/icons/tianji-love-icon-private-lock.png',
  personalized: '/assets/images/icons/tianji-love-icon-personalized.png',
  clarityCompass: '/assets/images/icons/tianji-love-icon-clarity-compass.png',
  karmicOrbit: '/assets/images/icons/tianji-love-icon-karmic-orbit.png',
  relationshipRings: '/assets/images/icons/tianji-love-icon-relationship-rings.png',
  futureHourglass: '/assets/images/icons/tianji-love-icon-future-hourglass.png',
  deepScroll: '/assets/images/icons/tianji-love-icon-deep-scroll.png',
  emotionalRings: '/assets/images/icons/tianji-love-icon-emotional-rings.png',
} as const;

const homepageRelationshipProof = {
  en: [
    { label: 'Free first signal', body: 'Start with the compatibility pattern before any paid choice.' },
    { label: 'Birth data hidden', body: 'Public sharing keeps private inputs out of the card and URL.' },
    { label: 'Share-ready result', body: 'The result can become a social card for the first growth loop.' },
    { label: 'Unlock depth only when useful', body: 'Paid depth adds detail, not certainty or pressure.' },
  ],
  zh: [
    { label: 'Free first signal', body: 'Start with the compatibility pattern before any paid choice.' },
    { label: 'Birth data hidden', body: 'Public sharing keeps private inputs out of the card and URL.' },
    { label: 'Share-ready result', body: 'The result can become a social card for the first growth loop.' },
    { label: 'Unlock depth only when useful', body: 'Paid depth adds detail, not certainty or pressure.' },
  ],
} satisfies Record<AppLanguage, Array<{ label: string; body: string }>>;

const loveCopy: Record<AppLanguage, LoveCopy> = {
  en: {
    brand: 'Tianji Love',
    nav: [
      { label: 'Love Test', href: '/love-test' },
      { label: 'Love Reading', href: '/relationship/new' },
      { label: 'Ask', href: '/ask' },
      { label: 'Draw Timing', href: '/draw' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'About', href: '/about' },
      { label: 'Login', href: '/login' },
    ],
    hero: {
      eyebrow: 'PRIVATE LOVE REFLECTION. CLEARER NEXT STEPS.',
      titleLead: 'Understand your love pattern',
      titleAccent: 'before you make the next move.',
      description:
        'Start with a private free relationship reading. Ask one question, check romantic timing, or unlock a deeper report only when the preview feels useful.',
      loveTestCta: 'Take Love Test',
      primaryCta: 'Start Free Love Reading',
      secondaryCta: 'Ask One Question',
      tertiaryCta: 'Draw Timing Cards',
      trustCta: 'About Tianji Love',
      sampleCta: 'View Sample Reading',
      getStarted: 'Get Started',
      trust: [
        { label: 'Private & Secure', iconAsset: ICONS.privateLock },
        { label: 'Personalized Insights', iconAsset: ICONS.personalized },
        { label: 'Designed for Clarity', iconAsset: ICONS.clarityCompass },
      ],
    },
    form: {
      title: 'Align Your Birth Chart',
      selects: {
        year: { label: 'Birth Year', placeholder: 'Select year', options: YEARS },
        month: { label: 'Month', placeholder: 'Select month', options: MONTHS },
        day: { label: 'Day', placeholder: 'Select day', options: DAYS },
        time: { label: 'Time', placeholder: 'Select time', options: TIMES },
      },
      solo: 'Solo Reading',
      relationship: 'Couple Reading',
      cta: 'Reveal My First Love Insight',
      helper: 'Your first insight is private, practical, and designed for clarity.',
    },
    cards: [
      {
        title: 'Love Reading',
        body: 'Begin free with a private compatibility pattern, then unlock deeper dimensions only if the preview helps.',
        iconAsset: ICONS.karmicOrbit,
      },
      {
        title: 'Ask One Question',
        body: 'Bring one real relationship question and unlock a fuller answer with practical next steps when useful.',
        iconAsset: ICONS.relationshipRings,
      },
      {
        title: 'Draw Timing Cards',
        body: 'Draw three timing cards for what led here, what today asks, and the next opening.',
        iconAsset: ICONS.futureHourglass,
      },
    ],
    features: [
      { title: 'Private by default', body: 'Birth details and questions stay out of public shares by default.', iconAsset: ICONS.privateLock },
      {
        title: 'Reflection, not certainty',
        body: 'Readings name patterns and choices without guaranteed predictions.',
        iconAsset: ICONS.emotionalRings,
      },
      { title: 'No fear-based selling', body: 'Start free and upgrade only when deeper guidance feels useful.', iconAsset: ICONS.deepScroll },
      { title: 'Secure unlocks', body: 'One-time and subscription checkout flows use the existing secure payment path.', iconAsset: ICONS.clarityCompass },
    ],
    process: {
      title: 'Free First, Deeper When Useful',
      steps: [
        { number: '1', title: 'Start free', body: 'Get a first relationship signal without a paid commitment.' },
        { number: '2', title: 'Unlock depth', body: 'Use a one-time Ask or Draw Timing unlock when the preview earns more attention.' },
        { number: '3', title: 'Return with history', body: 'Subscribers keep report-ready readings and relationship history where implemented.' },
      ],
    },
    testimonials: {
      title: 'People Used Tianji Love For Clearer Reflection',
      cards: [
        {
          name: 'Emma',
          tag: 'Relationship clarity',
          quote: 'The preview gave me language for a pattern I could actually discuss.',
          avatar: '/assets/images/avatars/tianji-love-emma.png',
          tone: 'avatar-a',
        },
        {
          name: 'Sophie',
          tag: 'timing insight',
          quote: 'The timing spread helped me decide whether to reach out or pause.',
          avatar: '/assets/images/avatars/tianji-love-sophie.png',
          tone: 'avatar-b',
        },
        {
          name: 'Olivia',
          tag: 'Emotional growth',
          quote: 'I liked that it felt practical without telling me what had to happen.',
          avatar: '/assets/images/avatars/tianji-love-olivia.png',
          tone: 'avatar-c',
        },
      ],
    },
    cta: {
      title: 'Start with the free signal. Unlock depth only when it helps.',
      button: 'Start Free Love Reading',
    },
    footer: {
      tagline: 'Decode the pattern. Meet love with clearer eyes.',
      disclaimer: 'Readings are for self-reflection and relationship communication, not medical, legal, or financial advice.',
      links: [
        { label: 'Love Test', href: '/love-test' },
        { label: 'Love Reading', href: '/relationship/new' },
        { label: 'Ask', href: '/ask' },
        { label: 'Draw Timing', href: '/draw' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'About', href: '/about' },
        { label: 'Login', href: '/login' },
        { label: 'Privacy', href: '/legal/privacy' },
        { label: 'Terms', href: '/legal/terms' },
      ],
    },
  },
  zh: {
    brand: '天机爱',
    nav: [
      { label: '关系解读', href: '/relationship/new' },
      { label: '提问', href: '/ask' },
      { label: '抽牌', href: '/draw' },
      { label: '价格', href: '/pricing' },
      { label: '关于', href: '/about' },
      { label: '登录', href: '/login' },
    ],
    hero: {
      eyebrow: '宇宙洞察，真实的爱之指引。',
      titleLead: '爱是唯一能让命运转弯的力量。',
      titleAccent: '',
      description: '在这里，我们以星轨、关系与时机，解读你灵魂深处的情感命题。',
      primaryCta: '开始关系解读',
      secondaryCta: '问一个问题',
      tertiaryCta: '抽三张牌',
      trustCta: '了解 Tianji Love',
      getStarted: '开始',
      trust: [
        { label: '隐私安全', iconAsset: ICONS.privateLock },
        { label: '专属洞察', iconAsset: ICONS.personalized },
        { label: '清晰指引', iconAsset: ICONS.clarityCompass },
      ],
    },
    form: {
      title: '对齐你的本命星图',
      selects: {
        year: { label: '出生年', placeholder: '请选择年份', options: YEARS },
        month: { label: '月', placeholder: '请选择月份', options: MONTHS },
        day: { label: '日', placeholder: '请选择日期', options: DAYS },
        time: { label: '时辰', placeholder: '请选择时辰', options: CHINESE_HOURS },
      },
      solo: '单人解读',
      relationship: '双人合盘',
      cta: '揭示我的第一条爱情洞察',
      helper: '你的第一条洞察将保持私密，并用于自我理解与关系沟通。',
    },
    cards: [
      {
        title: '宿缘模式',
        body: '为什么你总会被同一种人吸引？',
        iconAsset: ICONS.karmicOrbit,
      },
      {
        title: '关系动力',
        body: '这段连接是一份礼物、一堂课，还是两者皆有？',
        iconAsset: ICONS.relationshipRings,
      },
      {
        title: '未来时机',
        body: '下一个重要的情感转折点会在何时靠近？',
        iconAsset: ICONS.futureHourglass,
      },
    ],
    features: [
      { title: '深度解析', body: '以星象与心理线索提供真实清晰感。', iconAsset: ICONS.deepScroll },
      { title: '情感契合', body: '理解你们在更深层如何连接。', iconAsset: ICONS.emotionalRings },
      { title: '隐私优先', body: '你的数据受到保护，不会被公开分享。', iconAsset: ICONS.privateLock },
      { title: '可行动指引', body: '把洞察转化成更好的选择。', iconAsset: ICONS.clarityCompass },
    ],
    process: {
      title: '如何开始',
      steps: [
        { number: '1', title: '输入你的信息', body: '分享出生信息，开启第一段解读。' },
        { number: '2', title: '映射关系模式', body: '系统分析你的星轨与关系指标。' },
        { number: '3', title: '收到清晰建议', body: '把洞察转化为更稳定的行动。' },
      ],
    },
    testimonials: {
      title: '她们在命运转折处读懂了爱',
      cards: [
        {
          name: '林小姐',
          tag: '情感清晰',
          quote: '它准确说出了我反复进入同一种关系的原因，我终于明白自己在等待什么。',
          avatar: '/assets/images/avatars/tianji-love-emma.png',
          tone: 'avatar-a',
        },
        {
          name: '苏小姐',
          tag: '时机洞察',
          quote: '那段时机判断很准，我在真正准备好的时候遇见了新的人。',
          avatar: '/assets/images/avatars/tianji-love-sophie.png',
          tone: 'avatar-b',
        },
        {
          name: '陈小姐',
          tag: '关系成长',
          quote: '这次解读让我在爱里更清醒，也更温柔。',
          avatar: '/assets/images/avatars/tianji-love-olivia.png',
          tone: 'avatar-c',
        },
      ],
    },
    cta: {
      title: '你的下一章，也许早已写在星光里。',
      button: '进入天机爱',
    },
    footer: {
      tagline: '看懂关系的模式，带着更清晰的眼睛去爱。',
      disclaimer: '所有解读都用于自我理解与关系沟通，不替代医疗、法律或财务建议。',
      links: [
        { label: '关系解读', href: '/relationship/new' },
        { label: '提问', href: '/ask' },
        { label: '抽牌', href: '/draw' },
        { label: '价格', href: '/pricing' },
        { label: '关于', href: '/about' },
        { label: '登录', href: '/login' },
        { label: '隐私政策', href: '/legal/privacy' },
        { label: '使用条款', href: '/legal/terms' },
      ],
    },
  },
} satisfies Record<AppLanguage, LoveCopy>;

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function resolveInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';
  const queryLang = new URLSearchParams(window.location.search).get('lang');
  if (isAppLanguage(queryLang)) return queryLang;
  const storedLang = window.localStorage.getItem('tianji-lang');
  if (isAppLanguage(storedLang)) return storedLang;
  return 'en';
}

function TianjiLoveIcon({
  src,
  size = 56,
  className,
}: {
  src: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cx('tianji-love-icon relative inline-grid shrink-0 place-items-center overflow-hidden', className)}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt="" width={size * 2} height={size * 2} className="h-full w-full object-contain" aria-hidden />
    </span>
  );
}

export default function TianjiLoveHome() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const initialLanguageSyncedRef = useRef(false);
  const [activeLang, setActiveLang] = useState<AppLanguage>('en');
  const [mode, setMode] = useState<'solo' | 'relationship'>('solo');
  const copy = loveCopy[activeLang];

  useEffect(() => {
    if (initialLanguageSyncedRef.current) return;
    initialLanguageSyncedRef.current = true;

    const nextLang = resolveInitialLanguage();
    setActiveLang((currentLang) => (currentLang === nextLang ? currentLang : nextLang));
    if (nextLang !== lang) setLang(nextLang);
  }, [lang, setLang]);

  const yearOptions = useMemo(() => YEARS, []);
  const href = (path: string) => (path.startsWith('#') ? path : withLanguageParam(path, activeLang));
  const sampleHref = activeLang === 'zh' ? '/zh-CN/love-reading/result/demo' : '/en/love-reading/result/demo';

  const toggleLanguage = () => {
    const nextLang = activeLang === 'zh' ? 'en' : 'zh';
    setActiveLang(nextLang);
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tianji-lang', nextLang);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void trackRevenueFunnelEvent('home_cta_click', {
      surface: 'homepage_birth_form',
      cta: mode === 'solo' ? 'ask_preview' : 'relationship',
      mode,
      lang: activeLang,
    });
    const form = event.currentTarget;
    const formData = new FormData(form);
    const year = String(formData.get('birthYear') || '');
    const month = String(formData.get('birthMonth') || '').padStart(2, '0');
    const day = String(formData.get('birthDay') || '').padStart(2, '0');
    const birthTime = String(formData.get('birthTime') || '');
    const birthDate = year && month && day ? `${year}-${month}-${day}` : '';

    if (!birthDate) {
      router.push(href(mode === 'solo' ? '/ask' : '/relationship/new'));
      return;
    }

    try {
      const response = await fetch('/api/love-reading/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          locale: activeLang === 'zh' ? 'zh-CN' : 'en',
          readingMode: mode === 'relationship' ? 'compatibility' : 'solo',
          birthDate,
          birthTime,
        }),
      });
      const payload = await response.json();
      if (response.ok && payload?.data?.redirectUrl) {
        router.push(payload.data.redirectUrl);
        return;
      }
    } catch (error) {
      console.warn('[TianjiLoveHome] session creation failed, using fallback route', error);
    }

    router.push(href(mode === 'solo' ? '/ask' : '/relationship/new'));
  };

  return (
    <main
      id="main-content"
      aria-label="Tianji Love first-viewport reference"
      className="tianji-love-page relative min-h-screen overflow-x-hidden bg-[#02040c] text-[#f7e4be]"
    >
      <TianjiLoveStyles />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_72%_18%,rgba(191,66,73,0.28),transparent_24%),radial-gradient(circle_at_24%_0%,rgba(220,179,114,0.13),transparent_32%),linear-gradient(180deg,#050814_0%,#02040c_52%,#060814_100%)]" />
      <div className="tianji-love-stars pointer-events-none fixed inset-0 z-0" aria-hidden />

      <Header copy={copy} activeLang={activeLang} href={href} onToggleLanguage={toggleLanguage} />

      <section className="love-hero-reference-grid tianji-love-hero relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-8 pt-24 sm:px-8 lg:min-h-[690px] lg:grid-cols-[minmax(560px,0.98fr)_minmax(520px,1.02fr)] lg:items-center lg:pt-28">
        <div className="tianji-love-hero-copy relative z-20 flex max-w-3xl flex-col items-start">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#d7a86c]/80">
            {copy.hero.eyebrow}
          </p>
          <h1 className="tianji-love-hero-title max-w-[720px] font-serif text-[2.7rem] font-semibold leading-[1.06] text-[#ffe1b2] drop-shadow-[0_0_28px_rgba(255,99,107,0.12)] sm:text-[4.2rem] lg:text-[4.7rem]">
            <span>{copy.hero.titleLead}</span>{' '}
            <em className="font-serif italic text-[#ff8f87]">{copy.hero.titleAccent}</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#f5d8aa]/86 sm:text-lg">{copy.hero.description}</p>
          <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              href={href('/love-test')}
              onClick={() => void trackRevenueFunnelEvent('home_cta_click', { surface: 'homepage_hero', lang: activeLang, cta: 'love_test' })}
              className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6] transition hover:border-[#ffd6ab] hover:text-white"
            >
              {copy.hero.loveTestCta ?? 'Take Love Test'}
              <ChevronRight className="ml-3 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={href('/relationship/new')}
              onClick={() => void trackRevenueFunnelEvent('home_cta_click', { surface: 'homepage_hero', lang: activeLang, cta: 'relationship' })}
              className="inline-flex min-h-14 items-center justify-center rounded-lg border border-[#d9b47c]/65 bg-black/28 px-8 text-base font-semibold text-[#f7ddb2] backdrop-blur transition hover:border-[#ffe1a6] hover:bg-[#d9b47c]/10"
            >
              {copy.hero.primaryCta}
            </Link>
            <Link
              href={href('/ask')}
              onClick={() => void trackRevenueFunnelEvent('home_cta_click', { surface: 'homepage_hero', lang: activeLang, cta: 'ask_preview' })}
              className="inline-flex min-h-14 items-center justify-center rounded-lg border border-[#d9b47c]/65 bg-black/28 px-8 text-base font-semibold text-[#f7ddb2] backdrop-blur transition hover:border-[#ffe1a6] hover:bg-[#d9b47c]/10"
            >
              {copy.hero.secondaryCta}
            </Link>
            <Link
              href={href('/draw')}
              onClick={() => void trackRevenueFunnelEvent('home_cta_click', { surface: 'homepage_hero', lang: activeLang, cta: 'draw_preview' })}
              className="inline-flex min-h-14 items-center justify-center rounded-lg border border-[#d9b47c]/50 bg-black/18 px-8 text-base font-semibold text-[#f7ddb2] backdrop-blur transition hover:border-[#ffe1a6] hover:bg-[#d9b47c]/10"
            >
              {copy.hero.tertiaryCta}
            </Link>
            <Link href={href('/about')} className="inline-flex min-h-14 items-center justify-center rounded-lg px-2 text-base font-semibold text-[#f5d8aa]/82 transition hover:text-[#ffe3b4] sm:px-4">
              {copy.hero.trustCta}
            </Link>
          </div>
          <Link
            href={sampleHref}
            className="mt-4 inline-flex items-center text-sm font-semibold text-[#d8b77b] underline-offset-4 transition hover:text-[#ffe3b4] hover:underline"
          >
            {'sampleCta' in copy.hero ? copy.hero.sampleCta : 'View Sample Reading'}
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden />
          </Link>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#f5d8aa]/76">
            {copy.hero.trust.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <TianjiLoveIcon src={item.iconAsset} size={18} className="tianji-love-inline-icon" />
                {item.label}
              </span>
            ))}
          </div>
          <div className="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-2">
            {homepageRelationshipProof[activeLang].map((item) => (
              <div key={item.label} className="rounded-lg border border-[#b57248]/22 bg-black/20 p-3 backdrop-blur">
                <p className="text-sm font-semibold text-[#ffe3b4]">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[#f4d7a3]/58">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="tianji-love-hero-visual love-hero-art-couple relative min-h-[430px] overflow-hidden lg:min-h-[610px]" aria-hidden>
          <Image src={HERO_COUPLE_REFERENCE} alt="" fill sizes="(min-width: 1024px) 48vw, 100vw" priority className="tianji-love-hero-art object-contain object-center opacity-95 mix-blend-screen" />
          <div className="tianji-love-hero-vignette absolute inset-0" />
          <div className="tianji-love-orbit absolute left-[16%] top-[8%] h-[72%] w-[72%] rounded-full border border-[#d8b77b]/18" />
          <div className="tianji-love-orbit tianji-love-orbit-two absolute left-[25%] top-[18%] h-[48%] w-[50%] rounded-full border border-[#d8b77b]/22" />
          <div className="tianji-love-red-thread absolute bottom-[8%] left-[49%] top-[4%] w-[72px]" />
        </div>
      </section>

      <section className="tianji-love-form-section relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
        <BirthChartForm copy={copy} mode={mode} setMode={setMode} onSubmit={handleSubmit} yearOptions={yearOptions} />
      </section>

      <section className="tianji-love-insight-section relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-5 py-7 sm:px-8 md:grid-cols-3">
        {copy.cards.map((card) => (
          <InsightCard key={card.title} card={card} />
        ))}
      </section>

      <FeatureStrip features={copy.features} />
      <HowItWorks process={copy.process} />
      <LoveTestimonials testimonials={copy.testimonials} />
      <FinalCta copy={copy} href={href} />
      <TianjiLoveFooter copy={copy} href={href} />
    </main>
  );
}

function Header({
  copy,
  activeLang,
  href,
  onToggleLanguage,
}: {
  copy: LoveCopy;
  activeLang: AppLanguage;
  href: (path: string) => string;
  onToggleLanguage: () => void;
}) {
  const navItems = copy.nav.some((item) => item.href === '/love-test')
    ? copy.nav
    : [{ label: 'Love Test', href: '/love-test' }, ...copy.nav];

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-[#d8b77b]/12 bg-[#02040c]/72 px-5 py-4 backdrop-blur-xl sm:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5">
        <Link href={href('/')} className="flex min-w-max items-center gap-3">
          <span className="tianji-love-brand-mark grid h-12 w-12 place-items-center overflow-hidden rounded-full">
            <Image src={BRAND_COMPASS_MARK} alt="" width={96} height={96} className="h-full w-full object-contain" priority />
          </span>
          <span>
            <span className="block font-serif text-2xl font-semibold leading-none text-[#ffe3b4]">{copy.brand}</span>
            <span className="block text-sm tracking-[0.18em] text-[#d8b77b]/82">tianji.love</span>
          </span>
        </Link>

        <div className="tianji-love-nav-links hidden items-center gap-8 text-sm font-medium text-[#f5d8aa]/82 lg:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={href(item.href)} className="transition hover:text-[#ffe3b4]">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={onToggleLanguage} className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d8b77b]/26 px-4 text-sm font-semibold text-[#f5d8aa]/90 transition hover:border-[#ffe3b4]" aria-label="Switch language">
            <Globe2 className="h-4 w-4" aria-hidden />
            {activeLang === 'zh' ? '中' : 'EN'}
          </button>
          <Link
            href={href('/relationship/new')}
            onClick={() => void trackRevenueFunnelEvent('home_cta_click', { surface: 'homepage_header', lang: activeLang, cta: 'relationship' })}
            className="tianji-love-primary hidden min-h-12 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-6 text-sm font-semibold text-[#fff7e6] sm:inline-flex"
          >
            {copy.hero.getStarted}
          </Link>
        </div>
      </nav>
    </header>
  );
}

function BirthChartForm({
  copy,
  mode,
  setMode,
  onSubmit,
  yearOptions,
}: {
  copy: LoveCopy;
  mode: 'solo' | 'relationship';
  setMode: (mode: 'solo' | 'relationship') => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  yearOptions: string[];
}) {
  const selects = {
    ...copy.form.selects,
    year: { ...copy.form.selects.year, options: yearOptions },
  };

  return (
    <form onSubmit={onSubmit} className="tianji-love-birth-form love-birth-chart-panel rounded-xl border border-[#b57248]/46 bg-[#060b16]/78 px-5 py-8 shadow-[0_0_0_1px_rgba(255,217,157,0.035),0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur md:px-20">
      <div className="mb-8 flex items-center justify-center gap-5 text-center">
        <span className="tianji-love-ornament-line h-px w-36" />
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <h2 className="font-serif text-[2.3rem] font-semibold leading-tight text-[#ffe3b4] sm:text-[3rem]">{copy.form.title}</h2>
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <span className="tianji-love-ornament-line h-px w-36 scale-x-[-1]" />
      </div>

      <div className="tianji-love-select-grid grid gap-5 md:grid-cols-4">
        <BirthSelect name="birthYear" select={selects.year} />
        <BirthSelect name="birthMonth" select={selects.month} />
        <BirthSelect name="birthDay" select={selects.day} />
        <BirthSelect name="birthTime" select={selects.time} />
      </div>
      <input type="hidden" name="birthDate" aria-hidden="true" />

      <div className="tianji-love-segment mx-auto mt-8 grid max-w-3xl grid-cols-2 overflow-hidden rounded-full border border-[#b57248]/54 bg-black/34 p-1">
        <button type="button" onClick={() => setMode('solo')} className={cx('inline-flex min-h-14 items-center justify-center gap-3 rounded-full font-serif text-xl font-semibold transition', mode === 'solo' ? 'bg-[#983b48]/72 text-[#fff7e6] shadow-[0_0_22px_rgba(255,92,99,0.28)]' : 'text-[#f4d7a3]/78 hover:text-[#ffe3b4]')}>
          <User className="h-4 w-4" aria-hidden />
          {copy.form.solo}
        </button>
        <button type="button" onClick={() => setMode('relationship')} className={cx('inline-flex min-h-14 items-center justify-center gap-3 rounded-full font-serif text-xl font-semibold transition', mode === 'relationship' ? 'bg-[#983b48]/72 text-[#fff7e6] shadow-[0_0_22px_rgba(255,92,99,0.28)]' : 'text-[#f4d7a3]/78 hover:text-[#ffe3b4]')}>
          <Users className="h-4 w-4" aria-hidden />
          {copy.form.relationship}
        </button>
      </div>

      <button type="submit" className="tianji-love-primary mx-auto mt-6 flex min-h-[76px] w-full max-w-3xl items-center justify-center rounded-xl border border-[#ffb49e]/60 px-6 font-serif text-2xl font-semibold text-[#fff7e6]">
        {copy.form.cta}
        <Sparkles className="ml-3 h-4 w-4" aria-hidden />
      </button>
      <p className="mt-4 text-center text-sm text-[#f4d7a3]/62">{copy.form.helper}</p>
    </form>
  );
}

function BirthSelect({ name, select }: { name: string; select: SelectCopy }) {
  return (
    <label className="block">
      <span className="mb-3 block font-serif text-xl font-semibold text-[#f4d7a3]/90">{select.label}</span>
      <span className="relative block">
        <select name={name} className="tianji-love-select h-16 w-full appearance-none rounded-lg border border-[#b57248]/44 bg-black/35 px-5 pr-12 font-serif text-xl text-[#f7efe4]/92 outline-none transition focus:border-[#ffe3b4] focus:ring-2 focus:ring-[#d8b77b]/30" defaultValue="">
          <option value="" disabled>
            {select.placeholder}
          </option>
          {select.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Calendar className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#d8b77b]" aria-hidden />
      </span>
    </label>
  );
}

function InsightCard({ card }: { card: LoveCopy['cards'][number] }) {
  return (
    <article className="tianji-love-insight-card group relative min-h-[276px] overflow-hidden rounded-lg border border-[#b57248]/42 bg-[#070b16]/78 px-7 py-8 text-center shadow-[inset_0_0_0_1px_rgba(255,217,157,0.025)] transition hover:border-[#d69d66]/62">
      <div className="tianji-love-inner-hairline pointer-events-none absolute inset-3 rounded-md border border-[#b57248]/12" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center">
        <MysticGlyph src={card.iconAsset} />
        <div>
          <h3 className="mt-5 font-serif text-3xl font-semibold text-[#ffe3b4]">{card.title}</h3>
          <span className="tianji-love-card-divider mx-auto mt-5 block h-px w-40" aria-hidden />
          <p className="mx-auto mt-5 max-w-[23ch] text-base leading-8 text-[#f4d7a3]/78">{card.body}</p>
        </div>
      </div>
    </article>
  );
}

function MysticGlyph({ src }: { src: string }) {
  return (
    <div className="tianji-love-glyph" aria-hidden>
      <TianjiLoveIcon src={src} size={72} />
    </div>
  );
}

function FeatureStrip({ features }: { features: LoveCopy['features'] }) {
  return (
    <section className="tianji-love-feature-section relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8">
      <div className="tianji-love-feature-panel grid overflow-hidden rounded-lg border border-[#b57248]/36 bg-[#070b16]/72 backdrop-blur md:grid-cols-4">
        {features.map((feature) => (
          <article key={feature.title} className="grid min-h-[122px] grid-cols-[4.2rem_1fr] items-center gap-4 border-b border-[#b57248]/24 px-6 py-5 md:border-b-0 md:border-r last:md:border-r-0">
            <TianjiLoveIcon src={feature.iconAsset} size={58} />
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#ffe3b4]">{feature.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-[#f4d7a3]/66">{feature.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks({ process }: { process: LoveCopy['process'] }) {
  return (
    <section id="how-it-works" className="tianji-love-process-section relative z-10 mx-auto w-full max-w-7xl px-5 py-12 text-center sm:px-8">
      <div className="mb-12 flex items-center justify-center gap-5">
        <span className="tianji-love-ornament-line h-px w-24" />
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <h2 className="font-serif text-[2.6rem] font-semibold leading-tight text-[#ffe3b4] sm:text-[3.45rem]">{process.title}</h2>
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <span className="tianji-love-ornament-line h-px w-24 scale-x-[-1]" />
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {process.steps.map((step, index) => (
          <article key={step.number} className="relative px-5 py-4">
            {index < process.steps.length - 1 ? (
              <span className="tianji-love-process-line absolute left-[58%] top-11 hidden h-px w-[84%] md:block" aria-hidden />
            ) : null}
            <div className="tianji-love-step-number relative mx-auto grid h-[5.6rem] w-[5.6rem] place-items-center rounded-full border border-[#d8b77b]/70 bg-[#080d18] font-serif text-5xl text-[#ffe3b4]">
              {step.number}
            </div>
            <h3 className="mt-8 font-serif text-3xl font-semibold text-[#ffe3b4]">{step.title}</h3>
            <span className="tianji-love-card-divider mx-auto mt-5 block h-px w-32" aria-hidden />
            <p className="mx-auto mt-5 max-w-xs text-lg leading-9 text-[#f4d7a3]/76">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoveTestimonials({ testimonials }: { testimonials: LoveCopy['testimonials'] }) {
  return (
    <section className="tianji-love-testimonial-section relative z-10 mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <div className="mb-10 flex flex-col items-center justify-center gap-5 text-center">
        <span className="tianji-love-ornament-line h-px w-[72%] max-w-4xl" />
        <h2 className="font-serif text-[2.5rem] font-semibold leading-tight text-[#ffe3b4] sm:text-[3.25rem]">{testimonials.title}</h2>
        <span className="tianji-love-card-divider block h-px w-72" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.cards.map((card) => (
          <article key={card.name} className="tianji-love-testimonial-card min-h-[300px] rounded-lg border border-[#b57248]/38 bg-[#070b16]/72 p-7 backdrop-blur">
            <div className="tianji-love-testimonial-header mb-7 grid grid-cols-[96px_minmax(0,1fr)] items-center gap-6">
              <div className={cx('tianji-love-testimonial-avatar grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full', card.tone)} aria-hidden>
                <Image src={card.avatar} alt="" width={128} height={128} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 self-center text-left">
                <h3 className="font-serif text-[2.45rem] font-semibold leading-none text-[#ffe3b4]">{card.name}</h3>
                <p className="mt-3 font-serif text-2xl leading-none text-[#d8b77b]/88">{card.tag}</p>
                <div className="mt-6 flex h-6 items-center gap-2 text-[#d8b77b]" aria-label="five stars">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} className="h-6 w-6 fill-current" aria-hidden />
                  ))}
                </div>
              </div>
            </div>
            <span className="tianji-love-card-divider mb-7 block h-px w-full" aria-hidden />
            <p className="text-xl leading-10 text-[#f4d7a3]/84">“{card.quote}”</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ copy, href }: { copy: LoveCopy; href: (path: string) => string }) {
  return (
    <section className="tianji-love-final-cta love-final-pavilion-cta relative z-10 mx-auto flex min-h-[620px] w-full max-w-[1600px] items-center px-5 pb-24 pt-20 sm:px-8 lg:px-24">
      <Image src={FINAL_PAVILION} alt="" fill sizes="100vw" className="absolute inset-0 rounded-t-lg border-t border-[#d8b77b]/20 object-cover object-center opacity-95" aria-hidden />
      <div className="absolute inset-0 rounded-t-lg bg-[linear-gradient(180deg,rgba(2,4,12,0.04),rgba(2,4,12,0.16)_46%,rgba(2,4,12,0.62)_100%),linear-gradient(90deg,rgba(2,4,12,0.86),rgba(2,4,12,0.52)_35%,rgba(2,4,12,0.12)_72%)]" aria-hidden />
      <div className="relative max-w-3xl">
        <span className="tianji-love-ornament-line mb-8 block h-px w-80 max-w-full" aria-hidden />
        <h2 className="font-serif text-[3.1rem] font-semibold leading-[1.08] text-[#ffe3b4] sm:text-[4.4rem] lg:text-[5.25rem]">{copy.cta.title}</h2>
        <span className="tianji-love-ornament-line mt-8 block h-px w-80 max-w-full" aria-hidden />
        <Link href={href('/relationship/new')} className="tianji-love-primary mt-10 inline-flex min-h-[72px] min-w-[360px] items-center justify-center rounded-xl border border-[#ffb49e]/60 px-12 font-serif text-2xl font-semibold text-[#fff7e6]">
          {copy.cta.button}
          <Sparkles className="ml-3 h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function TianjiLoveFooter({ copy, href }: { copy: LoveCopy; href: (path: string) => string }) {
  const footerLinks = copy.footer.links.some((item) => item.href === '/love-test')
    ? copy.footer.links
    : [{ label: 'Love Test', href: '/love-test' }, ...copy.footer.links];

  return (
    <footer className="relative z-10 border-t border-[#d8b77b]/14 bg-[#02040c]/94 px-5 py-8 text-[#f4d7a3]/70 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center overflow-hidden">
            <Image src={BRAND_COMPASS_MARK} alt="" width={80} height={80} className="h-full w-full object-contain" />
          </span>
          <div>
            <p className="font-semibold text-[#ffe3b4]">Tianji Love</p>
            <p className="text-xs">{copy.footer.tagline}</p>
            <p className="mt-1 max-w-md text-xs leading-5 text-[#f4d7a3]/52">{copy.footer.disclaimer}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
          {footerLinks.map((item) => (
            <Link key={item.label} href={href(item.href)} className="transition hover:text-[#ffe3b4]">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs">© 2024 Tianji Love</p>
      </div>
    </footer>
  );
}

function TianjiLoveStyles() {
  return (
    <style>{`
      .tianji-love-page {
        font-family: var(--font-tianji-sans), "Microsoft YaHei", system-ui, sans-serif;
        --tl-border: rgba(181, 114, 72, 0.42);
        --tl-border-soft: rgba(181, 114, 72, 0.24);
        --tl-border-glow: rgba(255, 197, 126, 0.08);
        --tl-panel: rgba(5, 10, 21, 0.78);
        --tl-panel-deep: rgba(2, 5, 14, 0.9);
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
      .tianji-love-hero-visual {
        isolation: isolate;
        filter: saturate(1.04) contrast(1.03);
        overflow: visible !important;
      }
      .tianji-love-hero-art {
        object-position: center center;
        transform: scale(1.08);
        transform-origin: 58% 52%;
        -webkit-mask-image:
          radial-gradient(ellipse at 58% 52%, #000 0 43%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.42) 68%, transparent 84%);
        mask-image:
          radial-gradient(ellipse at 58% 52%, #000 0 43%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.42) 68%, transparent 84%);
      }
      .tianji-love-hero-visual::before {
        content: "";
        position: absolute;
        inset: 6% 0 2% -10%;
        z-index: 2;
        pointer-events: none;
        background:
          radial-gradient(ellipse at 56% 52%, rgba(255,146,117,0.1), transparent 31%),
          radial-gradient(ellipse at 58% 52%, transparent 0 52%, rgba(177,105,67,0.08) 53%, transparent 54%),
          radial-gradient(ellipse at 58% 52%, transparent 0 64%, rgba(177,105,67,0.07) 65%, transparent 66%);
        mix-blend-mode: screen;
        opacity: 0.48;
      }
      .tianji-love-hero-vignette {
        z-index: 3;
        background:
          radial-gradient(ellipse at 60% 52%, transparent 0%, transparent 38%, rgba(2,4,12,0.36) 70%, rgba(2,4,12,0.92) 100%),
          linear-gradient(90deg, rgba(2,4,12,0.98), rgba(2,4,12,0.22) 29%, transparent 54%, rgba(2,4,12,0.24) 78%, rgba(2,4,12,0.58));
      }
      .tianji-love-orbit,
      .tianji-love-red-thread {
        display: none;
      }
      .love-birth-chart-panel,
      .tianji-love-insight-card,
      .tianji-love-feature-panel,
      .tianji-love-testimonial-card {
        border-color: var(--tl-border) !important;
        background:
          linear-gradient(180deg, rgba(8, 14, 28, 0.82), rgba(4, 8, 18, 0.76)),
          radial-gradient(circle at 18% 0%, rgba(181,114,72,0.07), transparent 36%) !important;
        box-shadow:
          inset 0 0 0 1px rgba(255, 221, 167, 0.028),
          0 18px 58px rgba(0, 0, 0, 0.26),
          0 0 34px rgba(181, 87, 62, 0.035) !important;
      }
      .love-birth-chart-panel {
        border-radius: 14px !important;
        box-shadow:
          inset 0 0 0 1px rgba(255, 221, 167, 0.04),
          0 28px 80px rgba(0, 0, 0, 0.32),
          0 0 42px rgba(181, 87, 62, 0.045) !important;
      }
      .tianji-love-inner-hairline {
        border-color: rgba(181, 114, 72, 0.16) !important;
      }
      .tianji-love-select,
      .tianji-love-segment {
        border-color: rgba(181, 114, 72, 0.48) !important;
        box-shadow: inset 0 0 0 1px rgba(255, 221, 167, 0.025);
      }
      .tianji-love-select {
        background:
          linear-gradient(180deg, rgba(8, 13, 24, 0.86), rgba(4, 7, 15, 0.88)) !important;
      }
      .tianji-love-feature-panel > article {
        border-color: rgba(181, 114, 72, 0.24) !important;
      }
      .tianji-love-page header,
      .tianji-love-page footer {
        border-color: rgba(181, 114, 72, 0.28) !important;
      }
      .tianji-love-icon {
        filter: drop-shadow(0 0 10px rgba(216,183,123,0.18));
      }
      .tianji-love-brand-mark {
        border: 0 !important;
        box-shadow: none !important;
      }
      .tianji-love-ornament-line {
        background-image: linear-gradient(90deg, transparent, rgba(216,183,123,0.32), rgba(255,227,180,0.72), rgba(216,183,123,0.32), transparent), url('${DIVIDER_LONG}');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 100% 36px;
      }
      .tianji-love-glyph {
        position: relative;
        height: 118px;
        width: 118px;
        border: 0;
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: transparent;
        box-shadow: none;
        overflow: hidden;
      }
      .tianji-love-glyph .tianji-love-icon {
        height: 118px !important;
        width: 118px !important;
        filter: drop-shadow(0 0 16px rgba(216,183,123,0.16));
      }
      .tianji-love-insight-card:nth-child(2) .tianji-love-glyph .tianji-love-icon,
      .tianji-love-insight-card:nth-child(3) .tianji-love-glyph .tianji-love-icon {
        transform: translateX(8px);
      }
      .tianji-love-testimonial-avatar {
        border: 0 !important;
        box-shadow: 0 0 18px rgba(255,124,130,0.12);
      }
      .tianji-love-card-divider {
        background: linear-gradient(90deg, transparent, rgba(181,114,72,0.42), rgba(255,198,130,0.78), rgba(181,114,72,0.42), transparent);
        position: relative;
      }
      .tianji-love-card-divider::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        height: 12px;
        width: 12px;
        transform: translate(-50%, -50%) rotate(45deg);
        background: radial-gradient(circle, rgba(255,210,159,0.95), rgba(255,124,130,0.24) 58%, transparent 70%);
        filter: drop-shadow(0 0 8px rgba(255,124,130,0.42));
      }
      .tianji-love-process-line {
        background: linear-gradient(90deg, rgba(181,114,72,0.1), rgba(255,227,180,0.82), rgba(181,114,72,0.1));
        box-shadow: 0 0 12px rgba(255,198,130,0.16);
      }
      .tianji-love-process-line::before,
      .tianji-love-process-line::after {
        content: "";
        position: absolute;
        top: 50%;
        height: 7px;
        width: 7px;
        transform: translateY(-50%) rotate(45deg);
        background: rgba(255,227,180,0.88);
        box-shadow: 0 0 10px rgba(255,124,130,0.42);
      }
      .tianji-love-process-line::before {
        left: 42%;
      }
      .tianji-love-process-line::after {
        right: 12%;
      }
      @keyframes tianji-love-twinkle {
        from { opacity: 0.58; }
        to { opacity: 0.96; }
      }
      @keyframes tianji-love-thread {
        from { clip-path: inset(0 0 8% 0); opacity: 0.7; }
        to { clip-path: inset(6% 0 0 0); opacity: 1; }
      }
      @media (min-width: 900px) and (max-width: 1023px) {
        .tianji-love-page header {
          padding-left: 20px;
          padding-right: 20px;
        }
        .tianji-love-nav-links {
          display: flex !important;
          gap: 27px;
          font-size: 12px;
          white-space: nowrap;
        }
        .tianji-love-hero {
          max-width: 941px;
          min-height: 438px;
          grid-template-columns: minmax(0, 418px) minmax(0, 1fr) !important;
          gap: 0;
          padding: 88px 0 0 49px;
        }
        .tianji-love-hero-copy {
          max-width: 420px;
        }
        .tianji-love-hero-title {
          max-width: 430px;
          font-size: 3.62rem;
          line-height: 1.03;
        }
        .tianji-love-hero-visual {
          min-height: 398px !important;
          overflow: visible !important;
        }
        .tianji-love-hero-art {
          object-position: center top;
          -webkit-mask-image: radial-gradient(ellipse at 62% 50%, #000 0 58%, rgba(0,0,0,0.72) 69%, transparent 92%);
          mask-image: radial-gradient(ellipse at 62% 50%, #000 0 58%, rgba(0,0,0,0.72) 69%, transparent 92%);
        }
        .tianji-love-form-section,
        .tianji-love-insight-section,
        .tianji-love-feature-section,
        .tianji-love-testimonial-section {
          max-width: 850px;
          padding-left: 0;
          padding-right: 0;
        }
        .tianji-love-birth-form {
          padding: 26px 68px 22px;
        }
        .tianji-love-select-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 30px;
        }
        .tianji-love-select-grid select {
          height: 42px;
          border-radius: 7px;
          font-size: 12px;
        }
        .tianji-love-insight-section {
          gap: 13px;
          padding-top: 16px;
          padding-bottom: 17px;
        }
        .tianji-love-insight-card {
          min-height: 236px;
          padding: 24px 18px;
        }
        .tianji-love-insight-card h3 {
          font-size: 1.4rem;
          line-height: 1.2;
        }
        .tianji-love-insight-card p {
          margin-top: 14px;
          font-size: 0.86rem;
          line-height: 1.55;
        }
        .tianji-love-glyph,
        .tianji-love-glyph .tianji-love-icon {
          height: 104px !important;
          width: 104px !important;
        }
        .tianji-love-testimonial-card {
          padding: 23px 22px !important;
        }
        .tianji-love-testimonial-header {
          grid-template-columns: 84px minmax(0, 1fr) !important;
          gap: 18px !important;
        }
        .tianji-love-testimonial-avatar {
          height: 84px !important;
          width: 84px !important;
        }
        .tianji-love-testimonial-header h3 {
          font-size: 2.05rem;
        }
        .tianji-love-testimonial-header p {
          font-size: 1.45rem;
        }
        .tianji-love-testimonial-header svg {
          height: 1.2rem;
          width: 1.2rem;
        }
        .tianji-love-process-section {
          max-width: 780px;
          padding-top: 4px;
          padding-bottom: 14px;
        }
        .tianji-love-final-cta {
          max-width: 941px;
          min-height: 356px;
          padding-left: 60px;
          padding-bottom: 44px;
          padding-top: 0;
        }
        .tianji-love-final-cta h2 {
          max-width: 600px;
          font-size: 2.52rem;
          line-height: 1.13;
        }
      }
      @media (max-width: 768px) {
        .tianji-love-red-thread {
          opacity: 0.58;
        }
        .tianji-love-insight-card {
          min-height: 230px;
        }
        .tianji-love-glyph,
        .tianji-love-glyph .tianji-love-icon {
          height: 100px !important;
          width: 100px !important;
        }
        .tianji-love-testimonial-header {
          grid-template-columns: 82px minmax(0, 1fr) !important;
          gap: 18px !important;
        }
        .tianji-love-testimonial-avatar {
          height: 82px !important;
          width: 82px !important;
        }
        .tianji-love-testimonial-header h3 {
          font-size: 2rem;
        }
        .tianji-love-testimonial-header p {
          font-size: 1.35rem;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .tianji-love-stars,
        .tianji-love-red-thread::before,
        .tianji-love-red-thread::after {
          animation: none !important;
        }
      }
    `}</style>
  );
}
