export type SystemType = 'bazi' | 'ziwei' | 'qizheng' | 'western';

export interface CoherenceViolation {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  found: string[];
}

export interface CoherenceResult {
  valid: boolean;
  violations: CoherenceViolation[];
  confidence: number;
  checked_at: string;
  system: SystemType;
}

export interface ColorSemantics {
  [color: string]: {
    [system in SystemType]?: string;
  };
}
