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

  const title = "Is My Ex Thinking About Me?";
  const description =
    "Discover the signs that your ex may still be thinking about you, from behavior patterns to timing coincidences.";

  return buildLocalizedMetadata({
    locale,
    path: '/is-my-ex-thinking-about-me',
    title,
    description,
  });
}

export default async function IsMyExThinkingAboutMePage({ params }: PageParams) {
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
            Is My Ex Thinking About Me?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            When a relationship ends but the connection lingers in your mind, it is natural to
            wonder whether they are thinking about you too. Sometimes the silence feels like
            indifference — other times it feels like they are just as caught in the same
            thought patterns. This reading helps you read the signs that may indicate whether
            your ex still has you on their mind, and what those signals actually mean for where
            things are heading.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8">
          <h2 className="text-xl font-semibold text-white">What this reading reveals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Behavioral signals</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The patterns in their actions — reach-outs, social media activity, mutual
                connections — that may indicate they are still thinking about you.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Timing coincidences</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether the timing of events — them appearing where you are, responding at unusual
                hours, reaching out on significant dates — suggests intention or randomness.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Connection residue</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                What the emotional texture of their presence — if any remains — suggests about
                unfinished business, regret, or genuine ongoing connection.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">What to actually do</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                One honest next step based on what the signals actually suggest — not what you
                hope they mean.
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
              <h3 className="font-semibold text-white">Does my ex think about me?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Most people do think about their exes to some degree, especially after a
                significant relationship. What matters is not whether they think about you, but
                what form that thinking takes — longing, regret, neutrality, or indifference.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Will they reach out?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Reach-out probability depends on the individual, the nature of the breakup, and
                what each person has processed since. This reading helps you assess the likelihood
                based on observable patterns rather than hope.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Is there still a connection?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Emotional connection does not disappear the moment a relationship ends. This
                reading helps you assess whether what you are sensing is a genuine residual
                connection or a projection of your own longing.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">How do I stop hoping?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Hoping that an ex will come back is not inherently wrong — but hoping without
                clarity keeps you in a holding pattern. Getting honest about what the signals
                actually show is the first step toward either peace or genuine reconnection.
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
              href={getLocalizedPath(locale, '/will-my-ex-come-back')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Will My Ex Come Back?
            </Link>
            <Link
              href={getLocalizedPath(locale, '/should-i-move-on')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Should I Move On?
            </Link>
            <Link
              href={getLocalizedPath(locale, '/how-to-get-over-my-ex')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              How to Get Over My Ex
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
        <LoveComplianceFooter language={lang} className="mt-6" />
      </div>
    </main>
  );
}