import { ShieldCheck, Sparkles } from 'lucide-react';
import type { RemedyAction } from '@/types/daily-fortune';
import { FeedbackButtons } from '@/components/daily-fortune/FeedbackButtons';

const dimensionLabel: Record<RemedyAction['dimension'], string> = {
  love: '情感',
  career: '事业',
  wealth: '财富',
  health: '状态',
};

export function RemedyList({
  reportId,
  remedies,
  locked,
}: {
  reportId?: string;
  remedies: RemedyAction[];
  locked?: boolean;
}) {
  if (!remedies.length) {
    return (
      <section className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
        <div className="flex items-center gap-3 text-white">
          <ShieldCheck className="h-5 w-5 text-emerald-100" aria-hidden="true" />
          <h2 className="text-xl font-semibold">今日化解建议</h2>
        </div>
        <p className="mt-4 text-sm leading-6 text-white/58">今天先保持观察和节奏感。</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.045] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/75">
            Remedy
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-white">今日化解建议</h2>
        </div>
        {locked && (
          <span className="w-fit rounded-full border border-amber-200/24 bg-amber-200/[0.08] px-3 py-1 text-xs font-semibold text-amber-100">
            升级解锁更多建议
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-4">
        {remedies.map((remedy, index) => (
          <article
            key={remedy.id ?? `${remedy.dimension}-${remedy.title}-${index}`}
            className="rounded-lg border border-white/10 bg-[#0b0b17] p-5"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-100 text-[#17110a]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/54">
                    {dimensionLabel[remedy.dimension]}
                  </span>
                  <span className="text-xs text-white/38">{remedy.priority}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold leading-7 text-white">{remedy.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/68">{remedy.body}</p>
                <p className="mt-3 text-xs leading-6 text-white/46">{remedy.reason}</p>
                <FeedbackButtons reportId={reportId} actionId={remedy.id} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
