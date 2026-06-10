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

  const title = 'How to Get Over My Ex';
  const description =
    'Understand the emotional cycle of moving on, recognize patterns, and find clarity about whether you are truly ready to let go.';

  return buildLocalizedMetadata({
    locale,
    path: '/how-to-get-over-my-ex',
    title,
    description,
  });
}

export default async function HowToGetOverMyExPage({ params }: PageParams) {
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
            How to Get Over My Ex
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Moving on is not about forgetting — it is about understanding the emotional cycle
            that underneath every breakup. When you recognize the patterns that keep pulling you
            back, you gain clarity on whether you are truly ready to let go, or whether there is
            still something worth working through. This reading helps you see the quieter signals
            beneath the rumination — so you can make your next move from clarity rather than
            momentum.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8">
          <h2 className="text-xl font-semibold text-white">What this reading reveals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Emotional cycle</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Where you are in the natural process of letting go — and whether your current
                rumination is part of healing or a loop that keeps you stuck.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Pattern recognition</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The relational archetype at work in your breakup — so you understand the deeper
                structure rather than just the surface story.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Readiness assessment</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether you are genuinely ready to move forward, or whether there is unfinished
                emotional business that needs addressing first.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Practical next step</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                One honest action you can take today that aligns with where you actually are — not
                where you wish you were.
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
              <h3 className="font-semibold text-white">How do I stop thinking about my ex?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Thinking about your ex is not the problem — it is what that thinking signals. This
                reading helps you distinguish between healthy processing and rumination that keeps
                you stuck in the same emotional place.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Will the pain ever go away?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                The intensity of the pain does fade over time — but only if you move through it
                rather than around it. Understanding where you are in that cycle gives you a sense
                of where the path leads.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Is it normal to still miss them?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Missing someone after a breakup is completely normal — it does not mean you should
                get back together. It means something was real. This reading helps you interpret
                what the missing actually means.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">How long does it take to move on?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                There is no universal timeline — it depends on the relationship, the breakup, and
                how much emotional processing remains. What matters is whether you are moving
                forward or circling the same ground.
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
              href={getLocalizedPath(locale, '/should-i-move-on')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Should I Move On?
            </Link>
            <Link
              href={getLocalizedPath(locale, '/is-my-ex-thinking-about-me')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Is My Ex Thinking About Me?
            </Link>
            <Link
              href={getLocalizedPath(locale, '/will-my-ex-come-back')}
              className="rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 hover:text-white"
            >
              Will My Ex Come Back?
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
        <LoveComplianceFooter language={lang} className="mt-6" />
      </div>
    </main>
  );
}