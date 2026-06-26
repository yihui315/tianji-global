import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();

function read(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

describe('marketing leads migration policy compatibility', () => {
  it('keeps the initial migration role-aware for hosted and local PostgreSQL', () => {
    const migration = read('supabase/migrations/20260624_marketing_leads.sql');

    expect(migration).toContain("rolname = 'service_role'");
    expect(migration).toContain("rolname = 'tianji_app'");
    expect(migration).toContain('Backend app can manage marketing leads');
    expect(migration).not.toMatch(
      /^create policy "Service role can manage marketing leads"\s+on public\.marketing_leads\s+for all\s+to service_role/im,
    );
  });

  it('adds a no-data-loss local PostgreSQL follow-up policy migration', () => {
    const migration = read('supabase/migrations/20260626_marketing_leads_local_pg_policy.sql');

    expect(migration).toContain("to_regclass('public.marketing_leads')");
    expect(migration).toContain("rolname = 'tianji_app'");
    expect(migration).toContain('Backend app can manage marketing leads');
    expect(migration).toContain('for all to tianji_app');
    expect(migration).not.toMatch(/drop\s+table/i);
    expect(migration).not.toMatch(/delete\s+from\s+public\.marketing_leads/i);
    expect(migration).not.toContain('for all to service_role');
  });

  it('documents the Supabase hosted versus local PostgreSQL role difference', () => {
    const docs = read('docs/marketing-leads-local-postgres-policy.md');

    expect(docs).toContain('Supabase hosted');
    expect(docs).toContain('local PostgreSQL');
    expect(docs).toContain('service_role');
    expect(docs).toContain('tianji_app');
    expect(docs).toContain('Production DB mutation by Codex | No-Go');
    expect(docs).toContain('Revenue Execution | No-Go');
  });
});
