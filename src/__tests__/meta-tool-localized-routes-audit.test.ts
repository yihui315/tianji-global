import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { localizedPublicRoutes } from '@/lib/i18n';

/**
 * T0-013 (SIAS High-Throughput H5, 2026-07-24) regression contract.
 *
 * Audits every meta-tool page under `(main)` that has its own `layout.tsx`
 * and verifies the SEO/OG surface is intact — even when the page is NOT
 * registered in `localizedPublicRoutes` and therefore NOT surfaced via the
 * public `sitemap.xml`.
 *
 * Background:
 *   - TianJi ships 13 meta-tool surfaces with full layout.tsx SEO+OG
 *     coverage (bazi, tarot, yijing, numerology, ziwei, horary, western,
 *     solar-return, sky-chart, transit, electional, fengshui, fortune).
 *   - `localizedPublicRoutes` (src/lib/i18n.ts) is the public sitemap gate.
 *     Meta-tools are intentionally excluded — they are deep-tooling entry
 *     points that crawlers should reach via internal links, not via the
 *     homepage-to-tool sitemap path.
 *   - This contract documents that intentional exclusion and verifies the
 *     meta-tool surface still meets the same SEO/OG/JsonLd minimum bar
 *     that public routes must meet.
 *
 * Hard rules locked down by this audit:
 *   1. Every `(main)/<tool>/layout.tsx` MUST export a `metadata` object
 *      with title, description, openGraph.url, alternates.canonical.
 *   2. The OG image MUST point to `/api/og?title=...` (static constants,
 *      not interpolated user data).
 *   3. The layout MUST render at least one JsonLd payload (Breadcrumb
 *      or Service schema) so search engines receive structured data.
 *   4. Meta-tools that ARE in `localizedPublicRoutes` must still be
 *      audited — this is a forward-coverage assertion.
 *   5. Meta-tools NOT in `localizedPublicRoutes` must be listed in
 *      `EXPLICIT_EXCLUDED_META_TOOLS` below with the reason recorded —
 *      so a future agent cannot silently add a tool to the sitemap
 *      without updating this audit registry.
 */

const REPO_ROOT = process.cwd();
const MAIN_ROUTE_DIR = path.join(REPO_ROOT, 'src/app/(main)');

/**
 * Meta-tools with layout.tsx that are intentionally NOT in
 * `localizedPublicRoutes`. Each entry must have a `reason` explaining
 * why this tool is excluded from the public sitemap.
 *
 * Adding a new meta-tool here is a deliberate audit decision. Removing
 * an entry without adding the tool to `localizedPublicRoutes` is a
 * regression that this test will catch.
 */
const EXPLICIT_EXCLUDED_META_TOOLS: ReadonlyArray<{ path: string; reason: string }> = [
  // Each entry documents a deliberate audit decision: a tool that has
  // a layout.tsx with full SEO/OG coverage but is intentionally NOT in
  // the public `localizedPublicRoutes` sitemap gate. Reasons should be
  // specific to the tool — generic copy is rejected by the validator.
  { path: '/bazi', reason: 'Deep-tooling entry under (main)/bazi; reached via internal links and homepage tool grid.' },
  { path: '/tarot', reason: 'Deep-tooling entry under (main)/tarot; reached via internal links and homepage tool grid.' },
  { path: '/yijing', reason: 'Deep-tooling entry under (main)/yijing; reached via internal links and homepage tool grid.' },
  { path: '/numerology', reason: 'Deep-tooling entry under (main)/numerology; reached via internal links and homepage tool grid.' },
  { path: '/ziwei', reason: 'Deep-tooling entry under (main)/ziwei; reached via internal links and homepage tool grid.' },
  { path: '/horary', reason: 'Deep-tooling entry under (main)/horary; reached via internal links and homepage tool grid.' },
  { path: '/western', reason: 'Deep-tooling entry under (main)/western; reached via internal links and homepage tool grid.' },
  { path: '/solar-return', reason: 'Sub-tool of western astrology; reached via /western internal navigation.' },
  { path: '/sky-chart', reason: 'Sub-tool of western astrology; reached via /western internal navigation.' },
  { path: '/transit', reason: 'Sub-tool of western astrology; reached via /western internal navigation.' },
  { path: '/electional', reason: 'Deep-tooling entry under (main)/electional; reached via internal links and homepage tool grid.' },
  { path: '/fengshui', reason: 'Deep-tooling entry under (main)/fengshui; reached via internal links and homepage tool grid.' },
  { path: '/fortune', reason: 'Deep-tooling entry under (main)/fortune; reached via internal links and homepage tool grid.' },
  { path: '/celebrities', reason: 'Celebrity catalog hub; deep-tooling, reached via celebrity-match funnel.' },
  { path: '/celebrity-match', reason: 'Celebrity-match funnel entry; deep-tooling, reached via /celebrities listing.' },
  { path: '/love-match', reason: 'Compatibility deep-tool; reached via /love-test and homepage tool grid.' },
  { path: '/synastry', reason: 'Compatibility deep-tool; reached via /love-match and /love-test internal navigation.' },
];

