'use client';

import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { CalendarHeart, Clock3, CreditCard, HeartHandshake, Lock, Sparkles, Star } from 'lucide-react';

import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { DivinationEvidenceCard } from '@/components/divination/DivinationEvidenceCard';
import { type AppLanguage, withLanguageParam } from '@/lib/language-routing';
import { trackRevenueFunnelEvent } from '@/lib/analytics/funnel-events';
import type { DivinationEvidence } from '@/types/divination';
import {
  TianjiLoveButton,
  TianjiLoveFinalCta,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLoveHeroImage,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

type Lang = 'en' | 'zh';
type Slot = 'yesterday' | 'today' | 'tomorrow';

interface PreviewSlotInfo {
  slot: Slot;
  arcana: 'major' | 'minor';
}

interface PreviewState {
  id: string;
  preview: string;
  language: Lang;
  price: string;
  previewDraw: PreviewSlotInfo[];
  evidence?: DivinationEvidence;
}

interface UnlockedCard {
  slot: Slot;
  card: {
    id: number;
    name: string;
    nameChinese: string;
    arcana: 'major' | 'minor';
    suit?: string;
  };
  isReversed: boolean;
  miniReading: string;
}

interface UnlockedState {
  question: string;
  language: Lang;
  draw: UnlockedCard[];
  fullReading: string;
  evidence?: DivinationEvidence;
}

type TimingCopy = {
  nav: Record<'loveReading' | 'ask' | 'draw' | 'pricing' | 'about' | 'login' | 'privacy', string>;
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
  slots: Record<Slot, string>;
  signal: Record<'major' | 'minor', string>;
  trust: Array<{ icon: typeof Lock; title: string; body: string }>;
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
    reversed: string;
    upright: string;
  };
  final: {
    title: string;
    button: string;
  };
  footer: string;
};

type CheckoutPreviewSource = 'evidence_card' | 'result_unlock';

const PREVIEW_STORAGE_KEY = 'tianji.draw.preview';
const HERO_COUPLE = '/assets/images/hero/tianji-love-couple-red-thread-16x9.png';
const FINAL_PAVILION = '/assets/images/hero/tianji-love-moon-pavilion-16x9.png';

