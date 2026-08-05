-- =============================================================================
-- 068_hyperzod_link_on_profile_create.sql
-- Fix: users arriving from Hyperzod were never linked back to their Hyperzod
--      customer record.
--
-- WHY:
--   The Hyperzod signup webhook calls auth.admin.inviteUserByEmail(), which
--   creates the auth user with email_confirmed_at = NULL. Profiles are only
--   created once email is confirmed (on_auth_user_confirmed, see 040/064), so
--   at webhook time there is NO profiles row yet. The webhook's
--   `UPDATE profiles ... WHERE id = <new user>` therefore matched zero rows and
--   silently threw away the phone and username. The Hyperzod customer id was
--   never written at all.
--
-- FIX:
--   The webhook now stashes hyperzod_customer_id / phone in the invite's
--   raw_user_meta_data, which survives until confirmation. handle_new_user()
--   copies them onto the profile at the moment it is created.
--
--   Signup path is unaffected: normal signups carry neither key, and COALESCE
--   leaves both columns NULL exactly as before.
--
-- Prerequisites: 024_hyperzod_integration.sql, 040, 064
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $fn$
BEGIN
  -- Only create a profile once the email is confirmed.
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- username stays NULL so AuthGuard routes them to /complete-profile, where
  -- they pick their own. Hyperzod-sourced phone/customer id ride along in the
  -- invite metadata (NULL for every normal signup).
  INSERT INTO profiles (id, full_name, username, email, phone, hyperzod_customer_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NULL,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'hyperzod_customer_id', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$fn$;


-- =============================================================================
-- Lookup index. Order webhooks arrive keyed by Hyperzod customer id, so this is
-- the column we join on to find the HalalMe user. Partial (most rows are NULL).
-- Not unique: a Hyperzod customer may legitimately be re-pointed after a delete
-- and re-create, and a hard unique constraint would make that repair fail.
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_hyperzod_customer_id
  ON profiles (hyperzod_customer_id)
  WHERE hyperzod_customer_id IS NOT NULL;
