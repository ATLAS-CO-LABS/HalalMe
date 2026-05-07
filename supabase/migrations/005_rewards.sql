-- =============================================================================
-- 005_rewards.sql
-- Charity, Donation, and Rewards system — production-grade
--
-- Tables:
--   charities             — approved charity directory
--   charity_applications  — onboarding + admin review workflow
--   donations             — payment records (Stripe-backed)
--   reward_rules          — admin-configurable points formulas
--   reward_transactions   — immutable points ledger
--   webhook_events        — idempotent Stripe webhook log
--
-- Prerequisites: 001_foundation.sql, 002_auth_profiles.sql
-- =============================================================================


-- =============================================================================
-- 1. CHARITIES
-- =============================================================================

CREATE TABLE charities (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Display
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE NOT NULL,
  description           TEXT NOT NULL,
  long_description      TEXT,
  category              TEXT NOT NULL,
  image_url             TEXT,

  -- Legal identity
  legal_name            TEXT,
  registration_number   TEXT,
  country               TEXT NOT NULL DEFAULT 'GB',
  charity_type          TEXT CHECK (charity_type IN ('ngo','foundation','mosque','humanitarian','other')),

  -- Verification workflow
  verification_status   TEXT NOT NULL DEFAULT 'pending'
                          CHECK (verification_status IN ('pending','under_review','approved','rejected','suspended')),
  verified_at           TIMESTAMPTZ,
  verified_by           UUID REFERENCES profiles(id),
  rejection_reason      TEXT,
  submitted_by          UUID REFERENCES profiles(id),

  -- Documents (Supabase Storage paths — not public URLs)
  -- Shape: [{"type": "registration", "path": "charity-documents/abc/reg.pdf"}, ...]
  document_paths        JSONB NOT NULL DEFAULT '[]',

  -- Contact
  contact_email         TEXT,
  contact_phone         TEXT,
  website_url           TEXT,

  -- Donation settings
  goal_amount           NUMERIC(12,2) NOT NULL CHECK (goal_amount > 0),
  raised_amount         NUMERIC(12,2) NOT NULL DEFAULT 0,
  donor_count           INTEGER NOT NULL DEFAULT 0,
  minimum_donation      NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  platform_fee_pct      NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  currency              TEXT NOT NULL DEFAULT 'GBP',

  -- Islamic giving classification
  is_zakat_eligible     BOOLEAN NOT NULL DEFAULT FALSE,

  -- Flags
  is_featured           BOOLEAN NOT NULL DEFAULT FALSE,
  is_active             BOOLEAN NOT NULL DEFAULT FALSE, -- only TRUE after approval

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Same charity cannot register twice in same country
ALTER TABLE charities
  ADD CONSTRAINT charities_reg_country_unique
  UNIQUE (registration_number, country);

CREATE TRIGGER charities_updated_at
  BEFORE UPDATE ON charities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- 2. CHARITY APPLICATIONS
-- Decoupled from charities — admins review here, then create the charity row
-- =============================================================================

CREATE TABLE charity_applications (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Proposed charity details
  legal_name            TEXT NOT NULL,
  display_name          TEXT NOT NULL,
  registration_number   TEXT NOT NULL,
  country               TEXT NOT NULL,
  charity_type          TEXT NOT NULL,
  category              TEXT NOT NULL,
  description           TEXT NOT NULL,
  contact_email         TEXT NOT NULL,
  contact_phone         TEXT,
  website_url           TEXT,
  is_zakat_eligible     BOOLEAN NOT NULL DEFAULT FALSE,

  -- Documents uploaded to 'charity-documents' Storage bucket
  -- Shape: [{"type": "registration|bank|id", "path": "charity-documents/uuid/file.pdf", "name": "reg.pdf"}]
  document_paths        JSONB NOT NULL DEFAULT '[]',

  -- Admin review
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','under_review','approved','rejected')),
  reviewed_by           UUID REFERENCES profiles(id),
  reviewed_at           TIMESTAMPTZ,
  reviewer_notes        TEXT,

  -- If approved, link to the created charity row
  charity_id            UUID REFERENCES charities(id),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER charity_applications_updated_at
  BEFORE UPDATE ON charity_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- 3. REWARD RULES
-- Admin-configurable — no code deploy needed to change point values
-- =============================================================================

CREATE TABLE reward_rules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action          TEXT NOT NULL UNIQUE,
  -- 'donation' | 'recipe_upload' | 'review' | 'daily_login' | 'referral' | 'spent'

  label           TEXT NOT NULL,              -- human-readable e.g. "Donation reward"
  points_per_unit NUMERIC(10,4) NOT NULL,     -- e.g. 10 = 10 pts per £1 donated, 50 = fixed 50 pts
  unit            TEXT NOT NULL DEFAULT 'fixed',
  -- 'fixed'    → points_per_unit is the flat award
  -- 'per_gbp'  → points_per_unit × floor(amount) — used for donations

  max_per_day     INTEGER,                    -- NULL = unlimited per day
  max_lifetime    INTEGER,                    -- NULL = unlimited lifetime per user
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until     TIMESTAMPTZ,                -- NULL = no expiry

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER reward_rules_updated_at
  BEFORE UPDATE ON reward_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed default rules
INSERT INTO reward_rules (action, label, points_per_unit, unit, max_per_day, max_lifetime) VALUES
  ('donation',       'Donation reward',         10,  'per_gbp', NULL, NULL),
  ('recipe_upload',  'Recipe upload reward',    50,  'fixed',   1,    NULL),
  ('review',         'Recipe review reward',    25,  'fixed',   3,    NULL),
  ('daily_login',    'Daily login reward',      10,  'fixed',   1,    NULL),
  ('referral',       'Referral reward',         200, 'fixed',   NULL, NULL)
ON CONFLICT (action) DO NOTHING;


-- =============================================================================
-- 4. DONATIONS
-- One row per payment attempt. Status driven by Stripe webhook only.
-- =============================================================================

CREATE TABLE donations (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id            UUID NOT NULL REFERENCES charities(id) ON DELETE RESTRICT,

  -- Amount
  amount                NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  currency              TEXT NOT NULL DEFAULT 'GBP',
  platform_fee_amount   NUMERIC(10,2),           -- calculated at creation
  stripe_fee_amount     NUMERIC(10,2),            -- populated by webhook
  net_amount            NUMERIC(10,2),            -- amount - platform_fee - stripe_fee

  -- Payment provider
  payment_provider      TEXT NOT NULL DEFAULT 'stripe'
                          CHECK (payment_provider IN ('stripe','manual')),
  payment_intent_id     TEXT UNIQUE,              -- Stripe PaymentIntent ID (pi_xxx)
  payment_method_type   TEXT,                     -- 'card', 'apple_pay', etc.
  payment_ref           TEXT,                     -- Stripe charge ID (ch_xxx), set on completion

  -- Idempotency — prevent double-submission from the client
  idempotency_key       TEXT UNIQUE NOT NULL,

  -- Status — only webhook (service role) transitions to completed/failed
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','completed','failed','refunded')),

  -- Rewards
  points_earned         INTEGER NOT NULL DEFAULT 0,

  -- Donor options
  message               TEXT,
  is_anonymous          BOOLEAN NOT NULL DEFAULT FALSE,

  -- Receipt
  receipt_url           TEXT,
  receipt_sent_at       TIMESTAMPTZ,

  -- Refund tracking
  refunded_at           TIMESTAMPTZ,
  refund_ref            TEXT,

  -- Fraud signals (populated server-side, never from client)
  ip_address            INET,
  user_agent            TEXT,
  risk_score            SMALLINT NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =============================================================================
-- 5. REWARD TRANSACTIONS  (immutable append-only ledger)
-- positive points = earned, negative points = spent
-- =============================================================================

CREATE TABLE reward_transactions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  points                INTEGER NOT NULL,         -- positive = earned, negative = spent
  action                TEXT NOT NULL,            -- matches reward_rules.action
  source_donation_id    UUID REFERENCES donations(id),
  reference_id          UUID,                     -- generic ref (recipe_id, etc.)
  description           TEXT,

  -- Expiry
  expires_at            TIMESTAMPTZ,              -- NULL = never expires
  is_expired            BOOLEAN NOT NULL DEFAULT FALSE,

  -- Redemption tracking
  redeemed_at           TIMESTAMPTZ,
  redemption_ref        TEXT,                     -- e.g. order ID where points were used

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_date          DATE NOT NULL DEFAULT CURRENT_DATE
  -- Separate DATE column used for the daily_login unique index.
  -- DATE(created_at::timestamptz) is STABLE not IMMUTABLE in PostgreSQL,
  -- so it cannot be used in an index expression. A plain DATE column can.
  -- NOTE: no updated_at — this table is append-only, rows never updated
);

-- =============================================================================
-- Idempotency constraints on reward_transactions
-- Prevents double-awarding even if triggers fire twice
-- =============================================================================

-- One donation → one reward entry, ever
CREATE UNIQUE INDEX reward_tx_donation_unique
  ON reward_transactions (source_donation_id)
  WHERE action = 'donation' AND source_donation_id IS NOT NULL;

-- One daily_login reward per user per calendar day
-- Uses created_date (plain DATE column) instead of DATE(created_at::timestamptz)
-- because timestamptz→date conversion is STABLE not IMMUTABLE in PostgreSQL
CREATE UNIQUE INDEX reward_tx_daily_login_unique
  ON reward_transactions (user_id, action, created_date)
  WHERE action = 'daily_login';


-- =============================================================================
-- 6. WEBHOOK EVENTS  (Stripe event deduplication log)
-- =============================================================================

CREATE TABLE webhook_events (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider              TEXT NOT NULL DEFAULT 'stripe',
  event_id              TEXT NOT NULL UNIQUE,     -- Stripe event ID (evt_xxx) — idempotency key
  event_type            TEXT NOT NULL,            -- e.g. 'payment_intent.succeeded'
  payload               JSONB NOT NULL,
  processed_at          TIMESTAMPTZ,              -- NULL = not yet processed
  processing_error      TEXT,                     -- NULL = no error
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- 7. STORAGE BUCKET — charity-documents
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'charity-documents',
  'charity-documents',
  false,        -- private — access via signed URLs only
  10485760,     -- 10 MB max per file
  ARRAY['application/pdf','image/jpeg','image/png','image/webp']
)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 8. TRIGGER: handle_donation_completed
-- Fires when donation.status transitions to 'completed'
-- Idempotent: safe to call multiple times for the same donation
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_donation_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_points          INTEGER;
  v_rule            reward_rules%ROWTYPE;
  v_already_rewarded BOOLEAN;
BEGIN
  -- Only act on completed transition
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  -- Check idempotency: has this donation already generated a reward?
  SELECT EXISTS (
    SELECT 1 FROM reward_transactions
    WHERE source_donation_id = NEW.id AND action = 'donation'
  ) INTO v_already_rewarded;

  IF v_already_rewarded THEN
    RETURN NEW; -- silent no-op, safe re-entry
  END IF;

  -- Load the donation reward rule
  SELECT * INTO v_rule
  FROM reward_rules
  WHERE action = 'donation' AND is_active = TRUE
    AND (valid_until IS NULL OR valid_until > NOW());

  -- No active rule → no points, but donation still completes
  IF NOT FOUND THEN
    -- Still update charity stats
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

  -- Insert into ledger (ON CONFLICT = idempotency safety net)
  INSERT INTO reward_transactions (
    user_id, points, action, source_donation_id, description, expires_at
  ) VALUES (
    NEW.user_id,
    v_points,
    'donation',
    NEW.id,
    'Donation of ' || NEW.amount || ' ' || NEW.currency || ' to charity',
    NOW() + INTERVAL '2 years'
  )
  ON CONFLICT ON CONSTRAINT reward_tx_donation_unique DO NOTHING;

  -- Only update profile if insert succeeded (points > 0)
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

  -- Stamp points_earned on the donation row itself
  NEW.points_earned := v_points;

  RETURN NEW;
END;
$$;

CREATE TRIGGER donation_completed
  BEFORE UPDATE ON donations
  FOR EACH ROW EXECUTE FUNCTION handle_donation_completed();
-- BEFORE UPDATE so NEW.points_earned is stamped in the same row update


-- =============================================================================
-- 9. RLS: charities
-- =============================================================================

ALTER TABLE charities ENABLE ROW LEVEL SECURITY;

-- Only approved, active charities are visible to the public
CREATE POLICY "Approved charities are publicly readable"
  ON charities FOR SELECT
  USING (is_active = TRUE AND verification_status = 'approved');

-- Admins can read all charities regardless of status
CREATE POLICY "Admins can read all charities"
  ON charities FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Only admins can insert/update/delete
CREATE POLICY "Admins manage charities"
  ON charities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- =============================================================================
-- 10. RLS: charity_applications
-- =============================================================================

ALTER TABLE charity_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Applicants can read own applications"
  ON charity_applications FOR SELECT
  USING (auth.uid() = applicant_user_id);

CREATE POLICY "Authenticated users can submit applications"
  ON charity_applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = applicant_user_id);

CREATE POLICY "Admins can read and manage all applications"
  ON charity_applications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- =============================================================================
-- 11. RLS: donations
-- =============================================================================

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own donations"
  ON donations FOR SELECT
  USING (auth.uid() = user_id);

-- Clients can insert pending donations (status defaults to 'pending')
CREATE POLICY "Authenticated users can create donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Status transitions (pending→completed/failed/refunded) ONLY via service role (webhook)
-- No UPDATE policy for authenticated role intentionally

CREATE POLICY "Admins can read all donations"
  ON donations FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- =============================================================================
-- 12. RLS: reward_rules
-- =============================================================================

ALTER TABLE reward_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active reward rules"
  ON reward_rules FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins manage reward rules"
  ON reward_rules FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- =============================================================================
-- 13. RLS: reward_transactions
-- =============================================================================

ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reward transactions"
  ON reward_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT policy for authenticated role — inserts happen only via:
--   a) handle_donation_completed trigger (SECURITY DEFINER)
--   b) service role (other reward actions)


