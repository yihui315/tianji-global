// ─── AI Model Types ───────────────────────────────────────────────────────────

export type ModelProvider = 'openai' | 'anthropic' | 'grok' | 'gemini' | 'ollama';

export type TaskType = 'analysis' | 'creative' | 'fast' | 'privacy';

export interface AIProviderConfig {
  provider: ModelProvider;
  apiKey: string;
  baseUrl?: string;
}

export interface ModelEntry {
  id: string;                   // e.g. 'anthropic/claude-3-5-sonnet-latest'
  provider: ModelProvider;
  name: string;                 // Display name
  contextWindow: number;         // Max input + output tokens
  inputCostPer1M: number;        // USD per 1M input tokens
  outputCostPer1M: number;       // USD per 1M output tokens
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
  recommendedFor: TaskType[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  messages: ChatMessage[];
  model: string;
  provider: ModelProvider;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  responseFormat?: 'text' | 'json';
}

export interface AIResponse {
  content: string;
  raw: unknown;
  model: string;
  provider: ModelProvider;
  tokensUsed?: { input: number; output: number };
  costUSD?: number;
  latencyMs: number;
  finishReason?: string;
}

export interface AIError {
  provider: ModelProvider;
  model: string;
  message: string;
  statusCode?: number;
  isRetryable: boolean;
}

// ─── Report Generation ─────────────────────────────────────────────────────────

export interface ReportRequest {
  prompt: string;
  systemPrompt?: string;
  preferredProvider?: ModelProvider;
  preferredModel?: string;
  userId?: string;
  taskType?: TaskType;
  responseFormat?: 'text' | 'json';
  temperature?: number;
  maxTokens?: number;
}

export interface ReportResponse {
  content: string;
  provider: ModelProvider;
  model: string;
  tokensUsed?: { input: number; output: number };
  costUSD?: number;
  latencyMs: number;
  warnings?: string[];
}

// ─── Model Registry ────────────────────────────────────────────────────────────

export const MODEL_REGISTRY: ModelEntry[] = [
  // Anthropic
  {
    id: 'anthropic/claude-3-5-sonnet-latest',
    provider: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    contextWindow: 200000,
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    recommendedFor: ['analysis', 'fast'],
  },
  {
    id: 'anthropic/claude-3-opus-latest',
    provider: 'anthropic',
    name: 'Claude 3.5 Opus',
    contextWindow: 200000,
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    recommendedFor: ['analysis'],
  },
  {
    id: 'anthropic/claude-3-haiku-latest',
    provider: 'anthropic',
    name: 'Claude 3 Haiku',
    contextWindow: 200000,
    inputCostPer1M: 0.8,
    outputCostPer1M: 4.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    recommendedFor: ['fast'],
  },
  // OpenAI
  {
    id: 'openai/gpt-4o',
    provider: 'openai',
    name: 'GPT-4o',
    contextWindow: 128000,
    inputCostPer1M: 5.0,
    outputCostPer1M: 15.0,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    recommendedFor: ['analysis', 'creative'],
  },
  {
    id: 'openai/gpt-4o-mini',
    provider: 'openai',
    name: 'GPT-4o Mini',
    contextWindow: 128000,
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    recommendedFor: ['fast'],
  },
  {
    id: 'openai/gpt-4-turbo',
    provider: 'openai',
    name: 'GPT-4 Turbo',
    contextWindow: 128000,
    inputCostPer1M: 10.0,
    outputCostPer1M: 30.0,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    recommendedFor: ['analysis'],
  },
  // Grok
  {
    id: 'grok/grok-2',
    provider: 'grok',
    name: 'Grok 2',
    contextWindow: 131072,
    inputCostPer1M: 2.0,
    outputCostPer1M: 10.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: true,
    recommendedFor: ['creative', 'analysis'],
  },
  {
    id: 'grok/grok-2-mini',
    provider: 'grok',
    name: 'Grok 2 Mini',
    contextWindow: 131072,
    inputCostPer1M: 0.4,
    outputCostPer1M: 2.0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    recommendedFor: ['fast'],
  },
  // Gemini
  {
    id: 'gemini/gemini-2.0-flash',
    provider: 'gemini',
    name: 'Gemini 2.0 Flash',
    contextWindow: 1048576,
    inputCostPer1M: 0.0,
    outputCostPer1M: 0.0,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    recommendedFor: ['fast', 'creative'],
  },
  {
    id: 'gemini/gemini-1.5-pro',
    provider: 'gemini',
    name: 'Gemini 1.5 Pro',
    contextWindow: 2097152,
    inputCostPer1M: 1.25,
    outputCostPer1M: 5.0,
    supportsStreaming: true,
    supportsFunctionCalling: true,
    supportsVision: true,
    recommendedFor: ['analysis'],
  },
  // Ollama (local)
  {
    id: 'ollama/llama3.3',
    provider: 'ollama',
    name: 'Llama 3.3 (Local)',
    contextWindow: 128000,
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    recommendedFor: ['privacy'],
  },
  {
    id: 'ollama/qwen2.5',
    provider: 'ollama',
    name: 'Qwen 2.5 (Local)',
    contextWindow: 128000,
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    supportsStreaming: true,
    supportsFunctionCalling: false,
    supportsVision: false,
    recommendedFor: ['privacy'],
  },
];

export function getModelEntry(modelId: string): ModelEntry | undefined {
  return MODEL_REGISTRY.find(m => m.id === modelId);
}

export function listModelsByProvider(provider: ModelProvider): ModelEntry[] {
  return MODEL_REGISTRY.filter(m => m.provider === provider);
}

export function listAllModels(): ModelEntry[] {
  return [...MODEL_REGISTRY];
}

export function findModelByName(name: string): ModelEntry | undefined {
  return MODEL_REGISTRY.find(m => m.name === name);
}
