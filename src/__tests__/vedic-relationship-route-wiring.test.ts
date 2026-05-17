import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyVedicRelationshipRouteExtension,
  buildVedicRelationshipRouteExtension,
} from '@/lib/astro/vedic/relationship-route-extension';
import { sanitizeRelationshipSharePayload } from '@/lib/trust-copy-guard';
import type { VedicChartData } from '@/lib/astro/vedic/types';

vi.mock('@/lib/ai-orchestrator', () => ({
  generateReport: vi.fn(async () => {
    throw new Error('AI provider disabled for route wiring tests');
  }),
}));

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: () => false,
  getSupabaseAdmin: () => {
    throw new Error('Supabase should not be used in Vedic route wiring tests');
  },
}));

const chartData: VedicChartData = {
  metadata: {
    sourceType: 'manual',
    zodiac: 'sidereal',
    ayanamsa: 'Lahiri',
    warnings: [],
  },
  birth: {
    date: '1994-04-18',
    time: '12:34',
    timezone: 'Asia/Shanghai',
    location: {
      city: 'Synthetic City',
      country: 'Exampleland',
    },
  },
  ascendant: { sign: 'Libra', degree: 4 },
  moonSign: 'Cancer',
  moonNakshatra: { name: 'Pushya', pada: 2, lord: 'Saturn' },
  planets: [
    { planet: 'Moon', sign: 'Cancer', house: 10 },
    { planet: 'Venus', sign: 'Taurus', house: 8 },
    { planet: 'Mars', sign: 'Aries', house: 7 },
    { planet: 'Jupiter', sign: 'Pisces', house: 6 },
  ],
  houses: [{ house: 7, sign: 'Aries', lord: 'Mars' }],
  dashaPeriods: [
    {
      system: 'Vimshottari',
      planet: 'Moon',
      startDate: '2025-01-01',
      endDate: '2035-01-01',
    },
  ],
  warnings: [],
};

const baseReport = {
  summary:
    'A safe base report summary for self-reflection, emotional pacing, and grounded relationship choices.',
  karmicPatterns:
    'Karmic Patterns: notice repeating relationship themes without treating them as fixed fate.',
  relationshipDynamics:
    'Relationship Dynamics: compare closeness, distance, and repair habits through observable behavior.',
  futureTiming:
    'Future Timing: use timing as a reflective planning window, not a fixed outcome.',
  emotionalCompatibility:
    'Emotional Compatibility: compare communication needs and repair patterns.',
  actionableGuidance: [
    'Ask one clear question instead of testing indirectly.',
    'Watch consistent actions over the next week.',
    'Use this report as a journal prompt.',
  ],
  privateReportLink: 'Keep your private result URL for recovery and do not share it broadly.',
  disclaimer:
    'This report is for self-reflection and relationship guidance, not medical, legal, or financial advice.',
  generationMeta: { source: 'fallback' as const },
};

