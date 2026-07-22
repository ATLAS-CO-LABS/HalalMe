-- Column-level lockdown for public.profiles.
--
-- RLS on profiles only ever restricted rows (SELECT USING (true) - fully open),
-- never columns. anon/authenticated had blanket table-level SELECT, so every
-- column - email, phone, hyperzod_customer_id, suspended_reason, suspended_by,
-- status - was readable by anyone via the REST API directly, regardless of
-- what the app's own queries selected. Confirmed via a third-party security
-- scan (Leakscope, SENS_001/HIGH).
--
-- Row visibility is left untouched: Hub/Kitchen/Blog embed
-- profiles!user_id(username, avatar_url, ...) for other users' posts/recipes,
-- which needs the row to stay visible. Only the column grant is narrowed.

REVOKE SELECT ON public.profiles FROM anon, authenticated;

GRANT SELECT (
  id, username, full_name, avatar_url, bio, role, is_verified,
  reward_points, lifetime_points, reward_tier, location, created_at, profile_flair
) ON public.profiles TO anon, authenticated;

-- Lets a signed-in user read their own full row (incl. phone/email/etc.)
-- without granting anyone blanket column access. SECURITY DEFINER bypasses the
-- column revoke above; the WHERE clause hard-scopes it to the caller only.
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.get_my_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- Phone-uniqueness check (used during signup/profile-edit) used to filter
-- directly on profiles.phone from the browser, which needs SELECT on that
-- column to evaluate the WHERE clause - reopening the same leak. This RPC
-- returns a plain boolean instead of ever exposing phone values.
CREATE OR REPLACE FUNCTION public.is_phone_taken(candidate_phone text, exclude_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE phone = candidate_phone
      AND (exclude_user_id IS NULL OR id <> exclude_user_id)
  );
$$;

REVOKE ALL ON FUNCTION public.is_phone_taken(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_phone_taken(text, uuid) TO anon, authenticated;
