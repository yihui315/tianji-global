-- ============================================================
-- TianJi Global — readings table
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── readings ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS readings (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     TEXT        NOT NULL,          -- NextAuth user sub
  reading_type TEXT       NOT NULL,          -- 'ziwei' | 'bazi' | 'yijing' | 'western' | 'tarot'
  title        TEXT       NOT NULL,
  summary      TEXT       DEFAULT '',
  reading_data JSONB      DEFAULT '{}',      -- full reading result (stored for replay)
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for fast "recent by user" queries
CREATE INDEX IF NOT EXISTS readings_user_created
  ON readings (user_id, created_at DESC);

-- ── RLS ───────────────────────────────────────────────────────
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;

-- Users can only read their own readings
CREATE POLICY "owner_read" ON readings
  FOR SELECT USING (auth.uid()::text = user_id);

-- Users can insert their own readings
CREATE POLICY "owner_insert" ON readings
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can delete their own readings
CREATE POLICY "owner_delete" ON readings
  FOR DELETE USING (auth.uid()::text = user_id);

-- ── sample rows (optional — remove in production) ─────────────
-- INSERT INTO readings (user_id, reading_type, title, summary)
-- VALUES
--   ('test-user-1', 'ziwei',   '紫微命盘 — 2025年度',    '命宫主星为紫微，财运平稳...'),
--   ('test-user-1', 'western',  'Western Natal Chart',      'Sun in Aries, Moon in Cancer...'),
--   ('test-user-1', 'tarot',    '塔罗单牌 — 今日指引',     'The Fool — 新旅程开始...');