function postRelationship(body: unknown) {
  return new NextRequest('https://tianji.love/api/relationship/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Vedic relationship paid route wiring', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('disabled mode returns skipped metadata and does not alter the relationship report', async () => {
    const extension = await buildVedicRelationshipRouteExtension({
      chartData,
      entitlement: { paid: true },
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'false',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
    });
    const applied = await applyVedicRelationshipRouteExtension({
      report: { ...baseReport },
      chartData,
      entitlement: { paid: true },
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'false',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
    });

    expect(extension).toMatchObject({
      status: 'skipped',
      reason: 'disabled',
      mode: 'disabled',
    });
    expect(applied.report).toEqual(baseReport);
    expect(applied.report).not.toHaveProperty('vedicReport');
  });

  it('preview mode records debug-safe metadata without exposing a full public report', async () => {
    const applied = await applyVedicRelationshipRouteExtension({
      report: { ...baseReport, generationMeta: { ...baseReport.generationMeta } },
      chartData,
      entitlement: { paid: false },
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'preview',
      },
    });

    expect(applied.extension.status).toBe('preview');
    expect(applied.report).not.toHaveProperty('vedicReport');
    expect(applied.report.generationMeta.vedic).toMatchObject({
      status: 'preview',
      mode: 'preview',
      publicReportAttached: false,
    });
    expect(JSON.stringify(applied.report)).not.toMatch(/12:34|Synthetic City|Asia\/Shanghai/i);
  });

  it('paid mode requires paid or pro entitlement', async () => {
    const applied = await applyVedicRelationshipRouteExtension({
      report: { ...baseReport, generationMeta: { ...baseReport.generationMeta } },
      chartData,
      entitlement: { paid: false, pro: false },
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
    });

    expect(applied.extension.status).toBe('locked');
    expect(applied.extension.reason).toBe('missing_entitlement');
    expect(applied.report).not.toHaveProperty('vedicReport');
    expect(applied.report.generationMeta.vedic).toMatchObject({
      status: 'locked',
      publicReportAttached: false,
    });
  });

  it('does not allow unpaid users to receive a full Vedic report', async () => {
    const extension = await buildVedicRelationshipRouteExtension({
      chartData,
      entitlement: undefined,
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
    });

    expect(extension.status).toBe('locked');
    expect(extension.fullReportMarkdown).toBeNull();
    expect(JSON.stringify(extension)).not.toMatch(/12:34|Synthetic City|Asia\/Shanghai/i);
  });

  it('attaches Vedic sections for a paid user when paid mode and chart data are present', async () => {
    const applied = await applyVedicRelationshipRouteExtension({
      report: { ...baseReport, generationMeta: { ...baseReport.generationMeta } },
      chartData,
      entitlement: { paid: true, product: 'solo_love_report' },
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
    });

    expect(applied.extension.status).toBe('generated');
    expect(applied.report.vedicReport?.sections).toContain('Core Love Signature');
    expect(applied.report.vedicReport?.fullReportMarkdown).toContain('## Ask Follow-up Suggestions');
    expect(applied.report.vedicReport?.fullReportMarkdown).toContain('## Draw Three Cards Follow-up Suggestions');
    expect(JSON.stringify(applied.report.vedicReport)).not.toMatch(
      /guarantee|definitely|destined|will marry|will divorce|disaster|pay now/i
    );
  });

  it('keeps free relationship analyze behavior unchanged even when Vedic flags are enabled', async () => {
    vi.stubEnv('NEXT_PUBLIC_TIANJI_VEDIC_ENABLED', 'true');
    vi.stubEnv('TIANJI_VEDIC_REPORT_MODE', 'paid');

    const { POST } = await import('@/app/api/relationship/analyze/route');
    const response = await POST(postRelationship({
      relationType: 'romantic',
      lang: 'en',
      personA: { nickname: 'Alex', birthDate: '1992-05-11', birthTime: '08:30' },
      personB: { nickname: 'Jordan', birthDate: '1994-09-21', birthTime: '21:15' },
    }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.aiMeta).toMatchObject({ gatewayIntent: 'relationship-report' });
    expect(json.data).not.toHaveProperty('vedicReport');
    expect(JSON.stringify(json.data)).not.toMatch(/08:30|21:15|birthLocation|timezone|raw Kundli/i);

  });

  it('wires the adapter into the paid love report generator when safe chart data is provided', async () => {
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_TIANJI_VEDIC_ENABLED', 'true');
    vi.stubEnv('TIANJI_VEDIC_REPORT_MODE', 'paid');

    const { generateLoveReport } = await import('@/lib/love-report-generator');
    const report = await generateLoveReport({
      sessionId: '00000000-0000-4000-8000-000000000001',
      readingMode: 'solo',
      vedicChartData: chartData,
      vedicEntitlement: { paid: true, product: 'solo_love_report' },
    });

    expect(report.vedicReport?.sections).toContain('Core Love Signature');
    expect(report.vedicReport?.fullReportMarkdown).toContain('## Love Timing Windows');
    expect(report.generationMeta.vedic).toMatchObject({
      status: 'generated',
      mode: 'paid',
      publicReportAttached: true,
    });
    expect(JSON.stringify(report.vedicReport)).not.toMatch(/12:34|Synthetic City|Asia\/Shanghai/i);
  });

  it('keeps public/share output free of birth time, birth location, timezone, and raw Kundli text', async () => {
    const applied = await applyVedicRelationshipRouteExtension({
      report: { ...baseReport, generationMeta: { ...baseReport.generationMeta } },
      chartData,
      entitlement: { paid: true },
      env: {
        NEXT_PUBLIC_TIANJI_VEDIC_ENABLED: 'true',
        TIANJI_VEDIC_REPORT_MODE: 'paid',
      },
    });

    const safePayload = sanitizeRelationshipSharePayload(
      { include_birth_data: true },
      {
        ...applied.report,
        birthTime: '12:34',
        birthLocation: 'Synthetic City',
        timezone: 'Asia/Shanghai',
        rawKundliText: 'raw kundli should not be public',
      }
    );

    expect(JSON.stringify(applied.report.vedicReport?.publicSummary)).not.toMatch(
      /12:34|Synthetic City|Asia\/Shanghai|raw kundli/i
    );
    expect(JSON.stringify(safePayload)).not.toMatch(
      /birthTime|birthLocation|timezone|rawKundliText|12:34|Synthetic City|Asia\/Shanghai|raw kundli/i
    );
  });
});
