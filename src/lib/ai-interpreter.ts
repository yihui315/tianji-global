/**
 * AI Interpreter — TianJi Global
 *
 * High-level helper that wraps generateReport() with the prompt library
 * (ai-prompts.ts) to produce enriched AI interpretations for each
 * fortune system. All AI outputs include a disclaimer.
 *
 * RAG++ Integration: Each interpret function retrieves KB context via
 * ragPlusEngine and validates AI output with detectHallucinations().
 *
 * Usage:
 *   const result = await interpretBazi(baziChart, 'zh');
 *   const result = await interpretTarot(tarotData, 'en');
 */

import { generateReport } from '@/lib/ai-orchestrator';
import type { ReportResponse } from '@/types/ai';
export type { ReportResponse };
import {
  getBaziReportPrompt,
  getZiweiReportPrompt,
  getTarotReportPrompt,
  getYiJingReportPrompt,
  getFortuneReportPrompt,
  getPsychologyPrompt,
  type BaziData,
  type ZiweiData,
  type TarotData,
  type YiJingData,
  type FortuneData,
  type PsychologyData,
} from '@/lib/ai-prompts';
import { ragPlusEngine, detectHallucinations } from './rag-plus';
import type { Hallucination, RetrievedChunk } from './rag-plus';

// ─── Shared disclaimer text ───────────────────────────────────────────────────

const DISCLAIMER_EN =
  'This reading is for entertainment and self-reflection purposes only. ' +
  'It does not constitute medical, legal, or financial advice. ' +
  'Always consult a qualified professional for important life decisions.';

const DISCLAIMER_ZH =
  '本报告仅供娱乐与自我探索，不构成医疗、法律或财务建议。' +
  '重要人生决策请咨询具备资质的专业人士。';

// ─── RAG++ KB constraint text ───────────────────────────────────────────────

const KB_CONSTRAINT_EN = `IMPORTANT: Only interpret based on the knowledge base entries provided above. Cite sources as [KB:entry_id]. Do NOT invent stars, palaces, stems, branches, elements, or hexagrams not present in the knowledge base.`;

const KB_CONSTRAINT_ZH = `重要：仅根据上述知识库条目进行解读，引用来源时请使用 [KB:条目ID] 格式。请勿编造知识库中不存在的星曜、宫位、天干、地支、五行或卦象。`;

// ─── Generic interpreter ─────────────────────────────────────────────────────

async function callAI(
  prompt: string,
  language: 'en' | 'zh',
  taskType: 'analysis' = 'analysis',
  extraSystemContext?: string,
  preferredProvider?: 'packy'
): Promise<{ content: string; report: ReportResponse }> {
  const baseSystemPrompt =
    language === 'zh'
      ? '你是一位融合传统命理学与现代心理学的专业命理师。请用JSON格式回复。'
      : 'You are a professional astrologer specializing in Chinese metaphysics and modern psychology. Please respond in JSON format.';

  const systemPrompt = extraSystemContext
    ? `${baseSystemPrompt}\n\n${extraSystemContext}`
    : baseSystemPrompt;

  const report = await generateReport({
    prompt,
    systemPrompt,
    preferredProvider,
    taskType,
    responseFormat: 'text',
    maxTokens: 2048,
  });

  return { content: report.content, report };
}

/**
 * Build RAG++-augmented system prompt by retrieving relevant KB chunks
 * for the given query and service type.
 */
function buildRAGPrompt(
  userPrompt: string,
  serviceType: 'bazi' | 'ziwei' | 'yijing',
  language: 'en' | 'zh'
): { kbContext: string; kbChunks: RetrievedChunk[] } {
  const { groundedPrompt, chunks } = ragPlusEngine.ragpp(
    userPrompt,
    serviceType,
    {}
  );

  // Extract just the KB section (everything after "KNOWLEDGE BASE:")
  const kbContext = chunks
    .map((c) => `[KB:${c.id}]\n${c.content}`)
    .join('\n\n');

  return { kbContext, kbChunks: chunks };
}

// ─── Per-system interpreters ──────────────────────────────────────────────────

/**
 * Generate an AI-enriched BaZi (八字) report.
 */
export async function interpretBazi(
  data: BaziData,
  language: 'en' | 'zh' = 'en'
): Promise<{
  aiInterpretation: string;
  report: ReportResponse;
  disclaimer: string;
  hallucinations?: Hallucination[];
  kbChunks?: RetrievedChunk[];
}> {
  const userPrompt = getBaziReportPrompt(data, language);
  const { kbContext, kbChunks } = buildRAGPrompt(userPrompt, 'bazi', language);
  const kbConstraint = language === 'zh' ? KB_CONSTRAINT_ZH : KB_CONSTRAINT_EN;

  const extraSystemContext =
    `You are a Chinese metaphysics BaZi (八字) expert.\n\n` +
    `KNOWLEDGE BASE:\n${kbContext}\n\n` +
    `SYSTEM CONSTRAINT: ${kbConstraint}`;

  const { content, report } = await callAI(userPrompt, language, 'analysis', extraSystemContext, 'packy');
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;

  const hallucinations = detectHallucinations(content, 'bazi');

  return {
    aiInterpretation: content,
    report,
    disclaimer,
    hallucinations: hallucinations.length > 0 ? hallucinations : undefined,
    kbChunks,
  };
}

/**
 * Generate an AI-enriched Zi Wei Dou Shu (紫微斗数) report.
 */
