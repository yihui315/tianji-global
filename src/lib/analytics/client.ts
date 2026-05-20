export interface ClientAnalyticsEvent {
  event: string;
  experimentId?: string;
  variant?: string;
  moduleType?: string;
  trafficSource?: string;
  strategy?: string;
  payload?: Record<string, string | number | boolean | null | undefined>;
}

const SENSITIVE_PAYLOAD_KEYS = new Set([
  'answer',
  'airesponse',
  'birthdate',
  'birthtime',
  'birthlocation',
  'birthplace',
  'fullanswer',
  'fullreading',
  'fullreport',
  'fullresult',
  'modeloutput',
  'modelresponse',
  'prompt',
  'provideroutput',
  'providerresponse',
  'providerraw',
  'question',
  'rawproviderresponse',
  'rawquestion',
  'rawresponse',
  'rawresult',
  'readingtext',
  'response',
  'resulttext',
  'timezone',
]);

function normalizePayloadKey(key: string) {
  return key.replace(/[\s_-]/g, '').toLowerCase();
}

export function sanitizeClientAnalyticsPayload(
  payload: ClientAnalyticsEvent['payload'] = {},
): NonNullable<ClientAnalyticsEvent['payload']> {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !SENSITIVE_PAYLOAD_KEYS.has(normalizePayloadKey(key))),
  );
}

export async function trackClientEvent(input: ClientAnalyticsEvent) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...input,
        payload: sanitizeClientAnalyticsPayload(input.payload),
      }),
      keepalive: true,
    });
  } catch (error) {
    console.warn('[analytics/client] tracking failed', error);
  }
}
