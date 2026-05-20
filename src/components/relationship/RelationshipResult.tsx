'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ChartNoAxesCombined,
  Copy,
  FileText,
  Lock,
  MessageCircleHeart,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Timer,
  Unlock,
} from 'lucide-react';

import { TianjiLovePanel } from '@/components/tianji-love';
import { trackRelationshipEvent } from '@/lib/analytics/track';
import { trackRevenueFunnelEvent } from '@/lib/analytics/funnel-events';
import { DimensionCard } from './RelationshipDimensionCard';
import { RelationshipRadar } from './RelationshipRadar';
import type { RelationshipReading } from '@/types/relationship';
import type { Language } from '@/types/reading';

interface RelationshipResultProps {
  reading: RelationshipReading;
  lang?: Language;
}

const DIMENSION_KEYS = ['attraction', 'communication', 'conflict', 'rhythm', 'longTerm'] as const;

const EXPERIMENT_ID = 'relationship-p0-sales-loop';
const VARIANT = 'A';

const resultCopy = {
  zh: {
    eyebrow: 'First Compatibility Signal',
    score: '缁煎悎鍖归厤',
    radar: 'Relationship radar',
    dimensions: '浜旂淮璇︽儏',
    nextMove: 'Your next best move',
    lockedTitle: 'Unlock the Full Relationship Pattern — $4.99',
    lockedBody: 'Full report unlocks all five dimensions, 30-day timing, conflict repair, conversation guidance, PDF-ready report, and saved history.',
    unlock: 'Unlock the Full Relationship Pattern — $4.99',
    unlockDisabled: 'Full report checkout is not enabled yet. Please save this reading and check back soon.',
    unlockFailed: 'Checkout could not be started. Please save your reading first.',
    currentPhase: '褰撳墠闃舵',
    next30Days: '鏈潵 30 澶?',
    copyLink: '澶嶅埗瀹夊叏鍒嗕韩閾炬帴',
    copied: '閾炬帴宸插鍒?',
    share: '鍒嗕韩鍏崇郴鎽樿',
    shareFailed: 'Share link could not be created. Please save your reading first.',
    privacy: '分享内容默认不包含出生日期、出生时辰、出生地点或时区。',
    trust: [
      ['Reading method', 'Symbolic compatibility engine + guided interpretation'],
      ['Data used', 'Birth dates and optional birth times'],
      ['Not used in free signal', 'Birth location'],
      ['Model confidence', 'Reflective guidance, not certainty'],
      ['Boundary', 'Not crisis support or therapy'],
    ],
  },
  en: {
    eyebrow: 'First Compatibility Signal',
    score: 'Overall score',
    radar: 'Relationship radar',
    dimensions: 'Five dimensions',
    nextMove: 'Your next best move',
    lockedTitle: 'Unlock the Full Relationship Pattern — $4.99',
    lockedBody: 'Full report unlocks all five dimensions, 30-day timing, conflict repair, conversation guidance, PDF-ready report, and saved history.',
    unlock: 'Unlock the Full Relationship Pattern — $4.99',
    unlockDisabled: 'Full report checkout is not enabled yet. Please save this reading and check back soon.',
    unlockFailed: 'Checkout could not be started. Please save your reading first.',
    currentPhase: 'Current phase',
    next30Days: 'Next 30 days',
    copyLink: 'Copy safe share link',
    copied: 'Link copied',
    share: 'Share relationship summary',
    shareFailed: 'Share link could not be created. Please save your reading first.',
    privacy: 'Shared content excludes birth date, birth time, birth location, and timezone by default.',
    trust: [
      ['Reading method', 'Symbolic compatibility engine + guided interpretation'],
      ['Data used', 'Birth dates and optional birth times'],
      ['Not used in free signal', 'Birth location'],
      ['Model confidence', 'Reflective guidance, not certainty'],
      ['Boundary', 'Not crisis support or therapy'],
    ],
  },
} as const;

const lockedItems = [
  { icon: Sparkles, label: 'All five relationship dimensions' },
  { icon: Timer, label: 'Next 30 days relationship window' },
  { icon: MessageCircleHeart, label: 'Conflict repair and conversation guidance' },
  { icon: FileText, label: 'PDF-ready sharing report' },
  { icon: Save, label: 'Saved reading and history' },
];

function scoreColor(score: number) {
  if (score >= 70) return '#34D399';
  if (score >= 50) return '#F5B35D';
  return '#FF8F83';
}

function getNextMove(reading: RelationshipReading) {
  const ordered = DIMENSION_KEYS.map((key) => reading.dimensions[key]).sort((left, right) => left.score - right.score);
  return ordered[0]?.advice[0] ?? reading.summary.oneLiner;
}

