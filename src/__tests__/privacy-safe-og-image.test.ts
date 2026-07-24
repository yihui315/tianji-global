import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * T0-007 (SIAS High-Throughput H3, 2026-07-24) regression contract.
 *
 * Verifies the `/api/og` image generator and the call sites on the
 * privacy-critical surfaces (`/love-test` and `/daily-oracle`) do NOT
 * leak user input, birth data, or any other private fields into the
 * OpenGraph image that crawlers (Facebook, Twitter, LinkedIn, iMessage,
 * Slack, Discord) fetch when a user shares one of these pages.
 *
 * Background:
 *   - `/api/og/route.tsx` is the sole generator for social-card images.
 *   - It accepts ONLY three query params: `title`, `subtitle`, `module`.
 *   - All current call sites (love-test, daily-oracle, pricing, etc.)
 *     pass hard-coded constants — no user data is interpolated.
 *   - Future regression: someone adding `?birthDate=...&name=...` to the
 *     OG URL would silently leak user data into a shared image that
 *     crawlers cache publicly.
 *
 * Hard rule from `AGENTS.md` §3:
 *   "Do not expose birth date, birth time, birth location, or timezone
 *    on public share pages by default."
 *
 * This contract enforces that rule at the OG-image layer specifically:
 * a future page that pipes user input into its OG URL must FAIL this
 * test and the agent must remove the dynamic param before shipping.
 */

const REPO_ROOT = process.cwd();

const OG_ROUTE = path.join(REPO_ROOT, 'src/app/api/og/route.tsx');

const LOVE_TEST_LAYOUT = path.join(
  REPO_ROOT,
  'src/app/(main)/love-test/layout.tsx'
);

const DAILY_ORACLE_LAYOUT = path.join(
  REPO_ROOT,
  'src/app/(main)/daily-oracle/layout.tsx'
);

const LOVE_TEST_PAGE = path.join(
  REPO_ROOT,
  'src/app/(main)/love-test/page.tsx'
);

const DAILY_ORACLE_PAGE = path.join(
  REPO_ROOT,
  'src/app/(main)/daily-oracle/page.tsx'
);

/** All query params that MUST NOT appear in any OG image URL on these pages. */
const FORBIDDEN_PARAMS = [
  'birthDate',
  'birthdate',
  'birthDateTime',
  'birth_date',
  'birthTime',
  'birthtime',
  'birth_time',
  'birthLocation',
  'birthlocation',
  'birth_location',
  'birthPlace',
  'birthplace',
  'birth_place',
  'timezone',
  'tz',
  'name',
  'firstName',
  'lastName',
  'fullName',
  'nickname',
  'concern',
  'question',
  'mood',
  'relationshipStatus',
  'partnerName',
  'partnerBirth',
  'card1',
  'card2',
  'card3',
  'reading',
  'result',
  'sessionId',
  'userId',
  'token',
  'auth',
  'email',
  'phone',
];

