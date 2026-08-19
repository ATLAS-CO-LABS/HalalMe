-- =============================================================================
-- 072_fix_redeem_dedup_index.sql
-- Points system — fix: redeem_reward blocked on the second redemption of any
-- uncapped catalog item (recipe_boost / hub_post_boost)
--
-- reward_tx_action_reference_unique (047_award_points_engine.sql) was built to
-- dedup EARN actions (one 'recipe_upload' per recipe, etc). redeem_reward()
-- (052) also inserts ledger rows with action = 'redeem' and
-- reference_id = catalog_item_id, so the same index silently caps every
-- catalog item at ONE redemption per user for life — including boosts, which
-- 051's seed data (max_per_user = NULL) and its own comment explicitly say
-- should be repeatable ("a user may want to boost different recipes/posts
-- over time"). Redemption repeat-limits are already correctly enforced by
-- app logic (max_per_user check + 24h velocity cap in redeem_reward), so the
-- earn-dedup index should not apply to 'redeem' rows at all.
--
-- Repro: redeem the same uncapped item twice -> 23505 unique violation ->
-- surfaces to the client as a bare 500 (pointsService.ts only special-cases
-- P0001, so this real constraint violation isn't recognised as a known
-- validation failure).
-- =============================================================================

DROP INDEX IF EXISTS reward_tx_action_reference_unique;

CREATE UNIQUE INDEX IF NOT EXISTS reward_tx_action_reference_unique
  ON reward_transactions (user_id, action, reference_id)
  WHERE reference_id IS NOT NULL AND action <> 'redeem';
