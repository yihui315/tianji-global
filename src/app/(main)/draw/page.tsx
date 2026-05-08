'use client';

/**
 * Three Cards — Pay-per-Draw prototype
 *
 * Phase 1.2 of `tianji-upgrade-execution-plan.md`. Mirrors the shape of
 * /ask but adds a 3-card row that toggles face-down (preview) →
 * face-up (unlocked). The card identities are held back until payment;
 * the preview only knows arcana family + slot label.
 *
 * Flow:
 *   1. user (optionally) types a question → POST /api/draw/preview
 *   2. show 3 face-down cards + short reading teaser + Unlock $2.99
 *   3. POST /api/draw/unlock { id } → Stripe checkout
 *   4. Stripe redirect → GET /api/draw/unlock?session_id=...
 *      → flip cards face-up + render full reading
 *
 * Skill: .claude/skills/tianji-paywall-pay-per-question/SKILL.md
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackgroundVideoHero,
  ModuleInputShell,
  PageChrome,
  ResultScaffold,
  TrustStrip,
} from '@/components/landing';
import { GlassCard, LanguageSwitch, MysticButton } from '@/components/ui';
import { colors } from '@/design-system';
import { useSyncedLanguage } from '@/hooks/useSyncedLanguage';
import { moduleLandingCopy } from '@/lib/language-routing';

// ─── Types ────────────────────────────────────────────────────────────

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
}

const PREVIEW_STORAGE_KEY = 'tianji.draw.preview';

const SLOT_LABEL: Record<Slot, { en: string; zh: string }> = {
  yesterday: { en: 'Yesterday', zh: '昨天' },
  today: { en: 'Today', zh: '今天' },
  tomorrow: { en: 'Tomorrow', zh: '明天' },
};

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
    // ignore
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

// ─── Card visuals ────────────────────────────────────────────────────

function CardBack({ arcana, label }: { arcana: 'major' | 'minor'; label: string }) {
  const tint =
    arcana === 'major'
      ? 'linear-gradient(160deg, rgba(212,175,55,0.20), rgba(180,130,255,0.18))'
      : 'linear-gradient(160deg, rgba(140,90,255,0.18), rgba(60,180,255,0.12))';
  return (
    <div
      className="relative flex h-56 w-36 flex-col items-center justify-center rounded-2xl border"
      style={{
        background: tint,
        borderColor: 'rgba(255,255,255,0.10)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.40)',
      }}
    >
      <div
        className="absolute inset-2 rounded-xl border"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
      />
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.28em]"
        style={{ color: 'rgba(255,255,255,0.55)' }}
      >
        {label}
      </div>
      <span
        className="font-serif text-3xl italic"
        style={{ color: arcana === 'major' ? colors.goldLight : 'rgba(220,210,255,0.9)' }}
      >
        ✦
      </span>
    </div>
  );
}

function CardFace({
  card,
  isReversed,
  slotLabel,
  miniReading,
  language,
}: {
  card: UnlockedCard['card'];
  isReversed: boolean;
  slotLabel: string;
  miniReading: string;
  language: Lang;
}) {
  const cardName = language === 'zh' ? card.nameChinese : card.name;
  return (
    <div
      className="flex h-56 w-40 flex-col rounded-2xl border p-3"
      style={{
        background: 'linear-gradient(180deg, rgba(20,22,40,0.55), rgba(0,0,0,0.4))',
        borderColor: 'rgba(255,255,255,0.10)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.40)',
      }}
    >
      <div
        className="text-[10px] uppercase tracking-[0.28em]"
        style={{ color: 'rgba(255,255,255,0.55)' }}
      >
        {slotLabel}
      </div>
      <div className="mt-2 flex flex-1 flex-col items-center justify-center text-center">
        <div
          className="font-serif text-base italic leading-tight"
          style={{ color: colors.textPrimary }}
        >
          {cardName}
        </div>
        <div
          className="mt-1 text-[10px] uppercase tracking-[0.22em]"
          style={{ color: isReversed ? '#FFB4B4' : colors.goldLight }}
        >
          {isReversed
            ? language === 'zh'
              ? '逆位'
              : 'Reversed'
            : language === 'zh'
              ? '正位'
              : 'Upright'}
        </div>
      </div>
      <div
        className="mt-2 line-clamp-3 text-[11px] leading-snug"
        style={{ color: 'rgba(255,255,255,0.62)' }}
      >
        {miniReading}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function DrawPage() {
  const [language] = useSyncedLanguage();
  const lang = language as Lang;
  const copy = moduleLandingCopy.draw[language];
  const previewCopy = copy.preview!;
  const unlockedCopy = copy.unlocked!;

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
        const res = await fetch(
          `/api/draw/unlock?${unlockParams.toString()}`,
          { method: 'GET' },
        );
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
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (loading) return;
      setError(null);
      setUnlocked(null);
      try {
        setLoading(true);
        const res = await fetch('/api/draw/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: question.trim(), language: lang }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Unable to draw cards');
        }
        const state: PreviewState = {
          id: json.id,
          preview: json.preview,
          language: json.language,
          price: json.price,
          previewDraw: json.previewDraw,
        };
        setPreview(state);
        writeStoredPreview(state);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      } finally {
        setLoading(false);
      }
    },
    [question, lang, loading],
  );

  const onUnlock = useCallback(async () => {
    if (!preview || unlocking) return;
    setError(null);
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
    <main className="relative min-h-screen overflow-x-hidden text-white">
      <PageChrome disableSpotlight />

      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitch />
      </div>

      <BackgroundVideoHero
        eyebrow={copy.hero.eyebrow}
        title={copy.hero.title}
        subtitle={copy.hero.subtitle}
        description={copy.hero.description}
        videoSrc="/assets/videos/hero/fortune-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/hero/fortune-hero-master-16x9.jpg"
        meta={<TrustStrip items={[...copy.trustItems]} className="w-full max-w-3xl" />}
      >
        <ModuleInputShell
          eyebrow={copy.form.eyebrow}
          title={copy.form.title}
          description={copy.form.description}
          footer={copy.form.footer}
        >
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={copy.form.placeholder}
              className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-base outline-none focus:border-white/30"
              style={{ color: colors.textPrimary }}
              disabled={loading}
            />
            <div className="flex items-center justify-between">
              <span
                className="text-[0.75rem]"
                style={{ color: colors.textTertiary }}
              >
                {question.length} / 500
              </span>
              <MysticButton
                type="submit"
                variant="solid"
                size="md"
                disabled={loading}
              >
                {loading ? copy.form.loading : copy.primaryCta}
              </MysticButton>
            </div>
          </form>
        </ModuleInputShell>
      </BackgroundVideoHero>

      {/* Preview · 3 face-down cards + paywall ────────────────────── */}
      {preview && !unlocked && (
        <ResultScaffold
          eyebrow={previewCopy.eyebrow}
          title={copy.hero.title}
          overview={
            <GlassCard
              level="card"
              className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 sm:p-8"
            >
              <div className="flex flex-wrap justify-center gap-5">
                {preview.previewDraw.map((slot) => (
                  <CardBack
                    key={slot.slot}
                    arcana={slot.arcana}
                    label={SLOT_LABEL[slot.slot][lang]}
                  />
                ))}
              </div>

              <p
                className="mt-8 whitespace-pre-line text-base leading-relaxed"
                style={{ color: colors.textPrimary }}
              >
                {preview.preview}
              </p>

              <div
                className="my-5 h-px w-full"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />

              <div
                className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{
                  background: 'rgba(212,175,55,0.06)',
                  border: '1px solid rgba(212,175,55,0.18)',
                  color: colors.textSecondary,
                }}
              >
                {previewCopy.paywallNote.replace('{price}', preview.price)}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span
                  className="text-[0.75rem]"
                  style={{ color: colors.textTertiary }}
                >
                  {previewCopy.assurance}
                </span>
                <MysticButton
                  variant="solid"
                  size="md"
                  onClick={onUnlock}
                  disabled={unlocking}
                >
                  {unlocking
                    ? previewCopy.unlocking
                    : previewCopy.unlockCta.replace('{price}', preview.price)}
                </MysticButton>
              </div>
            </GlassCard>
          }
        />
      )}

      {/* Unlocked · 3 face-up cards + full reading ────────────────── */}
      {unlocked && (
        <ResultScaffold
          eyebrow={unlockedCopy.eyebrow}
          title={
            unlocked.question
              ? `"${unlocked.question}"`
              : language === 'zh'
                ? '你的三张牌'
                : 'Your three cards'
          }
          overview={
            <GlassCard
              level="card"
              className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 sm:p-8"
            >
              <div className="flex flex-wrap justify-center gap-5">
                {unlocked.draw.map((slot) => (
                  <CardFace
                    key={slot.slot}
                    card={slot.card}
                    isReversed={slot.isReversed}
                    slotLabel={SLOT_LABEL[slot.slot][lang]}
                    miniReading={slot.miniReading}
                    language={lang}
                  />
                ))}
              </div>

              <div
                className="my-6 h-px w-full"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              />

              <div
                className="whitespace-pre-line text-base leading-relaxed"
                style={{ color: colors.textPrimary }}
              >
                {unlocked.fullReading}
              </div>
            </GlassCard>
          }
        />
      )}

      {error && (
        <section className="mx-auto w-full max-w-2xl px-6 pb-10">
          <GlassCard
            level="soft"
            className="rounded-2xl border border-red-400/30 bg-red-500/5 p-4"
          >
            <span style={{ color: '#FFB4B4' }}>{error}</span>
          </GlassCard>
        </section>
      )}
    </main>
  );
}
