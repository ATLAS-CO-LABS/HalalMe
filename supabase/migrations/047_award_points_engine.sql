-- =============================================================================
-- 047_award_points_engine.sql
-- Points system — Phase 1, Day 2: the generic earning engine
--
-- WHAT & WHY:
--   One reusable function, award_points(), that ANY action can call to grant
--   points. It reads the rule from reward_rules, enforces per-day / lifetime
--   caps, applies a multiplier, writes the ledger row (idempotently), updates
--   both the wallet (reward_points) and the tier-driver (lifetime_points), and
--   stamps the running balance. Every earning action (login, post, recipe,
--   review, donation, ...) becomes "just a caller" of this one engine, so the
--   tricky bits (caps, no double-awarding, dual balance) are written ONCE.
--
--   handle_donation_completed() is refactored to call the engine instead of
--   doing its own inline points math — proving the engine on a live path and
--   removing the duplicated logic.
--
-- SECURITY: award_points is SECURITY DEFINER (it writes points), so execute is
--   revoked from anon/authenticated — only the service role (server-side
--   pointsService) and other definer functions (the donation trigger) may call
--   it. Users can never self-award by calling the RPC directly.
--
-- Prerequisites: 005_rewards.sql, 023_badge_awards.sql, 046_points_foundation.sql
-- =============================================================================


-- =============================================================================
-- 1. Generic idempotency index — one award per (user, action, referenced object)
--    e.g. one 'recipe_upload' per recipe, one 'daily_post' per post.
--    Donations keep their own index (reward_tx_donation_unique on
--    source_donation_id); daily_login keeps reward_tx_daily_login_unique.
-- =============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS reward_tx_action_reference_unique
  ON reward_transactions (user_id, action, reference_id)
  WHERE reference_id IS NOT NULL;


-- =============================================================================
-- 2. award_points() — the engine
--    Returns the number of points actually awarded (0 = no rule / capped /
--    duplicate / non-positive). Never raises on "nothing to award".
-- =============================================================================

CREATE OR REPLACE FUNCTION award_points(
  p_user_id            UUID,
  p_action             TEXT,
  p_reference_id       UUID    DEFAULT NULL,
  p_amount             NUMERIC DEFAULT NULL,   -- for 'per_gbp' rules (spend/donation amount)
  p_description        TEXT    DEFAULT NULL,
  p_multiplier         NUMERIC DEFAULT 1.0,
  p_source_donation_id UUID    DEFAULT NULL    -- donation path only (uses its own index)
)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rule        reward_rules%ROWTYPE;
  v_base        INTEGER;
  v_points      INTEGER;
  v_count       INTEGER;
  v_tx_id       UUID;
  v_new_balance INTEGER;
BEGIN
  -- 1) Load the active rule for this action.
  SELECT * INTO v_rule FROM reward_rules
  WHERE action = p_action
    AND is_active = TRUE
    AND valid_from <= NOW()
    AND (valid_until IS NULL OR valid_until > NOW());

  IF NOT FOUND THEN
    RETURN 0;  -- no configured rule → award nothing (safe no-op)
  END IF;

  -- 2) Base points: flat amount, or points-per-£ for spend/donation rules.
  v_base := CASE v_rule.unit
    WHEN 'per_gbp' THEN FLOOR(COALESCE(p_amount, 0) * v_rule.points_per_unit)::INTEGER
    ELSE v_rule.points_per_unit::INTEGER
  END;

  -- 3) Apply multiplier (default 1.0; tier/seasonal multipliers arrive in Phase 2).
  v_points := FLOOR(v_base * COALESCE(p_multiplier, 1.0))::INTEGER;

  IF v_points <= 0 THEN
    RETURN 0;
  END IF;

  -- 4) Caps — counted as number of award events for this action.
  IF v_rule.max_per_day IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count FROM reward_transactions
    WHERE user_id = p_user_id AND action = p_action
      AND created_date = CURRENT_DATE AND points > 0;
    IF v_count >= v_rule.max_per_day THEN
      RETURN 0;  -- daily cap reached
    END IF;
  END IF;

  IF v_rule.max_lifetime IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count FROM reward_transactions
    WHERE user_id = p_user_id AND action = p_action AND points > 0;
    IF v_count >= v_rule.max_lifetime THEN
      RETURN 0;  -- lifetime cap reached
    END IF;
  END IF;

  -- 5) Insert the ledger row. ON CONFLICT DO NOTHING makes it idempotent via
  --    whichever unique index applies (donation / daily_login / reference).
  INSERT INTO reward_transactions (
    user_id, points, action, reference_id, source_donation_id,
    description, multiplier, status, expires_at
  ) VALUES (
    p_user_id, v_points, p_action, p_reference_id, p_source_donation_id,
    COALESCE(p_description, v_rule.label),
    COALESCE(p_multiplier, 1.0), 'confirmed',
    NOW() + INTERVAL '18 months'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_tx_id;

  -- Duplicate (already awarded) → do NOT touch balances.
  IF v_tx_id IS NULL THEN
    RETURN 0;
  END IF;

  -- 6) Update balances: wallet + lifetime. Tier auto-syncs via the trigger on
  --    lifetime_points.
  UPDATE profiles
  SET reward_points   = reward_points   + v_points,
      lifetime_points = lifetime_points + v_points
  WHERE id = p_user_id
  RETURNING reward_points INTO v_new_balance;

  -- 7) Stamp the running balance onto the ledger row (for the history UI).
  UPDATE reward_transactions
  SET balance_after = v_new_balance
  WHERE id = v_tx_id;

  RETURN v_points;
END;
$$;

-- Lock it down: only the service role (and definer functions like the donation
-- trigger) may execute. Prevents users self-awarding via the RPC.
REVOKE ALL ON FUNCTION award_points(UUID, TEXT, UUID, NUMERIC, TEXT, NUMERIC, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION award_points(UUID, TEXT, UUID, NUMERIC, TEXT, NUMERIC, UUID) TO service_role;


-- =============================================================================
-- 3. Refactor handle_donation_completed() to use the engine.
--    Points math + ledger + balances now live in award_points(). This function
--    keeps only donation-specific work: idempotency guard, charity stats,
--    points_earned stamp, and badge awards.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_donation_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_points           INTEGER;
  v_already_rewarded BOOLEAN;
  v_donation_count   INTEGER;
  v_total_donated    NUMERIC;
  v_new_tier         TEXT;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Idempotency guard — also protects charity stats from double-counting.
  SELECT EXISTS (
    SELECT 1 FROM reward_transactions
    WHERE source_donation_id = NEW.id AND action = 'donation'
  ) INTO v_already_rewarded;

  IF v_already_rewarded THEN
    RETURN NEW;
  END IF;

  -- Award via the generic engine (handles rule lookup, points, ledger,
  -- wallet + lifetime, tier sync). Returns 0 if no active donation rule.
  v_points := award_points(
    p_user_id            => NEW.user_id,
    p_action             => 'donation',
    p_amount             => NEW.amount,
    p_description        => 'Donation of ' || NEW.amount || ' ' || NEW.currency || ' to charity',
    p_source_donation_id => NEW.id
  );

  NEW.points_earned := v_points;

  -- Charity fundraising stats (always, even if no points rule is active).
  UPDATE charities
  SET raised_amount = raised_amount + NEW.amount,
      donor_count   = donor_count   + 1
  WHERE id = NEW.charity_id;

  -- ---------------------------------------------------------------------------
  -- Badges (unchanged) — counts/sums reflect previously completed donations
  -- only, because this BEFORE trigger fires while NEW is still 'pending'.
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
