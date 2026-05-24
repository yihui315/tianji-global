import { CalendarDays, LockKeyhole, Sparkles } from 'lucide-react';
import type { DailyFortuneScores, FortuneDriver, FortuneRiskTag } from '@/types/daily-fortune';
import { ScoreGrid } from '@/components/daily-fortune/ScoreGrid';

export function DailyFortuneCard({
  date,
  headline,
  summary,
  scores,
  drivers,
  riskTags,
  locked,
}: {
  date: string;
  headline: string;
  summary: string;
  scores: DailyFortuneScores;
  drivers: FortuneDriver[];
  riskTags: FortuneRiskTag[];
  locked?: boolean;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-[#0d0c18]/92 p-5 shadow-2xl shadow-black/25 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/56">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-amber-100" aria-hidden="true" />
              {date}
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-100" aria-hidden="true" />
              今日关键词
            </span>
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {headline}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">{summary}</p>
        </div>

        {locked && (
          <div className="w-fit rounded-lg border border-amber-200/22 bg-amber-200/[0.08] p-4 text-sm text-amber-100">
            <div className="flex items-center gap-2 font-semibold">
              <LockKeyhole className="h-4 w-4" aria-hidden="true" />
              Premium
            </div>
            <p className="mt-2 max-w-[220px] leading-6 text-amber-50/70">
              完整趋势与更多化解建议已锁定。
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <ScoreGrid scores={scores} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/46">
            Drivers
          </h2>
          <div className="mt-4 grid gap-3">
            {drivers.map((driver) => (
              <div key={driver.key} className="rounded-md border border-white/8 bg-black/16 p-4">
                <div className="text-sm font-semibold text-white">{driver.label}</div>
                <p className="mt-2 text-sm leading-6 text-white/58">{driver.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/46">
            Risk Tags
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {riskTags.length ? (
              riskTags.map((tag) => (
                <span
                  key={`${tag.dimension}-${tag.tag}`}
                  className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/62"
                >
                  {tag.dimension} / {tag.tag}
                </span>
              ))
            ) : (
              <span className="text-sm text-white/52">今天没有明显高压标签。</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
