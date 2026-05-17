#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse as parseQuery } from 'node:querystring';

const HOST = '127.0.0.1';
const START_PORT = Number(process.env.PHASE5B_LOCAL_PORT || 5055);
const MAX_PORT = START_PORT + 10;
const RESULT_PATH = resolve(process.cwd(), '.ai/TIANJI_LOVE_PHASE5B_LOCAL_RUN_RESULT_20260517.json');

const fieldGroups = [
  {
    title: 'App / Auth',
    fields: ['NEXT_PUBLIC_APP_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'],
  },
  {
    title: 'Supabase staging',
    fields: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  },
  {
    title: 'Stripe test mode',
    fields: [
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_PRO_MONTHLY_PRICE_ID',
      'STRIPE_PRO_YEARLY_PRICE_ID',
      'STRIPE_ASK_PRICE_ID',
      'STRIPE_DRAW_PRICE_ID',
    ],
  },
  {
    title: 'Email',
    fields: ['RESEND_API_KEY', 'EMAIL_FROM'],
  },
  {
    title: 'AI runtime',
    fields: [
      'AI_RUNTIME_MODE',
      'AI_FREE_PREVIEW_PROVIDER',
      'AI_FREE_PREVIEW_MODEL',
      'AI_ROUTER_PROVIDER',
      'AI_ROUTER_MODEL',
      'AI_PAID_ASK_PROVIDER',
      'AI_PAID_ASK_MODEL',
      'AI_PAID_ASK_FALLBACK_MODEL',
      'AI_INTERNAL_AGENT_PROVIDER',
      'AI_ENABLE_SAFETY_REWRITE',
      'AI_ENABLE_COST_LOGGING',
      'AI_ENABLE_FALLBACK_LOGGING',
    ],
  },
  {
    title: 'Ollama / DeepSeek / MiniMax',
    fields: [
      'OLLAMA_BASE_URL',
      'DEEPSEEK_API_KEY',
      'DEEPSEEK_BASE_URL',
      'DEEPSEEK_MODEL_FLASH',
      'DEEPSEEK_MODEL_PRO',
      'MINIMAX_API_KEY',
      'MINIMAX_BASE_URL',
      'MINIMAX_MODEL',
      'MINIMAX_TOKEN_PLAN_KEY',
    ],
  },
  {
    title: 'Staging smoke',
    fields: ['STAGING_BASE_URL', 'SMOKE_LOCALE', 'SMOKE_TIMEOUT_MS'],
  },
];

const defaults = {
  AI_RUNTIME_MODE: 'hybrid',
  AI_FREE_PREVIEW_PROVIDER: 'ollama',
  AI_FREE_PREVIEW_MODEL: 'gemma4:31b',
  AI_ROUTER_PROVIDER: 'ollama',
  AI_ROUTER_MODEL: 'gpt-oss:20b',
  AI_PAID_ASK_PROVIDER: 'deepseek',
  AI_PAID_ASK_MODEL: 'deepseek-v4-flash',
  AI_PAID_ASK_FALLBACK_MODEL: 'deepseek-v4-pro',
  AI_INTERNAL_AGENT_PROVIDER: 'minimax',
  AI_ENABLE_SAFETY_REWRITE: 'true',
  AI_ENABLE_COST_LOGGING: 'true',
  AI_ENABLE_FALLBACK_LOGGING: 'true',
  DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
  DEEPSEEK_MODEL_FLASH: 'deepseek-v4-flash',
  DEEPSEEK_MODEL_PRO: 'deepseek-v4-pro',
  MINIMAX_BASE_URL: 'https://api.minimax.io/v1',
  MINIMAX_MODEL: 'minimax-m2.7',
  SMOKE_LOCALE: 'en',
  SMOKE_TIMEOUT_MS: '15000',
};

const sensitiveNamePattern = /(SECRET|KEY|TOKEN|PASSWORD)/i;
const secretValuePattern = /^(sk-|sk_|pk_|whsec_|re_|eyJ|sbp_|sb_secret_)/i;

function htmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function redact(text, values) {
  let output = String(text || '');
  const sorted = [...new Set(values.filter((value) => value && value.length >= 8))]
    .sort((a, b) => b.length - a.length);
  for (const value of sorted) {
    output = output.split(value).join('[REDACTED]');
  }
  return output;
}

function extractJson(stdout) {
  const start = stdout.indexOf('{');
  const end = stdout.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(stdout.slice(start, end + 1));
  } catch {
    return null;
  }
}

function collectEnv(form) {
  const env = {};
  for (const group of fieldGroups) {
    for (const name of group.fields) {
      const raw = form[name];
      const value = Array.isArray(raw) ? raw.at(-1) : raw;
      if (typeof value === 'string' && value.trim()) {
        env[name] = value.trim();
      }
    }
  }
  return env;
}

