'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  CreditCard,
  Globe2,
  Heart,
  Lock,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { type AppLanguage, withLanguageParam } from '@/lib/language-routing';

interface PreviewState {
  id: string;
  preview: string;
  language: 'en' | 'zh';
  price: string;
}

interface UnlockedState {
  question: string;
  fullAnswer: string;
  language: 'en' | 'zh';
}

type AskCopy = {
  nav: {
    home: string;
    loveReading: string;
    ask: string;
    draw: string;
    pricing: string;
    about: string;
    login: string;
    privacy: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    accent: string;
    body: string;
    primary: string;
    secondary: string;
  };
  form: {
    eyebrow: string;
    title: string;
    description: string;
    placeholder: string;
    helper: string;
    loading: string;
  };
  trust: Array<{ title: string; body: string; icon: typeof Lock }>;
  preview: {
    eyebrow: string;
    title: string;
    paywallNote: string;
    assurance: string;
    unlockCta: string;
    unlocking: string;
  };
  unlocked: {
    eyebrow: string;
    title: string;
  };
  unlockBenefits: string[];
  finalCta: {
    title: string;
    button: string;
  };
  footer: string;
};

const PREVIEW_STORAGE_KEY = 'tianji.ask.preview';
const LOGO_MARK = '/assets/images/brand/tianji-love-logo-mark.png';
const HERO_COUPLE = '/assets/images/hero/tianji-love-couple-red-thread-16x9.png';
const FINAL_PAVILION = '/assets/images/hero/tianji-love-moon-pavilion-16x9.png';

