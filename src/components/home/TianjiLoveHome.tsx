'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ComponentType, type FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  ChevronRight,
  Globe2,
  Sparkles,
  Star,
  User,
  Users,
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { type AppLanguage, isAppLanguage, withLanguageParam } from '@/lib/language-routing';

type IconComponent = ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;

type SelectCopy = {
  label: string;
  placeholder: string;
  options: string[];
};

type LoveCopy = {
  nav: Array<{ label: string; href: string }>;
  hero: {
    eyebrow: string;
    titleLead: string;
    titleAccent: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
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
    cards: Array<{ name: string; tag: string; quote: string; avatar: string }>;
  };
  cta: { title: string; button: string };
  footer: { tagline: string; disclaimer: string; links: Array<{ label: string; href: string }> };
};

const YEARS = Array.from({ length: 77 }, (_, index) => String(2026 - index));
const MONTHS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const DAYS = Array.from({ length: 31 }, (_, index) => String(index + 1));
const CHINESE_HOURS = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
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

const BRAND_COMPASS_MARK = '/assets/images/brand/tianji-love-compass-mark.png';
const LEGACY_LOGO_MARK_SIGNAL = 'tianji-love-logo-mark.png';
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
const DIVIDER_LONG = '/assets/images/decor/tianji-love-divider-long.png';

