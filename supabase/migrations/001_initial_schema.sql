-- ============================================================
-- tianji.love — Initial Schema Migration
-- For Supabase PostgreSQL
-- Run: supabase db push or  psql $DATABASE_URL -f this_file.sql
-- ============================================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id TEXT UNIQUE,
  user_id UUID,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL, -- 'one_time' | 'subscription'
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed' | 'refunded'
  customer_email TEXT,
  reading_session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_checkout_session ON orders(checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Entitlements table
CREATE TABLE IF NOT EXISTS entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  product_id TEXT NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active', -- 'active' | 'revoked'
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_status ON entitlements(status);

-- Report jobs table (async report generation)
CREATE TABLE IF NOT EXISTS report_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed'
  report_type TEXT NOT NULL, -- 'solo_love_report' | 'compatibility_report' | 'deep_love_report'
  result_json JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_report_jobs_session_id ON report_jobs(session_id);
CREATE INDEX IF NOT EXISTS idx_report_jobs_status ON report_jobs(status);

-- Email subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT,
  locale TEXT DEFAULT 'en',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referred_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'converted' | 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);

-- Users: add referral_code if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE users ADD COLUMN referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 1, 8);
  END IF;
END $$;

-- ============================================================
-- Row Level Security (RLS) — enable after confirming tables
-- ============================================================
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE report_jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Service role can always read/write (for API routes)
-- CREATE POLICY "Service role can manage orders" ON orders
--   USING (auth.role() = 'service_role');
-- CREATE POLICY "Service role can manage entitlements" ON entitlements
--   USING (auth.role() = 'service_role');
-- etc.

-- ============================================================
-- Useful queries
-- ============================================================

-- Get active subscriptions count
-- SELECT COUNT(*) FROM entitlements WHERE product_id = 'monthly_pass' AND status = 'active';

-- Get monthly revenue
-- SELECT SUM(amount_cents) FROM orders WHERE status = 'paid' AND created_at > NOW() - INTERVAL '30 days';

-- Get top performing products
-- SELECT product_id, COUNT(*) FROM orders WHERE status = 'paid' GROUP BY product_id ORDER BY COUNT(*) DESC;