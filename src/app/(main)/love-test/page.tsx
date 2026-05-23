'use client';

import Link from 'next/link';
import { type FormEvent, useMemo, useRef, useState } from 'react';
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
} from 'lucide-react';

import {
  TianjiLoveButton,
  TianjiLoveFooter,
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
  type LoveTestInput,
  type LoveTestShareFormat,
} from '@/lib/love-test';

const DEFAULT_INPUT: LoveTestInput = {
  stage: 'early',
  communication: 'gentle',
  rhythm: 'steady',
  conflict: 'repair',
  values: 'growth',
};

const FIELD_OPTIONS: Array<{
  key: keyof LoveTestInput;
  title: string;
  options: Array<{ value: string; label: string; detail: string }>;
}> = [
  {
    key: 'stage',
    title: 'Where is this connection right now?',
    options: [
      { value: 'early', label: 'First signal', detail: 'Curious, cautious, still forming' },
      { value: 'dating', label: 'Actively dating', detail: 'There is momentum and real contact' },
      { value: 'committed', label: 'Committed', detail: 'You are building a shared rhythm' },
      { value: 'complicated', label: 'Complicated', detail: 'Mixed signals, distance, or unclear timing' },
    ],
  },
  {
    key: 'communication',
    title: 'How do you usually communicate?',
    options: [
      { value: 'direct', label: 'Direct', detail: 'Say the thing clearly' },
      { value: 'gentle', label: 'Gentle', detail: 'Careful and emotionally aware' },
      { value: 'guarded', label: 'Guarded', detail: 'Wait until it feels safe' },
      { value: 'playful', label: 'Playful', detail: 'Lightness before depth' },
    ],
  },
  {
    key: 'rhythm',
    title: 'What pace feels most true?',
    options: [
      { value: 'fast', label: 'Fast spark', detail: 'Big feeling, quick movement' },
      { value: 'steady', label: 'Steady build', detail: 'Trust grows through repeat signals' },
      { value: 'slow', label: 'Slow reveal', detail: 'Safety first, then openness' },
      { value: 'mixed', label: 'Hot and cold', detail: 'The pace changes under pressure' },
    ],
  },
  {
    key: 'conflict',
    title: 'When tension appears, what happens?',
    options: [
      { value: 'repair', label: 'Repair', detail: 'Talk it through and adjust' },
      { value: 'space', label: 'Space', detail: 'Pause before responding' },
      { value: 'spark', label: 'Spark', detail: 'Intensity rises quickly' },
      { value: 'avoid', label: 'Avoid', detail: 'Important things stay unsaid' },
    ],
  },
  {
    key: 'values',
    title: 'What do you want love to protect most?',
    options: [
      { value: 'security', label: 'Security', detail: 'Consistency, loyalty, safety' },
      { value: 'growth', label: 'Growth', detail: 'Mutual evolution and truth' },
      { value: 'adventure', label: 'Adventure', detail: 'Aliveness, novelty, discovery' },
      { value: 'devotion', label: 'Devotion', detail: 'Depth, commitment, care' },
    ],
  },
];

const SHARE_FORMAT_LABELS: Record<LoveTestShareFormat, string> = {
  og: 'Wide OG',
  wechat_moments: 'Moments square',
  xiaohongshu: 'Xiaohongshu',
  douyin: 'Douyin story',
};

const ASK_NEXT_HREF = '/ask?source=love_test&intent=what_are_they_thinking';
const TIMING_ADVICE_HREF = '/ask?source=love_test&intent=timing';
const NEXT_STEP_HREF = '/ask?source=love_test&intent=next_step';

function href(path: string) {
  return withLanguageParam(path, 'en');
}