function collectSecretValues(env) {
  return Object.entries(env)
    .filter(([name, value]) => {
      if (!value) return false;
      if (sensitiveNamePattern.test(name)) return true;
      if (secretValuePattern.test(value)) return true;
      return value.length >= 32 && !value.startsWith('http');
    })
    .map(([, value]) => value);
}

function createBaseEnv() {
  const allowlist = [
    'APPDATA',
    'ComSpec',
    'HOME',
    'LOCALAPPDATA',
    'NODE_OPTIONS',
    'Path',
    'PATH',
    'PATHEXT',
    'SystemDrive',
    'SystemRoot',
    'TEMP',
    'TMP',
    'USERPROFILE',
    'windir',
  ];
  const base = {};
  for (const name of allowlist) {
    if (typeof process.env[name] === 'string') {
      base[name] = process.env[name];
    }
  }
  return base;
}

function runNpmScript(scriptName, env, secretValues) {
  return new Promise((resolveRun) => {
    const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
    const args = process.platform === 'win32'
      ? ['/d', '/s', '/c', `npm run ${scriptName}`]
      : ['run', scriptName];
    const commandEnv = {
      ...createBaseEnv(),
      ...env,
      AI_PROVIDER_SMOKE_MODE: 'dry-run',
      AI_PROVIDER_SMOKE_ALLOW_LIVE: 'false',
      STRIPE_SMOKE_MODE: 'readiness',
      STRIPE_SMOKE_ALLOW_LIVE: 'false',
    };

    let child;
    try {
      child = spawn(command, args, {
        cwd: process.cwd(),
        env: commandEnv,
        shell: false,
        windowsHide: true,
      });
    } catch (error) {
      resolveRun({
        scriptName,
        exitCode: -1,
        stdout: '',
        stderr: redact(error.message, secretValues),
        json: null,
      });
      return;
    }

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('close', (code) => {
      const safeStdout = redact(stdout, secretValues);
      const safeStderr = redact(stderr, secretValues);
      resolveRun({
        scriptName,
        exitCode: code,
        stdout: safeStdout,
        stderr: safeStderr,
        json: extractJson(safeStdout),
      });
    });
    child.on('error', (error) => {
      resolveRun({
        scriptName,
        exitCode: -1,
        stdout: redact(stdout, secretValues),
        stderr: redact(`${stderr}\n${error.message}`, secretValues),
        json: null,
      });
    });
  });
}

