'use client';

export async function generateMetadata() {
  return {
    title: 'Free Love Test — Fate Match Snapshot | Tianji Love',
    description: 'Take the free TianJi fate-match test. Enter two nicknames and get a deterministic compatibility snapshot with archetype, score, and actionable insights.',
    alternates: {
      languages: {
        'en': '/love-test',
        'zh-CN': '/zh-CN/love-test',
        'x-default': '/love-test',
      },
    },
  };
}

import Link from 'next/link';
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Copy,
  Download,
  Heart,
  Lock,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import {
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveFormField,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveSectionTitle,
  TianjiLoveShell,
  TianjiLoveTrustCard,
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryNav,
} from '@/components/tianji-love';
import { trackRevenueFunnelEvent } from '@/lib/analytics/funnel-events';
import { withLanguageParam } from '@/lib/language-routing';
import {
  LOVE_TEST_SHARE_FORMATS,
  computeLoveTestResult,
  getLoveTestSharePayload,
  type FateRelationshipStatus,
  type LoveTestInput,
  type LoveTestShareFormat,
} from '@/lib/love-test';

const DEFAULT_INPUT: LoveTestInput = {
  yourName: '',
  theirName: '',
  relationshipStatus: 'ambiguous',
  mainConcern: '',
};

const RELATIONSHIP_STATUS_OPTIONS: Array<{
  value: FateRelationshipStatus;
  label: string;
  detail: string;
}> = [
  {
    value: 'ambiguous',
    label: 'Ambiguous / not confirmed',
    detail: 'There is a signal, but nobody has named it clearly.',
  },
  {
    value: 'dating',
    label: 'Dating / together',
    detail: 'There is real contact and a rhythm to observe.',
  },
  {
    value: 'separated_cold',
    label: 'Separated / cold',
    detail: 'Distance, silence, or emotional withdrawal is part of the question.',
  },
  {
    value: 'crush',
    label: 'Crush / early spark',
    detail: 'The feeling is fresh and the next move still feels delicate.',
  },
  {
    value: 'reunion_considering',
    label: 'Considering reunion',
    detail: 'The old bond is still present, but the pattern needs a new shape.',
  },
];

const SHARE_FORMAT_LABELS: Record<LoveTestShareFormat, string> = {
  og: 'Wide OG',
  wechat_moments: 'Moments square',
  xiaohongshu: 'Xiaohongshu',
  douyin: 'Douyin story',
};

const FULL_READING_HREF = '/relationship/new?source=fate_match_test';
const TIMING_READING_HREF = '/relationship/new?source=fate_match_test&focus=timing';
const DAILY_ORACLE_HREF = '/daily-oracle?source=love_test_result';

function href(path: string) {
  return withLanguageParam(path, 'en');
}

function isReadyForResult(input: LoveTestInput) {
  return Boolean(input.yourName.trim() && input.theirName.trim() && input.mainConcern.trim());
}