export default function LoveTestPage() {
  const [answers, setAnswers] = useState<LoveTestInput>(DEFAULT_INPUT);
  const [submittedAnswers, setSubmittedAnswers] = useState<LoveTestInput | null>(null);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [downloadState, setDownloadState] = useState<LoveTestShareFormat | null>(null);
  const startTrackedRef = useRef(false);
  const result = useMemo(
    () => (submittedAnswers ? computeLoveTestResult(submittedAnswers) : null),
    [submittedAnswers],
  );

  const trackLoveTestStart = (surface: string) => {
    if (startTrackedRef.current) return;
    startTrackedRef.current = true;
    void trackRevenueFunnelEvent('love_test_start', {
      source: 'love_test',
      surface,
    });
  };

  const setAnswer = (key: keyof LoveTestInput, value: string) => {
    trackLoveTestStart('love_test_form');
    setAnswers((current) => ({ ...current, [key]: value } as LoveTestInput));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextResult = computeLoveTestResult(answers);
    trackLoveTestStart('love_test_submit');
    setSubmittedAnswers(answers);
    void trackRevenueFunnelEvent('relationship_start_click', {
      source: 'love_test',
      surface: 'love_test_form',
      result_id: nextResult.id,
      archetype: nextResult.archetype,
      score: nextResult.score,
    });
    void trackRevenueFunnelEvent('love_test_result_view', {
      source: 'love_test',
      surface: 'love_test_result',
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
    const shareUrl = typeof window === 'undefined' ? 'https://tianji.love/love-test' : `${window.location.origin}/love-test?result=${result.id}`;
    return getLoveTestSharePayload(result, shareUrl);
  };

  const copyShareText = async () => {
    const payload = sharePayload();
    if (!payload || !result) return;
    const text = [
      `I got "${payload.archetype}" on TianJi Love Test.`,
      `Score: ${payload.score}/100.`,
      `It said: "${payload.oneLiner}"`,
      `Try yours: ${payload.shareUrl}`,
    ].join('\n');
    await navigator.clipboard.writeText(text);
    setCopyState('copied');
    void trackRevenueFunnelEvent('love_test_copy_result', {
      source: 'love_test',
      surface: 'love_test_result',
      result_id: result.id,
      archetype: result.archetype,
      score: result.score,
    });
    void trackRevenueFunnelEvent('relationship_free_result_view', {
      source: 'love_test',
      surface: 'love_test_share_text',
    });
    window.setTimeout(() => setCopyState('idle'), 2500);
  };

  const downloadShareCard = async (format: LoveTestShareFormat) => {
    const payload = sharePayload();
    if (!payload || !result) return;
    setDownloadState(format);
    void trackRevenueFunnelEvent('love_test_share_card_click', {
      source: 'love_test',
      surface: 'love_test_result',
      card_format: format,
      result_id: result.id,
      archetype: result.archetype,
      score: result.score,
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

      if (!response.ok) return;

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `tianji-love-test-${format}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
      void trackRevenueFunnelEvent('relationship_free_result_view', {
        source: 'love_test',
        surface: 'love_test_share_card',
        format,
      });
    } finally {
      setDownloadState(null);
    }
  };

  return (
    <TianjiLoveShell ariaLabel="Love-Test MVP" className="love-test-page">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={getTianjiLovePrimaryNav('en', href)}
        cta={{ label: 'Free Love Test', href: href('/love-test') }}
      />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-10 pt-14 sm:px-8 lg:min-h-[680px] lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,0.78fr)] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b77b]/70">Love-Test MVP</p>
          <h1 className="font-serif text-[2.8rem] font-semibold leading-[1.05] text-[#ffe3b4] sm:text-[4.4rem]">
            Take the private love test before you ask the harder question.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[#f4d7a3]/78 sm:text-lg">
            Still wondering what this connection really means? Take the private Love Test first — then ask TianJi the question you cannot stop thinking about.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a href="#love-test-form" className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6]">
              Take Love Test
              <ArrowRight className="ml-3 h-4 w-4" aria-hidden />
            </a>
            <TianjiLoveButton href={href('/relationship/new')} variant="secondary">
              Free Love Reading
            </TianjiLoveButton>
            <TianjiLoveButton href={href(NEXT_STEP_HREF)} variant="secondary">
              Ask One Question
            </TianjiLoveButton>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <TianjiLoveTrustCard icon={Lock} title="Private by design" body="Birth data is not collected for this test." />
            <TianjiLoveTrustCard icon={ShieldCheck} title="Deterministic result" body="The same answers produce the same result every time." />
            <TianjiLoveTrustCard icon={Share2} title="Share-card ready" body="Download a social card that hides private inputs." />
          </div>
        </div>

        <TianjiLovePanel className="p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">Free Love Test / Take Love Test</p>
          <h2 className="mt-3 font-serif text-3xl text-[#ffe3b4]">A five-signal relationship profile</h2>
          <div className="mt-6 grid gap-3">
            {['Status', 'Communication', 'Pace', 'Tension style', 'Core value'].map((item) => (
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
          <TianjiLoveSectionTitle eyebrow="Private result flow" title="Choose the pattern that feels most true right now" className="mb-8" />
          <form onSubmit={onSubmit} className="grid gap-7">
            {FIELD_OPTIONS.map((field) => (
              <fieldset key={field.key} className="grid gap-3">
                <legend className="mb-2 font-serif text-2xl font-semibold text-[#ffe3b4]">{field.title}</legend>
                <div className="grid gap-3 md:grid-cols-4">
                  {field.options.map((option) => {
                    const selected = answers[field.key] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAnswer(field.key, option.value)}
                        aria-pressed={selected}
                        className={`min-h-[116px] rounded-xl border p-4 text-left transition ${
                          selected
                            ? 'border-[#ffb49e]/70 bg-[#ff6c73]/14 text-[#fff7e6]'
                            : 'border-[#b57248]/24 bg-black/18 text-[#f4d7a3]/72 hover:border-[#ffe3b4]/44'
                        }`}
                      >
                        <span className="block text-base font-semibold">{option.label}</span>
                        <span className="mt-2 block text-sm leading-6 opacity-75">{option.detail}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
            <button type="submit" className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-xl border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6]">
              Reveal my love pattern
              <Sparkles className="ml-3 h-4 w-4" aria-hidden />
            </button>
          </form>
        </TianjiLovePanel>
      </section>

      {result ? (
        <section id="love-test-result" className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8">
          <TianjiLovePanel className="p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
              <div className="rounded-xl border border-[#b57248]/24 bg-black/20 p-6 text-center">
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{result.archetype}</p>
                <div className="mt-4 text-7xl font-bold text-[#ff9c8b]">{result.score}</div>
                <p className="mt-2 text-sm text-[#f4d7a3]/60">relationship signal</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {result.keywords.map((keyword) => (
                    <span key={keyword} className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/8 px-3 py-1 text-xs text-[#f4d7a3]/72">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">Your deterministic result</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#ffe3b4] sm:text-4xl">{result.headline}</h2>
                <p className="mt-4 text-base leading-8 text-[#f4d7a3]/78">{result.oneLiner}</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {result.strengths.map((strength) => (
                    <div key={strength} className="rounded-xl border border-[#b57248]/22 bg-black/18 p-4 text-sm leading-6 text-[#f4d7a3]/74">
                      {strength}
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#ff9c8b]/26 bg-[#ff6c73]/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#ffb49e]/74">Watchout</p>
                    <p className="mt-2 text-sm leading-6 text-[#ffd6c6]/78">{result.watchout}</p>
                  </div>
                  <div className="rounded-xl border border-[#d8b77b]/24 bg-[#d8b77b]/8 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/74">Next step</p>
                    <p className="mt-2 text-sm leading-6 text-[#f4d7a3]/78">{result.nextStep}</p>
                  </div>
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={href(NEXT_STEP_HREF)}
                    onClick={() => void trackRevenueFunnelEvent('love_test_ask_next_click', {
                      source: 'love_test',
                      surface: 'love_test_result',
                      intent: 'next_step',
                      result_id: result.id,
                      archetype: result.archetype,
                      score: result.score,
                    })}
                    className="tianji-love-primary inline-flex min-h-12 items-center justify-center rounded-xl border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6]"
                  >
                    Ask about this result
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                  <button type="button" onClick={() => setSubmittedAnswers(null)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#b57248]/32 bg-black/24 px-5 text-sm font-semibold text-[#f4d7a3]/74">
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Retake test
                  </button>
                </div>
              </div>
            </div>
          </TianjiLovePanel>

          <TianjiLovePanel className="mt-5 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-[#ff9c8b]/26 bg-[#ff6c73]/10 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#ffb49e]/74">Ask the next question</p>
                <h3 className="mt-3 font-serif text-2xl text-[#ffe3b4]">What are they thinking now?</h3>
                <p className="mt-3 text-sm leading-6 text-[#ffd6c6]/74">{result.upsellQuestion}</p>
                <Link
                  href={href(ASK_NEXT_HREF)}
                  onClick={() => void trackRevenueFunnelEvent('love_test_ask_next_click', {
                    source: 'love_test',
                    surface: 'love_test_conversion_block',
                    intent: 'what_are_they_thinking',
                    result_id: result.id,
                    archetype: result.archetype,
                    score: result.score,
                  })}
                  className="tianji-love-primary mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-4 text-sm font-semibold text-[#fff7e6]"
                >
                  Ask what they are thinking now
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </article>
              <article className="rounded-xl border border-[#d8b77b]/24 bg-[#d8b77b]/8 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/74">Unlock deeper timing</p>
                <h3 className="mt-3 font-serif text-2xl text-[#ffe3b4]">Move when the signal is clearer.</h3>
                <p className="mt-3 text-sm leading-6 text-[#f4d7a3]/74">Use the result as context for a private timing question before you text, wait, or reframe.</p>
                <Link
                  href={href(TIMING_ADVICE_HREF)}
                  onClick={() => void trackRevenueFunnelEvent('love_test_timing_click', {
                    source: 'love_test',
                    surface: 'love_test_conversion_block',
                    intent: 'timing',
                    result_id: result.id,
                    archetype: result.archetype,
                    score: result.score,
                  })}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d8b77b]/30 bg-black/24 px-4 text-sm font-semibold text-[#f4d7a3]/78"
                >
                  Get timing advice
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Link>
              </article>
              <article className="rounded-xl border border-[#b57248]/24 bg-black/18 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/62">Save your result</p>
                <h3 className="mt-3 font-serif text-2xl text-[#ffe3b4]">Keep the signal handy.</h3>
                <p className="mt-3 text-sm leading-6 text-[#f4d7a3]/68">Copy the safe result text with only score, archetype, one-liner, and a Love Test link.</p>
                <button
                  type="button"
                  onClick={copyShareText}
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d8b77b]/30 bg-black/24 px-4 text-sm font-semibold text-[#f4d7a3]/78"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                  {copyState === 'copied' ? 'Result copied' : 'Copy my result'}
                </button>
              </article>
            </div>
          </TianjiLovePanel>

          <TianjiLovePanel className="mt-5 p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">Share card</p>
                <h2 className="mt-2 font-serif text-2xl text-[#ffe3b4]">Turn the result into a private social card</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#f4d7a3]/62">The card uses only score, archetype, headline, one-liner, keywords, and a safe result URL.</p>
              </div>
              <button type="button" onClick={copyShareText} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8b77b]/30 bg-black/24 px-4 text-sm font-semibold text-[#f4d7a3]/78">
                <Copy className="h-4 w-4" aria-hidden />
                {copyState === 'copied' ? 'Result copied' : 'Copy my result'}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {LOVE_TEST_SHARE_FORMATS.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => downloadShareCard(format)}
                  disabled={Boolean(downloadState)}
                  className="rounded-xl border border-[#b57248]/24 bg-black/18 p-4 text-left transition hover:border-[#ffb49e]/44 disabled:opacity-55"
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
            <p className="mt-4 text-xs leading-5 text-[#f4d7a3]/42">Birth data is not collected. Public cards never include private input fields.</p>
          </TianjiLovePanel>
        </section>
      ) : null}

      <TianjiLoveFooter
        homeHref={href('/')}
        disclaimer="Love-Test results are for self-reflection and relationship communication, not medical, legal, financial, or crisis advice."
        links={getTianjiLoveFooterNav('en', href)}
      />
    </TianjiLoveShell>
  );
}