const timingCopy = {
  en: {
    nav: {
      loveReading: 'Love Reading',
      ask: 'Ask',
      draw: 'Draw Timing',
      pricing: 'Pricing',
      about: 'About',
      login: 'Login',
      privacy: 'Privacy',
    },
    hero: {
      eyebrow: 'Tianji Love / Draw Timing Cards',
      title: 'Draw three timing cards for the choice in front of you.',
      accent: 'Yesterday. Today. Tomorrow. Not certainty.',
      body:
        'Ask about a relationship pause, a reconnection, a choice, or the moment you are unsure whether to move. Draw three timing cards for what led here, the live signal, and the next opening.',
      primary: 'Draw my timing cards',
      secondary: 'Start relationship reading',
    },
    form: {
      eyebrow: 'Timing question',
      title: 'Name the moment before you draw',
      description:
        'Write one concrete situation. The preview stays private and the full Draw Timing reading unlocks only if the first signal feels useful.',
      placeholder:
        'e.g. We have been quiet for two weeks. Is this a moment to reach out, wait, or let the pattern complete itself?',
      helper: 'Private preview. One question. No public birth or relationship data.',
      loading: 'Reading the timing...',
    },
    slots: {
      yesterday: 'What led here',
      today: 'The live signal',
      tomorrow: 'Next opening',
    },
    signal: {
      major: 'Turning-point signal',
      minor: 'Practical timing cue',
    },
    trust: [
      { icon: Clock3, title: 'Timing over prediction', body: 'The reading names windows and pressure points without claiming certainty.' },
      { icon: HeartHandshake, title: 'Relationship context', body: 'Built for reconnecting, choosing, waiting, or reframing with care.' },
      { icon: Lock, title: 'Private by default', body: 'Your question and preview are not exposed on public pages.' },
    ],
    preview: {
      eyebrow: 'Your first timing signal',
      title: 'A private Draw Timing preview is ready',
      paywallNote:
        'Unlock the full Draw Timing reading for {price}: the deeper pattern, current emotional dynamic, and one practical next move - as reflection, not certainty.',
      assurance: 'Secure Stripe checkout. One-time unlock. No subscription required.',
      unlockCta: 'Unlock the full Draw Timing reading - {price}',
      unlocking: 'Opening checkout...',
    },
    unlocked: {
      eyebrow: 'Your complete timing reading',
      title: 'Your Draw Timing window is open',
      reversed: 'Reframe',
      upright: 'Move',
    },
    final: {
      title: 'Draw Timing helps the next step feel less noisy.',
      button: 'Ask A Love Question',
    },
    footer:
      'Timing readings are for reflection and relationship communication, not medical, legal, financial, or crisis advice.',
  },
  zh: {
    nav: {
      loveReading: '关系解读',
      ask: '提问',
      draw: '时机抽牌',
      pricing: '会员权益',
      about: '关于',
      login: '登录',
      privacy: '隐私',
    },
    hero: {
      eyebrow: 'Tianji Love / 时机',
      title: '看清下一次关系转折附近的时机。',
      accent: '不是确定预言，而是更清楚的窗口。',
      body:
        '你可以问一段停顿、一次重连、一个选择，或者此刻该不该行动。Tianji Love 会把关系时机拆成过去成因、当下信号和下一步窗口，让你少一点噪音。',
      primary: '揭示我的时机窗口',
      secondary: '开始关系解读',
    },
    form: {
      eyebrow: '时机问题',
      title: '把你正站在的那个时刻说清楚',
      description:
        '写下一个具体情境。预览保持私密；只有当第一段信号真的有帮助时，再解锁完整时机解读。',
      placeholder: '例如：我们已经安静两周了。现在适合主动联系、继续等待，还是让这段模式自然结束？',
      helper: '私密预览。一次一个问题。不公开出生或关系资料。',
      loading: '正在读取时机...',
    },
    slots: {
      yesterday: '过去成因',
      today: '当下信号',
      tomorrow: '下一步窗口',
    },
    signal: {
      major: '转折信号',
      minor: '实际时机线索',
    },
    trust: [
      { icon: Clock3, title: '重在时机', body: '解读会指出窗口和压力点，但不宣称确定未来。' },
      { icon: HeartHandshake, title: '关系语境', body: '适合重连、选择、等待或重新理解一段关系。' },
      { icon: Lock, title: '默认私密', body: '你的问题和预览不会展示在公开页面。' },
    ],
    preview: {
      eyebrow: '你的第一段时机信号',
      title: '私密时机预览已生成',
      paywallNote: '解锁完整时机解读 {price}：三段时间窗口、隐藏压力、下一步行动和一个稳定自己的反思问题。',
      assurance: '通过 Stripe 安全结账。单次解锁。无需订阅。',
      unlockCta: '解锁完整时机解读 - {price}',
      unlocking: '正在打开结账...',
    },
    unlocked: {
      eyebrow: '你的完整时机解读',
      title: '时机窗口已经打开',
      reversed: '重新理解',
      upright: '可以行动',
    },
    final: {
      title: '时机更清楚时，爱就不再只是猜测。',
      button: '问一个爱情问题',
    },
    footer: '时机解读仅用于自我理解与关系沟通参考，不构成医疗、法律、财务或危机建议。',
  },
} satisfies Record<AppLanguage, TimingCopy>;

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
      Array.isArray(parsed.previewDraw) &&
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

function TimingCardBack({
  label,
  signal,
}: {
  label: string;
  signal: string;
}) {
  return (
    <div className="tianji-love-timing-card flex min-h-[190px] flex-col justify-between rounded-lg border border-[#b57248]/36 bg-[#050812]/78 p-4 text-center shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
      <span className="text-[0.65rem] uppercase tracking-[0.24em] text-[#d8b77b]/60">{label}</span>
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[radial-gradient(circle,rgba(255,124,130,0.24),rgba(216,183,123,0.08)_45%,transparent_72%)]">
        <CalendarHeart className="h-7 w-7 text-[#ffe3b4]" aria-hidden />
      </div>
      <span className="text-xs leading-5 text-[#f4d7a3]/62">{signal}</span>
    </div>
  );
}

function TimingCardFace({
  slotLabel,
  card,
  isReversed,
  miniReading,
  language,
  copy,
}: {
  slotLabel: string;
  card: UnlockedCard['card'];
  isReversed: boolean;
  miniReading: string;
  language: Lang;
  copy: TimingCopy;
}) {
  const cardName = language === 'zh' ? card.nameChinese : card.name;
  return (
    <div className="tianji-love-timing-card flex min-h-[230px] flex-col rounded-lg border border-[#b57248]/36 bg-[#050812]/78 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.28)]">
      <span className="text-[0.65rem] uppercase tracking-[0.24em] text-[#d8b77b]/60">{slotLabel}</span>
      <div className="my-4 flex flex-1 flex-col justify-center text-center">
        <Sparkles className="mx-auto mb-3 h-5 w-5 text-[#ff9c8b]" aria-hidden />
        <h3 className="font-serif text-xl text-[#ffe3b4]">{cardName}</h3>
        <p className="mt-2 text-[0.7rem] uppercase tracking-[0.18em] text-[#d8b77b]/66">
          {isReversed ? copy.unlocked.reversed : copy.unlocked.upright}
        </p>
      </div>
      <p className="line-clamp-4 text-xs leading-5 text-[#f4d7a3]/68">{miniReading}</p>
    </div>
  );
}

