export type DivinationEvidenceSource =
  | "relationship"
  | "tarot"
  | "astrology"
  | "vedic"
  | "question"
  | "timing"
  | "safety";

export type DivinationEvidenceStrength = "low" | "medium" | "high";
export type DivinationEvidenceConfidence = "low" | "medium" | "high";

export type DivinationEvidenceSignal = {
  label: string;
  source: DivinationEvidenceSource;
  strength: DivinationEvidenceStrength;
  explanation: string;
};

export type DivinationEvidence = {
  summary: string;
  signals: DivinationEvidenceSignal[];
  confidence: DivinationEvidenceConfidence;
  timingWindow?: string;
  userCanVerify?: string[];
  actionAdvice?: string[];
};

export type DivinationRoute = "ask" | "draw" | "relationship";

export type DivinationEvidenceAnalytics = {
  confidence: DivinationEvidenceConfidence;
  evidenceSignalCount: number;
  sourceTypes: DivinationEvidenceSource[];
};

type BuildAskEvidenceInput = {
  hasQuestionContext?: boolean;
  hasChartContext?: boolean;
  hasAiMeta?: boolean;
  confidence?: DivinationEvidenceConfidence;
  timingWindow?: string;
};

type BuildDrawEvidenceInput = {
  spreadName?: string;
  cardCount?: number;
  reversedCount?: number;
  hasAiInterpretation?: boolean;
  timingWindow?: string;
};

type RelationshipDimensionLike = {
  score?: number;
  label?: string;
  summary?: string;
  strengths?: string[];
  risks?: string[];
  advice?: string[];
};

type RelationshipDimensionName = "attraction" | "communication" | "conflict" | "rhythm" | "longTerm";
type RelationshipDimensionsLike = Partial<Record<RelationshipDimensionName, RelationshipDimensionLike>>;

type BuildRelationshipEvidenceInput = {
  overallScore?: number;
  relationType?: string;
  dimensions?: RelationshipDimensionsLike;
  timeline?: {
    currentPhase?: string;
    next30Days?: string;
    next90Days?: string;
  };
  isPremium?: boolean;
};

const PREVIEW_SIGNAL_LIMIT = 3;
const FULL_SIGNAL_LIMIT = 8;

function signal(
  label: string,
  source: DivinationEvidenceSource,
  strength: DivinationEvidenceStrength,
  explanation: string
): DivinationEvidenceSignal {
  return { label, source, strength, explanation };
}

