'use client';

import { type FormEvent, useCallback, useState } from 'react';
import { Lock, Sparkles, Star } from 'lucide-react';

import { isSectionLocked, PREVIEW_SECTIONS_FREE } from '@/lib/ask-question';
import type { LoveReportSections } from '@/lib/love-report-sections';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AskQuestionResultProps {
  /** Encrypted reading ID from the preview API */
  readingId: string;
  /** Free preview text (short head + ellipsis) */
  preview: string;
  /** Full 8-section report returned after unlock */
  loveReportSections?: LoveReportSections;
  /** Whether the full report is available (paid) */
  unlocked: boolean;
  /** Display price from API, e.g. "$1.99" */
  price: string;
  /** UI language */
  language: 'en' | 'zh';
  /** Optional analytics source label */
  source?: string;
}

interface LoveReadingPaywallProps {
  price: string;
  language: 'en' | 'zh';
  unlocking: boolean;
  onUnlock: () => void;
}

// ─── Copy ─────────────────────────────────────────────────────────────────────

const paywallCopy = {
  en: {
    eyebrow: 'Private Preview',
    paywallTitle: 'Unlock Full 8-Section Reading',
    paywallPrice: '— $1.99',
    cta: 'Unlock Full Reading →',
    unlocking: 'Opening checkout…',
    subtext:
      'Get all 8 sections: emotional analysis, blockage, timing, next step, and a reflection prompt.',
    alreadyPaid: 'Already paid? Enter Reading ID',
    benefits: [
      'Emotional pattern & hidden feelings',
      'Main blockage or tension point',
      'Timing signal for next move',
      'One safe next step to try first',
      'What not to do in this situation',
      'Reflection prompt for your next conversation',
    ],
    assurance: 'Secure Stripe checkout · One-time payment · 24h refund window',
    sectionLocked: 'Full section locked',
    sectionFree: 'Preview — first 2 sections free',
  },
  zh: {
    eyebrow: '私密预览',
    paywallTitle: '解锁完整8段落关系解读',
    paywallPrice: '— ¥15',
    cta: '解锁完整解读 →',
    unlocking: '正在打开结账…',
    subtext:
      '获取全部8个段落：情绪分析、障碍点、时机信号、下一步行动与反思问题。',
    alreadyPaid: '已付款？输入解读ID',
    benefits: [
      '情绪模式与隐藏感受',
      '主要障碍或张力点',
      '下一步行动的时机信号',
      '第一步可尝试的安全行动',
      '此刻应避免的行为',
      '下次对话前的反思提示',
    ],
    assurance: 'Stripe安全结账 · 单次付款 · 24小时退款保障',
    sectionLocked: '完整段落已锁定',
    sectionFree: '预览 — 前2个段落免费',
  },
} satisfies Record<'en' | 'zh', {
  eyebrow: string;
  paywallTitle: string;
  paywallPrice: string;
  cta: string;
  unlocking: string;
  subtext: string;
  alreadyPaid: string;
  benefits: string[];
  assurance: string;
  sectionLocked: string;
  sectionFree: string;
}>;

// ─── LoveReadingPaywall Component ─────────────────────────────────────────────

