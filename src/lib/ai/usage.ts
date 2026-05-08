import type { ModelProvider } from '@/types/ai';
import type { DrawnSlot, QuickDrawLanguage } from '@/lib/quick-draw';
import type { AskQuestionLanguage } from '@/lib/ask-question';

type PreviewKind = 'ask' | 'draw';

export interface AiUsage {
  provider: ModelProvider | 'local-fallback';
  model: string;
  latencyMs?: number;
  tokensUsed?: { input: number; output: number };
  costUSD?: number;
  warning?: string;
}

export interface AskPreviewRecord {
  kind: 'ask';
  question: string;
  language: AskQuestionLanguage;
  preview: string;
  fullAnswer: string;
  usage: AiUsage;
  createdAt: string;
  expiresAt: string;
}

export interface DrawPreviewRecord {
  kind: 'draw';
  question: string;
  language: QuickDrawLanguage;
  preview: string;
  draw: DrawnSlot[];
  fullReading: string;
  usage: AiUsage;
  createdAt: string;
  expiresAt: string;
}

export type PreviewRecord = AskPreviewRecord | DrawPreviewRecord;
type NewPreviewRecord =
  | Omit<AskPreviewRecord, 'createdAt' | 'expiresAt'>
  | Omit<DrawPreviewRecord, 'createdAt' | 'expiresAt'>;

interface AiGatewayStore {
  previews: Map<string, PreviewRecord>;
  usage: Array<{ id: string; kind: PreviewKind; usage: AiUsage; createdAt: string }>;
}

declare global {
  // eslint-disable-next-line no-var
  var __tianjiAiGatewayStore: AiGatewayStore | undefined;
}

const PREVIEW_TTL_MS = 2 * 60 * 60 * 1000;
const MAX_RECORDS = 1000;

function getStore(): AiGatewayStore {
  if (!globalThis.__tianjiAiGatewayStore) {
    globalThis.__tianjiAiGatewayStore = {
      previews: new Map(),
      usage: [],
    };
  }
  return globalThis.__tianjiAiGatewayStore;
}

function createOpaqueId(): string {
  return globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 24);
}

function pruneExpired(now = Date.now()) {
  const store = getStore();
  for (const [id, record] of store.previews.entries()) {
    if (Date.parse(record.expiresAt) <= now) {
      store.previews.delete(id);
    }
  }

  while (store.previews.size > MAX_RECORDS) {
    const oldest = store.previews.keys().next().value;
    if (!oldest) break;
    store.previews.delete(oldest);
  }

  if (store.usage.length > MAX_RECORDS) {
    store.usage.splice(0, store.usage.length - MAX_RECORDS);
  }
}

export function createPreviewRecord(record: NewPreviewRecord): string {
  pruneExpired();

  const now = new Date();
  const id = createOpaqueId();
  const fullRecord: PreviewRecord = {
    ...record,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + PREVIEW_TTL_MS).toISOString(),
  } as PreviewRecord;

  const store = getStore();
  store.previews.set(id, fullRecord);
  store.usage.push({
    id,
    kind: record.kind,
    usage: record.usage,
    createdAt: fullRecord.createdAt,
  });

  return id;
}

export function getPreviewRecord(id: string): PreviewRecord | null {
  pruneExpired();
  return getStore().previews.get(id) ?? null;
}

export function getUsageEvents() {
  pruneExpired();
  return [...getStore().usage];
}

export function clearPreviewRecordsForTests() {
  const store = getStore();
  store.previews.clear();
  store.usage.length = 0;
}
