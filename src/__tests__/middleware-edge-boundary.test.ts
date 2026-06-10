import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, 'src');
const middlewarePath = path.join(projectRoot, 'src/middleware.ts');
const middlewareSource = readFileSync(middlewarePath, 'utf8');

const localImportPattern = /(?:import|export)\s+(?:type\s+)?(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
const moduleExtensions = ['', '.ts', '.tsx', '.js', '.jsx'];

function resolveLocalImport(specifier: string, importerPath: string): string | undefined {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) {
    return undefined;
  }

  const basePath = specifier.startsWith('@/')
    ? path.join(sourceRoot, specifier.slice(2))
    : path.resolve(path.dirname(importerPath), specifier);

  for (const extension of moduleExtensions) {
    const candidate = `${basePath}${extension}`;
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  for (const extension of moduleExtensions) {
    const candidate = path.join(basePath, `index${extension}`);
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

function collectLocalImportGraph(entryPath: string): string[] {
  const pending = [entryPath];
  const visited = new Set<string>();

  while (pending.length > 0) {
    const currentPath = pending.pop()!;
    if (visited.has(currentPath)) {
      continue;
    }

    visited.add(currentPath);
    const source = readFileSync(currentPath, 'utf8');
    const imports = source.matchAll(localImportPattern);

    for (const match of imports) {
      const resolvedPath = resolveLocalImport(match[1], currentPath);
      if (resolvedPath && !visited.has(resolvedPath)) {
        pending.push(resolvedPath);
      }
    }
  }

  return [...visited];
}

function relativeProjectPath(filePath: string): string {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/');
}

const bannedMiddlewareGraphPatterns = [
  { label: '@/lib/auth', pattern: /from ['"]@\/lib\/auth['"]/ },
  { label: '@/lib/auth-options', pattern: /from ['"]@\/lib\/auth-options['"]/ },
  { label: '@/lib/db', pattern: /from ['"]@\/lib\/db['"]/ },
  { label: 'pg package', pattern: /from ['"]pg['"]/ },
  { label: '@auth/pg-adapter', pattern: /from ['"]@auth\/pg-adapter['"]/ },
  { label: 'PostgresAdapter', pattern: /\bPostgresAdapter\b/ },
  { label: 'getPool', pattern: /\bgetPool\b/ },
  { label: 'DATABASE_URL', pattern: /\bDATABASE_URL\b/ },
];

describe('middleware edge runtime boundary', () => {
  it('does not import Node-only auth or database modules', () => {
    expect(middlewareSource).not.toMatch(/from ['"]@\/lib\/auth['"]/);
    expect(middlewareSource).not.toMatch(/from ['"]@\/lib\/auth-options['"]/);
    expect(middlewareSource).not.toMatch(/from ['"]@\/lib\/db['"]/);
    expect(middlewareSource).not.toMatch(/from ['"](?:pg|@auth\/pg-adapter)['"]/);
  });

  it('keeps the middleware local import graph free of Node-only auth and database modules', () => {
    const middlewareGraph = collectLocalImportGraph(middlewarePath);

    expect(middlewareGraph.map(relativeProjectPath)).toEqual(
      expect.arrayContaining(['src/middleware.ts', 'src/lib/auth-origin.ts'])
    );

    for (const filePath of middlewareGraph) {
      const source = readFileSync(filePath, 'utf8');
      const relativePath = relativeProjectPath(filePath);

      for (const banned of bannedMiddlewareGraphPatterns) {
        expect(source, `${relativePath} must not pull ${banned.label} into middleware`).not.toMatch(banned.pattern);
      }
    }
  });

  it('allows the full Node auth file to keep the database-backed adapter boundary', () => {
    const nodeAuthSource = readFileSync(path.join(projectRoot, 'src/lib/auth.ts'), 'utf8');
    const nodeAuthOptionsSource = readFileSync(path.join(projectRoot, 'src/lib/auth-options.ts'), 'utf8');

    expect(nodeAuthSource).toMatch(/NextAuth/);
    expect(nodeAuthOptionsSource).toMatch(/PostgresAdapter/);
    expect(nodeAuthOptionsSource).toMatch(/getPool/);
  });

  it('uses an Edge-safe token presence check for private route protection', () => {
    expect(middlewareSource).toMatch(/next-auth\/jwt/);
    expect(middlewareSource).toMatch(/getToken/);
    expect(middlewareSource).toMatch(/PROTECTED_PATHS/);
    expect(middlewareSource).toMatch(/buildLoginRedirectUrl/);
  });
});
