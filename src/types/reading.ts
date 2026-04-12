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

// ─── Insights ─────────────────────────────────────────────────────────────────

export interface ReadingInsights {
  structure: string;      // 能量结构分析 (always free)
  relationship: string;   // 关系模式 (premium)
  career: string;          // 事业发展 (premium)
  risk: string;           // 风险预警 (premium)
}

// ─── Application Modules ──────────────────────────────────────────────────────

export interface ApplicationModule {
  current: string;   // 当前状态
  trend: string;     // 未来趋势
  advice: string[];  // 行动建议
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
