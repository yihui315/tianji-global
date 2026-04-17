export type PlanType = 'free' | 'premium' | 'pro';

export interface EntitlementFeatures {
  unifiedProfile: boolean;
  deepRelationship: boolean;
  longTimeline: boolean;
  premiumAdvice: boolean;
  exportPdf: boolean;
  multiProfile: boolean;
  advisorMode: boolean;
}

export interface Entitlement {
  id: string;
  userId: string;
  plan: PlanType;
  features: EntitlementFeatures;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
}
