-- =============================================================================
-- 023_badge_awards.sql
-- Extends handle_donation_completed() to award badges automatically.
--
-- This is a BEFORE UPDATE trigger so the current donation row still
-- shows status='pending' in the table — badge conditions account for this:
--   - donation counts/totals query previously completed rows only
--   - champion check reads the profile tier AFTER the points update
--     (profile UPDATE within same tx is visible to subsequent SELECTs)
--
-- Badges awarded:
--   first-giver  → this is the user's first completed donation
--   consistent   → this is the user's 5th completed donation
--   generous     → previous total < £100, this donation pushes it to >= £100
--   champion     → profile tier is gold or platinum after points are awarded
--
-- ON CONFLICT DO NOTHING handles idempotency via the unique constraint
-- on (user_id, badge_slug) in user_badges.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_donation_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_points          INTEGER;
  v_rule            reward_rules%ROWTYPE;
  v_already_rewarded BOOLEAN;
  v_donation_count  INTEGER;
  v_total_donated   NUMERIC;
  v_new_tier        TEXT;
BEGIN
  -- Only act on the pending → completed transition
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Idempotency: has this donation already generated a reward transaction?
  SELECT EXISTS (
    SELECT 1 FROM reward_transactions
    WHERE source_donation_id = NEW.id AND action = 'donation'
  ) INTO v_already_rewarded;

  IF v_already_rewarded THEN
    RETURN NEW;
  END IF;

  -- Load the active donation reward rule
  SELECT * INTO v_rule FROM reward_rules
  WHERE action    = 'donation'
    AND is_active = TRUE
    AND (valid_until IS NULL OR valid_until > NOW());

  -- No active rule → update charity stats only, award no points
  IF NOT FOUND THEN
    UPDATE charities
    SET raised_amount = raised_amount + NEW.amount,
        donor_count   = donor_count   + 1
    WHERE id = NEW.charity_id;
    RETURN NEW;
  END IF;

  -- Calculate points
  v_points := CASE v_rule.unit
    WHEN 'per_gbp' THEN FLOOR(NEW.amount * v_rule.points_per_unit)::INTEGER
    ELSE v_rule.points_per_unit::INTEGER
  END;

  -- Insert into ledger
  INSERT INTO reward_transactions (
    user_id,
    points,
    action,
    source_donation_id,
    description,
    expires_at
  ) VALUES (
    NEW.user_id,
    v_points,
    'donation',
    NEW.id,
    'Donation of ' || NEW.amount || ' ' || NEW.currency || ' to charity',
    NOW() + INTERVAL '2 years'
  )
  ON CONFLICT (source_donation_id)
    WHERE action = 'donation' AND source_donation_id IS NOT NULL
  DO NOTHING;

  -- Update profile points balance and tier
  IF v_points > 0 THEN
    UPDATE profiles
    SET reward_points = reward_points + v_points
    WHERE id = NEW.user_id;

    UPDATE profiles
    SET reward_tier = CASE
      WHEN reward_points >= 10000 THEN 'platinum'
      WHEN reward_points >= 5000  THEN 'gold'
      WHEN reward_points >= 1000  THEN 'silver'
      ELSE 'bronze'
    END
    WHERE id = NEW.user_id;
  END IF;

  -- Update charity fundraising stats
  UPDATE charities
  SET raised_amount = raised_amount + NEW.amount,
      donor_count   = donor_count   + 1
  WHERE id = NEW.charity_id;

  -- Stamp points_earned on the donation row itself
  NEW.points_earned := v_points;

  -- ---------------------------------------------------------------------------
  -- Badge awarding
  -- BEFORE trigger: current row is still pending in the table, so counts and
  -- sums reflect only previously completed donations.
  -- ---------------------------------------------------------------------------

  -- How many completed donations did this user have before this one?
  SELECT COUNT(*) INTO v_donation_count
  FROM donations
  WHERE user_id = NEW.user_id AND status = 'completed';

  -- What was their total donated before this donation?
  SELECT COALESCE(SUM(amount), 0) INTO v_total_donated
  FROM donations
  WHERE user_id = NEW.user_id AND status = 'completed';

  -- Read the tier that was just written above (same tx, visible immediately)
  SELECT reward_tier INTO v_new_tier
  FROM profiles
  WHERE id = NEW.user_id;

  -- first-giver: no previous completed donations
  IF v_donation_count = 0 THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'first-giver', 'First donation completed')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  -- consistent: 4 previous completed donations, this is the 5th
  IF v_donation_count = 4 THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'consistent', 'Completed 5 donations')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  -- generous: previous total was under £100, this donation crosses the threshold
  IF v_total_donated < 100 AND (v_total_donated + NEW.amount) >= 100 THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'generous', 'Donated £100 in total')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  -- champion: tier is gold or platinum after this donation's points were applied
  IF v_new_tier IN ('gold', 'platinum') THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'champion', 'Reached ' || v_new_tier || ' tier')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
