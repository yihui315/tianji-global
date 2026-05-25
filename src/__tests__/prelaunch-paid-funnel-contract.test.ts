import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import {
  buildCheckoutStartFromFreePreviewPayload,
  isRevenueFunnelEventName,
} from '@/lib/analytics/funnel-events';
import { sanitizeClientAnalyticsPayload } from '@/lib/analytics/client';
import { isUuidReadingId } from '@/lib/reading-id';
import { validateCheckoutSessionMetadata } from '@/lib/stripe-checkout-metadata';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('TianJi Love prelaunch paid funnel hardening', () => {
  it('defines checkout_start_from_free_preview with a safe payload contract', () => {
    const payload = buildCheckoutStartFromFreePreviewPayload({
      route: 'ask',
      source: 'evidence_card',
      confidence: 'high',
      evidenceSignalCount: 3,
    });

    expect(isRevenueFunnelEventName('checkout_start_from_free_preview')).toBe(true);
    expect(payload).toEqual({
      route: 'ask',
      source: 'evidence_card',
      paid: false,
      confidence: 'high',
      evidenceSignalCount: 3,
    });

    expect(
      sanitizeClientAnalyticsPayload({
        ...payload,
        question: 'Should I text Alex?',
        name: 'Alex',
        partnerName: 'Taylor',
        email: 'private@example.com',
        phone: '+15555555555',
        checkoutSessionId: 'cs_test_private',
        stripeSessionId: 'cs_test_private',
        stripePaymentIntentId: 'pi_private',
        paymentId: 'pi_private',
        supabaseRowId: 'row_private',
      }),
    ).toEqual(payload);
  });

  it('wires exact checkout-start analytics on Ask, Draw, and Relationship unlocks', () => {
    const evidenceCard = read('src/components/divination/DivinationEvidenceCard.tsx');
    const askPage = read('src/app/(main)/ask/page.tsx');
    const drawPage = read('src/app/(main)/draw/page.tsx');
    const relationshipResult = read('src/components/relationship/RelationshipResult.tsx');

    expect(evidenceCard).toContain("onUnlockClick?.('evidence_card')");
    expect(askPage).toContain('trackCheckoutStartFromFreePreview');
    expect(askPage).toContain("route: 'ask'");
    expect(drawPage).toContain('trackCheckoutStartFromFreePreview');
    expect(drawPage).toContain("route: 'draw'");
    expect(relationshipResult).toContain('trackCheckoutStartFromFreePreview');
    expect(relationshipResult).toContain("route: 'relationship'");
    expect(relationshipResult).toContain("= 'result_unlock'");
  });

  it('blocks non-UUID relationship fallback ids before checkout', () => {
    expect(isUuidReadingId('9a8f6f0e-7824-4c2e-95d7-1a49d2d49b5a')).toBe(true);
    expect(isUuidReadingId('rel_local_123')).toBe(false);
    expect(isUuidReadingId('')).toBe(false);
    expect(isUuidReadingId(null)).toBe(false);
    expect(isUuidReadingId(undefined)).toBe(false);
    expect(isUuidReadingId(42)).toBe(false);

    const relationshipResult = read('src/components/relationship/RelationshipResult.tsx');
    expect(relationshipResult).toContain('isUuidReadingId(reading.id)');
    expect(relationshipResult).toContain('relationship_checkout_blocked_missing_persisted_reading');
    expect(relationshipResult).toContain('missing_uuid_reading_id');
    expect(relationshipResult).toContain('We need to save this reading before checkout. Please try again in a moment.');
  });

  it('validates webhook metadata and rejects unsafe relationship ids', () => {
    const validRelationship = validateCheckoutSessionMetadata({
      productId: 'compatibility_report',
      source: 'relationship',
      readingSessionId: '9a8f6f0e-7824-4c2e-95d7-1a49d2d49b5a',
      relationshipReadingId: '9a8f6f0e-7824-4c2e-95d7-1a49d2d49b5a',
      locale: 'en',
    });
    const validAsk = validateCheckoutSessionMetadata({
      productId: 'solo_love_report',
      source: 'love_reading',
      readingSessionId: '0abf4540-d0f1-4cf9-b25c-bf326f18a211',
      locale: 'zh-CN',
    });

    expect(validRelationship.ok).toBe(true);
    expect(validRelationship.ok && validRelationship.metadata.source).toBe('relationship');
    expect(validAsk.ok).toBe(true);
    expect(validAsk.ok && validAsk.metadata.productId).toBe('solo_love_report');
    expect(validateCheckoutSessionMetadata(null)).toEqual({ ok: false, reason: 'missing_product_id' });
    expect(validateCheckoutSessionMetadata({
      productId: 'compatibility_report',
      source: 'relationship',
      readingSessionId: 'rel_local_123',
      relationshipReadingId: 'rel_local_123',
    })).toEqual({ ok: false, reason: 'unsafe_reading_session_id' });
    expect(validateCheckoutSessionMetadata({
      productId: 'compatibility_report',
      source: 'love_reading',
      readingSessionId: '0abf4540-d0f1-4cf9-b25c-bf326f18a211',
    })).toEqual({ ok: false, reason: 'invalid_relationship_product' });
  });

  it('keeps webhook entitlement readiness guarded by validated metadata', () => {
    const webhook = read('src/app/api/stripe/webhook/route.ts');

    expect(webhook).toContain('validateCheckoutSessionMetadata');
    expect(webhook).toContain('ignored checkout.session.completed with unsafe metadata');
    expect(webhook).toContain('markRelationshipReadingPremium');
    expect(webhook).toContain('ensureReportJobForSession');
  });

  it('reports prelaunch static readiness checks from the Stripe readiness script', () => {
    const output = execFileSync(process.execPath, ['scripts/smoke-stripe-test-readiness.mjs'], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    expect(output).toContain('checkout_start_from_free_preview event: present');
    expect(output).toContain('Relationship UUID guard: present');
    expect(output).toContain('Relationship rel_* fallback block: present');
    expect(output).toContain('Webhook metadata validation: present');
    expect(output).toContain('Entitlement route detection: present');
    expect(output).toContain('value: redacted');
  });
});
