import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';

type PageParams = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const title = 'Should I Text My Ex?';
  const description =
    'Get clarity on whether texting your ex is the right move right now, and what to say if you do. Know the signals before you act.';

  return buildLocalizedMetadata({
    locale,
    path: '/should-i-text-my-ex',
    title,
    description,
  });
}

export default async function ShouldITextMyExPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  return (
    <main className="min-h-screen bg-[#050508] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={getLocalizedPath(locale, '/')}
          className="text-sm text-white/58 hover:text-white"
        >
          TianJi Love
        </Link>

        <section className="py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-100/70">
            Love Reading
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-6xl">
            Should I Text My Ex?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Get clarity on whether texting your ex is the right move right now — and what to say
            if you do. This reading helps you read the current window before you act, so you
            make the move from clarity instead of impulse.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8">
          <h2 className="text-xl font-semibold text-white">What this reading reveals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Is texting the right move?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether the current window supports reaching out — or whether waiting serves you
                better in the long run.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">What to say</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                If texting is the right move, this reading gives you guidance on tone and content
                that matches the current emotional pattern.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">What to expect</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The likely response pattern if you do reach out — so you are not caught off guard
                by silence or an unexpected reply.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">No-contact clarity</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                If no contact is the healthier choice right now, this reading helps you
                understand why — and how to hold that boundary with peace.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href={getLocalizedPath(locale, '/ask')}
            className="flex items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-semibold text-black hover:bg-white/90"
          >
            Check Your Love Signals for Free
          </Link>
          <Link
            href={getLocalizedPath(locale, '/ask')}
            className="flex items-center justify-center rounded-full bg-[rgb(212,175,119)] px-6 py-4 text-sm font-semibold text-black hover:bg-[rgb(212,175,119)]/90"
          >
            Ask One Private Love Question — $1.99
          </Link>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-white">Frequently asked questions</h2>
          <div className="mt-6 space-y-4">
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Will they respond if I text?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Response likelihood depends on the emotional pattern and timing. This reading
                helps you understand what to expect so you can text from a place of calm
                readiness rather than anxiety.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Should I wait longer before reaching out?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Timing matters. If the window is not right, reaching out too early can close it.
                This reading helps you know whether now is the time or whether patience is the
                better path.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">What should I actually say?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The right message depends on the situation. This reading gives you practical
                guidance on tone and content that aligns with the current relationship pattern —
                no generic scripts.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Is no contact better?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Sometimes no contact is the move that actually creates the space for reconnection.
                This reading helps you understand whether no contact serves you — or whether a
                well-timed message is the better path.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Explore more</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={getLocalizedPath(locale, '/pricing')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              View pricing
            </Link>
            <Link
              href={getLocalizedPath(locale, '/relationship/new')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Start relationship reading
            </Link>
          </div>
        </section>

        <p className="mt-10 text-sm leading-6 text-white/45">
          This reading is for self-reflection and relationship guidance only. It does not make
          deterministic claims and is not a substitute for medical, legal, or professional advice.
        </p>
      </div>
    </main>
  );
}
