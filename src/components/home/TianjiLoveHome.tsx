'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Heart,
  LockKeyhole,
  Moon,
  ShieldCheck,
  Sparkles,
  Stars,
  TimerReset,
} from 'lucide-react';
import { trackClientEvent } from '@/lib/analytics/client';

type ReadingMode = 'solo' | 'compatibility';

const insightCards = [
  {
    title: 'Love Pattern',
    body: 'Notice the emotional rhythms you repeat, where you open quickly, and where protection takes over.',
    accent: 'from-rose-400/25 to-amber-300/10',
  },
  {
    title: 'Emotional Timing',
    body: 'Reflect on the relationship seasons that feel supportive, tender, or worth approaching with patience.',
    accent: 'from-cyan-300/20 to-violet-300/10',
  },
  {
    title: 'Compatibility Lens',
    body: 'Compare needs, communication styles, and attachment cues without turning another person into a prediction.',
    accent: 'from-emerald-300/20 to-rose-300/10',
  },
] as const;

const steps = [
  'Share only the birth details needed for a private first reading.',
  'Choose a solo pattern reading or a compatibility lens.',
  'Receive a free teaser with locked deeper sections ready for the next step.',
] as const;

const testimonials = [
  {
    quote:
      'It felt calm and useful, less like a fortune claim and more like a mirror for my relationship patterns.',
    name: 'Maya',
    role: 'Early reader',
  },
  {
    quote:
      'The timing language helped me slow down and make a clearer choice instead of chasing certainty.',
    name: 'Daniel',
    role: 'Beta member',
  },
  {
    quote:
      'I liked that the reading stayed private and did not pretend to know my future for me.',
    name: 'Lina',
    role: 'Tianji Love tester',
  },
] as const;

export function TianjiLoveHome() {
  const router = useRouter();
  const [mode, setMode] = useState<ReadingMode>('solo');
  const [statusCopy, setStatusCopy] = useState<string | null>(null);
  const [errorCopy, setErrorCopy] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTrackedFormStart, setHasTrackedFormStart] = useState(false);

  useEffect(() => {
    void trackClientEvent({
      event: 'love_home_view',
      experimentId: 'love-v1',
      moduleType: 'love-reading',
      payload: { mode },
    });
  }, [mode]);

  function trackFormStart() {
    if (hasTrackedFormStart) return;
    setHasTrackedFormStart(true);
    void trackClientEvent({
      event: 'love_form_start',
      experimentId: 'love-v1',
      moduleType: 'love-reading',
      payload: { mode },
    });
  }

  async function handleSessionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackFormStart();
    setIsSubmitting(true);
    setStatusCopy('Creating your private teaser...');
    setErrorCopy(null);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch('/api/love-reading/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: 'en',
          readingMode: mode,
          birthDate: String(form.get('birthDate') ?? ''),
          birthTime: String(form.get('birthTime') ?? ''),
          birthPlace: String(form.get('birthPlace') ?? ''),
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload?.success || !payload?.data?.redirectUrl) {
        throw new Error('Unable to create reading session');
      }

      setStatusCopy('Your private teaser is ready. Redirecting...');
      void trackClientEvent({
        event: 'love_session_created',
        experimentId: 'love-v1',
        moduleType: 'love-reading',
        payload: {
          mode,
          sessionId: payload.data.sessionId,
        },
      });
      router.push(payload.data.redirectUrl);
    } catch {
      setErrorCopy('We could not create the teaser yet. Please check the form and try again.');
      setStatusCopy(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080713] text-white">
      <HeroLoveSection
        mode={mode}
        setMode={setMode}
        onSubmit={handleSessionSubmit}
        onFormStart={trackFormStart}
        statusCopy={statusCopy}
        errorCopy={errorCopy}
        isSubmitting={isSubmitting}
      />
      <InsightCards />
      <HowItWorks />
      <Testimonials />
      <FinalCTA />
      <CosmicFooter />
      <ReducedMotionStyle />
    </main>
  );
}