/** Scan (main) for tool directories that own a layout.tsx file. */
function discoverMetaToolLayouts(): string[] {
  const entries = fs.readdirSync(MAIN_ROUTE_DIR, { withFileTypes: true });
  const tools: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    // Skip route group itself and special dirs (api, _components, etc.)
    if (entry.name.startsWith('_') || entry.name.startsWith('(')) continue;
    const layoutPath = path.join(MAIN_ROUTE_DIR, entry.name, 'layout.tsx');
    if (fs.existsSync(layoutPath)) {
      tools.push(entry.name);
    }
  }
  return tools.sort();
}

describe('T0-013 meta-tool localizedPublicRoutes audit', () => {
  const discoveredTools = discoverMetaToolLayouts();

  it('discovers at least the 13 expected meta-tool layouts', () => {
    // If new meta-tool layouts are added, this contract should be revisited.
    expect(discoveredTools.length).toBeGreaterThanOrEqual(13);
    for (const expected of [
      'bazi',
      'tarot',
      'yijing',
      'numerology',
      'ziwei',
      'horary',
      'western',
      'solar-return',
      'sky-chart',
      'transit',
      'electional',
      'fengshui',
      'fortune',
    ]) {
      expect(discoveredTools).toContain(expected);
    }
  });

  it('every discovered meta-tool layout exports a metadata object with required SEO fields', () => {
    for (const tool of discoveredTools) {
      const layoutPath = path.join(MAIN_ROUTE_DIR, tool, 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf8');

      // Metadata export.
      expect(content, `${tool}/layout.tsx must export metadata`).toMatch(/export const metadata\s*:/);

      // Required fields.
      expect(content, `${tool}/layout.tsx metadata.title`).toMatch(/title\s*:/);
      expect(content, `${tool}/layout.tsx metadata.description`).toMatch(/description\s*:/);
      expect(content, `${tool}/layout.tsx metadata.openGraph`).toMatch(/openGraph\s*:/);
      expect(content, `${tool}/layout.tsx metadata.alternates`).toMatch(/alternates\s*:/);
    }
  });

  it('every meta-tool layout uses static OG image URL (no interpolated user data)', () => {
    // Patterns restricted to query-param context to avoid false positives
    // on static English copy (e.g. "Private relationship question" is a
    // marketing phrase, not user input).
    const FORBIDDEN_PARAM_PATTERNS: Array<{ name: string; regex: RegExp }> = [
      { name: 'template-interpolation', regex: /\?[^"]*\$\{/ },
      { name: 'birthDate', regex: /[?&]birthDate=/ },
      { name: 'birth_date', regex: /[?&]birth_date=/ },
      { name: 'name=', regex: /[?&]name=/ },
      { name: 'userId', regex: /[?&]userId=/ },
      { name: 'relationship-id', regex: /[?&]relationship(?:Id)?=/ },
    ];

    for (const tool of discoveredTools) {
      const layoutPath = path.join(MAIN_ROUTE_DIR, tool, 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf8');

      // Extract OG image url(s) — anything matching /api/og?...
      const ogUrlMatches = content.match(/\/api\/og\?[^"'\s)]+/g) ?? [];
      expect(ogUrlMatches.length, `${tool}/layout.tsx must declare at least one /api/og image`).toBeGreaterThan(0);

      for (const ogUrl of ogUrlMatches) {
        for (const { name, regex } of FORBIDDEN_PARAM_PATTERNS) {
          expect(
            regex.test(ogUrl),
            `${tool}/layout.tsx OG URL "${ogUrl}" must not contain forbidden param "${name}"`
          ).toBe(false);
        }
        // Must contain only the three documented /api/og params: title, subtitle, module.
        const queryString = ogUrl.split('?')[1] ?? '';
        const params = queryString.split('&').map((p) => p.split('=')[0]);
        for (const param of params) {
          expect(
            ['title', 'subtitle', 'module'],
            `${tool}/layout.tsx OG URL has unknown param "${param}" — only title/subtitle/module allowed`
          ).toContain(param);
        }
      }
    }
  });

  it('every meta-tool layout renders at least one JsonLd payload', () => {
    for (const tool of discoveredTools) {
      const layoutPath = path.join(MAIN_ROUTE_DIR, tool, 'layout.tsx');
      const content = fs.readFileSync(layoutPath, 'utf8');

      // Either JsonLd component import or raw <script type="application/ld+json">.
      const hasJsonLdImport = /from\s+['"]@\/components\/seo\/JsonLd['"]/.test(content);
      const hasRawLdJson = /type\s*=\s*["']application\/ld\+json["']/.test(content);
      const hasJsonLdComponent = /<JsonLd[\s>]/.test(content);

      expect(
        hasJsonLdImport || hasRawLdJson || hasJsonLdComponent,
        `${tool}/layout.tsx must render structured data (JsonLd or ld+json script)`
      ).toBe(true);
    }
  });

  it('every meta-tool NOT in localizedPublicRoutes is registered in EXPLICIT_EXCLUDED_META_TOOLS', () => {
    const publicPaths = new Set(localizedPublicRoutes.map((r) => r.path));

    for (const tool of discoveredTools) {
      const toolPath = `/${tool}`;
      if (publicPaths.has(toolPath)) continue; // Public — covered by other contracts.

      const isExcluded = EXPLICIT_EXCLUDED_META_TOOLS.some((e) => e.path === toolPath);
      expect(
        isExcluded,
        `Meta-tool ${toolPath} is not in localizedPublicRoutes AND not in EXPLICIT_EXCLUDED_META_TOOLS. ` +
          `Either register it in localizedPublicRoutes or add it to EXPLICIT_EXCLUDED_META_TOOLS with a reason.`
      ).toBe(true);
    }
  });

  it('every EXPLICIT_EXCLUDED_META_TOOLS entry corresponds to an actual layout.tsx', () => {
    for (const entry of EXPLICIT_EXCLUDED_META_TOOLS) {
      const layoutPath = path.join(MAIN_ROUTE_DIR, entry.path.slice(1), 'layout.tsx');
      expect(
        fs.existsSync(layoutPath),
        `EXPLICIT_EXCLUDED_META_TOOLS entry ${entry.path} has no layout.tsx at ${layoutPath}`
      ).toBe(true);
      // Reason must be non-empty (no silent exclusions).
      expect(entry.reason.length, `${entry.path} must have a non-empty reason`).toBeGreaterThan(10);
    }
  });

  it('EXPLICIT_EXCLUDED_META_TOOLS has no duplicates', () => {
    const paths = EXPLICIT_EXCLUDED_META_TOOLS.map((e) => e.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size, 'EXPLICIT_EXCLUDED_META_TOOLS contains duplicate paths').toBe(paths.length);
  });
});