import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { sanitizeClientAnalyticsPayload } from '@/lib/analytics/client';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('Tianji Love revenue funnel polish', () => {
  it('homepage contains the primary free CTA and three product cards', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    expect(home).toContain('Start Free Love Reading');
    expect(home).toContain('Love Reading');
    expect(home).toContain('Ask One Question');
    expect(home).toContain('Draw Timing Cards');
    expect(home).toContain('Free First, Deeper When Useful');
    expect(home).toContain('relationship_start_click');
  });

  it('homepage contains the Ask CTA and privacy-safe trust strip', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    expect(home).toContain('Ask One Question');
    expect(home).toContain('Understand your love pattern');
    expect(home).toContain('View Sample Reading');
    expect(home).toContain("href('/ask')");
    expect(home).toContain('Private by default');
    expect(home).toContain('Reflection, not certainty');
    expect(home).toContain('No fear-based selling');
    expect(home).toContain('Secure unlocks');
  });

  it('Ask preview has unlock framing without full answer leakage language', () => {
    const ask = read('src/app/(main)/ask/page.tsx');

    expect(ask).toContain('Unlock the full relationship answer');
    expect(ask).toContain('A deeper interpretation of the emotional pattern');
    expect(ask).toContain('ask_preview_view');
    expect(ask).toContain('ask_unlock_click');
    expect(ask).not.toMatch(/free full answer|complete answer for free|guaranteed outcome/i);
  });

  it('Draw preview has three-card unlock framing without guaranteed prediction copy', () => {
    const draw = read('src/app/(main)/draw/page.tsx');

    expect(draw).toContain('A private Draw Timing preview is ready');
    expect(draw).toContain('Unlock the full Draw Timing reading');
    expect(draw).toContain('Draw three timing cards for the choice in front of you.');
    expect(draw).toContain('Practical next step');
    expect(draw).toContain('draw_preview_view');
    expect(draw).toContain('draw_unlock_click');
    expect(draw).not.toMatch(/guaranteed prediction|guaranteed future|certain future/i);
  });

  it('Pricing copy distinguishes free, one-time unlocks, subscriptions, and reflection boundaries', () => {
    const pricing = read('src/app/(main)/pricing/page.tsx');

    expect(pricing).toContain('Free preview');
    expect(pricing).toContain('One-time Ask unlock');
    expect(pricing).toContain('Draw Timing Reading');
    expect(pricing).toContain('Relationship Destiny Report');
    expect(pricing).toContain('What happens after unlocking');
    expect(pricing).toContain('A deeper private reading');
    expect(pricing).toContain('Love Monthly');
    expect(pricing).toContain('Love Yearly');
    expect(pricing).toContain('Paid unlocks add depth, not certainty');
    expect(pricing).toContain('pricing_view');
    expect(pricing).toContain('pricing_plan_click');
    expect(pricing).toContain('login_start');
  });

  it('Login fallback shows useful static sign-in copy instead of a bare loading state', () => {
    const login = read('src/app/login/page.tsx');

    expect(login).toContain('Sign in to save your readings.');
    expect(login).toContain('unlock deeper reports');
    expect(login).not.toContain('>Loading...</div>');
  });

  it('homepage avoids strong testimonial outcome promises', () => {
    const home = read('src/components/home/TianjiLoveHome.tsx');

    expect(home).not.toMatch(/incredibly accurate|life-changing|guaranteed outcome|guaranteed future/i);
  });

  it('staging HTTPS runbook is staging-only and does not approve production mutation', () => {
    const runbook = read('docs/tianji-love-staging-https-runbook.md');

    expect(runbook).toContain('certbot --nginx -d staging.tianji.love');
    expect(runbook).toContain('proxy_pass http://127.0.0.1:3058');
    expect(runbook).toContain('Do not modify tianji.love production server block.');
    expect(runbook).toContain('Do not restart tianji-global.');
    expect(runbook).toContain('paid launch: No-Go');
  });

  it('analytics event payload excludes sensitive and high-content fields', () => {
    const sanitized = sanitizeClientAnalyticsPayload({
      birthDate: '1990-01-01',
      birthTime: '10:00',
      birthLocation: 'Shanghai',
      timezone: 'Asia/Shanghai',
      rawQuestion: 'Should I contact them?',
      fullResult: 'Long generated result text',
      safeSurface: 'ask_preview',
      cardCount: 3,
    });

    expect(sanitized).toEqual({
      safeSurface: 'ask_preview',
      cardCount: 3,
    });
  });
});
