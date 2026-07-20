import { describe, expect, it } from 'vitest';
import { parse } from 'url';

/**
 * Contract test for legacy legal route redirects.
 *
 * Legacy routes /privacy and /terms must permanently redirect (308) to
 * their canonical counterparts under /legal/, preserving the lang query param.
 *
 * These pages were previously returning 404, causing UX breaks and SEO gaps.
 * See: PILOT-001-TASK-001.
 */
describe('Legacy legal route redirects', () => {
  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://tianji.love';

  describe('GET /privacy', () => {
    it('returns 308 redirect to /legal/privacy', async () => {
      const res = await fetch(`${BASE}/privacy`, {
        redirect: 'manual',
      });
      expect(res.status).toBe(308);
      const location = res.headers.get('location') ?? '';
      expect(location).toMatch(/^\/legal\/privacy/);
    });

    it('preserves lang=en query param', async () => {
      const res = await fetch(`${BASE}/privacy?lang=en`, {
        redirect: 'manual',
      });
      expect(res.status).toBe(308);
      const location = res.headers.get('location') ?? '';
      expect(location).toMatch(/lang=en/);
    });

    it('preserves lang=zh query param', async () => {
      const res = await fetch(`${BASE}/privacy?lang=zh`, {
        redirect: 'manual',
      });
      expect(res.status).toBe(308);
      const location = res.headers.get('location') ?? '';
      expect(location).toMatch(/lang=zh/);
    });

    it('canonical /legal/privacy remains accessible (200)', async () => {
      const res = await fetch(`${BASE}/legal/privacy`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /terms', () => {
    it('returns 308 redirect to /legal/terms', async () => {
      const res = await fetch(`${BASE}/terms`, {
        redirect: 'manual',
      });
      expect(res.status).toBe(308);
      const location = res.headers.get('location') ?? '';
      expect(location).toMatch(/^\/legal\/terms/);
    });

    it('preserves lang=en query param', async () => {
      const res = await fetch(`${BASE}/terms?lang=en`, {
        redirect: 'manual',
      });
      expect(res.status).toBe(308);
      const location = res.headers.get('location') ?? '';
      expect(location).toMatch(/lang=en/);
    });

    it('preserves lang=zh query param', async () => {
      const res = await fetch(`${BASE}/terms?lang=zh`, {
        redirect: 'manual',
      });
      expect(res.status).toBe(308);
      const location = res.headers.get('location') ?? '';
      expect(location).toMatch(/lang=zh/);
    });

    it('canonical /legal/terms remains accessible (200)', async () => {
      const res = await fetch(`${BASE}/legal/terms`);
      expect(res.status).toBe(200);
    });
  });
});
