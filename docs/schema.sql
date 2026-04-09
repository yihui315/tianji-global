-- ============================================================
-- TianJi Global (玄学平台) Database Schema
-- PostgreSQL 15+
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'paused'
);

CREATE TYPE subscription_tier AS ENUM (
  'free',
  'basic',
  'premium',
  'enterprise'
);

CREATE TYPE service_type AS ENUM (
  'bazi',        -- 八字
  'ziwei',       -- 紫微斗数
  'iching',      -- 易经
  'tarot',       -- 塔罗
  'western',     -- Western astrology
  'fortune',     -- 人生运势
  'psychology'   -- 心理批盘
);

CREATE TYPE audit_action AS ENUM (
  'reading_created',
  'reading_viewed',
  'reading_shared',
  'subscription_created',
  'subscription_updated',
  'subscription_canceled',
  'ai_interpretation_generated',
  'user_login',
  'user_logout',
  'profile_updated'
);

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT            NOT NULL UNIQUE,
  name            TEXT,
  avatar_url      TEXT,
  stripe_customer_id TEXT        UNIQUE,
  subscription_status subscription_status DEFAULT 'active',
  subscription_tier   subscription_tier DEFAULT 'free',
  email_verified  TIMESTAMPTZ     DEFAULT NULL,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Indexes for user lookups
CREATE INDEX idx_users_email           ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX idx_users_subscription    ON users(subscription_status, subscription_tier);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================

CREATE TABLE subscriptions (
  id                     UUID                  PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID                  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT                  NOT NULL UNIQUE,
  stripe_price_id        TEXT                  NOT NULL,
  status                 subscription_status   NOT NULL DEFAULT 'active',
  tier                   subscription_tier     NOT NULL DEFAULT 'free',
  current_period_start   TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  current_period_end     TIMESTAMPTZ           NOT NULL,
  cancel_at              TIMESTAMPTZ            DEFAULT NULL,
  cancel_at_period_end   BOOLEAN               DEFAULT FALSE,
  created_at             TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ           NOT NULL DEFAULT NOW()
);

-- Indexes for subscription lookups
CREATE INDEX idx_subscriptions_user_id         ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub      ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status          ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period  ON subscriptions(current_period_end);

-- ============================================================
-- READINGS
-- ============================================================

CREATE TABLE readings (
  id                 UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_type       service_type    NOT NULL,
  birth_data         JSONB           NOT NULL DEFAULT '{}',
  -- birth_data stores: birth_date, birth_time, gender, location, timezone, etc.
  result_data        JSONB           NOT NULL DEFAULT '{}',
  -- result_data stores: computed fortune data, chart data, deity combinations, etc.
  ai_interpretation  TEXT,
  ai_used            BOOLEAN         DEFAULT FALSE,
  language           TEXT            NOT NULL DEFAULT 'zh',
  share_token        TEXT            UNIQUE,
  -- share_token for OG image sharing (pre-generated)
  created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Indexes for reading queries (RLS-friendly)
CREATE INDEX idx_readings_user_id       ON readings(user_id);
CREATE INDEX idx_readings_service_type  ON readings(service_type);
CREATE INDEX idx_readings_created_at    ON readings(created_at DESC);
-- Composite index for user + service + date queries
CREATE INDEX idx_readings_user_service   ON readings(user_id, service_type, created_at DESC);
-- GIN index for JSONB queries (future-proofing)
CREATE INDEX idx_readings_birth_data    ON readings USING GIN (birth_data);
CREATE INDEX idx_readings_result_data   ON readings USING GIN (result_data);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_log (
  id           UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID            REFERENCES users(id) ON DELETE SET NULL,
  action       audit_action    NOT NULL,
  service_type service_type,
  metadata     JSONB           NOT NULL DEFAULT '{}',
  -- metadata stores: ip_address, user_agent, request_id, old_values, new_values, etc.
  created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Indexes for audit log queries
CREATE INDEX idx_audit_user_id      ON audit_log(user_id);
CREATE INDEX idx_audit_action       ON audit_log(action);
CREATE INDEX idx_audit_service_type ON audit_log(service_type);
CREATE INDEX idx_audit_created_at   ON audit_log(created_at DESC);
-- Composite for user activity timeline
CREATE INDEX idx_audit_user_action   ON audit_log(user_id, action, created_at DESC);

-- ============================================================
-- TRIGGER: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_readings_updated_at
  BEFORE UPDATE ON readings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - for Supabase/Postgres auth
-- ============================================================

-- Note: Enable RLS after setting up auth.users integration
-- The user_id column on every table enables RLS policies

-- ALTER TABLE users         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE readings      ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_log     ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment when auth is configured):
--
-- CREATE POLICY "Users can view own profile"
--   ON users FOR SELECT
--   USING (auth.uid() = id);
--
-- CREATE POLICY "Users can update own profile"
--   ON users FOR UPDATE
--   USING (auth.uid() = id);
--
-- CREATE POLICY "Users can view own subscriptions"
--   ON subscriptions FOR SELECT
--   USING (user_id = auth.uid());
--
-- CREATE POLICY "Users can view own readings"
--   ON readings FOR SELECT
--   USING (user_id = auth.uid());
--
-- CREATE POLICY "Users can insert own readings"
--   ON readings FOR INSERT
--   WITH CHECK (user_id = auth.uid());
--
-- CREATE POLICY "Users can view own audit log"
--   ON audit_log FOR SELECT
--   USING (user_id = auth.uid());

-- ============================================================
-- COMMENTS / DOCUMENTATION
-- ============================================================

COMMENT ON TABLE users        IS 'Application users with auth and subscription info';
COMMENT ON TABLE readings     IS 'Fortune reading records with flexible JSONB result storage';
COMMENT ON TABLE subscriptions IS 'Stripe subscription records per user';
COMMENT ON TABLE audit_log    IS 'Immutable audit trail for compliance and debugging';

COMMENT ON COLUMN users.subscription_status  IS 'trialing|active|past_due|canceled|incomplete|incomplete_expired|paused';
COMMENT ON COLUMN users.subscription_tier   IS 'free|basic|premium|enterprise';
COMMENT ON COLUMN readings.service_type     IS 'bazi|ziwei|iching|tarot|western|fortune|psychology';
COMMENT ON COLUMN readings.birth_data        IS 'Birth info: birth_date, birth_time, gender, location, timezone';
COMMENT ON COLUMN readings.result_data       IS 'Computed fortune result: chart data, deity combinations, etc.';
COMMENT ON COLUMN readings.ai_interpretation IS 'AI-generated interpretation text (user opt-in)';
COMMENT ON COLUMN readings.share_token       IS 'Unique token for pre-generated OG share image';
