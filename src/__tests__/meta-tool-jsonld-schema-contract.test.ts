import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * T0-017 (SIAS High-Throughput H6, 2026-07-24).
 *
 * Source audit for every meta-tool layout. The contract deliberately keeps
 * Service for reading/divination surfaces: changing it to SoftwareApplication
 * would misrepresent these pages without explicit product semantics.
 */
describe('T0-017 meta-tool JsonLd schema audit', () => {
  const repoRoot = process.cwd();
  const mainDir = path.join(repoRoot, 'src/app/(main)');
  const tools = fs
    .readdirSync(mainDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(mainDir, entry.name, 'layout.tsx')))
    .map((entry) => entry.name)
    .sort();

  it('audits every meta-tool layout for schema identity and required fields', () => {
    expect(tools.length).toBeGreaterThanOrEqual(13);
    for (const tool of tools) {
      const source = fs.readFileSync(path.join(mainDir, tool, 'layout.tsx'), 'utf8');
      expect(source, `${tool} must render JsonLd`).toMatch(/<JsonLd\s+data=/);
      expect(source, `${tool} must declare schema type`).toMatch(/'@type':\s*['"][A-Za-z]+['"]/);
      expect(source, `${tool} schema must declare name`).toMatch(/name:\s*['"][^'"]+['"]/);
      expect(source, `${tool} schema must declare description`).toContain('description: DESCRIPTION');
      expect(source, `${tool} schema must declare url`).toContain('url: PAGE_URL');
      const isServiceLike = /'@type':\s*'Service'/.test(source);
      if (isServiceLike) {
        expect(source, `${tool} schema must identify provider`).toMatch(/provider:\s*\{/);
        expect(source, `${tool} schema provider must identify organization`).toMatch(/SITE\.url/);
      } else {
        expect(source, `${tool} non-Service schema must identify site/entity`).toMatch(/SITE\.url/);
      }
    }
  });

  it('keeps reading/divination meta-tools typed as Service unless product semantics change', () => {
    const serviceTools = [
      'ask', 'bazi', 'celebrity-match', 'draw', 'electional', 'fengshui', 'fortune',
      'horary', 'love-match', 'numerology', 'sky-chart', 'solar-return', 'synastry',
      'tarot', 'transit', 'western', 'yijing', 'ziwei',
    ];
    for (const tool of serviceTools) {
      const source = fs.readFileSync(path.join(mainDir, tool, 'layout.tsx'), 'utf8');
      expect(source, `${tool} schema type must remain Service`).toMatch(/'@type':\s*'Service'/);
      expect(source, `${tool} must not be relabeled as SoftwareApplication`).not.toMatch(/'@type':\s*'SoftwareApplication'/);
    }
  });
});
