export const MODULE_TYPES = [
  'bazi',
  'ziwei',
  'western',
  'numerology',
  'fortune',
  'relationship',
  'tarot',
  'yijing',
  'fengshui',
  'electional',
  'transit',
  'solar-return',
] as const;

export type ModuleType = (typeof MODULE_TYPES)[number];

export interface UnifiedSection {
  headline?: string;
  summary?: string;
  strengths?: string[];
  risks?: string[];
  opportunities?: string[];
  advice?: string[];
  confidence?: number;
}

export interface TimelinePhase {
  range: string;
  label: string;
  description: string;
}

export interface NormalizedPayload {
  summary: {
    headline?: string;
    oneLiner?: string;
    keywords?: string[];
  };
  structure?: Record<string, unknown>;
  chart?: Record<string, unknown>;
  identity?: UnifiedSection;
  relationship?: UnifiedSection;
  career?: UnifiedSection;
  wealth?: UnifiedSection;
  timing?: UnifiedSection;
  advice?: UnifiedSection;
  risk?: UnifiedSection;
  timeline?: {
    currentPhase?: string;
    next30Days?: string;
    next90Days?: string;
    phases?: TimelinePhase[];
  };
}

export interface ModuleResult {
  id: string;
  sessionId: string;
  userId: string;
  profileId: string;
  moduleType: ModuleType;
  version: string;
  title?: string;
  summary?: string;
  rawPayload: Record<string, unknown>;
  normalizedPayload: NormalizedPayload;
  confidenceScore?: number;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}
