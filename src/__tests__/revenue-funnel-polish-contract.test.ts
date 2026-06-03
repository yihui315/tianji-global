import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { sanitizeClientAnalyticsPayload } from '@/lib/analytics/client';
import {
  DAILY_ORACLE_CONVERSION_EVENTS,
  LOVE_TEST_CONVERSION_EVENTS,
  isRevenueFunnelEventName,
} from '@/lib/analytics/funnel-events';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Tianji Love evidence revenue contract', () => {
  it('keeps Ask preview and unlock evidence wired to the paid boundary', () => {
    const askPage = read('src/app/(main)/ask/page.tsx');
    const previewRoute = read('src/app/api/ask/preview/route.ts');
    const unlockRoute = read('src/app/api/ask/unlock/route.ts');

    expect(askPage).toContain('DivinationEvidenceCard');
    expect(askPage).toContain('preview.evidence');
    expect(askPage).toContain('unlocked.evidence');
    expect(previewRoute).toContain('buildAskEvidence');
    expect(previewRoute).toContain('paid: false');
    expect(unlockRoute).toContain('buildAskEvidence');
    expect(unlockRoute).toContain('paid: true');
    expect(unlockRoute).toContain('metadata');
    expect(askPage).not.toMatch(/guaranteed outcome|certain future|medical advice|legal advice|financial advice/i);
  });

  it('keeps Draw preview and unlock evidence wired to the paid boundary', () => {
    const drawPage = read('src/app/(main)/draw/page.tsx');
    const previewRoute = read('src/app/api/draw/preview/route.ts');
    const unlockRoute = read('src/app/api/draw/unlock/route.ts');

    expect(drawPage).toContain('DivinationEvidenceCard');
    expect(drawPage).toContain('preview.evidence');
    expect(drawPage).toContain('unlocked.evidence');
    expect(previewRoute).toContain('buildDrawEvidence');
    expect(previewRoute).toContain('paid: false');
    expect(unlockRoute).toContain('buildDrawEvidence');
    expect(unlockRoute).toContain('paid: true');
    expect(drawPage).not.toMatch(/guaranteed prediction|guaranteed future|certain future/i);
  });

  it('adds evidence analytics without allowing private payload fields', () => {
    const evidenceEvents = read('src/lib/analytics/divination-events.ts');
    const client = read('src/lib/analytics/client.ts');
    const trackRoute = read('src/app/api/analytics/track/route.ts');

    for (const eventName of [
      'divination_evidence_viewed',
      'divination_evidence_expand_clicked',
      'divination_accuracy_feedback_submitted',
      'paid_unlock_from_evidence_clicked',
    ]) {
      expect(evidenceEvents).toContain(eventName);
    }

    expect(evidenceEvents).toContain('buildDivinationEvidenceAnalyticsPayload');
    expect(evidenceEvents).toContain('sourceTypes');
    expect(client).toContain('sanitizeClientAnalyticsPayload');
    expect(trackRoute).toContain('z.array(z.string())');
    expect(evidenceEvents).not.toMatch(/rawQuestion|birthDate|birthTime|birthLocation|timezone|fullReport|prompt/i);
  });

  it('sanitizes analytics payloads and rejects non-allowlisted funnel event names', () => {
    const sanitized = sanitizeClientAnalyticsPayload({
      birthDate: '1990-01-01',
      birthTime: '10:00',
      birthLocation: 'Shanghai',
      timezone: 'Asia/Shanghai',
      rawQuestion: 'Should I contact them?',
      fullResult: 'Long generated result text',
      modelResponse: 'Generated provider response',
      providerOutput: 'Provider raw output',
      prompt: 'Prompt text',
      response: 'Raw response',
      safeSurface: 'ask_preview',
      sourceTypes: ['question', 'timing', 'safety'],
      cardCount: 3,
    });

    expect(sanitized).toEqual({
      safeSurface: 'ask_preview',
      sourceTypes: ['question', 'timing', 'safety'],
      cardCount: 3,
    });
    expect(isRevenueFunnelEventName('unlock_click')).toBe(true);
    expect(isRevenueFunnelEventName('raw_question_sent')).toBe(false);
  });

  it('allowlists Love Test and Daily Oracle growth events without sensitive payloads', () => {
    const funnelEvents = read('src/lib/analytics/funnel-events.ts');
    const loveTest = read('src/app/(main)/love-test/page.tsx');
    const dailyOracle = read('src/app/(main)/daily-oracle/page.tsx');
    const relationshipNew = read('src/app/relationship/new/client.tsx');
    const home = read('src/components/home/TianjiLoveHome.tsx');

    expect(LOVE_TEST_CONVERSION_EVENTS).toEqual([
      'growth_fate_test_view',
      'growth_fate_test_start',
      'growth_fate_test_result',
      'growth_fate_test_cta_click',
      'love_test_start',
      'love_test_result_view',
      'love_test_share_card_click',
      'love_test_copy_result',
      'love_test_ask_next_click',
      'love_test_timing_click',
      'love_test_paid_intent_view',
      'love_test_paid_preview_submit',
      'love_test_paid_unlock_click',
      'love_test_checkout_readiness_blocked',
      'love_test_test_mode_checkout_ready',
    ]);
    expect(DAILY_ORACLE_CONVERSION_EVENTS).toEqual([
      'growth_daily_oracle_view',
      'growth_daily_oracle_draw',
      'growth_daily_oracle_share_click',
      'growth_daily_oracle_love_test_click',
      'growth_daily_oracle_love_reading_click',
    ]);

    for (const eventName of [...LOVE_TEST_CONVERSION_EVENTS, ...DAILY_ORACLE_CONVERSION_EVENTS]) {
      expect(isRevenueFunnelEventName(eventName)).toBe(true);
      expect(funnelEvents).toContain(eventName);
    }

    expect(`${loveTest}\n${relationshipNew}\n${home}`).toContain('growth_fate_test_cta_click');
    expect(`${dailyOracle}\n${loveTest}\n${home}`).toContain('growth_daily_oracle_view');
    expect(`${loveTest}\n${dailyOracle}`).not.toMatch(/birthDate|birthTime|birthLocation|timezone|rawQuestion|prompt|fullReport|fullResult/i);
  });
});
