import type { ModuleType, UnifiedSection } from './module-result';

export interface IdentityProfile extends UnifiedSection {
  traits?: string[];
  corePattern?: string;
  elementBalance?: Record<string, number>;
}

export interface RelationshipProfile extends UnifiedSection {
  style?: string;
  attractionPattern?: string;
  conflictPattern?: string;
}

export interface CareerProfile extends UnifiedSection {
  workStyle?: string;
  growthPattern?: string;
}

export interface WealthProfile extends UnifiedSection {
  moneyPattern?: string;
  volatility?: string;
}

export interface TimingProfile extends UnifiedSection {
  currentWindow?: string;
  bestPeriods?: string[];
  pressurePeriods?: string[];
}

export interface ActionProfile extends UnifiedSection {
  doMoreOf?: string[];
  avoid?: string[];
  discussSoon?: string[];
}

export interface DestinyProfile {
  id: string;
  userId: string;
  profileId: string;
  identitySummary: IdentityProfile;
  energyProfile: Record<string, unknown>;
  relationshipProfile: RelationshipProfile;
  careerProfile: CareerProfile;
  wealthProfile: WealthProfile;
  timingProfile: TimingProfile;
  actionProfile: ActionProfile;
  riskProfile: UnifiedSection;
  sourceModules: ModuleType[];
  confidenceScore: number;
  lastRecomputedAt?: string;
  createdAt: string;
  updatedAt: string;
}
