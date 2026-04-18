'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DestinyShareCard } from '@/components/destiny/DestinyShareCard';
import { DestinyTrendChart } from '@/components/destiny/DestinyTrendChart';
import { trackClientEvent } from '@/lib/analytics/client';
import type { DestinyScanPreview, DestinyScanResult } from '@/lib/destiny-scan';
import { getTrafficExperience } from '@/lib/traffic-evolution';

export default function DestinyResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-white">
          <div className="text-lg">Loading your destiny result...</div>
        </div>
      }
    >
      <DestinyResultContent />
    </Suspense>
  );
}

function DestinyResultContent() {
  const searchParams = useSearchParams();
  const [preview, setPreview] = useState<DestinyScanPreview | null>(null);
  const [result, setResult] = useState<DestinyScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState('');

  const id = searchParams.get('id');
  const success = searchParams.get('success');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing destiny scan id.');
      return;
    }

    const scanId = id;
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const previewResponse = await fetch(`/api/destiny/scan?id=${encodeURIComponent(scanId)}`);
        const previewData = await previewResponse.json();

        if (!previewResponse.ok) {
          if (active) {
            setError(previewData.error ?? 'Unable to load your destiny scan.');
            setLoading(false);
          }
          return;
        }

        if (active) {
          setPreview(previewData as DestinyScanPreview);
        }

        if (success === 'true' && sessionId) {
          const verifiedSessionId = sessionId;
          setUnlocking(true);
          const unlockResponse = await fetch(
            `/api/destiny/unlock?id=${encodeURIComponent(scanId)}&session_id=${encodeURIComponent(verifiedSessionId)}`
          );
          const unlockData = await unlockResponse.json();

          if (unlockResponse.ok && unlockData.data) {
            if (active) {
              setResult(unlockData.data as DestinyScanResult);
            }
          } else if (active) {
            setError(unlockData.error ?? 'Payment was received, but the unlock could not be verified yet.');
          }
          setUnlocking(false);
        }
      } catch (loadError) {
        console.error('[destiny/result] load failed', loadError);
        if (active) {
          setError('Unable to load your destiny scan.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [id, sessionId, success]);

  async function beginUnlock() {
    if (!id) {
      return;
    }
    const scanId = id;
    window.location.href = `/api/destiny/unlock?id=${encodeURIComponent(scanId)}`;
  }

  const display = result ?? preview;
  const trafficExperience = getTrafficExperience(display?.meta.trafficSource ?? 'unknown');

  useEffect(() => {
    if (!display) {
      return;
    }

    void trackClientEvent({
      event: result ? 'destiny_scan_unlock_view' : 'destiny_scan_result_view',
      moduleType: 'destiny',
      trafficSource: display.meta.trafficSource,
      strategy: display.meta.strategy,
      payload: {
        compatibilityScore: display.summary.compatibilityScore,
      },
    });
  }, [display, result]);

  if (loading && !display) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-lg">Loading your destiny result...</div>
      </div>
    );
  }

  if (!display) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <h1 className="text-3xl font-semibold">Destiny result not found</h1>
          <p className="mt-4 text-white/70">{error ?? 'We could not find this destiny scan.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),_transparent_35%),linear-gradient(135deg,_#060609,_#0f0b1f_52%,_#160f24)] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">AI destiny scan</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">{display.summary.headline}</h1>
            <p className="mt-5 max-w-2xl text-lg text-white/70">{display.summary.oneLiner}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <StatCard label="Energy" value={`${display.energy.overall}%`} />
              <StatCard label="Relationship signal" value={`${display.summary.compatibilityScore}%`} />
              <StatCard label="Current window" value={display.timeline.currentWindow} compact />
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-black/35 p-8 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Energy radar</p>
            <div className="mt-6 grid gap-3">
              {display.energy.points.map((point) => (
                <div key={point.label}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-200">
                    <span>{point.label}</span>
                    <span>{point.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-400"
                      style={{ width: `${point.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <DestinyTrendChart points={display.timeline.trend} title={display.timeline.headline} />

        <DestinyShareCard
          headline={display.share.title}
          oneLiner={display.share.oneLiner}
          compatibilityScore={display.summary.compatibilityScore}
          shareUrl={shareUrl}
        />

        {!result ? (
          <section className="rounded-[32px] border border-white/15 bg-white/5 p-8 backdrop-blur">
            <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">{trafficExperience.result.lockLabel}</p>
                <h2 className="mt-4 text-3xl font-semibold">{trafficExperience.result.lockHeadline}</h2>
                <p className="mt-4 max-w-2xl text-base text-white/70">
                  {trafficExperience.result.lockBody}
                </p>
                {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
              </div>

              <div className="rounded-3xl border border-amber-300/20 bg-amber-500/10 p-6">
                <div className="space-y-3 text-sm text-white/80">
                  <LockedLine label="Relationship pattern" content={display.teaser.relationship} />
                  <LockedLine label="Wealth cycle" content={display.teaser.wealth} />
                  <LockedLine label="Action plan" content={display.teaser.actions} />
                </div>

                <button
                  onClick={() => {
                    void trackClientEvent({
                      event: 'destiny_unlock_click',
                      moduleType: 'destiny',
                      trafficSource: display.meta.trafficSource,
                      strategy: display.meta.strategy,
                      payload: {
                        compatibilityScore: display.summary.compatibilityScore,
                      },
                    });
                    beginUnlock();
                  }}
                  disabled={unlocking}
                  className="mt-6 w-full rounded-full bg-white px-6 py-4 text-base font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
                >
                  {unlocking ? 'Verifying payment...' : 'Unlock Full Reading - $9.9'}
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-3">
            <ResultSection title="Relationship Pattern" section={result.relationship} />
            <ResultSection title="Wealth Cycle" section={result.wealth} />
            <ResultSection title="Action Plan" section={result.actions} />
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <div className={`mt-2 font-semibold text-white ${compact ? 'text-base' : 'text-2xl'}`}>{value}</div>
    </div>
  );
}

function LockedLine({ label, content }: { label: string; content: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-amber-200/80">{label}</p>
      <p className="mt-2 text-sm text-white/70">{content}</p>
    </div>
  );
}

function ResultSection({
  title,
  section,
}: {
  title: string;
  section: DestinyScanResult['relationship'];
}) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{title}</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">{section.headline}</h2>
      <p className="mt-3 text-sm text-white/75">{section.summary}</p>
      <div className="mt-5 space-y-3">
        {section.bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/80">
            {bullet}
          </div>
        ))}
      </div>
    </div>
  );
}
