const baseUrl = normalizeBaseUrl(
  process.env.SMOKE_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000',
);

const checks = [
  {
    name: 'English homepage',
    method: 'GET',
    path: '/en',
    expectedStatus: 200,
  },
  {
    name: 'Chinese pricing page',
    method: 'GET',
    path: '/zh-CN/pricing',
    expectedStatus: 200,
  },
  {
    name: 'Love report demo result',
    method: 'GET',
    path: '/en/love-reading/result/demo',
    expectedStatus: 200,
  },
  {
    name: 'Checkout rejects invalid payload or disabled paid unlock',
    method: 'POST',
    path: '/api/checkout',
    expectedStatus: [400, 403],
    body: { productId: 'invalid-smoke-product' },
  },
];

let failed = false;

for (const check of checks) {
  const url = new URL(check.path, baseUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(url, {
      method: check.method,
      headers: check.body ? { 'content-type': 'application/json' } : undefined,
      body: check.body ? JSON.stringify(check.body) : undefined,
      redirect: 'manual',
      signal: controller.signal,
    });

    const expectedStatuses = Array.isArray(check.expectedStatus)
      ? check.expectedStatus
      : [check.expectedStatus];
    const ok = expectedStatuses.includes(response.status);
    console.log(
      `${ok ? 'PASS' : 'FAIL'} ${check.name}: ${response.status} ${url}`,
    );

    if (!ok) failed = true;
  } catch (error) {
    failed = true;
    console.error(`FAIL ${check.name}: ${url} ${formatError(error)}`);
  } finally {
    clearTimeout(timeout);
  }
}

if (failed) {
  process.exitCode = 1;
}

function normalizeBaseUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'http://localhost:3000';
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

function formatError(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}
