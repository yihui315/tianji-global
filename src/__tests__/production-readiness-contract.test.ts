import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const repoRoot = process.cwd();
const appRoot = path.join(repoRoot, 'src/app');

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function jsonRequest(url: string, body: Record<string, unknown>) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const mojibakePattern = /(?:�|鈥|鍏|鍛|澶╂|涓撲|鏃犻|浼樺|璧犻|鐗岁|濉旂綏|瑗挎柟|绱井)/;

describe('production readiness contract', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('@/lib/unified-platform', () => ({
      getPlatformContext: () => Promise.resolve(null),
    }));
    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: () => false,
      getSupabaseAdmin: () => {
        throw new Error('Supabase should not be used in offline readiness tests');
      },
    }));
    vi.doMock('@/lib/unified-write', () => ({
      persistDestinyScanResult: () => Promise.resolve(),
    }));
  });

  it('does not define duplicate App Router route handlers for the same segment', () => {
    const duplicates = walkFiles(appRoot)
      .filter((file) => /[\\/]route\.tsx?$/.test(file))
      .reduce<Record<string, string[]>>((acc, file) => {
        const dir = path.dirname(file);
        acc[dir] = [...(acc[dir] ?? []), path.relative(repoRoot, file)];
        return acc;
      }, {});

    const ambiguousRoutes = Object.entries(duplicates)
      .filter(([, files]) => files.length > 1)
      .map(([dir, files]) => `${path.relative(repoRoot, dir)} -> ${files.join(', ')}`);

    expect(ambiguousRoutes).toEqual([]);
  });

  it('keeps production pricing copy free of mojibake in localized plan metadata', () => {
    const stripeConfig = read('src/lib/stripe.ts');

    expect(stripeConfig).not.toMatch(mojibakePattern);
    expect(stripeConfig).toContain('Pro Monthly');
    expect(stripeConfig).toContain('专业版月度');
    expect(stripeConfig).toContain('Unlimited fortune readings');
    expect(stripeConfig).toContain('无限命理解读');
  });

  it('keeps the share card endpoint as a single image response handler with clean labels', () => {
    const routeFiles = walkFiles(path.join(appRoot, 'api/share/card'))
      .filter((file) => /[\\/]route\.tsx?$/.test(file))
      .map((file) => path.relative(repoRoot, file).replaceAll('\\', '/'));
    const source = read('src/app/api/share/card/route.tsx');

    expect(routeFiles).toEqual(['src/app/api/share/card/route.tsx']);
    expect(source).toContain("export const runtime = 'edge'");
    expect(source).toContain('new ImageResponse');
    expect(source).not.toContain('data:image/png;base64');
    expect(source).not.toMatch(mojibakePattern);
    expect(source).toContain('TianJi Global');
    expect(source).toContain('Zi Wei Destiny');
    expect(source).toContain('Yi Jing Oracle');
  });

  it('serves the public Destiny Scan POST to GET preview loop without a database dependency', async () => {
    const { POST: postDestinyScan, GET: getDestinyScan } = await import(
      '@/app/api/destiny/scan/route'
    );
    const postResponse = await postDestinyScan(
      jsonRequest('http://localhost/api/destiny/scan', {
        birthDate: '1990-08-16',
        birthTime: '08:30',
        birthLocation: 'Singapore',
      })
    );
    const postJson = await postResponse.json();

    expect(postResponse.status).toBe(200);
    expect(postJson.success).toBe(true);
    expect(postJson.id).toEqual(expect.any(String));
    expect(postJson.preview.summary.headline).toEqual(expect.any(String));

    const getResponse = await getDestinyScan(
      {
        nextUrl: new URL(`http://localhost/api/destiny/scan?id=${encodeURIComponent(postJson.id)}`),
      } as never
    );
    const getJson = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(getJson.id).toBe(postJson.id);
    expect(getJson.summary.oneLiner).toEqual(expect.any(String));
    expect(getJson.energy.points.length).toBeGreaterThan(0);
  });

  it('rejects invalid Destiny Scan input with a public 400 response', async () => {
    const { POST: postDestinyScan } = await import('@/app/api/destiny/scan/route');
    const response = await postDestinyScan(
      jsonRequest('http://localhost/api/destiny/scan', {
        birthDate: '',
        birthLocation: '',
      })
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid destiny scan input');
  });
});
