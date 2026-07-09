-- =============================================================================
-- 054_expire_feature_boosts.sql
-- Points system — Phase 1, Day 6 (part 2): expire recipe/post boosts
--
-- redeem_reward (052) sets is_featured=true + featured_until on a boosted
-- recipe/post, but nothing ever clears is_featured once featured_until
-- passes — it would stay "featured" forever. Same pattern as the existing
-- expire_stale_pending_donations() hourly job.
--
-- Admin-set featured items (featured_until IS NULL) are untouched — this only
-- clears boosts that were bought with points and have actually expired.
--
-- Prerequisites: 051_redemption_schema.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION expire_feature_boosts()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE recipes
  SET is_featured = FALSE
  WHERE is_featured = TRUE AND featured_until IS NOT NULL AND featured_until < NOW();

  UPDATE posts
  SET is_featured = FALSE
  WHERE is_featured = TRUE AND featured_until IS NOT NULL AND featured_until < NOW();
END;
$$;

SELECT cron.schedule(
  'expire-feature-boosts',
  '*/15 * * * *',
  $$SELECT expire_feature_boosts();$$
);
