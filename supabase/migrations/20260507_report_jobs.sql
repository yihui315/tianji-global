begin;

create extension if not exists "pgcrypto";

create table if not exists public.report_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id uuid not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  input jsonb not null default '{}'::jsonb,
  result jsonb,
  error text,
  ai_provider text,
  ai_model text,
  ai_input_tokens integer,
  ai_output_tokens integer,
  ai_cost_usd numeric(12, 6),
  ai_latency_ms integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists report_jobs_session_id_unique_idx on public.report_jobs(session_id);
create index if not exists report_jobs_status_idx on public.report_jobs(status);
create index if not exists report_jobs_ai_provider_idx on public.report_jobs(ai_provider);

alter table public.report_jobs enable row level security;

create policy "Service role can manage report jobs"
  on public.report_jobs
  for all
  to service_role
  using (true)
  with check (true);

commit;
