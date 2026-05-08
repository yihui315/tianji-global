import { generateReport } from '@/lib/ai-orchestrator';
import type { ModelProvider, TaskType } from '@/types/ai';
import { normalizeAiText } from '@/lib/ai/normalize';
import { withSafetyInstructions } from '@/lib/ai/safety';
import type { AiUsage } from '@/lib/ai/usage';

export interface GatewayTextRequest {
  prompt: string;
  systemPrompt: string;
  preferredProvider?: ModelProvider;
  taskType?: TaskType;
  maxTokens?: number;
  temperature?: number;
}

export interface GatewayTextResponse {
  content: string;
  usage: AiUsage;
  warnings?: string[];
}

export async function generateGatewayText(request: GatewayTextRequest): Promise<GatewayTextResponse> {
  const started = Date.now();
  const report = await generateReport({
    prompt: request.prompt,
    systemPrompt: withSafetyInstructions(request.systemPrompt),
    preferredProvider: request.preferredProvider,
    taskType: request.taskType ?? 'analysis',
    responseFormat: 'text',
    maxTokens: request.maxTokens,
    temperature: request.temperature,
  });

  return {
    content: normalizeAiText(report.content),
    usage: {
      provider: report.provider,
      model: report.model,
      latencyMs: report.latencyMs ?? Date.now() - started,
      tokensUsed: report.tokensUsed,
      costUSD: report.costUSD,
      warning: report.warnings?.join('; '),
    },
    warnings: report.warnings,
  };
}
