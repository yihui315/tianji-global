'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Lock, Sparkles } from 'lucide-react';

interface LoveReadingPayload {
  id: string;
  language: 'en' | 'zh';
  mode: 'solo' | 'relationship';
  teaser: string;
  price: string;
  unlocked: boolean;
  fullReport?: string;
  emailRecoveryReady?: boolean;
}

const copy = {
  en: {
    back: 'Back to Tianji Love',
    eyebrow: 'LOVE READING',
    title: 'Your first love insight is ready.',
    teaser: 'Free teaser',
    full: 'Complete report',
    lockedTitle: 'Unlock the full reading',
    lockedBody:
      'Continue into attraction patterns, communication blind spots, relationship timing, and a practical reflection exercise. One-time payment. No subscription.',
    unlock: 'Unlock full report',
    unlocking: 'Opening checkout...',
    unavailable: 'Paid unlock is not available yet. The free teaser remains available.',
    missing: 'This love reading session was not found or has expired.',
    selfReflection: 'For self-reflection and relationship communication only. No deterministic predictions.',
  },
  zh: {
    back: '返回 Tianji Love',
    eyebrow: '爱情洞察',
    title: '你的第一份爱情洞察已经生成。',
    teaser: '免费预览',
    full: '完整报告',
    lockedTitle: '解锁完整爱情报告',
    lockedBody: '继续查看吸引模式、沟通盲点、关系节奏和一个可执行的反思练习。一次性付款，无订阅。',
    unlock: '解锁完整报告',
    unlocking: '正在打开结账...',
    unavailable: '付费解锁暂未开放。免费预览仍可查看。',
    missing: '这份爱情洞察不存在或已经过期。',
    selfReflection: '仅用于自我理解与关系沟通，不提供确定性预测。',
  },
} as const;

function paragraphs(text: string) {
  return text.split(/\n{2,}/).filter(Boolean);
}

export default function LoveReadingResultClient() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') === 'zh' ? 'zh' : 'en';
  const checkoutSessionId = searchParams.get('session_id');
  const [reading, setReading] = useState<LoveReadingPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const text = copy[reading?.language ?? lang];

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ id: params.id });
    if (checkoutSessionId) {
      query.set('session_id', checkoutSessionId);
    }

    async function load() {
      setLoading(true);
      setNotice(null);
      try {
        const response = await fetch(`/api/love-reading/session?${query.toString()}`);
        const json = await response.json();
        if (!active) return;

        if (!response.ok) {
          setReading(null);
          setNotice(json.error ?? copy[lang].missing);
          return;
        }

        setReading(json as LoveReadingPayload);
      } catch {
        if (active) {
          setNotice(copy[lang].missing);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [checkoutSessionId, lang, params.id]);

  const teaserParagraphs = useMemo(() => paragraphs(reading?.teaser ?? ''), [reading?.teaser]);
  const fullParagraphs = useMemo(() => paragraphs(reading?.fullReport ?? ''), [reading?.fullReport]);

  async function startCheckout() {
    if (!reading) return;

    setCheckoutLoading(true);
    setNotice(null);
    try {
      const response = await fetch('/api/love-reading/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout',
          id: reading.id,
          language: reading.language,
        }),
      });
      const json = await response.json();

      if (!response.ok || !json.url) {
        setNotice(json.error ?? text.unavailable);
        return;
      }

      window.location.href = json.url;
    } catch {
      setNotice(text.unavailable);
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(255,144,126,0.2),transparent_32%),linear-gradient(135deg,#08040b,#111827_58%,#040712)] px-5 py-8 text-[#f9e2ba] sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-5 border-b border-[#d8b77b]/20 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href={`/?lang=${lang}`} className="text-sm font-semibold text-[#d8b77b] transition hover:text-[#ffe4b7]">
              {text.back}
            </Link>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.34em] text-[#d8b77b]/78">{text.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight text-[#ffe4b7] sm:text-5xl">
              {text.title}
            </h1>
          </div>
          <div className="rounded-lg border border-[#d8b77b]/25 bg-black/24 px-4 py-3 text-sm text-[#f4d7a3]/76">
            {text.selfReflection}
          </div>
        </header>

        {loading ? (
          <section className="rounded-lg border border-[#d8b77b]/22 bg-[#070b16]/80 p-8">
            <p className="text-[#f4d7a3]/76">Loading...</p>
          </section>
        ) : reading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <section className="rounded-lg border border-[#d8b77b]/26 bg-[#070b16]/82 p-6 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d8b77b]/78">
                {reading.unlocked ? text.full : text.teaser}
              </p>
              <div className="mt-5 space-y-5 text-base leading-8 text-[#f7dfb8]/86">
                {(reading.unlocked ? fullParagraphs : teaserParagraphs).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <aside className="rounded-lg border border-[#d8b77b]/26 bg-black/30 p-6">
              {reading.unlocked ? (
                <div className="space-y-4">
                  <Sparkles className="h-7 w-7 text-[#ff9b8e]" aria-hidden />
                  <h2 className="text-2xl font-semibold text-[#ffe4b7]">{text.full}</h2>
                  <p className="text-sm leading-6 text-[#f4d7a3]/76">{text.selfReflection}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <Lock className="h-7 w-7 text-[#ff9b8e]" aria-hidden />
                  <div>
                    <h2 className="text-2xl font-semibold text-[#ffe4b7]">{text.lockedTitle}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#f4d7a3]/76">{text.lockedBody}</p>
                  </div>
                  <button
                    type="button"
                    onClick={startCheckout}
                    disabled={checkoutLoading}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-[#ffb49e]/60 bg-[#9d343f] px-5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(255,92,99,0.22)] transition hover:bg-[#b8404a] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {checkoutLoading ? text.unlocking : `${text.unlock} ${reading.price}`}
                  </button>
                </div>
              )}
              {notice ? (
                <p className="mt-5 rounded-md border border-[#ffb49e]/20 bg-[#48151b]/50 px-3 py-2 text-sm text-[#ffd7c9]">
                  {notice}
                </p>
              ) : null}
            </aside>
          </div>
        ) : (
          <section className="rounded-lg border border-[#d8b77b]/22 bg-[#070b16]/80 p-8 text-center">
            <p className="text-[#f4d7a3]/76">{notice ?? text.missing}</p>
          </section>
        )}
      </div>
    </main>
  );
}