function LoveReadingPaywall({ price, language, unlocking, onUnlock }: LoveReadingPaywallProps) {
  const copy = paywallCopy[language];

  return (
    <div className="tianji-love-paywall mt-6 rounded-xl border border-[#b57248]/52 bg-[#070b16]/88 p-6 shadow-[0_0_0_1px_rgba(255,217,157,0.04),0_24px_72px_rgba(0,0,0,0.48)] backdrop-blur sm:p-8">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d7a86c]/78">
            {copy.eyebrow}
          </p>
          <h3 className="mt-2 font-serif text-2xl font-semibold text-[#ffe3b4] sm:text-3xl">
            {copy.paywallTitle}
            <span className="ml-2 text-[#d8b77b]">{copy.paywallPrice}</span>
          </h3>
        </div>
        <Lock className="h-7 w-7 shrink-0 text-[#d8b77b]" aria-hidden />
      </div>

      {/* Benefits list */}
      <ul className="mb-6 grid gap-2 sm:grid-cols-2">
        {copy.benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2 text-sm text-[#f4d7a3]/78">
            <Star className="mr-1 h-3.5 w-3.5 shrink-0 fill-[#d8b77b] text-[#d8b77b]" aria-hidden />
            {benefit}
          </li>
        ))}
      </ul>

      {/* Subtext */}
      <p className="mb-5 text-sm leading-6 text-[#f4d7a3]/62">{copy.subtext}</p>

      {/* Assurance */}
      <p className="mb-6 text-xs tracking-[0.1em] text-[#f4d7a3]/48">{copy.assurance}</p>

      {/* CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onUnlock}
          disabled={unlocking}
          className="tianji-love-primary inline-flex min-h-14 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-8 text-base font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-55"
        >
          {unlocking ? (
            <>
              <Sparkles className="mr-3 h-4 w-4 animate-pulse" aria-hidden />
              {copy.unlocking}
            </>
          ) : (
            copy.cta
          )}
        </button>
        <p className="text-xs text-[#f4d7a3]/48">{copy.alreadyPaid}</p>
      </div>
    </div>
  );
}

// ─── BlurredSection Component ─────────────────────────────────────────────────

interface BlurredSectionProps {
  section: LoveReportSections[number];
  sectionIndex: number;
  language: 'en' | 'zh';
}

function BlurredSection({ section, sectionIndex, language }: BlurredSectionProps) {
  const copy = paywallCopy[language];
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#b57248]/28">
      {/* Blurred content */}
      <div
        className="pointer-events-none select-none blur-[7px] opacity-40"
        aria-hidden
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d7a86c]/68">
          {sectionIndex + 1}. {section.title}
        </p>
        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#f4d7a3]/68">
          {section.body}
        </p>
      </div>

      {/* Padlock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#03040a]/60 backdrop-blur-sm">
        <Lock className="h-6 w-6 text-[#d8b77b]" aria-hidden />
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d8b77b]/80">
          {copy.sectionLocked}
        </p>
      </div>
    </div>
  );
}

// ─── FreeSection Component ─────────────────────────────────────────────────────

interface FreeSectionProps {
  section: LoveReportSections[number];
  sectionIndex: number;
  language: 'en' | 'zh';
  isLast?: boolean;
}

function FreeSection({ section, sectionIndex, language, isLast }: FreeSectionProps) {
  const copy = paywallCopy[language];
  return (
    <div className={!isLast ? 'mb-6' : undefined}>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d7a86c]/68">
        {sectionIndex + 1}. {section.title}
      </p>
      <p className="mt-2 whitespace-pre-line text-base leading-8 text-[#f4d7a3]/84">
        {section.body}
      </p>
    </div>
  );
}

// ─── AskQuestionResult Component ───────────────────────────────────────────────

export default function AskQuestionResult({
  readingId,
  preview,
  loveReportSections,
  unlocked,
  price,
  language,
  source,
}: AskQuestionResultProps) {
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = paywallCopy[language];

  const onUnlock = useCallback(async () => {
    if (unlocking) return;
    setError(null);
    try {
      setUnlocking(true);
      const res = await fetch('/api/ask/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: readingId,
          language,
          source: source ?? 'ask_question_result',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? 'Unable to start checkout');
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setUnlocking(false);
    }
  }, [readingId, language, source, unlocking]);

  // ── Unlocked: show all 8 sections ─────────────────────────────────────────
  if (unlocked && loveReportSections && loveReportSections.length > 0) {
    return (
      <div className="tianji-love-result">
        <AskResultStyles />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
          <div className="tianji-love-reading-panel rounded-xl border border-[#b57248]/42 bg-[#060b16]/82 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d7a86c]/78">
              {language === 'en' ? 'Your Complete Love Reading' : '你的完整爱情解读'}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-[#ffe3b4] sm:text-4xl">
              {language === 'en' ? 'Full Reading Unlocked' : '完整解读已解锁'}
            </h2>

            <div className="mt-6 space-y-6">
              {loveReportSections.map((section, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d7a86c]/68">
                    {i + 1}. {section.title}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-base leading-8 text-[#f4d7a3]/84">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Locked preview: show preview text + first 2 sections + paywall ────────
  const freeSections = loveReportSections?.slice(0, PREVIEW_SECTIONS_FREE) ?? [];
  const lockedSections = loveReportSections?.slice(PREVIEW_SECTIONS_FREE) ?? [];

  return (
    <div className="tianji-love-result">
      <AskResultStyles />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
        <div className="tianji-love-reading-panel rounded-xl border border-[#b57248]/42 bg-[#060b16]/82 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.28)] backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#d7a86c]/78">
            {copy.eyebrow}
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-[#ffe3b4] sm:text-4xl">
            {language === 'en' ? 'A private preview is ready' : '私密预览已生成'}
          </h2>

          {/* Short text preview */}
          {preview && (
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-[#fff4dd]/88">
              {preview}
            </p>
          )}

          {/* Free sections */}
          {freeSections.length > 0 && (
            <div className="mt-6">
              <div className="mb-4 flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8b77b]/72">
                  {copy.sectionFree}
                </p>
              </div>
              {freeSections.map((section, i) => (
                <FreeSection
                  key={i}
                  section={section}
                  sectionIndex={i}
                  language={language}
                  isLast={i === freeSections.length - 1}
                />
              ))}
            </div>
          )}

          {/* Paywall */}
          <LoveReadingPaywall
            price={price}
            language={language}
            unlocking={unlocking}
            onUnlock={onUnlock}
          />

          {/* Locked sections (blurred) */}
          {lockedSections.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,198,130,0.62),transparent)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d8b77b]/52">
                {language === 'en'
                  ? `Sections ${PREVIEW_SECTIONS_FREE + 1}–${loveReportSections?.length ?? 8} locked`
                  : `第${PREVIEW_SECTIONS_FREE + 1}–${loveReportSections?.length ?? 8}段已锁定`}
              </p>
              {lockedSections.map((section, i) => (
                <BlurredSection
                  key={i}
                  section={section}
                  sectionIndex={PREVIEW_SECTIONS_FREE + i}
                  language={language}
                />
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-[#ff8f87]/42 bg-[#3d0f17]/34 p-4 text-sm text-[#ffd0c9]">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

function AskResultStyles() {
  return (
    <style>{`
      .tianji-love-result {
        font-family: var(--font-tianji-sans), "Microsoft YaHei", system-ui, sans-serif;
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
      .tianji-love-reading-panel,
      .tianji-love-paywall {
        border-color: rgba(181, 114, 72, 0.42) !important;
        box-shadow:
          inset 0 0 0 1px rgba(255, 221, 167, 0.04),
          0 28px 80px rgba(0, 0, 0, 0.32),
          0 0 42px rgba(181, 87, 62, 0.045) !important;
      }
    `}</style>
  );
}
