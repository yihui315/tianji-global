"use client";

import { useState } from "react";
import {
  trackDivinationAccuracyFeedbackSubmitted,
  type AccuracyFeedbackRating,
} from "@/lib/analytics/divination";
import type { DivinationEvidenceConfidence, DivinationRoute } from "@/lib/divination/evidence";

type Props = {
  route: DivinationRoute;
  paid?: boolean;
  confidence: DivinationEvidenceConfidence;
  className?: string;
};

const feedbackOptions: Array<{ rating: AccuracyFeedbackRating; label: string }> = [
  { rating: "yes_very", label: "Yes, very" },
  { rating: "somewhat", label: "Somewhat" },
  { rating: "not_really", label: "Not really" },
];

export function AccuracyFeedback({ route, paid = false, confidence, className = "" }: Props) {
  const [selected, setSelected] = useState<AccuracyFeedbackRating | null>(null);

  function handleFeedback(rating: AccuracyFeedbackRating) {
    setSelected(rating);
    void trackDivinationAccuracyFeedbackSubmitted({
      route,
      paid,
      confidence,
      rating,
    });
  }

  return (
    <section className={`rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-4 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-white/35">Accuracy feedback</p>
          <p className="mt-1 text-sm text-white/62">Did this evidence feel close to your real situation?</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {feedbackOptions.map((option) => (
            <button
              key={option.rating}
              type="button"
              onClick={() => handleFeedback(option.rating)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                selected === option.rating
                  ? "border-[rgba(212,175,119,0.55)] bg-[rgba(212,175,119,0.14)] text-amber-100"
                  : "border-white/10 bg-black/20 text-white/56 hover:border-violet-200/35 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
