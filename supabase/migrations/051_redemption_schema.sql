-- =============================================================================
-- 051_redemption_schema.sql
-- Points system — Phase 1, Day 5 (part 1): redemption schema + Door A catalogue
--
-- 019_reward_catalog.sql existed in the repo but was never applied (confirmed
-- via list_migrations / information_schema — no reward_catalog table in the
-- live DB). This migration creates a trimmed version scoped to what Phase 1
-- Door A actually needs — the full kitchen_discount/charity_convert/premium_content/
-- partner_discount categories from 019 are Door B/Phase 2 and are left out until
-- that's built (avoids seeding dead catalog rows).
--
-- Also adds the columns each fulfilment handler writes to:
--   profiles.profile_flair   — equipped cosmetic flair slug
--   posts.is_featured/featured_until      — Hub post boost
--   recipes.featured_until                — Kitchen recipe boost (is_featured exists, 038)
--   ai_limit_boosts                       — active AI power-up per user
--
-- Prerequisites: 046_points_foundation.sql, 038_kitchen_featured.sql
-- =============================================================================


-- 1. Reward catalog — Door A categories only for now.
CREATE TABLE IF NOT EXISTS reward_catalog (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name                TEXT NOT NULL,
  description         TEXT NOT NULL,
  category            TEXT NOT NULL CHECK (category IN (
    'profile_flair',     -- cosmetic profile flair
    'hub_post_boost',    -- feature a Hub post for N days
    'recipe_boost',      -- feature a Kitchen recipe for N days
    'ai_power_up'        -- temp higher hourly AI limit
  )),

  points_required     INTEGER NOT NULL CHECK (points_required > 0),

  value_type          TEXT NOT NULL CHECK (value_type IN (
    'cosmetic_flair',   -- profile_flair — slug lives in value_metadata
    'feature_days',      -- hub_post_boost / recipe_boost — value_amount = days
    'ai_limit_boost'      -- ai_power_up — value_amount = boosted hourly limit
  )),
  value_amount        NUMERIC(10,2),
  value_metadata      JSONB NOT NULL DEFAULT '{}',
  -- profile_flair:  { "flair_slug": "gold-frame", "flair_label": "Gold Frame" }
  -- ai_power_up:    { "duration_hours": 24 }

  min_tier_required   TEXT NOT NULL DEFAULT 'bronze'
    CHECK (min_tier_required IN ('bronze','silver','gold','platinum')),

  max_per_user        INTEGER,        -- NULL = unlimited per user
  stock_remaining     INTEGER,        -- NULL = unlimited
  redeemed_count      INTEGER NOT NULL DEFAULT 0,

  is_active           BOOLEAN NOT NULL DEFAULT TRUE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reward_catalog_updated_at
  BEFORE UPDATE ON reward_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_reward_catalog_category  ON reward_catalog(category);
CREATE INDEX idx_reward_catalog_is_active ON reward_catalog(is_active) WHERE is_active = TRUE;

ALTER TABLE reward_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active catalog items"
  ON reward_catalog FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins manage reward catalog"
  ON reward_catalog FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- 2. Reward redemptions — one row per spend event.
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  catalog_item_id     UUID NOT NULL REFERENCES reward_catalog(id),

  points_spent        INTEGER NOT NULL CHECK (points_spent > 0),

  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'fulfilled', 'failed', 'reversed')),

  target_id           UUID,       -- recipe_id / post_id being boosted (NULL for flair/AI)
  fulfilled_at        TIMESTAMPTZ,

  reversed_at         TIMESTAMPTZ,
  reversal_reason     TEXT,

  transaction_id      UUID REFERENCES reward_transactions(id),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reward_redemptions_updated_at
  BEFORE UPDATE ON reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_reward_redemptions_user_id    ON reward_redemptions(user_id);
CREATE INDEX idx_reward_redemptions_created_at ON reward_redemptions(created_at DESC);

-- Velocity check (max 3/24h) and max_per_user check both scan this index.
CREATE INDEX idx_reward_redemptions_user_catalog
  ON reward_redemptions(user_id, catalog_item_id)
  WHERE status IN ('pending', 'fulfilled');

ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own redemptions"
  ON reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all redemptions"
  ON reward_redemptions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- 3. Fulfilment columns.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_flair TEXT;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

ALTER TABLE recipes ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS ai_limit_boosts (
  user_id       UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  boosted_limit INTEGER NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL
);

ALTER TABLE ai_limit_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI boost"
  ON ai_limit_boosts FOR SELECT
  USING (auth.uid() = user_id);
-- Writes only via service role (redeem_reward is SECURITY DEFINER).


-- 4. Seed Door A catalogue (prices decided 2026-07-08).
--    Flair + AI power-up capped at 1/user (cosmetic dupe / self-limiting boost);
--    boosts left uncapped — a user may want to boost different recipes/posts over time.
INSERT INTO reward_catalog (name, description, category, points_required, value_type, value_amount, value_metadata, min_tier_required, max_per_user)
VALUES
  ('Gold Frame flair',    'A gold frame around your profile photo in Hub.',        'profile_flair', 150, 'cosmetic_flair', NULL, '{"flair_slug": "gold-frame",   "flair_label": "Gold Frame"}',   'bronze', 1),
  ('Ocean Wave flair',    'An ocean-wave themed profile accent in Hub.',           'profile_flair', 150, 'cosmetic_flair', NULL, '{"flair_slug": "ocean-wave",   "flair_label": "Ocean Wave"}',   'bronze', 1),
  ('Sunset flair',        'A sunset-gradient profile accent in Hub.',              'profile_flair', 150, 'cosmetic_flair', NULL, '{"flair_slug": "sunset",       "flair_label": "Sunset"}',       'bronze', 1),
  ('Minimal Mono flair',  'A clean monochrome profile accent in Hub.',             'profile_flair', 150, 'cosmetic_flair', NULL, '{"flair_slug": "minimal-mono", "flair_label": "Minimal Mono"}', 'bronze', 1),
  ('Boost your post',     'Feature your Hub post for 5 days.',                      'hub_post_boost', 300, 'feature_days',   5,    '{}', 'bronze', NULL),
  ('Boost your recipe',   'Feature your recipe in Kitchen discover for 7 days.',   'recipe_boost',   400, 'feature_days',   7,    '{}', 'bronze', NULL),
  ('AI power-up',         'Raises your AI limit from 10 to 30 requests/hour for the next 24 hours.', 'ai_power_up', 500, 'ai_limit_boost', 30, '{"duration_hours": 24}', 'bronze', NULL)
ON CONFLICT DO NOTHING;
