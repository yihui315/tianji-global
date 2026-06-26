begin;

do $$
begin
  if to_regclass('public.marketing_leads') is null then
    raise notice 'public.marketing_leads does not exist; skipping local PostgreSQL policy reconciliation.';
    return;
  end if;

  execute 'alter table public.marketing_leads enable row level security';

  if exists (select 1 from pg_roles where rolname = 'tianji_app') then
    execute 'drop policy if exists "Backend service can manage marketing_leads" on public.marketing_leads';
    execute 'drop policy if exists "Backend app can manage marketing leads" on public.marketing_leads';
    execute 'create policy "Backend app can manage marketing leads" on public.marketing_leads for all to tianji_app using (true) with check (true)';
  else
    raise notice 'Role tianji_app does not exist; leaving marketing_leads policies unchanged.';
  end if;
end $$;

commit;
