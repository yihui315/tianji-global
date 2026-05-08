'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Compass,
  Heart,
  Lock,
  MessageCircleHeart,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';

import { RelationshipForm } from '@/components/relationship/RelationshipForm';
import { RelationshipResult } from '@/components/relationship/RelationshipResult';
import { type AppLanguage, isAppLanguage, withLanguageParam } from '@/lib/language-routing';
import type { RelationshipReading, RelationshipType } from '@/types/relationship';

type RelationshipCopy = {
  nav: { home: string; pricing: string; privacy: string };
  hero: {
    eyebrow: string;
    title: string;
    line: string;
    body: string;
    primary: string;
    secondary: string;
  };
  trust: Array<{ title: string; body: string; icon: typeof Lock }>;
  steps: Array<{ title: string; body: string }>;
  loading: { title: string; body: string };
  error: { title: string; fallback: string };
  result: { back: string };
  footer: string;
};

const relationshipCopy = {
  zh: {
    nav: {
      home: '天机·爱',
      pricing: '会员权益',
      privacy: '隐私政策',
    },
    hero: {
      eyebrow: 'Tianji Love / Relationship Orbit',
      title: '把两个人的星轨，读成一段关系场。',
      line: 'Love is not a verdict. It is a pattern you can learn to hold.',
      body: '输入双方的出生日期与可选时辰，先看吸引、沟通、冲突、节奏与长期稳定性，再决定是否进入更深的关系报告。',
      primary: '填写双方信息',
      secondary: '回到首页',
    },
    trust: [
      { title: '隐私默认保护', body: '公开分享默认不包含出生日期、时辰、地点或时区。', icon: Shield },
      { title: '关系洞察优先', body: '用模式、节奏和沟通建议替代绝对预测。', icon: MessageCircleHeart },
      { title: '可升级报告', body: '先看摘要，再决定是否解锁完整关系维度。', icon: Sparkles },
    ],
    steps: [
      { title: '1. 对齐两份资料', body: '昵称与出生日期为必填；时辰和地点可补充精度。' },
      { title: '2. 生成关系结构', body: '系统读取五个维度，给出适合沟通的摘要。' },
      { title: '3. 私密分享或升级', body: '分享只展示安全摘要，完整报告保留给你们自己。' },
    ],
    loading: {
      title: '正在读取你们的关系星轨',
      body: '请稍等片刻，系统正在整理吸引力、沟通方式与当前节奏。',
    },
    error: {
      title: '这次合盘没有完成',
      fallback: '分析失败，请检查输入后再试一次。',
    },
    result: {
      back: '重新填写双方资料',
    },
    footer: '所有关系解读仅用于自我理解与沟通参考，不构成医疗、法律或财务建议。',
  },
  en: {
    nav: {
      home: 'Tianji Love',
      pricing: 'Pricing',
      privacy: 'Privacy',
    },
    hero: {
      eyebrow: 'Tianji Love / Relationship Orbit',
      title: 'Read two charts as one relational field.',
      line: 'Love is not a verdict. It is a pattern you can learn to hold.',
      body: 'Enter both birth dates and optional birth hours to read attraction, communication, conflict, rhythm, and long-term stability before opening a deeper report.',
      primary: 'Enter both profiles',
      secondary: 'Back home',
    },
    trust: [
      { title: 'Private by default', body: 'Public shares exclude birth date, time, location, and timezone by default.', icon: Shield },
      { title: 'Insight over certainty', body: 'The flow frames patterns and communication cues, not absolute predictions.', icon: MessageCircleHeart },
      { title: 'Upgrade-ready', body: 'Start with a summary, then unlock deeper relationship dimensions when needed.', icon: Sparkles },
    ],
    steps: [
      { title: '1. Align both profiles', body: 'Nicknames and birth dates are required; time and location improve context.' },
      { title: '2. Generate the pattern', body: 'The system reads five dimensions and returns a clear relationship summary.' },
      { title: '3. Share safely or upgrade', body: 'Sharing stays privacy-safe while deeper reports remain private.' },
    ],
    loading: {
      title: 'Reading your relationship orbit',
      body: 'The system is mapping attraction, communication, and current rhythm.',
    },
    error: {
      title: 'This reading did not complete',
      fallback: 'Analysis failed. Please check your inputs and try again.',
    },
    result: {
      back: 'Edit both profiles',
    },
    footer: 'Relationship readings are for self-reflection and communication, not medical, legal, or financial advice.',
  },
} satisfies Record<AppLanguage, RelationshipCopy>;

