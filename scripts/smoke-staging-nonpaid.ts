type Status = 'go' | 'no-go' | 'unknown';
type OverallStatus = 'go' | 'conditional-go' | 'no-go';

export type StagingNonPaidSmokeResult = {
  home: Status;
  askPage: Status;
  drawPage: Status;
  pricingPage: Status;
  relationshipNonPaid: Status;
  askPreviewNonPaid: Status;
  drawPreviewNonPaid: Status;
  overall: OverallStatus;
};

type EnvLike = Record<string, string | undefined>;
type FetchLike = typeof fetch;

function normalizeBaseUrl(raw: string | undefined) {
  if (!raw) return undefined;
  return raw.replace(/\/+$/, '');
}

function timeoutMs(env: EnvLike) {
  const parsed = Number.parseInt(env.SMOKE_TIMEOUT_MS || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15_000;
}

function locale(env: EnvLike) {
  return env.SMOKE_LOCALE || 'en';
}

function statusFromResponse(response: Response) {
  if (response.status >= 200 && response.status < 400) return 'go';
  if (response.status === 404 || response.status >= 500) return 'no-go';
  return 'unknown';
}

function overallFor(statuses: Status[]): OverallStatus {
  if (statuses.includes('no-go')) return 'no-go';
  if (statuses.includes('unknown')) return 'conditional-go';
  return 'go';
}

async function requestWithTimeout(fetchFn: FetchLike, url: string, init: RequestInit, limitMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), limitMs);
  try {
    return await fetchFn(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function getStatus(fetchFn: FetchLike, baseUrl: string, path: string, limitMs: number): Promise<Status> {
  try {
    const response = await requestWithTimeout(fetchFn, `${baseUrl}${path}`, { method: 'GET' }, limitMs);
    return statusFromResponse(response);
  } catch {
    return 'unknown';
  }
}

async function postStatus(fetchFn: FetchLike, baseUrl: string, path: string, body: unknown, limitMs: number): Promise<Status> {
  try {
    const response = await requestWithTimeout(fetchFn, `${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }, limitMs);
    return statusFromResponse(response);
  } catch {
    return 'unknown';
  }
}

export async function runStagingNonPaidSmoke(
  env: EnvLike = process.env,
  fetchFn: FetchLike = fetch,
): Promise<StagingNonPaidSmokeResult> {
  const baseUrl = normalizeBaseUrl(env.STAGING_BASE_URL);
  if (!baseUrl) {
    return {
      home: 'unknown',
      askPage: 'unknown',
      drawPage: 'unknown',
      pricingPage: 'unknown',
      relationshipNonPaid: 'unknown',
      askPreviewNonPaid: 'unknown',
      drawPreviewNonPaid: 'unknown',
      overall: 'conditional-go',
    };
  }

  const lang = locale(env);
  const limitMs = timeoutMs(env);
  const home = await getStatus(fetchFn, baseUrl, '/', limitMs);
  const askPage = await getStatus(fetchFn, baseUrl, '/ask', limitMs);
  const drawPage = await getStatus(fetchFn, baseUrl, '/draw', limitMs);
  const pricingPage = await getStatus(fetchFn, baseUrl, '/pricing', limitMs);
  const relationshipNonPaid = await postStatus(fetchFn, baseUrl, '/api/relationship/analyze', {
    relationType: 'romantic',
    lang,
    premium: false,
    personA: {
      nickname: 'SmokeA',
      birthDate: '2000-01-01',
    },
    personB: {
      nickname: 'SmokeB',
      birthDate: '2001-02-03',
    },
  }, limitMs);
  const askPreviewNonPaid = await postStatus(fetchFn, baseUrl, '/api/ask/preview', {
    language: lang,
    question: 'Staging non-paid Ask preview smoke.',
  }, limitMs);
  const drawPreviewNonPaid = await postStatus(fetchFn, baseUrl, '/api/draw/preview', {
    language: lang,
    question: 'Staging non-paid Draw preview smoke.',
  }, limitMs);
  const statuses = [
    home,
    askPage,
    drawPage,
    pricingPage,
    relationshipNonPaid,
    askPreviewNonPaid,
    drawPreviewNonPaid,
  ];

  return {
    home,
    askPage,
    drawPage,
    pricingPage,
    relationshipNonPaid,
    askPreviewNonPaid,
    drawPreviewNonPaid,
    overall: overallFor(statuses),
  };
}

async function main() {
  const result = await runStagingNonPaidSmoke();
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  void main();
}
