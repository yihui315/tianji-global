import { describe, expect, it } from 'vitest';
import {
  containsPrivateBirthLeak,
  maskBirthInput,
  sanitizePublicSharePayload,
} from '@/lib/love-reading/privacy-mask';
import { buildLoveReportSharePayload } from '@/lib/love-reading/share-payload';
import { generateFreePreviewReport } from '@/lib/love-reading/free-preview-generator';

describe('LoveReport privacy mask', () => {
  it('masks birth input without exposing exact date, time, place, full name, or private question', () => {
    const masked = maskBirthInput({
      name: 'Alexandra',
      birthDate: '1992-07-18',
      birthTime: '21:30',
      birthPlace: 'Los Angeles',
      privateQuestion: 'Will they come back?',
      contactInfo: 'alex@example.test',
    });

    expect(masked.displayName).toBe('A*');
    expect(masked.hasExactTime).toBe(false);
    expect(masked.hasBirthPlace).toBe(false);
    expect(JSON.stringify(masked)).not.toContain('Alexandra');
    expect(JSON.stringify(masked)).not.toContain('1992-07-18');
    expect(JSON.stringify(masked)).not.toContain('21:30');
    expect(JSON.stringify(masked)).not.toContain('Los Angeles');
    expect(JSON.stringify(masked)).not.toContain('Will they come back');
  });

  it('sanitizes public share payloads to allowed fields only', () => {
    const payload = sanitizePublicSharePayload({
      title: 'Learning Rhythm',
      summary: 'A calm first signal.',
      scoreBand: '60-79',
      cta: 'Start your private preview',
      birthDate: '1992-07-18',
      birthTime: '21:30',
      birthPlace: 'Los Angeles',
      fullName: 'Alexandra',
      privateQuestion: 'Will they come back?',
      paymentState: 'paid',
      rawEngineOutput: { hidden: true },
    });

    expect(payload).toEqual({
      title: 'Learning Rhythm',
      summary: 'A calm first signal.',
      scoreBand: '60-79',
      cta: 'Start your private preview',
    });
    expect(containsPrivateBirthLeak(payload)).toBe(false);
  });

  it('builds report share payload without premium or private fields', () => {
    const report = generateFreePreviewReport({
      locale: 'en',
      personA: { birthDate: '1992-07-18', birthTime: '21:30', birthPlace: 'Los Angeles' },
    });
    const share = buildLoveReportSharePayload(report, {
      rawEngineOutput: 'secret',
      paymentStatus: 'paid',
    });

    expect(containsPrivateBirthLeak(share)).toBe(false);
    expect(JSON.stringify(share)).not.toMatch(/1992-07-18|21:30|Los Angeles|paid|secret/i);
  });
});