function HeroLoveSection({
  mode,
  setMode,
  onSubmit,
  onFormStart,
  statusCopy,
  errorCopy,
  isSubmitting,
}: {
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormStart: () => void;
  statusCopy: string | null;
  errorCopy: string | null;
  isSubmitting: boolean;
}) {
  return (
    <section className="relative isolate min-h-[760px] overflow-hidden px-5 pb-14 pt-6 sm:px-8 sm:pb-16 lg:min-h-[760px] lg:px-12">
      <div className="absolute inset-0 -z-30">
        <Image
          src="/assets/images/hero/relationship-hero-master-16x9.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(248,113,113,0.22),transparent_30%),linear-gradient(90deg,rgba(8,7,19,0.98)_0%,rgba(8,7,19,0.82)_44%,rgba(8,7,19,0.48)_100%)]" />
        <div className="tj-love-stars absolute inset-0 opacity-60" />
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Tianji Love home">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-amber-200/35 bg-amber-100/10 text-amber-100 shadow-[0_0_30px_rgba(251,191,36,0.20)]">
            <Stars className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-sans text-sm font-semibold uppercase tracking-[0.24em] text-white/86">
            Tianji Love
          </span>
        </Link>
        <a
          href="#birth-chart-form"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white shadow-lg shadow-black/20 backdrop-blur transition hover:border-rose-200/60 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-rose-200/70"
        >
          Start free
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 py-10 sm:gap-10 sm:py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(380px,0.78fr)] lg:items-center lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-100/10 px-4 py-2 text-sm text-rose-50 shadow-[0_0_44px_rgba(244,63,94,0.18)] backdrop-blur">
            <Heart className="h-4 w-4 fill-rose-200/60 text-rose-100" aria-hidden="true" />
            Private cosmic reading for modern love
          </div>
          <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-[0.96] text-white sm:text-6xl lg:text-7xl">
            Love is the one force that bends fate.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 sm:mt-6 sm:text-xl sm:leading-8">
            Discover your romantic patterns, emotional timing, and relationship compatibility
            through a private cosmic reading designed for modern love.
          </p>
          <p className="mt-5 max-w-2xl text-base font-semibold text-amber-100">
            Discover patterns. Understand timing. Make clearer relationship choices.
          </p>

          <div className="mt-9 hidden max-w-2xl grid-cols-1 gap-3 sm:grid sm:grid-cols-3">
            {[
              ['Private by design', ShieldCheck],
              ['No guaranteed predictions', Sparkles],
              ['Free teaser first', LockKeyhole],
            ].map(([label, Icon]) => (
              <div
                key={label as string}
                className="flex min-h-[68px] items-center gap-3 rounded-lg border border-white/12 bg-white/[0.07] px-4 text-sm text-white/78 backdrop-blur"
              >
                <Icon className="h-5 w-5 shrink-0 text-amber-100" aria-hidden="true" />
                <span>{label as string}</span>
              </div>
            ))}
          </div>
        </div>

        <BirthChartForm
        mode={mode}
        setMode={setMode}
        onSubmit={onSubmit}
        onFormStart={onFormStart}
        statusCopy={statusCopy}
          errorCopy={errorCopy}
          isSubmitting={isSubmitting}
        />
      </div>
    </section>
  );
}

