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

  const title = 'How to Make My Ex Miss Me';
  const description =
    'Understanding what creates genuine attraction and longing, and whether the no-contact rule actually works.';

  return buildLocalizedMetadata({
    locale,
    path: '/how-to-make-my-ex-miss-me',
    title,
    description,
  });
}

export default async function HowToMakeMyExMissMePage({ params }: PageParams) {
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
            How to Make My Ex Miss Me
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            The desire to be missed is natural after a breakup — it means what you had was real
            and you want to feel that significance again. But trying to manufacture longing often
            backfires when it comes from a place of need rather than genuine transformation. This
            reading helps you understand what actually creates lasting attraction and whether the
            no-contact approach is right for your specific situation.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8">
          <h2 className="text-xl font-semibold text-white">What this reading reveals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Genuine attraction</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                What actually creates lasting longing — versus quick attention tricks that do not
                hold up over time.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">No-contact assessment</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether the no-contact rule is likely to work in your specific situation — or
                whether a different approach would be more effective.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Social media strategy</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether posting on social media helps or hurts your position — and what to do
                instead if anything.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">One honest approach</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The single action that is most likely to create genuine respect and interest —
                based on your specific relationship dynamic.
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
              <h3 className="font-semibold text-white">Does no contact work?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                No contact can work — but only when it is genuine. If you go silent while
                secretly hoping they will notice, the energy is still need-based and it shows.
                The real power of no contact is when it comes from a place of self-respect, not
                strategy.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">How long should I wait?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                There is no universal timeline. What matters is not how long you wait, but what
                you do with that time. If you spend it trying to manipulate them into missing
                you, the result will likely disappoint. If you use it to genuinely rebuild
                yourself, the shift will be real.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">What if they forget me?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                If someone forgets you easily, that is information — not a reflection of your
                worth. It means the connection was not as deep as you felt. This reading helps
                you assess whether what you had warrants the wait or whether you are holding onto
                something that was more one-sided than you realized.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Should I post on social media?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Strategic social media posting usually backfires because it is transparent — they
                will know you are trying to be seen. The most effective presence is an authentic
                one where you are genuinely living your life without performance.
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
              href={getLocalizedPath(locale, '/should-i-text-my-ex')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Should I Text My Ex?
            </Link>
            <Link
              href={getLocalizedPath(locale, '/is-my-ex-playing-me')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Is My Ex Playing Me?
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