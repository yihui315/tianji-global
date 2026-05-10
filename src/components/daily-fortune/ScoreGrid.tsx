import { Activity, BriefcaseBusiness, Heart, PiggyBank, Sparkles } from 'lucide-react';
import type { DailyFortuneScores, FortuneDimension } from '@/types/daily-fortune';

const scoreItems: Array<{
  key: keyof DailyFortuneScores;
  label: string;
  dimension?: FortuneDimension;
  Icon: typeof Sparkles;
}> = [
  { key: 'overall', label: '总分', Icon: Sparkles },
  { key: 'love', label: '情感', dimension: 'love', Icon: Heart },
  { key: 'career', label: '事业', dimension: 'career', Icon: BriefcaseBusiness },
  { key: 'wealth', label: '财富', dimension: 'wealth', Icon: PiggyBank },
  { key: 'health', label: '状态', dimension: 'health', Icon: Activity },
];

function toneForScore(score: number): string {
  if (score >= 78) return 'text-emerald-100 border-emerald-200/24 bg-emerald-200/[0.08]';
  if (score >= 62) return 'text-amber-100 border-amber-200/24 bg-amber-200/[0.08]';
  return 'text-rose-100 border-rose-200/24 bg-rose-200/[0.08]';
}

export function ScoreGrid({ scores }: { scores: DailyFortuneScores }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="今日分数">
      {scoreItems.map(({ key, label, Icon }) => {
        const score = scores[key];

        return (
          <div
            key={key}
            className={`min-h-[128px] rounded-lg border p-4 ${toneForScore(score)}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-white/68">{label}</span>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="mt-5 flex items-end gap-1">
              <span className="font-serif text-4xl font-semibold leading-none text-white">
                {score}
              </span>
              <span className="pb-1 text-xs text-white/45">/100</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