export async function interpretZiwei(
  data: ZiweiData,
  language: 'en' | 'zh' = 'en'
): Promise<{
  aiInterpretation: string;
  report: ReportResponse;
  disclaimer: string;
  hallucinations?: Hallucination[];
  kbChunks?: RetrievedChunk[];
}> {
  const userPrompt = getZiweiReportPrompt(data, language);
  const { kbContext, kbChunks } = buildRAGPrompt(userPrompt, 'ziwei', language);
  const kbConstraint = language === 'zh' ? KB_CONSTRAINT_ZH : KB_CONSTRAINT_EN;

  const extraSystemContext =
    `You are a Chinese metaphysics Zi Wei Dou Shu (紫微斗数) expert.\n\n` +
    `KNOWLEDGE BASE:\n${kbContext}\n\n` +
    `SYSTEM CONSTRAINT: ${kbConstraint}`;

  const { content, report } = await callAI(userPrompt, language, 'analysis', extraSystemContext, 'packy');
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;

  const hallucinations = detectHallucinations(content, 'ziwei');

  return {
    aiInterpretation: content,
    report,
    disclaimer,
    hallucinations: hallucinations.length > 0 ? hallucinations : undefined,
    kbChunks,
  };
}

/**
 * Generate an AI-enriched Tarot reading report.
 */
export async function interpretTarot(
  data: TarotData,
  language: 'en' | 'zh' = 'en'
): Promise<{
  aiInterpretation: string;
  report: ReportResponse;
  disclaimer: string;
  hallucinations?: Hallucination[];
}> {
  const prompt = getTarotReportPrompt(data, language);
  const kbConstraint = language === 'zh' ? KB_CONSTRAINT_ZH : KB_CONSTRAINT_EN;

  const extraSystemContext =
    `You are a Tarot reading expert.\n\n` +
    `SYSTEM CONSTRAINT: ${kbConstraint}`;

  const { content, report } = await callAI(prompt, language, 'analysis', extraSystemContext, 'packy');
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;

  // Tarot uses general pattern detection (no dedicated KB)
  const hallucinations = detectHallucinations(content, 'tarot');

  return {
    aiInterpretation: content,
    report,
    disclaimer,
    hallucinations: hallucinations.length > 0 ? hallucinations : undefined,
  };
}

/**
 * Generate an AI-enriched Yi Jing (易经) hexagram report.
 */
export async function interpretYiJing(
  data: YiJingData,
  language: 'en' | 'zh' = 'en'
): Promise<{
  aiInterpretation: string;
  report: ReportResponse;
  disclaimer: string;
  hallucinations?: Hallucination[];
  kbChunks?: RetrievedChunk[];
}> {
  const userPrompt = getYiJingReportPrompt(data, language);
  const { kbContext, kbChunks } = buildRAGPrompt(userPrompt, 'yijing', language);
  const kbConstraint = language === 'zh' ? KB_CONSTRAINT_ZH : KB_CONSTRAINT_EN;

  const extraSystemContext =
    `You are a Chinese metaphysics Yi Jing (易经) expert.\n\n` +
    `KNOWLEDGE BASE:\n${kbContext}\n\n` +
    `SYSTEM CONSTRAINT: ${kbConstraint}`;

  const { content, report } = await callAI(userPrompt, language, 'analysis', extraSystemContext, 'packy');
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;

  const hallucinations = detectHallucinations(content, 'yijing');

  return {
    aiInterpretation: content,
    report,
    disclaimer,
    hallucinations: hallucinations.length > 0 ? hallucinations : undefined,
    kbChunks,
  };
}

/**
 * Generate an AI-enriched Fortune (人生运势) report.
 */
export async function interpretFortune(
  data: FortuneData,
  language: 'en' | 'zh' = 'en'
): Promise<{
  aiInterpretation: string;
  report: ReportResponse;
  disclaimer: string;
  hallucinations?: Hallucination[];
}> {
  const prompt = getFortuneReportPrompt(data, language);
  const kbConstraint = language === 'zh' ? KB_CONSTRAINT_ZH : KB_CONSTRAINT_EN;

  const extraSystemContext =
    `You are a Chinese metaphysics fortune-telling expert.\n\n` +
    `SYSTEM CONSTRAINT: ${kbConstraint}`;

  const { content, report } = await callAI(prompt, language, 'analysis', extraSystemContext, 'packy');
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;

  const hallucinations = detectHallucinations(content, 'fortune');

  return {
    aiInterpretation: content,
    report,
    disclaimer,
    hallucinations: hallucinations.length > 0 ? hallucinations : undefined,
  };
}

/**
 * Generate a general psychology / self-reflection report via the /ask endpoint.
 */
export async function interpretPsychology(
  data: PsychologyData,
  language: 'en' | 'zh' = 'en'
): Promise<{
  aiInterpretation: string;
  report: ReportResponse;
  disclaimer: string;
  hallucinations?: Hallucination[];
}> {
  const prompt = getPsychologyPrompt(data, language);
  const { content, report } = await callAI(prompt, language, 'analysis', undefined, 'packy');
  const disclaimer = language === 'zh' ? DISCLAIMER_ZH : DISCLAIMER_EN;

  // Psychology doesn't have metaphysics hallucination risks, but we still
  // scan for overconfident/medical claims
  const hallucinations = detectHallucinations(content, 'fortune');

  return {
    aiInterpretation: content,
    report,
    disclaimer,
    hallucinations: hallucinations.length > 0 ? hallucinations : undefined,
  };
}
