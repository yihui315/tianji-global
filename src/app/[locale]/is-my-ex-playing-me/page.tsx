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

  const title = 'Is My Ex Playing Me?';
  const description =
    'Identify the signs of emotional manipulation, mixed signals, and games in relationships. Get clarity on whether you are being used.';

  return buildLocalizedMetadata({
    locale,
    path: '/is-my-ex-playing-me',
    title,
    description,
  });
}

export default async function IsMyExPlayingMePage({ params }: PageParams) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const lang = locale as 'en' | 'zh';

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
            Is My Ex Playing Me?
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
            Mixed signals and emotional games can leave you questioning your own judgment. When
            someone oscillates between closeness and distance, warmth and coldness, it is hard to
            know whether you are dealing with genuine uncertainty or calculated manipulation. This
            reading helps you identify the patterns beneath the confusion — so you can see clearly
            whether you are being used, kept on hold, or genuinely working through something
            complicated.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-8">
          <h2 className="text-xl font-semibold text-white">What this reading reveals</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Game pattern analysis</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether the push-pull dynamic follows a recognizable manipulation pattern or
                reflects genuine emotional complexity on their side.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Intent decoding</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                What the timing of their contact, the frequency of their reach-outs, and the
                emotional texture of their messages actually suggest about their intentions.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Situationship clarity</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Whether you are in something real that just needs time, or whether you are being
                kept as an option without commitment.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-5">
              <h3 className="font-semibold text-[#f4d7a3]">Honest next move</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                One clear action — whether to hold boundaries, create distance, or engage
                differently — that aligns with the actual pattern rather than your hope.
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
              <h3 className="font-semibold text-white">How do I know if my ex is playing me?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Look for consistency between words and actions. If they only reach out when it is
                convenient for them, disappear when you need clarity, and keep you in a grey zone
                without commitment — those are patterns worth examining seriously.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Why do they keep coming back?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                People return for different reasons — genuine regret, loneliness, ego boost, or
                not wanting to lose you entirely. Understanding which motivation is at play changes
                how you should respond.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Is this a situationship?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                If the relationship has no defined label, inconsistent availability, and one person
                always seems more invested than the other — you may be in a situationship. This
                reading helps you name what you are actually in.
              </p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <h3 className="font-semibold text-white">Should I block them?</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">
                Blocking is a personal decision that depends on what you need for your own
                wellbeing. This reading helps you understand whether distance is protecting you or
                whether it is cutting off something that still has potential.
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