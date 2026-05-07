-- =============================================================================
-- 018_stripe_connect.sql
-- Stripe Connect fields for direct charity payouts
--
-- Why Stripe Connect:
--   Without Connect, HalalMe collects all funds then manually transfers to
--   charities — creating fiduciary liability and FCA regulated activity exposure.
--   With Connect (Express accounts), funds go directly to each charity's bank
--   account and HalalMe takes a platform fee automatically via application_fee_amount.
--   Stripe also handles KYC/AML for each charity as part of Connect onboarding.
--
-- Money flow with Connect:
--   Donor pays £100
--     → £95 → charity's connected Stripe account (direct)
--     → £5  → HalalMe's Stripe account (application_fee_amount)
--   No manual transfers. No HalalMe holding donor funds.
--
-- Prerequisites: 005_rewards.sql
-- =============================================================================


-- =============================================================================
-- 1. EXTEND charities TABLE — Stripe Connect fields
-- =============================================================================

ALTER TABLE charities

  -- Core Connect identifiers
  ADD COLUMN IF NOT EXISTS stripe_account_id         TEXT UNIQUE,
  -- Stripe Connected account ID: acct_xxx
  -- Set when admin triggers onboarding after approving the charity
  -- NULL = not yet onboarded with Stripe

  ADD COLUMN IF NOT EXISTS stripe_onboarding_status  TEXT NOT NULL DEFAULT 'not_started'
    CHECK (stripe_onboarding_status IN (
      'not_started',  -- charity approved but onboarding not initiated
      'pending',      -- onboarding link sent to charity, not yet completed
      'completed',    -- charity completed Stripe onboarding (charges_enabled = TRUE)
      'restricted'    -- Stripe has restricted the account (requires action)
    )),

  -- Capability flags (synced from Stripe account.updated webhook)
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  -- TRUE = charity can receive payments
  -- Donations are BLOCKED until this is TRUE

  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  -- TRUE = Stripe can pay out to charity's bank account

  -- Onboarding link (temporary — expires after 24h, refreshed on demand)
  ADD COLUMN IF NOT EXISTS stripe_onboarding_url     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_url_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_sent_at TIMESTAMPTZ,
  -- Timestamp when the onboarding email was last sent to the charity

  -- Stripe account metadata (synced periodically)
  ADD COLUMN IF NOT EXISTS stripe_country            TEXT,
  -- Country the Connect account is registered in (may differ from charity.country)
  ADD COLUMN IF NOT EXISTS stripe_default_currency   TEXT,
  -- Default settlement currency for this Connect account

  ADD COLUMN IF NOT EXISTS stripe_last_synced_at     TIMESTAMPTZ;
  -- Last time we synced this charity's Stripe account status


-- =============================================================================
-- 2. EXTEND donations TABLE — Connect-specific payment fields
-- =============================================================================

ALTER TABLE donations

  -- The application_fee_amount actually charged by Stripe
  -- Should equal platform_fee_amount, but Stripe is source of truth
  ADD COLUMN IF NOT EXISTS application_fee_amount    NUMERIC(10,2),

  -- Stripe transfer ID to the charity's Connect account
  -- Format: tr_xxx — populated from PaymentIntent's transfer after webhook
  ADD COLUMN IF NOT EXISTS stripe_transfer_id        TEXT UNIQUE,

  -- Stripe charge ID (ch_xxx or py_xxx) — set on payment_intent.succeeded
  -- Needed for issuing refunds directly on the charge
  ADD COLUMN IF NOT EXISTS stripe_charge_id          TEXT UNIQUE;


-- =============================================================================
-- 3. STRIPE CONNECT EVENTS LOG
-- Tracks all Stripe Connect account lifecycle events per charity
-- Separate from webhook_events (which tracks donation payment events)
-- =============================================================================

CREATE TABLE IF NOT EXISTS stripe_connect_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id      UUID REFERENCES charities(id) ON DELETE SET NULL,
  stripe_account_id TEXT,          -- acct_xxx — in case charity row not yet linked

  event_id        TEXT NOT NULL UNIQUE,    -- Stripe event ID (idempotency)
  event_type      TEXT NOT NULL,
  -- Common types:
  --   account.updated
  --   account.application.deauthorized
  --   capability.updated
  --   person.created / person.updated

  payload         JSONB NOT NULL,
  processed_at    TIMESTAMPTZ,
  processing_error TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stripe_connect_events_charity_id
  ON stripe_connect_events(charity_id);

CREATE INDEX idx_stripe_connect_events_event_id
  ON stripe_connect_events(event_id);


-- =============================================================================
-- 4. RLS: stripe_connect_events
-- =============================================================================

ALTER TABLE stripe_connect_events ENABLE ROW LEVEL SECURITY;

-- Service role only (Edge Function uses service key)
-- No policies = no access for anon/authenticated roles
-- Admins access this via admin API, not direct table query

CREATE POLICY "Admins can read connect events"
  ON stripe_connect_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- =============================================================================
-- 5. STRIPE CONNECT STATUS VIEW
-- Used by admin dashboard to see which charities still need onboarding
-- =============================================================================

CREATE OR REPLACE VIEW charity_stripe_status AS
SELECT
  c.id,
  c.name,
  c.slug,
  c.verification_status,
  c.stripe_account_id,
  c.stripe_onboarding_status,
  c.stripe_charges_enabled,
  c.stripe_payouts_enabled,
  c.stripe_onboarding_sent_at,
  c.stripe_last_synced_at,
  CASE
    WHEN c.stripe_charges_enabled = TRUE AND c.stripe_payouts_enabled = TRUE
      THEN 'ready'                    -- can receive donations and payouts
    WHEN c.stripe_onboarding_status = 'completed' AND c.stripe_charges_enabled = FALSE
      THEN 'restricted'               -- completed onboarding but Stripe restricted account
    WHEN c.stripe_onboarding_status = 'pending'
      THEN 'awaiting_onboarding'      -- link sent, charity hasn't completed yet
    WHEN c.stripe_onboarding_status = 'not_started'
      AND c.verification_status = 'approved'
      THEN 'onboarding_not_initiated' -- admin needs to trigger onboarding
    ELSE 'not_ready'
  END AS connect_status,
  -- Whether donations can currently be accepted for this charity
  (
    c.verification_status = 'approved'
    AND c.is_active = TRUE
    AND c.stripe_charges_enabled = TRUE
  ) AS can_accept_donations
FROM charities c;
