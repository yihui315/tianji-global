const baseUrl = normalizeBaseUrl(process.argv[2] ?? 'http://127.0.0.1:3057');

function normalizeBaseUrl(value) {
  if (/^\d+$/.test(value)) {
    return `http://127.0.0.1:${value}`;
  }
  return value.replace(/\/$/, '');
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function fetchWithTimeout(url, init = {}, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function postPreview(path, body) {
  const response = await fetchWithTimeout(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

  assert(response.status === 200, `${path} returned HTTP ${response.status}`);
  const json = await response.json();
  assert(json.success === true, `${path} did not return success=true`);
  assert(typeof json.id === 'string' && json.id.length > 10, `${path} did not return an unlock id`);
  assert(typeof json.preview === 'string' && json.preview.length > 20, `${path} did not return preview text`);
  return json;
}

async function checkAuthRedirect(path) {
  const response = await fetchWithTimeout(`${baseUrl}${path}`, { redirect: 'manual' }, 10_000);
  assert(response.status >= 300 && response.status < 400, `${path} returned HTTP ${response.status}, expected redirect`);

  const location = response.headers.get('location');
  assert(location, `${path} redirect did not include Location header`);

  const redirectUrl = new URL(location, baseUrl);
  assert(
    redirectUrl.origin === baseUrl,
    `${path} redirected to ${redirectUrl.origin}, expected ${baseUrl}`,
  );
  assert(redirectUrl.pathname === '/login', `${path} redirected to ${redirectUrl.pathname}, expected /login`);
}

await postPreview('/api/ask/preview', {
  question: 'Should TianJi launch today?',
  language: 'en',
});
await postPreview('/api/draw/preview', {
  question: 'What should TianJi focus on today?',
  language: 'en',
});
await checkAuthRedirect('/dashboard');
await checkAuthRedirect('/profile');

console.log(`smoke-ask-draw-auth: OK ${baseUrl}`);
