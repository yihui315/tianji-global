'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw, Stars } from 'lucide-react';
import type {
  DailyFortuneScores,
  FortuneDriver,
  FortuneRiskTag,
  RemedyAction,
} from '@/types/daily-fortune';
import { DailyFortuneCard } from '@/components/daily-fortune/DailyFortuneCard';
import { RemedyList } from '@/components/daily-fortune/RemedyList';

interface TodayFortunePayload {
  reportId?: string;
  date: string;
  scores: DailyFortuneScores;
  headline: string;
  summary: string;
  drivers: FortuneDriver[];
  riskTags: FortuneRiskTag[];
  remedies: RemedyAction[];
  disclaimer: string;
  locked?: {
    drivers?: boolean;
    remedies?: boolean;
    sections?: boolean;
    reason: 'premium_required';
  };
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'empty' }
  | { status: 'ready'; report: TodayFortunePayload };

export function DailyFortuneClient() {
  const [state, setState] = useState<LoadState>({ status: 'loading' });

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const loadReport = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const response = await fetch(`/api/daily-fortune/today?systemType=bazi&date=${today}`, {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (response.status === 401) {
        setState({ status: 'error', message: '请先登录后查看今日运势。' });
        return;
      }
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.error?.message || '今日运势暂时不可用。');
      }
      if (!payload.data) {
        setState({ status: 'empty' });
        return;
      }

      setState({ status: 'ready', report: payload.data });
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : '今日运势暂时不可用。',
      });
    }
  }, [today]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070d] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_10%,rgba(251,191,36,0.14),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(45,212,191,0.12),transparent_28%),linear-gradient(180deg,#07070d_0%,#10101a_48%,#08080f_100%)]" />

      <header className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="inline-flex items-center gap-3 text-white/78">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-amber-200/28 bg-amber-100/10 text-amber-100">
            <Stars className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-[0.22em]">Tianji</span>
        </Link>
        <Link
          href="/pricing"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 text-sm font-semibold text-white/74 transition hover:border-amber-200/45 hover:text-amber-100"
        >
          解锁本周深度趋势
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="mx-auto mt-10 max-w-7xl space-y-6 sm:mt-14">
        {state.status === 'loading' && <LoadingPanel />}
        {state.status === 'empty' && (
          <StatePanel
            title="今天还没有报告"
            body="稍后再试一次，系统会在可用时生成今日运势。"
            onRetry={loadReport}
          />
        )}
        {state.status === 'error' && (
          <StatePanel title="暂时无法查看今日运势" body={state.message} onRetry={loadReport} />
        )}
        {state.status === 'ready' && (
          <>
            <DailyFortuneCard
              date={state.report.date}
              headline={state.report.headline}
              summary={state.report.summary}
              scores={state.report.scores}
              drivers={state.report.drivers}
              riskTags={state.report.riskTags}
              locked={Boolean(state.report.locked)}
            />
            <RemedyList
              reportId={state.report.reportId}
              remedies={state.report.remedies}
              locked={Boolean(state.report.locked?.remedies)}
            />
            <p className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-xs leading-6 text-white/46">
              {state.report.disclaimer}
            </p>
          </>
        )}
      </div>
    </main>
  );
}

function LoadingPanel() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
      <div className="h-5 w-32 rounded-full bg-white/10" />
      <div className="mt-6 h-10 max-w-lg rounded-full bg-white/10" />
      <div className="mt-4 h-4 max-w-2xl rounded-full bg-white/8" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-32 rounded-lg border border-white/8 bg-white/[0.035]" />
        ))}
      </div>
    </div>
  );
}

function StatePanel({
  title,
  body,
  onRetry,
}: {
  title: string;
  body: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
      <h1 className="font-serif text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">{body}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-4 text-sm font-semibold text-white/72 transition hover:border-amber-200/45 hover:text-amber-100"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        重新加载
      </button>
    </div>
  );
}
