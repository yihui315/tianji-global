/**
 * RAG++ Engine — TianJi Global
 * Retrieval-Augmented Generation with anti-hallucination constraints.
 * Leverages the structured KB for grounded AI interpretations.
 *
 * Enhancements v2:
 * - Full Tarot KB support with card retrieval
 * - Cross-service retrieval (bazi/ziwei/yijing/tarot)
 * - Citation verification (checks if AI output actually cites KB entries)
 * - Confidence scoring based on KB coverage
 * - Structured JSON schema constraints for AI output
 */

import {
  buildBaZiCorpus,
  STEM_MEANINGS,
  BRANCH_MEANINGS,
  JIAZI_COMBINATIONS,
  ELEMENT_CYCLE,
  STEM_COMBINATIONS,
  BRANCH_COMBINATIONS,
  type StemMeaning,
  type BranchMeaning,
  type JiaZiEntry,
  type ElementCycleEntry,
} from '@/data/bazi-knowledge-base';
import {
  buildZiweiCorpus,
  PALACE_MEANINGS,
  STAR_MEANINGS,
  MINGZHU_COMBINATIONS,
  STAR_GROUPS,
  PALACE_STAR_INFLUENCE,
  type PalaceMeaning,
  type StarMeaning,
  type MingzhuCombination,
} from '@/data/ziwei-knowledge-base';
import {
  TAROT_CARDS,
  TAROT_MAJOR_ARCANA,
  TAROT_WANDS,
  TAROT_CUPS,
  TAROT_SWORDS,
  TAROT_PENTACLES,
  buildTarotCorpus,
  getCardByName,
  type TarotCard,
} from '@/data/tarot-knowledge-base';
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

// ─── Service Types ─────────────────────────────────────────────────────────────

