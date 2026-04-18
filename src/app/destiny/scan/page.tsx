'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackClientEvent } from '@/lib/analytics/client';
import { buildTrafficContext, getTrafficExperience, type TrafficContext } from '@/lib/traffic-evolution';

const ANALYSIS_STEPS = [
  'Reading your timing pattern...',
  'Matching your energy signature...',
  'Mapping the next growth window...',
];

export default function DestinyScanPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    birthDate: '',
    birthTime: '',
    birthLocation: '',
  });
  const [traffic, setTraffic] = useState<TrafficContext>({
    source: 'unknown',
    strategy: 'minimal_clean',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const context = buildTrafficContext({
      search: window.location.search,
      referrer: document.referrer,
      currentHost: window.location.host,
    });

    setTraffic(context);
    void trackClientEvent({
      event: 'destiny_scan_landing_view',
      moduleType: 'destiny',
      trafficSource: context.source,
      strategy: context.strategy,
      payload: {
        campaign: context.campaign ?? null,
      },
    });
  }, []);

  const experience = useMemo(() => getTrafficExperience(traffic.source), [traffic.source]);

  async function submit() {
    setLoading(true);
    setError(null);
    setStepIndex(0);

    const stepTimer = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % ANALYSIS_STEPS.length);
    }, 900);

    try {
      const response = await fetch('/api/destiny/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          traffic,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.id) {
        setError('We could not generate your scan. Please check the form and try again.');
        return;
      }

      void trackClientEvent({
        event: 'destiny_scan_submit',
        moduleType: 'destiny',
        trafficSource: traffic.source,
        strategy: traffic.strategy,
        payload: {
          campaign: traffic.campaign ?? null,
        },
      });

      router.push(`/destiny/result?id=${data.id}`);
    } catch (submitError) {
      console.error('[destiny/scan] submit failed', submitError);
      setError('We could not generate your scan. Please try again.');
    } finally {
      window.clearInterval(stepTimer);
      setLoading(false);
    }
  }

  const canSubmit = form.birthDate.trim().length > 0 && form.birthLocation.trim().length > 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),_transparent_35%),linear-gradient(135deg,_#13091d,_#09090f_55%,_#0f172a)] px-6 py-12 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-center">
        <section>
          <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">{experience.scan.eyebrow}</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight md:text-6xl">
            {experience.scan.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            {experience.scan.body}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {experience.scan.benefitCards.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-2xl backdrop-blur">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Start your scan</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Reveal the pattern behind your timing</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Birth date</span>
              <input
                type="date"
                value={form.birthDate}
                onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-purple-400/40"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Birth time</span>
              <input
                type="time"
                value={form.birthTime}
                onChange={(event) => setForm((current) => ({ ...current, birthTime: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-purple-400/40"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Birth location</span>
              <input
                placeholder="Singapore, New York, Shanghai..."
                value={form.birthLocation}
                onChange={(event) => setForm((current) => ({ ...current, birthLocation: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-purple-400/40"
              />
            </label>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button
            onClick={submit}
            disabled={!canSubmit || loading}
            className="mt-6 w-full rounded-full bg-white px-6 py-4 text-base font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? ANALYSIS_STEPS[stepIndex] : experience.scan.cta}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            We use your details to generate the scan. Public shares never expose your raw birth data by default.
          </p>
        </section>
      </div>
    </div>
  );
}