-- =============================================================================
-- 14. RLS: webhook_events
-- =============================================================================

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Accessible only via service role (Supabase Edge Function uses service key)
-- No policies = no access for anon/authenticated roles


-- =============================================================================
-- 15. RLS: storage — charity-documents
-- =============================================================================

-- Applicants can upload documents for their own applications
CREATE POLICY "Applicants can upload charity documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'charity-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Applicants can read their own documents
CREATE POLICY "Applicants can read own charity documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'charity-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can read all charity documents (for review)
CREATE POLICY "Admins can read all charity documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'charity-documents'
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- =============================================================================
-- 16. INDEXES — rewards module
-- =============================================================================

-- charities
CREATE INDEX idx_charities_verification_status ON charities(verification_status);
CREATE INDEX idx_charities_category            ON charities(category);
CREATE INDEX idx_charities_is_featured         ON charities(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_charities_is_active           ON charities(is_active, verification_status);

-- charity_applications
CREATE INDEX idx_charity_applications_status          ON charity_applications(status);
CREATE INDEX idx_charity_applications_applicant       ON charity_applications(applicant_user_id);

-- donations
CREATE INDEX idx_donations_user_id            ON donations(user_id);
CREATE INDEX idx_donations_charity_id         ON donations(charity_id);
CREATE INDEX idx_donations_status             ON donations(status);
CREATE INDEX idx_donations_payment_intent_id  ON donations(payment_intent_id);
CREATE INDEX idx_donations_created_at         ON donations(created_at DESC);

-- reward_transactions
CREATE INDEX idx_reward_tx_user_id            ON reward_transactions(user_id);
CREATE INDEX idx_reward_tx_action             ON reward_transactions(action);
CREATE INDEX idx_reward_tx_created_at         ON reward_transactions(created_at DESC);
CREATE INDEX idx_reward_tx_expires_at         ON reward_transactions(expires_at) WHERE expires_at IS NOT NULL;

-- webhook_events
CREATE INDEX idx_webhook_events_event_id      ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_processed_at  ON webhook_events(processed_at) WHERE processed_at IS NULL;
