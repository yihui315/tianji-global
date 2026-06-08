-- Auth.js / NextAuth member login compatibility.
--
-- Enables the free self-hosted Auth.js flow used by Google OAuth and Resend
-- Magic Link. Do not store secret values in this migration. Apply only to the
-- intended staging/production database after backing up and confirming env:
-- DATABASE_URL, AUTH_SECRET/NEXTAUTH_SECRET, GOOGLE_CLIENT_ID/SECRET,
-- RESEND_API_KEY, and EMAIL_FROM.

begin;

create extension if not exists "pgcrypto";

alter table public.users
  add column if not exists image text,
  add column if not exists "emailVerified" timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'users'
      and column_name = 'email_verified'
  ) then
    update public.users
    set "emailVerified" = email_verified
    where "emailVerified" is null
      and email_verified is not null;
  end if;
end $$;

create table if not exists public.accounts (
  id text primary key default gen_random_uuid()::text,
  "userId" uuid not null references public.users(id) on delete cascade,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  constraint accounts_provider_provider_account_id_unique unique (provider, "providerAccountId")
);

create index if not exists accounts_user_id_idx on public.accounts("userId");
create index if not exists accounts_provider_account_idx on public.accounts(provider, "providerAccountId");

create table if not exists public.sessions (
  id text primary key default gen_random_uuid()::text,
  "sessionToken" text not null unique,
  "userId" uuid not null references public.users(id) on delete cascade,
  expires timestamptz not null
);

create index if not exists sessions_user_id_idx on public.sessions("userId");
create index if not exists sessions_session_token_idx on public.sessions("sessionToken");

create table if not exists public.verification_token (
  identifier text not null,
  expires timestamptz not null,
  token text not null,
  primary key (identifier, token)
);

alter table public.accounts enable row level security;
alter table public.sessions enable row level security;
alter table public.verification_token enable row level security;

drop policy if exists "No client access to accounts" on public.accounts;
create policy "No client access to accounts"
  on public.accounts for all
  using (false)
  with check (false);

drop policy if exists "No client access to sessions" on public.sessions;
create policy "No client access to sessions"
  on public.sessions for all
  using (false)
  with check (false);

drop policy if exists "No client access to verification_token" on public.verification_token;
create policy "No client access to verification_token"
  on public.verification_token for all
  using (false)
  with check (false);

commit;
