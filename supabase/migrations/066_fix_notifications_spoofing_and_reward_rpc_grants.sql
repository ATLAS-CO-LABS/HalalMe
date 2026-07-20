-- =============================================================================
-- Fix notifications spoofing + reward/fraud-review RPC over-grants
-- =============================================================================
-- 1. notifications had two INSERT policies: the correctly-scoped
--    notifications_service_insert (TO service_role), and a leftover
--    "Service role can insert notifications" policy that, despite its name,
--    was scoped to {public} with WITH CHECK (true). Combined with anon/
--    authenticated's table-level INSERT grant, any signed-in (or anon) user
--    could insert a notification row for ANY user_id — spoofed/phishing
--    notifications. Dropping the leftover policy leaves only the
--    service_role-scoped one.
--
-- 2. release_flagged_rewards(donation_id) is the fraud-review release step —
--    only meant to run from the admin route (src/app/api/admin/donation-flags/
--    [id]/route.ts) via the service-role client after requireAdmin() passes.
--    It still had EXECUTE granted to anon/authenticated, so a user could call
--    it directly on their own flagged donation_id (visible in their own
--    donation history) and force-release a reward that was deliberately
--    withheld pending manual review, bypassing the fraud gate entirely.
--
-- 3. recalculate_user_rewards / check_and_award_badges /
--    expire_stale_pending_donations are internal/admin tools, never called
--    from client code, but had the same anon/authenticated EXECUTE grants.
--    Revoking is safe: SECURITY DEFINER internal PERFORM calls and triggers
--    run as the function owner and are unaffected by these grants.
-- =============================================================================

DROP POLICY "Service role can insert notifications" ON public.notifications;

REVOKE EXECUTE ON FUNCTION public.release_flagged_rewards(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_user_rewards(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_and_award_badges(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_and_award_badges(uuid, integer, numeric) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_stale_pending_donations() FROM PUBLIC, anon, authenticated;