describe('privacy-safe OG image contract (T0-007)', () => {
  describe('/api/og route generator', () => {
    it('exists and reads only three whitelist params from the query string', () => {
      expect(fs.existsSync(OG_ROUTE)).toBe(true);
      const source = fs.readFileSync(OG_ROUTE, 'utf8');

      // The three safe params must be the ONLY ones read via
      // searchParams.get(...). No dynamic interpolation of user input.
      expect(source).toMatch(/searchParams\.get\(['"]title['"]\)/);
      expect(source).toMatch(/searchParams\.get\(['"]subtitle['"]\)/);
      expect(source).toMatch(/searchParams\.get\(['"]module['"]\)/);

      // None of the forbidden params may be read by the OG route.
      for (const param of FORBIDDEN_PARAMS) {
        expect(source).not.toMatch(new RegExp(`searchParams\\.get\\(['"]${param}['"]\\)`));
      }
    });

    it('does NOT log, print, or persist the query string anywhere', () => {
      const source = fs.readFileSync(OG_ROUTE, 'utf8');

      // No `console.log(searchParams)`-style leak.
      expect(source).not.toMatch(/console\.(log|info|warn)\([\s\S]{0,80}?searchParams/);
      // No write to disk or fetch out.
      expect(source).not.toMatch(/fs\.writeFile|fetch\(|prisma|supabase/);
    });
  });

  describe('/love-test OG image URL', () => {
    it('layout.tsx OG_URL is a hard-coded constant with no user-data interpolation', () => {
      expect(fs.existsSync(LOVE_TEST_LAYOUT)).toBe(true);
      const source = fs.readFileSync(LOVE_TEST_LAYOUT, 'utf8');

      // The OG URL literal — must match exactly the H3 contract.
      expect(source).toContain(
        "/api/og?title=Tianji+Love+Test&subtitle=Free+Private+Compatibility+Snapshot&module=tianji"
      );

      // No template-string interpolation inside the OG URL.
      expect(source).not.toMatch(/OG_URL\s*=\s*[`'"][^`'"]*\$\{/);
      expect(source).not.toMatch(/ogUrl\s*=|ogImage\s*=.*buildUrl/);

      // Forbidden params must not appear in any OG-related string literal.
      const ogRelatedLines = source
        .split('\n')
        .filter((l) => l.includes('/api/og') || l.includes('OG_URL') || l.includes('images:'));
      for (const line of ogRelatedLines) {
        for (const param of FORBIDDEN_PARAMS) {
          expect(line, `love-test OG line "${line.trim()}" contains forbidden param "${param}"`).not.toMatch(
            new RegExp(`[?&]${param}=`)
          );
        }
      }
    });

    it('page.tsx never constructs an /api/og URL with dynamic input', () => {
      // Some pages dynamically build their OG image from props/state.
      // The love-test page must NOT do that — and this test asserts so.
      if (!fs.existsSync(LOVE_TEST_PAGE)) {
        // Skip if the page no longer exists.
        return;
      }
      const source = fs.readFileSync(LOVE_TEST_PAGE, 'utf8');

      // No fetch to /api/og.
      expect(source).not.toMatch(/fetch\([^)]*\/api\/og/);
      // No template-string concatenation toward /api/og.
      expect(source).not.toMatch(/[`'"][^`'"]*\/api\/og\?\$\{/);
      // No forbidden params in any string literal containing /api/og.
      for (const param of FORBIDDEN_PARAMS) {
        expect(source, `love-test page references forbidden OG param "${param}"`).not.toMatch(
          new RegExp(`/api\\/og[^\\n]*${param}=`)
        );
      }
    });
  });

  describe('/daily-oracle OG image URL', () => {
    it('layout.tsx OG_URL is a hard-coded constant with no user-data interpolation', () => {
      expect(fs.existsSync(DAILY_ORACLE_LAYOUT)).toBe(true);
      const source = fs.readFileSync(DAILY_ORACLE_LAYOUT, 'utf8');

      expect(source).toContain(
        "/api/og?title=Tianji+Love+Daily+Oracle&subtitle=Quiet+Daily+Reflection+on+Love+Energy&module=tianji"
      );

      // No template-string interpolation.
      expect(source).not.toMatch(/OG_URL\s*=\s*[`'"][^`'"]*\$\{/);

      const ogRelatedLines = source
        .split('\n')
        .filter((l) => l.includes('/api/og') || l.includes('OG_URL') || l.includes('images:'));
      for (const line of ogRelatedLines) {
        for (const param of FORBIDDEN_PARAMS) {
          expect(line, `daily-oracle OG line "${line.trim()}" contains forbidden param "${param}"`).not.toMatch(
            new RegExp(`[?&]${param}=`)
          );
        }
      }
    });

    it('page.tsx never constructs an /api/og URL with dynamic input', () => {
      if (!fs.existsSync(DAILY_ORACLE_PAGE)) {
        return;
      }
      const source = fs.readFileSync(DAILY_ORACLE_PAGE, 'utf8');

      expect(source).not.toMatch(/fetch\([^)]*\/api\/og/);
      expect(source).not.toMatch(/[`'"][^`'"]*\/api\/og\?\$\{/);
      for (const param of FORBIDDEN_PARAMS) {
        expect(source, `daily-oracle page references forbidden OG param "${param}"`).not.toMatch(
          new RegExp(`/api\\/og[^\\n]*${param}=`)
        );
      }
    });
  });

  describe('cross-page OG param sweep', () => {
    it('no public route file in /(main)/love-test or /(main)/daily-oracle leaks forbidden params into OG URLs', () => {
      const dirs = [
        path.join(REPO_ROOT, 'src/app/(main)/love-test'),
        path.join(REPO_ROOT, 'src/app/(main)/daily-oracle'),
      ];

      for (const dir of dirs) {
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir, { recursive: true, withFileTypes: false }) as string[];
        for (const file of files) {
          const full = path.join(dir, file);
          if (!fs.statSync(full).isFile()) continue;
          if (!/\.(ts|tsx)$/.test(file)) continue;
          if (file === 'route.tsx' || file === 'route.ts') continue;
          const source = fs.readFileSync(full, 'utf8');

          for (const param of FORBIDDEN_PARAMS) {
            // Allow the forbidden param to appear in NON-OG contexts
            // (e.g. analytics, query params for the page itself, copy).
            // The strict rule: do not leak it into /api/og.
            const ogLinesWithParam = source
              .split('\n')
              .filter((l) => l.includes('/api/og') && l.includes(`${param}=`));
            expect(
              ogLinesWithParam,
              `${file} contains /api/og line(s) with forbidden param "${param}": ${ogLinesWithParam.join(' | ')}`
            ).toEqual([]);
          }
        }
      }
    });
  });
});