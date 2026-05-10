'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Disclaimer from '@/components/trust/Disclaimer';

type RequestKind = 'export' | 'deletion';

const endpoints: Record<RequestKind, string> = {
  export: '/api/privacy/export-request',
  deletion: '/api/privacy/deletion-request',
};

export default function PrivacyCenterPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function submitRequest(event: FormEvent<HTMLFormElement>, kind: RequestKind) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus('Submitting request...');

    const response = await fetch(endpoints[kind], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: String(form.get('email') ?? ''),
        details: String(form.get('details') ?? ''),
        locale: 'en',
      }),
    });

    setStatus(response.ok ? 'Request received. We will follow up by email.' : 'Please check the email field and try again.');
    if (response.ok) {
      event.currentTarget.reset();
    }
  }

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between text-sm text-white/58">
          <Link href="/" className="hover:text-white">
            TianJi Global
          </Link>
          <Link href="/legal/privacy" className="hover:text-white">
            Privacy policy
          </Link>
        </nav>

        <section className="py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[rgb(252,230,191)]">Privacy center</p>
          <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-tight sm:text-6xl">
            Control your TianJi data without exposing private birth context.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/68">
            Request an export, ask for deletion, or review how relationship readings stay bounded as reflective guidance.
          </p>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Disclaimer />

          <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-6">
            <h2 className="text-2xl font-semibold">Privacy requests</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              We only need your email to verify and process the request. Do not include birth time, birth place, or
              relationship answers in the note.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <form className="space-y-3" onSubmit={(event) => submitRequest(event, 'export')}>
                <h3 className="font-semibold">Data export request</h3>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[rgb(212,175,119)]"
                />
                <textarea
                  name="details"
                  placeholder="Optional context"
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[rgb(212,175,119)]"
                />
                <button type="submit" className="rounded-full bg-[rgb(212,175,119)] px-5 py-3 text-sm font-semibold text-black">
                  Request export
                </button>
              </form>

              <form className="space-y-3" onSubmit={(event) => submitRequest(event, 'deletion')}>
                <h3 className="font-semibold">Data deletion request</h3>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[rgb(212,175,119)]"
                />
                <textarea
                  name="details"
                  placeholder="Optional context"
                  className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[rgb(212,175,119)]"
                />
                <button type="submit" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
                  Request deletion
                </button>
              </form>
            </div>

            <p className="mt-5 text-sm text-white/58" aria-live="polite">
              {status}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
