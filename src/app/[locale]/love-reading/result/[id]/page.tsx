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
import { generatePremiumLoveReport } from '@/lib/love-reading/premium-report-generator';
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
    freePreviewReport: {
      version: 'love-report-v1',
      locale: locale === 'zh-CN' ? 'zh' : 'en',
      visibility: 'free',
      headline: 'Your relationship preview is ready',
      oneLiner: 'A privacy-safe first signal for understanding the pattern, pace, and next best action.',
      relationshipArchetype: {
        key: 'learning-rhythm',
        title: 'Learning Rhythm',
        summary: 'The connection has real signals, and the next step is learning each other pace without pressure.',
      },
      overallScore: 66,
      dimensions: [
        {
          key: 'emotional_connection',
          score: 72,
          label: 'Emotional connection',
          insight: 'There is enough warmth to support a careful next step.',
          evidence: ['steady free preview signal'],
          action: 'Ask one honest question without pushing for certainty.',
        },
        {
          key: 'communication',
          score: 61,
          label: 'Communication',
          insight: 'The bond improves when expectations are named early.',
          evidence: ['calibration window'],
          action: 'Name one expectation and one boundary.',
        },
        {
          key: 'values_alignment',
          score: 68,
          label: 'Values alignment',
          insight: 'The pattern favors patient comparison over quick promises.',
          evidence: ['learning rhythm archetype'],
          action: 'Notice whether small commitments are easy to keep.',
        },
        {
          key: 'growth_support',
          score: 65,
          label: 'Growth support',
          insight: 'The connection can support growth when both people stay practical.',
          evidence: ['current window favors calibration'],
          action: 'Choose one repeatable support habit this week.',
        },
        {
          key: 'passion_intimacy',
          score: 64,
          label: 'Passion and intimacy',
          insight: 'Attraction works best when emotional safety is not rushed.',
          evidence: ['privacy-safe preview only'],
          action: 'Let closeness build through consistency.',
        },
      ],
      currentWindow: {
        label: 'Calibration window',
        summary: 'The current window favors gentle calibration.',
        recommendedAction: 'Name one expectation and one boundary.',
      },
      strengths: ['There is enough signal to support a calm next step.'],
      frictionPoints: ['The main risk is asking for certainty before the pattern is proven.'],
      next7Days: [
        'Start with one honest check-in.',
        'Avoid reading silence as a final answer.',
        'Choose consistency over dramatic proof.',
      ],
      next30Days: [],
      premiumTeaser: 'Unlock the full report for deeper guidance.',
      premiumSections: [],
      privacySafeShareSummary: {
        title: 'Learning Rhythm',
        summary: 'A privacy-safe first signal.',
        scoreBand: '60-79',
        cta: 'Start your private TianJi Love preview',
      },
      createdAt: new Date(0).toISOString(),
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
      })
    : null;
  const freeReport = session.freePreviewReport;
  const premiumReport = isPaid
    ? generatePremiumLoveReport(freeReport, {
        hasEntitlement: true,
        productId,
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
          isPaid={isPaid}
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
            {freeReport.headline}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/70">
            {freeReport.oneLiner}
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-[180px_1fr]">
            <div className="rounded-md border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">
                Overall score
              </p>
              <p className="mt-3 text-5xl font-semibold text-[#f4d7a3]">{freeReport.overallScore}</p>
              <p className="mt-2 text-sm text-white/55">
                {freeReport.privacySafeShareSummary.scoreBand}
              </p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">
                Relationship archetype
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                {freeReport.relationshipArchetype.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/68">
                {freeReport.relationshipArchetype.summary}
              </p>
            </div>
          </div>
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

        <section className="mt-6 rounded-lg border border-white/12 bg-white/[0.04] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/52">
                Five dimensions
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Your free relationship map</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/55">
              Scores are reflective signals, not fixed predictions. Use them to choose a calmer next step.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {freeReport.dimensions.map((dimension) => (
              <article
                key={dimension.key}
                className="rounded-md border border-white/10 bg-black/20 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white">{dimension.label}</h3>
                  <span className="rounded-full bg-[#f4d7a3]/14 px-3 py-1 text-sm font-semibold text-[#f4d7a3]">
                    {dimension.score}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/66">{dimension.insight}</p>
                <p className="mt-4 text-sm font-semibold text-white/82">{dimension.action}</p>
                {dimension.uncertaintyNote ? (
                  <p className="mt-3 text-xs leading-5 text-white/45">{dimension.uncertaintyNote}</p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-white/12 bg-white/[0.04] p-5 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">
              Current window
            </p>
            <h2 className="mt-3 text-xl font-semibold">{freeReport.currentWindow.label}</h2>
            <p className="mt-3 text-sm leading-6 text-white/64">{freeReport.currentWindow.summary}</p>
            <p className="mt-4 text-sm font-semibold text-[#f4d7a3]">
              {freeReport.currentWindow.recommendedAction}
            </p>
          </div>
          <div className="rounded-lg border border-white/12 bg-white/[0.04] p-5 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/48">
              Next seven days
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {freeReport.next7Days.map((item) => (
                <p key={item} className="rounded-md border border-white/10 bg-black/18 p-4 text-sm leading-6 text-white/66">
                  {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-100/15 bg-emerald-100/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/70">
              Strengths
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/68">
              {freeReport.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-amber-100/15 bg-amber-100/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-100/70">
              Friction points
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/68">
              {freeReport.frictionPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {isPaid && premiumReport && reportJob ? (
          <section className="mt-6 rounded-lg border border-emerald-100/20 bg-emerald-100/[0.06] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">
              Premium report unlocked
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {premiumReport.premiumSections.map((section) => (
                <article key={section.key} className="rounded-md border border-white/10 bg-black/18 p-5">
                  <h3 className="font-semibold text-white">{section.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/66">{section.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-5">
              <ReportJobPoller jobId={reportJob.id} />
            </div>
          </section>
        ) : (
          <section className="mt-6 rounded-lg border border-amber-100/20 bg-amber-100/[0.06] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100">
              Locked premium sections
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/66">
              {freeReport.premiumTeaser}
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