function renderForm() {
  const groups = fieldGroups.map((group) => `
    <section>
      <h2>${htmlEscape(group.title)}</h2>
      <div class="grid">
        ${group.fields.map((name) => {
          const isSensitive = sensitiveNamePattern.test(name);
          const type = isSensitive ? 'password' : 'text';
          const value = defaults[name] || '';
          return `
            <label>
              <span>${htmlEscape(name)}</span>
              <input name="${htmlEscape(name)}" type="${type}" value="${htmlEscape(value)}" autocomplete="off" spellcheck="false" />
            </label>
          `;
        }).join('')}
      </div>
    </section>
  `).join('');

  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TianJi Love Phase 5B Local Env Runner</title>
    <style>
      :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      body { margin: 0; background: #0f1117; color: #eef1f7; }
      main { width: min(1120px, calc(100% - 32px)); margin: 32px auto 56px; }
      h1 { font-size: 24px; margin: 0 0 8px; }
      p { color: #aeb7c8; line-height: 1.6; }
      section { border: 1px solid #2a3140; border-radius: 8px; padding: 18px; margin: 16px 0; background: #151924; }
      h2 { font-size: 16px; margin: 0 0 14px; }
      .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
      label { display: grid; gap: 6px; font-size: 12px; color: #c7d0df; }
      input { min-height: 38px; border-radius: 6px; border: 1px solid #384357; background: #0f131d; color: #f5f7fb; padding: 0 10px; }
      .actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
      button { min-height: 40px; border: 0; border-radius: 6px; padding: 0 14px; color: #0f1117; background: #9bdcff; font-weight: 700; cursor: pointer; }
      button.secondary { background: #c9d3e6; }
      .warn { border-color: #6e5930; background: #211b10; color: #ffd99a; padding: 12px; border-radius: 6px; }
      code { color: #9bdcff; }
    </style>
  </head>
  <body>
    <main>
      <h1>TianJi Love Phase 5B Local Env Runner</h1>
      <p>Local-only input page bound to <code>127.0.0.1</code>. Values stay in memory for this request, are not written to <code>.env</code>, and are redacted from command output.</p>
      <div class="warn">Rotate any password or API key that was pasted into chat before using this runner.</div>
      <form method="post" action="/run">
        ${groups}
        <section>
          <h2>Run Mode</h2>
          <p>Live provider smoke and Stripe test-live are disabled in this runner.</p>
          <div class="actions">
            <button name="mode" value="readiness">Run masked env readiness only</button>
            <button class="secondary" name="mode" value="dryrun">Run readiness + dry-run gates</button>
            <button class="secondary" name="mode" value="nonpaid">Run readiness + dry-run gates + non-paid staging smoke</button>
          </div>
        </section>
      </form>
    </main>
  </body>
  </html>`;
}

function renderResult(result) {
  const pretty = JSON.stringify(result, null, 2);
  return `<!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Phase 5B Result</title>
    <style>
      :root { color-scheme: dark; font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace; }
      body { margin: 0; background: #0f1117; color: #eef1f7; }
      main { width: min(1120px, calc(100% - 32px)); margin: 32px auto 56px; }
      a, code { color: #9bdcff; }
      pre { white-space: pre-wrap; border: 1px solid #2a3140; border-radius: 8px; padding: 16px; background: #151924; overflow: auto; }
      .actions { display: flex; gap: 10px; margin-bottom: 18px; }
      button, a.button { min-height: 38px; border: 0; border-radius: 6px; padding: 0 14px; color: #0f1117; background: #9bdcff; font-weight: 700; display: inline-grid; place-items: center; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <h1>Phase 5B Result</h1>
      <p>Sanitized result was also written to <code>.ai/TIANJI_LOVE_PHASE5B_LOCAL_RUN_RESULT_20260517.json</code>.</p>
      <div class="actions">
        <a class="button" href="/">Back</a>
        <form method="post" action="/shutdown"><button>Stop local runner</button></form>
      </div>
      <pre>${htmlEscape(pretty)}</pre>
    </main>
  </body>
  </html>`;
}

async function handleRun(request, response) {
  let body = '';
  request.on('data', (chunk) => {
    body += chunk.toString();
    if (body.length > 512 * 1024) {
      request.destroy();
    }
  });
  request.on('end', async () => {
    const form = parseQuery(body);
    const mode = Array.isArray(form.mode) ? form.mode.at(-1) : form.mode;
    const env = collectEnv(form);
    const secretValues = collectSecretValues(env);
    const commands = [];

    const readiness = await runNpmScript('audit:staging-env-readiness', env, secretValues);
    commands.push(readiness);
    const envOverall = readiness.json?.overall || 'unknown';

    if ((mode === 'dryrun' || mode === 'nonpaid') && envOverall === 'go') {
      commands.push(await runNpmScript('smoke:ai-providers', env, secretValues));
      commands.push(await runNpmScript('smoke:stripe:test-readiness', env, secretValues));
      commands.push(await runNpmScript('audit:staging-launch-gate', env, secretValues));
    }

    if (mode === 'nonpaid' && envOverall === 'go' && env.STAGING_BASE_URL) {
      commands.push(await runNpmScript('smoke:staging:nonpaid', env, secretValues));
    }

    const result = {
      generatedAt: new Date().toISOString(),
      mode,
      envReadiness: envOverall,
      liveProviderSmoke: 'not-run',
      stripeTestLive: 'not-run',
      productionDeploy: 'no-go',
      commands,
      note: 'No submitted env values are stored in this result.',
    };

    await writeFile(RESULT_PATH, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(renderResult(result));
  });
}

function hostAllowed(request) {
  const host = request.headers.host || '';
  return host.startsWith(`${HOST}:`) || host.startsWith('localhost:');
}

const server = createServer(async (request, response) => {
  if (!hostAllowed(request)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ ok: true, liveProviderSmoke: 'disabled', stripeTestLive: 'disabled' }));
    return;
  }

  if (request.method === 'GET' && request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(renderForm());
    return;
  }

  if (request.method === 'POST' && request.url === '/run') {
    await handleRun(request, response);
    return;
  }

  if (request.method === 'POST' && request.url === '/shutdown') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Stopping local runner.');
    setTimeout(() => server.close(() => process.exit(0)), 100);
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found');
});

function listen(port) {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && port < MAX_PORT) {
      server.removeAllListeners('error');
      listen(port + 1);
      return;
    }
    console.error(`Phase 5B local runner failed: ${error.message}`);
    process.exit(1);
  });
  server.listen(port, HOST, () => {
    console.log(`Phase 5B local env runner listening on http://${HOST}:${port}`);
    console.log('Live provider smoke and Stripe test-live are disabled.');
  });
}

listen(START_PORT);
