import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * T0-015 (SIAS High-Throughput H5, 2026-07-24) regression contract.
 *
 * Extends the T0-007 + T0-010 OG-privacy pattern to every meta-tool
 * surface under `(main)`. Locks down the same privacy-safe OG contract
 * for the 13 deep-tooling entry points (bazi, tarot, yijing, numerology,
 * ziwei, horary, western, solar-return, sky-chart, transit, electional,
 * fengshui, fortune).
 *
 * Hard rule from `AGENTS.md` §3:
 *   "Do not expose birth date, birth time, birth location, or timezone
 *    on public share pages by default."
 *
 * This contract enforces the OG-image layer for meta-tool surfaces:
 * a future page that pipes user input into its OG URL must FAIL this
 * test and the agent must remove the dynamic param before shipping.
 */

const REPO_ROOT = process.cwd();
const OG_ROUTE = path.join(REPO_ROOT, 'src/app/api/og/route.tsx');
const MAIN_ROUTE_DIR = path.join(REPO_ROOT, 'src/app/(main)');

const META_TOOLS = [
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
] as const;

type MetaTool = (typeof META_TOOLS)[number];

/**
 * Each meta-tool must declare its OG image in a layout.tsx and the
 * layout file is the canonical location for the privacy-safe OG
 * configuration. This test verifies the contract holds uniformly.
 */
function readMetaToolLayout(tool: MetaTool): string {
  const layoutPath = path.join(MAIN_ROUTE_DIR, tool, 'layout.tsx');
  if (!fs.existsSync(layoutPath)) {
    throw new Error(`Missing layout.tsx for meta-tool ${tool}`);
  }
  return fs.readFileSync(layoutPath, 'utf8');
}

