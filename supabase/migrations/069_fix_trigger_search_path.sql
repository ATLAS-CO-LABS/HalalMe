-- 069_fix_trigger_search_path.sql
-- Pin search_path on every public trigger function.
--
-- Deleting a user through the Auth admin API failed with
--   ERROR: relation "posts" does not exist (SQLSTATE 42P01)
-- GoTrue connects as supabase_auth_admin, whose search_path is "auth", not
-- "public". Deleting auth.users cascades into public.comments, post_likes,
-- follows and donations, and their triggers resolve table names against the
-- *caller's* search_path when the function does not pin its own. Under postgres
-- the same delete works, which is why it only shows up via the admin panel.
--
-- ALTER FUNCTION ... SET search_path leaves the bodies untouched; it only fixes
-- name resolution. This also clears the "function_search_path_mutable" advisor
-- warning on these functions.

ALTER FUNCTION public.handle_donation_completed() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_merchants_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.notify_comment_like() SET search_path = public, pg_temp;
ALTER FUNCTION public.notify_comment_or_reply() SET search_path = public, pg_temp;
ALTER FUNCTION public.notify_follow() SET search_path = public, pg_temp;
ALTER FUNCTION public.notify_post_like() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_comment_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_comment_like_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_post_like_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_recipe_rating() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_reward_tier() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_support_conversation_on_message() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at() SET search_path = public, pg_temp;

-- Not a trigger, but same class of bug: called from the app and references
-- posts unqualified.
ALTER FUNCTION public.increment_post_view(uuid) SET search_path = public, pg_temp;