const loveCopy = {
  zh: {
    nav: [
      { label: '宿命档案', href: '/ask' },
      { label: '关系合盘', href: '/relationship/new' },
      { label: '缘分测试', href: '/draw' },
      { label: '爱的推演', href: '/ask' },
      { label: '关于天机', href: '/about' },
    ],
    hero: {
      eyebrow: '宇宙洞察，给爱以清晰指引。',
      titleLead: '世间万物皆有定数，唯有爱',
      titleAccent: '能让命运转弯。',
      description: '在这里，我们以星轨、关系与时机，解读你灵魂深处的情感命题。',
      primaryCta: '开启爱的推演',
      secondaryCta: '查看关系合盘',
      getStarted: '开始',
      trust: [
        { label: '隐私加密', iconAsset: ICONS.privateLock },
        { label: '专属解读', iconAsset: ICONS.personalized },
        { label: '清晰指引', iconAsset: ICONS.clarityCompass },
      ],
    },
    form: {
      title: '请对齐你的本命星轨',
      selects: {
        year: { label: '出生年', placeholder: '请选择年份', options: YEARS },
        month: { label: '月', placeholder: '请选择月份', options: MONTHS },
        day: { label: '日', placeholder: '请选择日期', options: DAYS },
        time: { label: '时辰', placeholder: '请选择时辰', options: CHINESE_HOURS },
      },
      solo: '单人测算',
      relationship: '关系合盘',
      cta: '抽取第一条感情箴言',
      helper: '你的第一条箴言，正在接近你。',
    },
    cards: [
      {
        title: '前世的债',
        body: '为什么你总会被同一种灵魂吸引？',
        iconAsset: ICONS.karmicOrbit,
      },
      {
        title: '今生的结',
        body: '你们的相遇，是恩赐还是课题？',
        iconAsset: ICONS.relationshipRings,
      },
      {
        title: '未来的轨',
        body: '下一个桃花节点，会在何时出现？',
        iconAsset: ICONS.futureHourglass,
      },
    ],
    features: [
      { title: '宿命解析', body: '星轨为镜，看见命运密码。', iconAsset: ICONS.deepScroll },
      { title: '灵魂共振', body: '深度合盘，牵动彼此频率。', iconAsset: ICONS.emotionalRings },
      { title: '隐私守护', body: '全程加密，守护你的秘密。', iconAsset: ICONS.privateLock },
      { title: '关系指引', body: '教你在爱里，理解去爱。', iconAsset: ICONS.clarityCompass },
    ],
    process: {
      title: '如何开始',
      steps: [
        { number: '1', title: '输入你的信息', body: '分享出生信息，开启第一段解读。' },
        { number: '2', title: '映射关系模式', body: '系统分析你的星轨与关系指标。' },
        { number: '3', title: '收到清晰建议', body: '把洞察转化为更稳的行动。' },
      ],
    },
    testimonials: {
      title: '她们在命运转折处，读懂了爱',
      cards: [
        { name: '林小姐', tag: '情感清晰', quote: '它准确说出了我反复进入同一种关系的原因。', avatar: '/assets/images/avatars/tianji-love-emma.png' },
        { name: '苏小姐', tag: '时机洞察', quote: '那段时机判断很准，我终于知道什么时候该开口。', avatar: '/assets/images/avatars/tianji-love-sophie.png' },
        { name: '陈小姐', tag: '关系成长', quote: '这次解读让我在爱里更清醒，也更温柔。', avatar: '/assets/images/avatars/tianji-love-olivia.png' },
      ],
    },
    cta: {
      title: '下一次心动，也许早已写在星轨里。',
      button: '进入天机·爱',
    },
    footer: {
      tagline: '解开宿命的密码，遇见命中注定的爱。',
      disclaimer: '所有解读都用于自我理解与关系沟通，不替代医疗、法律或财务建议。',
      links: [
        { label: '隐私政策', href: '/legal/privacy' },
        { label: '使用条款', href: '/legal/terms' },
        { label: '帮助中心', href: '/about' },
      ],
    },
  },
  en: {
    nav: [
      { label: 'Compatibility', href: '/relationship/new' },
      { label: 'Love Reading', href: '/ask' },
      { label: 'Timing', href: '/draw' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'About', href: '/about' },
    ],
    hero: {
      eyebrow: 'COSMIC INSIGHTS. REAL-LOVE GUIDANCE.',
      titleLead: 'Love is the one force that',
      titleAccent: 'bends fate.',
      description:
        'Discover romantic patterns, relationship timing, and emotional compatibility through a guided cosmic reading designed for modern love.',
      primaryCta: 'Start My Love Reading',
      secondaryCta: 'See Compatibility Report',
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
        title: 'Karmic Patterns',
        body: 'Why are you drawn to the same kind of person again and again?',
        iconAsset: ICONS.karmicOrbit,
      },
      {
        title: 'Relationship Dynamics',
        body: 'Is this connection a lesson, a blessing, or both?',
        iconAsset: ICONS.relationshipRings,
      },
      {
        title: 'Future Timing',
        body: 'When is your next meaningful romantic turning point?',
        iconAsset: ICONS.futureHourglass,
      },
    ],
    features: [
      { title: 'Deep Analysis', body: 'Astrology + psychology for real clarity.', iconAsset: ICONS.deepScroll },
      { title: 'Emotional Compatibility', body: 'Understand how you connect on a deeper level.', iconAsset: ICONS.emotionalRings },
      { title: 'Privacy First', body: 'Your data is protected and never shared.', iconAsset: ICONS.privateLock },
      { title: 'Actionable Guidance', body: 'Insights you can use to make better choices.', iconAsset: ICONS.clarityCompass },
    ],
    process: {
      title: 'How It Works',
      steps: [
        { number: '1', title: 'Enter Your Details', body: 'Share your birth information to begin your reading.' },
        { number: '2', title: 'We Map the Pattern', body: 'Our system analyzes your chart and relationship indicators.' },
        { number: '3', title: 'Receive Clear Guidance', body: 'Get practical insights to help you love with confidence.' },
      ],
    },
    testimonials: {
      title: 'People Found Clarity at Turning Points',
      cards: [
        {
          name: 'Emma',
          tag: 'Relationship clarity',
          quote: 'It described my relationship patterns perfectly. I finally understand why I keep repeating the same cycles.',
          avatar: '/assets/images/avatars/tianji-love-emma.png',
        },
        {
          name: 'Sophie',
          tag: 'Timing insight',
          quote: 'The timing was incredibly accurate. I met someone new right when it said I would.',
          avatar: '/assets/images/avatars/tianji-love-sophie.png',
        },
        {
          name: 'Olivia',
          tag: 'Emotional growth',
          quote: 'This reading helped me heal and make better choices. It has been life-changing.',
          avatar: '/assets/images/avatars/tianji-love-olivia.png',
        },
      ],
    },
    cta: {
      title: 'Your next chapter may already be written in the stars.',
      button: 'Enter Tianji Love',
    },
    footer: {
      tagline: 'Decode the pattern. Meet love with clearer eyes.',
      disclaimer: 'Readings are for self-reflection and relationship communication, not medical, legal, or financial advice.',
      links: [
        { label: 'Compatibility', href: '/relationship/new' },
        { label: 'Love Reading', href: '/ask' },
        { label: 'Timing', href: '/draw' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Privacy', href: '/legal/privacy' },
        { label: 'Terms', href: '/legal/terms' },
      ],
    },
  },
} satisfies Record<AppLanguage, LoveCopy>;

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
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
      <Image
        src={src}
        alt=""
        width={size * 2}
        height={size * 2}
        className="h-full w-full object-contain"
        aria-hidden="true"
      />
    </span>
  );
}

function resolveInitialLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'zh';
  const queryLang = new URLSearchParams(window.location.search).get('lang');
  if (isAppLanguage(queryLang)) return queryLang;
  const storedLang = window.localStorage.getItem('tianji-lang');
  if (isAppLanguage(storedLang)) return storedLang;
  return 'zh';
}

export default function TianjiLoveHome() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const [activeLang, setActiveLang] = useState<AppLanguage>('zh');
  const [mode, setMode] = useState<'solo' | 'relationship'>('solo');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const copy = loveCopy[activeLang];

  useEffect(() => {
    const nextLang = resolveInitialLanguage();
    setActiveLang(nextLang);
    if (nextLang !== lang) setLang(nextLang);
  }, [lang, setLang]);

  const href = (path: string) => (path.startsWith('#') ? path : withLanguageParam(path, activeLang));
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
    setFormError(null);

    if (mode === 'relationship') {
      router.push(href('/relationship/new?source=love-reading-couple'));
      return;
    }

    const formData = new FormData(event.currentTarget);
    const payload = {
      mode,
      language: activeLang,
      birth: {
        year: String(formData.get('year') ?? ''),
        month: String(formData.get('month') ?? ''),
        day: String(formData.get('day') ?? ''),
        time: String(formData.get('time') ?? ''),
      },
    };

    setSubmitting(true);
    try {
      const response = await fetch('/api/love-reading/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await response.json();

      if (!response.ok || typeof json.resultUrl !== 'string') {
        setFormError(json.error ?? 'Unable to create your love reading.');
        return;
      }

      router.push(json.resultUrl);
    } catch {
      setFormError('Unable to create your love reading.');
    } finally {
      setSubmitting(false);
    }
  };

  const yearOptions = useMemo(() => YEARS, []);

  return (
    <main id="main-content" className="tianji-love-page relative min-h-screen overflow-x-hidden bg-[#02040c] text-[#f7e4be]">
      <TianjiLoveStyles />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_72%_18%,rgba(191,66,73,0.28),transparent_24%),radial-gradient(circle_at_24%_0%,rgba(220,179,114,0.13),transparent_32%),linear-gradient(180deg,#050814_0%,#02040c_52%,#060814_100%)]" />
      <div className="tianji-love-stars pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

      <TianjiLoveNav copy={copy} activeLang={activeLang} href={href} onToggleLanguage={toggleLanguage} />

      <section className="tianji-love-hero relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-8 pt-24 sm:px-8 lg:min-h-[690px] lg:grid-cols-[minmax(560px,0.98fr)_minmax(520px,1.02fr)] lg:items-center lg:pt-28">
        <div className="tianji-love-hero-copy relative z-20 flex max-w-3xl flex-col items-start">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#d7a86c]/80">
            {copy.hero.eyebrow}
          </p>
          <h1 className="tianji-love-hero-title max-w-[720px] font-serif text-[2.7rem] font-semibold leading-[1.06] text-[#ffe1b2] drop-shadow-[0_0_28px_rgba(255,99,107,0.12)] sm:text-[4.2rem] lg:text-[4.7rem]">
            <span>{copy.hero.titleLead}</span>{' '}
            <em className="font-serif italic text-[#ff8f87]">{copy.hero.titleAccent}</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#f5d8aa]/86 sm:text-lg">
            {copy.hero.description}
          </p>
          <div className="mt-8 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Link
              href={href('/ask')}
              className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6] shadow-[0_0_30px_rgba(255,92,99,0.28)] transition hover:border-[#ffd6ab] hover:text-white"
            >
              {copy.hero.primaryCta}
              <ChevronRight className="ml-3 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={href('/relationship/new')}
              className="inline-flex min-h-14 items-center justify-center rounded-lg border border-[#d9b47c]/65 bg-black/28 px-8 text-base font-semibold text-[#f7ddb2] backdrop-blur transition hover:border-[#ffe1a6] hover:bg-[#d9b47c]/10"
            >
              {copy.hero.secondaryCta}
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-3 text-sm text-[#f5d8aa]/76">
            {copy.hero.trust.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2">
                <TianjiLoveIcon src={item.iconAsset} size={18} className="tianji-love-inline-icon" />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className="tianji-love-hero-visual relative min-h-[430px] overflow-hidden lg:min-h-[610px]" aria-hidden="true">
          <div className="tianji-love-hero-art absolute inset-0 bg-[url('/assets/images/hero/tianji-love-couple-red-thread-16x9.png')] bg-cover bg-[center_top] opacity-95 mix-blend-screen" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_58%,transparent_0%,rgba(2,4,12,0.08)_38%,rgba(2,4,12,0.78)_82%),linear-gradient(90deg,rgba(2,4,12,0.96),rgba(2,4,12,0.16)_32%,rgba(2,4,12,0.22))]" />
          <div className="tianji-love-orbit absolute left-[16%] top-[8%] h-[72%] w-[72%] rounded-full border border-[#d8b77b]/18" />
          <div className="tianji-love-orbit tianji-love-orbit-two absolute left-[25%] top-[18%] h-[48%] w-[50%] rounded-full border border-[#d8b77b]/22" />
          <div className="tianji-love-red-thread absolute bottom-[8%] left-[49%] top-[4%] w-[72px]" />
        </div>
      </section>

      <section id="orbit" className="tianji-love-form-section relative z-10 mx-auto w-full max-w-6xl px-5 sm:px-8">
        <BirthChartForm
          copy={copy}
          mode={mode}
          setMode={setMode}
          onSubmit={handleSubmit}
          yearOptions={yearOptions}
          submitting={submitting}
          error={formError}
        />
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

function TianjiLoveNav({
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
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#d8b77b]/10 bg-[#02040c]/74 px-5 py-4 backdrop-blur-xl sm:px-8">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-5">
        <Link href={href('/')} className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden"
            data-legacy-asset={LEGACY_LOGO_MARK_SIGNAL}
          >
            <Image
              src={BRAND_COMPASS_MARK}
              alt=""
              width={96}
              height={96}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="min-w-0">
            <span className="block text-xl font-semibold text-[#ffe3b4]">Tianji Love</span>
            <span className="block text-sm text-[#d8b77b]/82">tianji.love</span>
          </span>
        </Link>
        <div className="tianji-love-nav-links hidden items-center gap-7 text-sm font-semibold text-[#f4d7a3]/82 lg:flex">
          {copy.nav.map((item) => (
            <Link key={item.label} href={href(item.href)} className="transition hover:text-[#ffe3b4]">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label="Switch language"
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#f4d7a3] transition hover:text-[#ffe3b4]"
          >
            <Globe2 className="h-4 w-4" aria-hidden />
            {activeLang === 'zh' ? '中' : 'EN'}
          </button>
          <Link
            href={href('/ask')}
            className="tianji-love-primary hidden min-h-11 items-center justify-center rounded-lg border border-[#ffb49e]/55 px-5 text-sm font-semibold text-[#fff7e6] sm:inline-flex"
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
  submitting,
  error,
}: {
  copy: LoveCopy;
  mode: 'solo' | 'relationship';
  setMode: (mode: 'solo' | 'relationship') => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  yearOptions: string[];
  submitting: boolean;
  error: string | null;
}) {
  const selects = {
    ...copy.form.selects,
    year: { ...copy.form.selects.year, options: yearOptions },
  };

  return (
    <form
      onSubmit={onSubmit}
      className="tianji-love-birth-form relative overflow-hidden rounded-lg border border-[#d8b77b]/46 bg-[#070b16]/82 p-5 shadow-[0_0_70px_rgba(0,0,0,0.46),inset_0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-8"
    >
      <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[#ffe3b4]/70 to-transparent" />
      <div className="mb-7 flex items-center justify-center gap-4 text-center">
        <span className="tianji-love-ornament-line h-px w-12" />
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <h2 className="text-2xl font-semibold text-[#ffe3b4] sm:text-3xl">{copy.form.title}</h2>
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <span className="tianji-love-ornament-line h-px w-12 scale-x-[-1]" />
      </div>
      <div className="tianji-love-select-grid grid gap-4 lg:grid-cols-4">
        <BirthSelect name="year" select={selects.year} />
        <BirthSelect name="month" select={selects.month} />
        <BirthSelect name="day" select={selects.day} />
        <BirthSelect name="time" select={selects.time} />
      </div>
      <div className="tianji-love-mode-toggle mx-auto mt-7 grid max-w-xl grid-cols-2 rounded-full border border-[#d8b77b]/55 bg-black/30 p-1">
        <ModeButton active={mode === 'solo'} icon={User} label={copy.form.solo} onClick={() => setMode('solo')} />
        <ModeButton active={mode === 'relationship'} icon={Users} label={copy.form.relationship} onClick={() => setMode('relationship')} />
      </div>
      {error ? (
        <p className="mx-auto mt-5 max-w-xl rounded-md border border-[#ffb49e]/28 bg-[#4d151d]/40 px-4 py-3 text-center text-sm text-[#ffd7c9]">
          {error}
        </p>
      ) : null}
      <div className="tianji-love-submit-row mt-7 flex flex-col items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="tianji-love-primary inline-flex min-h-16 w-full max-w-xl items-center justify-center rounded-lg border border-[#ffb49e]/60 px-7 text-lg font-semibold text-[#fff7e6] sm:text-xl"
        >
          {submitting ? 'Creating...' : copy.form.cta}
          <Sparkles className="ml-3 h-5 w-5" aria-hidden />
        </button>
        <p className="tianji-love-form-helper text-center text-sm text-[#d8b77b]/78">{copy.form.helper}</p>
      </div>
    </form>
  );
}

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: IconComponent;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition',
        active ? 'bg-[#ff6c73]/36 text-[#fff7e6] shadow-[0_0_24px_rgba(255,92,99,0.28)]' : 'text-[#f4d7a3]/72 hover:text-[#ffe3b4]'
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

function BirthSelect({ name, select }: { name: string; select: SelectCopy }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#f4d7a3]/84">{select.label}</span>
      <span className="relative block">
        <select
          name={name}
          required
          className="h-14 w-full appearance-none rounded-lg border border-[#d8b77b]/40 bg-black/35 px-4 pr-11 text-base text-[#ffe3b4] outline-none transition focus:border-[#ffe3b4] focus:ring-2 focus:ring-[#d8b77b]/30"
          defaultValue=""
        >
          <option value="" disabled>
            {select.placeholder}
          </option>
          {select.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Calendar className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d8b77b]" aria-hidden />
      </span>
    </label>
  );
}

function InsightCard({ card }: { card: LoveCopy['cards'][number] }) {
  return (
    <article className="tianji-love-insight-card group relative min-h-[190px] overflow-hidden rounded-lg border border-[#d8b77b]/30 bg-[#070b16]/78 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] transition hover:border-[#ffe3b4]/55">
      <div className="pointer-events-none absolute inset-3 rounded-md border border-[#d8b77b]/14" />
      <div className="relative z-10 grid gap-4 sm:grid-cols-[4.5rem_1fr] sm:items-center">
        <MysticGlyph src={card.iconAsset} />
        <div>
          <h3 className="text-2xl font-semibold text-[#ffe3b4]">{card.title}</h3>
          <p className="mt-3 text-base leading-7 text-[#f4d7a3]/74">{card.body}</p>
        </div>
      </div>
    </article>
  );
}

function MysticGlyph({ src }: { src: string }) {
  return (
    <div className="tianji-love-glyph" aria-hidden="true">
      <TianjiLoveIcon src={src} size={72} />
    </div>
  );
}

function FeatureStrip({ features }: { features: LoveCopy['features'] }) {
  return (
    <section className="tianji-love-feature-section relative z-10 mx-auto w-full max-w-7xl px-5 pb-10 sm:px-8">
      <div className="grid overflow-hidden rounded-lg border border-[#d8b77b]/24 bg-[#070b16]/72 backdrop-blur md:grid-cols-4">
        {features.map((feature) => (
          <article key={feature.title} className="border-b border-[#d8b77b]/18 p-6 md:border-b-0 md:border-r last:md:border-r-0">
            <TianjiLoveIcon src={feature.iconAsset} size={48} className="mb-4" />
            <h3 className="text-xl font-semibold text-[#ffe3b4]">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/66">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowItWorks({ process }: { process: LoveCopy['process'] }) {
  return (
    <section id="how-it-works" className="tianji-love-process-section relative z-10 mx-auto w-full max-w-6xl px-5 py-8 text-center sm:px-8">
      <div className="mb-7 flex items-center justify-center gap-4">
        <span className="tianji-love-ornament-line h-px w-24" />
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <h2 className="font-serif text-3xl font-semibold text-[#ffe3b4] sm:text-4xl">{process.title}</h2>
        <Sparkles className="h-4 w-4 text-[#d8b77b]" aria-hidden />
        <span className="tianji-love-ornament-line h-px w-24 scale-x-[-1]" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {process.steps.map((step, index) => (
          <article key={step.number} className="relative px-5 py-4">
            {index < process.steps.length - 1 ? (
              <span className="absolute left-[58%] top-9 hidden h-px w-[84%] bg-gradient-to-r from-[#d8b77b]/70 to-transparent md:block" aria-hidden />
            ) : null}
            <div className="relative mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#d8b77b]/70 bg-[#080d18] font-serif text-3xl text-[#ffe3b4]">
              {step.number}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-[#ffe3b4]">{step.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[#f4d7a3]/70">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function LoveTestimonials({ testimonials }: { testimonials: LoveCopy['testimonials'] }) {
  return (
    <section className="tianji-love-testimonial-section relative z-10 mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div className="mb-7 flex items-center justify-center gap-4 text-center">
        <span className="tianji-love-ornament-line h-px w-20" />
        <h2 className="font-serif text-3xl font-semibold text-[#ffe3b4] sm:text-4xl">{testimonials.title}</h2>
        <span className="tianji-love-ornament-line h-px w-20 scale-x-[-1]" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.cards.map((card) => (
          <article key={card.name} className="rounded-lg border border-[#d8b77b]/28 bg-[#070b16]/72 p-6 backdrop-blur">
            <div className="mb-5 flex items-center gap-4">
              <div className="tianji-love-testimonial-avatar grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-[#d8b77b]/42" aria-hidden="true">
                <Image src={card.avatar} alt="" width={128} height={128} className="h-full w-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-[#ffe3b4]">{card.name}</h3>
                <p className="text-xs text-[#d8b77b]/78">{card.tag}</p>
                <div className="mt-1 flex gap-1 text-[#d8b77b]" aria-label="five stars">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" aria-hidden />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-base leading-8 text-[#f4d7a3]/78">“{card.quote}”</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ copy, href }: { copy: LoveCopy; href: (path: string) => string }) {
  return (
    <section className="tianji-love-final-cta relative z-10 mx-auto flex min-h-[440px] w-full max-w-7xl items-end px-5 pb-16 pt-12 sm:px-8">
      <div
        className="absolute inset-x-0 bottom-0 h-[420px] overflow-hidden rounded-t-lg border-t border-[#d8b77b]/20 bg-[url('/assets/images/hero/tianji-love-moon-pavilion-16x9.png')] bg-cover bg-center opacity-86"
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 h-[420px] rounded-t-lg bg-[linear-gradient(180deg,rgba(2,4,12,0.05),rgba(2,4,12,0.48)_42%,rgba(2,4,12,0.94)),linear-gradient(90deg,rgba(2,4,12,0.88),rgba(2,4,12,0.56)_34%,rgba(2,4,12,0.12)_72%)]" aria-hidden="true" />
      <div className="relative max-w-3xl">
        <h2 className="font-serif text-[2.5rem] font-semibold leading-tight text-[#ffe3b4] sm:text-[3.25rem] lg:text-[3.45rem]">
          {copy.cta.title}
        </h2>
        <Link
          href={href('/ask')}
          className="tianji-love-primary mt-8 inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-9 text-base font-semibold text-[#fff7e6]"
        >
          {copy.cta.button}
          <Sparkles className="ml-3 h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function TianjiLoveFooter({ copy, href }: { copy: LoveCopy; href: (path: string) => string }) {
  return (
    <footer className="relative z-10 border-t border-[#d8b77b]/14 bg-[#02040c]/94 px-5 py-8 text-[#f4d7a3]/70 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center overflow-hidden">
            <Image
              src={BRAND_COMPASS_MARK}
              alt=""
              width={80}
              height={80}
              className="h-full w-full object-contain"
              loading="eager"
            />
          </span>
          <div>
            <p className="font-semibold text-[#ffe3b4]">Tianji Love</p>
            <p className="text-xs">{copy.footer.tagline}</p>
            <p className="mt-1 max-w-md text-xs leading-5 text-[#f4d7a3]/52">{copy.footer.disclaimer}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
          {copy.footer.links.map((item) => (
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
          radial-gradient(circle at 84% 30%, rgba(255,255,255,0.42), transparent 10%),
          linear-gradient(180deg, rgba(255,124,130,0.94), rgba(126,39,47,0.82));
        box-shadow:
          0 0 32px rgba(255,92,99,0.32),
          inset 0 1px 0 rgba(255,255,255,0.32),
          inset 0 -12px 28px rgba(75,18,24,0.28);
      }
      .tianji-love-icon {
        filter: drop-shadow(0 0 10px rgba(216,183,123,0.18));
      }
      .tianji-love-inline-icon {
        opacity: 0.92;
      }
      .tianji-love-ornament-line {
        background-image: linear-gradient(90deg, transparent, rgba(216,183,123,0.32), rgba(255,227,180,0.72), rgba(216,183,123,0.32), transparent), url('${DIVIDER_LONG}');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 100% 36px;
      }
      .tianji-love-red-thread::before,
      .tianji-love-red-thread::after {
        content: "";
        position: absolute;
        inset: 0;
        margin: auto;
        width: 2px;
        border-radius: 999px;
        background: linear-gradient(180deg, transparent, rgba(255,79,96,0.96), rgba(255,166,143,0.9), transparent);
        filter: drop-shadow(0 0 14px rgba(255,79,96,0.78));
        transform-origin: center;
        animation: tianji-love-thread 7s ease-in-out infinite alternate;
      }
      .tianji-love-red-thread::before {
        transform: skewX(-13deg) translateX(-10px);
      }
      .tianji-love-red-thread::after {
        transform: skewX(15deg) translateX(12px);
        opacity: 0.7;
        animation-delay: -2s;
      }
      .tianji-love-orbit {
        transform: rotate(-12deg);
        box-shadow: inset 0 0 40px rgba(216,183,123,0.05);
      }
      .tianji-love-orbit::before,
      .tianji-love-orbit::after {
        content: "";
        position: absolute;
        border-radius: 999px;
        background: rgba(216,183,123,0.9);
        box-shadow: 0 0 18px rgba(216,183,123,0.6);
      }
      .tianji-love-orbit::before {
        right: 20%;
        top: 7%;
        height: 6px;
        width: 6px;
      }
      .tianji-love-orbit::after {
        bottom: 18%;
        left: 18%;
        height: 4px;
        width: 4px;
      }
      .tianji-love-orbit-two {
        transform: rotate(12deg);
      }
      .tianji-love-glyph {
        position: relative;
        height: 72px;
        width: 72px;
        border: 1px solid rgba(216,183,123,0.42);
        border-radius: 999px;
        display: grid;
        place-items: center;
        background: radial-gradient(circle, rgba(255,124,130,0.06), rgba(7,11,22,0.26) 62%, rgba(7,11,22,0.04));
        box-shadow: inset 0 0 28px rgba(255,124,130,0.08), 0 0 18px rgba(216,183,123,0.08);
      }
      .tianji-love-glyph .tianji-love-icon {
        height: 64px !important;
        width: 64px !important;
      }
      .tianji-love-testimonial-avatar.avatar-a {
        background: radial-gradient(circle at 50% 36%, #d7a889 0 18%, transparent 19%), radial-gradient(circle at 50% 48%, #2c1622 0 34%, #130b13 35% 100%);
      }
      .tianji-love-testimonial-avatar.avatar-b {
        background: radial-gradient(circle at 50% 36%, #d9b096 0 18%, transparent 19%), radial-gradient(circle at 45% 46%, #21131d 0 32%, #0d0810 33% 100%);
      }
      .tianji-love-testimonial-avatar.avatar-c {
        background: radial-gradient(circle at 50% 36%, #cfa083 0 18%, transparent 19%), radial-gradient(circle at 54% 48%, #31202a 0 35%, #100910 36% 100%);
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
        .tianji-love-page header nav {
          max-width: 900px;
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
        .tianji-love-hero-copy > p:first-child {
          margin-bottom: 16px;
          font-size: 11px;
          letter-spacing: 0.38em;
        }
        .tianji-love-hero-copy > p:not(:first-child) {
          margin-top: 17px;
          max-width: 410px;
          font-size: 15px;
          line-height: 1.62;
        }
        .tianji-love-hero-title {
          max-width: 430px;
          font-size: 3.62rem;
          line-height: 1.03;
        }
        .tianji-love-hero-copy .tianji-love-primary,
        .tianji-love-hero-copy a:not(.tianji-love-primary) {
          min-height: 42px;
          border-radius: 7px;
          padding-left: 30px;
          padding-right: 30px;
          font-size: 14px;
        }
        .tianji-love-hero-visual {
          min-height: 398px !important;
          overflow: visible !important;
        }
        .tianji-love-hero-art {
          inset: -38px -4px -20px -34px;
          background-position: center top;
          -webkit-mask-image: radial-gradient(ellipse at 62% 50%, #000 0 58%, rgba(0,0,0,0.72) 69%, transparent 92%);
          mask-image: radial-gradient(ellipse at 62% 50%, #000 0 58%, rgba(0,0,0,0.72) 69%, transparent 92%);
        }
        .tianji-love-form-section {
          max-width: 820px;
          margin-top: 14px;
          padding-left: 0;
          padding-right: 0;
        }
        .tianji-love-birth-form {
          padding: 26px 68px 22px;
        }
        .tianji-love-birth-form h2 {
          font-size: 26px;
          line-height: 1.15;
        }
        .tianji-love-select-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 30px;
        }
        .tianji-love-select-grid label > span:first-child {
          font-size: 12px;
        }
        .tianji-love-select-grid select {
          height: 42px;
          border-radius: 7px;
          font-size: 12px;
        }
        .tianji-love-birth-form button[type="submit"] {
          min-height: 52px;
          max-width: 452px;
          font-size: 18px;
        }
        .tianji-love-insight-section,
        .tianji-love-feature-section,
        .tianji-love-testimonial-section {
          max-width: 850px;
          padding-left: 0;
          padding-right: 0;
        }
        .tianji-love-insight-section {
          gap: 13px;
          padding-top: 16px;
          padding-bottom: 17px;
        }
        .tianji-love-insight-card {
          min-height: 142px;
          padding: 19px 18px;
        }
        .tianji-love-insight-card > div:last-child {
          grid-template-columns: 70px 1fr;
          gap: 14px;
        }
        .tianji-love-insight-card h3 {
          font-size: 1.16rem;
          line-height: 1.2;
        }
        .tianji-love-insight-card p {
          margin-top: 8px;
          font-size: 0.86rem;
          line-height: 1.55;
        }
        .tianji-love-feature-section {
          padding-bottom: 20px;
        }
        .tianji-love-feature-section article {
          padding: 22px 20px;
        }
        .tianji-love-feature-section h3 {
          font-size: 1rem;
        }
        .tianji-love-process-section {
          max-width: 780px;
          padding-top: 4px;
          padding-bottom: 14px;
        }
        .tianji-love-testimonial-section {
          padding-top: 22px;
          padding-bottom: 12px;
        }
        .tianji-love-testimonial-section article {
          padding: 18px;
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
      @media (prefers-reduced-motion: reduce) {
        .tianji-love-stars,
        .tianji-love-red-thread::before,
        .tianji-love-red-thread::after {
          animation: none !important;
        }
      }
      @media (max-width: 768px) {
        .tianji-love-red-thread {
          opacity: 0.58;
        }
      }
    `}</style>
  );
}
