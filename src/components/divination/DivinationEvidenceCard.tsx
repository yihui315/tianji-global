"use client";

import { useEffect, useMemo, useState } from "react";
import {
  limitEvidenceForPreview,
  type DivinationEvidence,
  type DivinationRoute,
} from "@/lib/divination/evidence";
import {
  trackDivinationEvidenceExpandClicked,
  trackDivinationEvidenceViewed,
  trackPaidUnlockFromEvidenceClicked,
} from "@/lib/analytics/divination";

type Props = {
  evidence: DivinationEvidence;
  route: DivinationRoute;
  paid?: boolean;
  locked?: boolean;
  onUnlockClick?: () => void;
};

const routeLabels: Record<DivinationRoute, string> = {
  ask: "Ask",
  draw: "Draw",
  relationship: "Relationship",
};

const confidenceLabels: Record<DivinationEvidence["confidence"], string> = {
  low: "Light signal",
  medium: "Balanced signal",
  high: "Strong signal",
};

const strengthClasses: Record<string, string> = {
  low: "border-white/10 bg-white/[0.03] text-white/58",
  medium: "border-amber-200/20 bg-amber-200/[0.06] text-amber-100/78",
  high: "border-violet-200/25 bg-violet-200/[0.08] text-violet-100/82",
};

export function DivinationEvidenceCard({
  evidence,
  route,
  paid = false,
  locked = false,
  onUnlockClick,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const visibleEvidence = useMemo(
    () => limitEvidenceForPreview(evidence, { paid: paid && !locked }),
    [evidence, locked, paid]
  );

  useEffect(() => {
    void trackDivinationEvidenceViewed({ route, paid, evidence: visibleEvidence });
  }, [evidence, paid, route, visibleEvidence]);

  function handleExpandClick() {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (nextExpanded) {
      void trackDivinationEvidenceExpandClicked({ route, paid, evidence: visibleEvidence });
    }
  }

  function handleUnlockClick() {
    void trackPaidUnlockFromEvidenceClicked({ route, paid, evidence: visibleEvidence });
    onUnlockClick?.();
  }

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[rgba(10,10,18,0.72)] shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="border-b border-white/10 bg-white/[0.025] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[rgba(212,175,119,0.72)]">
              Evidence layer · {routeLabels[route]}
            </p>
            <h2 className="mt-2 font-serif text-xl text-white/90">Why this reading leans this way</h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/62">
            <span className="h-2 w-2 rounded-full bg-[rgb(212,175,119)]" />
            {confidenceLabels[evidence.confidence]}
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/35">Core judgment</p>
          <p className="mt-2 text-sm leading-7 text-white/72">{evidence.summary}</p>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.22em] text-white/35">Evidence signals</p>
            <button
              type="button"
              onClick={handleExpandClick}
              className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-white/56 transition hover:border-violet-200/35 hover:text-white"
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          </div>
          <div className="grid gap-3">
            {visibleEvidence.signals.map((item) => (
              <div
                key={`${item.source}-${item.label}`}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white/86">{item.label}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[0.68rem] uppercase tracking-[0.16em] ${strengthClasses[item.strength]}`}>
                    {item.strength}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[0.68rem] uppercase tracking-[0.16em] text-white/38">
                    {item.source}
                  </span>
                </div>
                {(expanded || !locked) && (
                  <p className="mt-2 text-sm leading-6 text-white/58">{item.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {evidence.timingWindow && (
          <div className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.045] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-amber-100/54">Timing window</p>
            <p className="mt-2 text-sm leading-6 text-white/68">{evidence.timingWindow}</p>
          </div>
        )}

        {expanded && (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleEvidence.userCanVerify?.length ? (
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">User-verifiable points</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/62">
                  {visibleEvidence.userCanVerify.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {visibleEvidence.actionAdvice?.length ? (
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/35">Next step advice</p>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-white/62">
                  {visibleEvidence.actionAdvice.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}

        {locked && (
          <div className="rounded-2xl border border-[rgba(212,175,119,0.24)] bg-[rgba(212,175,119,0.06)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white/86">Unlock the deeper reading</p>
                <p className="mt-1 text-xs leading-5 text-white/48">
                  Get the full evidence map, deeper timing cues, and a calmer action plan.
                </p>
              </div>
              <button
                type="button"
                onClick={handleUnlockClick}
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-[rgb(212,175,119)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-100"
              >
                Unlock
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
