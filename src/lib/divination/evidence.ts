import type { DrawnSlot, QuickDrawLanguage } from '@/lib/quick-draw';
import type {
  DivinationAccuracyFeedback,
  DivinationEvidence,
  DivinationEvidenceConfidence,
  DivinationEvidenceRoute,
  DivinationEvidenceSource,
} from '@/types/divination';
import type {
  RelationshipDimensionScore,
  RelationshipDimensions,
  RelationshipReading,
} from '@/types/relationship';

export const DIVINATION_EVIDENCE_EVENTS = [
  'divination_evidence_viewed',
  'divination_evidence_expand_clicked',
  'divination_accuracy_feedback_submitted',
  'paid_unlock_from_evidence_clicked',
] as const;

export type DivinationEvidenceEventName = (typeof DIVINATION_EVIDENCE_EVENTS)[number];

const DEFAULT_SUMMARY =
  'This reading is based on observable relationship patterns, timing cues, and safety boundaries.';

const UNSAFE_PATTERNS: Array<[RegExp, string]> = [
  [/100%/gi, 'possible'],
  [/\bguarantee(?:d|s)?\b/gi, 'possible'],
  [/\bwill definitely\b/gi, 'may'],
  [/\bdefinitely\b/gi, 'possibly'],
  [/\bdestined to\b/gi, 'may feel drawn to'],
  [/\bexactly when\b/gi, 'a reflective timing window for when'],
  [/\bexactly\b/gi, 'approximately'],
  [/\bmedical\b/gi, 'personal'],
  [/\blegal\b/gi, 'practical'],
  [/\bfinancial\b/gi, 'practical'],
  [/\binvestment\b/gi, 'practical'],
  [/\bpay now or disaster will happen\b/gi, 'pause and look for observable signals'],
  [/\bdisaster will happen\b/gi, 'the situation may become harder to read'],
  [/\bprompt\b/gi, 'private detail'],
  [/\bprovider\b/gi, 'private detail'],
  [/\bmodel\b/gi, 'private detail'],
  [/\braw response\b/gi, 'private detail'],
  [/\bsk_(?:live|test)_[a-z0-9_]+/gi, 'private key'],
  [/\brk_(?:live|test)_[a-z0-9_]+/gi, 'private key'],
  [/\bwhsec_[a-z0-9_]+/gi, 'private key'],
];

const DIMENSION_NAMES: Record<keyof RelationshipDimensions, string> = {
  attraction: 'Attraction pattern',
  communication: 'Communication pattern',
  conflict: 'Repair pressure',
  rhythm: 'Relationship rhythm',
  longTerm: 'Long-term potential',
};