export default function DrawPage() {
  const [language, setLanguage] = useSyncedLanguage('en');
  const lang = language as Lang;
  const copy = timingCopy[language];
  const href = (path: string) => withLanguageParam(path, language);
  const toggleLanguage = () => setLanguage(language === 'zh' ? 'en' : 'zh');

  const [question, setQuestion] = useState('');
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [unlocked, setUnlocked] = useState<UnlockedState | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyAttempted = useRef(false);

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
        const res = await fetch(`/api/draw/unlock?${unlockParams.toString()}`, { method: 'GET' });
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
    async (event: FormEvent) => {
      event.preventDefault();
      if (loading) return;
      setError(null);
      setUnlocked(null);
      void trackRevenueFunnelEvent('draw_preview_started', {
        lang,
        surface: 'draw_page',
      });
      try {
        setLoading(true);
        const res = await fetch('/api/draw/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: question.trim(), language: lang }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Unable to read the timing');
        }
        const state: PreviewState = {
          id: json.id,
          preview: json.preview,
          language: json.language,
          price: json.price,
          previewDraw: json.previewDraw,
          evidence: json.evidence,
        };
        setPreview(state);
        writeStoredPreview(state);
        void trackRevenueFunnelEvent('draw_preview_completed', {
          lang: state.language,
          surface: 'draw_page',
          previewId: state.id,
          cardCount: state.previewDraw.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    },
    [question, lang, loading]
  );

  const onUnlock = useCallback(async (source: CheckoutPreviewSource = 'result_unlock') => {
    if (!preview || unlocking) return;
    setError(null);
    void trackRevenueFunnelEvent('unlock_click', {
      lang: preview.language,
      surface: 'draw_preview',
      product: 'draw_timing',
      previewId: preview.id,
      cardCount: preview.previewDraw.length,
    });
    void trackRevenueFunnelEvent('checkout_start_from_free_preview', {
      route: 'draw',
      source,
      paid: false,
      confidence: preview.evidence?.confidence,
      evidenceSignalCount: preview.evidence?.signals.length,
    });
    try {
      setUnlocking(true);
      const res = await fetch('/api/draw/unlock', {
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
    <TianjiLoveShell className="tianji-love-timing-page" ariaLabel="Tianji Love Draw Timing page">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={[
          { label: copy.nav.loveReading, href: href('/relationship/new') },
          { label: copy.nav.ask, href: href('/ask') },
          { label: copy.nav.draw, href: href('/draw'), mobile: true },
          { label: copy.nav.pricing, href: href('/pricing'), mobile: true },
          { label: copy.nav.about, href: href('/about') },
          { label: copy.nav.login, href: href('/login') },
        ]}
        cta={{ label: copy.hero.primary, href: '#timing-question' }}
        languageLabel={language === 'zh' ? 'EN' : '中文'}
        onLanguageToggle={toggleLanguage}
      />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-10 pt-14 sm:px-8 lg:min-h-[700px] lg:grid-cols-[minmax(0,0.96fr)_minmax(460px,0.8fr)] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs uppercase tracking-[0.34em] text-[#d8b77b]/70">{copy.hero.eyebrow}</p>
          <h1 className="font-serif text-[2.65rem] font-semibold leading-[1.08] text-[#ffe3b4] sm:text-[4.4rem]">
            {copy.hero.title}
          </h1>
          <p className="mt-5 font-serif text-2xl italic text-[#ff9c8b] sm:text-3xl">{copy.hero.accent}</p>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f5d8aa]/78">{copy.hero.body}</p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <TianjiLoveButton href="#timing-question">{copy.hero.primary}</TianjiLoveButton>
            <TianjiLoveButton href={href('/relationship/new')} variant="secondary">{copy.hero.secondary}</TianjiLoveButton>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {copy.trust.map((item) => (
              <TianjiLoveTrustCard key={item.title} icon={item.icon} title={item.title} body={item.body} />
            ))}
          </div>
        </div>

        <TianjiLoveHeroImage src={HERO_COUPLE} priority referenceSignal="Tianji Love Draw Timing red thread hero" className="lg:min-h-[620px]" />
      </section>

      <section id="timing-question" className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
        <TianjiLovePanel className="love-birth-chart-panel px-5 py-8 md:px-12">
          <TianjiLoveSectionTitle eyebrow={copy.form.eyebrow} title={copy.form.title} />
          <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-8 text-[#f4d7a3]/72">{copy.form.description}</p>
          <form onSubmit={onSubmit} className="mt-8 grid gap-5">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={5}
              maxLength={500}
              placeholder={copy.form.placeholder}
              className="tianji-love-field-input min-h-[150px] w-full resize-none rounded-lg border border-[#b57248]/42 bg-[#030711]/80 p-5 text-base leading-8 text-[#fff4dd] outline-none transition placeholder:text-[#f4d7a3]/38 focus:border-[#ffb49e]/62"
              disabled={loading}
            />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2 text-sm text-[#f4d7a3]/62">
                <Lock className="h-4 w-4 text-[#d8b77b]" aria-hidden />
                {copy.form.helper} {question.length} / 500
              </span>
              <button type="submit" disabled={loading} className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-55">
                {loading ? copy.form.loading : copy.hero.primary}
                <Sparkles className="ml-3 h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>
        </TianjiLovePanel>
      </section>

      {preview && !unlocked ? (
        <ReadingPanel eyebrow={copy.preview.eyebrow} title={copy.preview.title}>
          <div className="grid gap-4 sm:grid-cols-3">
            {preview.previewDraw.map((slot) => (
              <TimingCardBack
                key={slot.slot}
                label={copy.slots[slot.slot]}
                signal={copy.signal[slot.arcana]}
              />
            ))}
          </div>
          <p className="mt-7 whitespace-pre-line text-base leading-8 text-[#fff4dd]/88">{preview.preview}</p>
          {preview.evidence ? (
            <DivinationEvidenceCard
              className="mt-6"
              evidence={preview.evidence}
              route="draw"
              paid={false}
              onUnlockClick={() => void onUnlock('evidence_card')}
              unlockLabel={copy.preview.unlockCta.replace('{price}', preview.price)}
            />
          ) : null}
          <div className="mt-5 rounded-lg border border-[#b57248]/30 bg-black/20 px-4 py-3 text-sm leading-7 text-[#f4d7a3]/72">
            Practical next step: choose one small action you can take with care, then use the full reading only if you want more depth.
          </div>
          <div className="my-6 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,198,130,0.62),transparent)]" />
          <div className="rounded-lg border border-[#b57248]/38 bg-[#090d18]/72 p-4 text-sm leading-7 text-[#f4d7a3]/74">
            {copy.preview.paywallNote.replace('{price}', preview.price)}
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-2 text-xs tracking-[0.1em] text-[#f4d7a3]/58">
              <CreditCard className="h-4 w-4 text-[#d8b77b]" aria-hidden />
              {copy.preview.assurance}
            </span>
            <button type="button" onClick={() => void onUnlock('result_unlock')} disabled={unlocking} className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-55">
              {unlocking ? copy.preview.unlocking : copy.preview.unlockCta.replace('{price}', preview.price)}
            </button>
          </div>
        </ReadingPanel>
      ) : null}

      {unlocked ? (
        <ReadingPanel eyebrow={copy.unlocked.eyebrow} title={copy.unlocked.title}>
          <div className="grid gap-4 sm:grid-cols-3">
            {unlocked.draw.map((slot) => (
              <TimingCardFace
                key={slot.slot}
                slotLabel={copy.slots[slot.slot]}
                card={slot.card}
                isReversed={slot.isReversed}
                miniReading={slot.miniReading}
                language={lang}
                copy={copy}
              />
            ))}
          </div>
          {unlocked.question ? <h3 className="mt-8 font-serif text-2xl text-[#ffe3b4]">&quot;{unlocked.question}&quot;</h3> : null}
          {unlocked.evidence ? (
            <DivinationEvidenceCard
              className="mt-6"
              evidence={unlocked.evidence}
              route="draw"
              paid
            />
          ) : null}
          <div className="mt-5 whitespace-pre-line text-base leading-8 text-[#fff4dd]/88">{unlocked.fullReading}</div>
        </ReadingPanel>
      ) : null}

      {error ? (
        <section className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-10 sm:px-8">
          <div className="rounded-lg border border-[#ff8f87]/42 bg-[#3d0f17]/34 p-4 text-[#ffd0c9]">{error}</div>
        </section>
      ) : null}

      <TianjiLoveFinalCta imageSrc={FINAL_PAVILION} title={copy.final.title} buttonLabel={copy.final.button} href={href('/ask')} />

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer={copy.footer}
        links={[
          { label: copy.nav.loveReading, href: href('/relationship/new') },
          { label: copy.nav.ask, href: href('/ask') },
          { label: copy.nav.draw, href: href('/draw') },
          { label: copy.nav.pricing, href: href('/pricing') },
          { label: copy.nav.about, href: href('/about') },
          { label: copy.nav.login, href: href('/login') },
          { label: copy.nav.privacy, href: href('/legal/privacy') },
        ]}
      />
    </TianjiLoveShell>
  );
}

function ReadingPanel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
      <TianjiLovePanel className="p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d7a86c]/78">{eyebrow}</p>
        <h2 className="mt-3 font-serif text-3xl font-semibold text-[#ffe3b4] sm:text-4xl">{title}</h2>
        <div className="mt-6">{children}</div>
      </TianjiLovePanel>
    </section>
  );
}
