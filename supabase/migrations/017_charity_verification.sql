-- =============================================================================
-- 017_charity_verification.sql
-- Multi-level charity verification system
--
-- Adds:
--   - verification_level (0–3) on charities
--   - verification_score (0–100) composite trust score
--   - External API fields (Charity Commission, Companies House, GuideStar)
--   - charity_verification_log — immutable audit trail of every status change
--   - Extended charity_applications fields for document review tracking
--
-- Prerequisites: 005_rewards.sql
-- =============================================================================


-- =============================================================================
-- 1. EXTEND charities TABLE
-- =============================================================================

ALTER TABLE charities

  -- Verification level (0–3 scale)
  ADD COLUMN IF NOT EXISTS verification_level        SMALLINT NOT NULL DEFAULT 0
    CHECK (verification_level BETWEEN 0 AND 3),
  -- 0 = unverified          (just created, no documents)
  -- 1 = documents_submitted (applicant uploaded PDFs, awaiting admin review)
  -- 2 = manually_verified   (admin reviewed + confirmed documents are genuine)
  -- 3 = externally_verified (cross-checked against a government/external API)

  -- Composite trust score (0–100)
  -- Calculated server-side, stored here for fast querying
  -- Scoring breakdown:
  --   +20 registration_number present
  --   +20 at least one document uploaded
  --   +25 admin manually reviewed documents
  --   +25 external API returned a confirmed match
  --   +10 bank account proof document uploaded
  ADD COLUMN IF NOT EXISTS verification_score        SMALLINT NOT NULL DEFAULT 0
    CHECK (verification_score BETWEEN 0 AND 100),

  -- Which source was used for the highest verification level achieved
  ADD COLUMN IF NOT EXISTS verification_source       TEXT
    CHECK (verification_source IN (
      'admin_manual',       -- admin reviewed documents directly
      'charity_commission', -- UK Charity Commission API
      'companies_house',    -- UK Companies House API
      'guidestar',          -- US GuideStar / Candid API
      'manual_external'     -- admin verified via external source without API
    )),

  -- Timestamps
  ADD COLUMN IF NOT EXISTS last_verified_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_expires_at   TIMESTAMPTZ,
  -- Verification re-check required after this date.
  -- Set to: last_verified_at + 1 year (for level 2), + 2 years (for level 3)
  -- A pg_cron job (future) can downgrade level if expired + no re-check

  -- External API fields
  ADD COLUMN IF NOT EXISTS external_ref              TEXT,
  -- The unique identifier returned by the external API
  -- e.g. UK Charity Commission registered charity number
  -- e.g. US EIN (Employer Identification Number) from GuideStar

  ADD COLUMN IF NOT EXISTS external_verified_at      TIMESTAMPTZ,

  ADD COLUMN IF NOT EXISTS external_api_response     JSONB;
  -- Raw API response stored for audit trail
  -- NEVER exposed to users — admin only, via signed admin API
  -- Allows re-verification without re-calling external API


-- =============================================================================
-- 2. EXTEND charity_applications TABLE
-- =============================================================================

ALTER TABLE charity_applications

  -- Track when admin finished reviewing uploaded documents
  ADD COLUMN IF NOT EXISTS documents_reviewed_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS documents_reviewed_by     UUID REFERENCES profiles(id),

  -- External API check status for this application
  ADD COLUMN IF NOT EXISTS external_check_status     TEXT NOT NULL DEFAULT 'not_checked'
    CHECK (external_check_status IN (
      'not_checked',  -- no API call made yet
      'pending',      -- API call in progress (async)
      'matched',      -- API returned a confirmed match
      'not_found',    -- API found no matching registration
      'error'         -- API call failed (network, quota, etc.)
    )),

  ADD COLUMN IF NOT EXISTS external_check_ran_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS external_check_response   JSONB;
  -- Raw external API response for this application specifically
  -- Stored here so admin can see what the API returned during review


-- =============================================================================
-- 3. CHARITY VERIFICATION LOG
-- Immutable audit trail — every verification state change recorded permanently
-- Never updated, never deleted
-- =============================================================================

CREATE TABLE IF NOT EXISTS charity_verification_log (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id        UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  application_id    UUID REFERENCES charity_applications(id),

  -- Who made this change (NULL if automated — e.g. API check or pg_cron)
  changed_by        UUID REFERENCES profiles(id),

  -- What type of change occurred
  change_type       TEXT NOT NULL CHECK (change_type IN (
    'level_upgraded',           -- verification_level increased
    'level_downgraded',         -- verification_level decreased (e.g. doc issue found)
    'suspended',                -- charity suspended by admin
    'reinstated',               -- charity reinstated after suspension
    'external_check_passed',    -- external API returned a match
    'external_check_failed',    -- external API returned no match or error
    'document_reviewed',        -- admin marked documents as reviewed
    'document_viewed',          -- admin opened a document (access log)
    'reverification_required',  -- verification_expires_at passed, re-check triggered
    'score_recalculated'        -- score updated without level change
  )),

  -- State snapshot at time of change
  previous_level    SMALLINT,
  new_level         SMALLINT,
  previous_status   TEXT,       -- verification_status before change
  new_status        TEXT,       -- verification_status after change
  previous_score    SMALLINT,
  new_score         SMALLINT,

  -- Source context
  source            TEXT,       -- which verification_source was used (if applicable)
  notes             TEXT,       -- admin notes or system message

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — append-only
);

CREATE INDEX idx_charity_verification_log_charity_id
  ON charity_verification_log(charity_id);

CREATE INDEX idx_charity_verification_log_created_at
  ON charity_verification_log(created_at DESC);

CREATE INDEX idx_charity_verification_log_change_type
  ON charity_verification_log(change_type);


-- =============================================================================
-- 4. RLS: charity_verification_log
-- =============================================================================

ALTER TABLE charity_verification_log ENABLE ROW LEVEL SECURITY;

-- Admins can read all log entries
CREATE POLICY "Admins can read verification log"
  ON charity_verification_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Inserts only via service role (API routes / Edge Functions)
-- No direct insert policy for authenticated users
-- No delete policy — log is permanent


-- =============================================================================
-- 5. VERIFICATION BADGE VIEW
-- Precomputes the trust badge label for each approved charity
-- Used by the frontend to render the correct badge without extra logic
-- =============================================================================

CREATE OR REPLACE VIEW charity_trust_badges AS
SELECT
  id,
  name,
  slug,
  verification_level,
  verification_score,
  verification_source,
  last_verified_at,
  is_zakat_eligible,
  CASE verification_level
    WHEN 3 THEN 'Externally Verified'
    WHEN 2 THEN 'Verified'
    WHEN 1 THEN 'Documents Submitted'
    ELSE         'Unverified'
  END AS verification_label,
  CASE
    WHEN verification_level = 3 AND verification_source = 'charity_commission'
      THEN 'Verified by Charity Commission for England & Wales'
    WHEN verification_level = 3 AND verification_source = 'companies_house'
      THEN 'Verified by Companies House'
    WHEN verification_level = 3 AND verification_source = 'guidestar'
      THEN 'Verified by GuideStar / Candid'
    WHEN verification_level = 3
      THEN 'Externally Verified'
    WHEN verification_level = 2
      THEN 'Verified by HalalMe Trust Team'
    ELSE NULL
  END AS verification_detail,
  CASE
    WHEN verification_score >= 80 THEN 'highly_trusted'
    WHEN verification_score >= 50 THEN 'trusted'
    WHEN verification_score >= 20 THEN 'partial'
    ELSE                               'unverified'
  END AS trust_tier
FROM charities
WHERE is_active = TRUE AND verification_status = 'approved';
