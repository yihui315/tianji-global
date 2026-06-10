export type DivinationEvidenceSource =
  | 'relationship'
  | 'tarot'
  | 'astrology'
  | 'vedic'
  | 'question'
  | 'timing'
  | 'safety';

export type DivinationEvidenceStrength = 'low' | 'medium' | 'high';
export type DivinationEvidenceConfidence = 'low' | 'medium' | 'high';

export type DivinationEvidence = {
  summary: string;
  signals: Array<{
    label: string;
    source: DivinationEvidenceSource;
    strength: DivinationEvidenceStrength;
    explanation: string;
  }>;
  confidence: DivinationEvidenceConfidence;
  timingWindow?: string;
  userCanVerify?: string[];
  actionAdvice?: string[];
};

export type DivinationEvidenceRoute = 'ask' | 'draw' | 'relationship';
export type DivinationAccuracyFeedback = 'yes_very' | 'somewhat' | 'not_really';
