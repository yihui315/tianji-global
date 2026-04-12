// ─── Relationship System Types ────────────────────────────────────────────────

export type RelationshipType = 'romantic' | 'friendship' | 'work';
export type ShareMode = 'summary' | 'chart_only' | 'insight_card';
export type Visibility = 'private' | 'hidden_birth_data';
export type EventType = 'peak' | 'transition' | 'pressure' | 'stability';

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface RelationshipProfile {
  id: string;
  userId?: string;
  nickname: string;
  relationType: RelationshipType;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  timezone?: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  dominantElement?: string;
  visibility: Visibility;
  createdAt: string;
}

// ─── Five Dimensions ──────────────────────────────────────────────────────────

export interface RelationshipDimensionScore {
  score: number; // 0–100
  label: string; // e.g. "High Attraction, Moderate Tension"
  summary: string;
  strengths: string[];
  risks: string[];
  advice: string[];
}

export interface RelationshipDimensions {
  attraction: RelationshipDimensionScore;
  communication: RelationshipDimensionScore;
  conflict: RelationshipDimensionScore;
  rhythm: RelationshipDimensionScore;
  longTerm: RelationshipDimensionScore;
}

// ─── Main Reading ─────────────────────────────────────────────────────────────

export interface RelationshipSummary {
  headline: string;
  oneLiner: string;
  keywords: string[];
}

export interface RelationshipTimeline {
  currentPhase: string;
  next30Days: string;
  next90Days?: string;
}

export interface RelationshipReading {
  id: string;
  userId?: string;
  profileAId?: string;
  profileBId?: string;
  relationType: RelationshipType;

  personA: {
    nickname: string;
    profileId?: string;
  };
  personB: {
    nickname: string;
    profileId?: string;
  };

  overallScore: number;
  dimensions: RelationshipDimensions;
  summary: RelationshipSummary;
  timeline?: RelationshipTimeline;

  isPremium: boolean;
  createdAt: string;
}

// ─── Share ───────────────────────────────────────────────────────────────────

export interface RelationshipShareSettings {
  includeNames: boolean;
  includeBirthData: boolean;
  shareMode: ShareMode;
}

export interface RelationshipShare {
  id: string;
  relationshipReadingId: string;
  publicSlug: string;
  shareMode: ShareMode;
  includeNames: boolean;
  includeBirthData: boolean;
  viewCount: number;
  createdAt: string;
}

// ─── API Request / Response ──────────────────────────────────────────────────

export interface AnalyzeRelationshipRequest {
  relationType: RelationshipType;
  personA: {
    nickname: string;
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
    timezone?: string;
  };
  personB: {
    nickname: string;
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
    timezone?: string;
  };
  premium?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Compatibility Scoring Features ───────────────────────────────────────────
// Extracted from individual readings to drive relationship scoring

export interface CompatibilityFeatures {
  dominantElements: string[];
  weakElements: string[];
  paceType: 'fast' | 'steady' | 'slow';
  communicationType: 'direct' | 'reflective' | 'guarded';
  intimacyType: 'open' | 'selective' | 'cautious';
  stabilityType: 'stable' | 'volatile' | 'adaptive';
}
