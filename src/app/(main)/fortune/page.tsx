'use client';

import { useState } from 'react';
import LifeChart, { type FortunePoint } from '@/components/charts/LifeChart';
import {
  BackgroundVideoHero,
  InsightGrid,
  LandingSection,
  ModuleInputShell,
  ResultScaffold,
  ScrollNarrativeSection,
  TrustStrip,
} from '@/components/landing';

interface FortuneResponse {
  fortuneCycles: FortunePoint[];
  currentAge: number;
  currentPhase: string;
  summary: string;
  bestPeriods: string[];
  challengingPeriods: string[];
  aiInterpretation?: string;
  disclaimer?: string;
  aiMeta?: { provider: string; model: string; latencyMs: number; costUSD: number };
  aiError?: string;
}

export default function FortunePage() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState('unspecified');
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [data, setData] = useState<FortuneResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');

  const isZH = language === 'zh';

  const handleGenerate = async (withAI: boolean) => {
    if (!birthDate) {
      setError(isZH ? 'Please select your birth date' : 'Please select your birth date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        birthDate,
        gender,
        language,
        ...(birthTime ? { birthTime } : {}),
        enhanceWithAI: String(withAI),
      });

      const res = await fetch(`/api/fortune?${params}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Failed to generate');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingAI(false);
    }
  };

  const trustItems = [
    { label: 'Original endpoint', value: '/api/fortune' },
    { label: 'Chart preserved', value: 'LifeChart' },
    { label: 'AI optional', value: 'Depth reading' },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050508] text-white">
      <BackgroundVideoHero
        eyebrow="Life K-line"
        title="Your fortune curve is not a straight line."
        subtitle="Map the rhythm of career, wealth, relationship, and health across each life phase without changing the original fortune engine."
        videoSrc="/assets/videos/hero/fortune-hero-loop-6s-1080p.mp4"
        posterSrc="/assets/images/posters/fortune-hero-poster-16x9.jpg"
        ctaLabel={loading ? 'Generating...' : 'Generate fortune chart'}
        ctaHref="#fortune-form"
        secondaryCtaLabel="View timing logic"
        secondaryCtaHref="#fortune-narrative"
        stats={[
          { label: 'Primary output', value: 'Life curve' },
          { label: 'Dimensions', value: '5' },
          { label: 'Mode', value: 'AI optional' },
        ]}
      />

      <TrustStrip items={trustItems} />

      <LandingSection
        id="fortune-form"
        eyebrow="Forecast console"
        title="Enter the minimum data. Keep the full timing layer."
        description="The page keeps the exact query parameter construction for the existing fortune API while upgrading the reading frame around it."
      >
        <ModuleInputShell
          eyebrow="Birth data"
          title="Generate your life curve"
          description="Birth time is optional. AI interpretation is requested only when you choose the deep interpretation path."
          footer="No payment, auth, or storage contract is changed in this redesign."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">Birth Date *</span>
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">Birth Time</span>
              <input
                type="time"
                value={birthTime}
                onChange={(event) => setBirthTime(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">Gender</span>
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              >
                <option value="unspecified">Unspecified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-white/45">Language</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as 'zh' | 'en')}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-violet-300/50"
              >
                <option value="zh">ZH</option>
                <option value="en">EN</option>
              </select>
            </label>
          </div>

          {error && (
            <p className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <button
              onClick={() => handleGenerate(false)}
              disabled={loading}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && !loadingAI ? 'Generating...' : 'Generate chart'}
            </button>
            <button
              onClick={() => {
                setLoadingAI(true);
                handleGenerate(true);
              }}
              disabled={loading}
              className="rounded-full border border-amber-300/40 bg-amber-300/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-300/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingAI ? 'AI interpreting...' : 'AI deep interpretation'}
            </button>
          </div>
        </ModuleInputShell>
      </LandingSection>

      <ScrollNarrativeSection
        blocks={[
          {
            label: '01',
            heading: 'Every decade has a different density.',
            body: 'The curve frames life as a sequence of pressure, momentum, and recovery windows.',
            align: 'left',
          },
          {
            label: '02',
            heading: 'Peaks are useful only when they become decisions.',
            body: 'Career, wealth, love, and health are shown together so the user can see tradeoffs instead of isolated numbers.',
            align: 'center',
          },
          {
            label: '03',
            heading: 'The premium layer is timing context.',
            body: 'The AI interpretation expands the curve into an actionable narrative without changing the underlying result shape.',
            align: 'right',
          },
        ]}
      />

      {data ? (
        <LandingSection
          eyebrow="Generated result"
          title="A layered fortune curve"
          description="Overview first, key windows second, detailed phases last."
        >
          <ResultScaffold
            eyebrow="Current phase"
            title={data.currentPhase}
            summary={`Age ${data.currentAge}. ${data.summary}`}
            highlights={[
              { label: 'Best windows', value: data.bestPeriods.slice(0, 2).join(' / ') || 'Awaiting signal' },
              {
                label: 'Pressure windows',
                value: data.challengingPeriods.slice(0, 2).join(' / ') || 'No major warning',
              },
              { label: 'AI layer', value: data.aiInterpretation ? 'Unlocked in this run' : 'Optional' },
            ]}
            details={
              <div className="space-y-6">
                <LifeChart data={data.fortuneCycles} language={language} />

                {data.aiInterpretation && (
                  <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/[0.06] p-5">
                    <h3 className="mb-3 text-xs uppercase tracking-[0.22em] text-amber-200/70">
                      AI deep interpretation
                    </h3>
                    <p className="whitespace-pre-wrap text-sm leading-7 text-white/72">{data.aiInterpretation}</p>
                    {data.disclaimer && <p className="mt-4 text-xs text-white/36">{data.disclaimer}</p>}
                    {data.aiMeta && (
                      <p className="mt-3 text-xs text-white/28">
                        {data.aiMeta.provider} / {data.aiMeta.model} / {data.aiMeta.latencyMs}ms
                      </p>
                    )}
                  </div>
                )}

                {data.aiError && (
                  <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200">
                    AI Interpretation Failed: {data.aiError}
                  </div>
                )}

                <div className="overflow-x-auto rounded-[1.5rem] border border-white/10 bg-black/30 p-4">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs uppercase tracking-[0.18em] text-white/36">
                        <th className="py-3">Phase</th>
                        <th className="py-3 text-center">Age</th>
                        <th className="py-3 text-center">Overall</th>
                        <th className="py-3 text-center">Career</th>
                        <th className="py-3 text-center">Wealth</th>
                        <th className="py-3 text-center">Love</th>
                        <th className="py-3 text-center">Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fortuneCycles.map((phase) => (
                        <tr key={`${phase.ageStart}-${phase.ageEnd}`} className="border-b border-white/[0.06]">
                          <td className="py-3 text-white/75">{isZH ? phase.phase : phase.phaseEn}</td>
                          <td className="py-3 text-center text-white/45">
                            {phase.ageStart}-{phase.ageEnd}
                          </td>
                          <td className="py-3 text-center font-semibold text-amber-100">{phase.overall}</td>
                          <td className="py-3 text-center text-white/62">{phase.career}</td>
                          <td className="py-3 text-center text-white/62">{phase.wealth}</td>
                          <td className="py-3 text-center text-white/62">{phase.love}</td>
                          <td className="py-3 text-center text-white/62">{phase.health}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            }
            aside={
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">Share-ready insight</p>
                  <p className="mt-3 text-lg font-serif text-white/82">
                    Your life curve is a timing map, not a straight score.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-violet-300/20 bg-violet-300/[0.06] p-5 text-sm leading-6 text-white/58">
                  Use the strong windows for expansion and the low windows for simplification.
                </div>
              </div>
            }
          />
        </LandingSection>
      ) : (
        <LandingSection
          eyebrow="Preview"
          title="The curve appears after generation"
          description="Submit the original form above to keep the exact API route and result shape while viewing the redesigned presentation."
        >
          <InsightGrid
            title="What the chart will reveal"
            subtitle="Timing / career / wealth / relationship"
            items={[
              { label: 'Current window', value: 'Where the user is now in the life curve' },
              { label: 'Best periods', value: 'The strongest expansion windows' },
              { label: 'Pressure periods', value: 'The chapters that ask for restraint' },
              { label: 'AI reading', value: 'Optional narrative layer from the existing endpoint' },
            ]}
          />
        </LandingSection>
      )}
    </main>
  );
}