function confidenceFromScore(score?: number): DivinationEvidenceConfidence {
  if (typeof score !== "number") return "medium";
  if (score >= 72) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function strengthFromScore(score?: number): DivinationEvidenceStrength {
  if (typeof score !== "number") return "medium";
  if (score >= 72) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function compactText(value?: string, fallback = "No single hidden outcome is assumed."): string {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  return normalized.length > 180 ? `${normalized.slice(0, 177)}...` : normalized;
}

function uniqueSources(signals: DivinationEvidenceSignal[]): DivinationEvidenceSource[] {
  return Array.from(new Set(signals.map((item) => item.source)));
}

function dimensionEntries(dimensions?: RelationshipDimensionsLike): Array<[RelationshipDimensionName, RelationshipDimensionLike]> {
  return (Object.entries(dimensions ?? {}) as Array<[RelationshipDimensionName, RelationshipDimensionLike | undefined]>)
    .filter((entry): entry is [RelationshipDimensionName, RelationshipDimensionLike] => Boolean(entry[1]));
}

function topDimension(dimensions?: RelationshipDimensionsLike) {
  return dimensionEntries(dimensions)
    .sort((a, b) => (b[1].score ?? 0) - (a[1].score ?? 0))[0];
}

function pressureDimension(dimensions?: RelationshipDimensionsLike) {
  return dimensionEntries(dimensions)
    .sort((a, b) => (a[1].score ?? 100) - (b[1].score ?? 100))[0];
}

export function buildAskEvidence(input: BuildAskEvidenceInput = {}): DivinationEvidence {
  const signals = [
    signal(
      "Question focus",
      "question",
      input.hasQuestionContext ? "high" : "medium",
      input.hasQuestionContext
        ? "The reading is anchored to one focused question rather than a broad emotional guess."
        : "The reading uses a general reflection frame because no detailed question context is available."
    ),
    signal(
      "Context coverage",
      input.hasChartContext ? "astrology" : "question",
      input.hasChartContext ? "medium" : "low",
      input.hasChartContext
        ? "Available chart context is used as supporting structure, while private details stay out of analytics."
        : "Only non-sensitive question structure is available, so the answer should stay reflective and practical."
    ),
    signal(
      "Model boundary",
      "safety",
      "high",
      input.hasAiMeta
        ? "AI output is treated as an interpretive layer, not as certainty or professional advice."
        : "Fallback evidence keeps the answer useful even when model metadata is unavailable."
    ),
    signal(
      "Timing caution",
      "timing",
      "medium",
      "Any timing cue is framed as a window to observe, not as a fixed promise."
    ),
  ];

  return {
    summary:
      "This answer is grounded in the question pattern, available symbolic context, and a safety check. Read it as guided reflection, not as a fixed outcome.",
    signals,
    confidence: input.confidence ?? "medium",
    timingWindow: input.timingWindow ?? "Use the next 7-14 days as an observation window.",
    userCanVerify: [
      "Whether the answer matches the real tension behind your question.",
      "Whether one suggested next step feels practical within 24 hours.",
      "Whether the situation becomes clearer after you avoid forcing a yes/no outcome.",
    ],
    actionAdvice: [
      "Write the exact decision you are trying to make before asking again.",
      "Track one observable behavior instead of reading every message as a final signal.",
    ],
  };
}

export function buildDrawEvidence(input: BuildDrawEvidenceInput = {}): DivinationEvidence {
  const cardCount = Math.max(0, input.cardCount ?? 0);
  const reversedCount = Math.max(0, input.reversedCount ?? 0);
  const spreadLabel = input.spreadName ? `${input.spreadName} spread` : "Selected spread";

  const signals = [
    signal(
      "Spread structure",
      "tarot",
      cardCount >= 3 ? "high" : "medium",
      `${spreadLabel} gives the reading a defined structure instead of a loose card-by-card impression.`
    ),
    signal(
      "Card count",
      "tarot",
      cardCount >= 3 ? "medium" : "low",
      cardCount > 0
        ? `${cardCount} card${cardCount === 1 ? "" : "s"} were used to form the visible pattern.`
        : "The fallback evidence stays available even before detailed card data is present."
    ),
    signal(
      "Reversal pressure",
      "timing",
      reversedCount > 0 ? "medium" : "low",
      reversedCount > 0
        ? "Reversed cards are treated as friction or delay signals, not as negative certainty."
        : "No reversal pressure is required for the reading to stay useful."
    ),
    signal(
      "Interpretive layer",
      input.hasAiInterpretation ? "question" : "safety",
      input.hasAiInterpretation ? "medium" : "high",
      input.hasAiInterpretation
        ? "AI interpretation connects the spread to the question without storing the raw question in analytics."
        : "Card meanings remain readable even if AI interpretation is unavailable."
    ),
  ];

  return {
    summary:
      "This draw is based on the spread shape, card count, reversal pattern, and safe interpretive boundaries.",
    signals,
    confidence: cardCount >= 3 ? "medium" : "low",
    timingWindow: input.timingWindow ?? "Use this as guidance for the current decision window.",
    userCanVerify: [
      "Which card position feels closest to the situation right now.",
      "Whether the reversal or tension signal describes a real delay.",
      "Whether the next action is specific enough to try once.",
    ],
    actionAdvice: [
      "Pick one sentence from the reading and test it against real behavior.",
      "Avoid repeating the same draw immediately to force a different answer.",
    ],
  };
}

export function buildRelationshipEvidence(
  input: BuildRelationshipEvidenceInput = {}
): DivinationEvidence {
  const top = topDimension(input.dimensions);
  const pressure = pressureDimension(input.dimensions);
  const confidence = confidenceFromScore(input.overallScore);
  const relationType = input.relationType ?? "relationship";

  const signals = [
    signal(
      "Overall pattern",
      "relationship",
      strengthFromScore(input.overallScore),
      typeof input.overallScore === "number"
        ? `The compatibility score sits at ${input.overallScore}/100, so the reading focuses on pattern quality rather than a promised result.`
        : "The relationship pattern can still be summarized even when a numeric score is unavailable."
    ),
    signal(
      "Strongest dimension",
      "relationship",
      strengthFromScore(top?.[1].score),
      top
        ? `${top[0]} is currently the clearest signal: ${compactText(top[1].summary ?? top[1].label)}`
        : "No single dimension dominates, so the evidence stays balanced."
    ),
    signal(
      "Pressure point",
      "relationship",
      strengthFromScore(pressure?.[1].score),
      pressure
        ? `${pressure[0]} is the area to watch: ${compactText(pressure[1].summary ?? pressure[1].label)}`
        : "The reading avoids inventing a weakness when no pressure point is available."
    ),
    signal(
      "Relationship context",
      "question",
      "medium",
      `The reading is scoped to a ${relationType} dynamic and does not assume every relationship has the same next step.`
    ),
    signal(
      "Timing window",
      "timing",
      input.timeline?.currentPhase || input.timeline?.next30Days ? "medium" : "low",
      compactText(input.timeline?.currentPhase ?? input.timeline?.next30Days, "Timing is framed as an observation window, not as a fixed event.")
    ),
    signal(
      "Safety boundary",
      "safety",
      "high",
      "The evidence layer avoids fixed-result reconciliation claims, certainty claims, and fear-based language."
    ),
  ];

  return {
    summary:
      "This relationship reading is grounded in visible compatibility dimensions, timing cues, and safety boundaries. It explains why the result leans a certain way without promising what the other person will do.",
    signals,
    confidence,
    timingWindow: input.timeline?.next30Days ?? input.timeline?.currentPhase ?? "Use the next 2-4 weeks to observe behavior and communication.",
    userCanVerify: [
      "Whether the strongest dimension matches how the relationship feels in daily contact.",
      "Whether the pressure point appears during conflict or silence.",
      "Whether the suggested next step reduces confusion without forcing the other person.",
    ],
    actionAdvice: [
      "Choose one low-pressure message or boundary to test the current pattern.",
      "Review the result again after real behavior changes, not after every mood shift.",
    ],
  };
}

export function limitEvidenceForPreview(
  evidence: DivinationEvidence,
  options: { paid?: boolean; maxSignals?: number } = {}
): DivinationEvidence {
  const limit = options.maxSignals ?? (options.paid ? FULL_SIGNAL_LIMIT : PREVIEW_SIGNAL_LIMIT);

  return {
    ...evidence,
    signals: evidence.signals.slice(0, limit),
    userCanVerify: evidence.userCanVerify?.slice(0, options.paid ? 5 : 2),
    actionAdvice: evidence.actionAdvice?.slice(0, options.paid ? 5 : 2),
  };
}

export function sanitizeEvidenceForAnalytics(
  evidence: DivinationEvidence
): DivinationEvidenceAnalytics {
  return {
    confidence: evidence.confidence,
    evidenceSignalCount: evidence.signals.length,
    sourceTypes: uniqueSources(evidence.signals),
  };
}
