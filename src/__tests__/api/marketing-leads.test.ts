import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getPool: () => ({
    query: mocks.query,
  }),
}));

function postRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest('https://tianji.love/api/marketing/leads', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      'user-agent': 'vitest-marketing-leads',
      ...headers,
    },
  });
}

const validPayload = {
  email: 'reader@example.com',
  name: 'Reader',
  source_page: 'love-reading',
  locale: 'en',
  variant: 'inline',
  consent: true,
  utm_source: 'newsletter',
  utm_medium: 'email',
  utm_campaign: 'love-reading-launch',
  utm_content: 'hero',
  utm_term: 'compatibility',
};

describe('/api/marketing/leads', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mocks.query.mockReset();
  });

  it('writes a valid lead with hashed IP and returns 201', async () => {
    mocks.query.mockResolvedValue({ rowCount: 1 });

    const { POST } = await import('@/app/api/marketing/leads/route');
    const response = await POST(postRequest(validPayload, {
      'x-forwarded-for': '203.0.113.10',
    }));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual({ success: true });
    expect(mocks.query).toHaveBeenCalledTimes(1);

    const [sql, values] = mocks.query.mock.calls[0];
    expect(sql).toContain('public.marketing_leads');
    expect(values).toEqual([
      'reader@example.com',
      'Reader',
      'love-reading',
      'en',
      'inline',
      'newsletter',
      'email',
      'love-reading-launch',
      'hero',
      'compatibility',
      expect.stringMatching(/^[a-f0-9]{64}$/),
      'vitest-marketing-leads',
    ]);
    expect(JSON.stringify(values)).not.toContain('203.0.113.10');
  });

  it('writes optional fields as null and hashes x-real-ip when forwarded IP is absent', async () => {
    mocks.query.mockResolvedValue({ rowCount: 1 });

    const { POST } = await import('@/app/api/marketing/leads/route');
    const response = await POST(postRequest({
      email: 'minimal@example.com',
      source_page: 'ask',
      consent: true,
    }, {
      'x-real-ip': '198.51.100.42',
    }));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual({ success: true });

    const [, values] = mocks.query.mock.calls[0];
    expect(values).toEqual([
      'minimal@example.com',
      null,
      'ask',
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      expect.stringMatching(/^[a-f0-9]{64}$/),
      'vitest-marketing-leads',
    ]);
    expect(JSON.stringify(values)).not.toContain('198.51.100.42');
  });

  it('truncates user_agent before storage', async () => {
    mocks.query.mockResolvedValue({ rowCount: 1 });
    const longUserAgent = 'a'.repeat(700);

    const { POST } = await import('@/app/api/marketing/leads/route');
    const response = await POST(postRequest(validPayload, {
      'user-agent': longUserAgent,
    }));

    expect(response.status).toBe(201);
    const [, values] = mocks.query.mock.calls[0];
    expect(values[11]).toHaveLength(512);
  });

  it('rejects invalid email with invalid_payload', async () => {
    const { POST } = await import('@/app/api/marketing/leads/route');
    const response = await POST(postRequest({ ...validPayload, email: 'not-an-email' }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ success: false, error: 'invalid_payload' });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('rejects missing source_page with invalid_payload', async () => {
    const payload: Partial<typeof validPayload> = { ...validPayload };
    delete payload.source_page;

    const { POST } = await import('@/app/api/marketing/leads/route');
    const response = await POST(postRequest(payload));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ success: false, error: 'invalid_payload' });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('rejects consent false with invalid_payload', async () => {
    const { POST } = await import('@/app/api/marketing/leads/route');
    const response = await POST(postRequest({ ...validPayload, consent: false }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ success: false, error: 'invalid_payload' });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('rejects missing consent with invalid_payload', async () => {
    const payload: Partial<typeof validPayload> = { ...validPayload };
    delete payload.consent;

    const { POST } = await import('@/app/api/marketing/leads/route');
    const response = await POST(postRequest(payload));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual({ success: false, error: 'invalid_payload' });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('skips DB writes in degraded mode', async () => {
    vi.stubEnv('SUPABASE_MUTATION_DISABLED', 'true');

    const { POST } = await import('@/app/api/marketing/leads/route');
    const response = await POST(postRequest(validPayload));
    const json = await response.json();

    expect(response.status).toBe(202);
    expect(json).toEqual({
      success: false,
      skipped: true,
      reason: 'marketing_mutation_disabled',
    });
    expect(mocks.query).not.toHaveBeenCalled();
  });

  it('returns internal_error without leaking DB details', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.query.mockRejectedValue(new Error('database host unavailable'));

    const { POST } = await import('@/app/api/marketing/leads/route');
    const response = await POST(postRequest(validPayload));
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ success: false, error: 'internal_error' });
    expect(JSON.stringify(json)).not.toMatch(/database|host|unavailable/i);

    consoleError.mockRestore();
  });
});
