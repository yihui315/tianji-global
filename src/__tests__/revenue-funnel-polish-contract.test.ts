import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { sanitizeClientAnalyticsPayload } from '@/lib/analytics/client';
import {
  FREE_TO_PAID_FUNNEL_EVENTS,
  LOVE_TEST_CONVERSION_EVENTS,
  isRevenueFunnelEventName,
} from '@/lib/analytics/funnel-events';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Tianji Love revenue funnel polish', () => {
  it('homepage contains the primary free CTA and three product cards', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    expect(home).toContain('Start Free Love Reading');
    expect(home).toContain('Love Reading');
    expect(home).toContain('Ask One Question');
    expect(home).toContain('Draw Timing Cards');
    expect(home).toContain('Free First, Deeper When Useful');
    expect(home).toContain('home_cta_click');
  });

  it('homepage contains the Ask CTA and privacy-safe trust strip', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    expect(home).toContain('Ask One Question');
    expect(home).toContain('Understand your love pattern');
    expect(home).toContain('View Sample Reading');
    expect(home).toContain("href('/ask')");
    expect(home).toContain('Private by default');
    expect(home).toContain('Reflection, not certainty');
    expect(home).toContain('No fear-based selling');
    expect(home).toContain('Secure unlocks');
  });

  it('Ask preview has unlock framing without full answer leakage language', () => {
    const ask = read('src/app/(main)/ask/page.tsx');

    expect(ask).toContain('Unlock the full relationship answer');
    expect(ask).toContain('A deeper interpretation of the emotional pattern');
    expect(ask).toContain('ask_preview_started');
    expect(ask).toContain('ask_preview_completed');
    expect(ask).toContain('unlock_click');
    expect(ask).not.toMatch(/free full answer|complete answer for free|guaranteed outcome/i);
  });

  it('Draw preview has three-card unlock framing without guaranteed prediction copy', () => {
    const draw = read('src/app/(main)/draw/page.tsx');

    expect(draw).toContain('A private Draw Timing preview is ready');
    expect(draw).toContain('Unlock the full Draw Timing reading');
    expect(draw).toContain('Draw three timing cards for the choice in front of you.');
    expect(draw).toContain('Practical next step');
    expect(draw).toContain('draw_preview_started');
    expect(draw).toContain('draw_preview_completed');
    expect(draw).toContain('unlock_click');
    expect(draw).not.toMatch(/guaranteed prediction|guaranteed future|certain future/i);
  });

  it('Pricing copy distinguishes free, one-time unlocks, subscriptions, and reflection boundaries', () => {
    const pricing = read('src/app/(main)/pricing/page.tsx');

    expect(pricing).toContain('Free preview');
    expect(pricing).toContain('One-time Ask unlock');
    expect(pricing).toContain('Draw Timing Reading');
    expect(pricing).toContain('Relationship Destiny Report');
    expect(pricing).toContain('What happens after unlocking');
    expect(pricing).toContain('A deeper private reading');
    expect(pricing).toContain('Love Monthly');
    expect(pricing).toContain('Love Yearly');
    expect(pricing).toContain('Paid unlocks add depth, not certainty');
    expect(pricing).toContain('pricing_viewed');
    expect(pricing).toContain('unlock_click');
    expect(pricing).toContain('login_started');
  });

  it('Login fallback shows useful static sign-in copy instead of a bare loading state', () => {
    const login = read('src/app/login/page.tsx');

    expect(login).toContain('Sign in to save your readings.');
    expect(login).toContain('unlock deeper reports');
    expect(login).toContain('getProviders()');
    expect(login).toContain('Email sign-in unavailable');
    expect(login).toContain('Google sign-in appears when OAuth client settings are configured.');
    expect(login).not.toContain('>Loading...</div>');
  });

  it('homepage avoids strong testimonial outcome promises', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    expect(home).not.toMatch(/incredibly accurate|life-changing|guaranteed outcome|guaranteed future/i);
  });

  it('staging HTTPS runbook is staging-only and does not approve production mutation', () => {
    const runbook = read('docs/tianji-love-staging-https-runbook.md');

    expect(runbook).toContain('certbot --nginx -d staging.tianji.love');
    expect(runbook).toContain('proxy_pass http://127.0.0.1:3058');
    expect(runbook).toContain('Do not modify tianji.love production server block.');
    expect(runbook).toContain('Do not restart tianji-global.');
    expect(runbook).toContain('paid launch: No-Go');
  });

  it('analytics event payload excludes sensitive and high-content fields', () => {
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
  });

  it('adds divination evidence analytics events without private content payloads', () => {
    const evidenceEvents = read('src/lib/analytics/divination-events.ts');
    const client = read('src/lib/analytics/client.ts');
    const trackRoute = read('src/app/api/analytics/track/route.ts');
    const ask = read('src/app/(main)/ask/page.tsx');
    const draw = read('src/app/(main)/draw/page.tsx');
    const relationship = read('src/components/relationship/RelationshipResult.tsx');

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
    expect(client).toContain('string[]');
    expect(trackRoute).toContain('z.array(z.string())');
    expect(`${ask}\n${draw}\n${relationship}`).toContain('DivinationEvidenceCard');
    expect(evidenceEvents).not.toMatch(/rawQuestion|birthDate|birthTime|birthLocation|timezone|fullReport|prompt/i);
  });

  it('defines the free-to-paid funnel event allowlist and keeps analytics mutation guardable', () => {
    const funnelEvents = read('src/lib/analytics/funnel-events.ts');
    const trackRoute = read('src/app/api/analytics/track/route.ts');
    const relationshipRoute = read('src/app/api/analytics/relationship/route.ts');
    const relationshipNew = read('src/app/relationship/new/client.tsx');
    const relationshipResult = read('src/components/relationship/RelationshipResult.tsx');
    const login = read('src/app/login/page.tsx');

    expect(FREE_TO_PAID_FUNNEL_EVENTS).toEqual([
      'home_cta_click',
      'relationship_started',
      'relationship_free_completed',
      'ask_preview_started',
      'ask_preview_completed',
      'draw_preview_started',
      'draw_preview_completed',
      'pricing_viewed',
      'unlock_click',
      'login_started',
    ]);

    for (const eventName of FREE_TO_PAID_FUNNEL_EVENTS) {
      expect(isRevenueFunnelEventName(eventName)).toBe(true);
      expect(funnelEvents).toContain(eventName);
    }

    expect(isRevenueFunnelEventName('raw_question_sent')).toBe(false);
    expect(relationshipNew).toContain('relationship_started');
    expect(relationshipResult).toContain('relationship_free_completed');
    expect(login).toContain('login_started');
    expect(trackRoute).toContain('isSupabaseMutationDisabled');
    expect(relationshipRoute).toContain('isSupabaseMutationDisabled');
    expect(trackRoute).toContain('supabase_mutation_disabled');
    expect(relationshipRoute).toContain('supabase_mutation_disabled');
  });

  it('defines Love-Test conversion events without sensitive analytics payloads', () => {
    const loveTest = read('src/app/(main)/love-test/page.tsx');
    const ask = read('src/app/(main)/ask/page.tsx');
    const funnelEvents = read('src/lib/analytics/funnel-events.ts');

    expect(LOVE_TEST_CONVERSION_EVENTS).toEqual([
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

    for (const eventName of LOVE_TEST_CONVERSION_EVENTS) {
      expect(isRevenueFunnelEventName(eventName)).toBe(true);
      expect(funnelEvents).toContain(eventName);
    }

    for (const eventName of LOVE_TEST_CONVERSION_EVENTS.slice(0, 6)) {
      expect(loveTest).toContain(eventName);
    }

    for (const eventName of LOVE_TEST_CONVERSION_EVENTS.slice(6, 10)) {
      expect(ask).toContain(eventName);
    }

    expect(ask).toContain('intent: attributionIntent');
    expect(ask).toContain('From your Love Test: ask one focused question before you overthink the whole relationship.');
    expect(loveTest).not.toMatch(/birthDate|birthTime|birthLocation|timezone|rawQuestion|prompt|fullReport|fullResult/i);
  });

  it('keeps Love-Test one-question paid intent behind checkout readiness and paid-smoke approval gates', () => {
    const ask = read('src/app/(main)/ask/page.tsx');
    const askPreview = read('src/app/api/ask/preview/route.ts');
    const askUnlock = read('src/app/api/ask/unlock/route.ts');
    const loveTest = read('src/lib/love-test.ts');

    expect(loveTest).toContain('LOVE_TEST_PAID_INTENTS');
    expect(loveTest).toContain('what_are_they_thinking');
    expect(loveTest).toContain('What are they thinking now?');
    expect(loveTest).toContain('9.9 first question');
    expect(loveTest).toContain('9.9 timing question');
    expect(ask).toContain('paidIntentMeta.title');
    expect(ask).toContain('First question: 9.9');
    expect(ask).toContain('Checkout readiness required');
    expect(ask).toContain('Test-mode checkout ready - awaiting approval');
    expect(ask).toContain('Deeper interpretation');
    expect(ask).toContain('Timing plan');
    expect(ask).toContain('3-message suggestion');
    expect(ask).toContain('What not to do');
    expect(ask).toContain('love_test_paid_intent_view');
    expect(ask).toContain('love_test_paid_preview_submit');
    expect(ask).toContain('love_test_paid_unlock_click');
    expect(ask).toContain('love_test_checkout_readiness_blocked');
    expect(ask).toContain('setError(LOVE_TEST_CHECKOUT_READINESS_LABEL)');
    expect(ask).not.toMatch(/live payment CTA|completed charge/i);

    expect(askPreview).toContain('Emotional state');
    expect(askPreview).toContain('Likely communication pattern');
    expect(askPreview).toContain('One safe next step');
    expect(askPreview).not.toContain('generateTianjiModelResponse');

    expect(askUnlock).toContain('LOVE_TEST_PAID_INTENT_TEST_MODE_READY');
    expect(askUnlock).toContain('LOVE_TEST_PAID_SMOKE_APPROVED');
    expect(askUnlock).toContain('love_test_checkout_readiness_required');
    expect(askUnlock.indexOf('getLoveTestPaidIntentCheckoutGate')).toBeLessThan(
      askUnlock.indexOf('stripe.checkout.sessions.create'),
    );
  });
});
