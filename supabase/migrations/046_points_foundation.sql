-- =============================================================================
-- 046_points_foundation.sql
-- Points system foundation — Phase 1, Day 1
--
-- WHAT & WHY:
--   1. Split spendable wallet (reward_points) from tier-driving lifetime_points,
--      so redeeming points can never demote a user's tier.
--   2. Move tier logic to a SINGLE source keyed off lifetime_points, with the
--      founder-doc thresholds (silver 1000 / gold 5000 / diamond 15000).
--   3. Version the reward_tiers lookup table (previously remote-only, unversioned)
--      and add reserved benefit columns used in Phase 2.
--   4. Extend the ledger with status / multiplier / balance_after (reserved for
--      Phase-2 holds & multipliers and the Day-6 history UI).
--   5. Confirm the refund helper is wallet-only (tier is sticky through refunds).
--
-- SAFETY (verified via MCP against production):
--   15 users, max balance 3,020 pts, distribution 14 bronze / 1 silver.
--   Nobody is >= 5,000, so raising the top threshold 10k -> 15k demotes NOBODY.
--   lifetime_points backfill == reward_points today (no points have ever been
--   spent). "platinum" DB value is kept and displayed as "Diamond" (no enum
--   migration).
--
-- PAIRING: ships together with Day 2 (award_points engine). Do not deploy alone.
--
-- Prerequisites: 002_auth_profiles.sql, 005_rewards.sql,
--                021_helper_functions.sql, 023_badge_awards.sql
-- =============================================================================


-- =============================================================================
-- 1. WALLET vs LIFETIME split
--    reward_points  = spendable wallet (up on earn, DOWN on spend)
--    lifetime_points = only ever increases; the SOLE tier driver
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS lifetime_points INTEGER NOT NULL DEFAULT 0;

-- Backfill from the ledger (sum of everything ever earned). Equals reward_points
-- for every user today because no points have been spent, but SUM(positive
-- ledger) is the correct long-term definition.
UPDATE profiles p
SET lifetime_points = COALESCE((
  SELECT SUM(t.points)
  FROM reward_transactions t
  WHERE t.user_id = p.id AND t.points > 0
), 0);


-- =============================================================================
-- 2. TIER LOGIC — single source of truth, keyed off lifetime_points
--    DB value stays 'platinum' (shown as "Diamond"). Thresholds per doc.
-- =============================================================================

CREATE OR REPLACE FUNCTION sync_reward_tier()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.reward_tier = CASE
    WHEN NEW.lifetime_points >= 15000 THEN 'platinum'  -- displayed "Diamond"
    WHEN NEW.lifetime_points >= 5000  THEN 'gold'
    WHEN NEW.lifetime_points >= 1000  THEN 'silver'
    ELSE 'bronze'
  END;
  RETURN NEW;
END;
$$;

-- Re-point the trigger from reward_points -> lifetime_points.
DROP TRIGGER IF EXISTS profiles_reward_tier ON profiles;
CREATE TRIGGER profiles_reward_tier
  BEFORE UPDATE OF lifetime_points ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_reward_tier();

-- One-time recompute so existing rows match the new rule (explicit write; does
-- not touch lifetime_points, so the trigger above is not involved here).
UPDATE profiles
SET reward_tier = CASE
  WHEN lifetime_points >= 15000 THEN 'platinum'
  WHEN lifetime_points >= 5000  THEN 'gold'
  WHEN lifetime_points >= 1000  THEN 'silver'
  ELSE 'bronze'
END;


-- =============================================================================
-- 3. DONATION HANDLER — feed lifetime_points; drop the duplicate tier block
--    Tier is now owned solely by sync_reward_tier(). Points math is otherwise
--    unchanged; Day 2 refactors this to call the generic award_points() engine.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_donation_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_points           INTEGER;
  v_rule             reward_rules%ROWTYPE;
  v_already_rewarded BOOLEAN;
  v_donation_count   INTEGER;
  v_total_donated    NUMERIC;
  v_new_tier         TEXT;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM reward_transactions
    WHERE source_donation_id = NEW.id AND action = 'donation'
  ) INTO v_already_rewarded;

  IF v_already_rewarded THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_rule FROM reward_rules
  WHERE action    = 'donation'
    AND is_active = TRUE
    AND (valid_until IS NULL OR valid_until > NOW());

  -- No active rule: update charity stats only, award no points.
  IF NOT FOUND THEN
    UPDATE charities
    SET raised_amount = raised_amount + NEW.amount,
        donor_count   = donor_count   + 1
    WHERE id = NEW.charity_id;
    RETURN NEW;
  END IF;

  v_points := CASE v_rule.unit
    WHEN 'per_gbp' THEN FLOOR(NEW.amount * v_rule.points_per_unit)::INTEGER
    ELSE v_rule.points_per_unit::INTEGER
  END;

  INSERT INTO reward_transactions (
    user_id, points, action, source_donation_id, description, expires_at
  ) VALUES (
    NEW.user_id, v_points, 'donation', NEW.id,
    'Donation of ' || NEW.amount || ' ' || NEW.currency || ' to charity',
    NOW() + INTERVAL '2 years'
  )
  ON CONFLICT (source_donation_id)
    WHERE action = 'donation' AND source_donation_id IS NOT NULL
  DO NOTHING;

  -- Update balances: wallet + lifetime. Tier auto-syncs via the trigger on
  -- lifetime_points — no explicit tier write here anymore.
  IF v_points > 0 THEN
    UPDATE profiles
    SET reward_points   = reward_points   + v_points,
        lifetime_points = lifetime_points + v_points
    WHERE id = NEW.user_id;
  END IF;

  UPDATE charities
  SET raised_amount = raised_amount + NEW.amount,
      donor_count   = donor_count   + 1
  WHERE id = NEW.charity_id;

  NEW.points_earned := v_points;

  -- ---------------------------------------------------------------------------
  -- Badges (unchanged): counts/sums reflect previously completed donations only,
  -- because this BEFORE trigger fires while NEW is still 'pending' in the table.
  -- ---------------------------------------------------------------------------
  SELECT COUNT(*) INTO v_donation_count
  FROM donations WHERE user_id = NEW.user_id AND status = 'completed';

  SELECT COALESCE(SUM(amount), 0) INTO v_total_donated
  FROM donations WHERE user_id = NEW.user_id AND status = 'completed';

  SELECT reward_tier INTO v_new_tier FROM profiles WHERE id = NEW.user_id;

  IF v_donation_count = 0 THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'first-giver', 'First donation completed')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  IF v_donation_count = 4 THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'consistent', 'Completed 5 donations')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  IF v_total_donated < 100 AND (v_total_donated + NEW.amount) >= 100 THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'generous', 'Donated £100 in total')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  IF v_new_tier IN ('gold', 'platinum') THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'champion', 'Reached ' || v_new_tier || ' tier')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