export default function LoveTestPage() {
  const [answers, setAnswers] = useState<LoveTestInput>(DEFAULT_INPUT);
  const [submittedAnswers, setSubmittedAnswers] = useState<LoveTestInput | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [downloadState, setDownloadState] = useState<LoveTestShareFormat | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const startTrackedRef = useRef(false);
  const viewTrackedRef = useRef(false);
  const result = useMemo(
    () => (submittedAnswers ? computeLoveTestResult(submittedAnswers) : null),
    [submittedAnswers],
  );

  useEffect(() => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    void trackRevenueFunnelEvent('growth_fate_test_view', {
      source: 'love_test',
      surface: 'free_fate_match_test',
    });
  }, []);

  const trackLoveTestStart = (surface: string) => {
    if (startTrackedRef.current) return;
    startTrackedRef.current = true;
    void trackRevenueFunnelEvent('growth_fate_test_start', {
      source: 'love_test',
      surface,
    });
    void trackRevenueFunnelEvent('love_test_start', {
      source: 'love_test',
      surface,
    });
  };

  const updateAnswer = (key: keyof LoveTestInput, value: string) => {
    trackLoveTestStart('free_fate_match_form');
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  const onTextChange = (key: 'yourName' | 'theirName' | 'mainConcern') => {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateAnswer(key, event.target.value);
    };
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReadyForResult(answers)) return;

    const nextResult = computeLoveTestResult(answers);
    trackLoveTestStart('free_fate_match_submit');
    setSubmittedAnswers(answers);
    void trackRevenueFunnelEvent('growth_fate_test_result', {
      source: 'love_test',
      surface: 'free_fate_match_result',
      result_id: nextResult.id,
      archetype: nextResult.archetype,
      score: nextResult.score,
      match_level: nextResult.matchLevel,
    });
    void trackRevenueFunnelEvent('love_test_result_view', {
      source: 'love_test',
      surface: 'free_fate_match_result',
      result_id: nextResult.id,
      archetype: nextResult.archetype,
      score: nextResult.score,
    });
    window.requestAnimationFrame(() => {
      document.getElementById('love-test-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const sharePayload = () => {
    if (!result) return null;
    const shareUrl =
      typeof window === 'undefined'
        ? 'https://tianji.love/love-test'
        : `${window.location.origin}/love-test?result=${result.id}`;

    return getLoveTestSharePayload(result, shareUrl);
  };

  const copyShareText = async () => {
    const payload = sharePayload();
    if (!payload || !result) return;
    const text = [
      `I got "${payload.archetype}" on TianJi Free Fate Match Test.`,
      `Score: ${payload.score}/100.`,
      `It said: "${payload.oneLiner}"`,
      `Try yours: ${payload.shareUrl}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
    } catch {
      setCopyState('error');
    }
    void trackRevenueFunnelEvent('love_test_copy_result', {
      source: 'love_test',
      surface: 'free_fate_match_result',
      result_id: result.id,
      archetype: result.archetype,
      score: result.score,
    });
    void trackRevenueFunnelEvent('relationship_free_result_view', {
      source: 'love_test',
      surface: 'free_fate_match_share_text',
    });
    window.setTimeout(() => setCopyState('idle'), 2500);
  };

  const copyButtonLabel = copyState === 'copied' ? 'Result copied' : copyState === 'error' ? 'Copy failed' : 'Copy my result';
  const copyStatusText =
    copyState === 'copied'
      ? 'Result copied without private inputs.'
      : copyState === 'error'
        ? 'Copy failed. You can still use the download options or select the text manually.'
        : '';

  const downloadShareCard = async (format: LoveTestShareFormat) => {
    const payload = sharePayload();
    if (!payload || !result) return;
    setDownloadState(format);
    setDownloadError(null);
    void trackRevenueFunnelEvent('love_test_share_card_click', {
      source: 'love_test',
      surface: 'free_fate_match_result',
      card_format: format,
      result_id: result.id,
      archetype: result.archetype,
      score: result.score,
    });
    void trackRevenueFunnelEvent('growth_fate_test_cta_click', {
      source: 'love_test',
      surface: 'free_fate_match_share_card',
      cta: 'share_card',
      card_format: format,
      result_id: result.id,
    });
    try {
      const response = await fetch('/api/share/card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: 'love_test',
          cardFormat: format,
          resultData: payload,
        }),
      });

      if (!response.ok) {
        setDownloadError('Share card could not be generated. Please copy the text result instead.');
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `tianji-free-fate-match-${format}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      void trackRevenueFunnelEvent('relationship_free_result_view', {
        source: 'love_test',
        surface: 'free_fate_match_share_card',
        format,
      });
    } catch {
      setDownloadError('Share card could not be generated. Please copy the text result instead.');
    } finally {
      setDownloadState(null);
    }
  };

  const trackFullReadingClick = (surface: string, focus: 'full_reading' | 'timing' = 'full_reading') => {
    if (!result) return;
    void trackRevenueFunnelEvent('growth_fate_test_cta_click', {
      source: 'love_test',
      surface,
      cta: focus,
      result_id: result.id,
      archetype: result.archetype,
      score: result.score,
      match_level: result.matchLevel,
    });
    void trackRevenueFunnelEvent('relationship_start_click', {
      source: 'love_test',
      surface,
      cta: focus,
      result_id: result.id,
      archetype: result.archetype,
      score: result.score,
    });
    void trackRevenueFunnelEvent(focus === 'timing' ? 'love_test_timing_click' : 'love_test_ask_next_click', {
      source: 'love_test',
      surface,
      intent: focus,
      result_id: result.id,
      archetype: result.archetype,
      score: result.score,
    });
  };

  const trackDailyOracleClick = () => {
    if (!result) return;
    void trackRevenueFunnelEvent('growth_daily_oracle_view', {
      source: 'love_test',
      surface: 'free_fate_match_result',
      cta: 'daily_oracle',
      result_id: result.id,
    });
  };

  return (
    <TianjiLoveShell ariaLabel="Free Fate Match Test" className="love-test-page">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={getTianjiLovePrimaryNav('en', href)}
        cta={{ label: 'Free Fate Test', href: href('/love-test') }}
      />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-10 pt-14 sm:px-8 lg:min-h-[650px] lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b77b]/70">
            Free Fate Match Test / 天机缘分测试
          </p>
          <h1 className="font-serif text-[2.75rem] font-semibold leading-[1.05] text-[#ffe3b4] sm:text-[4.25rem]">
            See the relationship signal before you ask for the full reading.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#f4d7a3]/78 sm:text-lg">
            Enter two nicknames, the current relationship status, and the one concern on your mind. TianJi returns a private, deterministic fate-match snapshot you can share without exposing the inputs.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a
              href="#love-test-form"
              className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6]"
            >
              Start Free Fate Test
              <ArrowRight className="ml-3 h-4 w-4" aria-hidden />
            </a>
            <TianjiLoveButton href={href(FULL_READING_HREF)} variant="secondary">
              Full Love Reading Flow
            </TianjiLoveButton>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <TianjiLoveTrustCard icon={Lock} title="Free entry" body="No checkout, no paid smoke, and no payment execution on this page." />
            <TianjiLoveTrustCard icon={ShieldCheck} title="Private inputs" body="Nicknames and concerns stay out of share text, share cards, and analytics payloads." />
            <TianjiLoveTrustCard icon={Share2} title="Growth-ready" body="Copy text or download a social card for Xiaohongshu, Douyin, and Moments." />
          </div>
        </div>

        <TianjiLovePanel className="p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">MVP input contract</p>
          <h2 className="mt-3 font-serif text-3xl text-[#ffe3b4]">Four fields, one safe result</h2>
          <div className="mt-6 grid gap-3">
            {['Your nickname', 'Their nickname', 'Relationship status', 'Main concern'].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-lg border border-[#b57248]/22 bg-black/20 px-4 py-3">
                <span className="text-sm text-[#f4d7a3]/72">{item}</span>
                <Heart className="h-4 w-4 text-[#ff9c8b]" aria-hidden />
              </div>
            ))}
          </div>
        </TianjiLovePanel>
      </section>

      <section id="love-test-form" className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-12 sm:px-8">
        <TianjiLovePanel className="p-5 sm:p-8">
          <TianjiLoveSectionTitle eyebrow="Free private test" title="Take the TianJi fate-match snapshot" className="mb-8" />
          <form onSubmit={onSubmit} className="grid gap-7">
            <div className="grid gap-5 md:grid-cols-2">
              <TianjiLoveFormField label="Your nickname" badge="required">
                <input
                  name="yourName"
                  value={answers.yourName}
                  onChange={onTextChange('yourName')}
                  maxLength={40}
                  autoComplete="off"
                  className="tianji-love-field-input min-h-12 w-full rounded-lg border px-4 text-base outline-none transition focus:border-[#ffb49e]/70"
                  placeholder="e.g. Moon"
                  required
                />
              </TianjiLoveFormField>
              <TianjiLoveFormField label="Their nickname" badge="required">
                <input
                  name="theirName"
                  value={answers.theirName}
                  onChange={onTextChange('theirName')}
                  maxLength={40}
                  autoComplete="off"
                  className="tianji-love-field-input min-h-12 w-full rounded-lg border px-4 text-base outline-none transition focus:border-[#ffb49e]/70"
                  placeholder="e.g. Sun"
                  required
                />
              </TianjiLoveFormField>
            </div>

            <fieldset className="grid gap-3">
              <legend className="mb-2 font-serif text-2xl font-semibold text-[#ffe3b4]">Relationship status</legend>
              <div className="grid gap-3 md:grid-cols-5">
                {RELATIONSHIP_STATUS_OPTIONS.map((option) => {
                  const selected = answers.relationshipStatus === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateAnswer('relationshipStatus', option.value)}
                      aria-pressed={selected}
                      className={`min-h-[132px] rounded-lg border p-4 text-left transition ${
                        selected
                          ? 'border-[#ffb49e]/70 bg-[#ff6c73]/14 text-[#fff7e6]'
                          : 'border-[#b57248]/24 bg-black/18 text-[#f4d7a3]/72 hover:border-[#ffe3b4]/44'
                      }`}
                    >
                      <span className="block text-sm font-semibold leading-5">{option.label}</span>
                      <span className="mt-2 block text-xs leading-5 opacity-75">{option.detail}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <TianjiLoveFormField label="Main concern" badge="required">
              <textarea
                name="mainConcern"
                value={answers.mainConcern}
                onChange={onTextChange('mainConcern')}
                maxLength={220}
                rows={4}
                className="tianji-love-field-input w-full resize-none rounded-lg border px-4 py-3 text-base leading-7 outline-none transition focus:border-[#ffb49e]/70"
                placeholder="e.g. I am not sure whether I should text first, wait, or ask for clarity."
                required
              />
            </TianjiLoveFormField>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-xs leading-5 text-[#f4d7a3]/48">
                This free test runs locally in the page. It does not create a Checkout Session, replay a webhook, or send private input to a payment flow.
              </p>
              <button
                type="submit"
                disabled={!isReadyForResult(answers)}
                className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reveal fate match
                <Sparkles className="ml-3 h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>
        </TianjiLovePanel>
      </section>

      {result ? (
        <section id="love-test-result" className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8">
          <TianjiLovePanel className="p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
              <div className="rounded-lg border border-[#b57248]/24 bg-black/20 p-6 text-center">
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{result.archetype}</p>
                <div className="mt-4 text-7xl font-bold text-[#ff9c8b]">{result.score}</div>
                <p className="mt-2 text-sm text-[#f4d7a3]/60">{result.matchLevel}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {result.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/8 px-3 py-1 text-xs text-[#f4d7a3]/72">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">Your deterministic fate-match result</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#ffe3b4] sm:text-4xl">{result.headline}</h2>
                <p className="mt-4 text-base leading-8 text-[#f4d7a3]/78">{result.oneLiner}</p>
                <div className="mt-6 grid gap-4">
                  {result.insights.map((insight, index) => (
                    <div key={insight} className="rounded-lg border border-[#b57248]/22 bg-black/18 p-4 text-sm leading-6 text-[#f4d7a3]/74">
                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#d8b77b]/64">Insight {index + 1}</span>
                      {insight}
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-lg border border-[#d8b77b]/24 bg-[#d8b77b]/8 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/74">Action suggestion</p>
                  <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/78">{result.actionSuggestion}</p>
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={href(FULL_READING_HREF)}
                    onClick={() => trackFullReadingClick('free_fate_match_result', 'full_reading')}
                    className="tianji-love-primary inline-flex min-h-12 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6]"
                  >
                    Open full Love Reading flow
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                  <Link
                    href={href(TIMING_READING_HREF)}
                    onClick={() => trackFullReadingClick('free_fate_match_timing', 'timing')}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#d8b77b]/30 bg-black/24 px-5 text-sm font-semibold text-[#f4d7a3]/78"
                  >
                    <Users className="h-4 w-4" aria-hidden />
                    Explore timing in Love Reading
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSubmittedAnswers(null)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#b57248]/32 bg-black/24 px-5 text-sm font-semibold text-[#f4d7a3]/74"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Retake test
                  </button>
                  <Link
                    href={href(DAILY_ORACLE_HREF)}
                    onClick={trackDailyOracleClick}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#d8b77b]/30 bg-black/24 px-5 text-sm font-semibold text-[#f4d7a3]/78"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden />
                    明天再来抽一支今日天机
                  </Link>
                </div>
              </div>
            </div>
          </TianjiLovePanel>

          <TianjiLovePanel className="mt-5 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-lg border border-[#b57248]/24 bg-black/18 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/62">Copy result</p>
                <h3 className="mt-3 font-serif text-2xl text-[#ffe3b4]">Share the signal without private inputs.</h3>
                <p className="mt-3 text-sm leading-6 text-[#f4d7a3]/68">Copied text contains only score, archetype, one-line result, and a Love Test link.</p>
                <button
                  type="button"
                  onClick={copyShareText}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d8b77b]/30 bg-black/24 px-4 text-sm font-semibold text-[#f4d7a3]/78"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                  {copyButtonLabel}
                </button>
                <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs leading-5 text-[#f4d7a3]/58">
                  {copyStatusText}
                </p>
              </article>
              <article className="rounded-lg border border-[#ff9c8b]/26 bg-[#ff6c73]/10 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#ffb49e]/74">Next step</p>
                <h3 className="mt-3 font-serif text-2xl text-[#ffe3b4]">Turn the snapshot into a full reading.</h3>
                <p className="mt-3 text-sm leading-6 text-[#ffd6c6]/74">{result.upsellQuestion}</p>
                <Link
                  href={href(FULL_READING_HREF)}
                  onClick={() => trackFullReadingClick('free_fate_match_conversion_block', 'full_reading')}
                  className="tianji-love-primary mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-4 text-sm font-semibold text-[#fff7e6]"
                >
                  Continue to Love Reading
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </article>
            </div>
          </TianjiLovePanel>

          <TianjiLovePanel className="mt-5 p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">Share card</p>
                <h2 className="mt-2 font-serif text-2xl text-[#ffe3b4]">Download a private social card</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#f4d7a3]/62">
                  The card uses only score, archetype, headline, one-line result, keywords, and a safe result URL.
                </p>
              </div>
              <button type="button" onClick={copyShareText} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#d8b77b]/30 bg-black/24 px-4 text-sm font-semibold text-[#f4d7a3]/78">
                <Copy className="h-4 w-4" aria-hidden />
                {copyButtonLabel}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {LOVE_TEST_SHARE_FORMATS.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => downloadShareCard(format)}
                  disabled={Boolean(downloadState)}
                  className="rounded-lg border border-[#b57248]/24 bg-black/18 p-4 text-left transition hover:border-[#ffb49e]/44 disabled:opacity-55"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#ffe3b4]">
                    <Download className="h-4 w-4 text-[#d8b77b]" aria-hidden />
                    Download PNG
                  </span>
                  <span className="mt-2 block text-sm text-[#f4d7a3]/66">{SHARE_FORMAT_LABELS[format]}</span>
                  <span className="mt-1 block text-xs text-[#f4d7a3]/44">{downloadState === format ? 'Generating...' : 'Ready'}</span>
                </button>
              ))}
            </div>
            <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs leading-5 text-[#f4d7a3]/58">
              {copyStatusText || downloadError}
            </p>
            <p className="mt-4 text-xs leading-5 text-[#f4d7a3]/42">
              Birth data is not collected. Public cards never include nicknames, private concerns, raw questions, or full report text.
            </p>
          </TianjiLovePanel>
        </section>
      ) : null}

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer="Free Fate Match Test results are for self-reflection and relationship communication, not medical, legal, financial, or crisis advice."
        links={getTianjiLoveFooterNav('en', href)}
      />
    </TianjiLoveShell>
  );
}
