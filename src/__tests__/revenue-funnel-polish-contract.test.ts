import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { sanitizeClientAnalyticsPayload } from '@/lib/analytics/client';
import { isRevenueFunnelEventName } from '@/lib/analytics/funnel-events';

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
      name: 'Private name',
      partnerName: 'Private partner',
      birthday: '1990-01-01',
      birthDate: '1990-01-01',
      birthTime: '10:00',
      birthLocation: 'Shanghai',
      email: 'person@example.com',
      phone: '+15555550100',
      timezone: 'Asia/Shanghai',
      rawQuestion: 'Should I contact them?',
      rawReport: 'Full report body',
      fullResult: 'Long generated result text',
      readingText: 'Reading body',
      stripeSessionId: 'cs_test_123',
      checkoutSessionId: 'cs_test_456',
      paymentId: 'pi_test_123',
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
    expect(isRevenueFunnelEventName('checkout_start_from_free_preview')).toBe(true);
    expect(isRevenueFunnelEventName('relationship_checkout_blocked_missing_persisted_reading')).toBe(true);
    expect(isRevenueFunnelEventName('raw_question_sent')).toBe(false);
  });

  it('fires checkout_start_from_free_preview from free preview unlock CTAs with safe fields only', () => {
    const askPage = read('src/app/(main)/ask/page.tsx');
    const drawPage = read('src/app/(main)/draw/page.tsx');
    const relationshipResult = read('src/components/relationship/RelationshipResult.tsx');

    for (const [source, route, unlockHandler] of [
      [askPage, 'ask', 'onUnlock'],
      [drawPage, 'draw', 'onUnlock'],
      [relationshipResult, 'relationship', 'handleUnlock'],
    ] as const) {
      expect(source).toContain("trackRevenueFunnelEvent('checkout_start_from_free_preview'");
      expect(source).toContain(`route: '${route}'`);
      expect(source).toContain('paid: false');
      expect(source).toContain('confidence');
      expect(source).toContain('evidenceSignalCount');
      expect(source).toContain(`${unlockHandler}('evidence_card')`);
      expect(source).toContain(`${unlockHandler}('result_unlock')`);
    }

    expect(askPage.indexOf("trackRevenueFunnelEvent('checkout_start_from_free_preview'"))
      .toBeLessThan(askPage.indexOf("fetch('/api/ask/unlock'"));
    expect(drawPage.indexOf("trackRevenueFunnelEvent('checkout_start_from_free_preview'"))
      .toBeLessThan(drawPage.indexOf("fetch('/api/draw/unlock'"));
    expect(relationshipResult.indexOf("trackRevenueFunnelEvent('checkout_start_from_free_preview'"))
      .toBeLessThan(relationshipResult.indexOf("fetch('/api/checkout'"));
  });
});
