-- =============================================================================
-- 052_redeem_reward_engine.sql
-- Points system — Phase 1, Day 5 (part 2): the redemption engine
--
-- Mirror image of award_points() (047): one atomic, SECURITY DEFINER RPC that
-- validates a spend, deducts the WALLET ONLY (never lifetime_points — tier
-- can't be lost by spending, per the Day 1 wallet/lifetime split), and fulfils
-- the specific Door A perk. p_target_id is the recipe/post being boosted —
-- required for recipe_boost/hub_post_boost, ignored otherwise.
--
-- Prerequisites: 051_redemption_schema.sql, 046_points_foundation.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION redeem_reward(
  p_user_id         UUID,
  p_catalog_item_id UUID,
  p_target_id       UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_item          reward_catalog%ROWTYPE;
  v_balance       INTEGER;
  v_tier          TEXT;
  v_tier_rank     INTEGER;
  v_item_rank     INTEGER;
  v_recent_count  INTEGER;
  v_owned_count   INTEGER;
  v_balance_after INTEGER;
  v_tx_id         UUID;
  v_redemption_id UUID;
BEGIN
  -- Lock the catalog row and the wallet row for the duration of this redemption.
  SELECT * INTO v_item FROM reward_catalog WHERE id = p_catalog_item_id FOR UPDATE;
  IF NOT FOUND OR NOT v_item.is_active THEN
    RAISE EXCEPTION 'Item not available';
  END IF;

  SELECT reward_points, reward_tier INTO v_balance, v_tier
  FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  v_tier_rank := CASE v_tier WHEN 'platinum' THEN 3 WHEN 'gold' THEN 2 WHEN 'silver' THEN 1 ELSE 0 END;
  v_item_rank := CASE v_item.min_tier_required WHEN 'platinum' THEN 3 WHEN 'gold' THEN 2 WHEN 'silver' THEN 1 ELSE 0 END;
  IF v_tier_rank < v_item_rank THEN
    RAISE EXCEPTION 'Tier too low for this item';
  END IF;

  IF v_balance < v_item.points_required THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Velocity cap: max 3 redemptions per rolling 24h, regardless of item.
  SELECT COUNT(*) INTO v_recent_count
  FROM reward_redemptions
  WHERE user_id = p_user_id AND created_at > NOW() - INTERVAL '24 hours';
  IF v_recent_count >= 3 THEN
    RAISE EXCEPTION 'Redemption limit reached — try again later';
  END IF;

  -- Per-item lifetime cap (flair/AI power-up = 1; boosts = unlimited).
  IF v_item.max_per_user IS NOT NULL THEN
    SELECT COUNT(*) INTO v_owned_count
    FROM reward_redemptions
    WHERE user_id = p_user_id AND catalog_item_id = p_catalog_item_id
      AND status IN ('pending', 'fulfilled');
    IF v_owned_count >= v_item.max_per_user THEN
      RAISE EXCEPTION 'Already redeemed the max allowed for this item';
    END IF;
  END IF;

  IF v_item.stock_remaining IS NOT NULL AND v_item.stock_remaining <= 0 THEN
    RAISE EXCEPTION 'Out of stock';
  END IF;

  -- Category-specific validation.
  IF v_item.category = 'recipe_boost' THEN
    IF p_target_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM recipes WHERE id = p_target_id AND user_id = p_user_id
    ) THEN
      RAISE EXCEPTION 'Invalid recipe';
    END IF;
  ELSIF v_item.category = 'hub_post_boost' THEN
    IF p_target_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM posts WHERE id = p_target_id AND user_id = p_user_id
    ) THEN
      RAISE EXCEPTION 'Invalid post';
    END IF;
  ELSIF v_item.category = 'ai_power_up' THEN
    IF EXISTS (
      SELECT 1 FROM ai_limit_boosts WHERE user_id = p_user_id AND expires_at > NOW()
    ) THEN
      RAISE EXCEPTION 'AI power-up already active';
    END IF;
  END IF;

  -- Deduct WALLET ONLY — lifetime_points (tier) is untouched.
  v_balance_after := v_balance - v_item.points_required;
  UPDATE profiles SET reward_points = v_balance_after WHERE id = p_user_id;

  INSERT INTO reward_transactions (user_id, action, points, status, balance_after, description, reference_id)
  VALUES (p_user_id, 'redeem', -v_item.points_required, 'confirmed', v_balance_after,
          'Redeemed: ' || v_item.name, p_catalog_item_id)
  RETURNING id INTO v_tx_id;

  INSERT INTO reward_redemptions (user_id, catalog_item_id, points_spent, status, target_id, transaction_id)
  VALUES (p_user_id, p_catalog_item_id, v_item.points_required, 'pending', p_target_id, v_tx_id)
  RETURNING id INTO v_redemption_id;

  UPDATE reward_catalog
  SET redeemed_count = redeemed_count + 1,
      stock_remaining = CASE WHEN stock_remaining IS NOT NULL THEN stock_remaining - 1 ELSE NULL END
  WHERE id = p_catalog_item_id;

  -- Fulfil.
  CASE v_item.category
    WHEN 'profile_flair' THEN
      UPDATE profiles SET profile_flair = v_item.value_metadata->>'flair_slug' WHERE id = p_user_id;

    WHEN 'recipe_boost' THEN
      UPDATE recipes
      SET is_featured = TRUE, featured_until = NOW() + (v_item.value_amount || ' days')::INTERVAL
      WHERE id = p_target_id;

    WHEN 'hub_post_boost' THEN
      UPDATE posts
      SET is_featured = TRUE, featured_until = NOW() + (v_item.value_amount || ' days')::INTERVAL
      WHERE id = p_target_id;

    WHEN 'ai_power_up' THEN
      INSERT INTO ai_limit_boosts (user_id, boosted_limit, expires_at)
      VALUES (p_user_id, v_item.value_amount::INTEGER, NOW() + ((v_item.value_metadata->>'duration_hours')::INTEGER || ' hours')::INTERVAL)
      ON CONFLICT (user_id) DO UPDATE
        SET boosted_limit = EXCLUDED.boosted_limit, expires_at = EXCLUDED.expires_at;
  END CASE;

  UPDATE reward_redemptions SET status = 'fulfilled', fulfilled_at = NOW() WHERE id = v_redemption_id;

  RETURN v_redemption_id;
END;
$$;

REVOKE ALL ON FUNCTION redeem_reward(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION redeem_reward(UUID, UUID, UUID) TO service_role;
