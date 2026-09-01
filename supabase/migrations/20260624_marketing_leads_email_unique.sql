-- Security fix: add unique constraint on email to prevent duplicate lead submissions
-- This also protects against email enumeration attacks where an attacker
-- submits the same email repeatedly to test if it's already registered.

begin;

-- Add unique constraint on email (allows NULLs for anonymous submissions without email)
alter table public.marketing_leads
  add constraint marketing_leads_email_unique
  unique (email);

-- Add a partial unique index: only enforce uniqueness for non-null emails
-- This allows the table to have multiple rows where email IS NULL
-- (e.g. anonymous leads submitted without an email field)
create unique index marketing_leads_email_unique_if_present
  on public.marketing_leads (email)
  where email is not null;

commit;