function compact(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function sentence(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.length > 180 ? `${trimmed.slice(0, 177).trim()}...` : trimmed;
}

function confidenceFromSignalCount(count: number): DivinationEvidenceConfidence {
  if (count >= 6) return 'high';
  if (count >= 3) return 'medium';
  return 'low';
}

function normalizePrivateValues(privateValues: string[] = []) {
  return privateValues
    .map((value) => value.trim())
    .filter((value) => value.length >= 2)
    .sort((left, right) => right.length - left.length);
}

function redactPrivateValues(value: string, privateValues: string[]) {
  let redacted = value;
  for (const privateValue of normalizePrivateValues(privateValues)) {
    redacted = redacted.split(privateValue).join('private context');
  }
  return redacted;
}

function sanitizeText(value: string | undefined, fallback: string, privateValues: string[] = []) {
  let next = redactPrivateValues(compact(value, fallback), privateValues);
  for (const [pattern, replacement] of UNSAFE_PATTERNS) {
    next = next.replace(pattern, replacement);
  }
  next = next.replace(/\btonight at \d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/gi, 'the next observation window');
  next = next.replace(/\bfrom private context\b/gi, 'from the private context');
  return sentence(next, fallback);
}

function sourceTypes(evidence: DivinationEvidence) {
  return unique(evidence.signals.map((signal) => signal.source));
}

function boundedSignals(
  signals: DivinationEvidence['signals'],
  paid: boolean,
): DivinationEvidence['signals'] {
  const max = paid ? 8 : 3;
  const min = paid ? 5 : 2;
  const safeSignals = signals.length >= min ? signals : [
    ...signals,
    {
      label: 'Safety boundary',
      source: 'safety' as const,
      strength: 'medium' as const,
      explanation: 'The reading is framed as reflection and observable behavior, not certainty.',
    },
  ];
  return safeSignals.slice(0, max);
}

export function redactUnsafeEvidence(
  evidence: DivinationEvidence,
  options: { privateValues?: string[] } = {},
): DivinationEvidence {
  const privateValues = options.privateValues ?? [];
  return {
    summary: sanitizeText(evidence.summary, DEFAULT_SUMMARY, privateValues),
    confidence: evidence.confidence,
    signals: evidence.signals.map((signal) => ({
      label: sanitizeText(signal.label, 'Evidence signal', privateValues),
      source: signal.source,
      strength: signal.strength,
      explanation: sanitizeText(
        signal.explanation,
        'This signal is based on the reading context without exposing private details.',
        privateValues,
      ),
    })),
    timingWindow: evidence.timingWindow
      ? sanitizeText(
          evidence.timingWindow,
          'Use the next observation window before making a bigger decision.',
          privateValues,
        )
      : undefined,
    userCanVerify: evidence.userCanVerify?.map((item) =>
      sanitizeText(item, 'Watch for consistent actions and communication.', privateValues),
    ),
    actionAdvice: evidence.actionAdvice?.map((item) =>
      sanitizeText(item, 'Take one low-pressure step and review what changes.', privateValues),
    ),
  };
}

export function normalizeEvidence(
  evidence: DivinationEvidence,
  options: { paid?: boolean; privateValues?: string[] } = {},
): DivinationEvidence {
  const paid = options.paid ?? false;
  const redacted = redactUnsafeEvidence(evidence, { privateValues: options.privateValues });
  const signals = boundedSignals(redacted.signals, paid);

  return {
    summary: redacted.summary,
    confidence: redacted.confidence ?? confidenceFromSignalCount(signals.length),
    signals,
    timingWindow: redacted.timingWindow,
    userCanVerify: redacted.userCanVerify?.filter(Boolean).slice(0, paid ? 5 : 2),
    actionAdvice: redacted.actionAdvice?.filter(Boolean).slice(0, paid ? 5 : 1),
  };
}

function classifyQuestionIntent(question: string | undefined) {
  const q = question?.toLowerCase() ?? '';
  return {
    asksTiming: /\b(when|timing|soon|tonight|today|tomorrow|wait|reach out|text)\b/.test(q),
    asksReconnection: /\b(ex|return|come back|reconnect|again|silence)\b/.test(q),
    asksChoice: /\b(should|choose|decision|continue|leave|move)\b/.test(q),
  };
}

export function buildAskEvidence(input: {
  question?: string;
  answer?: string;
  paid?: boolean;
  language?: 'en' | 'zh';
}): DivinationEvidence {
  const paid = input.paid ?? false;
  const intent = classifyQuestionIntent(input.question);
  const privateValues = [input.question ?? ''];
  const signals: DivinationEvidence['signals'] = [
    {
      label: 'Question focus',
      source: 'question',
      strength: intent.asksChoice || intent.asksReconnection ? 'high' : 'medium',
      explanation: intent.asksReconnection
        ? 'The question centers on reconnection pressure and whether the pattern is repeating.'
        : intent.asksChoice
          ? 'The question is framed as a choice, so the evidence favors small tests over a final verdict.'
          : 'The question gives enough emotional context to identify the main pressure point.',
    },
    {
      label: 'Timing cue',
      source: 'timing',
      strength: intent.asksTiming ? 'high' : 'medium',
      explanation: intent.asksTiming
        ? 'The question asks about timing, so the reading uses a short observation window before action.'
        : 'The next useful signal is likely to come from behavior over a short observation window.',
    },
    {
      label: 'Safety boundary',
      source: 'safety',
      strength: 'high',
      explanation: 'The answer avoids guaranteed outcomes and focuses on observable relationship behavior.',
    },
  ];

  if (paid) {
    signals.push(
      {
        label: 'Emotional pattern',
        source: 'relationship',
        strength: 'medium',
        explanation: 'The full reading can connect the surface question to the emotional push-pull underneath.',
      },
      {
        label: 'Verification path',
        source: 'question',
        strength: 'medium',
        explanation: 'The advice can be checked against consistent communication, steadier action, and reduced ambiguity.',
      },
      {
        label: 'Action fit',
        source: 'timing',
        strength: 'medium',
        explanation: 'The next step is sized as a low-pressure test rather than an irreversible move.',
      },
    );
  }

  return normalizeEvidence(
    {
      summary: paid
        ? 'The full Ask evidence connects the question, timing pressure, and next action through observable signals.'
        : 'The preview evidence highlights one observable pattern before a deeper interpretation is unlocked.',
      confidence: confidenceFromSignalCount(signals.length),
      signals,
      timingWindow: intent.asksTiming
        ? 'Use the next 24 to 72 hours as an observation window.'
        : 'Use a short observation window before making the next bigger move.',
      userCanVerify: paid
        ? [
            'Whether communication becomes more consistent after a low-pressure prompt.',
            'Whether actions match words without needing to chase clarity.',
            'Whether the emotional pressure drops after one small test.',
          ]
        : ['Whether actions become more consistent after one small step.'],
      actionAdvice: paid
        ? [
            'Choose one calm message or one clear pause, then review the response.',
            'Avoid forcing certainty from a single reply.',
          ]
        : ['Take one low-pressure step and watch what changes.'],
    },
    { paid, privateValues },
  );
}

function slotLabel(slot: DrawnSlot, language: QuickDrawLanguage) {
  const labels: Record<DrawnSlot['slot'], { en: string; zh: string }> = {
    yesterday: { en: 'Yesterday echo', zh: 'Past echo' },
    today: { en: 'Today signal', zh: 'Current signal' },
    tomorrow: { en: 'Tomorrow opening', zh: 'Next opening' },
  };
  return labels[slot.slot]?.[language] ?? labels[slot.slot]?.en ?? 'Timing card';
}

export function buildDrawEvidence(input: {
  question?: string;
  draw?: DrawnSlot[];
  paid?: boolean;
  language?: QuickDrawLanguage;
}): DivinationEvidence {
  const paid = input.paid ?? false;
  const language = input.language ?? 'en';
  const draw = input.draw ?? [];
  const privateValues = [input.question ?? ''];
  const signals: DivinationEvidence['signals'] = draw.map((slot) => ({
    label: `${slotLabel(slot, language)}: ${slot.card.arcana === 'major' ? 'turning point' : 'practical cue'}`,
    source: 'tarot',
    strength: slot.card.arcana === 'major' ? 'high' : 'medium',
    explanation: slot.isReversed
      ? 'This position asks for reframing before action.'
      : 'This position supports a direct but careful next read of the situation.',
  }));

  if (!signals.length) {
    signals.push({
      label: 'Three-card structure',
      source: 'tarot',
      strength: 'medium',
      explanation: 'The spread reads past echo, current signal, and next opening as a relationship timing sequence.',
    });
  }

  if (paid) {
    signals.push(
      {
        label: 'Timing synthesis',
        source: 'timing',
        strength: 'high',
        explanation: 'The full reading connects all three positions into one practical timing window.',
      },
      {
        label: 'Relationship dynamic',
        source: 'relationship',
        strength: 'medium',
        explanation: 'The deeper reading names the likely emotional dynamic without treating the cards as certainty.',
      },
      {
        label: 'Safety boundary',
        source: 'safety',
        strength: 'high',
        explanation: 'The cards are used as reflective prompts, not guaranteed future prediction.',
      },
    );
  }

  return normalizeEvidence(
    {
      summary: paid
        ? 'The full Draw evidence links the three card positions into timing, emotional pattern, and next action.'
        : 'The preview evidence uses the three card positions as a limited timing signal.',
      confidence: confidenceFromSignalCount(signals.length),
      signals,
      timingWindow: 'Yesterday -> Today -> Tomorrow shows what is echoing, what is live, and what may open next.',
      userCanVerify: paid
        ? [
            'Whether the current signal becomes clearer through behavior, not guessing.',
            'Whether the next opening appears as steadier communication or calmer distance.',
          ]
        : ['Whether the next observable signal matches the current card pressure.'],
      actionAdvice: paid
        ? [
            'Choose one action for the next 7 days and one sign that would make you pause.',
            'Do not treat one card as permission to force a response.',
          ]
        : ['Use the cards to choose one careful next step.'],
    },
    { paid, privateValues },
  );
}

function relationshipSignal(
  key: keyof RelationshipDimensions,
  dimension: RelationshipDimensionScore,
): DivinationEvidence['signals'][number] {
  return {
    label: DIMENSION_NAMES[key],
    source: 'relationship',
    strength: dimension.score >= 75 ? 'high' : dimension.score >= 50 ? 'medium' : 'low',
    explanation: `${dimension.label}: ${dimension.summary}`,
  };
}

function orderedDimensions(reading: RelationshipReading) {
  return (Object.entries(reading.dimensions) as Array<[keyof RelationshipDimensions, RelationshipDimensionScore]>)
    .sort(([, left], [, right]) => right.score - left.score);
}

export function buildRelationshipEvidence(input: {
  reading: RelationshipReading;
  paid?: boolean;
  language?: 'en' | 'zh';
}): DivinationEvidence {
  const paid = input.paid ?? (input.reading.accessLevel === 'full' || input.reading.isPremium);
  const ordered = orderedDimensions(input.reading);
  const privateValues = [
    input.reading.personA.nickname,
    input.reading.personB.nickname,
  ];
  const baseSignals = paid
    ? ordered.map(([key, dimension]) => relationshipSignal(key, dimension))
    : [
        relationshipSignal(ordered[0][0], ordered[0][1]),
        relationshipSignal(ordered[ordered.length - 1][0], ordered[ordered.length - 1][1]),
      ];

  const signals: DivinationEvidence['signals'] = [
    ...baseSignals,
    {
      label: 'Timing window',
      source: 'timing',
      strength: input.reading.timeline ? 'medium' : 'low',
      explanation: input.reading.timeline?.next30Days ??
        'Use the next relationship window for observation before making a larger decision.',
    },
    {
      label: 'Reflection boundary',
      source: 'safety',
      strength: 'high',
      explanation: 'The report explains compatibility patterns without promising a certain outcome.',
    },
  ];

  return normalizeEvidence(
    {
      summary: paid
        ? 'The full relationship evidence connects all five dimensions, timing, repair pressure, and next action.'
        : 'The free relationship evidence shows the strongest pattern, the pressure point, and one timing cue.',
      confidence: input.reading.overallScore >= 70 ? 'high' : input.reading.overallScore >= 45 ? 'medium' : 'low',
      signals,
      timingWindow: input.reading.timeline?.next30Days ?? 'Use the next 30 days for low-pressure observation.',
      userCanVerify: paid
        ? [
            'Whether communication becomes more consistent after naming the pattern.',
            'Whether conflict repair happens faster after a pause-and-return rule.',
            'Whether attraction and rhythm stay aligned without pressure.',
          ]
        : ['Whether communication and pacing feel more consistent after one small adjustment.'],
      actionAdvice: paid
        ? [
            ordered[ordered.length - 1][1].advice[0] ?? 'Start with the dimension that needs the most care.',
            'Choose one next conversation and one boundary before escalating the relationship question.',
          ]
        : [ordered[ordered.length - 1][1].advice[0] ?? 'Start with one low-pressure relationship adjustment.'],
    },
    { paid, privateValues },
  );
}

export function buildDivinationEvidenceAnalyticsPayload(input: {
  route: DivinationEvidenceRoute;
  paid: boolean;
  evidence: DivinationEvidence;
  feedback?: DivinationAccuracyFeedback | 'somewhat';
}) {
  return {
    route: input.route,
    paid: input.paid,
    confidence: input.evidence.confidence,
    evidenceSignalCount: input.evidence.signals.length,
    sourceTypes: sourceTypes(input.evidence),
    feedback: input.feedback,
  };
}
