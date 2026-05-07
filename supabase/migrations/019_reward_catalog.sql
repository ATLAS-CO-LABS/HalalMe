-- =============================================================================
-- 019_reward_catalog.sql
-- Reward catalog and redemption system
--
-- Defines what users can spend their points on inside the HalalMe ecosystem:
--   kitchen_discount   → % or £ off a Kitchen/Fresh order
--   recipe_boost       → feature a recipe in the discover feed for N days
--   hub_badge          → unlock a profile badge in Hub
--   charity_convert    → convert points into a GBP donation to a charity
--   premium_content    → unlock exclusive recipes or guides
--   partner_discount   → reveal a coupon code from a halal partner brand
--
-- Point-to-value standard rate: 100 points = £1.00 (1pt = £0.01)
-- Each catalog item defines its own rate via points_required + value_amount
--
-- Prerequisites: 005_rewards.sql
-- =============================================================================


-- =============================================================================
-- 1. REWARD CATALOG
-- Each row is one redeemable item — managed by admins
-- =============================================================================

CREATE TABLE IF NOT EXISTS reward_catalog (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Display
  name                TEXT NOT NULL,
  description         TEXT NOT NULL,
  image_url           TEXT,
  category            TEXT NOT NULL CHECK (category IN (
    'kitchen_discount',   -- discount on Fresh/Kitchen orders
    'recipe_boost',       -- feature recipe in discover feed
    'hub_badge',          -- profile badge in Hub
    'charity_convert',    -- convert points to GBP donation
    'premium_content',    -- unlock exclusive content
    'partner_discount'    -- external partner coupon code
  )),

  -- Cost
  points_required     INTEGER NOT NULL CHECK (points_required > 0),

  -- What the user actually receives
  value_type          TEXT NOT NULL CHECK (value_type IN (
    'percentage_discount',  -- X% off (kitchen_discount)
    'fixed_gbp_discount',   -- £X off (kitchen_discount)
    'gbp_donation',         -- £X donated to charity on user's behalf (charity_convert)
    'feature_days',         -- featured for X days (recipe_boost)
    'badge_slug',           -- slug of badge to award (hub_badge)
    'content_id',           -- UUID of content to unlock (premium_content)
    'coupon_code'           -- reveal a static or generated code (partner_discount)
  )),
  value_amount        NUMERIC(10,2),
  -- Meaning depends on value_type:
  --   percentage_discount → the percentage (e.g. 10 = 10%)
  --   fixed_gbp_discount  → GBP amount (e.g. 5.00 = £5)
  --   gbp_donation        → GBP amount donated (e.g. 10.00 = £10)
  --   feature_days        → number of days (e.g. 7)
  --   badge_slug          → NULL (badge_slug stored in value_metadata)
  --   content_id          → NULL (id stored in value_metadata)
  --   coupon_code         → NULL (code stored in value_metadata or generated)

  value_metadata      JSONB NOT NULL DEFAULT '{}',
  -- Extra data needed to fulfil the reward:
  --   hub_badge:          { "badge_slug": "generous_heart", "badge_label": "Generous Heart" }
  --   premium_content:    { "content_id": "uuid", "content_title": "..." }
  --   partner_discount:   { "partner_name": "...", "code": "HALAL10", "terms": "..." }
  --   recipe_boost:       {} (no extra data needed)
  --   kitchen_discount:   { "applies_to": "all" | "category", "category": "..." }
  --   charity_convert:    { "charity_id": "uuid | null" }
  --                         if charity_id = null → user picks charity at redemption

  -- Point-to-value rate (informational — computed, not stored)
  -- Display formula: £{(value_amount / points_required * 100).toFixed(2)} per 100pts
  -- e.g. 500pts = £5 → £1.00 per 100pts (standard rate)
  -- e.g. 1200pts = £10 donation → £0.83 per 100pts (charity slightly less — intentional)

  -- Access restrictions
  min_tier_required   TEXT NOT NULL DEFAULT 'bronze'
    CHECK (min_tier_required IN ('bronze','silver','gold','platinum')),
  -- bronze = available to all, platinum = exclusive items

  -- Stock and limits
  max_per_user        INTEGER,        -- NULL = unlimited per user
  max_total           INTEGER,        -- NULL = unlimited stock
  stock_remaining     INTEGER,        -- NULL = unlimited; decremented on each redemption
  redeemed_count      INTEGER NOT NULL DEFAULT 0,

  -- Validity
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until         TIMESTAMPTZ,    -- NULL = never expires

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reward_catalog_updated_at
  BEFORE UPDATE ON reward_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_reward_catalog_category   ON reward_catalog(category);
CREATE INDEX idx_reward_catalog_is_active  ON reward_catalog(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_reward_catalog_tier       ON reward_catalog(min_tier_required);


-- =============================================================================
-- 2. REWARD REDEMPTIONS
-- One row per redemption event — tracks the full lifecycle of each spend
-- =============================================================================

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  catalog_item_id     UUID NOT NULL REFERENCES reward_catalog(id),

  -- Points spent (snapshotted at time of redemption — catalog may change later)
  points_spent        INTEGER NOT NULL CHECK (points_spent > 0),

  -- GBP equivalent at time of redemption (points_spent / 100 * 0.01 * 100)
  gbp_value           NUMERIC(10,2),

  -- Fulfilment lifecycle
  status              TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',    -- points deducted, reward not yet delivered
      'fulfilled',  -- reward successfully delivered
      'failed',     -- delivery failed, points reversed
      'reversed'    -- admin manually reversed (refund scenario)
    )),

  fulfilled_at        TIMESTAMPTZ,
  fulfillment_ref     TEXT,
  -- What was delivered:
  --   kitchen_discount  → discount code (e.g. "REWARD-A3F9")
  --   recipe_boost      → recipe_id that was boosted
  --   hub_badge         → badge_slug that was awarded
  --   charity_convert   → donation_id of the created donation
  --   premium_content   → content_id that was unlocked
  --   partner_discount  → partner coupon code revealed

  fulfillment_data    JSONB,
  -- Full delivery payload — e.g. discount code details, expiry, terms

  -- Reversal tracking
  reversed_at         TIMESTAMPTZ,
  reversal_reason     TEXT,
  reversed_by         UUID REFERENCES profiles(id), -- admin who reversed, or NULL if auto

  -- Link back to the reward_transactions debit row
  -- Allows auditing which ledger entry matches this redemption
  transaction_id      UUID REFERENCES reward_transactions(id),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reward_redemptions_updated_at
  BEFORE UPDATE ON reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_reward_redemptions_user_id      ON reward_redemptions(user_id);
