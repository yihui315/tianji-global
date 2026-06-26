begin;

create extension if not exists "pgcrypto";

create table if not exists public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  source_page text not null,
  locale text,
  variant text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  consent_given_at timestamptz not null default now(),
  consent_version text not null default '1.0',
  status text not null default 'pending_manual_review',
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketing_leads_email_idx
  on public.marketing_leads(email);

create index if not exists marketing_leads_source_page_idx
  on public.marketing_leads(source_page);

create index if not exists marketing_leads_utm_source_idx
  on public.marketing_leads(utm_source);

create index if not exists marketing_leads_utm_campaign_idx
  on public.marketing_leads(utm_campaign);

create index if not exists marketing_leads_created_at_idx
  on public.marketing_leads(created_at);

alter table public.marketing_leads enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role')
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'marketing_leads'
        and policyname = 'Service role can manage marketing leads'
    )
  then
    execute 'create policy "Service role can manage marketing leads" on public.marketing_leads for all to service_role using (true) with check (true)';
  end if;

  if exists (select 1 from pg_roles where rolname = 'tianji_app')
    and not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = 'marketing_leads'
        and policyname = 'Backend app can manage marketing leads'
    )
  then
    execute 'create policy "Backend app can manage marketing leads" on public.marketing_leads for all to tianji_app using (true) with check (true)';
  end if;

  if not exists (select 1 from pg_roles where rolname in ('service_role', 'tianji_app')) then
    raise notice 'No marketing_leads backend role found; create service_role or tianji_app, then apply 20260626_marketing_leads_local_pg_policy.sql.';
  end if;
end $$;

commit;
