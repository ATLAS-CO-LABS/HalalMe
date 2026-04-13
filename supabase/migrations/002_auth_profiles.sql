-- =============================================================================
-- 002_auth_profiles.sql
-- profiles table + signup trigger
-- Roles: only 'user' and 'admin' — no chef/vendor (third-party handles delivery)
-- =============================================================================

CREATE TABLE profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username       TEXT UNIQUE NOT NULL,
  full_name      TEXT NOT NULL,
  avatar_url     TEXT,
  bio            TEXT,
  -- Kept simple: user = everyone, admin = platform management only
  role           TEXT NOT NULL DEFAULT 'user'
                   CHECK (role IN ('user', 'admin')),
  is_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  reward_points  INTEGER NOT NULL DEFAULT 0,
  reward_tier    TEXT NOT NULL DEFAULT 'bronze'
                   CHECK (reward_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  location       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- Auto-create profile row on signup
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
    )
  )
  ON CONFLICT (username) DO UPDATE
    SET username = 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 12);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- Reward tier auto-upgrade
-- =============================================================================
CREATE OR REPLACE FUNCTION sync_reward_tier()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.reward_tier = CASE
    WHEN NEW.reward_points >= 10000 THEN 'platinum'
    WHEN NEW.reward_points >= 5000  THEN 'gold'
    WHEN NEW.reward_points >= 1000  THEN 'silver'
    ELSE 'bronze'
  END;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_reward_tier
  BEFORE UPDATE OF reward_points ON profiles
  FOR EACH ROW EXECUTE FUNCTION sync_reward_tier();

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
