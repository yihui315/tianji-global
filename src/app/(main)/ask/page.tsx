"use client";

import { useMemo, useState } from "react";
import { AccuracyFeedback } from "@/components/divination/AccuracyFeedback";
import { DivinationEvidenceCard } from "@/components/divination/DivinationEvidenceCard";
import { buildAskEvidence } from "@/lib/divination/evidence";

type AskResponse = {
  language: "en" | "zh";
  disclaimer: string;
  result: string;
  meta?: {
    provider?: string;
    model?: string;
    latencyMs?: number;
    costUSD?: number;
  };
  error?: string;
};

export default function AskPage() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState<"en" | "zh">("zh");
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evidence = useMemo(
    () =>
      buildAskEvidence({
        hasQuestionContext: prompt.trim().length > 0,
        hasChartContext: false,
        hasAiMeta: Boolean(response?.meta?.provider),
        timingWindow: "Use the next 7-14 days to observe one concrete signal.",
      }),
    [prompt, response?.meta?.provider]
  );

  async function handleSubmit() {
    if (!prompt.trim()) {
      setError("Write one clear question first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          language,
        }),
      });
      const payload = (await result.json()) as AskResponse;

      if (!result.ok || payload.error) {
        throw new Error(payload.error ?? "Ask reading failed.");
      }

      setResponse(payload);
    } catch (askError) {
      setError(askError instanceof Error ? askError.message : "Ask reading failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleUnlockClick() {
    window.location.href = "/pricing?source=ask_evidence";
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.22),_transparent_34%),linear-gradient(135deg,_#14091f,_#07070d_58%,_#101827)] px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[rgba(212,175,119,0.72)]">
            TianJi Love · Ask
          </p>
          <h1 className="mt-4 font-serif text-3xl text-white/92 sm:text-4xl">
            Ask one relationship question with a calmer evidence layer.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/58">
            Write one focused question. TianJi returns a reflective answer, evidence signals, and a practical next step without claiming certainty.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/42">
                Your question
              </span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Example: Should I message them again this week?"
                className="min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/28 focus:border-violet-200/45"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as "en" | "zh")}
                className="rounded-full border border-white/10 bg-black/30 px-5 py-3 text-sm text-white outline-none"
              >
                <option value="zh">ZH</option>
                <option value="en">EN</option>
              </select>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {loading ? "Reading..." : "Ask TianJi"}
              </button>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-5">
          {response ? (
            <>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-white/35">Reading preview</p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/72">{response.result}</p>
                {response.disclaimer && (
                  <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/36">
                    {response.disclaimer}
                  </p>
                )}
              </div>

              <DivinationEvidenceCard
                evidence={evidence}
                route="ask"
                locked
                onUnlockClick={handleUnlockClick}
              />
              <AccuracyFeedback route="ask" confidence={evidence.confidence} />
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-white/56">
              The best questions are specific, current, and actionable. Ask about the next conversation, the pattern you keep seeing, or the choice you are trying to make.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
