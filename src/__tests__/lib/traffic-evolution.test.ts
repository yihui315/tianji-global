import { describe, expect, it } from 'vitest';
import { buildTrafficContext, classifyTrafficSource, getTrafficExperience, selectTrafficStrategy } from '../../lib/traffic-evolution';

describe('traffic-evolution', () => {
  it('classifies TikTok, SEO, and direct visitors', () => {
    expect(
      classifyTrafficSource({
        search: '?utm_source=tiktok&utm_campaign=summer',
        referrer: '',
        currentHost: 'tianji-global.vercel.app',
      })
    ).toBe('tiktok');

    expect(
      classifyTrafficSource({
        search: '',
        referrer: 'https://www.google.com/search?q=destiny+scan',
        currentHost: 'tianji-global.vercel.app',
      })
    ).toBe('seo');

    expect(
      classifyTrafficSource({
        search: '',
        referrer: '',
        currentHost: 'tianji-global.vercel.app',
      })
    ).toBe('direct');
  });

  it('maps source to strategy and experience copy', () => {
    const context = buildTrafficContext({
      search: '?utm_source=tiktok&utm_campaign=hook-01',
      referrer: 'https://www.tiktok.com/@creator/video/1',
      currentHost: 'tianji-global.vercel.app',
    });
    const experience = getTrafficExperience(context.source);

    expect(context.source).toBe('tiktok');
    expect(context.strategy).toBe(selectTrafficStrategy('tiktok'));
    expect(experience.scan.cta).toBe('Reveal My Hidden Shift');
    expect(experience.result.lockHeadline).toContain('hidden');
  });
});