CREATE INDEX idx_reward_redemptions_catalog_item ON reward_redemptions(catalog_item_id);
CREATE INDEX idx_reward_redemptions_status       ON reward_redemptions(status);
CREATE INDEX idx_reward_redemptions_created_at   ON reward_redemptions(created_at DESC);

-- Per-user per-catalog-item count index (used to enforce max_per_user)
CREATE INDEX idx_reward_redemptions_user_catalog
  ON reward_redemptions(user_id, catalog_item_id)
  WHERE status IN ('pending', 'fulfilled');


-- =============================================================================
-- 3. DISCOUNT CODES
-- Generated discount codes linked to redemptions
-- Used for kitchen_discount and partner_discount category items
-- =============================================================================

CREATE TABLE IF NOT EXISTS reward_discount_codes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  redemption_id       UUID NOT NULL REFERENCES reward_redemptions(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  code                TEXT NOT NULL UNIQUE,  -- e.g. "REWARD-A3F9X2"
  discount_type       TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_gbp')),
  discount_value      NUMERIC(10,2) NOT NULL,

  -- Usage tracking
  is_used             BOOLEAN NOT NULL DEFAULT FALSE,
  used_at             TIMESTAMPTZ,
  used_on_order_id    UUID,  -- reference to orders table when used

  -- Validity
  expires_at          TIMESTAMPTZ NOT NULL,   -- e.g. redemption date + 90 days
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reward_discount_codes_code        ON reward_discount_codes(code);
CREATE INDEX idx_reward_discount_codes_user_id     ON reward_discount_codes(user_id);
CREATE INDEX idx_reward_discount_codes_redemption  ON reward_discount_codes(redemption_id);


-- =============================================================================
-- 4. SEED: Default catalog items
-- =============================================================================

INSERT INTO reward_catalog
  (name, description, category, points_required, value_type, value_amount, value_metadata, min_tier_required)
VALUES
  (
    '£5 off your next Kitchen order',
    'Redeem 500 points for £5 off any order in HalalMe Kitchen.',
    'kitchen_discount', 500, 'fixed_gbp_discount', 5.00,
    '{"applies_to": "all"}',
    'bronze'
  ),
  (
    '£10 off your next Kitchen order',
    'Redeem 900 points for £10 off any order in HalalMe Kitchen.',
    'kitchen_discount', 900, 'fixed_gbp_discount', 10.00,
    '{"applies_to": "all"}',
    'silver'
  ),
  (
    '10% off your next Kitchen order',
    'Redeem 1000 points for 10% off your next order.',
    'kitchen_discount', 1000, 'percentage_discount', 10.00,
    '{"applies_to": "all", "max_discount_gbp": 20}',
    'silver'
  ),
  (
    'Feature your recipe for 7 days',
    'Your recipe will appear in the Featured section of the Kitchen discover feed for 7 days.',
    'recipe_boost', 300, 'feature_days', 7.00,
    '{}',
    'bronze'
  ),
  (
    'Donate £5 to a charity of your choice',
    'Convert 600 points into a £5 donation to any verified charity on HalalMe.',
    'charity_convert', 600, 'gbp_donation', 5.00,
    '{"charity_id": null}',
    'bronze'
  ),
  (
    'Donate £10 to a charity of your choice',
    'Convert 1200 points into a £10 donation to any verified charity on HalalMe.',
    'charity_convert', 1200, 'gbp_donation', 10.00,
    '{"charity_id": null}',
    'silver'
  ),
  (
    'Generous Heart Badge',
    'Unlock the exclusive Generous Heart profile badge in HalalMe Hub. Shows your commitment to giving.',
    'hub_badge', 500, 'badge_slug', NULL,
    '{"badge_slug": "generous_heart", "badge_label": "Generous Heart", "badge_icon": "heart"}',
    'bronze'
  ),
  (
    'Gold Donor Badge',
    'Unlock the Gold Donor profile badge — exclusively for Gold tier members.',
    'hub_badge', 2000, 'badge_slug', NULL,
    '{"badge_slug": "gold_donor", "badge_label": "Gold Donor", "badge_icon": "star"}',
    'gold'
  )
ON CONFLICT DO NOTHING;


-- =============================================================================
-- 5. RLS
-- =============================================================================

ALTER TABLE reward_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active catalog items"
  ON reward_catalog FOR SELECT
  USING (
    is_active = TRUE
    AND (valid_until IS NULL OR valid_until > NOW())
    AND valid_from <= NOW()
  );

CREATE POLICY "Admins manage reward catalog"
  ON reward_catalog FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ----

ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own redemptions"
  ON reward_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- Inserts only via service role (API route handles atomic point deduction + redemption)
-- No direct insert policy for authenticated users

CREATE POLICY "Admins can manage all redemptions"
  ON reward_redemptions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ----

ALTER TABLE reward_discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own discount codes"
  ON reward_discount_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage discount codes"
  ON reward_discount_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
