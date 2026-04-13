-- =============================================================================
-- 005_rewards.sql
-- charities, donations, reward_transactions
-- =============================================================================

-- =============================================================================
-- charities
-- =============================================================================
CREATE TABLE charities (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT NOT NULL,
  long_description TEXT,
  category         TEXT NOT NULL,
  image_url        TEXT,
  goal_amount      NUMERIC(12,2) NOT NULL CHECK (goal_amount > 0),
  raised_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
  donor_count      INTEGER NOT NULL DEFAULT 0,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- donations
-- =============================================================================
CREATE TABLE donations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id    UUID NOT NULL REFERENCES charities(id) ON DELETE RESTRICT,
  amount        NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency      TEXT NOT NULL DEFAULT 'USD',
  payment_ref   TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  points_earned INTEGER NOT NULL DEFAULT 0,
  message       TEXT,
  is_anonymous  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- reward_transactions  (point ledger — immutable append-only)
-- =============================================================================
CREATE TABLE reward_transactions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- positive = earned, negative = spent
  points       INTEGER NOT NULL,
  -- 'donation' | 'recipe_upload' | 'review' | 'daily_login' | 'referral' | 'spent'
  action       TEXT NOT NULL,
  reference_id UUID,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Trigger: on donation completed → update charity stats + award points
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_donation_completed()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  earned_points INTEGER;
BEGIN
  -- Only fire when status transitions to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN

    -- 10 points per $1 donated
    earned_points := FLOOR(NEW.amount * 10);

    -- Update charity raised amount + donor count
    UPDATE charities
    SET raised_amount = raised_amount + NEW.amount,
        donor_count   = donor_count + 1
    WHERE id = NEW.charity_id;

    -- Record points earned on the donation row
    UPDATE donations SET points_earned = earned_points WHERE id = NEW.id;

    -- Append to reward ledger
    INSERT INTO reward_transactions (user_id, points, action, reference_id, description)
    VALUES (
      NEW.user_id,
      earned_points,
      'donation',
      NEW.id,
      'Points earned from donation of ' || NEW.amount || ' ' || NEW.currency
    );

    -- Update profile points balance
    UPDATE profiles
    SET reward_points = reward_points + earned_points
    WHERE id = NEW.user_id;

  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER donation_completed
  AFTER UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION handle_donation_completed();

-- =============================================================================
-- RLS: charities
-- =============================================================================
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active charities are publicly readable"
  ON charities FOR SELECT USING (is_active = true);

CREATE POLICY "Admins manage charities"
  ON charities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- RLS: donations
-- =============================================================================
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own donations"
  ON donations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can donate"
  ON donations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Status updates handled by service role (payment webhook)

-- =============================================================================
-- RLS: reward_transactions
-- =============================================================================
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reward transactions"
  ON reward_transactions FOR SELECT USING (auth.uid() = user_id);

-- Inserts only via triggers (SECURITY DEFINER) — no direct user INSERT policy
