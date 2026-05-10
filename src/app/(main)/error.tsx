'use client';

/**
 * Route-group error boundary for (main).
 *
 * Catches uncaught errors thrown from any module page (BaZi, Zi Wei, Yi Jing,
 * Tarot, Western astrology, Synastry, etc.) and renders a calm, on-brand
 * fallback that keeps the user inside the app rather than dropping them on
 * Next.js's default error screen.
 *
 * Next.js requires this file to be a client component because it receives
 * a `reset` callback (a function reference cannot cross the server/client
 * boundary).
 */

import { useEffect } from 'react';
import Link from 'next/link';

interface MainErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MainError({ error, reset }: MainErrorProps) {
  useEffect(() => {
    // Surface the error to the browser console for local debugging. In
    // production this also feeds whichever error-reporting hook the
    // host page is wired to.
    console.error('[(main) route boundary]', error);
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(124,58,237,0.18), transparent 55%), radial-gradient(circle at 50% 80%, rgba(217,119,6,0.10), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="text-[10px] uppercase tracking-[0.4em] text-white/40">
        TianJi · 天机
      </div>

      <h1 className="mt-6 max-w-xl text-2xl font-semibold leading-snug text-white/85 sm:text-3xl">
        The reading paused — but the path is still here.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-white/55">
        Something on this page hit an unexpected state. You can try again, or
        return to the home gate and choose a different tradition.
        <br />
        <span className="text-white/40">
          这个页面暂时没有完成，可以重试，也可以回到首页换一条路径。
        </span>
      </p>

      {error?.digest && (
        <p className="mt-4 text-[11px] uppercase tracking-[0.28em] text-white/30">
          Error ref · {error.digest}
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-2xl border border-white/[0.12] bg-white/[0.06] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/85 transition-all hover:border-white/[0.24] hover:bg-white/[0.10]"
        >
          Try again · 重试
        </button>
        <Link
          href="/"
          className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.08] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/85 transition-all hover:border-amber-300/50 hover:bg-amber-300/[0.14]"
        >
          Return home · 回到首页
        </Link>
      </div>
    </div>
  );
}
