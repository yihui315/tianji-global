/**
 * AI Types — TianJi Global
 * Shared type definitions for AI orchestration
 */

// ─── Provider & Model Types ──────────────────────────────────────────────────

export type ModelProvider = 'openai' | 'anthropic' | 'grok' | 'gemini' | 'ollama' | 'minimax' | 'packy';

export type TaskType = 'analysis' | 'creative' | 'fast' | 'privacy';

export interface ModelEntry {
  id: string;
  name?: string;
  provider: ModelProvider;
  contextLength: number;
  costPer1kInput?: number;
  costPer1kOutput?: number;
  inputCostPer1M?: number;
  outputCostPer1M?: number;
  recommendedFor: TaskType[];
}

export interface AIModelInfo {
  id: string;
  provider: ModelProvider;
  name: string;
  contextLength: number;
  updatedAt: string;
}

// ─── Request / Response ───────────────────────────────────────────────────────

export interface ReportRequest {
  taskType?: TaskType;
  prompt: string;
  systemPrompt?: string;
  preferredProvider?: ModelProvider;
  preferredModel?: string;
  modelOverride?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: string;
}

export interface ReportResponse {
  content: string;
  provider: ModelProvider;
  model: string;
  tokensUsed?: { input: number; output: number };
  cost?: { input: number; output: number; total: number };
  durationMs?: number;
  latencyMs?: number;
  costUSD?: number;
  warnings?: string[];
}

export interface AIResponse {
  content: string;
  provider: ModelProvider;
  model: string;
  tokensUsed?: { input: number; output: number };
  cost?: { input: number; output: number; total: number };
  durationMs?: number;
  latencyMs?: number;
  costUSD?: number;
  raw?: unknown;
  finishReason?: string;
  error?: string;
  cached?: boolean;
}

// ─── Cost Tracking ───────────────────────────────────────────────────────────

export interface CostEntry {
  provider: ModelProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  timestamp: Date;
}

// ─── Model Registry ──────────────────────────────────────────────────────────

export const MODEL_REGISTRY: ModelEntry[] = [
  // Anthropic
  {
    id: 'anthropic/claude-opus-4-6',
    provider: 'anthropic',
    contextLength: 200000,
    costPer1kInput: 0.015,
    costPer1kOutput: 0.075,
    recommendedFor: ['analysis', 'creative'],
  },
  {
    id: 'anthropic/claude-sonnet-4',
    provider: 'anthropic',
    contextLength: 200000,
    costPer1kInput: 0.003,
    costPer1kOutput: 0.015,
    recommendedFor: ['analysis', 'fast'],
  },
  // OpenAI
  {
    id: 'openai/gpt-4o',
    provider: 'openai',
    contextLength: 128000,
    costPer1kInput: 0.005,
    costPer1kOutput: 0.015,
    recommendedFor: ['analysis', 'creative'],
  },
  {
    id: 'openai/gpt-4o-mini',
    provider: 'openai',
    contextLength: 128000,
    costPer1kInput: 0.00015,
    costPer1kOutput: 0.0006,
    recommendedFor: ['fast'],
  },
  // Grok
  {
    id: 'grok/grok-2',
    provider: 'grok',
    contextLength: 131072,
    recommendedFor: ['creative'],
  },
  // Gemini
  {
    id: 'gemini/gemini-1.5-pro',
    provider: 'gemini',
    contextLength: 2000000,
    costPer1kInput: 0.00125,
    costPer1kOutput: 0.005,
    recommendedFor: ['analysis'],
  },
  {
    id: 'gemini/gemini-1.5-flash',
    provider: 'gemini',
    contextLength: 1000000,
    costPer1kInput: 0.000075,
    costPer1kOutput: 0.0003,
    recommendedFor: ['fast'],
  },
  // Ollama (local)
  {
    id: 'ollama/llama3.3',
    provider: 'ollama',
    contextLength: 128000,
    recommendedFor: ['privacy'],
  },
  {
    id: 'ollama/qwen2.5',
    provider: 'ollama',
    contextLength: 128000,
    recommendedFor: ['privacy'],
  },
  // MiniMax
  {
    id: 'minimax/minimax-01',
    provider: 'minimax',
    contextLength: 1000000,
    costPer1kInput: 0.001,
    costPer1kOutput: 0.005,
    recommendedFor: ['fast', 'analysis'],
  },
  // Packy (OpenAI-compatible, via www.packyapi.com)
  {
    id: 'packy/qwen3.6-plus',
    provider: 'packy',
    contextLength: 32000,
    recommendedFor: ['analysis', 'creative'],
  },
  {
    id: 'packy/qwen3.5-plus',
    provider: 'packy',
    contextLength: 32000,
    recommendedFor: ['fast', 'analysis'],
  },
  {
    id: 'packy/MiniMax-M2.7',
    provider: 'packy',
    contextLength: 100000,
    recommendedFor: ['fast', 'analysis'],
  },
];

export function getModelEntry(modelId: string): ModelEntry | undefined {
  return MODEL_REGISTRY.find((m) => m.id === modelId);
}
