'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Eye, HeartHandshake, Lock, Sparkles } from 'lucide-react';

import { RelationshipRadar } from '@/components/relationship/RelationshipRadar';
import type { RelationshipReading } from '@/types/relationship';
import {
  TianjiLoveButton,
  TianjiLoveFooter,
  TianjiLoveHeader,
  TianjiLovePanel,
  TianjiLoveShell,
  TianjiLoveTrustCard,
} from '@/components/tianji-love';

interface ShareData {
  share: {
    public_slug: string;
    share_mode: string;
    include_names: boolean;
    include_birth_data: boolean;
    view_count: number;
  };
  reading: {
    id: string;
    relation_type: string;
    person_a_nickname?: string;
    person_b_nickname?: string;
    score_overall: number;
    dimensions: RelationshipReading['dimensions'];
    summary: RelationshipReading['summary'];
    timeline?: RelationshipReading['timeline'];
  };
}

const relationLabel: Record<string, string> = {
  romantic: 'Romantic relationship',
  friendship: 'Friendship',
  business: 'Working partnership',
};

function scoreTone(score: number) {
  if (score >= 70) return 'text-[#ffe3b4]';
  if (score >= 50) return 'text-[#d8b77b]';
  return 'text-[#ff9c8b]';
}

export default function SharePageClient() {
  const params = useParams();
  const slug = params.slug as string;
  const [data, setData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/relationship/share?slug=${slug}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.success && json.data) {
          setData(json.data);
        } else {
          setError(json.error ?? 'Share not found');
        }
      })
      .catch(() => setError('Failed to load shared relationship'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <TianjiLoveShell className="tianji-love-share-loading" ariaLabel="Loading shared relationship report">
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-5 text-center">
          <Sparkles className="mb-4 h-9 w-9 animate-pulse text-[#d8b77b]" aria-hidden />
          <p className="text-sm tracking-[0.24em] text-[#f4d7a3]/58">LOADING RELATIONSHIP SHARE</p>
        </div>
      </TianjiLoveShell>
    );
  }

  if (error || !data) {
    return (
      <TianjiLoveShell className="tianji-love-share-error" ariaLabel="Shared relationship not found">
        <div className="relative z-10 flex min-h-screen items-center justify-center px-5">
          <TianjiLovePanel className="max-w-md p-8 text-center">
            <Sparkles className="mx-auto mb-4 h-8 w-8 text-[#d8b77b]" aria-hidden />
            <h1 className="font-serif text-2xl text-[#ffe3b4]">Share not found</h1>
            <p className="mt-3 text-sm leading-7 text-[#f4d7a3]/66">
              This relationship share link may have expired or does not exist.
            </p>
            <TianjiLoveButton href="/relationship/new" className="mt-6">
              Create your own
            </TianjiLoveButton>
          </TianjiLovePanel>
        </div>
      </TianjiLoveShell>
    );
  }

  const { share, reading } = data;
  const personANickname = reading.person_a_nickname ?? 'Person A';
  const personBNickname = reading.person_b_nickname ?? 'Person B';
  const relationType = relationLabel[reading.relation_type] ?? 'Relationship';

  const readingResult: RelationshipReading = {
    id: reading.id,
    relationType: reading.relation_type as RelationshipReading['relationType'],
    personA: { nickname: personANickname },
    personB: { nickname: personBNickname },
    overallScore: reading.score_overall,
    dimensions: reading.dimensions,
    summary: reading.summary,
    timeline: reading.timeline,
    isPremium: false,
    createdAt: '',
  };

  return (
    <TianjiLoveShell className="tianji-love-relationship-share-page" ariaLabel="Tianji Love shared relationship report">
      <TianjiLoveHeader
        homeHref="/"
        navItems={[
          { label: 'Compatibility', href: '/relationship/new', mobile: true },
          { label: 'Love Reading', href: '/ask' },
          { label: 'Timing', href: '/draw' },
          { label: 'Pricing', href: '/pricing', mobile: true },
          { label: 'Privacy', href: '/legal/privacy' },
        ]}
        cta={{ label: 'Create Yours', href: '/relationship/new' }}
      />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 py-12 sm:px-8">
        <section className="text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-[#d8b77b]/66">Tianji Love / Shared Compatibility</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight text-[#ffe3b4] sm:text-5xl">
            {personANickname} & {personBNickname}
          </h1>
          <p className="mt-4 text-sm text-[#f4d7a3]/60">{relationType}</p>
        </section>

        <TianjiLovePanel className="mt-8 p-6 text-center sm:p-8">
          <div className="inline-flex items-end justify-center gap-3">
            <span className={`font-serif text-6xl font-semibold ${scoreTone(reading.score_overall)}`}>
              {reading.score_overall}
            </span>
            <span className="pb-3 text-xs uppercase tracking-[0.22em] text-[#f4d7a3]/48">overall match</span>
          </div>
          <h2 className="mx-auto mt-5 max-w-2xl font-serif text-2xl text-[#ffe3b4]">{reading.summary.headline}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#f4d7a3]/70">{reading.summary.oneLiner}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-[#f4d7a3]/50">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#b57248]/28 bg-black/20 px-3 py-1">
              <Eye className="h-3.5 w-3.5 text-[#d8b77b]" aria-hidden />
              {share.view_count} views
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#b57248]/28 bg-black/20 px-3 py-1">
              <Lock className="h-3.5 w-3.5 text-[#d8b77b]" aria-hidden />
              Birth data hidden by default
            </span>
          </div>
        </TianjiLovePanel>

        {share.share_mode !== 'insight_card' ? (
          <TianjiLovePanel className="mt-6 p-6">
            <div className="mb-4 text-center">
              <span className="text-xs uppercase tracking-[0.24em] text-[#d8b77b]/56">Relationship radar</span>
            </div>
            <RelationshipRadar
              dimensions={readingResult.dimensions}
              personANickname={personANickname}
              personBNickname={personBNickname}
              lang="en"
            />
          </TianjiLovePanel>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <TianjiLoveTrustCard icon={Lock} title="Privacy First" body="This public view excludes birth date, birth time, birth location, and time zone." />
          <TianjiLoveTrustCard icon={HeartHandshake} title="Relationship Context" body="Shared reports keep the emotional pattern visible without exposing private inputs." />
          <TianjiLoveTrustCard icon={Sparkles} title="Create Your Reading" body="Start with a private compatibility flow before choosing what to share." />
        </section>

        <TianjiLovePanel className="mt-6 p-6 text-center">
          <p className="mx-auto max-w-2xl text-sm leading-7 text-[#f4d7a3]/66">
            {personANickname} & {personBNickname} generated this compatibility insight with Tianji Love.
          </p>
          <TianjiLoveButton href="/relationship/new" className="mt-5">
            Create Your Compatibility Report
          </TianjiLoveButton>
        </TianjiLovePanel>
      </main>

      <TianjiLoveFooter
        homeHref="/"
        disclaimer="Shared compatibility reports are for reflection and relationship communication. Birth date, birth time, birth location, and time zone are hidden by default."
        links={[
          { label: 'Compatibility', href: '/relationship/new' },
          { label: 'Love Reading', href: '/ask' },
          { label: 'Timing', href: '/draw' },
          { label: 'Privacy', href: '/legal/privacy' },
        ]}
      />
    </TianjiLoveShell>
  );
}
