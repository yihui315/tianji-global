import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';
import { LoveComplianceFooter } from '@/components/love-reading/LoveComplianceFooter';

type PageParams = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) return {};

  const title = 'Should I Move On?';
  const description =
    'Get clarity on whether to keep waiting, let go completely, or give the relationship one more chance.';

  return buildLocalizedMetadata({
    locale,
    path: '/should-i-move-on',
    title,
    description,
  });
}

export default async function ShouldIMoveOnPage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const lang = locale as 'en' | 'zh';

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
            Should I Move On?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            The hardest part of any breakup is not the end itself — it is the uncertainty after.
            Do you wait in case they come back? Do you let go completely? Do you give things one
            more chance, or is that just avoidance dressed up as hope? This reading helps you
            cut through the rumination and get honest about where things actually stand — so you
            can make a decision from clarity rather than fear or wishful thinking.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8">
          <h2 className="text-xl font-semibold text-white">What this reading reveals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">The actual state</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Where the relationship actually is — not where you want it to be. Whether there is
                a genuine window still open or whether the door has closed.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Wait or release</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether waiting serves you or keeps you stuck — and whether releasing the
                connection is an act of self-respect rather than giving up.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">One more chance</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether a second attempt is a genuine opportunity or a repeat of the same
                patterns that ended things the first time.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Honest next move</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The one action that aligns with the actual truth of your situation — whether that
                is patience, distance, a honest conversation, or complete release.
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
              <h3 className="font-semibold text-white">Should I move on or wait?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The answer depends on what you are waiting for. If you are waiting for a clear
                signal from them, you may be waiting indefinitely. If there is a genuine reason
                to believe something could change, patience may be warranted. This reading helps
                you distinguish between the two.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">How do I know if it is over?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The relationship is likely over when communication has stopped, there has been
                no effort to reconnect despite time passing, and both people seem to be moving in
                separate directions without looking back.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">What if they change?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                People can change — but the question is whether they are changing for themselves
                or just performing change to get you back. This reading helps you assess whether
                the change you are seeing is real or a temporary strategy.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">How do I let go?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Letting go is not about suppressing the feelings — it is about accepting that the
                relationship as it was is over and choosing to move toward what comes next. It is
                an active decision, not a passive surrender.
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
        <LoveComplianceFooter language={lang} className="mt-6" />
      </div>
    </main>
  );
}