import { describe, expect, it } from 'vitest';
import { buildAskPreview } from '@/lib/ask-question';
import { buildDrawPreview } from '@/lib/quick-draw';
import { tianjiOracleCopy } from '@/lib/tianji-oracle-copy';

describe('paywall Chinese copy', () => {
  it('keeps ask previews readable in Chinese', () => {
    const preview = buildAskPreview(
      '局势判断：围绕“今天适合上线官网吗？”，这次解读提醒你先看清真实约束，而不是急着追求一个确定答案。',
      'zh',
    );

    expect(preview).toContain('局势判断');
    expect(preview).toContain('…');
    expect(preview).not.toMatch(/[�]|å|ç|澶|鈥/);
  });

  it('keeps draw previews readable in Chinese', () => {
    const preview = buildDrawPreview(
      '这组三张牌形成了一条从整理、聚焦到行动的线索。今天最重要的是停止消耗，把精力交还给真正重要的行动。',
      'zh',
    );

    expect(preview).toContain('这组');
    expect(preview).toContain('…');
    expect(preview).not.toMatch(/[�]|å|ç|澶|鈥/);
  });

  it('keeps TianJi Oracle purchase copy focused on a complete synthesis', () => {
    expect(tianjiOracleCopy.zh.preview.unlockCta).toContain('完整解读');
    expect(tianjiOracleCopy.zh.unlockBenefits).toContain('此刻适合行动、等待，还是换一种问法');
    expect(tianjiOracleCopy.en.preview.unlockCta).toContain('complete reading');
    expect(tianjiOracleCopy.en.unlockBenefits).toContain(
      'Whether this is a move-now, wait, or reframe moment',
    );
  });
});