const askCopy = {
  en: {
    nav: {
      home: 'Tianji Love',
      loveReading: 'Love Reading',
      ask: 'Ask',
      draw: 'Draw',
      pricing: 'Pricing',
      about: 'About',
      login: 'Login',
      privacy: 'Privacy',
    },
    hero: {
      eyebrow: 'Tianji Love / One Question',
      title: 'Ask about the pattern your heart keeps returning to.',
      accent: 'Read the signal before you move.',
      body:
        'Bring one real love question: attraction, silence, timing, a choice, or the loop you cannot quite name. Tianji Love gives a private preview first, then lets you unlock the deeper reading only if it helps.',
      primary: 'Decode my love question',
      secondary: 'Start relationship reading',
    },
    form: {
      eyebrow: 'Your love question',
      title: 'Name the situation clearly',
      description:
        'Write the real context, the emotional choice in front of you, and what feels unclear. The preview stays private and does not publish your question.',
      placeholder:
        'e.g. We keep reconnecting, then pulling away. What pattern should I understand before I decide whether to continue?',
      helper: 'Private preview. No subscription. One clear question at a time.',
      loading: 'Reading the pattern...',
    },
    trust: [
      { title: 'Private preview', body: 'Your question is used for this reading flow and is not shown publicly.', icon: Lock },
      { title: 'Love-focused clarity', body: 'The reading frames patterns, timing, and next steps without deterministic promises.', icon: MessageCircleHeart },
      { title: 'One-time unlock', body: 'Start free, then use a single secure checkout only if the preview is useful.', icon: CreditCard },
    ],
    preview: {
      eyebrow: 'Your first love signal',
      title: 'A private preview is ready',
      paywallNote:
        'Unlock the complete love reading for {price}: relationship pattern, hidden tension, timing cue, next best move, and one reflection prompt.',
      assurance: 'Secure Stripe checkout. One-time payment. 24h refund window.',
      unlockCta: 'Unlock complete love reading - {price}',
      unlocking: 'Opening checkout...',
    },
    unlocked: {
      eyebrow: 'Your complete love reading',
      title: 'Your reading is open',
    },
    unlockBenefits: [
      'The emotional pattern underneath the question',
      'The hidden pressure or opportunity to notice',
      'Whether this is a move-now, wait, or reframe moment',
      'A concrete next step for the next 24 to 72 hours',
    ],
    finalCta: {
      title: 'Love becomes easier to choose when the pattern is visible.',
      button: 'Start another love reading',
    },
    footer:
      'Love readings are for reflection and relationship communication, not medical, legal, financial, or crisis advice.',
  },
  zh: {
    nav: {
      home: 'Tianji Love',
      loveReading: '关系解读',
      ask: '提问',
      draw: '抽牌',
      pricing: '价格',
      about: '关于',
      login: '登录',
      privacy: '隐私',
    },
    hero: {
      eyebrow: 'Tianji Love / 一个问题',
      title: '问清那段一直回到心里的关系模式。',
      accent: '先看信号，再决定下一步。',
      body:
        '带来一个真实的爱情问题：吸引、沉默、时机、选择，或那种说不清却反复出现的循环。Tianji Love 先给你一段私密预览，只有当它真的有帮助时，再解锁更深的解读。',
      primary: '解读我的爱情问题',
      secondary: '开始关系解读',
    },
    form: {
      eyebrow: '你的爱情问题',
      title: '把现在的处境说清楚',
      description:
        '写下真实背景、眼前的情感选择，以及你最不确定的地方。预览是私密的，不会公开你的问题。',
      placeholder: '例如：我们总是重新靠近，又突然拉开。我该先理解什么模式，再决定要不要继续？',
      helper: '私密预览。无需订阅。一次只问一个清楚的问题。',
      loading: '正在读取关系模式...',
    },
    trust: [
      { title: '私密预览', body: '你的问题只用于本次解读流程，不会公开展示。', icon: Lock },
      { title: '聚焦爱情清晰感', body: '解读关系模式、时机和下一步，不做绝对承诺。', icon: MessageCircleHeart },
      { title: '单次解锁', body: '先免费预览；有帮助时，再通过安全结账单次解锁。', icon: CreditCard },
    ],
    preview: {
      eyebrow: '你的第一段爱情信号',
      title: '私密预览已生成',
      paywallNote:
        '解锁完整爱情解读 {price}：关系模式、隐藏张力、时机线索、下一步行动与一个反思问题。',
      assurance: '通过 Stripe 安全结账。单次付款。24 小时退款窗口。',
      unlockCta: '解锁完整爱情解读 - {price}',
      unlocking: '正在打开结账...',
    },
    unlocked: {
      eyebrow: '你的完整爱情解读',
      title: '完整解读已打开',
    },
    unlockBenefits: [
      '这个问题背后的情绪模式',
      '此刻容易被忽略的压力或机会',
      '现在适合行动、等待，还是换一种问法',
      '接下来 24 到 72 小时可做的一步',
    ],
    finalCta: {
      title: '当模式被看见，爱里的选择会更清楚。',
      button: '再问一个爱情问题',
    },
    footer: '爱情解读仅用于自我理解与关系沟通参考，不构成医疗、法律、财务或危机建议。',
  },
} satisfies Record<AppLanguage, AskCopy>;

function readStoredPreview(): PreviewState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(PREVIEW_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.id === 'string' &&
      typeof parsed.preview === 'string' &&
      (parsed.language === 'en' || parsed.language === 'zh')
    ) {
      return parsed as PreviewState;
    }
  } catch {
    // Ignore invalid sessionStorage data.
  }
  return null;
}

function writeStoredPreview(state: PreviewState | null) {
  if (typeof window === 'undefined') return;
  if (!state) {
    window.sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
    return;
  }
  window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(state));
}

