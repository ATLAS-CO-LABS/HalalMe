-- =============================================================================
-- 073_deletion_pipeline.sql
-- Account deletion — unblock it, stop it destroying financial records, and give
-- asset cleanup somewhere to record work in progress.
--
-- Three separate problems, all of which have to be solved before a real
-- "delete my account" route can exist.
--
-- (1) TWELVE FOREIGN KEYS SILENTLY BLOCK DELETION
-- Every column below references profiles(id) or auth.users(id) with no
-- ON DELETE clause, which Postgres defaults to NO ACTION — the delete is
-- refused. These are all "which staff member actioned this" columns, so the
-- referenced user is nearly always an admin, but a demoted ex-staff account is
-- an ordinary user and charities.submitted_by can be an ordinary user outright.
-- GoTrue collapses the resulting failure into a flat "Database error deleting
-- user", which is why api/admin/users/[id]/route.ts carries a comment about
-- that message being impossible to act on. This is the cause.
--
-- SET NULL rather than CASCADE: losing "who reviewed this" is acceptable, but
-- deleting the reviewed charity/report/commission record because its reviewer
-- closed their account is not. All twelve columns are already nullable, so no
-- NOT NULL conflict.
--
-- (2) DELETING A USER DESTROYS THEIR DONATION RECORDS
-- donations.user_id was NOT NULL + ON DELETE CASCADE, so account deletion hard
-- deleted the whole financial row: amount, currency, fee breakdown,
-- stripe_charge_id, payment_intent_id, receipt_url. That contradicts the
-- platform's own privacy policy ("Payment and donation records — kept for 6
-- years from the transaction date, as required by UK tax law"), breaks
-- reconciliation against Stripe (Stripe keeps its side, we would lose ours),
-- and erases the record of money that was already paid out to a charity.
--
-- Retention and erasure are both satisfied by severing the donor link and
-- keeping the transaction: user_id becomes nullable and SET NULL, and the
-- deletion routine separately clears ip_address / user_agent, which are the
-- only remaining directly identifying fields on the row.
--
-- (3) ASSET CLEANUP HAS NOWHERE TO STAND
-- Cloudinary public_ids live on the rows being deleted (profiles.avatar_public_id,
-- posts.media_public_ids, recipes.image_public_id,
-- merchant_documents.cloudinary_public_id). Once the cascade runs, the
-- references are gone and the files can never be found again — deletion
-- destroys the ability to clean up after itself. pending_asset_deletions holds
-- the ids from before the cascade so a sweeper can retry until Cloudinary
-- confirms, which matters because the current post-delete cleanup is a
-- fire-and-forget fetch with .catch(() => {}).
-- =============================================================================

-- ── (1) Unblock deletion ─────────────────────────────────────────────────────
-- Each FK is dropped and recreated with SET NULL. IF EXISTS keeps the migration
-- re-runnable.

ALTER TABLE charities              DROP CONSTRAINT IF EXISTS charities_submitted_by_fkey;
ALTER TABLE charities              ADD  CONSTRAINT charities_submitted_by_fkey
  FOREIGN KEY (submitted_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE charities              DROP CONSTRAINT IF EXISTS charities_verified_by_fkey;
ALTER TABLE charities              ADD  CONSTRAINT charities_verified_by_fkey
  FOREIGN KEY (verified_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE charity_applications   DROP CONSTRAINT IF EXISTS charity_applications_documents_reviewed_by_fkey;
ALTER TABLE charity_applications   ADD  CONSTRAINT charity_applications_documents_reviewed_by_fkey
  FOREIGN KEY (documents_reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE charity_applications   DROP CONSTRAINT IF EXISTS charity_applications_reviewed_by_fkey;
ALTER TABLE charity_applications   ADD  CONSTRAINT charity_applications_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE charity_verification_log DROP CONSTRAINT IF EXISTS charity_verification_log_changed_by_fkey;
ALTER TABLE charity_verification_log ADD  CONSTRAINT charity_verification_log_changed_by_fkey
  FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE comments               DROP CONSTRAINT IF EXISTS comments_deleted_by_fkey;
ALTER TABLE comments               ADD  CONSTRAINT comments_deleted_by_fkey
  FOREIGN KEY (deleted_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE donation_flags         DROP CONSTRAINT IF EXISTS donation_flags_reviewed_by_fkey;
ALTER TABLE donation_flags         ADD  CONSTRAINT donation_flags_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE merchant_commission    DROP CONSTRAINT IF EXISTS merchant_commission_decided_by_fkey;
ALTER TABLE merchant_commission    ADD  CONSTRAINT merchant_commission_decided_by_fkey
  FOREIGN KEY (decided_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE merchant_documents     DROP CONSTRAINT IF EXISTS merchant_documents_reviewed_by_fkey;
ALTER TABLE merchant_documents     ADD  CONSTRAINT merchant_documents_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE posts                  DROP CONSTRAINT IF EXISTS posts_deleted_by_fkey;
ALTER TABLE posts                  ADD  CONSTRAINT posts_deleted_by_fkey
  FOREIGN KEY (deleted_by) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE profiles               DROP CONSTRAINT IF EXISTS profiles_suspended_by_fkey;
ALTER TABLE profiles               ADD  CONSTRAINT profiles_suspended_by_fkey
  FOREIGN KEY (suspended_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE recipes                DROP CONSTRAINT IF EXISTS recipes_deleted_by_fkey;
ALTER TABLE recipes                ADD  CONSTRAINT recipes_deleted_by_fkey
  FOREIGN KEY (deleted_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- ── (2) Keep the money, drop the donor link ──────────────────────────────────

ALTER TABLE donations ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_user_id_fkey;
ALTER TABLE donations ADD  CONSTRAINT donations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Existing RLS reads donations by user_id. A NULL donor must never match a
-- logged-in user, so anonymised rows become invisible to the app and remain
-- reachable only through the service role, which is what admin/export use.
COMMENT ON COLUMN donations.user_id IS
  'NULL means the donor closed their account. The financial record is retained for the 6-year UK tax obligation, with the personal link severed. See migration 073.';

-- ── (3) Asset cleanup queue ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pending_asset_deletions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_id     TEXT NOT NULL,
  -- Cloudinary refuses to delete a video asset addressed as resource_type
  -- "image", so the type has to be captured at collection time.
  resource_type TEXT NOT NULL DEFAULT 'image'
                  CHECK (resource_type IN ('image', 'video', 'raw')),
  -- "upload" for public assets, "authenticated" for merchant compliance docs.
  delivery_type TEXT NOT NULL DEFAULT 'upload'
                  CHECK (delivery_type IN ('upload', 'authenticated')),
  -- Free-text origin ('user_delete', 'merchant_delete', 'recipe_delete') purely
  -- so a stuck queue can be traced back to what produced it.
  reason        TEXT,
  attempts      INTEGER NOT NULL DEFAULT 0,
  last_error    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

-- The sweeper's only query: outstanding work, oldest first, giving up after 10
-- tries so one permanently broken id cannot stall the queue behind it.
CREATE INDEX IF NOT EXISTS pending_asset_deletions_outstanding_idx
  ON pending_asset_deletions (created_at)
  WHERE deleted_at IS NULL AND attempts < 10;

-- Server-side only. No policies are defined, so with RLS enabled every
-- anon/authenticated request is denied by default and only the service role
-- (which bypasses RLS) can read or write the queue.
ALTER TABLE pending_asset_deletions ENABLE ROW LEVEL SECURITY;
