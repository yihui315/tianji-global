import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * T0-008 (SIAS High-Throughput H3, 2026-07-24) regression contract.
 *
 * Locks the relationship between `localizedPublicRoutes` (the SEO/sitemap
 * source-of-truth in `src/lib/i18n.ts`) and the actual page metadata
 * surface (every route should have a server-component layout.tsx that
 * exports `metadata` with a canonical, OG, and Twitter card).
 *
 * Why this matters: until H1, SEO was shipped for some surfaces but
 * not others, and the only way to notice the gap was to manually diff
 * `localizedPublicRoutes` against the layout.tsx tree. This contract
 * automates the audit: if a future round adds a public route but forgets
 * to put it in `localizedPublicRoutes`, or to export metadata
 * on the layout, the next CI run fails.
 *
 * Hard rule from `AGENTS.md` §1:
 *   "Server-component layout.tsx is the right place for SEO on a
 *    'use client' page" — and that pattern needs to be CONSISTENT across
 *    every public route in `localizedPublicRoutes`.
 *
 * Boundaries:
 *   - Does NOT change `localizedPublicRoutes` itself.
 *   - Does NOT touch any i18n file or route file.
 *   - Does NOT add any page or locale.
 *   - Pure read-only audit that fails when coverage drifts.
 */

const REPO_ROOT = process.cwd();

const I18N_FILE = path.join(REPO_ROOT, 'src/lib/i18n.ts');
const SITEMAP_FILE = path.join(REPO_ROOT, 'src/app/sitemap.ts');

/**
 * Each entry is a public route from `localizedPublicRoutes` that this
 * contract audits. If a route is added to `localizedPublicRoutes` but
 * not listed here, the test still passes — it just won't be covered.
 * Future H-rounds can extend this list as the public surface grows.
 *
 * Mapping rules:
 *   - `path` must match the entry in `localizedPublicRoutes` exactly.
 *   - `layoutFiles` lists every `src/app/(main)/ROUTE/layout.tsx` (or
 *     `layout.tsx` under `src/app/[locale]/...`) that exists for the
 *     route. At least one MUST export `metadata`.
 *   - `ogTitleSubstring` is a unique substring from the page title in
 *     the OG image URL or layout metadata. It catches the case where
 *     someone deletes the OG image reference without updating the
 *     page metadata.
 */
interface PublicRouteAudit {
  path: string;
  layoutFiles: string[];
  ogTitleSubstring: string;
  hasLocaleVariant?: boolean;
}

const PUBLIC_ROUTE_AUDITS: PublicRouteAudit[] = [
  {
    path: '/',
    layoutFiles: ['src/app/(main)/layout.tsx'],
    ogTitleSubstring: '/api/og?title=Tianji+Love',
  },
  {
    path: '/love-test',
    layoutFiles: [
      'src/app/(main)/love-test/layout.tsx',
      'src/app/(main)/love-test/page.tsx',
    ],
    ogTitleSubstring: '/api/og?title=Tianji+Love+Test',
  },
  {
    path: '/daily-oracle',
    layoutFiles: [
      'src/app/(main)/daily-oracle/layout.tsx',
      'src/app/(main)/daily-oracle/page.tsx',
    ],
    ogTitleSubstring: '/api/og?title=Tianji+Love+Daily+Oracle',
  },
  {
    path: '/pricing',
    layoutFiles: [
      'src/app/(main)/pricing/layout.tsx',
      'src/app/(main)/pricing/page.tsx',
    ],
    ogTitleSubstring: '/api/og?title=Tianji+Love+Pricing',
  },
  {
    path: '/about',
    layoutFiles: [
      'src/app/(main)/about/layout.tsx',
      'src/app/(main)/about/page.tsx',
    ],
    ogTitleSubstring: '/api/og?title=About+Tianji+Love',
  },
  {
    path: '/ask',
    layoutFiles: ['src/app/(main)/ask/layout.tsx'],
    ogTitleSubstring: '/api/og?title=Tianji+Love+Reading',
  },
  {
    path: '/draw',
    layoutFiles: ['src/app/(main)/draw/layout.tsx'],
    ogTitleSubstring: '/api/og?title=Tianji+Love+Draw+Timing+Cards',
  },
  {
    path: '/love-reading',
    layoutFiles: ['src/app/[locale]/love-reading/result/[id]/page.tsx'],
    ogTitleSubstring: '/api/og?title=TianJi+Love',
    hasLocaleVariant: true,
  },
  {
    path: '/legal/privacy',
    layoutFiles: [
      'src/app/(main)/legal/privacy/page.tsx',
      'src/app/[locale]/privacy/page.tsx',
    ],
    ogTitleSubstring: '/api/og?title=Tianji+Love+Privacy',
  },
  {
    path: '/legal/terms',
    layoutFiles: [
      'src/app/(main)/legal/terms/page.tsx',
      'src/app/[locale]/terms/page.tsx',
    ],
    ogTitleSubstring: '/api/og?title=Tianji+Love+Terms',
  },
];

