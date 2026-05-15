import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateReport } from '@/lib/ai-orchestrator';

async function expectToSettle<T>(promise: Promise<T>, timeoutMs = 250): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Operation did not settle within ${timeoutMs}ms`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

describe('AI orchestrator Ollama fallback', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('uses an installed Ollama model instead of a stale registry default', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('PACKY_API_ENDPOINT', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('GROK_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('GOOGLE_API_KEY', '');
    vi.stubEnv('OLLAMA_MODEL', '');

    let chatModel = '';
    const fetchMock = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);

      if (href.endsWith('/api/tags')) {
        return new Response(
          JSON.stringify({ models: [{ name: 'gemma4:latest' }] }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }

      if (href.endsWith('/api/chat')) {
        const body = JSON.parse(String(init?.body ?? '{}')) as { model?: string };
        chatModel = body.model ?? '';

        return new Response(
          JSON.stringify({
            message: { content: 'A non-empty local AI report.' },
            total_duration: 1_000_000,
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }

      return new Response('not found', { status: 404 });
    });

    vi.stubGlobal('fetch', fetchMock);

    const report = await generateReport({
      prompt: 'Should this product launch?',
      systemPrompt: 'Return a concise report.',
      preferredProvider: 'packy',
      taskType: 'analysis',
      responseFormat: 'text',
      maxTokens: 120,
    });

    expect(chatModel).toBe('gemma4:latest');
    expect(report.provider).toBe('ollama');
    expect(report.model).toBe('ollama/gemma4:latest');
    expect(report.content).toContain('non-empty local AI report');
  });

  it('does not hang when the Ollama tags probe stalls', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('PACKY_API_ENDPOINT', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('GROK_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('GOOGLE_API_KEY', '');
    vi.stubEnv('OLLAMA_MODEL', '');
    vi.stubEnv('OLLAMA_TIMEOUT_MS', '5');

    let chatModel = '';
    const fetchMock = vi.fn((url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);

      if (href.endsWith('/api/tags')) {
        return new Promise<Response>(() => {});
      }

      if (href.endsWith('/api/chat')) {
        const body = JSON.parse(String(init?.body ?? '{}')) as { model?: string };
        chatModel = body.model ?? '';

        return Promise.resolve(new Response(
          JSON.stringify({
            message: { content: 'A local report after the tags timeout.' },
            total_duration: 1_000_000,
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        ));
      }

      return Promise.resolve(new Response('not found', { status: 404 }));
    });

    vi.stubGlobal('fetch', fetchMock);

    const report = await expectToSettle(generateReport({
      prompt: 'Should this product launch?',
      systemPrompt: 'Return a concise report.',
      preferredProvider: 'packy',
      taskType: 'analysis',
      responseFormat: 'text',
      maxTokens: 120,
    }));

    expect(chatModel).toBeTruthy();
    expect(report.provider).toBe('ollama');
    expect(report.content).toContain('after the tags timeout');
  });
});
