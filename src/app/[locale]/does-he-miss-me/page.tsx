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

  const title = 'Does He Miss Me?';
  const description =
    'Discover the emotional signs and timing patterns that reveal whether he is thinking about you. Get honest clarity on what the signals mean.';

  return buildLocalizedMetadata({
    locale,
    path: '/does-he-miss-me',
    title,
    description,
  });
}

export default async function DoesHeMissMePage({ params }: PageParams) {
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
            Does He Miss Me?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Discover the emotional signs and timing patterns that reveal whether he is thinking
            about you. This reading helps you read the quieter signals beneath surface behavior —
            so you can trust what is real rather than reading into what you hope to see.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8">
          <h2 className="text-xl font-semibold text-white">What this reading reveals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Emotional signals</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether there are signs of genuine longing or just ambivalence — and how to tell
                the difference before you act.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Behavioral patterns</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                How men typically show they miss someone versus when they are simply moving on —
                the difference is in the pattern, not the words.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Will he reach out?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The likelihood and timing of contact — so you know whether to expect a message,
                a call, or continued silence.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Next move clarity</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                One practical next step that matches the actual pattern — whether that is
                reaching out, waiting, or focusing on your own healing.
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
              <h3 className="font-semibold text-white">How do guys show they miss you?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Men often show they miss someone through actions rather than words — reaching out
                unexpectedly, keeping communication open, or staying connected on social media.
                This reading helps you identify the specific signals in your situation.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Will he reach out?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether he will reach out depends on the emotional pattern and timing. This
                reading gives you clarity on the current window so you know what to realistically
                expect.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Is he just busy or not interested?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                It is hard to tell the difference between genuine busyness and polite disinterest.
                This reading helps you read the actual pattern so you are not misinterpreting
                silence or reading into selective contact.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">What should I do if he has gone quiet?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Quiet can mean many things. This reading gives you the emotional truth about what
                his silence likely means — and what the healthiest next move is for you.
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
