-- =============================================================================
-- 012_hub_indexes.sql
-- Performance indexes for the Hub module (posts, comments, follows).
-- =============================================================================

-- posts: published feed ordered by time (default / latest tab)
CREATE INDEX idx_posts_published_created
  ON posts(is_published, created_at DESC);

-- posts: trending tab — sorted by likes
CREATE INDEX idx_posts_like_count
  ON posts(like_count DESC, created_at DESC);

-- posts: all posts by a user (profile page, following feed)
CREATE INDEX idx_posts_user_id
  ON posts(user_id);

-- posts: full-text search on content (pg_trgm GIN)
CREATE INDEX idx_posts_content_fts
  ON posts USING GIN (to_tsvector('english', content));

-- comments: load all comments for a post
CREATE INDEX idx_comments_post_id
  ON comments(post_id, created_at ASC);

-- comments: load replies for a top-level comment
CREATE INDEX idx_comments_parent_id
  ON comments(parent_id)
  WHERE parent_id IS NOT NULL;

-- follows: who does a user follow? (following-tab feed, isFollowing check)
CREATE INDEX idx_follows_follower_id
  ON follows(follower_id);

-- follows: who follows a user? (follower count, profile page)
CREATE INDEX idx_follows_following_id
  ON follows(following_id);
