-- =============================================================================
-- 020_fraud_system.sql
-- Risk scoring, fraud flagging, and manual review queue
--
-- How it works:
--   1. At donation creation (API route), a risk_score (0–100) is calculated
--      server-side from multiple signals (account age, amount, velocity, etc.)
--   2. If risk_score >= 70, a donation_flag row is inserted automatically
--      with rewards_delayed = TRUE (points withheld until admin clears it)
--   3. The handle_donation_completed trigger checks for open flags before
--      awarding points — if flagged, it marks the donation complete but
--      holds the reward
--   4. Admin reviews the flag:
--      - Approve → points awarded via service role call
--      - Block   → Stripe refund initiated, points never awarded
--   5. Auto-clear: low-risk flags (score < 75, Stripe = normal) are
--      automatically cleared after 48 hours if no admin action
--
-- Prerequisites: 005_rewards.sql
-- =============================================================================


-- =============================================================================
-- 1. RISK RULES TABLE
-- Admin-configurable thresholds — no deploy needed to tune fraud sensitivity
-- =============================================================================

CREATE TABLE IF NOT EXISTS risk_rules (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_key            TEXT NOT NULL UNIQUE,
  label               TEXT NOT NULL,
  description         TEXT,

  -- The threshold value that triggers this rule (NULL for boolean signals)
  threshold_value     NUMERIC,

  -- How many risk points this rule contributes to the total score (0–100 cap)
  points_added        SMALLINT NOT NULL CHECK (points_added BETWEEN 0 AND 100),

  is_active           BOOLEAN NOT NULL DEFAULT TRUE,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER risk_rules_updated_at
  BEFORE UPDATE ON risk_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default risk rules
INSERT INTO risk_rules (rule_key, label, description, threshold_value, points_added) VALUES
  (
    'account_age_days',
    'New account',
    'Account was created fewer than N days ago',
    7, 25
  ),
  (
    'donation_amount_high',
    'High single donation',
    'Single donation exceeds £N',
    500, 20
  ),
  (
    'new_account_large_gift',
    'New account + large donation',
    'Account < 7 days old AND donation > £100 — replaces individual signals',
    100, 40
  ),
  (
    'velocity_per_hour',
    'High velocity (hourly)',
    'User made more than N donations in the last 1 hour',
    3, 30
  ),
  (
    'velocity_per_day',
    'High velocity (daily)',
    'User made more than N donations in the last 24 hours',
    10, 25
  ),
  (
    'stripe_radar_elevated',
    'Stripe Radar: elevated risk',
    'Stripe Radar returned risk_level = elevated for this payment',
    NULL, 30
  ),
  (
    'stripe_radar_highest',
    'Stripe Radar: highest risk',
    'Stripe Radar returned risk_level = highest for this payment',
    NULL, 60
  ),
  (
    'ip_country_mismatch',
    'IP country mismatch',
    'The request IP address country differs from the user profile location',
    NULL, 15
  ),
  (
    'duplicate_card_across_accounts',
    'Card used on multiple accounts',
    'Same payment method fingerprint seen on more than one user account',
    NULL, 35
  )
ON CONFLICT (rule_key) DO NOTHING;


-- =============================================================================
-- 2. DONATION FLAGS — manual review queue
-- One row per flagged donation
-- =============================================================================

CREATE TABLE IF NOT EXISTS donation_flags (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id         UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,

  -- Who / what created this flag
  flagged_by          TEXT NOT NULL CHECK (flagged_by IN (
    'system',         -- auto-flagged by risk score at create-intent
    'admin',          -- manually flagged by an admin
    'stripe_radar'    -- flagged by Stripe Radar rule (via webhook)
  )),

  -- Primary reason for flagging (most impactful signal)
  flag_type           TEXT NOT NULL CHECK (flag_type IN (
    'high_risk_score',
    'velocity_breach',
    'amount_anomaly',
    'stripe_radar_block',
    'ip_mismatch',
    'new_account_large_gift',
    'duplicate_payment_method',
    'admin_manual'
  )),

  -- Risk score at time of flagging (snapshot)
  risk_score_at_flag  SMALLINT,

  -- Breakdown of which signals fired (for admin UI)
  -- Shape: [{ "rule_key": "account_age_days", "points": 25, "detail": "Account 3 days old" }, ...]
  signal_breakdown    JSONB NOT NULL DEFAULT '[]',

  -- Review status
  status              TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN (
      'pending_review',   -- awaiting admin decision
      'reviewed_safe',    -- admin confirmed legitimate, rewards released
      'reviewed_blocked', -- admin blocked, Stripe refund initiated
      'auto_cleared'      -- auto-cleared after 48h (low risk, Stripe = normal)
    )),

  reviewed_by         UUID REFERENCES profiles(id),
  reviewed_at         TIMESTAMPTZ,
  reviewer_notes      TEXT,

  -- Reward handling while flag is open
  rewards_delayed     BOOLEAN NOT NULL DEFAULT TRUE,
  -- TRUE  = points withheld, trigger skipped reward INSERT
  -- FALSE = points already awarded (e.g. flag added after rewards given — edge case)

  rewards_released_at TIMESTAMPTZ,
  -- Set when admin approves OR auto-clear runs — triggers manual reward INSERT

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER donation_flags_updated_at
  BEFORE UPDATE ON donation_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_donation_flags_donation_id ON donation_flags(donation_id);
CREATE INDEX idx_donation_flags_status      ON donation_flags(status);
CREATE INDEX idx_donation_flags_created_at  ON donation_flags(created_at DESC);

-- Only one open flag per donation (prevent duplicate pending flags)
CREATE UNIQUE INDEX idx_donation_flags_one_open_per_donation
  ON donation_flags(donation_id)
  WHERE status = 'pending_review';


-- =============================================================================
-- 3. RISK SCORE HISTORY
-- Every time risk_score is updated on a donation, log it
-- Allows tracking if Stripe updates the score post-creation (via webhook)
-- =============================================================================

CREATE TABLE IF NOT EXISTS donation_risk_log (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id         UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,

  scored_by           TEXT NOT NULL CHECK (scored_by IN ('api_create', 'stripe_webhook', 'admin_override')),
  previous_score      SMALLINT,
  new_score           SMALLINT NOT NULL,
  signal_breakdown    JSONB NOT NULL DEFAULT '[]',
  notes               TEXT,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_donation_risk_log_donation_id ON donation_risk_log(donation_id);


-- =============================================================================
-- 4. UPDATED handle_donation_completed TRIGGER
-- Replaces the version in 005_rewards.sql
-- Adds fraud gate: checks donation_flags before awarding points
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_donation_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_points            INTEGER;
  v_rule              reward_rules%ROWTYPE;
  v_already_rewarded  BOOLEAN;
  v_is_flagged        BOOLEAN;
BEGIN
  -- Only act on completed transition
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Idempotency: has this donation already generated a reward?
  SELECT EXISTS (
    SELECT 1 FROM reward_transactions
    WHERE source_donation_id = NEW.id AND action = 'donation'
  ) INTO v_already_rewarded;

  IF v_already_rewarded THEN
    RETURN NEW; -- silent no-op
  END IF;

  -- =========================================================
  -- FRAUD GATE
  -- If there is an open flag with rewards_delayed = TRUE,
  -- mark the donation complete but hold the reward.
  -- Admin must manually release points after reviewing the flag.
  -- =========================================================
  SELECT EXISTS (
    SELECT 1 FROM donation_flags
    WHERE donation_id = NEW.id
      AND rewards_delayed = TRUE
      AND status = 'pending_review'
  ) INTO v_is_flagged;

  IF v_is_flagged THEN
    -- Still update charity stats — payment is real even if flagged
    UPDATE charities
    SET raised_amount = raised_amount + NEW.amount,
        donor_count   = donor_count + 1
    WHERE id = NEW.charity_id;
    -- Points withheld — will be awarded when admin clears the flag
    RETURN NEW;
  END IF;

  -- =========================================================
  -- NORMAL REWARD FLOW
  -- =========================================================

  -- Load active donation reward rule
  SELECT * INTO v_rule FROM reward_rules
  WHERE action = 'donation'
    AND is_active = TRUE
    AND (valid_until IS NULL OR valid_until > NOW());

  -- No active rule → still update charity stats, just no points
  IF NOT FOUND THEN
    UPDATE charities
    SET raised_amount = raised_amount + NEW.amount,
        donor_count   = donor_count + 1
    WHERE id = NEW.charity_id;
    RETURN NEW;
  END IF;

  -- Calculate points
  v_points := CASE v_rule.unit
    WHEN 'per_gbp' THEN FLOOR(NEW.amount * v_rule.points_per_unit)::INTEGER
    ELSE v_rule.points_per_unit::INTEGER
  END;

  -- Insert into ledger — ON CONFLICT is the final idempotency safety net
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
  ON CONFLICT ON CONSTRAINT reward_tx_donation_unique DO NOTHING;

  -- Update profile balance (only if insert was not a no-op)
  IF v_points > 0 THEN
    UPDATE profiles
    SET reward_points = reward_points + v_points
    WHERE id = NEW.user_id;
  END IF;

  -- Update charity fundraising stats
  UPDATE charities
  SET raised_amount = raised_amount + NEW.amount,
      donor_count   = donor_count + 1
  WHERE id = NEW.charity_id;

  -- Stamp points_earned on the donation row
  NEW.points_earned := v_points;

  RETURN NEW;
END;
$$;

-- Note: the trigger binding itself (CREATE TRIGGER donation_completed)
-- already exists from 005_rewards.sql — no need to recreate it.
-- CREATE OR REPLACE FUNCTION above replaces only the function body.


-- =============================================================================
-- 5. FUNCTION: release_flagged_rewards(donation_id)
-- Called by admin API when a flag is approved
-- Awards the withheld points that the trigger skipped
-- =============================================================================

CREATE OR REPLACE FUNCTION release_flagged_rewards(p_donation_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_donation          donations%ROWTYPE;
  v_rule              reward_rules%ROWTYPE;
  v_points            INTEGER;
  v_already_rewarded  BOOLEAN;
BEGIN
  -- Load donation
  SELECT * INTO v_donation FROM donations WHERE id = p_donation_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Donation not found');
  END IF;

  IF v_donation.status <> 'completed' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Donation is not completed');
  END IF;

  -- Idempotency
  SELECT EXISTS (
    SELECT 1 FROM reward_transactions
    WHERE source_donation_id = p_donation_id AND action = 'donation'
  ) INTO v_already_rewarded;

  IF v_already_rewarded THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rewards already issued');
  END IF;

  -- Get rule
  SELECT * INTO v_rule FROM reward_rules
  WHERE action = 'donation' AND is_active = TRUE
    AND (valid_until IS NULL OR valid_until > NOW());

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No active donation reward rule');
  END IF;

  -- Calculate points
  v_points := CASE v_rule.unit
    WHEN 'per_gbp' THEN FLOOR(v_donation.amount * v_rule.points_per_unit)::INTEGER
    ELSE v_rule.points_per_unit::INTEGER
  END;

  -- Insert reward
  INSERT INTO reward_transactions (
    user_id, points, action, source_donation_id, description, expires_at
  ) VALUES (
    v_donation.user_id, v_points, 'donation', p_donation_id,
    'Donation reward (released after review): ' || v_donation.amount || ' ' || v_donation.currency,
    NOW() + INTERVAL '2 years'
  )
  ON CONFLICT ON CONSTRAINT reward_tx_donation_unique DO NOTHING;

  -- Update profile balance
  UPDATE profiles
  SET reward_points = reward_points + v_points
  WHERE id = v_donation.user_id;

  -- Update donation row
  UPDATE donations SET points_earned = v_points WHERE id = p_donation_id;

  RETURN jsonb_build_object('success', true, 'points_awarded', v_points);
END;
$$;


-- =============================================================================
-- 6. RLS
-- =============================================================================

ALTER TABLE donation_flags ENABLE ROW LEVEL SECURITY;

-- Users cannot see their own flags (would tip off bad actors)
-- Only admins access this table
CREATE POLICY "Admins manage donation flags"
  ON donation_flags FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ----

ALTER TABLE donation_risk_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read risk log"
  ON donation_risk_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ----

ALTER TABLE risk_rules ENABLE ROW LEVEL SECURITY;

-- Rules are internal — not publicly readable (don't tip off fraudsters)
CREATE POLICY "Admins manage risk rules"
  ON risk_rules FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