-- Trigger binding (donation_completed BEFORE UPDATE ON donations) is preserved
-- by CREATE OR REPLACE FUNCTION — no need to recreate it.


-- =============================================================================
-- 4. REWARD_TIERS — version the table (was remote-only) + reserved benefit cols
--    Only threshold change vs live: platinum 10000 -> 15000 ("Diamond").
--    Benefit values seeded from founder doc §3 (mostly used in Phase 2).
-- =============================================================================

CREATE TABLE IF NOT EXISTS reward_tiers (
  name                 TEXT PRIMARY KEY,
  min_points           INTEGER NOT NULL,
  color                TEXT NOT NULL,
  ai_requests_per_hour INTEGER NOT NULL DEFAULT 10,
  sort_order           INTEGER NOT NULL UNIQUE
);

ALTER TABLE reward_tiers
  ADD COLUMN IF NOT EXISTS multiplier_pct        NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_redemption_points INTEGER      NOT NULL DEFAULT 200,
  ADD COLUMN IF NOT EXISTS monthly_bonus_points  INTEGER      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_deliveries       INTEGER      NOT NULL DEFAULT 0;

INSERT INTO reward_tiers
  (name, min_points, color, ai_requests_per_hour, sort_order,
   multiplier_pct, min_redemption_points, monthly_bonus_points, free_deliveries)
VALUES
  ('bronze',   0,     '#92400E', 10, 1,  0,  200, 0,   0),
  ('silver',   1000,  '#6B7280', 20, 2,  15, 150, 100, 1),
  ('gold',     5000,  '#B45309', 30, 3,  30, 100, 250, 2),
  ('platinum', 15000, '#0E7490', 50, 4,  60, 50,  500, 4)
ON CONFLICT (name) DO UPDATE SET
  min_points            = EXCLUDED.min_points,
  color                 = EXCLUDED.color,
  ai_requests_per_hour  = EXCLUDED.ai_requests_per_hour,
  sort_order            = EXCLUDED.sort_order,
  multiplier_pct        = EXCLUDED.multiplier_pct,
  min_redemption_points = EXCLUDED.min_redemption_points,
  monthly_bonus_points  = EXCLUDED.monthly_bonus_points,
  free_deliveries       = EXCLUDED.free_deliveries;

-- Public read (reads also go through the service role, but keep it explicit for
-- a clean rebuild). Guarded so re-running the migration never errors.
ALTER TABLE reward_tiers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reward_tiers'
      AND policyname = 'Tiers are publicly readable'
  ) THEN
    CREATE POLICY "Tiers are publicly readable"
      ON reward_tiers FOR SELECT USING (true);
  END IF;
END $$;


-- =============================================================================
-- 5. LEDGER — reserved columns for Phase 2 (holds, multipliers) + history UI
-- =============================================================================

ALTER TABLE reward_transactions
  ADD COLUMN IF NOT EXISTS status        TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'held', 'reversed')),
  ADD COLUMN IF NOT EXISTS multiplier    NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS balance_after INTEGER;


-- =============================================================================
-- 6. REFUND SAFETY — decrement_reward_points touches the WALLET only.
--    With tier now driven by lifetime_points, a refund reduces spendable balance
--    but never demotes a tier. (No functional change — documented intent.)
-- =============================================================================

CREATE OR REPLACE FUNCTION decrement_reward_points(p_user_id UUID, p_points INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles
  SET reward_points = GREATEST(0, reward_points - p_points)
  WHERE id = p_user_id;
  -- Intentionally does NOT touch lifetime_points (tier is sticky through refunds).
END;
$$;