function BirthChartForm({
  mode,
  setMode,
  onSubmit,
  onFormStart,
  statusCopy,
  errorCopy,
  isSubmitting,
}: {
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormStart: () => void;
  statusCopy: string | null;
  errorCopy: string | null;
  isSubmitting: boolean;
}) {
  return (
    <form
      id="birth-chart-form"
      onSubmit={onSubmit}
      onFocusCapture={onFormStart}
      className="w-full rounded-lg border border-white/14 bg-[#100f22]/86 p-5 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-100">
            Free love teaser
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-white">
            Start with your birth chart
          </h2>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rose-100/12 text-rose-100">
          <Moon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>

      <ReadingModeToggle mode={mode} setMode={setMode} />

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-white/82">
          Your birth date
          <span className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-100" />
            <input
              required
              type="date"
              name="birthDate"
              className="h-12 w-full rounded-md border border-white/12 bg-white/[0.08] pl-10 pr-3 text-white outline-none transition [color-scheme:dark] placeholder:text-white/40 focus:border-rose-200/70 focus:ring-2 focus:ring-rose-200/30"
            />
          </span>
        </label>

        <label className="grid gap-2 text-sm font-medium text-white/82">
          Birth time
          <input
            type="time"
            name="birthTime"
            className="h-12 w-full rounded-md border border-white/12 bg-white/[0.08] px-3 text-white outline-none transition [color-scheme:dark] focus:border-rose-200/70 focus:ring-2 focus:ring-rose-200/30"
          />
          <span className="text-xs leading-5 text-white/52">
            Optional. We keep this private and out of share URLs.
          </span>
        </label>

        <label className="grid gap-2 text-sm font-medium text-white/82">
          Birth place
          <input
            name="birthPlace"
            placeholder="City or region"
            className="h-12 w-full rounded-md border border-white/12 bg-white/[0.08] px-3 text-white outline-none transition placeholder:text-white/38 focus:border-rose-200/70 focus:ring-2 focus:ring-rose-200/30"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-100 px-5 text-sm font-bold text-[#160b14] shadow-[0_18px_48px_rgba(251,113,133,0.28)] transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-rose-100/80"
      >
        {isSubmitting ? 'Creating teaser...' : 'Start free love reading'}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>

      <div
        aria-live="polite"
        className="mt-4 min-h-[48px] rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white/70"
      >
        {errorCopy ? (
          <span className="text-rose-100">{errorCopy}</span>
        ) : statusCopy ? (
          <span className="flex items-start gap-2 text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {statusCopy}
          </span>
        ) : (
          'Submit to create a private free teaser. Payment stays locked until you choose to upgrade.'
        )}
      </div>
    </form>
  );
}

function ReadingModeToggle({
  mode,
  setMode,
}: {
  mode: ReadingMode;
  setMode: (mode: ReadingMode) => void;
}) {
  const options: Array<{ value: ReadingMode; label: string; helper: string }> = [
    { value: 'solo', label: 'Solo love report', helper: 'Your romantic pattern' },
    { value: 'compatibility', label: 'Compatibility', helper: 'Two-person lens' },
  ];

  return (
    <div className="mt-6 grid gap-2">
      <span className="text-sm font-medium text-white/82">Reading mode</span>
      <div className="grid grid-cols-1 gap-2 rounded-lg border border-white/10 bg-black/18 p-1 sm:grid-cols-2">
        {options.map((option) => {
          const isActive = option.value === mode;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setMode(option.value)}
              aria-pressed={isActive}
              className={`min-h-[72px] rounded-md px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-rose-200/70 ${
                isActive
                  ? 'bg-white text-[#150b17] shadow-lg shadow-black/20'
                  : 'bg-transparent text-white/76 hover:bg-white/8'
              }`}
            >
              <span className="block text-sm font-bold">{option.label}</span>
              <span className={`mt-1 block text-xs ${isActive ? 'text-[#4b3545]' : 'text-white/50'}`}>
                {option.helper}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InsightCards() {
  return (
    <section className="border-y border-white/10 bg-[#0d1020] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
            What the free teaser opens
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
            A softer way to look at love timing.
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {insightCards.map((card) => (
            <article
              key={card.title}
              className={`min-h-[252px] rounded-lg border border-white/12 bg-gradient-to-br ${card.accent} p-6 shadow-xl shadow-black/18`}
            >
              <Sparkles className="h-6 w-6 text-amber-100" aria-hidden="true" />
              <h3 className="mt-6 text-xl font-bold text-white">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/68">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-[#080713] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.76fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-100/80">
            How it works
          </p>
          <h2 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
            Three steps, no pressure.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/64">
            The first version keeps the experience light: a private session, a free teaser,
            and locked premium sections for when the deeper flow is ready.
          </p>
        </div>
        <div className="grid gap-3">
          {steps.map((step, index) => (
            <div
              key={step}
              className="grid min-h-[104px] grid-cols-[52px_1fr] gap-4 rounded-lg border border-white/10 bg-white/[0.055] p-5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-base font-bold text-[#160f10]">
                {index + 1}
              </span>
              <p className="self-center text-base leading-7 text-white/76">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-[#10111f] px-5 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-100/80">
              Early signals
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
              Built for clarity, not certainty.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-white/58">
            Testimonials are anonymized early-reader notes and should be read as product
            feedback, not outcome guarantees.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="min-h-[242px] rounded-lg border border-white/10 bg-[#0b0b17] p-6"
            >
              <blockquote className="text-base leading-7 text-white/76">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-7">
                <div className="font-semibold text-white">{item.name}</div>
                <div className="mt-1 text-sm text-white/46">{item.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden bg-[#080713] px-5 py-16 sm:px-8 lg:px-12">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_10%,rgba(252,211,77,0.16),transparent_38%)]" />
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-7 text-left sm:items-center sm:text-center">
        <TimerReset className="h-8 w-8 text-amber-100" aria-hidden="true" />
        <h2 className="max-w-3xl font-serif text-4xl font-semibold text-white sm:text-5xl">
          Your next chapter may already be written in the stars.
        </h2>
        <p className="max-w-2xl text-base leading-7 text-white/66">
          Treat the reading as self-reflection and relationship guidance. It is not medical, legal, or financial advice, and it does not guarantee romantic outcomes.
        </p>
        <a
          href="#birth-chart-form"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[#120916] shadow-[0_18px_54px_rgba(255,255,255,0.18)] transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-white/80"
        >
          Start free love reading
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

function CosmicFooter() {
  return (
    <footer className="border-t border-white/10 bg-black px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-white/72">
          <Stars className="h-4 w-4 text-amber-100" aria-hidden="true" />
          Tianji Love
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <span>Private by design</span>
          <span>Free teaser first</span>
          <span>Self-reflection guidance</span>
        </div>
      </div>
    </footer>
  );
}

function ReducedMotionStyle() {
  return (
    <style>{`
      .tj-love-stars {
        background-image:
          radial-gradient(circle, rgba(255,255,255,0.62) 0 1px, transparent 1.5px),
          radial-gradient(circle, rgba(251,191,36,0.46) 0 1px, transparent 1.4px);
        background-position: 0 0, 36px 54px;
        background-size: 96px 96px, 132px 132px;
        animation: tj-love-drift 26s linear infinite;
      }

      @keyframes tj-love-drift {
        from {
          transform: translate3d(0, 0, 0);
        }
        to {
          transform: translate3d(-96px, 48px, 0);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .tj-love-stars {
          animation: none;
        }

        * {
          scroll-behavior: auto !important;
        }
      }
    `}</style>
  );
}
