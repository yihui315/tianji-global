/**
 * AI Orchestrator — TianJi Global
 *
 * Unified interface for generating reports using multiple AI providers.
 * Handles:
 * - Provider routing (OpenAI / Anthropic / Grok / Gemini / Ollama)
 * - Automatic fallback (tries next provider if one fails)
 * - Retry logic with exponential backoff
 * - Cost tracking
 * - Task-based model selection
 */

import type {
  AIResponse,
  ReportRequest,
  ReportResponse,
  ModelProvider,
  TaskType,
} from '@/types/ai';
import { getModelEntry, MODEL_REGISTRY } from '@/types/ai';

// ─── Environment Config ────────────────────────────────────────────────────────

function getApiKey(provider: ModelProvider): string | undefined {
  switch (provider) {
    case 'openai':
    case 'packy':
      return process.env.OPENAI_API_KEY;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY;
    case 'grok':
      return process.env.GROK_API_KEY;
    case 'gemini':
      return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    case 'ollama':
      return undefined; // No API key needed for local Ollama
    case 'minimax':
      return process.env.MINIMAX_API_KEY;
  }
}

function getBaseUrl(provider: ModelProvider): string {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    case 'packy':
      return process.env.PACKY_API_ENDPOINT || 'https://www.packyapi.com/v1';
    case 'anthropic':
      return process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
    case 'grok':
      return process.env.GROK_BASE_URL || 'https://api.x.ai/v1';
    case 'gemini':
      return process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
    case 'ollama':
      return process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    case 'minimax':
      return process.env.MINIMAX_BASE_URL || 'https://api.minimax.chat/v1';
  }
}

export function getAvailableProviders(): ModelProvider[] {
  const available: ModelProvider[] = [];
  if (process.env.OPENAI_API_KEY) available.push('openai');
  if (process.env.OPENAI_API_KEY && process.env.PACKY_API_ENDPOINT) available.push('packy');
  if (process.env.ANTHROPIC_API_KEY) available.push('anthropic');
  if (process.env.GROK_API_KEY) available.push('grok');
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) available.push('gemini');
  // Ollama is always "available" (local server)
  available.push('ollama');
  return available;
}

// ─── Model Selection ───────────────────────────────────────────────────────────

const TASK_MODEL_PREFERENCE: Record<TaskType, ModelProvider[]> = {
  analysis: ['anthropic', 'openai', 'gemini'],
  creative: ['openai', 'grok', 'anthropic'],
  fast: ['anthropic', 'openai', 'ollama'],
  privacy: ['ollama'],
};

function selectBestModel(taskType: TaskType, preferredProvider?: ModelProvider): string {
  const available = getAvailableProviders();

  // If preferred provider specified and available, use it
  if (preferredProvider && available.includes(preferredProvider)) {
    const models = MODEL_REGISTRY.filter(m => m.provider === preferredProvider);
    const best = models.find(m => m.recommendedFor.includes(taskType)) || models[0];
    if (best) return best.id;
  }

  // Auto-select: try providers in preference order
  for (const provider of TASK_MODEL_PREFERENCE[taskType]) {
    if (available.includes(provider)) {
      const models = MODEL_REGISTRY.filter(m => m.provider === provider);
      const best = models.find(m => m.recommendedFor.includes(taskType));
      if (best) return best.id;
    }
  }

  // Fallback to first available provider's first model
  const fallbackProvider = available[0] || 'anthropic';
  const fallback = MODEL_REGISTRY.find(m => m.provider === fallbackProvider);
  return fallback?.id || 'anthropic/claude-3-5-sonnet-latest';
}

// ─── Provider Implementations ──────────────────────────────────────────────────

