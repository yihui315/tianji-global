import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const pagePath = 'src/app/[locale]/page.tsx';

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('TianJi Love landing P1 decision-path contract', () => {
  it('defines decision-path, dailyHook, and priceTeaser copy fields in both locales', () => {
    const source = read(pagePath);

    // Type-shape: promise items must now be { headline, when } objects, not plain strings.
    expect(source).toMatch(/promise:\s*\{ headline: string; when: string \}\[\]/);

    // Bilingual parity for the new fields.
    expect(source).toMatch(/dailyHook:\s*'Today, the first three relationship questions are on us\.'/);
    expect(source).toMatch(/dailyHook:\s*'今日起，前三个感情问题，免费解。'/);
    expect(source).toMatch(/priceTeaser:\s*'Free first question/);
    expect(source).toMatch(/priceTeaser:\s*'首次免费/);

    // Each locale must keep exactly three promise entries with non-empty when hints.
    expect(source.match(/when:\s*'[^']+'/g)?.length ?? 0).toBeGreaterThanOrEqual(6);
  });

  it('renders dailyHook between description and primary CTA, and priceTeaser alongside CTAs', () => {
    const source = read(pagePath);

    // dailyHook paragraph renders immediately after the description paragraph.
    const descriptionIdx = source.indexOf('{t.description}');
    const dailyHookIdx = source.indexOf('{t.dailyHook}');
    const ctaIdx = source.indexOf('{t.primaryCta}');
    expect(descriptionIdx).toBeGreaterThan(-1);
    expect(dailyHookIdx).toBeGreaterThan(descriptionIdx);
    expect(ctaIdx).toBeGreaterThan(dailyHookIdx);

    // priceTeaser renders after the secondary CTA, inside the CTA row.
    const secondaryCtaIdx = source.indexOf('{t.secondaryCta}');
    const priceTeaserIdx = source.indexOf('{t.priceTeaser}');
    expect(priceTeaserIdx).toBeGreaterThan(secondaryCtaIdx);
  });

  it('renders each promise item with both headline and when hint', () => {
    const source = read(pagePath);

    // Promise list iterates over `item.headline` and renders `item.when` next to it.
    expect(source).toMatch(/t\.promise\.map\(\(item\) => \(/);
    expect(source).toContain('{item.headline}');
    expect(source).toContain('{item.when}');

    // Inside the promise.map callback body, no bare `{item}` reference should remain.
    // Scope-check by extracting everything from `t.promise.map` to the matching closing `))}`.
    const mapStart = source.indexOf('t.promise.map');
    expect(mapStart).toBeGreaterThan(-1);
    const mapBody = source.slice(mapStart);
    expect(mapBody).not.toMatch(/<[^>]*>\s*\{item\}\s*</);
    expect(mapBody).toContain('{item.headline}');
    expect(mapBody).toContain('{item.when}');
  });
});