function getLanguageFromSearch(searchParams: URLSearchParams): AppLanguage {
  const queryLang = searchParams.get('lang');
  return isAppLanguage(queryLang) ? queryLang : 'zh';
}

export default function RelationshipNewClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<AppLanguage>('zh');
  const [result, setResult] = useState<RelationshipReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLanguage(getLanguageFromSearch(searchParams));
  }, [searchParams]);

  const copy = relationshipCopy[language];
  const isZh = language === 'zh';
  const href = (path: string) => withLanguageParam(path, language);

  const toggleLanguage = () => {
    const next = language === 'zh' ? 'en' : 'zh';
    setLanguage(next);
    router.replace(withLanguageParam('/relationship/new', next), { scroll: false });
  };

  const handleSubmit = async (data: {
    relationType: RelationshipType;
    personA: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
    personB: { nickname: string; birthDate: string; birthTime?: string; birthLocation?: string };
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/relationship/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationType: data.relationType,
          personA: data.personA,
          personB: data.personB,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? copy.error.fallback);
        return;
      }

      setResult(json.data);
    } catch {
      setError(copy.error.fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const orbitMarks = useMemo(() => Array.from({ length: 9 }, (_, index) => index), []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#03040a] text-[#f7e8c8]">
      <RelationshipFlowStyles />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_72%_0%,rgba(167,45,62,0.3),transparent_30%),radial-gradient(circle_at_18%_12%,rgba(216,183,123,0.14),transparent_34%),linear-gradient(180deg,#050812_0%,#03040a_58%,#070914_100%)]" />
      <div className="relationship-orbit-stars pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

      <header className="relative z-20 border-b border-[#d8b77b]/12 bg-[#03040a]/72 px-5 py-4 backdrop-blur-xl sm:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href={href('/')} className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-[#d8b77b]/55 text-[#d8b77b]">
              <Compass className="h-6 w-6" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold tracking-[0.08em] text-[#ffe3b4]">{copy.nav.home}</span>
              <span className="block text-xs tracking-[0.22em] text-[#d8b77b]/75">tianji.love</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-[#f4d7a3]/76">
            <Link href={href('/pricing')} className="hidden transition hover:text-[#ffe3b4] sm:inline">
              {copy.nav.pricing}
            </Link>
            <Link href={href('/legal/privacy')} className="hidden transition hover:text-[#ffe3b4] sm:inline">
              {copy.nav.privacy}
            </Link>
            <button
              type="button"
              onClick={toggleLanguage}
              className="rounded-full border border-[#d8b77b]/30 px-4 py-2 text-xs font-semibold tracking-[0.16em] transition hover:border-[#ffe3b4]"
              aria-label="Switch language"
            >
              {language === 'zh' ? '中 | EN' : 'EN | 中'}
            </button>
          </div>
        </nav>
      </header>

      {result ? (
        <section className="relative z-10 mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
          <button
            type="button"
            onClick={() => setResult(null)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d8b77b]/24 bg-black/20 px-4 py-2 text-sm text-[#f4d7a3]/70 transition hover:border-[#ffe3b4]/50 hover:text-[#ffe3b4]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {copy.result.back}
          </button>
          <RelationshipResult reading={result} lang={language} />
        </section>
      ) : (
        <>
          <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-5 pb-12 pt-12 sm:px-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(390px,0.86fr)] lg:items-center">
            <div className="relative z-10 max-w-3xl">
              <p className="mb-5 text-xs uppercase tracking-[0.32em] text-[#d8b77b]/70">{copy.hero.eyebrow}</p>
              <h1
                className="max-w-[720px] font-serif text-[2.3rem] font-semibold leading-[1.12] text-[#ffe3b4] sm:text-[3.6rem] lg:text-[4.35rem]"
                style={{ fontFamily: 'var(--font-tianji-display)' }}
              >
                {isZh ? (
                  <>
                    把两个人的星轨，
                    <br />
                    读成一段关系场。
                  </>
                ) : (
                  <>
                    Read two charts
                    <br />
                    as one relational field.
                  </>
                )}
              </h1>
              <p className="mt-5 inline-block border-b border-[#cf635f]/50 pb-2 text-base font-semibold text-[#ff8f83]">
                {copy.hero.line}
              </p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#f5d8aa]/78 sm:text-lg">{copy.hero.body}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="#relationship-form"
                  className="relationship-primary inline-flex min-h-14 items-center justify-center rounded-xl border border-[#ffb49e]/60 px-8 text-base font-semibold tracking-[0.12em] text-[#fff7e6]"
                >
                  {copy.hero.primary}
                  <Heart className="ml-3 h-4 w-4" aria-hidden />
                </a>
                <Link
                  href={href('/')}
                  className="inline-flex min-h-14 items-center justify-center rounded-xl border border-[#d9b47c]/55 bg-black/25 px-8 text-base font-semibold tracking-[0.1em] text-[#f7ddb2] transition hover:border-[#ffe1a6]"
                >
                  {copy.hero.secondary}
                </Link>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {copy.trust.map((item) => (
                  <article key={item.title} className="rounded-xl border border-[#d8b77b]/18 bg-[#070b16]/62 p-4 backdrop-blur">
                    <item.icon className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
                    <h2 className="text-sm font-semibold text-[#ffe3b4]">{item.title}</h2>
                    <p className="mt-2 text-xs leading-5 text-[#f4d7a3]/58">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative min-h-[460px] overflow-hidden rounded-[1.7rem] border border-[#d8b77b]/22 bg-[#070b16]/58">
              <div className="absolute inset-0 bg-[url('/assets/images/hero/relationship-hero-master-16x9.jpg')] bg-cover bg-center opacity-68 mix-blend-screen" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_32%,transparent_0%,rgba(3,4,10,0.18)_36%,rgba(3,4,10,0.86)_84%)]" />
              <div className="relationship-red-thread absolute inset-y-[-10%] left-1/2 w-20 -translate-x-1/2" aria-hidden />
              {orbitMarks.map((mark) => (
                <span
                  key={mark}
                  className="relationship-orbit-mark absolute rounded-full border border-[#d8b77b]/18"
                  style={{
                    inset: `${9 + mark * 3}% ${12 + mark * 2}%`,
                    transform: `rotate(${mark * 13 - 30}deg)`,
                  }}
                  aria-hidden="true"
                />
              ))}
              <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-[#d8b77b]/20 bg-black/30 p-5 backdrop-blur">
                <div className="flex items-center gap-3 text-[#ffe3b4]">
                  <Users className="h-6 w-6 text-[#d8b77b]" aria-hidden />
                  <p className="text-sm font-semibold tracking-[0.14em]">RELATIONSHIP FIELD</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#f4d7a3]/68">{copy.hero.line}</p>
              </div>
            </div>
          </section>

          <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-5 pb-8 sm:px-8 md:grid-cols-3">
            {copy.steps.map((step) => (
              <article key={step.title} className="rounded-xl border border-[#d8b77b]/20 bg-[#070b16]/60 p-5">
                <h2 className="text-base font-semibold text-[#ffe3b4]">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/60">{step.body}</p>
              </article>
            ))}
          </section>

          <section id="relationship-form" className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-16 sm:px-8">
            <div className="rounded-[1.7rem] border border-[#d8b77b]/36 bg-[#070b16]/76 p-5 shadow-[0_0_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
              <div className="mb-7 text-center">
                <p className="text-xs uppercase tracking-[0.28em] text-[#d8b77b]/64">Birth Orbit Form</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[0.08em] text-[#ffe3b4] sm:text-3xl">
                  {isZh ? '请填写双方的关系星轨' : 'Enter both relationship orbits'}
                </h2>
              </div>

              {isLoading && (
                <div className="mb-6 rounded-xl border border-[#d8b77b]/22 bg-[#d8b77b]/8 p-4 text-center">
                  <p className="font-semibold text-[#ffe3b4]">{copy.loading.title}</p>
                  <p className="mt-1 text-sm text-[#f4d7a3]/62">{copy.loading.body}</p>
                </div>
              )}

              {error && (
                <div className="mb-6 rounded-xl border border-[#ff7f80]/30 bg-[#ff5264]/10 p-4 text-center">
                  <p className="font-semibold text-[#ffb4a3]">{copy.error.title}</p>
                  <p className="mt-1 text-sm text-[#ffd6c6]/76">{error}</p>
                </div>
              )}

              <RelationshipForm onSubmit={handleSubmit} isLoading={isLoading} lang={language} />
            </div>
          </section>
        </>
      )}

      <footer className="relative z-10 border-t border-[#d8b77b]/14 px-5 py-8 text-center text-xs leading-6 text-[#f4d7a3]/45 sm:px-8">
        <Lock className="mx-auto mb-3 h-4 w-4 text-[#d8b77b]/70" aria-hidden />
        {copy.footer}
      </footer>
    </main>
  );
}

function RelationshipFlowStyles() {
  return (
    <style>{`
      .relationship-orbit-stars {
        background-image:
          radial-gradient(1px 1px at 12% 18%, rgba(255,227,180,0.55), transparent 50%),
          radial-gradient(1px 1px at 30% 36%, rgba(255,120,126,0.42), transparent 50%),
          radial-gradient(1.5px 1.5px at 62% 18%, rgba(216,183,123,0.5), transparent 50%),
          radial-gradient(1px 1px at 82% 28%, rgba(255,227,180,0.38), transparent 50%),
          radial-gradient(1px 1px at 72% 76%, rgba(255,120,126,0.34), transparent 50%);
        background-size: 920px 720px;
        animation: relationship-twinkle 5.5s ease-in-out infinite alternate;
      }
      .relationship-primary {
        background:
          radial-gradient(circle at 82% 30%, rgba(255,255,255,0.42), transparent 10%),
          linear-gradient(180deg, rgba(255,124,130,0.92), rgba(120,40,46,0.78));
        box-shadow:
          0 0 32px rgba(255,92,99,0.32),
          inset 0 1px 0 rgba(255,255,255,0.32),
          inset 0 -12px 28px rgba(75,18,24,0.28);
      }
      .relationship-form-submit {
        background:
          radial-gradient(circle at 82% 30%, rgba(255,255,255,0.42), transparent 10%),
          linear-gradient(180deg, rgba(255,124,130,0.92), rgba(120,40,46,0.78));
        box-shadow:
          0 0 32px rgba(255,92,99,0.26),
          inset 0 1px 0 rgba(255,255,255,0.28),
          inset 0 -12px 28px rgba(75,18,24,0.24);
      }
      .relationship-field-input {
        background: rgba(3, 4, 10, 0.82) !important;
        color: #ffe3b4 !important;
        color-scheme: dark;
        caret-color: #ffe3b4;
        -webkit-text-fill-color: #ffe3b4;
      }
      .relationship-field-input::placeholder {
        color: rgba(244, 215, 163, 0.32);
        -webkit-text-fill-color: rgba(244, 215, 163, 0.32);
      }
      .relationship-field-input::-webkit-calendar-picker-indicator {
        filter: invert(78%) sepia(26%) saturate(491%) hue-rotate(358deg) brightness(92%) contrast(88%);
        opacity: 0.82;
      }
      .relationship-field-input:-webkit-autofill {
        box-shadow: 0 0 0 1000px rgba(3, 4, 10, 0.92) inset;
        -webkit-text-fill-color: #ffe3b4;
      }
      .relationship-red-thread::before,
      .relationship-red-thread::after {
        content: "";
        position: absolute;
        inset: 0;
        margin: auto;
        width: 2px;
        border-radius: 999px;
        background: linear-gradient(180deg, transparent, rgba(255,79,96,0.95), rgba(255,166,143,0.88), transparent);
        filter: drop-shadow(0 0 14px rgba(255,79,96,0.76));
        animation: relationship-thread 7s ease-in-out infinite alternate;
      }
      .relationship-red-thread::before {
        transform: skewX(-13deg) translateX(-10px);
      }
      .relationship-red-thread::after {
        opacity: 0.68;
        transform: skewX(15deg) translateX(12px);
        animation-delay: -2s;
      }
      @keyframes relationship-twinkle {
        from { opacity: 0.58; }
        to { opacity: 0.96; }
      }
      @keyframes relationship-thread {
        from { clip-path: inset(0 0 8% 0); opacity: 0.68; }
        to { clip-path: inset(6% 0 0 0); opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .relationship-orbit-stars,
        .relationship-red-thread::before,
        .relationship-red-thread::after {
          animation: none !important;
        }
      }
    `}</style>
  );
}
