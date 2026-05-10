import { describe, expect, it } from 'vitest';
import {
  buildDailyFortuneCacheKey,
  generateDailyFortuneReport,
} from '@/lib/daily-fortune/generator';

const baseInput = {
  userId: '11111111-1111-4111-8111-111111111111',
  profileId: '22222222-2222-4222-8222-222222222222',
  date: '2026-05-10',
  timezone: 'Asia/Singapore',
  systemType: 'bazi' as const,
  language: 'zh' as const,
  tier: 'free' as const,
};

describe('daily fortune generator', () => {
  it('returns deterministic reports for the same user, profile, date, system, language, and tier', () => {
    const first = generateDailyFortuneReport(baseInput);
    const second = generateDailyFortuneReport(baseInput);

    expect(first).toEqual(second);
    expect(first.cacheKey).toBe(
      'daily_fortune:11111111-1111-4111-8111-111111111111:22222222-2222-4222-8222-222222222222:2026-05-10:bazi:zh:free'
    );
  });

  it('keeps all scores within 0-100 and always includes a disclaimer', () => {
    const report = generateDailyFortuneReport(baseInput);

    Object.values(report.scores).forEach((score) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
    expect(report.disclaimer).toContain('自我观察');
  });

  it('uses profile signals when destiny context is available', () => {
    const report = generateDailyFortuneReport({
      ...baseInput,
      destinyProfile: {
        relationshipRisk: ['communication_tension'],
        careerRisk: ['overload'],
        wealthRisk: ['impulse_spending'],
        healthRisk: ['sleep_pressure'],
        profileSignals: ['profile signal'],
      },
    });

    expect(report.drivers.some((driver) => driver.key === 'profile_signal')).toBe(true);
    expect(report.riskTags.map((risk) => risk.tag)).toEqual(
      expect.arrayContaining(['communication_tension', 'overload', 'impulse_spending', 'sleep_pressure'])
    );
  });

  it('does not emit medical diagnosis or investment advice for low health and wealth scores', () => {
    const report = generateDailyFortuneReport({
      ...baseInput,
      destinyProfile: {
        wealthRisk: ['high_risk_decision', 'impulse_spending'],
        healthRisk: ['low_energy', 'sleep_pressure'],
      },
    });

    const text = JSON.stringify(report);
    expect(text).not.toMatch(/诊断|治疗|投资建议|保证发财/);
    expect(report.riskTags.map((risk) => risk.tag)).toEqual(
      expect.arrayContaining(['high_risk_decision', 'low_energy'])
    );
  });
});

describe('buildDailyFortuneCacheKey', () => {
  it('uses none for missing profile id', () => {
    expect(
      buildDailyFortuneCacheKey({
        userId: 'user-1',
        date: '2026-05-10',
        systemType: 'bazi',
        language: 'en',
        tier: 'pro',
      })
    ).toBe('daily_fortune:user-1:none:2026-05-10:bazi:en:pro');
  });
});
