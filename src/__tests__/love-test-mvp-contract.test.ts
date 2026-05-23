import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  LOVE_TEST_ASK_INTENTS,
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
  it('computes deterministic private results without AI or storage dependencies', () => {
    const input = {
      stage: 'early',
      communication: 'direct',
      rhythm: 'steady',
      conflict: 'repair',
      values: 'growth',
    } as const;

    const first = computeLoveTestResult(input);
    const second = computeLoveTestResult(input);

    expect(second).toEqual(first);
    expect(first.id).toMatch(/^love_test_/);
    expect(first.score).toBeGreaterThanOrEqual(0);
    expect(first.score).toBeLessThanOrEqual(100);
    expect(first.headline).toBeTruthy();
    expect(first.oneLiner).toBeTruthy();
    expect(first.nextStep).toBeTruthy();
    expect(first.upsellQuestion).toContain('relationship');
  });

  it('keeps share payloads privacy-safe and excludes sensitive keys', () => {
    const result = computeLoveTestResult({
      stage: 'complicated',
      communication: 'guarded',
      rhythm: 'fast',
      conflict: 'space',
      values: 'security',
    });
    const payload = getLoveTestSharePayload(result, 'https://tianji.love/love-test');
    const sanitized = sanitizeLoveTestSharePayload({
      ...payload,
      birthDate: '1990-01-01',
      birthTime: '10:00',
      birthLocation: 'Shanghai',
      timezone: 'Asia/Shanghai',
      rawQuestion: 'Should I text them?',
      prompt: 'Hidden prompt',
      fullResult: 'Long private result',
    });

    expect(sanitized).toEqual(payload);
    expect(JSON.stringify(sanitized)).not.toMatch(/1990|Shanghai|Hidden prompt|Should I text/i);
  });

  it('adds a standalone /love-test page with deterministic result, share card, and Ask upsell attribution', () => {
    const page = read('src/app/(main)/love-test/page.tsx');

    expect(page).toContain('computeLoveTestResult');
    expect(page).toContain('Love-Test MVP');
    expect(page).toContain('Still wondering what this connection really means?');
    expect(page).toContain('serviceType: \'love_test\'');
    expect(page).toContain('LOVE_TEST_SHARE_FORMATS');
    expect(page).toContain('/api/share/card');
    expect(page).toContain('/ask?source=love_test');
    expect(page).toContain('/ask?source=love_test&intent=what_are_they_thinking');
    expect(page).toContain('/ask?source=love_test&intent=timing');
    expect(page).toContain('/ask?source=love_test&intent=next_step');
    expect(page).toContain('Ask what they are thinking now');
    expect(page).toContain('Get timing advice');
    expect(page).toContain('Copy my result');
    expect(page).toContain('Birth data is not collected');
    expect(page).toContain('love_test_start');
    expect(page).toContain('love_test_result_view');
    expect(page).toContain('love_test_share_card_click');
    expect(page).toContain('love_test_copy_result');
    expect(page).toContain('love_test_ask_next_click');
    expect(page).toContain('love_test_timing_click');
    expect(page).toContain('relationship_start_click');
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

  it('preserves Ask attribution through preview, unlock, and checkout returns', () => {
    const askPage = read('src/app/(main)/ask/page.tsx');
    const askUnlock = read('src/app/api/ask/unlock/route.ts');
    const askQuestion = read('src/lib/ask-question.ts');

    expect(LOVE_TEST_ASK_INTENTS).toEqual(['what_are_they_thinking', 'timing', 'next_step']);
    expect(askPage).toContain('useSearchParams');
    expect(askPage).toContain('love_test');
    expect(askPage).toContain('attributionSource');
    expect(askPage).toContain('isLoveTestAskIntent');
    expect(askPage).toContain('attributionIntent');
    expect(askPage).toContain('From your Love Test: ask the next question with more context.');
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

  it('creates requested Sprint 1 material and KPI tracking templates', () => {
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
    expect(read('data/love-test-event-tracking.csv')).toContain('love_test_ask_next_click');
    expect(read('data/love-test-event-tracking.csv')).toContain('love_test_timing_click');
    expect(read('data/love-test-kpi-tracking.csv')).toContain('period,visits,starts,results,share_card_clicks,copy_result_clicks,ask_next_clicks,timing_clicks');
    expect(read('assets/love-test-personality.md')).toContain('deterministic result logic');
  });
});
