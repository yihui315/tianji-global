import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  LOVE_TEST_ASK_INTENTS,
  LOVE_TEST_PAID_INTENT_META,
  LOVE_TEST_PAID_INTENTS,
  LOVE_TEST_SHARE_FORMATS,
  computeLoveTestResult,
  getLoveTestSharePayload,
  sanitizeLoveTestSharePayload,
} from '@/lib/love-test';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Love-Test MVP contract', () => {
  it('computes deterministic free fate-match results without AI or storage dependencies', () => {
    const input = {
      yourName: 'Moon',
      theirName: 'Sun',
      relationshipStatus: 'ambiguous',
      mainConcern: 'I am not sure whether I should text first or wait for clarity.',
    } as const;

    const first = computeLoveTestResult(input);
    const second = computeLoveTestResult(input);

    expect(second).toEqual(first);
    expect(first.id).toMatch(/^love_test_/);
    expect(first.score).toBeGreaterThanOrEqual(0);
    expect(first.score).toBeLessThanOrEqual(100);
    expect(first.matchLevel).toBeTruthy();
    expect(first.headline).toBeTruthy();
    expect(first.oneLiner).toBeTruthy();
    expect(first.insights).toHaveLength(3);
    expect(first.actionSuggestion).toBeTruthy();
    expect(first.nextStep).toBe(first.actionSuggestion);
    expect(first.upsellQuestion).toContain('full Love Reading flow');
  });

  it('keeps share payloads privacy-safe and excludes sensitive input keys', () => {
    const result = computeLoveTestResult({
      yourName: 'Moon',
      theirName: 'Sun',
      relationshipStatus: 'separated_cold',
      mainConcern: 'Should I text them after the silence?',
    });
    const payload = getLoveTestSharePayload(result, 'https://tianji.love/love-test');
    const sanitized = sanitizeLoveTestSharePayload({
      ...payload,
      yourName: 'Moon',
      theirName: 'Sun',
      mainConcern: 'Should I text them after the silence?',
      birthDate: '1990-01-01',
      birthTime: '10:00',
      birthLocation: 'Shanghai',
      timezone: 'Asia/Shanghai',
      rawQuestion: 'Should I text them?',
      prompt: 'Hidden prompt',
      fullResult: 'Long private result',
    });

    expect(sanitized).toEqual(payload);
    expect(JSON.stringify(sanitized)).not.toMatch(/Moon|Sun|1990|Shanghai|Hidden prompt|Should I text|silence/i);
  });

  it('adds a standalone free fate-match page with required inputs, result, share, and non-payment Love Reading CTA', () => {
    const page = read('src/app/(main)/love-test/page.tsx');

    expect(page).toContain('computeLoveTestResult');
    expect(page).toContain('Free Fate Match Test');
    expect(page).toContain('天机缘分测试');
    expect(page).toContain('yourName');
    expect(page).toContain('theirName');
    expect(page).toContain('relationshipStatus');
    expect(page).toContain('mainConcern');
    expect(page).toContain('Reveal fate match');
    expect(page).toContain('result.insights');
    expect(page).toContain('result.actionSuggestion');
    expect(page).toContain('serviceType: \'love_test\'');
    expect(page).toContain('LOVE_TEST_SHARE_FORMATS');
    expect(page).toContain('/api/share/card');
    expect(page).toContain('Full Love Reading Flow');
    expect(page).toContain('/relationship/new?source=fate_match_test');
    expect(page).toContain('Copy my result');
    expect(page).toContain('Copy failed');
    expect(page).toContain('Share card could not be generated. Please copy the text result instead.');
    expect(page).toContain('aria-live="polite"');
    expect(page).toContain('Birth data is not collected');
    expect(page).toContain('growth_fate_test_view');
    expect(page).toContain('growth_fate_test_start');
    expect(page).toContain('growth_fate_test_result');
    expect(page).toContain('growth_fate_test_cta_click');
    expect(page).toContain('love_test_start');
    expect(page).toContain('love_test_result_view');
    expect(page).toContain('love_test_share_card_click');
    expect(page).toContain('love_test_copy_result');
    expect(page).toContain('relationship_start_click');
    expect(page).not.toContain('/api/checkout');
    expect(page).not.toContain('/api/stripe/webhook');
    expect(page).not.toContain('stripe.checkout.sessions.create');
    expect(page).not.toContain('/ask?source=love_test');
    expect(page).not.toMatch(/birthDate|birthTime|birthLocation|timezone|fullReport|fullResult|rawQuestion|prompt/i);
  });

  it('extends the share-card API for love_test in the requested social formats', () => {
    const cardRoute = read('src/app/api/share/card/route.tsx');

    expect(LOVE_TEST_SHARE_FORMATS).toEqual(['og', 'wechat_moments', 'xiaohongshu', 'douyin']);
    expect(cardRoute).toContain('sanitizeLoveTestSharePayload');
    expect(cardRoute).toContain('LoveTestShareCard');
    expect(cardRoute).toContain('serviceType === \'love_test\'');
    expect(cardRoute).toContain('Birth data is not collected');
    expect(cardRoute).toContain('wechat_moments');
    expect(cardRoute).toContain('xiaohongshu');
    expect(cardRoute).toContain('douyin');
    expect(cardRoute).not.toMatch(/birthDate|birthTime|birthLocation|timezone|fullReport|fullResult|rawQuestion|prompt/i);
  });

  it('preserves Ask attribution contracts behind their existing readiness gates', () => {
    const askPage = read('src/app/(main)/ask/page.tsx');
    const askUnlock = read('src/app/api/ask/unlock/route.ts');
    const askQuestion = read('src/lib/ask-question.ts');

    expect(LOVE_TEST_ASK_INTENTS).toEqual(['what_are_they_thinking', 'timing', 'next_step']);
    expect(LOVE_TEST_PAID_INTENTS).toEqual(['what_are_they_thinking', 'timing', 'next_step']);
    expect(LOVE_TEST_PAID_INTENT_META.what_are_they_thinking.priceLabel).toBe('9.9 first question');
    expect(askPage).toContain('useSearchParams');
    expect(askPage).toContain('love_test');
    expect(askPage).toContain('attributionSource');
    expect(askPage).toContain('isLoveTestAskIntent');
    expect(askPage).toContain('attributionIntent');
    expect(askPage).toContain('From your Love Test: ask one focused question before you overthink the whole relationship.');
    expect(askPage).toContain('Checkout readiness required');
    expect(askPage).toContain('source: attributionSource');
    expect(askPage).toContain('intent: attributionIntent');
    expect(askUnlock).toContain('source: askSource');
    expect(askUnlock).toContain('intent: askIntent');
    expect(askUnlock).toContain('intentParam');
    expect(askUnlock).toContain('source=${askSource}');
    expect(askUnlock).toContain("z.enum(['love_test'])");
    expect(askQuestion).toContain('LOVE_TEST_ASK_INTENTS');
    expect(askQuestion).toContain('intent: z.enum(LOVE_TEST_ASK_INTENTS).optional()');
  });

  it('creates requested Sprint 1 material and KPI tracking templates with growth event coverage', () => {
    for (const file of [
      'assets/love-test-share-card-prompts.md',
      'assets/love-test-short-video-scripts.md',
      'assets/love-test-copywriting.md',
      'assets/love-test-monthly-report.md',
      'assets/love-test-personality.md',
      'data/love-test-event-tracking.csv',
      'data/love-test-kpi-tracking.csv',
    ]) {
      expect(fs.existsSync(path.join(repoRoot, file)), file).toBe(true);
    }

    expect(read('data/love-test-event-tracking.csv')).toContain('event_name,trigger,surface,required_payload,success_metric');
    expect(read('data/love-test-event-tracking.csv')).toContain('growth_fate_test_view');
    expect(read('data/love-test-event-tracking.csv')).toContain('growth_fate_test_start');
    expect(read('data/love-test-event-tracking.csv')).toContain('growth_fate_test_result');
    expect(read('data/love-test-event-tracking.csv')).toContain('growth_fate_test_cta_click');
    expect(read('data/love-test-event-tracking.csv')).toContain('love_test_paid_intent_view');
    expect(read('data/love-test-kpi-tracking.csv')).toContain('paid_intent_views');
    expect(read('assets/love-test-personality.md')).toContain('deterministic result logic');
  });
});
