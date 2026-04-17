begin;

create extension if not exists "pgcrypto";

alter table if exists public.users
  add column if not exists subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'premium', 'pro')),
  add column if not exists timezone text,
  add column if not exists language text not null default 'en'
    check (language in ('en', 'zh'));

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  profile_type text not null default 'self' check (profile_type in ('self', 'other')),
  display_name text,
  nickname text,
  birth_date date not null,
  birth_time text,
  birth_location text,
  timezone text,
  lat numeric(9, 6),
  lng numeric(9, 6),
  language text not null default 'en' check (language in ('en', 'zh')),
  gender text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_user_id_idx on public.user_profiles(user_id);
create unique index if not exists user_profiles_primary_unique
  on public.user_profiles(user_id) where is_primary = true;

create table if not exists public.reading_sessions_unified (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  profile_id uuid not null references public.user_profiles(id) on delete cascade,
  module_type text not null check (
    module_type in (
      'bazi', 'ziwei', 'western', 'numerology', 'fortune', 'relationship',
      'tarot', 'yijing', 'fengshui', 'electional', 'transit', 'solar-return'
    )
  ),
  question_context text,
  relation_profile_id uuid references public.user_profiles(id) on delete set null,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reading_sessions_unified_user_id_idx on public.reading_sessions_unified(user_id);
create index if not exists reading_sessions_unified_profile_id_idx on public.reading_sessions_unified(profile_id);
create index if not exists reading_sessions_unified_module_type_idx on public.reading_sessions_unified(module_type);

create table if not exists public.module_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.reading_sessions_unified(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  profile_id uuid not null references public.user_profiles(id) on delete cascade,
  module_type text not null check (
    module_type in (
      'bazi', 'ziwei', 'western', 'numerology', 'fortune', 'relationship',
      'tarot', 'yijing', 'fengshui', 'electional', 'transit', 'solar-return'
    )
  ),
  version text not null default 'v1',
  title text,
  summary text,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  confidence_score numeric(5, 2),
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists module_results_session_id_idx on public.module_results(session_id);
create index if not exists module_results_user_id_idx on public.module_results(user_id);
create index if not exists module_results_profile_id_idx on public.module_results(profile_id);
create index if not exists module_results_module_type_idx on public.module_results(module_type);

create table if not exists public.destiny_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  profile_id uuid not null references public.user_profiles(id) on delete cascade,
  identity_summary jsonb not null default '{}'::jsonb,
  energy_profile jsonb not null default '{}'::jsonb,
  relationship_profile jsonb not null default '{}'::jsonb,
  career_profile jsonb not null default '{}'::jsonb,
  wealth_profile jsonb not null default '{}'::jsonb,
  timing_profile jsonb not null default '{}'::jsonb,
  action_profile jsonb not null default '{}'::jsonb,
  risk_profile jsonb not null default '{}'::jsonb,
  source_modules jsonb not null default '[]'::jsonb,
  confidence_score numeric(5, 2) not null default 0,
  last_recomputed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, profile_id)
);

create index if not exists destiny_profiles_user_id_idx on public.destiny_profiles(user_id);
create index if not exists destiny_profiles_profile_id_idx on public.destiny_profiles(profile_id);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'premium', 'pro')),
  features jsonb not null default '{}'::jsonb,
  starts_at timestamptz default now(),
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan, is_active)
);

create index if not exists entitlements_user_id_idx on public.entitlements(user_id);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  profile_id uuid references public.user_profiles(id) on delete set null,
  session_id uuid references public.reading_sessions_unified(id) on delete set null,
  event text not null,
  experiment_id text,
  variant text,
  module_type text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_event_idx on public.analytics_events(event);
create index if not exists analytics_events_experiment_idx on public.analytics_events(experiment_id);

create or replace function public.handle_unified_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.handle_unified_updated_at();

drop trigger if exists set_reading_sessions_unified_updated_at on public.reading_sessions_unified;
create trigger set_reading_sessions_unified_updated_at
  before update on public.reading_sessions_unified
  for each row execute function public.handle_unified_updated_at();

drop trigger if exists set_module_results_updated_at on public.module_results;
create trigger set_module_results_updated_at
  before update on public.module_results
  for each row execute function public.handle_unified_updated_at();

drop trigger if exists set_destiny_profiles_updated_at on public.destiny_profiles;
create trigger set_destiny_profiles_updated_at
  before update on public.destiny_profiles
  for each row execute function public.handle_unified_updated_at();

drop trigger if exists set_entitlements_updated_at on public.entitlements;
create trigger set_entitlements_updated_at
  before update on public.entitlements
  for each row execute function public.handle_unified_updated_at();

commit;
