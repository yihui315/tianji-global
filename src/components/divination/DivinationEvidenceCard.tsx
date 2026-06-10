'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Clock3,
  Lock,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';

import { trackDivinationEvidenceEvent } from '@/lib/analytics/divination-events';
import type { CheckoutStartFromFreePreviewSource } from '@/lib/analytics/funnel-events';
import type {
  DivinationAccuracyFeedback,
  DivinationEvidence,
  DivinationEvidenceRoute,
} from '@/types/divination';

type DivinationEvidenceCardProps = {
  evidence: DivinationEvidence;
  route: DivinationEvidenceRoute;
  paid: boolean;
  onUnlockClick?: (source: CheckoutStartFromFreePreviewSource) => void;
  unlockLabel?: string;
  className?: string;
};

const feedbackOptions: Array<{ value: DivinationAccuracyFeedback; label: string }> = [
  { value: 'yes_very', label: 'Yes, very' },
  { value: 'somewhat', label: 'Somewhat' },
  { value: 'not_really', label: 'Not really' },
];

function strengthTone(strength: DivinationEvidence['signals'][number]['strength']) {
  if (strength === 'high') return 'border-[#f7c873]/55 bg-[#f7c873]/12 text-[#ffe3b4]';
  if (strength === 'medium') return 'border-[#ff9c8b]/42 bg-[#ff9c8b]/10 text-[#ffd5c9]';
  return 'border-[#f4d7a3]/22 bg-[#f4d7a3]/8 text-[#f4d7a3]/72';
}

export function DivinationEvidenceCard({
  evidence,
  route,
  paid,
  onUnlockClick,
  unlockLabel = 'Unlock deeper insight',
  className = '',
}: DivinationEvidenceCardProps) {
  const [expanded, setExpanded] = useState(paid);
  const [feedback, setFeedback] = useState<DivinationAccuracyFeedback | null>(null);
  const signalKey = useMemo(
    () => evidence.signals.map((signal) => `${signal.source}:${signal.strength}`).join('|'),
    [evidence.signals],
  );

  useEffect(() => {
    void trackDivinationEvidenceEvent('divination_evidence_viewed', {
      route,
      paid,
      evidence,
    });
  }, [evidence, paid, route, signalKey]);

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded) {
      void trackDivinationEvidenceEvent('divination_evidence_expand_clicked', {
        route,
        paid,
        evidence,
      });
    }
  };

  const submitFeedback = (value: DivinationAccuracyFeedback) => {
    setFeedback(value);
    void trackDivinationEvidenceEvent('divination_accuracy_feedback_submitted', {
      route,
      paid,
      evidence,
      feedback: value,
    });
  };

  const handleUnlock = () => {
    void trackDivinationEvidenceEvent('paid_unlock_from_evidence_clicked', {
      route,
      paid,
      evidence,
    });
    onUnlockClick?.('evidence_card');
  };

  const hasDetail = Boolean(evidence.userCanVerify?.length || evidence.actionAdvice?.length);

  return (
    <section
      className={`rounded-lg border border-[#d8b77b]/26 bg-[#100a13]/82 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] ${className}`}
      aria-label="Divination evidence"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f7c873]/24 bg-[#f7c873]/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#f7c873]/78">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Evidence layer
          </div>
          <h3 className="mt-4 font-serif text-2xl text-[#ffe3b4]">Core insight</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#fff4dd]/78">{evidence.summary}</p>
        </div>
        <div className="inline-flex w-max items-center gap-2 rounded-full border border-[#ffb49e]/28 bg-[#ffb49e]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#ffd5c9]">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          {evidence.confidence} confidence
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {evidence.signals.map((signal) => (
          <div
            key={`${signal.source}-${signal.label}`}
            className="rounded-lg border border-[#d8b77b]/18 bg-[#070914]/58 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-[#ffe3b4]">{signal.label}</span>
              <span className="rounded-full border border-[#d8b77b]/18 px-2 py-0.5 text-[0.67rem] uppercase tracking-[0.16em] text-[#f4d7a3]/62">
                {signal.source}
              </span>
              <span className={`rounded-full border px-2 py-0.5 text-[0.67rem] uppercase tracking-[0.16em] ${strengthTone(signal.strength)}`}>
                {signal.strength}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#fff4dd]/72">{signal.explanation}</p>
          </div>
        ))}
      </div>

      {evidence.timingWindow ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#ff9c8b]/20 bg-[#ff9c8b]/8 p-4">
          <Clock3 className="mt-0.5 h-4 w-4 flex-none text-[#ffb49e]" aria-hidden />
          <p className="text-sm leading-6 text-[#fff4dd]/74">{evidence.timingWindow}</p>
        </div>
      ) : null}

      {hasDetail ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={toggleExpanded}
            className="inline-flex items-center gap-2 rounded-lg border border-[#d8b77b]/24 px-3 py-2 text-sm font-semibold text-[#ffe3b4] transition hover:border-[#f7c873]/48 hover:bg-[#f7c873]/8"
          >
            {expanded ? <ChevronUp className="h-4 w-4" aria-hidden /> : <ChevronDown className="h-4 w-4" aria-hidden />}
            {expanded ? 'Hide verification' : 'Show verification'}
          </button>

          {expanded ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {evidence.userCanVerify?.length ? (
                <div className="rounded-lg border border-[#d8b77b]/18 bg-[#070914]/48 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d8b77b]/70">User can verify</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#fff4dd]/72">
                    {evidence.userCanVerify.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {evidence.actionAdvice?.length ? (
                <div className="rounded-lg border border-[#d8b77b]/18 bg-[#070914]/48 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d8b77b]/70">Action advice</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#fff4dd]/72">
                    {evidence.actionAdvice.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {!paid && onUnlockClick ? (
        <button
          type="button"
          onClick={handleUnlock}
          className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#ffb49e]/52 bg-[#9f2f3f]/24 px-5 text-sm font-semibold text-[#fff7e6] transition hover:border-[#ffd5c9]/70 hover:bg-[#b93a4c]/30"
        >
          <Lock className="h-4 w-4" aria-hidden />
          {unlockLabel}
        </button>
      ) : null}

      <div className="mt-5 border-t border-[#d8b77b]/14 pt-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#ffe3b4]">
            <ThumbsUp className="h-4 w-4" aria-hidden />
            Did this feel accurate?
          </p>
          <div className="flex flex-wrap gap-2">
            {feedbackOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={feedback === option.value}
                onClick={() => submitFeedback(option.value)}
                className="rounded-lg border border-[#d8b77b]/22 px-3 py-2 text-xs font-semibold text-[#f7e8c8] transition hover:border-[#f7c873]/50 hover:bg-[#f7c873]/8 aria-pressed:border-[#f7c873]/70 aria-pressed:bg-[#f7c873]/14"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
