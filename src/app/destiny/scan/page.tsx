'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trackClientEvent } from '@/lib/analytics/client';
import { buildTrafficContext, getTrafficExperience, type TrafficContext } from '@/lib/traffic-evolution';
import { resolveAppLanguage, withLanguageParam, type AppLanguage } from '@/lib/language-routing';

type ScanHeroView = {
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
  benefitCards: ReadonlyArray<{ title: string; body: string }>;
};

const scanCopy = {
  en: {
    analysisSteps: [
      'Reading your timing pattern...',
      'Matching your energy signature...',
      'Mapping the next growth window...',
    ],
    formEyebrow: 'Start your scan',
    formTitle: 'Reveal the pattern behind your timing',
    birthDate: 'Birth date',
    birthTime: 'Birth time',
    birthLocation: 'Birth location',
    birthLocationPlaceholder: 'Singapore, New York, Shanghai...',
    submitError: 'We could not generate your scan. Please check the form and try again.',
    retryError: 'We could not generate your scan. Please try again.',
    privacy: 'We use your details to generate the scan. Public shares never expose your raw birth data by default.',
  },
  zh: {
    analysisSteps: [
      '正在读取你的时间模式...',
      '正在匹配你的能量信号...',
      '正在绘制下一个成长窗口...',
    ],
    formEyebrow: '开始扫描',
    formTitle: '揭示你时间节奏背后的模式',
    birthDate: '出生日期',
    birthTime: '出生时间',
    birthLocation: '出生地点',
    birthLocationPlaceholder: '新加坡、纽约、上海...',
    submitError: '暂时无法生成扫描结果。请检查表单后再试一次。',
    retryError: '暂时无法生成扫描结果。请稍后再试。',
    privacy: '我们只用你的资料生成扫描结果；公开分享默认不会暴露原始出生数据。',
    hero: {
      eyebrow: 'AI 命运扫描',
      headline: '用三分钟，看见你下一段时间的关键节奏。',
      body: '输入最少资料，先获得一份情绪共鸣的局部结果；真正关键的转折点，会在完整解读中展开。',
      cta: '开始扫描',
      benefitCards: [
        { title: '时间窗口', body: '看清当下更适合推进、等待还是调整。' },
        { title: '能量信号', body: '把模糊感受整理成可理解的结构。' },
        { title: '可分享结果', body: '生成适合截图与分享的一句话洞察。' },
      ],
    },
  },
} as const;

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
  const [language, setLanguage] = useState<AppLanguage>('en');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const context = buildTrafficContext({
      search: window.location.search,
      referrer: document.referrer,
      currentHost: window.location.host,
    });
    const currentLanguage = resolveAppLanguage({
      queryLang: new URLSearchParams(window.location.search).get('lang'),
      storedLang: localStorage.getItem('tianji-lang'),
      navigatorLanguage: navigator.language,
    });

    setLanguage(currentLanguage);
    localStorage.setItem('tianji-lang', currentLanguage);
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
  const copy = scanCopy[language];
  const scanHero: ScanHeroView = language === 'zh' ? scanCopy.zh.hero : experience.scan;

  async function submit() {
    setLoading(true);
    setError(null);
    setStepIndex(0);

    const stepTimer = window.setInterval(() => {
      setStepIndex((current) => (current + 1) % copy.analysisSteps.length);
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
        setError(copy.submitError);
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

      router.push(withLanguageParam(`/destiny/result?id=${data.id}`, language));
    } catch (submitError) {
      console.error('[destiny/scan] submit failed', submitError);
      setError(copy.retryError);
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
          <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80">{scanHero.eyebrow}</p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight md:text-6xl">
            {scanHero.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-300">
            {scanHero.body}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {scanHero.benefitCards.map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm text-slate-300">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-black/35 p-6 shadow-2xl backdrop-blur">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{copy.formEyebrow}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{copy.formTitle}</h2>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">{copy.birthDate}</span>
              <input
                type="date"
                value={form.birthDate}
                onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-purple-400/40"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">{copy.birthTime}</span>
              <input
                type="time"
                value={form.birthTime}
                onChange={(event) => setForm((current) => ({ ...current, birthTime: event.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-purple-400/40"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">{copy.birthLocation}</span>
              <input
                placeholder={copy.birthLocationPlaceholder}
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
            {loading ? copy.analysisSteps[stepIndex] : scanHero.cta}
          </button>

          <p className="mt-4 text-center text-xs text-slate-400">
            {copy.privacy}
          </p>
        </section>
      </div>
    </div>
  );
}
