-- =============================================================================
-- 064_fix_handle_new_user_email.sql
-- Fix: 040_profile_on_confirmation.sql replaced handle_new_user() to gate
-- profile creation on email confirmation, but its INSERT only listed
-- (id, full_name, username) — dropping the `email` column that
-- 036_admin_roles.sql had added to the insert. Every signup since 040 landed
-- with profiles.email = NULL, which is why new users don't show an email in
-- the admin panel. This restores the email insert on top of 040's
-- confirmation-gating logic, and backfills anyone created in the gap.
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $fn$
BEGIN
  -- Only create a profile once the email is confirmed.
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Insert with NULL username; idempotent if a profile already exists.
  INSERT INTO profiles (id, full_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NULL,
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$fn$;

-- Backfill profiles left with a NULL email by the broken trigger (any signup
-- confirmed between 040 shipping and this fix).
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS NULL;
