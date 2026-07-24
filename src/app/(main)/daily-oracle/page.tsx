'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Copy, Heart, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';

import {
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveShell,
  TianjiLoveTrustCard,
  getTianjiLoveFooterNav,
  getTianjiLovePrimaryNav,
} from '@/components/tianji-love';
import { trackRevenueFunnelEvent } from '@/lib/analytics/funnel-events';
import {
  DAILY_LOVE_ORACLE_MOODS,
  computeDailyLoveOracle,
  getDailyLoveOracleShareText,
  getLocalDateKey,
  type DailyLoveOracleMood,
} from '@/lib/daily-oracle';
import { withLanguageParam } from '@/lib/language-routing';
import { buildUtmHref } from '@/lib/analytics/utm-params';

const LOVE_TEST_HREF = buildUtmHref('/love-test?source=daily_oracle', {
  source: 'daily_oracle',
});
const LOVE_READING_HREF = buildUtmHref('/relationship/new?source=daily_oracle', {
  source: 'daily_oracle',
});

function href(path: string) {
  return withLanguageParam(path, 'en');
}

export default function DailyOraclePage() {
  const [selectedMood, setSelectedMood] = useState<DailyLoveOracleMood>('missing_them');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const dateKey = useMemo(() => getLocalDateKey(), []);
  const result = useMemo(
    () => computeDailyLoveOracle({ dateKey, mood: selectedMood }),
    [dateKey, selectedMood]
  );

  useEffect(() => {
    void trackRevenueFunnelEvent('growth_daily_oracle_view', {
      surface: 'daily_oracle_page',
      source: 'direct',
    });
  }, []);

  const drawOracle = () => {
    setHasDrawn(true);
    setCopyState('idle');
    void trackRevenueFunnelEvent('growth_daily_oracle_draw', {
      surface: 'daily_oracle_page',
      mood: selectedMood,
      date_key: dateKey,
      result_id: result.id,
    });
  };

  const copyOracle = async () => {
    if (!hasDrawn) return;

    try {
      const shareUrl = `${window.location.origin}${href('/daily-oracle')}`;
      await navigator.clipboard.writeText(getDailyLoveOracleShareText(result, shareUrl));
      setCopyState('copied');
      void trackRevenueFunnelEvent('growth_daily_oracle_share_click', {
        surface: 'daily_oracle_page',
        result_id: result.id,
        mood: selectedMood,
      });
    } catch {
      setCopyState('error');
    }
  };

  const trackConversionClick = (event: 'growth_daily_oracle_love_test_click' | 'growth_daily_oracle_love_reading_click') => {
    void trackRevenueFunnelEvent(event, {
      surface: 'daily_oracle_result',
      result_id: result.id,
      mood: selectedMood,
    });
  };

  return (
    <TianjiLoveShell ariaLabel="Daily Love Oracle" className="daily-oracle-page">
      <TianjiLoveHeader
        homeHref={href('/')}
        navItems={getTianjiLovePrimaryNav('en', href)}
        cta={{ label: 'Free Fate Test', href: href('/love-test') }}
      />

      <section className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pb-10 pt-14 sm:px-8 lg:min-h-[650px] lg:grid-cols-[minmax(0,0.92fr)_minmax(390px,0.78fr)] lg:items-center">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b77b]/70">
            Daily Love Oracle / 今日天机每日签
          </p>
          <h1 className="font-serif text-5xl font-semibold leading-[0.96] text-[#ffe3b4] sm:text-7xl">
            今日天机
            <span className="mt-3 block text-[#ff9c8b]">每天一支关系灵感签</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#f4d7a3]/78">
            选择今天的关系状态，抽一条适合复盘、表达和行动的小提示。它不会保证结果，也不会替你做决定。
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4d7a3]/70">
            {['No login', 'No AI call', 'No database', 'No payment path'].map((item) => (
              <span key={item} className="rounded-full border border-[#d8b77b]/24 bg-black/18 px-3 py-2">
                {item}
              </span>
            ))}
          </div>
        </div>

        <TianjiLovePanel className="p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">Choose today&apos;s relationship mood</p>
          <div className="mt-5 grid gap-3">
            {DAILY_LOVE_ORACLE_MOODS.map((mood) => {
              const active = selectedMood === mood.value;

              return (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => {
                    setSelectedMood(mood.value);
                    setHasDrawn(false);
                    setCopyState('idle');
                  }}
                  aria-pressed={active}
                  className="rounded-lg border border-[#b57248]/28 bg-black/18 p-4 text-left transition hover:border-[#ffe3b4]/46 aria-pressed:border-[#ff9c8b]/70 aria-pressed:bg-[#ff7c82]/12"
                >
                  <span className="block font-serif text-xl font-semibold text-[#ffe3b4]">{mood.label}</span>
                  <span className="mt-2 block text-sm leading-6 text-[#f4d7a3]/64">{mood.helper}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={drawOracle}
            className="tianji-love-primary mt-6 inline-flex min-h-14 w-full items-center justify-center rounded-lg border border-[#ffb49e]/60 px-6 text-base font-semibold text-[#fff7e6]"
          >
            抽今日签
            <Sparkles className="ml-3 h-4 w-4" aria-hidden />
          </button>
        </TianjiLovePanel>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8">
        <TianjiLovePanel className="p-6 sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/62">Your deterministic daily result</p>
              <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
                {hasDrawn ? result.keyword : '先选择状态，再抽今日签'}
              </h2>
              <p className="mt-4 text-base leading-8 text-[#f4d7a3]/76">
                {hasDrawn
                  ? result.oneLiner
                  : '结果只由本地日期和你选择的关系状态决定，不读取账号、出生信息或任何私密输入。'}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <TianjiLoveTrustCard
                  icon={ShieldCheck}
                  title="Reflection only"
                  body="今日签用于自我理解和关系沟通，不承诺结果，不提供医疗、法律或财务建议。"
                />
                <TianjiLoveTrustCard
                  icon={Heart}
                  title="Privacy-safe share"
                  body="分享文本只包含关键词、提示和页面链接，不包含姓名、生日、问题或聊天内容。"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { label: '今日关键词', value: hasDrawn ? result.keyword : '等待抽签' },
                { label: '今日关系提示', value: hasDrawn ? result.relationshipHint : '选择一个状态后抽签，今天的提示会出现在这里。' },
                { label: '今日适合做的事', value: hasDrawn ? result.doToday : '先把今天真正想解决的关系问题说清楚。' },
                { label: '今日不建议做的事', value: hasDrawn ? result.avoidToday : '不要把情绪最高点当作最终答案。' },
              ].map((item) => (
                <article key={item.label} className="rounded-lg border border-[#b57248]/24 bg-black/18 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#d8b77b]/62">{item.label}</p>
                  <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/78">{item.value}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={href(LOVE_TEST_HREF)}
              onClick={() => trackConversionClick('growth_daily_oracle_love_test_click')}
              className="tianji-love-primary inline-flex min-h-12 items-center justify-center rounded-lg border border-[#ffb49e]/60 px-5 text-sm font-semibold text-[#fff7e6]"
            >
              去做 Free Fate Match Test
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={href(LOVE_READING_HREF)}
              onClick={() => trackConversionClick('growth_daily_oracle_love_reading_click')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#d8b77b]/30 bg-black/24 px-5 text-sm font-semibold text-[#f4d7a3]/78"
            >
              打开 Love Reading 完整关系流
              <Heart className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={copyOracle}
              disabled={!hasDrawn}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#b57248]/32 bg-black/24 px-5 text-sm font-semibold text-[#f4d7a3]/74 transition disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Copy className="h-4 w-4" aria-hidden />
              复制今日签
            </button>
            <button
              type="button"
              onClick={() => {
                setHasDrawn(false);
                setCopyState('idle');
              }}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#b57248]/32 bg-black/24 px-5 text-sm font-semibold text-[#f4d7a3]/74"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              重新选择状态
            </button>
          </div>
          <p className="mt-4 text-sm text-[#f4d7a3]/62" aria-live="polite">
            {copyState === 'copied'
              ? '已复制隐私安全分享文本。'
              : copyState === 'error'
                ? '复制失败，请手动复制页面内容。'
                : '分享文本不会包含姓名、生日、问题、聊天内容或支付信息。'}
          </p>
        </TianjiLovePanel>
      </section>

      <TianjiLoveFooter
        homeHref={href('/')}
        links={getTianjiLoveFooterNav('en', href)}
        disclaimer="Tianji Love readings are reflective relationship guidance, not certainty, medical, legal, or financial advice."
      />
    </TianjiLoveShell>
  );
}
