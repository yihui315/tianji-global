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

  const title = 'Does My Ex Still Love Me?';
  const description =
    'Explore the signs, timing, and emotional truth about whether your ex still has feelings for you. Get clarity on what your heart needs to hear.';

  return buildLocalizedMetadata({
    locale,
    path: '/does-my-ex-still-love-me',
    title,
    description,
  });
}

export default async function DoesMyExStillLoveMePage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  return (
    <main className="min-h-screen bg-[#1C1533] px-5 py-10 text-white sm:px-8">
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
            Does My Ex Still Love Me?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Explore the signs, timing, and emotional truth about whether your ex still has
            feelings for you. This reading helps you access the quieter signals beneath the
            silence — so you can make your next move from clarity rather than hope.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8">
          <h2 className="text-xl font-semibold text-white">What this reading reveals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Emotional truth</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether lingering feelings remain and what form they take — longing, regret,
                unfinished business, or genuine connection.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Timing window</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The current relationship window — whether this is a moment for reconciliation,
                reflection, or releasing the connection with peace.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Practical guidance</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                One honest next step you can take today that aligns with the actual signals —
                not assumptions or wishful thinking.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Pattern awareness</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The relational archetype at work — so you understand the deeper structure rather
                than just the surface story.
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
              <h3 className="font-semibold text-white">How do I know if my ex still loves me?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                There are emotional signals and behavioral patterns that reveal whether lingering
                feelings remain. This reading maps those signals and gives you an honest reading of
                what they mean.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Can I get my ex back?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Getting back together depends on timing, emotional readiness, and what each person
                needs. This reading helps you understand the real window — not a fantasy or a fear.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">How long does it take for an ex to come back?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Timing varies by individual and situation. Instead of guessing, this reading gives
                you a reading of the current window so you know whether to wait, reach out, or
                move forward.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Is it worth waiting for my ex?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Waiting without clarity can keep you stuck. This reading gives you the emotional
                truth so you can make a decision from a place of self-respect rather than anxiety.
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
