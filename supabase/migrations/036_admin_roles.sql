-- =============================================================================
-- 036_admin_roles.sql
-- Roles & permissions foundation for the admin panel.
--   - Adds 'super_admin' role tier
--   - Mirrors auth.users.email onto profiles (searchable/filterable in SQL)
--   - Adds account status (active/suspended/banned) for moderation
--   - Seeds the two founder accounts as super_admin
--   - Creates admin_permissions (per-module access for team members)
-- =============================================================================

-- =============================================================================
-- Role tier: add 'super_admin'
-- =============================================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- =============================================================================
-- Email mirror + account status columns
-- auth.users is the canonical email store; this copy lets us search/filter/sort
-- by email in admin queries without crossing into the auth schema.
-- =============================================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'suspended', 'banned'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_profiles_email  ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role   ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);

-- One-time backfill of email from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE u.id = p.id AND p.email IS NULL;

-- =============================================================================
-- Keep email in sync going forward — replace handle_new_user() (002_auth_profiles.sql)
-- so every new signup also populates profiles.email.
-- =============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(replace(NEW.id::text, '-', ''), 1, 8)
    ),
    NEW.email
  )
  ON CONFLICT (username) DO UPDATE
    SET username = 'user_' || substr(replace(NEW.id::text, '-', ''), 1, 12);
  RETURN NEW;
END;
$$;

-- =============================================================================
-- Seed super admins (founders). Set here, never from the UI, so super_admin
-- can never be granted or revoked through the app.
-- =============================================================================
UPDATE public.profiles SET role = 'super_admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('halalme.ops@gmail.com', 'muazamkhan203@gmail.com')
);

-- =============================================================================
-- admin_permissions — per-module access level for 'admin' team members.
-- super_admin ignores this table (always full access); regular users never
-- have rows. Missing row = 'none'.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  module     TEXT NOT NULL CHECK (module IN ('merchants', 'users', 'kitchen', 'hub', 'rewards', 'analytics')),
  access     TEXT NOT NULL DEFAULT 'none' CHECK (access IN ('none', 'view', 'manage')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, module)
);

-- Grandfather existing admins to full access on every module — nothing breaks
-- on rollout (these users had full access before this migration).
INSERT INTO public.admin_permissions (user_id, module, access)
SELECT p.id, m.module, 'manage'
FROM public.profiles p
CROSS JOIN (VALUES ('merchants'), ('users'), ('kitchen'), ('hub'), ('rewards'), ('analytics')) AS m(module)
WHERE p.role = 'admin'
ON CONFLICT (user_id, module) DO NOTHING;

-- =============================================================================
-- RLS: only super admins can read/write the permissions table.
-- (Service-role API routes bypass RLS; this protects direct client access.)
-- =============================================================================
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins manage permissions"
  ON public.admin_permissions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));
