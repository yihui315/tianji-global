import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Tianji Love ask page contract', () => {
  it('keeps /ask on the existing preview and unlock API contract', () => {
    const page = read('src/app/(main)/ask/page.tsx');

    expect(page).toContain("fetch('/api/ask/preview'");
    expect(page).toContain("fetch('/api/ask/unlock'");
    expect(page).toContain('session_id');
    expect(page).toContain('writeStoredPreview(state)');
    expect(page).not.toContain('/api/relationship/analyze');
    expect(page).not.toContain('getSupabase');
    expect(page).not.toContain("from('");
  });

  it('uses the Tianji Love visual shell for Love Reading', () => {
    const page = read('src/app/(main)/ask/page.tsx');

    for (const signal of [
      'tianji-love-ask-page',
      'tianji-love-shell-header',
      'tianji-love-logo-mark.png',
      'tianji-love-couple-red-thread-16x9.png',
      'tianji-love-moon-pavilion-16x9.png',
      'Love Reading',
      'Ask about the pattern your heart keeps returning to.',
      'Decode my love question',
      'Private preview',
      'One-time unlock',
      'love-final-pavilion-cta',
    ]) {
      expect(page).toContain(signal);
    }
  });

  it('preserves Tianji Love navigation routes from the ask page', () => {
    const page = read('src/app/(main)/ask/page.tsx');

    expect(page).toContain("href('/')");
    expect(page).toContain("href('/relationship/new')");
    expect(page).toContain("href('/ask')");
    expect(page).toContain("href('/draw')");
    expect(page).toContain("href('/pricing')");
    expect(page).toContain("href('/about')");
    expect(page).toContain("href('/login')");
    expect(page).toContain("href('/legal/privacy')");
    expect(page).toContain("{copy.nav.loveReading}");
    expect(page).toContain("{copy.nav.ask}");
    expect(page).toContain("{copy.nav.draw}");
    expect(page).not.toContain("{copy.nav.compatibility}");
    expect(page).not.toContain("{copy.nav.timing}");
    expect(page).toContain('withLanguageParam(path, language)');
  });

  it('does not bring back the old generic oracle landing components', () => {
    const page = read('src/app/(main)/ask/page.tsx');

    expect(page).not.toContain('BackgroundVideoHero');
    expect(page).not.toContain('ModuleInputShell');
    expect(page).not.toContain('PageChrome');
    expect(page).not.toContain('LanguageSwitch');
    expect(page).not.toContain('fortune-hero-loop');
    expect(page).not.toContain('fortune-hero-master');
  });
});
