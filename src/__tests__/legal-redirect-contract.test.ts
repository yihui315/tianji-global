import { beforeEach, describe, expect, it, vi } from 'vitest';

const { permanentRedirectMock } = vi.hoisted(() => ({
  permanentRedirectMock: vi.fn((target: string): never => {
    throw new Error(`NEXT_REDIRECT:${target}`);
  }),
}));

vi.mock('next/navigation', () => ({
  permanentRedirect: permanentRedirectMock,
}));

import LegacyPrivacyPage from '../app/(main)/privacy/page';
import LegacyTermsPage from '../app/(main)/terms/page';

/**
 * Offline contract tests for legacy legal route redirects.
 *
 * Next.js permanentRedirect emits HTTP 308 at runtime. These tests verify that
 * each legacy page invokes it with the correct canonical target without making
 * network requests to production or requiring a preview deployment.
 *
 * See: PILOT-001-TASK-001.
 */
describe('Legacy legal route redirects', () => {
  beforeEach(() => {
    permanentRedirectMock.mockClear();
  });

  describe('/privacy', () => {
    it.each([
      [undefined, '/legal/privacy?lang=en'],
      ['en', '/legal/privacy?lang=en'],
      ['zh', '/legal/privacy?lang=zh'],
      ['unsupported', '/legal/privacy?lang=en'],
    ])('redirects lang=%s to %s', async (lang, expectedTarget) => {
      const searchParams = lang === undefined ? {} : { lang };

      await expect(
        LegacyPrivacyPage({ searchParams: Promise.resolve(searchParams) }),
      ).rejects.toThrow(`NEXT_REDIRECT:${expectedTarget}`);

      expect(permanentRedirectMock).toHaveBeenCalledOnce();
      expect(permanentRedirectMock).toHaveBeenCalledWith(expectedTarget);
    });
  });

  describe('/terms', () => {
    it.each([
      [undefined, '/legal/terms?lang=en'],
      ['en', '/legal/terms?lang=en'],
      ['zh', '/legal/terms?lang=zh'],
      ['unsupported', '/legal/terms?lang=en'],
    ])('redirects lang=%s to %s', async (lang, expectedTarget) => {
      const searchParams = lang === undefined ? {} : { lang };

      await expect(
        LegacyTermsPage({ searchParams: Promise.resolve(searchParams) }),
      ).rejects.toThrow(`NEXT_REDIRECT:${expectedTarget}`);

      expect(permanentRedirectMock).toHaveBeenCalledOnce();
      expect(permanentRedirectMock).toHaveBeenCalledWith(expectedTarget);
    });
  });
});
