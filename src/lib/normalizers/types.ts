import type { ModuleType, NormalizedPayload } from '@/types/module-result';

export interface ModuleNormalizationOptions {
  title?: string;
  summary?: string;
}

export interface ModuleNormalizer {
  moduleType: ModuleType;
  normalize(raw: Record<string, unknown>, options?: ModuleNormalizationOptions): NormalizedPayload;
}
