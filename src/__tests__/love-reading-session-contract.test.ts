import { NextRequest } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function jsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/love-reading/session', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  });
}

describe('love reading session funnel', () => {
  beforeEach(async () => {
    process.env.DATABASE_URL = '';
    const store = await import('../lib/love-reading-store');
    store.resetLoveReadingMemoryStoreForTests();
  });

  it('creates a private session, redirects by session id, and serves a free teaser only', async () => {
    const { POST } = await import('../app/api/love-reading/session/route');
    const createResponse = await POST(
      jsonRequest({
        locale: 'en',
        readingMode: 'solo',
        birthDate: '1992-07-18',
        birthTime: '21:30',
        birthPlace: 'Los Angeles',
      })
    );

    expect(createResponse.status).toBe(201);
    const createPayload = await createResponse.json();

    expect(createPayload.success).toBe(true);
    expect(createPayload.data.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    expect(createPayload.data.redirectUrl).toBe(
      `/en/love-reading/result/${createPayload.data.sessionId}`
    );

    const serializedCreatePayload = JSON.stringify(createPayload);
    expect(serializedCreatePayload).not.toContain('1992-07-18');
    expect(serializedCreatePayload).not.toContain('21:30');
    expect(serializedCreatePayload).not.toContain('Los Angeles');

    const { GET } = await import('../app/api/love-reading/session/[sessionId]/route');
    const teaserResponse = await GET(new Request('http://localhost/api/love-reading/session'), {
      params: Promise.resolve({ sessionId: createPayload.data.sessionId }),
    });
    const teaserPayload = await teaserResponse.json();

    expect(teaserResponse.status).toBe(200);
    expect(teaserPayload.success).toBe(true);
    expect(teaserPayload.data.sessionId).toBe(createPayload.data.sessionId);
    expect(teaserPayload.data.teaser.summary).toContain('romantic patterns');
    expect(teaserPayload.data.teaser.emotionalInsight).toContain('longing');
    expect(teaserPayload.data.teaser.actionableSuggestion).toContain('conversation');
    expect(teaserPayload.data.lockedSections).toEqual([
      'Karmic Patterns',
      'Relationship Dynamics',
      'Future Timing',
      'Emotional Compatibility',
      'Actionable Guidance',
      'Private report link',
    ]);

    const serializedTeaserPayload = JSON.stringify(teaserPayload);
    expect(serializedTeaserPayload).not.toContain('birthDate');
    expect(serializedTeaserPayload).not.toContain('birthTime');
    expect(serializedTeaserPayload).not.toContain('birthPlace');
    expect(serializedTeaserPayload).not.toContain('1992-07-18');
    expect(serializedTeaserPayload).not.toContain('21:30');
    expect(serializedTeaserPayload).not.toContain('Los Angeles');
  });

  it('wires the homepage form, result page, and minimal Supabase schema contract', () => {
    const home = fs.readFileSync(path.join(repoRoot, 'src/components/home/TianjiLoveHome.tsx'), 'utf8');
    const resultPage = fs.readFileSync(
      path.join(repoRoot, 'src/app/[locale]/love-reading/result/[id]/page.tsx'),
      'utf8'
    );
    const migration = fs.readFileSync(
      path.join(repoRoot, 'supabase/migrations/20260507_love_reading_funnel.sql'),
      'utf8'
    );

    expect(home).toContain("fetch('/api/love-reading/session'");
    expect(home).toContain('router.push(payload.data.redirectUrl)');
    expect(home).toContain('name="birthDate"');

    expect(resultPage).toContain('getLoveReadingSession');
    expect(resultPage).toContain('Free teaser result');
    expect(resultPage).toContain('Locked premium sections');
    expect(resultPage).toContain('LoveReportCheckoutButton');
    expect(resultPage).toContain('ReportJobPoller');
    expect(resultPage).not.toMatch(/birth(Date|Time|Place)/);

    for (const tableName of ['reading_sessions', 'birth_profiles', 'reading_teasers']) {
      expect(migration).toContain(`create table if not exists public.${tableName}`);
      expect(migration).toContain(`alter table public.${tableName} enable row level security`);
    }
  });
});
