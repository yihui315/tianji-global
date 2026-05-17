import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LoveFunnelAnalytics } from '@/components/love-reading/LoveFunnelAnalytics';
import { LoveReportCheckoutButton } from '@/components/love-reading/LoveReportCheckoutButton';
import { ReportJobPoller } from '@/components/love-reading/ReportJobPoller';
import { auth } from '@/lib/auth';
import { hasEntitlement, type BillingProductId } from '@/lib/billing';
import { buildLocalizedMetadata } from '@/lib/i18n-metadata';
import { getLocalizedPath, isSupportedLocale, locales, type Locale } from '@/lib/i18n';
import { getLoveReadingSession, type LoveReadingSessionRecord } from '@/lib/love-reading-store';
import { ensureReportJobForSession, runReportJob } from '@/lib/report-jobs';

type PageParams = {
  params: Promise<{ locale: string; id: string }>;
  searchParams?: Promise<{ checkout?: string }>;
};

function buildDemoSession(locale: Locale): LoveReadingSessionRecord {
  return {
    sessionId: 'demo',
    birthProfileId: 'demo',
    locale,
    readingMode: 'solo',
    status: 'teaser_ready',
    createdAt: new Date(0).toISOString(),
    teaser: {
      summary:
        'Your free teaser highlights romantic patterns, emotional timing, and the relationship choices that may deserve gentler attention.',
      emotionalInsight:
        'Your strongest signal is where longing and self-protection meet before a clear conversation happens.',
      actionableSuggestion:
        'Write down the pattern you want to interrupt, then choose one honest conversation to practice this week.',
      patternTags: ['love pattern', 'timing signal', 'self-reflection'],
      lockedSections: [
        'Karmic Patterns',
        'Relationship Dynamics',
        'Future Timing',
        'Emotional Compatibility',
        'Actionable Guidance',
        'Private report link',
      ],
    },
  };
}

function productIdForSession(session: LoveReadingSessionRecord): BillingProductId {
  return session.readingMode === 'compatibility'
    ? 'compatibility_report'
    : 'solo_love_report';
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale, id: 'demo' }));
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isSupportedLocale(locale)) return {};

  return {
    ...buildLocalizedMetadata({
    locale,
    path: `/love-reading/result/${id}`,
    title: locale === 'zh-CN' ? 'TianJi Love Free Preview' : 'TianJi Love Free Preview',
    description:
      'A private teaser result focused on relationship patterns, emotional timing, and reflective guidance.',
    }),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LoveReadingResultPage({ params, searchParams }: PageParams) {
  const { locale, id } = await params;
  const query = searchParams ? await searchParams : {};
  if (!isSupportedLocale(locale)) notFound();

  const session = id === 'demo' ? buildDemoSession(locale) : await getLoveReadingSession(id);
  if (!session) notFound();

  const authSession = await auth();
  const productId = productIdForSession(session);
  const isPaid =
    id !== 'demo' &&
    (await hasEntitlement({
      userId: authSession?.user?.id ?? null,
      readingSessionId: session.sessionId,
      entitlement: productId,
    }));
  const reportJob = isPaid
    ? await ensureReportJobForSession({
        sessionId: session.sessionId,
        readingMode: session.readingMode,
        userId: authSession?.user?.id ?? null,
        vedicEntitlement: {
          paid: true,
          product: productId,
        },
      })
    : null;

  if (reportJob && ['queued', 'failed'].includes(reportJob.status)) {
    void runReportJob(reportJob.id);
  }

  return (
    <main className="min-h-screen bg-[#080713] px-5 py-8 text-white sm:px-8 lg:px-12">
      {id !== 'demo' && (
        <LoveFunnelAnalytics
          event="love_result_view"
          sessionId={session.sessionId}
          productId={productId}
          checkoutStatus={query.checkout}
        />
      )}
      <div className="mx-auto max-w-5xl">
        <Link href={getLocalizedPath(locale, '/')} className="text-sm text-white/58 hover:text-white">
          Back to Tianji Love
        </Link>

        <section className="mt-10 rounded-lg border border-white/12 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-100">
            Free teaser result
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
            A private first look at your love pattern.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/70">
            {session.teaser.summary}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <p className="rounded-md border border-white/10 bg-black/18 p-4 text-sm leading-6 text-white/68">
              {session.teaser.emotionalInsight}
            </p>
            <p className="rounded-md border border-white/10 bg-black/18 p-4 text-sm leading-6 text-white/68">
              {session.teaser.actionableSuggestion}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {session.teaser.patternTags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                {tag}
              </span>
            ))}
          </div>
        </section>

        {isPaid && reportJob ? (
          <section className="mt-6 rounded-lg border border-emerald-100/20 bg-emerald-100/[0.06] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">
              Premium report unlocked
            </p>
            <div className="mt-5">
              <ReportJobPoller jobId={reportJob.id} />
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-lg border border-amber-100/20 bg-amber-100/[0.06] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100">
              Locked premium sections
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {session.teaser.lockedSections.map((section) => (
                <div
                  key={section}
                  className="flex min-h-[72px] items-center justify-between rounded-md border border-white/10 bg-black/18 px-4"
                >
                  <span className="font-semibold text-white/82">{section}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/52">Locked</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {!isPaid && id !== 'demo' && (
            <LoveReportCheckoutButton
              sessionId={session.sessionId}
              locale={locale}
              productId={productId}
            />
          )}
          <Link
            href={getLocalizedPath(locale, '/pricing')}
            className="inline-flex rounded-full border border-white/12 px-6 py-3 text-sm font-semibold text-white/80 hover:text-white"
          >
            Review pricing
          </Link>
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-6 text-white/50">
          This reading is for self-reflection and relationship guidance. It does not make
          deterministic claims and is not medical, legal, or financial advice.
        </p>
      </div>
    </main>
  );
}
