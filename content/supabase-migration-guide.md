# Supabase Migration Guide — P23

## Quick Start

### Option A: Supabase Dashboard (Recommended)

1. Go to [supabase.com](https://supabase.com) → your project → **SQL Editor**
2. Click **New Query**
3. Copy-paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click **Run** → verify "Success" message

### Option B: Supabase CLI

```bash
# Install supabase CLI
npm install -g supabase

# Link project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push
```

### Option C: psql direct

```bash
psql $DATABASE_URL -f supabase/migrations/001_initial_schema.sql
```

## Verify Tables Created

```sql
-- Should return 5 tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- Verify indexes
SELECT indexname FROM pg_indexes
WHERE tablename IN ('orders', 'entitlements', 'report_jobs', 'email_subscribers', 'referrals');
```

## Required Env Variables (for production API routes)

```bash
# .env.production — add these
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # from Supabase Dashboard → Settings → API
```

⚠️ **Service Role Key**: Only used server-side. Never expose in client-side code.

## Row Level Security (RLS) — Enable After Testing

Once tables are verified working, enable RLS:

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Service role policy (for API routes using service role key)
CREATE POLICY "service_role_all" ON orders FOR ALL TO service_role USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON entitlements FOR ALL TO service_role USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON report_jobs FOR ALL TO service_role USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON email_subscribers FOR ALL TO service_role USING (auth.role() = 'service_role');
CREATE POLICY "service_role_all" ON referrals FOR ALL TO service_role USING (auth.role() = 'service_role');
```

## Rollback (if needed)

```sql
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS entitlements CASCADE;
DROP TABLE IF EXISTS report_jobs CASCADE;
DROP TABLE IF EXISTS email_subscribers CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
```

## Post-Migration Checklist

- [ ] Tables created (5/5)
- [ ] Indexes created
- [ ] DATABASE_URL set in .env.production
- [ ] SUPABASE_SERVICE_ROLE_KEY set in .env.production
- [ ] `npm run build` succeeds after env update
- [ ] `pm2 restart tianji-global` to reload env
- [ ] Test `/api/checkout` with Stripe test mode