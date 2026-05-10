begin;

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  email text,
  consent_type text not null,
  consent_version text not null default '2026-05-07-love-v1',
  locale text not null default 'en',
  status text not null default 'granted' check (status in ('granted', 'withdrawn')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  email text not null,
  request_type text not null check (request_type in ('export', 'deletion')),
  status text not null default 'received' check (status in ('received', 'verifying', 'processing', 'completed', 'rejected')),
  locale text not null default 'en',
  request_source text not null default 'privacy_center',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists consent_records_user_id_idx on public.consent_records(user_id);
create index if not exists consent_records_email_idx on public.consent_records(email);
create index if not exists deletion_requests_user_id_idx on public.deletion_requests(user_id);
create index if not exists deletion_requests_email_idx on public.deletion_requests(email);
create index if not exists deletion_requests_status_idx on public.deletion_requests(status);

alter table public.consent_records enable row level security;
alter table public.deletion_requests enable row level security;

drop policy if exists "Service role manages consent records" on public.consent_records;
create policy "Service role manages consent records"
  on public.consent_records
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Users can read own consent records" on public.consent_records;
create policy "Users can read own consent records"
  on public.consent_records
  for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages deletion requests" on public.deletion_requests;
create policy "Service role manages deletion requests"
  on public.deletion_requests
  for all
  to service_role
  using (true)
  with check (true);

drop policy if exists "Users can read own privacy requests" on public.deletion_requests;
create policy "Users can read own privacy requests"
  on public.deletion_requests
  for select
  using (auth.uid() = user_id);

comment on table public.consent_records is
  'Records explicit privacy and terms consent events. Avoid storing birth time, birth place, or relationship answers.';

comment on table public.deletion_requests is
  'Tracks export and deletion requests from the privacy center. Details are sanitized before insert.';

commit;
