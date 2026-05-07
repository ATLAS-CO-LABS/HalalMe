-- =============================================================================
-- 022_fix_reward_tx_conflict.sql  (Phase 1)
--
-- Problem: 005_rewards.sql creates handle_donation_completed() using
--   ON CONFLICT ON CONSTRAINT reward_tx_donation_unique
-- but reward_tx_donation_unique is a CREATE UNIQUE INDEX, not a named
-- CONSTRAINT. PostgreSQL only allows ON CONFLICT ON CONSTRAINT with actual
-- ALTER TABLE ... ADD CONSTRAINT style constraints, not plain indexes.
-- This crashes the trigger on every donation completion.
--
-- Fix: rewrite the trigger to use the column+predicate form:
--   ON CONFLICT (source_donation_id)
--     WHERE action = 'donation' AND source_donation_id IS NOT NULL
--   DO NOTHING
-- which correctly matches the existing partial unique index.
--
-- Phase 2 note: 020_fraud_system.sql will replace this function again
-- and add the fraud gate. When 022 and 020 are both applied, 020 must
-- also use the fixed ON CONFLICT syntax — a separate 022b migration
-- will handle that at Phase 2 time.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_donation_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_points           INTEGER;
  v_rule             reward_rules%ROWTYPE;
  v_already_rewarded BOOLEAN;
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
    RETURN NEW; -- silent no-op
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

  -- Insert into ledger using column+predicate form to match the partial unique index
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

  -- Update profile points balance and tier (only if the insert was not a no-op)
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

  RETURN NEW;
END;
$$;