async function callAnthropic(
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; stream?: boolean }
): Promise<AIResponse> {
  const start = Date.now();
  const { temperature = 0.7, maxTokens = 4096, stream = false } = options;

  const body: Record<string, unknown> = {
    model,
    messages: [
      ...(systemPrompt ? [{ role: 'user' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: userPrompt },
    ],
    stream,
    temperature,
    max_tokens: maxTokens,
  };

  if (systemPrompt) {
    body.messages = [
      { role: 'user' as const, content: `${systemPrompt}\n\n${userPrompt}` },
    ];
  } else {
    body.messages = [{ role: 'user' as const, content: userPrompt }];
  }

  const response = await fetch(`${baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt || undefined,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${error}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text?: string }>;
    usage: { input_tokens: number; output_tokens: number };
    stop_reason: string;
  };

  const text = data.content?.[0]?.text || '';
  const modelEntry = getModelEntry(`anthropic/${model}`);

  return {
    content: text,
    raw: data,
    model: `anthropic/${model}`,
    provider: 'anthropic',
    tokensUsed: {
      input: data.usage?.input_tokens || 0,
      output: data.usage?.output_tokens || 0,
    },
    costUSD: modelEntry
      ? ((data.usage?.input_tokens || 0) / 1_000_000) * (modelEntry.inputCostPer1M ?? 0) +
        ((data.usage?.output_tokens || 0) / 1_000_000) * (modelEntry.outputCostPer1M ?? 0)
      : undefined,
    latencyMs: Date.now() - start,
    finishReason: data.stop_reason,
  };
}

async function callOpenAI(
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number; stream?: boolean }
): Promise<AIResponse> {
  const start = Date.now();
  const { temperature = 0.7, maxTokens = 4096 } = options;

  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${error}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
    usage: { prompt_tokens: number; completion_tokens: number };
  };

  const text = data.choices?.[0]?.message?.content || '';
  const modelEntry = getModelEntry(`openai/${model}`);

  return {
    content: text,
    raw: data,
    model: `openai/${model}`,
    provider: 'openai',
    tokensUsed: {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0,
    },
    costUSD: modelEntry
      ? ((data.usage?.prompt_tokens || 0) / 1_000_000) * (modelEntry.inputCostPer1M ?? 0) +
        ((data.usage?.completion_tokens || 0) / 1_000_000) * (modelEntry.outputCostPer1M ?? 0)
      : undefined,
    latencyMs: Date.now() - start,
  };
}

async function callGrok(
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number }
): Promise<AIResponse> {
  // Grok uses OpenAI-compatible API
  return callOpenAI(apiKey, baseUrl, model, systemPrompt, userPrompt, options);
}

async function callGemini(
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number }
): Promise<AIResponse> {
  const start = Date.now();
  const { temperature = 0.7, maxTokens = 4096 } = options;

  // Gemini uses OpenAI-compatible endpoint when GOOGLE_API_KEY is used
  const contents = [{ role: 'user', parts: [{ text: userPrompt }] }];

  const response = await fetch(
    `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${error}`);
  }

  const data = await response.json() as {
    candidates?: Array<{
      content: { parts: Array<{ text: string }> };
      finishReason: string;
    }>;
    usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const modelEntry = getModelEntry(`gemini/${model}`);

  return {
    content: text,
    raw: data,
    model: `gemini/${model}`,
    provider: 'gemini',
    tokensUsed: {
      input: data.usageMetadata?.promptTokenCount || 0,
      output: data.usageMetadata?.candidatesTokenCount || 0,
    },
    costUSD: modelEntry
      ? ((data.usageMetadata?.promptTokenCount || 0) / 1_000_000) * (modelEntry.inputCostPer1M ?? 0) +
        ((data.usageMetadata?.candidatesTokenCount || 0) / 1_000_000) * (modelEntry.outputCostPer1M ?? 0)
      : undefined,
    latencyMs: Date.now() - start,
    finishReason: data.candidates?.[0]?.finishReason,
  };
}

async function callOllama(
  baseUrl: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; maxTokens?: number }
): Promise<AIResponse> {
  const start = Date.now();
  const { temperature = 0.7, maxTokens = 4096 } = options;

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: userPrompt },
      ],
      temperature,
      options: { num_predict: maxTokens },
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama API error ${response.status}: ${error}`);
  }

  const data = await response.json() as {
    message: { content: string };
    total_duration: number;
  };

  return {
    content: data.message?.content || '',
    raw: data,
    model: `ollama/${model}`,
    provider: 'ollama',
    latencyMs: (data.total_duration || Date.now() - start) / 1_000_000,
  };
}

// ─── Retry Logic ───────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw lastError;
}

// ─── Main Orchestrator ─────────────────────────────────────────────────────────

