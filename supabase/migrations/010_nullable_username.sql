-- =============================================================================
-- 010_nullable_username.sql
-- Make username nullable so new users are funneled through /complete-profile.
-- The old trigger auto-generated a user_XXXXXXXX handle which bypassed the
-- profile-completion guard — users never picked a real username.
-- =============================================================================

-- 1. Drop NOT NULL constraint (keep UNIQUE so confirmed usernames stay unique)
ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;

-- 2. Null out the auto-generated placeholders so existing users who still have
--    the system-generated handle are sent to /complete-profile on next login.
--    Safe: these rows were created by the trigger, not chosen by users.
UPDATE profiles
SET username = NULL
WHERE username ~ '^user_[0-9a-f]{8,12}$';

-- 3. Replace the trigger function — insert NULL, let the app handle the choice.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
