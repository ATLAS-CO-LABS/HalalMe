-- =============================================================================
-- 057_following_feed_rewards_fields.sql
-- Points system — Day 6 fix: Following tab was missing boost/flair fields
--
-- following_posts_view hand-picks its columns (not SELECT *), so it silently
-- excluded posts.is_featured/featured_until and profiles.profile_flair — a
-- boosted post or a flair-wearing author would show normally in Latest/Trending
-- but plain in Following. Add the missing fields to match.
-- =============================================================================

-- New columns must be appended at the end — CREATE OR REPLACE VIEW can't
-- reorder/rename existing positional columns.
CREATE OR REPLACE VIEW following_posts_view AS
SELECT
  p.id,
  p.user_id,
  p.content,
  p.media_urls,
  p.post_type,
  p.recipe_id,
  p.is_published,
  p.like_count,
  p.comment_count,
  p.view_count,
  p.created_at,
  p.updated_at,
  f.follower_id,
  json_build_object(
    'username', pr.username,
    'full_name', pr.full_name,
    'avatar_url', pr.avatar_url,
    'is_verified', pr.is_verified,
    'profile_flair', pr.profile_flair
  ) AS profiles,
  p.is_featured,
  p.featured_until
FROM posts p
JOIN follows f ON p.user_id = f.following_id
JOIN profiles pr ON p.user_id = pr.id
WHERE p.is_published = true;
