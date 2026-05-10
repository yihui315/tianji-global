import { z } from 'zod';
import { generateReport } from '@/lib/ai-orchestrator';
import { getLoveReadingSession } from '@/lib/love-reading-store';
import type { ModelProvider } from '@/types/ai';

export interface LoveReportInput {
  sessionId: string;
  readingMode: 'solo' | 'compatibility';
  userId?: string | null;
}

export interface LoveReportGenerationMeta {
  source: 'ai' | 'fallback';
  provider?: ModelProvider;
  model?: string;
  tokensUsed?: { input: number; output: number };
  costUSD?: number;
  latencyMs?: number;
  warnings?: string[];
}

export interface LoveReport {
  summary: string;
  karmicPatterns: string;
  relationshipDynamics: string;
  futureTiming: string;
  emotionalCompatibility: string;
  actionableGuidance: string[];
  privateReportLink: string;
  disclaimer: string;
  generationMeta: LoveReportGenerationMeta;
}

const loveReportSchema = z
  .object({
    summary: z.string().min(80).max(900),
    karmicPatterns: z.string().min(80).max(900),
    relationshipDynamics: z.string().min(80).max(900),
    futureTiming: z.string().min(80).max(900),
    emotionalCompatibility: z.string().min(80).max(900),
    actionableGuidance: z.array(z.string().min(20).max(260)).min(3).max(6),
    privateReportLink: z.string().min(20).max(280),
    disclaimer: z.string().min(40).max(320),
  })
  .strict();

const unsafeCertaintyPattern =
  /\b(will happen|guaranteed|destined to|exactly when|definitely marry|soulmate is certain)\b/i;

function reportProvider(): ModelProvider {
  const configured = process.env.LOVE_REPORT_PROVIDER as ModelProvider | undefined;
  if (configured) return configured;
  if (process.env.PACKY_API_ENDPOINT) return 'packy';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return 'ollama';
}

function stripMarkdownFence(content: string) {
  return content
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function assertSafeReport(report: Omit<LoveReport, 'generationMeta'>) {
  const serialized = JSON.stringify(report);
  if (unsafeCertaintyPattern.test(serialized)) {
    throw new Error('Love report contains deterministic claims');
  }
}

function buildFallbackReport(input: LoveReportInput, teaser?: {
  summary: string;
  emotionalInsight: string;
  actionableSuggestion: string;
  patternTags: string[];
}): Omit<LoveReport, 'generationMeta'> {
  const lens =
    input.readingMode === 'compatibility'
      ? 'This compatibility report is a reflective lens on shared emotional rhythms.'
      : 'This solo love report is a reflective lens on your romantic patterns.';
  const teaserSummary =
    teaser?.summary ??
    'Your free teaser highlighted romantic patterns, emotional timing, and relationship choices that deserve gentler attention.';
  const emotionalInsight =
    teaser?.emotionalInsight ??
    'The strongest signal is where longing and self-protection meet before a clear conversation happens.';
  const actionableSuggestion =
    teaser?.actionableSuggestion ??
    'Write down the pattern you want to interrupt, then choose one honest conversation to practice this week.';
  const tags =
    teaser?.patternTags?.length ? teaser.patternTags.join(', ') : 'love pattern, timing signal, self-reflection';

  return {
    summary: `${lens} ${teaserSummary} Use this report as a private mirror for self-reflection, not as certainty about another person's future choices.`,
    karmicPatterns: `Karmic Patterns: notice the relationship themes that tend to repeat around ${tags}. The useful question is not whether the pattern is fixed, but what small response could make it less automatic.`,
    relationshipDynamics: `Relationship Dynamics: ${emotionalInsight} Look at the give-and-repair cycle between closeness, independence, and emotional safety before asking for a final answer.`,
    futureTiming: 'Future Timing: treat timing as a prompt to slow down, observe readiness, and make clearer choices in the present. The report points to reflective windows, not fixed outcomes.',
    emotionalCompatibility: 'Emotional Compatibility: compare communication needs, reassurance styles, and repair habits as invitations for conversation. Compatibility improves when both people can name needs without turning them into blame.',
    actionableGuidance: [
      actionableSuggestion,
      'Name the pattern you want to change before asking another person to change.',
      'Choose one honest conversation over several imagined outcomes.',
      'Use this reading as a journal prompt, then check it against real behavior.',
    ],
    privateReportLink:
      'Keep your private result URL for recovery. It does not include raw birth data and should be shared only with people you trust.',
    disclaimer:
      'This report is for self-reflection and relationship guidance. It does not make deterministic claims and is not medical, legal, or financial advice.',
  };
}

function buildPrompts(input: LoveReportInput, fallback: Omit<LoveReport, 'generationMeta'>) {
  const systemPrompt = [
    'You write premium relationship self-reflection reports for TianJi Love.',
    'Return valid JSON only, with no markdown fences.',
    'Do not make deterministic predictions, guarantees, medical, legal, or financial advice.',
    'Do not include birth date, birth time, birth place, timezone, email, Stripe IDs, or raw private identifiers.',
    'Use warm, concrete, psychologically safe language.',
  ].join(' ');

  const userPrompt = JSON.stringify({
    task: 'Create a structured paid TianJi Love report from this safe context.',
    readingMode: input.readingMode,
    safeContext: fallback,
    requiredShape: {
      summary: 'string',
      karmicPatterns: 'string',
      relationshipDynamics: 'string',
      futureTiming: 'string',
      emotionalCompatibility: 'string',
      actionableGuidance: ['3 to 6 strings'],
      privateReportLink: 'string',
      disclaimer: 'string',
    },
  });

  return { systemPrompt, userPrompt };
}

function parseReport(content: string): Omit<LoveReport, 'generationMeta'> {
  const parsed = loveReportSchema.parse(JSON.parse(stripMarkdownFence(content)));
  assertSafeReport(parsed);
  return parsed;
}

export async function generateLoveReport(input: LoveReportInput): Promise<LoveReport> {
  const session = await getLoveReadingSession(input.sessionId);
  const fallback = buildFallbackReport(input, session?.teaser);

  assertSafeReport(fallback);

  try {
    const { systemPrompt, userPrompt } = buildPrompts(input, fallback);
    const response = await generateReport({
      prompt: userPrompt,
      systemPrompt,
      preferredProvider: reportProvider(),
      taskType: 'analysis',
      responseFormat: 'json',
      temperature: 0.35,
      maxTokens: 1600,
    });
    const report = parseReport(response.content);

    return {
      ...report,
      generationMeta: {
        source: 'ai',
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        costUSD: response.costUSD,
        latencyMs: response.latencyMs,
        warnings: response.warnings,
      },
    };
  } catch (error) {
    return {
      ...fallback,
      generationMeta: {
        source: 'fallback',
        warnings: [
          error instanceof Error ? error.message : 'AI report generation failed',
        ],
      },
    };
  }
}