export async function generateReport(
  request: ReportRequest,
  env?: Record<string, string>
): Promise<ReportResponse> {
  const {
    prompt,
    systemPrompt,
    preferredProvider,
    taskType = 'analysis',
    temperature,
    maxTokens,
    responseFormat,
  } = request;

  const resolvedEnv = env || process.env as Record<string, string>;

  // Get API keys from env
  const getKey = (p: ModelProvider) => {
    switch (p) {
      case 'openai':
      case 'packy': return resolvedEnv.OPENAI_API_KEY;
      case 'anthropic': return resolvedEnv.ANTHROPIC_API_KEY;
      case 'grok': return resolvedEnv.GROK_API_KEY;
      case 'gemini': return resolvedEnv.GEMINI_API_KEY || resolvedEnv.GOOGLE_API_KEY;
      case 'ollama': return undefined;
    }
  };

  // Determine which model to use
  const modelId = request.preferredModel || selectBestModel(taskType, preferredProvider);
  const [providerPrefix, modelName] = modelId.split('/') as [ModelProvider, string];

  const apiKey = getKey(providerPrefix);
  const baseUrl = getBaseUrl(providerPrefix);

  // If preferred provider doesn't have API key, fall back
  if (!apiKey && providerPrefix !== 'ollama') {
    const available = getAvailableProviders().filter(p => getKey(p));
    if (available.length === 0) {
      throw new Error('No AI provider API keys configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or configure Ollama.');
    }
    // Use first available provider
    const fallbackProvider = available[0];
    const fallbackModel = MODEL_REGISTRY.find(m => m.provider === fallbackProvider);
    if (!fallbackModel) throw new Error('No models available');

    return generateReport({ ...request, preferredModel: fallbackModel.id }, env);
  }

  const warnings: string[] = [];

  // Call the appropriate provider
  const callProvider = async (): Promise<AIResponse> => {
    return withRetry(async () => {
      switch (providerPrefix) {
        case 'anthropic':
          return callAnthropic(apiKey!, baseUrl, modelName, systemPrompt || '', prompt, {
            temperature,
            maxTokens,
          });
        case 'openai':
        case 'packy':
          return callOpenAI(apiKey!, baseUrl, modelName, systemPrompt || '', prompt, {
            temperature,
            maxTokens,
          });
        case 'grok':
          return callGrok(apiKey!, baseUrl, modelName, systemPrompt || '', prompt, {
            temperature,
            maxTokens,
          });
        case 'gemini':
          return callGemini(apiKey!, baseUrl, modelName, systemPrompt || '', prompt, {
            temperature,
            maxTokens,
          });
        case 'ollama':
          return callOllama(baseUrl, modelName, systemPrompt || '', prompt, {
            temperature,
            maxTokens,
          });
        default:
          throw new Error(`Unknown provider: ${providerPrefix}`);
      }
    }, 3);
  };

  try {
    const result = await callProvider();

    return {
      content: result.content,
      provider: result.provider,
      model: result.model,
      tokensUsed: result.tokensUsed,
      costUSD: result.costUSD,
      latencyMs: result.latencyMs,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    // Try fallback providers
    const available = getAvailableProviders().filter(
      p => p !== providerPrefix && getKey(p)
    );

    for (const fallbackProvider of available) {
      try {
        const fallbackModel = MODEL_REGISTRY.find(
          m => m.provider === fallbackProvider && m.recommendedFor.includes(taskType)
        ) || MODEL_REGISTRY.find(m => m.provider === fallbackProvider);

        if (!fallbackModel) continue;

        warnings.push(`Primary model failed, fell back to ${fallbackModel.name}`);

        const result = await withRetry(async () => {
          const [p, m] = fallbackModel.id.split('/') as [ModelProvider, string];
          const k = getKey(p);
          const u = getBaseUrl(p);

          switch (p) {
            case 'anthropic':
              return callAnthropic(k!, u, m, systemPrompt || '', prompt, { temperature, maxTokens });
            case 'openai':
              return callOpenAI(k!, u, m, systemPrompt || '', prompt, { temperature, maxTokens });
            case 'grok':
              return callGrok(k!, u, m, systemPrompt || '', prompt, { temperature, maxTokens });
            case 'gemini':
              return callGemini(k!, u, m, systemPrompt || '', prompt, { temperature, maxTokens });
            case 'ollama':
              return callOllama(u, m, systemPrompt || '', prompt, { temperature, maxTokens });
          }
        }, 2);

        if (!result) {
          throw new Error('Model fallback returned no result');
        }

        return {
          content: result.content,
          provider: result.provider,
          model: result.model,
          tokensUsed: result.tokensUsed,
          costUSD: result.costUSD,
          latencyMs: result.latencyMs,
          warnings,
        };
      } catch {
        // Try next fallback
      }
    }

    throw error;
  }
}

// ─── Cost Estimation ──────────────────────────────────────────────────────────

export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const entry = getModelEntry(modelId);
  if (!entry) return 0;

  return (
    (inputTokens / 1_000_000) * (entry.inputCostPer1M ?? 0) +
    (outputTokens / 1_000_000) * (entry.outputCostPer1M ?? 0)
  );
}

