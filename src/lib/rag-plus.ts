/**
 * RAG++ Engine — TianJi Global
 * Retrieval-Augmented Generation with anti-hallucination constraints.
 * Leverages the structured KB for grounded AI interpretations.
 */

import {
  baziKnowledgeBase,
  buildBaZiCorpus,
  STEM_MEANINGS,
  BRANCH_MEANINGS,
  JIAZI_COMBINATIONS,
  ELEMENT_CYCLE,
  type StemMeaning,
  type BranchMeaning,
  type JiaZiEntry,
  type ElementCycleEntry,
} from '@/data/bazi-knowledge-base';
import {
  ziweiKnowledgeBase,
  buildZiweiCorpus,
  PALACE_MEANINGS,
  STAR_MEANINGS,
  MINGZHU_COMBINATIONS,
  type PalaceMeaning,
  type StarMeaning,
  type MingzhuCombination,
} from '@/data/ziwei-knowledge-base';
import { detectHallucinations } from './hallucination-detector';

export { detectHallucinations };
export type { Hallucination } from './hallucination-detector';

export interface RetrievedChunk {
  id: string;
  content: string;
  source: string;
  relevance: number;
}

interface KBRow {
  id: string;
  content: string;
  source: string;
}

// ─── Keyword scoring helpers ─────────────────────────────────────────────────

function scoreRow(row: KBRow, query: string): number {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const content = row.content.toLowerCase();

  let score = 0;
  for (const term of terms) {
    // Exact substring match gets highest weight
    if (content.includes(term)) score += 1;
    // Chinese char match
    for (const char of term) {
      if (content.includes(char)) score += 0.5;
    }
  }
  return score;
}

function buildBaziRows(): KBRow[] {
  const rows: KBRow[] = [];

  for (const s of STEM_MEANINGS) {
    rows.push({
      id: s.id,
      content:
        `${s.stem} ${s.name_zh} ${s.name_en}. Element: ${s.element_zh} (${s.element_en}). ` +
        `Nature: ${s.nature_zh} | ${s.nature_en}. Direction: ${s.direction_zh} (${s.direction_en}).`,
      source: 'bazi-stem',
    });
  }

  for (const b of BRANCH_MEANINGS) {
    rows.push({
      id: b.id,
      content:
        `${b.branch} ${b.name_zh} ${b.zodiac_zh} (${b.name_en}). ` +
        `Element: ${b.element_zh} (${b.element_en}). ` +
        `Hour: ${b.hour_range}. Month: ${b.month_position}. Direction: ${b.direction_zh} (${b.direction_en}).`,
      source: 'bazi-branch',
    });
  }

  for (const j of JIAZI_COMBINATIONS) {
    rows.push({
      id: j.id,
      content:
        `JiaZi ${j.jiaziName}: ${j.yearNature_zh} | ${j.yearNature_en}. ` +
        `Element: ${j.element_zh} (${j.element_en}). ` +
        `Personality: ${j.personality_zh} | ${j.personality_en}. ` +
        `Strengths: ${j.strengths_zh} | ${j.strengths_en}. ` +
        `Weaknesses: ${j.weaknesses_zh} | ${j.weaknesses_en}. ` +
        `Fortune: ${j.fortune_zh} | ${j.fortune_en}.`,
      source: 'bazi-jiazi',
    });
  }

  for (const e of ELEMENT_CYCLE) {
    rows.push({
      id: `element-${e.element}`,
      content:
        `Element ${e.element_zh} (${e.element_en}): generates ${e.generates_zh} (${e.generates_en}), ` +
        `overcomes ${e.overcomes_zh} (${e.overcomes_en}), weakened by ${e.weakened_by_zh} (${e.weakened_by_en}).`,
      source: 'bazi-element',
    });
  }

  return rows;
}