export type ServiceType = 'bazi' | 'ziwei' | 'yijing' | 'tarot';

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

  for (const sc of STEM_COMBINATIONS) {
    rows.push({
      id: sc.id,
      content:
        `Stem Combination ${sc.combination}: ${sc.meaning_zh} | ${sc.meaning_en}. ` +
        `Interaction: ${sc.interaction_zh} | ${sc.interaction_en}. ` +
        `Example: ${sc.example_zh} | ${sc.example_en}.`,
      source: 'bazi-stem-combo',
    });
  }

  for (const bc of BRANCH_COMBINATIONS) {
    rows.push({
      id: bc.id,
      content:
        `Branch Combination ${bc.combination}: ${bc.meaning_zh} | ${bc.meaning_en}. ` +
        `Compatibility: ${bc.compat_zh} | ${bc.compat_en}.`,
      source: 'bazi-branch-combo',
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

  for (const g of STAR_GROUPS) {
    rows.push({
      id: g.id,
      content:
        `Star Group ${g.group_name_zh} (${g.group_name_en}): ${g.description_zh} | ${g.description_en}. ` +
        `Stars: ${g.stars.join(', ')}.`,
      source: 'ziwei-star-group',
    });
  }

  for (const psi of PALACE_STAR_INFLUENCE) {
    rows.push({
      id: psi.palaceId + '-' + psi.starId,
      content:
        `Palace-Star Influence: ${psi.influence_zh} | ${psi.influence_en}. Strength: ${psi.strength}.`,
      source: 'ziwei-palace-star',
    });
  }

  return rows;
}

function buildYijingRows(): KBRow[] {
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
    { id: 'hex-11', name: '泰', above: '地', below: '天', judgment_zh: '小往大来，吉亨', judgment_en: 'Peace / Spring' },
    { id: 'hex-12', name: '否', above: '天', below: '地', judgment_zh: '否之匪人，不利君子贞', judgment_en: 'Standstill / Winter' },
    { id: 'hex-13', name: '同人', above: '天', below: '火', judgment_zh: '同人于野，亨', judgment_en: 'Fellowship / Harmony' },
    { id: 'hex-14', name: '大有', above: '火', below: '天', judgment_zh: '大有，元亨', judgment_en: 'Great Possession / Harvest' },
    { id: 'hex-15', name: '谦', above: '地', below: '山', judgment_zh: '谦，亨，君子有终', judgment_en: 'Modesty / Humility' },
    { id: 'hex-16', name: '豫', above: '雷', below: '地', judgment_zh: '豫，利建侯行师', judgment_en: 'Enthusiasm / Zeal' },
    { id: 'hex-17', name: '随', above: '泽', below: '雷', judgment_zh: '随，元亨利贞，无咎', judgment_en: 'Following / Flexibility' },
    { id: 'hex-18', name: '蛊', above: '山', below: '风', judgment_zh: '蛊，元亨利涉大川', judgment_en: 'Decay / Disorder' },
    { id: 'hex-19', name: '临', above: '地', below: '泽', judgment_zh: '临，元亨利贞', judgment_en: 'Approach / Nearing' },
    { id: 'hex-20', name: '观', above: '风', below: '地', judgment_zh: '观，盥而不荐，有孚颙若', judgment_en: 'Contemplation / Watching' },
  ];

  return HEXAGRAMS.map((h) => ({
    id: h.id,
    content: `Hexagram ${h.name} (above: ${h.above}, below: ${h.below}): ${h.judgment_zh} | ${h.judgment_en}.`,
    source: 'yijing-hexagram',
  }));
}

function buildTarotRows(): KBRow[] {
  return buildTarotCorpus();
}

// ─── RAG++ Engine ─────────────────────────────────────────────────────────────

export class RAGPlusEngine {
  private baziRows: KBRow[] = [];
  private ziweiRows: KBRow[] = [];
  private yijingRows: KBRow[] = [];
  private tarotRows: KBRow[] = [];
  private currentKB: KBRow[] = [];

  constructor() {
    this.baziRows = buildBaziRows();
    this.ziweiRows = buildZiweiRows();
    this.yijingRows = buildYijingRows();
    this.tarotRows = buildTarotRows();
  }

  loadKnowledgeBase(serviceType: ServiceType): void {
    switch (serviceType) {
      case 'bazi':
        this.currentKB = this.baziRows;
        break;
      case 'ziwei':
        this.currentKB = this.ziweiRows;
        break;
      case 'yijing':
        this.currentKB = this.yijingRows;
        break;
      case 'tarot':
        this.currentKB = this.tarotRows;
        break;
    }
  }

  /**
   * Retrieve the top-K most relevant KB chunks for a given query.
   */
  retrieve(query: string, topK: number = 5): RetrievedChunk[] {
    if (this.currentKB.length === 0) {
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
   * Retrieve chunks for multiple service types.
   */
  retrieveMulti(
    query: string,
    serviceTypes: ServiceType[],
    topK: number = 5
  ): RetrievedChunk[] {
    const allRows: KBRow[] = [];
    for (const st of serviceTypes) {
      switch (st) {
        case 'bazi':
          allRows.push(...this.baziRows);
          break;
        case 'ziwei':
          allRows.push(...this.ziweiRows);
          break;
        case 'yijing':
          allRows.push(...this.yijingRows);
          break;
        case 'tarot':
          allRows.push(...this.tarotRows);
          break;
      }
    }

    return allRows
      .map((row) => ({ row, score: scoreRow(row, query) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((x) => ({
        id: x.row.id,
        content: x.row.content,
        source: x.row.source,
        relevance: x.score,
      }));
  }

  /**
   * Verify if AI output contains valid KB citations.
   * Returns a report of found citations and any that couldn't be verified.
   */
  verifyCitations(
    aiOutput: string,
    serviceType: ServiceType
  ): { validCitations: string[]; invalidCitations: string[]; coverage: number } {
    // Extract all [KB:xxx] citations from the text
    const citationPattern = /\[KB:([^\]]+)\]/g;
    const citations: string[] = [];
    let match;
    while ((match = citationPattern.exec(aiOutput)) !== null) {
      citations.push(match[1]);
    }

    // Load the appropriate KB
    this.loadKnowledgeBase(serviceType);
    const validIds = new Set(this.currentKB.map((r) => r.id));

    const validCitations: string[] = [];
    const invalidCitations: string[] = [];

    for (const cite of citations) {
      if (validIds.has(cite)) {
        validCitations.push(cite);
      } else {
        invalidCitations.push(cite);
      }
    }

    const totalMentions = citations.length;
    const coverage = totalMentions > 0 ? validCitations.length / totalMentions : 1.0;

    return { validCitations, invalidCitations, coverage };
  }

  /**
   * Build a grounded prompt with KB constraints and structured output schema.
   */
  generateWithConstraints(
    prompt: string,
    serviceType: ServiceType,
    userBirthData: Record<string, unknown>,
    language: 'en' | 'zh' = 'en'
  ): { groundedPrompt: string; citations: string[]; structuredSchema: string } {
    this.loadKnowledgeBase(serviceType);
    const chunks = this.retrieve(prompt, 5);

    const kbSection = chunks
      .map((c) => `[KB:${c.id}]\n${c.content}`)
      .join('\n\n');

    const schemas: Record<ServiceType, string> = {
      bazi: `{ "stem_analysis": "...", "branch_analysis": "...", "element_balance": "...", "jiazi_interpretation": "...", "strengths": "...", "weaknesses": "...", "fortune_outlook": "..." }`,
      ziwei: `{ "life_palace": "...", "star_configurations": "...", "palace_interactions": "...", "career_advice": "...", "relationship_insights": "...", "health_outlook": "..." }`,
      yijing: `{ "hexagram_name": "...", "trigrams": "...", "judgment_interpretation": "...", "line_commentaries": "...", "application_advice": "..." }`,
      tarot: `{ "card_name": "...", "arcana": "...", "position": "...", "upright_meaning": "...", "reversed_meaning": "...", "symbolism": "...", "advice": "..." }`,
    };

    const systemConstraint =
      language === 'zh'
        ? '重要：仅根据上述知识库条目回答，不要编造或推断超出知识库范围的信息。引用来源时请使用 [KB:entry_id] 格式。'
        : 'IMPORTANT: Only make claims that are directly supported by the knowledge base entries above. Cite sources as [KB:entry_id]. Do NOT invent stars, palaces, elements, or combinations not present in the KB.';

    const structuredConstraint =
      language === 'zh'
        ? `请使用以下JSON格式回复，不要添加额外的字段：\n${schemas[serviceType]}`
        : `Please respond using this exact JSON schema, no additional fields:\n${schemas[serviceType]}`;

    const groundedPrompt =
      `You are a Chinese metaphysics expert. Use ONLY the following knowledge to answer.\n\n` +
      `KNOWLEDGE BASE:\n${kbSection}\n\n` +
      `USER DATA: ${JSON.stringify(userBirthData)}\n\n` +
      `SYSTEM CONSTRAINT: ${systemConstraint}\n\n` +
      `OUTPUT SCHEMA: ${structuredConstraint}\n\n` +
      `QUESTION: ${prompt}`;

    return { groundedPrompt, citations: chunks.map((c) => c.id), structuredSchema: schemas[serviceType] };
  }

  /**
   * Full RAG++ pipeline: retrieve → build grounded prompt → return structure.
   */
  ragpp(
    query: string,
    serviceType: ServiceType,
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

  /**
   * Get tarot card by name for targeted retrieval.
   */
  getTarotCard(name: string): TarotCard | undefined {
    return getCardByName(name);
  }

  /**
   * Calculate KB coverage score for a given query.
   * Returns 0-1 indicating how well the KB covers the query domain.
   */
  calculateKBCoverage(query: string, serviceType: ServiceType): number {
    const serviceKeywords: Record<ServiceType, string[]> = {
      bazi: ['八字', '四柱', '天干', '地支', '五行', '甲子', '命理', '日元', '月令', '时支'],
      ziwei: ['紫微', '斗数', '星曜', '宫位', '命宫', '财帛', '官禄', '迁移', '福德', '天机', '太阳'],
      yijing: ['易经', '卦象', '六十四卦', '乾', '坤', '震', '巽', '坎', '离', '艮', '兑', '爻', '变爻'],
      tarot: ['塔罗', 'tarot', 'card', 'major', 'minor', '权杖', '圣杯', '宝剑', '星币', '大阿尔卡纳', '小阿尔卡纳'],
    };

    const keywords = serviceKeywords[serviceType];
    const queryLower = query.toLowerCase();
    let matchCount = 0;
    for (const kw of keywords) {
      if (queryLower.includes(kw.toLowerCase())) {
        matchCount++;
      }
    }
    return Math.min(1.0, matchCount / Math.max(1, keywords.length));
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const ragPlusEngine = new RAGPlusEngine();