export function formatCost(costUSD: number): string {
  if (costUSD < 0.001) return '< $0.001';
  if (costUSD < 1) return `$${costUSD.toFixed(4)}`;
  return `$${costUSD.toFixed(2)}`;
}

// ─── Streaming ─────────────────────────────────────────────────────────────────

/**
 * Stream a text generation as a ReadableStream of SSE-formatted strings.
 * Yields "data: {...}\n\n" chunks for client-side consumption.
 */
export async function* streamGenerate(
  request: ReportRequest,
  env?: Record<string, string>
): AsyncGenerator<string, void, unknown> {
  const resolvedEnv = env || process.env as Record<string, string>;

  const getKey = (p: ModelProvider) => {
    switch (p) {
      case 'openai':
      case 'packy': return resolvedEnv.OPENAI_API_KEY;
      case 'anthropic': return resolvedEnv.ANTHROPIC_API_KEY;
      case 'grok': return resolvedEnv.GROK_API_KEY;
      case 'gemini': return resolvedEnv.GEMINI_API_KEY || resolvedEnv.GOOGLE_API_KEY;
      case 'ollama': return undefined;
    }
  };

  const modelId = request.preferredModel || selectBestModel(request.taskType || 'analysis', request.preferredProvider);
  const [providerPrefix, modelName] = modelId.split('/') as [ModelProvider, string];
  const apiKey = getKey(providerPrefix);
  const baseUrl = getBaseUrl(providerPrefix);

  if (!apiKey && providerPrefix !== 'ollama') {
    const available = getAvailableProviders().filter(p => getKey(p));
    if (available.length === 0) {
      yield `data: ${JSON.stringify({ error: 'No AI provider API keys configured' })}\n\n`;
      return;
    }
    const fallback = available[0];
    const fallbackModel = MODEL_REGISTRY.find(m => m.provider === fallback);
    if (!fallbackModel) return;
    yield* streamGenerate({ ...request, preferredModel: fallbackModel.id }, env);
    return;
  }

  if (providerPrefix === 'anthropic') {
    const { temperature = 0.7, maxTokens = 4096 } = request;
    const body: Record<string, unknown> = {
      model: modelName,
      messages: request.systemPrompt
        ? [{ role: 'user', content: `${request.systemPrompt}\n\n${request.prompt}` }]
        : [{ role: 'user', content: request.prompt }],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey!,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      yield `data: ${JSON.stringify({ error: `Anthropic API error ${response.status}: ${error}` })}\n\n`;
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              const text = parsed.delta?.text || '';
              if (text) {
                yield `data: ${JSON.stringify({ text })}\n\n`;
              }
            }
          } catch {
            // skip malformed SSE
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } else if (providerPrefix === 'openai') {
    // OpenAI-compatible streaming
    const { temperature = 0.7, maxTokens = 4096 } = request;
    const body: Record<string, unknown> = {
      model: modelName,
      messages: request.systemPrompt
        ? [{ role: 'system', content: request.systemPrompt }, { role: 'user', content: request.prompt }]
        : [{ role: 'user', content: request.prompt }],
      stream: true,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      yield `data: ${JSON.stringify({ error: `OpenAI API error ${response.status}: ${error}` })}\n\n`;
      return;
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield `data: ${JSON.stringify({ text: content })}\n\n`;
            }
          } catch {
            // skip malformed SSE
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } else {
    // Non-streaming fallback for grok/gemini/ollama
    const result = await generateReport(request, env);
    yield `data: ${JSON.stringify({ text: result.content })}\n\n`;
  }
}
