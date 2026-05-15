begin;

create extension if not exists "pgcrypto";

create table if not exists public.birth_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  birth_date date not null,
  birth_time text,
  birth_place text,
  data_minimized boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists birth_profiles_user_id_idx
  on public.birth_profiles(user_id);

create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  birth_profile_id uuid not null references public.birth_profiles(id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'zh-CN')),
  reading_mode text not null default 'solo' check (reading_mode in ('solo', 'compatibility')),
  status text not null default 'teaser_ready' check (
    status in ('teaser_ready', 'paid', 'generating', 'completed', 'failed')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reading_sessions_user_id_idx
  on public.reading_sessions(user_id);

create index if not exists reading_sessions_birth_profile_id_idx
  on public.reading_sessions(birth_profile_id);

create table if not exists public.reading_teasers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.reading_sessions(id) on delete cascade,
  summary text not null,
  pattern_tags text[] not null default array[]::text[],
  locked_sections jsonb not null default '[]'::jsonb,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reading_teasers_session_id_idx
  on public.reading_teasers(session_id);

alter table public.reading_sessions enable row level security;
alter table public.birth_profiles enable row level security;
alter table public.reading_teasers enable row level security;

create policy "Service role can manage reading sessions"
  on public.reading_sessions
  for all
  to service_role
  using (true)
  with check (true);

create policy "Service role can manage birth profiles"
  on public.birth_profiles
  for all
  to service_role
  using (true)
  with check (true);

create policy "Service role can manage reading teasers"
  on public.reading_teasers
  for all
  to service_role
  using (true)
  with check (true);

commit;
