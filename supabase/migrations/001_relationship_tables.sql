-- Relationship System Migration
-- Run in Supabase SQL Editor after configuring env vars

-- ─── Relationship Profiles ───────────────────────────────────────────────────
create table if not exists public.relationship_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  nickname text not null,
  relation_type text not null check (relation_type in ('romantic', 'friendship', 'work')),

  birth_date date,
  birth_time text,
  birth_location text,
  timezone text default 'UTC',

  -- Natal chart data cached for faster re-analysis
  sun_sign text,
  moon_sign text,
  rising_sign text,
  dominant_element text,

  visibility text not null default 'private' check (visibility in ('private', 'hidden_birth_data')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.relationship_profiles enable row level security;

create policy "Users can manage their own profiles"
  on public.relationship_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_relationship_profiles_user_id
  on public.relationship_profiles(user_id);

-- ─── Relationship Readings ────────────────────────────────────────────────────
create table if not exists public.relationship_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,

  profile_a_id uuid references public.relationship_profiles(id) on delete set null,
  profile_b_id uuid references public.relationship_profiles(id) on delete set null,

  relation_type text not null check (relation_type in ('romantic', 'friendship', 'work')),

  -- Overall composite score
  score_overall numeric(5,2) not null default 0,

  -- Five dimension scores
  score_attraction numeric(5,2) not null default 0,
  score_communication numeric(5,2) not null default 0,
  score_conflict numeric(5,2) not null default 0,
  score_rhythm numeric(5,2) not null default 0,
  score_long_term numeric(5,2) not null default 0,

  -- Full structured result
  summary jsonb not null default '{}'::jsonb,
  dimensions jsonb not null default '{}'::jsonb,
  timeline jsonb,

  -- Privacy settings for sharing
  share_settings jsonb not null default '{"includeNames": true, "includeBirthData": false, "shareMode": "summary"}'::jsonb,

  is_premium boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.relationship_readings enable row level security;

create policy "Users can manage their own readings"
  on public.relationship_readings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Readings can be public by ID for sharing"
  on public.relationship_readings for select
  using (true);

create index if not exists idx_relationship_readings_user_id
  on public.relationship_readings(user_id);
create index if not exists idx_relationship_readings_profile_a_id
  on public.relationship_readings(profile_a_id);
create index if not exists idx_relationship_readings_profile_b_id
  on public.relationship_readings(profile_b_id);

-- ─── Relationship Shares ─────────────────────────────────────────────────────
create table if not exists public.relationship_shares (
  id uuid primary key default gen_random_uuid(),
  relationship_reading_id uuid references public.relationship_readings(id) on delete cascade,

  -- Anonymous share (no auth required)
  public_slug text unique not null,
  share_mode text not null default 'summary'
    check (share_mode in ('summary', 'chart_only', 'insight_card')),
  include_names boolean not null default true,
  include_birth_data boolean not null default false,

  view_count integer not null default 0,

  created_at timestamptz not null default now()
);

alter table public.relationship_shares enable row level security;

create policy "Anyone can view shared readings via slug"
  on public.relationship_shares for select
  using (true);

create policy "Anyone can create shares"
  on public.relationship_shares for insert
  with check (true);

create unique index if not exists idx_relationship_shares_slug
  on public.relationship_shares(public_slug);
