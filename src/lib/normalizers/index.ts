import type { ModuleType, NormalizedPayload } from '@/types/module-result';
import { baziNormalizer } from './bazi';
import { fortuneNormalizer } from './fortune';
import { relationshipNormalizer } from './relationship';
import { tarotNormalizer } from './tarot';
import { westernNormalizer } from './western';
import { yijingNormalizer } from './yijing';
import { ziweiNormalizer } from './ziwei';
import type { ModuleNormalizationOptions, ModuleNormalizer } from './types';

const normalizers = new Map<ModuleType, ModuleNormalizer>([
  [baziNormalizer.moduleType, baziNormalizer],
  [ziweiNormalizer.moduleType, ziweiNormalizer],
  [fortuneNormalizer.moduleType, fortuneNormalizer],
  [relationshipNormalizer.moduleType, relationshipNormalizer],
  [westernNormalizer.moduleType, westernNormalizer],
  [tarotNormalizer.moduleType, tarotNormalizer],
  [yijingNormalizer.moduleType, yijingNormalizer],
]);

export function normalizeModulePayload(
  moduleType: ModuleType,
  raw: Record<string, unknown>,
  options?: ModuleNormalizationOptions
): NormalizedPayload {
  const normalizer = normalizers.get(moduleType);

  if (!normalizer) {
    return {
      summary: {
        headline: options?.title,
        oneLiner: options?.summary,
      },
      structure: {},
      chart: {},
      identity: {},
      relationship: {},
      career: {},
      wealth: {},
      timing: {},
      advice: {},
      risk: {},
      timeline: {},
    };
  }

  return normalizer.normalize(raw, options);
}

export {
  baziNormalizer,
  fortuneNormalizer,
  relationshipNormalizer,
  tarotNormalizer,
  westernNormalizer,
  yijingNormalizer,
  ziweiNormalizer,
};
export type { ModuleNormalizationOptions, ModuleNormalizer } from './types';
