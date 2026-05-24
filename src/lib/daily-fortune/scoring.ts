import type { DailyFortuneContextSignals, DailyFortuneScores } from '@/types/daily-fortune';

export function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededOffset(seed: string, salt: string, range = 5): number {
  const raw = stableHash(`${seed}:${salt}`) % (range * 2 + 1);
  return raw - range;
}

export function clampScore(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function includesSignal(values: string[] | undefined, signal: string): boolean {
  return values?.includes(signal) ?? false;
}

export function calculateDailyFortuneScores(params: {
  seed: string;
  context?: DailyFortuneContextSignals;
}): DailyFortuneScores {
  const { seed, context } = params;
  const love = clampScore(
    70
      + (context?.profileSignals?.length ? 5 : 0)
      - (includesSignal(context?.relationshipRisk, 'communication_tension') ? 8 : 0)
      - (includesSignal(context?.relationshipRisk, 'emotional_reactivity') ? 6 : 0)
      + seededOffset(seed, 'love')
  );

  const career = clampScore(
    70
      + (context?.timingWindow === 'supportive' ? 8 : 0)
      - (context?.timingWindow === 'pressure' ? 8 : 0)
      - (includesSignal(context?.careerRisk, 'overload') ? 10 : 0)
      - (includesSignal(context?.careerRisk, 'focus_fragmentation') ? 7 : 0)
      + (context?.monthlyOverlay === 'supportive' ? 5 : 0)
      + seededOffset(seed, 'career')
  );

  const wealth = clampScore(
    68
      - (includesSignal(context?.wealthRisk, 'impulse_spending') ? 10 : 0)
      + (context?.timingWindow === 'supportive' ? 5 : 0)
      - (includesSignal(context?.wealthRisk, 'high_risk_decision') ? 8 : 0)
      + seededOffset(seed, 'wealth')
  );

  const health = clampScore(
    72
      - (includesSignal(context?.healthRisk, 'low_energy') ? 8 : 0)
      - (includesSignal(context?.healthRisk, 'sleep_pressure') ? 8 : 0)
      + seededOffset(seed, 'health'),
    45
  );

  return {
    love,
    career,
    wealth,
    health,
    overall: clampScore(love * 0.25 + career * 0.25 + wealth * 0.25 + health * 0.25),
  };
}