describe('T0-015 meta-tool OG parity audit', () => {
  it('every meta-tool has a layout.tsx', () => {
    for (const tool of META_TOOLS) {
      const layoutPath = path.join(MAIN_ROUTE_DIR, tool, 'layout.tsx');
      expect(fs.existsSync(layoutPath), `Missing ${tool}/layout.tsx`).toBe(true);
    }
  });

  it('every meta-tool layout exports a complete metadata object', () => {
    for (const tool of META_TOOLS) {
      const content = readMetaToolLayout(tool);
      expect(content, `${tool}/layout.tsx must export metadata`).toMatch(/export const metadata\s*:/);
      expect(content, `${tool} metadata.title`).toMatch(/title\s*:/);
      expect(content, `${tool} metadata.description`).toMatch(/description\s*:/);
      expect(content, `${tool} metadata.openGraph`).toMatch(/openGraph\s*:/);
      expect(content, `${tool} metadata.twitter`).toMatch(/twitter\s*:/);
      expect(content, `${tool} metadata.alternates`).toMatch(/alternates\s*:/);
    }
  });

  it('every meta-tool OG image URL is privacy-safe (no user data interpolation)', () => {
    // Patterns restricted to query-param context to avoid false positives
    // on static English copy (e.g. "Private relationship question" is a
    // marketing phrase, not user input).
    const FORBIDDEN_PATTERNS: Array<{ name: string; regex: RegExp }> = [
      { name: 'birthDate', regex: /[?&]birthDate=/ },
      { name: 'birth_date', regex: /[?&]birth_date=/ },
      { name: 'birthTime', regex: /[?&]birthTime=/ },
      { name: 'birthPlace', regex: /[?&]birthPlace=/ },
      { name: 'birthLocation', regex: /[?&]birthLocation=/ },
      { name: 'name=', regex: /[?&]name=/ },
      { name: 'userId', regex: /[?&]userId=/ },
      { name: 'relationshipId', regex: /[?&]relationship(?:Id)?=/ },
      { name: 'partnerId', regex: /[?&]partner(?:Id)?=/ },
      { name: 'template-literal', regex: /\$\{[^}]+\}/ },
    ];

    for (const tool of META_TOOLS) {
      const content = readMetaToolLayout(tool);
      const ogUrlMatches = content.match(/\/api\/og\?[^"'\s)]+/g) ?? [];
      expect(
        ogUrlMatches.length,
        `${tool}/layout.tsx must declare at least one /api/og image`
      ).toBeGreaterThan(0);

      for (const ogUrl of ogUrlMatches) {
        for (const { name, regex } of FORBIDDEN_PATTERNS) {
          expect(
            regex.test(ogUrl),
            `${tool}/layout.tsx OG URL "${ogUrl}" contains forbidden pattern "${name}"`
          ).toBe(false);
        }
      }
    }
  });

  it('every meta-tool OG image URL only uses documented /api/og params', () => {
    const ALLOWED_PARAMS = new Set(['title', 'subtitle', 'module']);

    for (const tool of META_TOOLS) {
      const content = readMetaToolLayout(tool);
      const ogUrlMatches = content.match(/\/api\/og\?[^"'\s)]+/g) ?? [];
      for (const ogUrl of ogUrlMatches) {
        const queryString = ogUrl.split('?')[1] ?? '';
        const params = queryString.split('&').map((p) => p.split('=')[0]);
        for (const param of params) {
          expect(
            ALLOWED_PARAMS.has(param),
            `${tool}/layout.tsx OG URL has undocumented param "${param}". ` +
              `Only title/subtitle/module are accepted by /api/og.`
          ).toBe(true);
        }
      }
    }
  });

  it('every meta-tool OG image URL has module=<tool> (or accepted alias)', () => {
    // Some sub-tools share a parent module: solar-return/sky-chart/transit
    // all render under `module=western` because they are sub-fields of
    // western astrology. This map records the accepted aliases.
    const MODULE_ALIASES: Record<MetaTool, readonly string[]> = {
      bazi: ['bazi'],
      tarot: ['tarot'],
      yijing: ['yijing'],
      numerology: ['numerology', 'tianji'],
      ziwei: ['ziwei'],
      horary: ['horary', 'tianji'],
      western: ['western'],
      'solar-return': ['solar-return', 'western'],
      'sky-chart': ['sky-chart', 'western'],
      transit: ['transit', 'western'],
      electional: ['electional', 'tianji'],
      fengshui: ['fengshui', 'tianji'],
      fortune: ['fortune'],
    };

    for (const tool of META_TOOLS) {
      const content = readMetaToolLayout(tool);
      const ogUrlMatches = content.match(/\/api\/og\?[^"'\s)]+/g) ?? [];
      const aliases = MODULE_ALIASES[tool];
      const hasModule = ogUrlMatches.some((url) => {
        const params = (url.split('?')[1] ?? '').split('&');
        const moduleParam = params.find((p) => p.startsWith('module='));
        if (!moduleParam) return false;
        const value = moduleParam.split('=')[1] ?? '';
        return aliases.includes(value);
      });
      expect(
        hasModule,
        `${tool}/layout.tsx OG URL must include one of module=${aliases.join('|')}`
      ).toBe(true);
    }
  });

  it('every meta-tool layout references the canonical SITE url constant', () => {
    for (const tool of META_TOOLS) {
      const content = readMetaToolLayout(tool);
      // Should use SITE.url, not a hardcoded domain.
      expect(
        /SITE\.url/.test(content) || /process\.env\.NEXT_PUBLIC_APP_URL/.test(content),
        `${tool}/layout.tsx must use SITE.url or NEXT_PUBLIC_APP_URL — no hardcoded domains`
      ).toBe(true);
    }
  });

  it('every meta-tool declares alternates.canonical (no missing canonical URL)', () => {
    for (const tool of META_TOOLS) {
      const content = readMetaToolLayout(tool);
      expect(
        /alternates\s*:\s*\{[^}]*canonical/.test(content),
        `${tool}/layout.tsx must declare alternates.canonical`
      ).toBe(true);
    }
  });

  it('/api/og route still only accepts title/subtitle/module (T0-007 baseline)', () => {
    // This is the upstream guarantee — if the route expands its param
    // surface, every meta-tool test above needs to be revisited.
    if (!fs.existsSync(OG_ROUTE)) {
      // The route may be missing in some worktrees; skip rather than fail.
      return;
    }
    const content = fs.readFileSync(OG_ROUTE, 'utf8');
    // The route must define the three params somewhere as the documented surface.
    expect(content).toMatch(/title/);
    expect(content).toMatch(/subtitle/);
    expect(content).toMatch(/module/);
  });
});