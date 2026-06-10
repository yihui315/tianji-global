import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  DAILY_ORACLE_CONVERSION_EVENTS,
  isRevenueFunnelEventName,
} from '@/lib/analytics/funnel-events';
import {
  DAILY_LOVE_ORACLE_MOODS,
  computeDailyLoveOracle,
  getDailyLoveOracleShareText,
  getLocalDateKey,
  isDailyLoveOracleMood,
} from '@/lib/daily-oracle';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Daily Love Oracle growth experiment', () => {
  it('generates a deterministic local daily oracle by date and mood', () => {
    const first = computeDailyLoveOracle({ dateKey: '2026-06-03', mood: 'reunion' });
    const second = computeDailyLoveOracle({ dateKey: '2026-06-03', mood: 'reunion' });
    const changedMood = computeDailyLoveOracle({ dateKey: '2026-06-03', mood: 'steady_love' });

    expect(first).toEqual(second);
    expect(first.id).toContain('daily_oracle_20260603_reunion');
    expect(first.dateKey).toBe('2026-06-03');
    expect(first.moodLabel).toBe('想复合');
    expect(first.keyword).toBeTruthy();
    expect(first.relationshipHint).toBeTruthy();
    expect(first.doToday).toBeTruthy();
    expect(first.avoidToday).toBeTruthy();
    expect(changedMood.id).not.toBe(first.id);
    expect(getLocalDateKey(new Date('2026-06-03T12:00:00'))).toBe('2026-06-03');
  });

  it('keeps mood choices explicit and validates unknown values', () => {
    expect(DAILY_LOVE_ORACLE_MOODS.map((mood) => mood.label)).toEqual([
      '想念对方',
      '暧昧拉扯',
      '冷战犹豫',
      '想复合',
      '稳定恋爱',
      '单身期待',
    ]);
    expect(isDailyLoveOracleMood('reunion')).toBe(true);
    expect(isDailyLoveOracleMood('rawQuestion')).toBe(false);
  });

  it('builds privacy-safe share text without sensitive user input fields', () => {
    const result = computeDailyLoveOracle({ dateKey: '2026-06-03', mood: 'missing_them' });
    const shareText = getDailyLoveOracleShareText(result, 'https://tianji.love/daily-oracle');

    expect(shareText).toContain('今日天机');
    expect(shareText).toContain(result.keyword);
    expect(shareText).toContain('https://tianji.love/daily-oracle');
    expect(shareText).not.toMatch(/birthDate|birthTime|birthLocation|timezone|rawQuestion|prompt|fullReport|fullResult/i);
  });

  it('exposes the /daily-oracle page as a non-payment retention surface', () => {
    const page = read('src/app/(main)/daily-oracle/page.tsx');

    for (const signal of [
      'Daily Love Oracle',
      '今日天机每日签',
      '每天一支关系灵感签',
      'No login',
      'No AI call',
      'No database',
      'No payment path',
      '今日关键词',
      '今日关系提示',
      '今日适合做的事',
      '今日不建议做的事',
      'Free Fate Match Test',
      '/love-test?source=daily_oracle',
      '/relationship/new?source=daily_oracle',
      'aria-live="polite"',
      'getDailyLoveOracleShareText',
    ]) {
      expect(page).toContain(signal);
    }

    expect(page).not.toMatch(/stripe\.checkout\.sessions\.create|\/api\/stripe\/checkout|\/api\/checkout|webhook|supabase|birthDate|birthTime|birthLocation|timezone|rawQuestion|prompt|fullReport|fullResult/i);
  });

  it('adds homepage and Love-Test entry points without payment execution paths', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');
    const loveTest = read('src/app/(main)/love-test/page.tsx');

    expect(home).toContain('Daily Love Oracle');
    expect(home).toContain('Return tomorrow for one small relationship signal.');
    expect(home).toContain('Draw Today&apos;s Oracle');
    expect(home).toContain('homepage_daily_oracle_entry');
    expect(home).toContain('href="/daily-oracle"');
    expect(loveTest).toContain('/daily-oracle?source=love_test_result');
    expect(loveTest).toContain('明天再来抽一支今日天机');
    expect(loveTest).toContain('growth_daily_oracle_view');
  });

  it('defines Daily Oracle analytics events through the revenue funnel allowlist', () => {
    const funnelEvents = read('src/lib/analytics/funnel-events.ts');
    const dailyOracle = read('src/app/(main)/daily-oracle/page.tsx');
    const loveTest = read('src/app/(main)/love-test/page.tsx');

    expect(DAILY_ORACLE_CONVERSION_EVENTS).toEqual([
      'growth_daily_oracle_view',
      'growth_daily_oracle_draw',
      'growth_daily_oracle_share_click',
      'growth_daily_oracle_love_test_click',
      'growth_daily_oracle_love_reading_click',
    ]);

    for (const eventName of DAILY_ORACLE_CONVERSION_EVENTS) {
      expect(isRevenueFunnelEventName(eventName)).toBe(true);
      expect(funnelEvents).toContain(eventName);
      expect(`${dailyOracle}\n${loveTest}`).toContain(eventName);
    }

    expect(dailyOracle).not.toMatch(/yourName|theirName|mainConcern|birthDate|birthTime|birthLocation|timezone|rawQuestion|prompt|fullReport|fullResult/i);
  });
});
