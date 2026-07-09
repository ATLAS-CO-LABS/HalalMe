-- =============================================================================
-- 055_rewards_realtime_publication.sql
-- Points system — Phase 1, Day 6 fix: enable Realtime on reward_transactions
--
-- The points-earned toast (RewardsRealtimeContext) subscribes via
-- postgres_changes, but a table only broadcasts changes if it's added to the
-- supabase_realtime publication — reward_transactions never was, so the
-- listener was correctly wired but silently received nothing.
-- =============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE reward_transactions;
