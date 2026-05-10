import type { Metadata } from 'next';
import Link from 'next/link';
import { Stars } from 'lucide-react';
import { DailyFortuneClient } from '@/components/daily-fortune/DailyFortuneClient';
import { isDailyFortuneEnabled } from '@/lib/daily-fortune/service';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '今日运势 | TianJi Global',
  description: '查看今日运势、分项分数与低风险化解建议。',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DailyFortunePage() {
  if (!isDailyFortuneEnabled()) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#07070d] px-5 text-white">
        <section className="w-full max-w-xl rounded-lg border border-white/10 bg-white/[0.045] p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-amber-200/30 bg-amber-100/10 text-amber-100">
            <Stars className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-6 font-serif text-4xl font-semibold">今日运势</h1>
          <p className="mt-4 text-base leading-7 text-white/62">功能即将开放。</p>
          <Link
            href="/"
            className="mt-7 inline-flex h-10 items-center rounded-full border border-white/12 bg-white/[0.08] px-4 text-sm font-semibold text-white/72 transition hover:border-amber-200/45 hover:text-amber-100"
          >
            返回首页
          </Link>
        </section>
      </main>
    );
  }

  return <DailyFortuneClient />;
}
