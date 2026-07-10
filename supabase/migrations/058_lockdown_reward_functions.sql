-- =============================================================================
-- 058_lockdown_reward_functions.sql
-- Points system — final audit fix: close a real privilege-escalation hole
--
-- Found during the Day-7 audit: every SECURITY DEFINER function in this
-- project was still directly callable by `anon` and `authenticated` via
-- supabase.rpc(...) from the browser, DESPITE prior migrations doing
-- `REVOKE ALL ... FROM PUBLIC`.
--
-- Root cause: Supabase's public schema has a default-privilege rule
-- (`ALTER DEFAULT PRIVILEGES ... GRANT EXECUTE ON FUNCTIONS TO anon,
-- authenticated, service_role`) that auto-grants EXECUTE to anon/authenticated
-- on every newly created function. That's a DIRECT grant to those roles, not
-- a grant to the PUBLIC pseudo-role — so `REVOKE ALL FROM PUBLIC` never
-- touched it. Confirmed via has_function_privilege(): anon/authenticated
-- could call award_points, redeem_reward, award_badge,
-- decrement_reward_points, and expire_feature_boosts directly, completely
-- bypassing the app's own validation (mint arbitrary points, force-redeem or
-- zero out another user's wallet, forge badges).
--
-- Fix: explicitly revoke from anon AND authenticated (not just PUBLIC) on
-- every reward-related SECURITY DEFINER function, keeping only service_role.
-- The trigger-only handler functions (handle_*, sync_reward_tier) can't be
-- meaningfully exploited without trigger row context, but are locked down
-- too for defense in depth — free to do, no reason to leave them open.
-- =============================================================================

REVOKE ALL ON FUNCTION award_points(UUID, TEXT, UUID, NUMERIC, TEXT, NUMERIC, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION award_points(UUID, TEXT, UUID, NUMERIC, TEXT, NUMERIC, UUID) TO service_role;

REVOKE ALL ON FUNCTION redeem_reward(UUID, UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION redeem_reward(UUID, UUID, UUID) TO service_role;

REVOKE ALL ON FUNCTION award_badge(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION award_badge(UUID, TEXT, TEXT) TO service_role;

REVOKE ALL ON FUNCTION decrement_reward_points(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION decrement_reward_points(UUID, INTEGER) TO service_role;

REVOKE ALL ON FUNCTION expire_feature_boosts() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION expire_feature_boosts() TO service_role, postgres;

-- Trigger-only functions — defense in depth, cheap to close.
REVOKE ALL ON FUNCTION handle_donation_completed() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION handle_profile_complete() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION handle_post_created() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION handle_recipe_created() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION handle_review_created() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION sync_reward_tier() FROM PUBLIC, anon, authenticated;