export default function AskPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const copy = askCopy[language];

  const [question, setQuestion] = useState('');
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [unlocked, setUnlocked] = useState<UnlockedState | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyAttempted = useRef(false);

  const href = (path: string) => withLanguageParam(path, language);

  const toggleLanguage = () => {
    const next = language === 'zh' ? 'en' : 'zh';
    setLanguage(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tianji-lang', next);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', next);
      window.history.replaceState({}, '', url.toString());
    }
  };

  useEffect(() => {
    const stored = readStoredPreview();
    if (stored) setPreview(stored);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (verifyAttempted.current) return;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const id = params.get('id');
    if (!sessionId) return;
    verifyAttempted.current = true;

    (async () => {
      try {
        setUnlocking(true);
        const unlockParams = new URLSearchParams({ session_id: sessionId });
        if (id) unlockParams.set('id', id);
        const res = await fetch(`/api/ask/unlock?${unlockParams.toString()}`, { method: 'GET' });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Unable to verify payment');
        }
        const data = json.data as UnlockedState;
        setUnlocked(data);
        writeStoredPreview(null);
        setPreview(null);
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('session_id');
        cleanUrl.searchParams.delete('id');
        cleanUrl.searchParams.delete('cancelled');
        window.history.replaceState({}, '', cleanUrl.toString());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        setUnlocking(false);
      }
    })();
  }, []);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!question.trim() || loading) return;
      setError(null);
      setUnlocked(null);
      try {
        setLoading(true);
        const res = await fetch('/api/ask/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: question.trim(), language }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Unable to generate preview');
        }
        const state: PreviewState = {
          id: json.id,
          preview: json.preview,
          language: json.language,
          price: json.price,
        };
        setPreview(state);
        writeStoredPreview(state);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    },
    [question, language, loading],
  );

  const onUnlock = useCallback(async () => {
    if (!preview || unlocking) return;
    setError(null);
    try {
      setUnlocking(true);
      const res = await fetch('/api/ask/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: preview.id, language: preview.language }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error || 'Unable to start checkout');
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setUnlocking(false);
    }
  }, [preview, unlocking]);

  return (
    <main className="tianji-love-ask-page relative min-h-screen overflow-x-hidden bg-[#03040a] text-[#f7e8c8]" aria-label="Tianji Love reading page">
      <AskLoveStyles />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_72%_4%,rgba(167,45,62,0.32),transparent_28%),radial-gradient(circle_at_18%_10%,rgba(216,183,123,0.14),transparent_34%),linear-gradient(180deg,#050812_0%,#03040a_58%,#070914_100%)]" />
      <div className="tianji-love-stars pointer-events-none fixed inset-0 z-0" aria-hidden />

      <header className="tianji-love-shell-header fixed inset-x-0 top-0 z-30 border-b border-[#b57248]/28 bg-[#03040a]/76 px-5 py-4 backdrop-blur-xl sm:px-8">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href={href('/')} className="flex min-w-max items-center gap-3">
            <span className="tianji-love-logo-fuse grid h-12 w-12 place-items-center overflow-hidden rounded-full">
              <Image src={LOGO_MARK} alt="" width={96} height={96} className="tianji-love-logo-image h-full w-full object-contain" priority />
            </span>
            <span>
              <span className="block font-serif text-2xl font-semibold leading-none text-[#ffe3b4]">{copy.nav.home}</span>
              <span className="block text-sm tracking-[0.18em] text-[#d8b77b]/82">tianji.love</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-[#f5d8aa]/82 lg:flex">
            <Link href={href('/relationship/new')} className="transition hover:text-[#ffe3b4]">{copy.nav.loveReading}</Link>
            <Link href={href('/ask')} className="transition hover:text-[#ffe3b4]">{copy.nav.ask}</Link>
            <Link href={href('/draw')} className="transition hover:text-[#ffe3b4]">{copy.nav.draw}</Link>
            <Link href={href('/pricing')} className="transition hover:text-[#ffe3b4]">{copy.nav.pricing}</Link>
            <Link href={href('/about')} className="transition hover:text-[#ffe3b4]">{copy.nav.about}</Link>
            <Link href={href('/login')} className="transition hover:text-[#ffe3b4]">{copy.nav.login}</Link>
          </div>

          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d8b77b]/30 px-4 text-sm font-semibold text-[#f5d8aa]/90 transition hover:border-[#ffe3b4]"
            aria-label="Switch language"
          >
            <Globe2 className="h-4 w-4" aria-hidden />
            {language === 'zh' ? '中' : 'EN'}
          </button>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-12 pt-28 sm:px-8 lg:min-h-[760px] lg:grid-cols-[minmax(0,0.94fr)_minmax(460px,0.76fr)] lg:items-center lg:pt-32">
        <div className="relative z-10 max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.42em] text-[#d7a86c]/80">{copy.hero.eyebrow}</p>
          <h1 className="max-w-[820px] font-serif text-[2.7rem] font-semibold leading-[1.06] text-[#ffe1b2] sm:text-[4.1rem] lg:text-[4.9rem]">
            {copy.hero.title}
          </h1>
          <p className="mt-5 font-serif text-2xl italic text-[#ff8f87] sm:text-3xl">{copy.hero.accent}</p>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#f5d8aa]/84 sm:text-lg">{copy.hero.body}</p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a href="#love-question" className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6] transition hover:border-[#ffd6ab]">
              {copy.hero.primary}
              <ChevronRight className="ml-3 h-4 w-4" aria-hidden />
            </a>
            <Link href={href('/relationship/new')} className="inline-flex min-h-14 items-center justify-center rounded-lg border border-[#d9b47c]/65 bg-black/28 px-8 text-base font-semibold text-[#f7ddb2] backdrop-blur transition hover:border-[#ffe1a6] hover:bg-[#d9b47c]/10">
              {copy.hero.secondary}
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {copy.trust.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="tianji-love-ask-trust-card rounded-lg border border-[#b57248]/34 bg-[#070b16]/68 p-4 backdrop-blur">
                  <Icon className="mb-3 h-5 w-5 text-[#d8b77b]" aria-hidden />
                  <h2 className="font-serif text-lg font-semibold text-[#ffe3b4]">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/68">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="tianji-love-ask-hero-visual relative min-h-[520px]">
          <Image src={HERO_COUPLE} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="tianji-love-ask-hero-art object-contain object-center opacity-92 mix-blend-screen" priority />
          <div className="tianji-love-ask-hero-vignette absolute inset-0" aria-hidden />
        </div>
      </section>

      <section id="love-question" className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
        <div className="love-birth-chart-panel rounded-xl border border-[#b57248]/46 bg-[#060b16]/82 px-5 py-8 shadow-[0_0_0_1px_rgba(255,217,157,0.035),0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur md:px-14">
          <div className="mb-7 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d7a86c]/78">{copy.form.eyebrow}</p>
            <h2 className="mt-3 font-serif text-[2.4rem] font-semibold leading-tight text-[#ffe3b4] sm:text-[3.2rem]">{copy.form.title}</h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#f4d7a3]/74">{copy.form.description}</p>
          </div>

          <form onSubmit={onSubmit} className="grid gap-5">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={6}
              maxLength={500}
              placeholder={copy.form.placeholder}
              className="tianji-love-ask-textarea min-h-[180px] w-full resize-none rounded-lg border border-[#b57248]/42 bg-[#030711]/80 p-5 text-base leading-8 text-[#fff4dd] outline-none transition placeholder:text-[#f4d7a3]/38 focus:border-[#ffb49e]/62 focus:shadow-[0_0_22px_rgba(255,92,99,0.12)]"
              disabled={loading}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2 text-sm text-[#f4d7a3]/62">
                <ShieldCheck className="h-4 w-4 text-[#d8b77b]" aria-hidden />
                {copy.form.helper} {question.length} / 500
              </span>
              <button type="submit" disabled={!question.trim() || loading} className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-55">
                {loading ? copy.form.loading : copy.hero.primary}
                <Sparkles className="ml-3 h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>
        </div>
      </section>

      {preview && !unlocked && (
        <ReadingPanel eyebrow={copy.preview.eyebrow} title={copy.preview.title}>
          <p className="whitespace-pre-line text-base leading-8 text-[#fff4dd]/88">{preview.preview}</p>
          <div className="my-6 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,198,130,0.62),transparent)]" />
          <div className="rounded-lg border border-[#b57248]/38 bg-[#090d18]/72 p-4 text-sm leading-7 text-[#f4d7a3]/74">
            {copy.preview.paywallNote.replace('{price}', preview.price)}
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {copy.unlockBenefits.map((benefit) => (
              <li key={benefit} className="rounded-lg border border-[#b57248]/28 bg-black/20 px-4 py-3 text-sm text-[#f4d7a3]/78">
                <Star className="mr-2 inline h-4 w-4 fill-[#d8b77b] text-[#d8b77b]" aria-hidden />
                {benefit}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs tracking-[0.12em] text-[#f4d7a3]/58">{copy.preview.assurance}</span>
            <button type="button" onClick={onUnlock} disabled={unlocking} className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-55">
              {unlocking ? copy.preview.unlocking : copy.preview.unlockCta.replace('{price}', preview.price)}
            </button>
          </div>
        </ReadingPanel>
      )}

      {unlocked && (
        <ReadingPanel eyebrow={copy.unlocked.eyebrow} title={copy.unlocked.title}>
          <h3 className="font-serif text-2xl text-[#ffe3b4]">&quot;{unlocked.question}&quot;</h3>
          <div className="mt-5 whitespace-pre-line text-base leading-8 text-[#fff4dd]/88">{unlocked.fullAnswer}</div>
        </ReadingPanel>
      )}

      {error && (
        <section className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-10 sm:px-8">
          <div className="rounded-lg border border-[#ff8f87]/42 bg-[#3d0f17]/34 p-4 text-[#ffd0c9]">{error}</div>
        </section>
      )}

      <section className="love-final-pavilion-cta relative z-10 mx-auto mt-8 flex min-h-[420px] w-full max-w-[1600px] items-center overflow-hidden px-5 py-20 sm:px-8 lg:px-24">
        <Image src={FINAL_PAVILION} alt="" fill sizes="100vw" className="absolute inset-0 object-cover object-center opacity-88" aria-hidden />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,4,10,0.92),rgba(3,4,10,0.56)_38%,rgba(3,4,10,0.12)_72%),linear-gradient(180deg,rgba(3,4,10,0.08),rgba(3,4,10,0.62))]" aria-hidden />
        <div className="relative max-w-3xl">
          <Heart className="mb-6 h-7 w-7 text-[#ff8f87]" aria-hidden />
          <h2 className="font-serif text-[2.8rem] font-semibold leading-tight text-[#ffe3b4] sm:text-[4.3rem]">{copy.finalCta.title}</h2>
          <a href="#love-question" className="tianji-love-primary mt-8 inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6]">
            {copy.finalCta.button}
          </a>
        </div>
      </section>

      <footer className="relative z-10 border-t border-[#b57248]/24 bg-[#02040c]/94 px-5 py-8 text-[#f4d7a3]/68 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="tianji-love-logo-fuse grid h-11 w-11 place-items-center overflow-hidden rounded-full">
              <Image src={LOGO_MARK} alt="" width={88} height={88} className="tianji-love-logo-image h-full w-full object-contain" />
            </span>
            <div>
              <p className="font-serif text-lg font-semibold text-[#ffe3b4]">Tianji Love</p>
              <p className="max-w-xl text-xs leading-5">{copy.footer}</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link href={href('/relationship/new')} className="hover:text-[#ffe3b4]">{copy.nav.loveReading}</Link>
            <Link href={href('/ask')} className="hover:text-[#ffe3b4]">{copy.nav.ask}</Link>
            <Link href={href('/draw')} className="hover:text-[#ffe3b4]">{copy.nav.draw}</Link>
            <Link href={href('/pricing')} className="hover:text-[#ffe3b4]">{copy.nav.pricing}</Link>
            <Link href={href('/about')} className="hover:text-[#ffe3b4]">{copy.nav.about}</Link>
            <Link href={href('/login')} className="hover:text-[#ffe3b4]">{copy.nav.login}</Link>
            <Link href={href('/legal/privacy')} className="hover:text-[#ffe3b4]">{copy.nav.privacy}</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function ReadingPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
      <div className="tianji-love-reading-panel rounded-xl border border-[#b57248]/42 bg-[#060b16]/82 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d7a86c]/78">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-[#ffe3b4] sm:text-4xl">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

function AskLoveStyles() {
  return (
    <style>{`
      .tianji-love-ask-page {
        font-family: var(--font-tianji-sans), "Microsoft YaHei", system-ui, sans-serif;
      }
      .tianji-love-stars {
        background-image:
          radial-gradient(1px 1px at 12% 18%, rgba(255,227,180,0.55), transparent 50%),
          radial-gradient(1px 1px at 26% 32%, rgba(255,120,126,0.45), transparent 50%),
          radial-gradient(1.5px 1.5px at 40% 16%, rgba(216,183,123,0.55), transparent 50%),
          radial-gradient(1px 1px at 58% 28%, rgba(255,227,180,0.35), transparent 50%),
          radial-gradient(1.5px 1.5px at 70% 10%, rgba(255,120,126,0.55), transparent 50%),
          radial-gradient(1px 1px at 84% 24%, rgba(216,183,123,0.55), transparent 50%);
        background-size: 980px 760px;
      }
      .tianji-love-logo-fuse {
        background:
          radial-gradient(circle at 50% 50%, rgba(7, 13, 27, 0.95) 0 54%, rgba(7, 13, 27, 0.62) 65%, transparent 76%);
        box-shadow: 0 0 18px rgba(216, 183, 123, 0.08);
      }
      .tianji-love-logo-image {
        border-radius: 999px;
        -webkit-mask-image: radial-gradient(circle, #000 0 62%, rgba(0,0,0,0.72) 69%, transparent 76%);
        mask-image: radial-gradient(circle, #000 0 62%, rgba(0,0,0,0.72) 69%, transparent 76%);
        mix-blend-mode: screen;
        filter: saturate(1.02) drop-shadow(0 0 7px rgba(216,183,123,0.18));
      }
      .tianji-love-ask-hero-visual {
        isolation: isolate;
      }
      .tianji-love-ask-hero-art {
        transform: scale(1.08);
        transform-origin: 50% 50%;
        -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 0 46%, rgba(0,0,0,0.9) 58%, rgba(0,0,0,0.38) 72%, transparent 86%);
        mask-image: radial-gradient(ellipse at 50% 50%, #000 0 46%, rgba(0,0,0,0.9) 58%, rgba(0,0,0,0.38) 72%, transparent 86%);
      }
      .tianji-love-ask-hero-vignette {
        z-index: 2;
        pointer-events: none;
        background:
          radial-gradient(ellipse at 50% 50%, transparent 0 38%, rgba(3,4,10,0.22) 60%, rgba(3,4,10,0.92) 100%),
          linear-gradient(90deg, rgba(3,4,10,0.98), transparent 22%, transparent 78%, rgba(3,4,10,0.98));
      }
      .tianji-love-shell-header,
      .tianji-love-ask-page footer {
        border-color: rgba(181, 114, 72, 0.28) !important;
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
      .love-birth-chart-panel {
        border-color: rgba(181, 114, 72, 0.42) !important;
        box-shadow:
          inset 0 0 0 1px rgba(255, 221, 167, 0.04),
          0 28px 80px rgba(0, 0, 0, 0.32),
          0 0 42px rgba(181, 87, 62, 0.045) !important;
      }
      .tianji-love-ask-trust-card,
      .tianji-love-reading-panel,
      .tianji-love-ask-textarea {
        border-color: rgba(181, 114, 72, 0.34) !important;
      }
      .tianji-love-ask-textarea:focus {
        border-color: rgba(255, 180, 158, 0.62) !important;
      }
      @media (max-width: 768px) {
        .tianji-love-shell-header nav {
          align-items: flex-start;
        }
      }
    `}</style>
  );
}