function buildZiweiRows(): KBRow[] {
  const rows: KBRow[] = [];

  for (const p of PALACE_MEANINGS) {
    rows.push({
      id: p.id,
      content:
        `Palace ${p.palace_zh} (${p.palace_en}): ${p.location_meaning_zh} | ${p.location_meaning_en}. ` +
        `Affairs: ${p.affairs_zh} | ${p.affairs_en}. ` +
        `Personality: ${p.personality_traits_zh} | ${p.personality_traits_en}. ` +
        `Health: ${p.health_zh} | ${p.health_en}. ` +
        `Career: ${p.career_hint_zh} | ${p.career_hint_en}.`,
      source: 'ziwei-palace',
    });
  }

  for (const s of STAR_MEANINGS) {
    rows.push({
      id: s.id,
      content:
        `Star ${s.star_zh} (${s.star_en}, ${s.star_pinyin}): ${s.nature_zh} | ${s.nature_en}. ` +
        `Element: ${s.element_zh} (${s.element_en}). ` +
        `Keywords: ${s.keywords_zh.join(', ')} | ${s.keywords_en.join(', ')}. ` +
        `Fortune: ${s.fortune_zh} | ${s.fortune_en}. Type: ${s.star_type}.`,
      source: 'ziwei-star',
    });
  }

  for (const m of MINGZHU_COMBINATIONS) {
    rows.push({
      id: m.id,
      content:
        `Mingzhu ${m.combination_zh} (${m.combination_en}): ${m.effect_zh} | ${m.effect_en}.`,
      source: 'ziwei-mingzhu',
    });
  }

  return rows;
}

// ─── Yijing KB (basic corpus) ─────────────────────────────────────────────────

function buildYijingRows(): KBRow[] {
  // Yi Jing hexagrams — structural reference only
  const HEXAGRAMS: Array<{
    id: string;
    name: string;
    above: string;
    below: string;
    judgment_zh: string;
    judgment_en: string;
  }> = [
    { id: 'hex-1', name: '乾', above: '天', below: '天', judgment_zh: '元亨利贞', judgment_en: 'Creative / Heaven — Pure Yang' },
    { id: 'hex-2', name: '坤', above: '地', below: '地', judgment_zh: '元亨利牝马之贞', judgment_en: 'Receptive / Earth — Pure Yin' },
    { id: 'hex-3', name: '屯', above: '雷', below: '水', judgment_zh: '元亨利贞，勿用有攸往', judgment_en: 'Difficulty / Sprouting' },
    { id: 'hex-4', name: '蒙', above: '山', below: '水', judgment_zh: '亨。匪我求童蒙，童蒙求我', judgment_en: 'Youthful Folly / Enveloping' },
    { id: 'hex-5', name: '需', above: '水', below: '天', judgment_zh: '有孚，光亨，贞吉', judgment_en: 'Waiting / Nourishment' },
    { id: 'hex-6', name: '讼', above: '天', below: '水', judgment_zh: '有孚，窒惕，中吉', judgment_en: 'Conflict / Contention' },
    { id: 'hex-7', name: '师', above: '地', below: '水', judgment_zh: '贞，大人吉，无咎', judgment_en: 'Army / The Troops' },
    { id: 'hex-8', name: '比', above: '水', below: '地', judgment_zh: '吉。原筮，元永贞', judgment_en: 'Holding Together / Fellowship' },
    { id: 'hex-9', name: '小畜', above: '风', below: '天', judgment_zh: '亨。密云不雨，自我西郊', judgment_en: 'Small Harvest / Taming' },
    { id: 'hex-10', name: '履', above: '天', below: '泽', judgment_zh: '履虎尾，不咥人，亨', judgment_en: 'Conduct / Treading' },
  ];

  return HEXAGRAMS.map((h) => ({
    id: h.id,
    content: `Hexagram ${h.name} (above: ${h.above}, below: ${h.below}): ${h.judgment_zh} | ${h.judgment_en}.`,
    source: 'yijing-hexagram',
  }));
}

// ─── RAG++ Engine ─────────────────────────────────────────────────────────────

export class RAGPlusEngine {
  private baziRows: KBRow[] = [];
  private ziweiRows: KBRow[] = [];
  private yijingRows: KBRow[] = [];
  private currentKB: KBRow[] = [];

  constructor() {
    // Build corpora once at construction
    this.baziRows = buildBaziRows();
    this.ziweiRows = buildZiweiRows();
    this.yijingRows = buildYijingRows();
  }