export function RelationshipResult({ reading, lang = 'zh' }: RelationshipResultProps) {
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const copy = resultCopy[lang] ?? resultCopy.zh;
  const isFull = reading.accessLevel === 'full' || reading.isPremium;
  const nextMove = useMemo(() => getNextMove(reading), [reading]);

  useEffect(() => {
    void trackRelationshipEvent({
      event: 'relationship_result_view',
      experiment_id: EXPERIMENT_ID,
      variant: VARIANT,
      relation_type: reading.relationType,
      is_premium: isFull,
      payload: {
        lang,
        accessLevel: reading.accessLevel,
        report_type: 'compatibility_report',
        funnel_stage: 'result_view',
      },
    });

    if (!isFull) {
      void trackRevenueFunnelEvent('relationship_free_completed', {
        lang,
        surface: 'relationship_result',
        relationType: reading.relationType,
        accessLevel: reading.accessLevel,
      });
    }
  }, [isFull, lang, reading.accessLevel, reading.relationType]);

  const handleUnlock = async () => {
    setUnlockError(null);
    setUnlockLoading(true);

    void trackRelationshipEvent({
      event: 'relationship_unlock_click',
      experiment_id: EXPERIMENT_ID,
      variant: VARIANT,
      relation_type: reading.relationType,
      is_premium: false,
      payload: {
        lang,
        productId: 'compatibility_report',
        report_type: 'compatibility_report',
        funnel_stage: 'unlock_click',
      },
    });

    void trackRevenueFunnelEvent('unlock_click', {
      lang,
      surface: 'relationship_result',
      productId: 'compatibility_report',
      product: 'relationship_destiny_report',
      relationType: reading.relationType,
    });

    try {
      void trackRelationshipEvent({
        event: 'relationship_checkout_start',
        experiment_id: EXPERIMENT_ID,
        variant: VARIANT,
        relation_type: reading.relationType,
        payload: {
          lang,
          productId: 'compatibility_report',
          report_type: 'compatibility_report',
          funnel_stage: 'checkout_start',
        },
      });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'compatibility_report',
          source: 'relationship',
          relationshipReadingId: reading.id,
          locale: lang === 'en' ? 'en' : 'zh-CN',
        }),
      });
      const json = await res.json();

      if (res.status === 403) {
        setUnlockError(copy.unlockDisabled);
        return;
      }

      if (!res.ok || !json.success || !json.data?.url) {
        setUnlockError(copy.unlockFailed);
        return;
      }

      void trackRelationshipEvent({
        event: 'relationship_checkout_success',
        experiment_id: EXPERIMENT_ID,
        variant: VARIANT,
        relation_type: reading.relationType,
        payload: {
          lang,
          productId: 'compatibility_report',
          report_type: 'compatibility_report',
          funnel_stage: 'checkout_session_created',
        },
      });
      window.location.href = json.data.url;
    } catch {
      setUnlockError(copy.unlockFailed);
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleCopyLink = async () => {
    setShareLoading(true);
    setShareError(null);

    void trackRelationshipEvent({
      event: 'relationship_share_click',
      experiment_id: EXPERIMENT_ID,
      variant: VARIANT,
      relation_type: reading.relationType,
      share_mode: 'summary',
      payload: {
        lang,
        report_type: 'compatibility_report',
        funnel_stage: 'share_click',
      },
    });

    try {
      const res = await fetch('/api/relationship/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readingId: reading.id,
          shareSettings: { includeNames: true, includeBirthData: false, shareMode: 'summary' },
        }),
      });
      const json = await res.json();

      if (json.success && json.data?.shareUrl) {
        await navigator.clipboard.writeText(json.data.shareUrl);
        setShareUrlCopied(true);
        void trackRelationshipEvent({
          event: 'relationship_copy_success',
          experiment_id: EXPERIMENT_ID,
          variant: VARIANT,
          relation_type: reading.relationType,
          share_mode: 'summary',
          payload: {
            lang,
            report_type: 'compatibility_report',
            funnel_stage: 'copy_success',
          },
        });
        setTimeout(() => setShareUrlCopied(false), 3000);
      } else {
        setShareError(copy.shareFailed);
      }
    } catch {
      setShareError(copy.shareFailed);
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <TianjiLovePanel className="p-7 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,124,130,0.14),transparent_44%)]" />
        <div className="relative z-10">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[#d8b77b]/70">{copy.eyebrow}</p>
          <h1 className="text-3xl font-semibold tracking-[0.04em] text-[#ffe3b4]">
            {reading.personA.nickname} & {reading.personB.nickname}
          </h1>
          <div className="mx-auto mt-5 inline-flex items-center gap-3 rounded-full border border-[#d8b77b]/24 bg-black/24 px-5 py-3">
            <span className="text-3xl font-bold" style={{ color: scoreColor(reading.overallScore) }}>
              {reading.overallScore}
            </span>
            <span className="text-sm text-[#f4d7a3]/60">{copy.score}</span>
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl text-xl font-semibold text-[#ffe3b4]">{reading.summary.headline}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#f4d7a3]/70">{reading.summary.oneLiner}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {reading.summary.keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full border border-[#d8b77b]/24 bg-[#d8b77b]/8 px-3 py-1 text-xs text-[#f4d7a3]/72"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </TianjiLovePanel>

      <TianjiLovePanel className="p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#ff6c73]/14 text-[#ff9c8b]">
            <MessageCircleHeart className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#d8b77b]/62">{copy.nextMove}</p>
            <p className="mt-2 text-base leading-7 text-[#ffe3b4]">{nextMove}</p>
          </div>
        </div>
      </TianjiLovePanel>

      <TianjiLovePanel className="p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#ffe3b4]">
          <ChartNoAxesCombined className="h-4 w-4 text-[#d8b77b]" aria-hidden />
          {copy.radar}
        </div>
        <div className={!isFull ? 'relative overflow-hidden rounded-xl' : undefined}>
          <div className={!isFull ? 'blur-[2px] opacity-45' : undefined}>
            <RelationshipRadar
              dimensions={reading.dimensions}
              personANickname={reading.personA.nickname}
              personBNickname={reading.personB.nickname}
              lang={lang}
            />
          </div>
          {!isFull && (
            <div className="absolute inset-0 grid place-items-center bg-black/34 px-5 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ffb49e]/40 bg-black/50 px-4 py-2 text-sm font-semibold text-[#fff7e6]">
                <Lock className="h-4 w-4" aria-hidden />
                {copy.lockedTitle}
              </span>
            </div>
          )}
        </div>
      </TianjiLovePanel>

      {!isFull ? (
        <TianjiLovePanel className="p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">{copy.dimensions}</p>
          <h2 className="mt-2 font-serif text-2xl text-[#ffe3b4]">{copy.lockedTitle}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#f4d7a3]/68">{copy.lockedBody}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {lockedItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border border-[#b57248]/22 bg-black/18 px-4 py-3 text-sm text-[#f4d7a3]/70">
                <item.icon className="h-4 w-4 text-[#d8b77b]" aria-hidden />
                {item.label}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleUnlock}
            disabled={unlockLoading}
            className="relationship-form-submit mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
          >
            <Unlock className="h-4 w-4" aria-hidden />
            {copy.unlock}
          </button>
          {unlockError && (
            <p className="mt-3 rounded-xl border border-[#ff7f80]/30 bg-[#ff5264]/10 p-3 text-sm text-[#ffb4a3]">
              {unlockError}
            </p>
          )}
        </TianjiLovePanel>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {DIMENSION_KEYS.map((key) => (
              <DimensionCard
                key={key}
                dimensionKey={key}
                data={reading.dimensions[key]}
                lang={lang}
                isPremium={reading.isPremium}
                onUnlock={() => {}}
              />
            ))}
          </div>

          {reading.timeline && (
            <TianjiLovePanel className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <article className="rounded-xl border border-[#d8b77b]/18 bg-black/22 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/66">{copy.currentPhase}</p>
                  <p className="mt-2 text-sm leading-7 text-[#f4d7a3]/76">{reading.timeline.currentPhase}</p>
                </article>
                <article className="rounded-xl border border-[#d8b77b]/18 bg-black/22 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/66">{copy.next30Days}</p>
                  <p className="mt-2 text-sm leading-7 text-[#f4d7a3]/76">{reading.timeline.next30Days}</p>
                </article>
              </div>
            </TianjiLovePanel>
          )}
        </>
      )}

      {shareError && (
        <div className="rounded-xl border border-[#ff7f80]/30 bg-[#ff5264]/10 p-4 text-center text-sm text-[#ffb4a3]">
          {shareError}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={shareLoading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d8b77b]/24 bg-black/24 px-5 text-sm font-semibold text-[#f4d7a3]/76 transition hover:border-[#ffe3b4]/44 hover:text-[#ffe3b4] disabled:opacity-55"
        >
          <Copy className="h-4 w-4" aria-hidden />
          {shareUrlCopied ? copy.copied : copy.copyLink}
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          disabled={shareLoading}
          className="relationship-form-submit inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6] transition disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Share2 className="h-4 w-4" aria-hidden />
          {copy.share}
        </button>
      </div>

      <TianjiLovePanel className="p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#ffe3b4]">
          <ShieldCheck className="h-4 w-4 text-[#d8b77b]" aria-hidden />
          Trust and privacy
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {copy.trust.map(([label, body]) => (
            <div key={label} className="rounded-lg border border-[#b57248]/18 bg-black/18 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#d8b77b]/60">{label}</p>
              <p className="mt-1 text-sm leading-6 text-[#f4d7a3]/66">{body}</p>
            </div>
          ))}
        </div>
      </TianjiLovePanel>

      <p className="mx-auto flex max-w-3xl items-start justify-center gap-2 text-center text-xs leading-6 text-[#f4d7a3]/42">
        <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-[#d8b77b]/68" aria-hidden />
        <span>{copy.privacy}</span>
      </p>
    </div>
  );
}