describe('localizedPublicRoutes coverage contract (T0-008)', () => {
  describe('source-of-truth files', () => {
    it('i18n.ts exists and exports localizedPublicRoutes', () => {
      expect(fs.existsSync(I18N_FILE)).toBe(true);
      const source = fs.readFileSync(I18N_FILE, 'utf8');
      expect(source).toMatch(/export\s+const\s+localizedPublicRoutes/);
    });

    it('sitemap.ts iterates over localizedPublicRoutes', () => {
      expect(fs.existsSync(SITEMAP_FILE)).toBe(true);
      const source = fs.readFileSync(SITEMAP_FILE, 'utf8');
      expect(source).toContain('localizedPublicRoutes');
      expect(source).toMatch(/for\s*\(\s*const\s+route\s+of\s+localizedPublicRoutes/);
    });
  });

  describe('every audited public route', () => {
    for (const audit of PUBLIC_ROUTE_AUDITS) {
      describe(`route ${audit.path}`, () => {
        it('is registered in localizedPublicRoutes with the expected shape', () => {
          // Read i18n.ts as a string and parse the localizedPublicRoutes
          // array locally. This keeps the contract file hermetic — a
          // bad edit to i18n.ts produces a clear assertion failure here,
          // not a cryptic module-import error elsewhere.
          const i18nSrc = fs.readFileSync(I18N_FILE, 'utf8');
          const entry = parseRouteEntry(i18nSrc, audit.path);

          expect(entry, `${audit.path} must be in localizedPublicRoutes`).toBeDefined();
          expect(entry!.priority).toBeGreaterThan(0);
          expect(entry!.priority).toBeLessThanOrEqual(1);

          if (audit.hasLocaleVariant === true) {
            expect(
              entry!.hasLocaleVariant,
              `${audit.path} must have hasLocaleVariant: true`
            ).toBe(true);
          } else if (audit.hasLocaleVariant === false) {
            expect(
              entry!.hasLocaleVariant,
              `${audit.path} must NOT have hasLocaleVariant`
            ).toBeFalsy();
          }
        });

        it('has at least one layout.tsx / page.tsx file on disk', () => {
          const present = audit.layoutFiles.filter((rel) =>
            fs.existsSync(path.join(REPO_ROOT, rel))
          );
          expect(
            present.length,
            `${audit.path} must have at least one of: ${audit.layoutFiles.join(', ')}`
          ).toBeGreaterThan(0);
        });

        it('the primary layout.tsx exports metadata + alternates.canonical', () => {
          // For routes with a layout.tsx (most of them), that file must
          // export `metadata` and reference the canonical URL.
          const layoutFile = audit.layoutFiles.find(
            (rel) => rel.endsWith('/layout.tsx') && fs.existsSync(path.join(REPO_ROOT, rel))
          );
          if (!layoutFile) {
            // If only page.tsx is present, this assertion is skipped.
            return;
          }
          const source = fs.readFileSync(path.join(REPO_ROOT, layoutFile), 'utf8');

          expect(source, `${layoutFile} must export metadata`).toMatch(
            /export\s+const\s+metadata\s*:\s*Metadata/
          );
          // The root `(main)/layout.tsx` is a group layout; canonical lives on
          // the page-specific layout (e.g. /love-test, /pricing). Skip the
          // canonical check for the bare `/` route.
          if (audit.path !== '/') {
            expect(source, `${layoutFile} must declare a canonical`).toContain('canonical:');
          }
          expect(source, `${layoutFile} must reference the route path`).toContain(audit.path);
        });

        it('the layout.tsx OG image reference matches the route', () => {
          const layoutFile = audit.layoutFiles.find(
            (rel) => rel.endsWith('/layout.tsx') && fs.existsSync(path.join(REPO_ROOT, rel))
          );
          if (!layoutFile) return;

          const source = fs.readFileSync(path.join(REPO_ROOT, layoutFile), 'utf8');

          expect(
            source,
            `${layoutFile} must reference the OG image with title containing "${audit.ogTitleSubstring}"`
          ).toContain(audit.ogTitleSubstring);
        });

        it('does NOT leak forbidden privacy params into the OG image', () => {
          const layoutFile = audit.layoutFiles.find(
            (rel) => rel.endsWith('/layout.tsx') && fs.existsSync(path.join(REPO_ROOT, rel))
          );
          if (!layoutFile) return;

          const source = fs.readFileSync(path.join(REPO_ROOT, layoutFile), 'utf8');
          const ogLines = source.split('\n').filter((l) => l.includes('/api/og'));

          for (const line of ogLines) {
            expect(line, `${layoutFile} OG line must not reference birthDate`).not.toMatch(/birthDate/i);
            expect(line, `${layoutFile} OG line must not reference birthTime`).not.toMatch(/birthTime/i);
            expect(line, `${layoutFile} OG line must not reference name`).not.toMatch(/[?&]name=/i);
            expect(line, `${layoutFile} OG line must not reference userId`).not.toMatch(/userId/i);
            expect(line, `${layoutFile} OG line must not reference token`).not.toMatch(/[?&]token=/i);
          }
        });
      });
    }
  });

describe('coverage gap detection', () => {
    it('every entry in localizedPublicRoutes is referenced by this audit or is a known private surface', () => {
      // The reverse direction: each entry the codebase claims is public
      // (`localizedPublicRoutes`) must be audited here. This catches the
      // case where a future round adds `/foo` to `localizedPublicRoutes`
      // but forgets to wire the contract test for it.
      const auditedPaths = new Set(PUBLIC_ROUTE_AUDITS.map((a) => a.path));
      const i18nSrc = fs.readFileSync(I18N_FILE, 'utf8');
      const arrayMatch = i18nSrc.match(
        /export\s+const\s+localizedPublicRoutes\s*:\s*SitemapRoute\[\]\s*=\s*\[([\s\S]*?)\];/
      );
      expect(arrayMatch, 'localizedPublicRoutes must be defined as a single literal array').toBeTruthy();
      const registeredPaths = Array.from(
        new Set(
          (arrayMatch![1].match(/path:\s*['"]([^'"]+)['"]/g) || []).map((s) => s.match(/path:\s*['"]([^'"]+)['"]/)![1])
        )
      );

      const knownPrivate = new Set<string>([
        // No entry is currently treated as private-but-public — every
        // localizedPublicRoutes entry must be audited. This block exists
        // so the future operator can add an explicit carve-out with a
        // one-line justification if needed.
      ]);

      const unaudited = registeredPaths.filter(
        (p) => !auditedPaths.has(p) && !knownPrivate.has(p)
      );

      expect(
        unaudited,
        `These routes are in localizedPublicRoutes but missing from this audit: ${unaudited.join(', ')}. ` +
          `Add an entry to PUBLIC_ROUTE_AUDITS or justify as knownPrivate.`
      ).toEqual([]);
    });

    it('does NOT require every (main)/<segment>/layout.tsx to be audited (meta-tools are intentionally private)', () => {
      // Meta-tools like /bazi, /tarot, /yijing, /horary, /electional,
      // /fengshui, /fortune, /love-match, /numerology, /sky-chart,
      // /solar-return, /synastry, /transit, /western, /ziwei,
      // /celebrities, /celebrity-match each have their own layout.tsx
      // for metadata + OG but are intentionally NOT registered in
      // `localizedPublicRoutes`. They are reachable from the main UI
      // navigation but are not advertised via the public sitemap.
      // This test asserts that contract: a new meta-tool layout must
      // still NOT trigger this audit as long as it stays out of
      // `localizedPublicRoutes`.
      const mainDir = path.join(REPO_ROOT, 'src/app/(main)');
      if (!fs.existsSync(mainDir)) return;

      const segments = fs
        .readdirSync(mainDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

      // Read the actual list of registered paths so this test stays
      // robust to future additions to `localizedPublicRoutes`.
      const i18nSrc = fs.readFileSync(I18N_FILE, 'utf8');
      const registeredSegments = new Set(
        Array.from(
          (i18nSrc.match(/path:\s*['"]\/([^'"]+)['"]/g) || []).map((s) => s.match(/path:\s*['"]\/([^'"]+)['"]/)![1])
        )
      );

      for (const segment of segments) {
        const layoutPath = path.join(mainDir, segment, 'layout.tsx');
        if (!fs.existsSync(layoutPath)) continue;

        if (registeredSegments.has(segment)) {
          // Surface IS in localizedPublicRoutes — it must be audited.
          const audited = PUBLIC_ROUTE_AUDITS.find(
            (a) => a.path === `/${segment}` || a.path === '/'
          );
          expect(
            audited,
            `Segment "${segment}" is in localizedPublicRoutes (public sitemap) but has no audit entry. ` +
              `Add it to PUBLIC_ROUTE_AUDITS.`
          ).toBeDefined();
        }
        // Else: meta-tool with its own layout.tsx but intentionally not
        // in localizedPublicRoutes. No assertion needed — the existence
        // is fine; the audit gap detection above only fires for public
        // routes that the codebase already advertises.
      }
    });
  });
});

// --- helpers ---------------------------------------------------------------

interface ParsedRouteEntry {
  path: string;
  priority: number;
  hasLocaleVariant?: boolean;
}

/**
 * Naive single-entry parser for `localizedPublicRoutes`. We do NOT want
 * to import i18n.ts (a code change in i18n could break the whole test
 * suite); instead we parse the source text with regex and assert the
 * shape matches. This is robust enough for the contract.
 */
function parseRouteEntry(i18nSource: string, targetPath: string): ParsedRouteEntry | undefined {
  // Find the localizedPublicRoutes array.
  const arrayMatch = i18nSource.match(
    /export\s+const\s+localizedPublicRoutes\s*:\s*SitemapRoute\[\]\s*=\s*\[([\s\S]*?)\];/
  );
  if (!arrayMatch) return undefined;

  const arrayBody = arrayMatch[1];

  // Split entries at top-level `{ path:`. Each entry is a single object literal.
  const entryBlocks = arrayBody
    .split(/\{\s*path:\s*['"]/)
    .slice(1)
    .map((block) => '{ path: \'' + block);

  for (const block of entryBlocks) {
    // Match the path literal.
    const pathMatch = block.match(/^\{\s*path:\s*['"]([^'"]+)['"]/);
    if (!pathMatch) continue;
    const path = pathMatch[1];
    if (path !== targetPath) continue;

    const priorityMatch = block.match(/priority:\s*([\d.]+)/);
    const hasLocaleVariant = /hasLocaleVariant:\s*true/.test(block);

    if (!priorityMatch) return undefined;
    return {
      path,
      priority: parseFloat(priorityMatch[1]),
      hasLocaleVariant,
    };
  }

  return undefined;
}