  loadKnowledgeBase(serviceType: 'bazi' | 'ziwei' | 'yijing'): void {
    if (serviceType === 'bazi') this.currentKB = this.baziRows;
    else if (serviceType === 'ziwei') this.currentKB = this.ziweiRows;
    else if (serviceType === 'yijing') this.currentKB = this.yijingRows;
  }

  /**
   * Retrieve the top-K most relevant KB chunks for a given query.
   * Uses simple keyword matching scored by term frequency.
   */
  retrieve(query: string, topK: number = 5): RetrievedChunk[] {
    if (this.currentKB.length === 0) {
      // Default to bazi if nothing loaded
      this.currentKB = this.baziRows;
    }

    const scored = this.currentKB
      .map((row) => ({ row, score: scoreRow(row, query) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored.map((x) => ({
      id: x.row.id,
      content: x.row.content,
      source: x.row.source,
      relevance: x.score,
    }));
  }

  /**
   * Retrieve chunks for multiple service types (for cross-domain queries).
   */
  retrieveMulti(query: string, serviceTypes: Array<'bazi' | 'ziwei' | 'yijing'>, topK: number = 5): RetrievedChunk[] {
    const allRows: KBRow[] = [];
    for (const st of serviceTypes) {
      if (st === 'bazi') allRows.push(...this.baziRows);
      else if (st === 'ziwei') allRows.push(...this.ziweiRows);
      else if (st === 'yijing') allRows.push(...this.yijingRows);
    }

    return allRows
      .map((row) => ({ row, score: scoreRow(row, query) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((x) => ({ id: x.row.id, content: x.row.content, source: x.row.source, relevance: x.score }));
  }

  /**
   * Build a grounded prompt with KB constraints and citation markers.
   */
  generateWithConstraints(
    prompt: string,
    serviceType: 'bazi' | 'ziwei' | 'yijing',
    userBirthData: Record<string, unknown>,
    language: 'en' | 'zh' = 'en'
  ): { groundedPrompt: string; citations: string[] } {
    this.loadKnowledgeBase(serviceType);
    const chunks = this.retrieve(prompt, 5);

    const kbSection = chunks
      .map((c) => `[KB:${c.id}]\n${c.content}`)
      .join('\n\n');

    const systemConstraint =
      language === 'zh'
        ? '重要：仅根据上述知识库条目回答，不要编造或推断超出知识库范围的信息。'
        : 'IMPORTANT: Only make claims that are directly supported by the knowledge base entries above. Cite sources as [KB:entry_id]. Do NOT invent stars, palaces, elements, or combinations not present in the KB.';

    const groundedPrompt =
      `You are a Chinese metaphysics expert. Use ONLY the following knowledge to answer.\n\n` +
      `KNOWLEDGE BASE:\n${kbSection}\n\n` +
      `USER DATA: ${JSON.stringify(userBirthData)}\n\n` +
      `SYSTEM CONSTRAINT: ${systemConstraint}\n\n` +
      `QUESTION: ${prompt}`;

    return { groundedPrompt, citations: chunks.map((c) => c.id) };
  }

  /**
   * Full RAG++ pipeline: retrieve → build grounded prompt → return structure.
   */
  ragpp(
    query: string,
    serviceType: 'bazi' | 'ziwei' | 'yijing',
    userBirthData: Record<string, unknown>
  ): {
    groundedPrompt: string;
    chunks: RetrievedChunk[];
    citations: string[];
  } {
    this.loadKnowledgeBase(serviceType);
    const chunks = this.retrieve(query, 5);

    const kbSection = chunks
      .map((c) => `[KB:${c.id}]\n${c.content}`)
      .join('\n\n');

    const groundedPrompt =
      `You are a Chinese metaphysics expert. Use ONLY the following knowledge to answer.\n\n` +
      `KNOWLEDGE BASE:\n${kbSection}\n\n` +
      `USER DATA: ${JSON.stringify(userBirthData)}\n\n` +
      `IMPORTANT: Only make claims supported by the knowledge base above. Cite sources as [KB:entry_id].\n\n` +
      `QUESTION: ${query}`;

    return {
      groundedPrompt,
      chunks,
      citations: chunks.map((c) => c.id),
    };
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const ragPlusEngine = new RAGPlusEngine();
