'use client';

/**
 * Ask the Oracle — Pay-per-Question prototype
 *
 * Phase 1.1 of `tianji-upgrade-execution-plan.md` — single-question paid AI Q&A.
 * Skill: .claude/skills/tianji-paywall-pay-per-question/SKILL.md
 *
 * Flow:
 *   1. user types a question → POST /api/ask/preview
 *      → returns { id, preview }
 *   2. show preview + "Unlock $1.99" button
 *   3. user clicks → POST /api/ask/unlock { id } → redirect to Stripe checkout
 *   4. on success Stripe redirects back to /ask?session_id=...
 *      → page reads session_id, GET /api/ask/unlock?session_id=... → shows full answer
 *   5. on cancel Stripe returns to /ask?cancelled=1 → preview kept in sessionStorage
 *
 * Built on the same cinematic landing primitives as the rest of the redesign:
 *   BackgroundVideoHero · ModuleInputShell · ResultScaffold · PageChrome · GlassCard.
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
import { tianjiOracleCopy } from '@/lib/tianji-oracle-copy';

// ─── Types ────────────────────────────────────────────────────────────

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

const PREVIEW_STORAGE_KEY = 'tianji.ask.preview';

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

// ─── Page ─────────────────────────────────────────────────────────────

export default function AskPage() {
  const [language] = useSyncedLanguage();
  const copy = tianjiOracleCopy[language];
  const previewCopy = copy.preview!;
  const unlockedCopy = copy.unlocked!;

  const [question, setQuestion] = useState('');
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [unlocked, setUnlocked] = useState<UnlockedState | null>(null);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyAttempted = useRef(false);

  // Restore preview from sessionStorage on mount (e.g. after Stripe cancel).
  useEffect(() => {
    const stored = readStoredPreview();
    if (stored) setPreview(stored);
  }, []);

  // If returning from Stripe success, verify and show full answer.
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
          `/api/ask/unlock?${unlockParams.toString()}`,
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
        // Clear ?session_id from the URL so refresh doesn't re-verify.
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

  // ── Submit question → /api/ask/preview ──────────────────────────────
  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
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

  // ── Click unlock → /api/ask/unlock POST → Stripe checkout ───────────
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
              rows={4}
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
                disabled={!question.trim() || loading}
              >
                {loading ? copy.form.loading : copy.primaryCta}
              </MysticButton>
            </div>
          </form>
        </ModuleInputShell>
      </BackgroundVideoHero>

      {/* Preview + paywall ---------------------------------------------- */}
      {preview && !unlocked && (
        <ResultScaffold
          eyebrow={previewCopy.eyebrow}
          title={copy.hero.title}
          overview={
            <GlassCard
              level="card"
              className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 sm:p-8"
            >
              <p
                className="whitespace-pre-line text-base leading-relaxed"
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

              <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {copy.unlockBenefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="rounded-xl border px-3 py-2"
                    style={{
                      borderColor: 'rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.035)',
                      color: colors.textSecondary,
                    }}
                  >
                    {benefit}
                  </li>
                ))}
              </ul>

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

      {/* Unlocked answer ------------------------------------------------- */}
      {unlocked && (
        <ResultScaffold
          eyebrow={unlockedCopy.eyebrow}
          title={`"${unlocked.question}"`}
          overview={
            <GlassCard
              level="card"
              className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 sm:p-8"
            >
              <div
                className="whitespace-pre-line text-base leading-relaxed"
                style={{ color: colors.textPrimary }}
              >
                {unlocked.fullAnswer}
              </div>
            </GlassCard>
          }
        />
      )}

      {/* Error ---------------------------------------------------------- */}
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
