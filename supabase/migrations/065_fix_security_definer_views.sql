-- =============================================================================
-- Fix SECURITY DEFINER views flagged by Supabase security advisor
-- =============================================================================
-- Both views were missing `security_invoker = true`, so they ran with the
-- view owner's privileges (bypassing RLS) instead of the querying user's.
--
-- following_posts_view: migration 015 originally set security_invoker = true,
-- but migration 057's CREATE OR REPLACE VIEW omitted the WITH clause, which
-- resets reloptions to default. This also meant deleted_at IS NULL (enforced
-- by the "Published posts are public" RLS policy on posts) was NOT actually
-- being enforced for querying users — only the view's own is_published = true
-- filter was. Re-adding security_invoker restores proper RLS enforcement.
--
-- charity_trust_badges: never had security_invoker set. Its WHERE clause
-- (is_active = true AND verification_status = 'approved') already matches
-- the public RLS policy on charities, so this is a lint fix, not a data leak.
-- =============================================================================

ALTER VIEW public.following_posts_view SET (security_invoker = true);
ALTER VIEW public.charity_trust_badges SET (security_invoker = true);
