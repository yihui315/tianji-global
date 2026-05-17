type Status = 'go' | 'no-go' | 'unknown';
type OverallStatus = 'go' | 'conditional-go' | 'no-go';

export type StagingNonPaidSmokeResult = {
  home: Status;
  askPage: Status;
  drawPage: Status;
  pricingPage: Status;
  loginPage: Status;
  relationshipNonPaid: Status;
  askPreviewNonPaid: Status;
  drawPreviewNonPaid: Status;
  checks: SmokeCheck[];
  overall: OverallStatus;
};

type EnvLike = Record<string, string | undefined>;
type FetchLike = typeof fetch;
type SafeAiMeta = {
  provider?: string;
  model?: string;
  fallbackUsed?: boolean;
  safetyRewritten?: boolean;
  latencyMs?: number;
  route?: string;
};
type SmokeCheck = {
  route: string;
  method: 'GET' | 'POST';
  status: Status;
  passed: boolean;
  aiMeta?: SafeAiMeta;
};

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

function safeAiMeta(value: unknown): SafeAiMeta | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const source = value as Record<string, unknown>;
  const aiMeta = source.aiMeta && typeof source.aiMeta === 'object'
    ? source.aiMeta as Record<string, unknown>
    : source.data && typeof source.data === 'object' && (source.data as Record<string, unknown>).aiMeta &&
        typeof (source.data as Record<string, unknown>).aiMeta === 'object'
      ? (source.data as Record<string, unknown>).aiMeta as Record<string, unknown>
      : undefined;

  if (!aiMeta) return undefined;

  return {
    provider: typeof aiMeta.provider === 'string' ? aiMeta.provider : undefined,
    model: typeof aiMeta.model === 'string' ? aiMeta.model : undefined,
    fallbackUsed: typeof aiMeta.fallbackUsed === 'boolean' ? aiMeta.fallbackUsed : undefined,
    safetyRewritten: typeof aiMeta.safetyRewritten === 'boolean' ? aiMeta.safetyRewritten : undefined,
    latencyMs: typeof aiMeta.latencyMs === 'number' ? aiMeta.latencyMs : undefined,
    route: typeof aiMeta.route === 'string' ? aiMeta.route : undefined,
  };
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

async function postCheck(fetchFn: FetchLike, baseUrl: string, path: string, body: unknown, limitMs: number): Promise<SmokeCheck> {
  try {
    const response = await requestWithTimeout(fetchFn, `${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }, limitMs);
    const status = statusFromResponse(response);
    let aiMeta: SafeAiMeta | undefined;
    try {
      aiMeta = safeAiMeta(await response.json());
    } catch {
      aiMeta = undefined;
    }

    return { route: path, method: 'POST', status, passed: status === 'go', aiMeta };
  } catch {
    return { route: path, method: 'POST', status: 'unknown', passed: false };
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
      loginPage: 'unknown',
      relationshipNonPaid: 'unknown',
      askPreviewNonPaid: 'unknown',
      drawPreviewNonPaid: 'unknown',
      checks: [],
      overall: 'conditional-go',
    };
  }

  const lang = locale(env);
  const limitMs = timeoutMs(env);
  const home = await getStatus(fetchFn, baseUrl, '/', limitMs);
  const askPage = await getStatus(fetchFn, baseUrl, '/ask', limitMs);
  const drawPage = await getStatus(fetchFn, baseUrl, '/draw', limitMs);
  const pricingPage = await getStatus(fetchFn, baseUrl, '/pricing', limitMs);
  const loginPage = await getStatus(fetchFn, baseUrl, '/login', limitMs);
  const relationshipCheck = await postCheck(fetchFn, baseUrl, '/api/relationship/analyze', {
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
  const askPreviewCheck = await postCheck(fetchFn, baseUrl, '/api/ask/preview', {
    language: lang,
    question: 'Staging non-paid Ask preview smoke.',
  }, limitMs);
  const drawPreviewCheck = await postCheck(fetchFn, baseUrl, '/api/draw/preview', {
    language: lang,
    question: 'Staging non-paid Draw preview smoke.',
  }, limitMs);
  const checks: SmokeCheck[] = [
    { route: '/', method: 'GET', status: home, passed: home === 'go' },
    { route: '/ask', method: 'GET', status: askPage, passed: askPage === 'go' },
    { route: '/draw', method: 'GET', status: drawPage, passed: drawPage === 'go' },
    { route: '/pricing', method: 'GET', status: pricingPage, passed: pricingPage === 'go' },
    { route: '/login', method: 'GET', status: loginPage, passed: loginPage === 'go' },
    relationshipCheck,
    askPreviewCheck,
    drawPreviewCheck,
  ];
  const statuses = [
    home,
    askPage,
    drawPage,
    pricingPage,
    loginPage,
    relationshipCheck.status,
    askPreviewCheck.status,
    drawPreviewCheck.status,
  ];

  return {
    home,
    askPage,
    drawPage,
    pricingPage,
    loginPage,
    relationshipNonPaid: relationshipCheck.status,
    askPreviewNonPaid: askPreviewCheck.status,
    drawPreviewNonPaid: drawPreviewCheck.status,
    checks,
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
