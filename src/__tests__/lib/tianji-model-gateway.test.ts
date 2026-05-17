import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildTianjiModelAuditEvent,
  generateTianjiModelResponse,
  getMiniMaxQuotaGate,
  getTianjiModelRoute,
  rewriteDeterministicPrediction,
} from '@/lib/tianji-model-gateway';

describe('TianJi Love model gateway routing', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('routes public free and paid surfaces to the intended model tiers', () => {
    expect(getTianjiModelRoute('love-preview')).toMatchObject({
      provider: 'ollama',
      model: 'gemma4:31b',
      preferredModel: 'ollama/gemma4:31b',
      publicUserFacing: true,
      safetyRewriteRequired: true,
    });

    expect(getTianjiModelRoute('ask-unlock')).toMatchObject({
      provider: 'deepseek',
      model: 'deepseek-v4-flash',
      preferredModel: 'deepseek/deepseek-v4-flash',
      publicUserFacing: true,
      safetyRewriteRequired: true,
    });

    expect(getTianjiModelRoute('support-faq')).toMatchObject({
      provider: 'ollama',
      model: 'gpt-oss:20b',
      preferredModel: 'ollama/gpt-oss:20b',
      publicUserFacing: true,
      safetyRewriteRequired: true,
    });
  });

  it('keeps MiniMax reserved for internal work behind a quota gate', () => {
    const route = getTianjiModelRoute('internal-research');

    expect(route).toMatchObject({
      provider: 'minimax',
      model: 'MiniMax-M2.7',
      preferredModel: 'minimax/MiniMax-M2.7',
      publicUserFacing: false,
      safetyRewriteRequired: false,
      quotaGate: {
        provider: 'minimax',
        envKey: 'MINIMAX_TOKEN_PLAN_KEY',
        minimumRemainingRatio: 0.2,
      },
    });
  });

  it('rewrites deterministic relationship predictions before public output', () => {
    const rewritten = rewriteDeterministicPrediction(
      'You will definitely marry this person. This outcome is guaranteed and destined to happen.'
    );

    expect(rewritten).not.toMatch(/will definitely|guaranteed|destined to happen/i);
    expect(rewritten).toContain('may');
    expect(rewritten).toContain('self-reflection');
  });

  it('generates through the selected route and records non-sensitive audit metadata', async () => {
    const calls: Array<{ preferredModel?: string; preferredProvider?: string }> = [];

    const response = await generateTianjiModelResponse(
      {
        intent: 'ask-unlock',
        prompt: 'Will this relationship last?',
        systemPrompt: 'Answer safely.',
      },
      async (request) => {
        calls.push({
          preferredModel: request.preferredModel,
          preferredProvider: request.preferredProvider,
        });

        return {
          content: 'This outcome is guaranteed.',
          provider: 'deepseek',
          model: 'deepseek/deepseek-v4-flash',
          tokensUsed: { input: 12, output: 8 },
          costUSD: 0.0001,
          latencyMs: 25,
        };
      }
    );

    expect(calls).toEqual([
      {
        preferredModel: 'deepseek/deepseek-v4-flash',
        preferredProvider: 'deepseek',
      },
    ]);
    expect(response.content).not.toMatch(/guaranteed/i);
    expect(response.audit).toEqual({
      intent: 'ask-unlock',
      provider: 'deepseek',
      model: 'deepseek/deepseek-v4-flash',
      fallback: false,
      publicUserFacing: true,
      safetyRewriteApplied: true,
      tokensUsed: { input: 12, output: 8 },
      costUSD: 0.0001,
      latencyMs: 25,
      error: undefined,
    });
  });

  it('returns safe disabled content without calling providers when live providers are disabled', async () => {
    vi.stubEnv('AI_PROVIDER_LIVE_DISABLED', 'true');
    const generate = vi.fn();

    const response = await generateTianjiModelResponse(
      {
        intent: 'ask-unlock',
        prompt: 'raw question should not be returned',
        systemPrompt: 'raw prompt should not be returned',
      },
      generate
    );

    expect(generate).not.toHaveBeenCalled();
    expect(response.content).toContain('AI provider live calls are disabled');
    expect(response.warnings).toEqual(['ai_provider_live_disabled']);
    expect(response.audit).toMatchObject({
      intent: 'ask-unlock',
      provider: 'deepseek',
      model: 'deepseek/deepseek-v4-flash',
      fallback: false,
      publicUserFacing: true,
      safetyRewriteApplied: false,
      costUSD: 0,
      latencyMs: 0,
      error: 'ai_provider_live_disabled',
    });
    expect(JSON.stringify(response)).not.toMatch(/raw question|raw prompt|API_KEY|birthDate|birthTime|birthLocation|timezone/i);
  });

  it('tries configured fallback models when the primary route fails', async () => {
    const calls: Array<{ preferredModel?: string; preferredProvider?: string }> = [];

    const response = await generateTianjiModelResponse(
      {
        intent: 'ask-unlock',
        prompt: 'Should I send the message?',
        systemPrompt: 'Answer safely.',
      },
      async (request) => {
        calls.push({
          preferredModel: request.preferredModel,
          preferredProvider: request.preferredProvider,
        });

        if (request.preferredModel !== 'ollama/gemma4:31b') {
          throw new Error(`unavailable: ${request.preferredModel}`);
        }

        return {
          content: 'You will definitely find the right timing.',
          provider: 'ollama',
          model: 'ollama/gemma4:31b',
          tokensUsed: { input: 18, output: 12 },
          latencyMs: 40,
        };
      }
    );

    expect(calls).toEqual([
      {
        preferredModel: 'deepseek/deepseek-v4-flash',
        preferredProvider: 'deepseek',
      },
      {
        preferredModel: 'deepseek/deepseek-v4-pro',
        preferredProvider: 'deepseek',
      },
      {
        preferredModel: 'ollama/gemma4:31b',
        preferredProvider: 'ollama',
      },
    ]);
    expect(response.content).not.toMatch(/will definitely/i);
    expect(response.audit).toMatchObject({
      intent: 'ask-unlock',
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      fallback: true,
      publicUserFacing: true,
      safetyRewriteApplied: true,
    });
  });

  it('builds quota checks without exposing token plan secrets', () => {
    expect(getMiniMaxQuotaGate({})).toEqual({
      enabled: false,
      reason: 'missing-token-plan-key',
      endpoint: 'https://www.minimax.io/v1/token_plan/remains',
      tokenPlanKeyPresent: false,
    });

    expect(getMiniMaxQuotaGate({ MINIMAX_TOKEN_PLAN_KEY: 'secret-token-plan-key' })).toEqual({
      enabled: true,
      reason: undefined,
      endpoint: 'https://www.minimax.io/v1/token_plan/remains',
      tokenPlanKeyPresent: true,
    });
  });
});

describe('TianJi Love model gateway audit events', () => {
  it('does not persist prompts or generated content in audit events', () => {
    const route = getTianjiModelRoute('love-preview');

    const audit = buildTianjiModelAuditEvent(route, {
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      content: 'private reading content',
      tokensUsed: { input: 10, output: 20 },
      latencyMs: 42,
    });

    expect(audit).toEqual({
      intent: 'love-preview',
      provider: 'ollama',
      model: 'ollama/gemma4:31b',
      fallback: false,
      publicUserFacing: true,
      safetyRewriteApplied: false,
      tokensUsed: { input: 10, output: 20 },
      costUSD: undefined,
      latencyMs: 42,
      error: undefined,
    });
    expect(JSON.stringify(audit)).not.toContain('private reading content');
  });
});
