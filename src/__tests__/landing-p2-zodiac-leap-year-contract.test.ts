import { describe, expect, it } from 'vitest';

import { buildZodiacMonthBridge } from '@/components/zodiac/zodiac-month-preview';

describe('TianJi Love zodiac month bridge leap-year contract', () => {
  it('uses month-end wording for February because birth year is not collected', () => {
    const en = buildZodiacMonthBridge(1, 'en');
    const zh = buildZodiacMonthBridge(1, 'zh-CN');

    expect(en.bridgeHint).toContain('Feb 19–month end');
    expect(en.bridgeHint).not.toContain('Feb 19–28');
    expect(zh.bridgeHint).toContain('2 月 1–18 日 / 19 日–月末');
    expect(zh.bridgeHint).not.toContain('19–28 日');
  });
});
