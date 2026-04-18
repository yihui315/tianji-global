// ─── Core Reading Types ────────────────────────────────────────────────────────

export type ReadingType = 'western' | 'bazi' | 'ziwei';
export type Language = 'zh' | 'en';

export interface ReadingUser {
  name?: string;
  birthDate: string;
  birthTime?: string;
  location?: string;
  lat?: number;
  lng?: number;
}

export interface ReadingSummary {
  keywords: string[];
  headline: string;
  tagline?: string; // 英文副标题
}

export interface ElementScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

// ─── Chart Data ────────────────────────────────────────────────────────────────

export interface WesternChartData {
  /** Convenience alias — same data as sun */
  bigThree: {
    sun: { sign: string; signZh: string; symbol: string; degree: number; };
    moon: { sign: string; signZh: string; symbol: string; degree: number; };
    rising: { sign: string; signZh: string; symbol: string; degree: number; };
  };
  sun: { sign: string; signZh: string; symbol: string; degree: number; };
  moon: { sign: string; signZh: string; symbol: string; degree: number; };
  rising: { sign: string; signZh: string; symbol: string; degree: number; };
  planets: PlanetData[];
  houses: {
    ascendant: number;
    ascendantSign: string;
    ascendantSignZh: string;
    midheaven: number;
    mcSign: string;
    mcSignZh: string;
  };
}

export interface PlanetData {
  name: string;
  symbol: string;
  sign: string;
  signZh: string;
  degree: number;
  longitude: number;
  signSymbol: string;
}

export interface BaZiChartData {
  year: { stem: string; branch: string; element: string; };
  month: { stem: string; branch: string; element: string; };
  day: { stem: string; branch: string; element: string; };
  hour: { stem: string; branch: string; element: string; };
  dayMaster: string;
  strongElements: string[];
  weakElements: string[];
}

export interface ZiWeiChartData {
  mingGong: { palace: string; stars: string[]; };
  tianyuan: { palace: string; stars: string[]; };
  mainStars: string[];
  transformationStars: string[];
}

// ─── Narrative Insight Block ─────────────────────────────────────────────────
// Three-layer narrative structure per insight module.
// Mirrors Codebase Onboarding Engineer output discipline:
//   1. Resonance hook  — one sentence, emotional connection
//   2. Deep dive       — evidence, analysis, nuance
//   3. Action closure   — specific, grounded guidance

export interface NarrativeBlock {
  hook: string;    // 一句话共鸣开场（情感锚点）
  body: string;    // 深度展开（证据+分析）
  closure: string; // 行动收尾（具体指引）
}

export interface ReadingInsights {
  structure: NarrativeBlock;   // 能量结构分析 (always free)
  relationship: NarrativeBlock; // 关系模式 (premium)
  career: NarrativeBlock;       // 事业发展 (premium)
  risk: NarrativeBlock;         // 风险预警 (premium)
}

// ─── Application Modules ──────────────────────────────────────────────────────
// Three-layer narrative structure mapping:
//   hook  → current（共鸣开场，当前状态）
//   body  → trend（深度分析，未来趋势逻辑）
//   closure → advice list（行动收尾，3条具体建议）

export interface ApplicationModule {
  hook: string;       // 共鸣开场（当前状态，一句话锚定）
  body: string;       // 深度展开（未来趋势+内在逻辑）
  advice: string[];   // 行动收尾（3条具体可执行建议）
}

export interface ReadingApplications {
  love: ApplicationModule;    // 感情关系 (premium)
  career: ApplicationModule;  // 事业发展 (premium)
  wealth: ApplicationModule;  // 财富运势 (premium)
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelinePhase {
  ageRange: string;       // "18-25"
  label: string;          // "探索期"
  labelEn: string;
  isCurrent?: boolean;
  description: string;    // 详细描述 (premium)
  summary: string;        // 简短摘要 (free)
  overall: number;        // 0-100 综合运势
  career: number;
  love: number;
  wealth: number;
  health: number;
}

export interface ReadingTimeline {
  phases: TimelinePhase[];
  currentPhase: number; // index into phases
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export interface ReadingActions {
  do: string[];    // 宜
  avoid: string[]; // 忌
}

// ─── Full Reading ─────────────────────────────────────────────────────────────

export interface Reading {
  id: string;
  user: ReadingUser;
  type: ReadingType;
  language: Language;
  summary: ReadingSummary;
  chart: {
    western?: WesternChartData;
    bazi?: BaZiChartData;
    ziwei?: ZiWeiChartData;
    elements: ElementScores;
  };
  insights: ReadingInsights;
  applications: ReadingApplications;
  timeline: ReadingTimeline;
  actions: ReadingActions;
  isPremium: boolean;
  createdAt: string;
  expiresAt?: string;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface CreateReadingRequest {
  type: ReadingType;
  user: ReadingUser;
  language?: Language;
}

export interface CreateReadingResponse {
  id: string;
  reading: Reading;
}

export interface GetReadingRequest {
  id: string;
}

// ─── Share Card ───────────────────────────────────────────────────────────────

export interface ShareCardData {
  headline: string;
  keywords: string[];
  type: ReadingType;
  readingId: string;
  birthDate: string;
}
