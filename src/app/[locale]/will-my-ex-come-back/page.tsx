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

  const title = 'Will My Ex Come Back?';
  const description =
    'Understand the patterns, timing windows, and real signs that indicate whether reconciliation is possible. Get honest guidance on what comes next.';

  return buildLocalizedMetadata({
    locale,
    path: '/will-my-ex-come-back',
    title,
    description,
  });
}

export default async function WillMyExComeBackPage({ params }: PageParams) {
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
            Will My Ex Come Back?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Understand the patterns, timing windows, and real signs that indicate whether
            reconciliation is possible. This reading helps you read the current moment honestly —
            so you can act with intention rather than reacting from hope or fear.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8">
          <h2 className="text-xl font-semibold text-white">What this reading reveals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Reconciliation signals</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether there are real signs of return — not assumptions, but actual emotional
                and behavioral patterns that suggest a window may exist.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Timing window</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The current window for reconciliation — whether this is a moment for action,
                patience, or focusing on your own growth first.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">What to do next</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                One practical step aligned with the actual signals — not a generic suggestion but
                something specific to your situation.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Honest perspective</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Reading the relationship archetype at play — so you understand the deeper pattern
                and can make decisions from clarity rather than wishful thinking.
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
              <h3 className="font-semibold text-white">Will my ex reach out?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether there are signals of return depends on the emotional pattern between you.
                This reading maps those signals so you know what to actually expect — and what to
                do in the meantime.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Should I wait for my ex?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Waiting without clarity can keep you stuck. This reading gives you an honest
                reading of the timing window so you know whether waiting serves you or whether
                focusing on yourself is the better move.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">How can I manifest my ex coming back?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Manifestation works best when it aligns with the actual relationship pattern. This
                reading helps you understand what is realistic — and what practical action you
                can take that matches the current window.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">What if there is someone else?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Uncertainty about a new person in your ex&apos;s life is common. This reading gives
                you the emotional truth about the current situation so you can respond from
                clarity rather than jealousy or fear.
              </p>
            </article>
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
          <div className="mt-5 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#f5d8aa]">How accurate is this reading?</h3>
              <p className="mt-1 text-sm text-white/60">
                Our AI combines astrology, human design, and relationship psychology to provide personalized insights. Many users find the patterns and timing descriptions remarkably accurate for their situation.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#f5d8aa]">Is my information kept private?</h3>
              <p className="mt-1 text-sm text-white/60">
                Yes. Your birth data and relationship details are never shared with third parties. All readings are private and encrypted.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#f5d8aa]">Can I get a full report instead of just this preview?</h3>
              <p className="mt-1 text-sm text-white/60">
                Yes. Unlock the full Deep Love Report for $19.99 — with 8 complete modules covering your relationship energy, partner feelings, blockages, timing, and next steps.
              </p>
            </div>
          </div>
        </section>
        <section className="mt-10 rounded-xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold text-white">Explore more</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={getLocalizedPath(locale, '/does-my-ex-still-love-me')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Does My Ex Still Love Me?
            </Link>
            <Link
              href={getLocalizedPath(locale, '/should-i-move-on')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Should I Move On?
            </Link>
            <Link
              href={getLocalizedPath(locale, '/should-i-text-my-ex')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Should I Text My Ex?
            </Link>
            <Link
              href={getLocalizedPath(locale, '/how-to-make-my-ex-miss-me')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              How to Make My Ex Miss Me
            </Link>
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
