-- =============================================================================
-- 040_profile_on_confirmation.sql
-- Goal: stop creating profile rows for users who never verify their OTP.
--
--   Before: profiles row was created AFTER INSERT on auth.users — i.e. the
--           instant someone hit "Create Account", before the OTP was entered.
--           Abandoned signups left orphan auth.users + profiles rows forever.
--
--   After:  (B) profile is created only once email_confirmed_at is set, via two
--               paths — OTP/email confirmation (UPDATE) and already-confirmed
--               inserts such as OAuth / admin-created users (INSERT).
--           (A) one-time cleanup of existing orphans, plus a recurring pg_cron
--               job that sweeps abandoned unconfirmed users every night.
--
-- Note: signUp() ALWAYS writes the auth.users row before OTP — that can't be
-- prevented. This migration keeps `profiles` clean and sweeps the leftover
-- unconfirmed auth.users rows on a schedule.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- (B) Profile creation gated on email confirmation
-- ─────────────────────────────────────────────────────────────────────────────

-- Idempotent + confirmation-gated. Safe to fire from both the INSERT and UPDATE
-- triggers, and safe to fire more than once for the same user.
-- username is left NULL on purpose (see migration 010): the app funnels users
-- with no username through /complete-profile to pick a real handle + phone.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $fn$
BEGIN
  -- Only create a profile once the email is confirmed.
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Insert with NULL username; idempotent if a profile already exists.
  INSERT INTO profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$fn$;

-- Replace the old "fire on every insert" trigger with one that only fires for
-- inserts that arrive ALREADY confirmed (OAuth, admin-created, or email
-- confirmation disabled). Normal email+password signups arrive unconfirmed and
-- are handled by the UPDATE trigger below.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Fires when a user confirms (NULL -> set). This is the OTP / email-link path.
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- (A) One-time cleanup of existing orphans
-- ─────────────────────────────────────────────────────────────────────────────

-- Remove profile rows that the old INSERT trigger created for users who are
-- still unconfirmed. If they confirm later, the UPDATE trigger recreates a fresh
-- profile; if they never confirm, the sweep below removes the auth row.
DELETE FROM public.profiles p
USING auth.users u
WHERE p.id = u.id
  AND u.email_confirmed_at IS NULL;

-- Sweep abandoned unconfirmed signups older than 24h (cascades to any profile).
DELETE FROM auth.users
WHERE email_confirmed_at IS NULL
  AND created_at < now() - interval '24 hours';

-- ─────────────────────────────────────────────────────────────────────────────
-- (A) Recurring sweep via pg_cron — daily at 03:00 UTC
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Re-schedulable: drop any prior definition of this job before recreating it.
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-unconfirmed-users') THEN
    PERFORM cron.unschedule('cleanup-unconfirmed-users');
  END IF;
END
$cron$;

SELECT cron.schedule(
  'cleanup-unconfirmed-users',
  '0 3 * * *',
  $job$
    DELETE FROM auth.users
    WHERE email_confirmed_at IS NULL
      AND created_at < now() - interval '24 hours'
  $job$
);
