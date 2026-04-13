-- =============================================================================
-- 014_hub_phase1.sql
-- Phase 1 Hub additions:
--   (a) view_count on posts
--   (b) post_bookmarks table + RLS
--   (c) notifications table + RLS + auto-create triggers
--   (d) increment_post_view RPC helper
-- =============================================================================

-- ---------------------------------------------------------------------------
-- (a) view_count column on posts
-- ---------------------------------------------------------------------------
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- (b) post_bookmarks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS post_bookmarks (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id)    ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE post_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON post_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add bookmarks"
  ON post_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove bookmarks"
  ON post_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_post_bookmarks_user_id
  ON post_bookmarks(user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- (c) notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN (
               'like_post', 'comment', 'reply', 'follow', 'like_comment'
             )),
  post_id    UUID REFERENCES posts(id)    ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Triggers run as SECURITY DEFINER so they bypass RLS when inserting
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can mark own notifications read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id, is_read)
  WHERE is_read = false;

-- ---------------------------------------------------------------------------
-- Notification triggers
-- ---------------------------------------------------------------------------

-- Trigger: post liked → notify post owner (skip self-likes)
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, post_id)
  SELECT p.user_id, NEW.user_id, 'like_post', NEW.post_id
  FROM   posts p
  WHERE  p.id = NEW.post_id
    AND  p.user_id <> NEW.user_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_post_liked ON post_likes;
CREATE TRIGGER on_post_liked
  AFTER INSERT ON post_likes
  FOR EACH ROW EXECUTE FUNCTION notify_post_like();

-- Trigger: comment created → notify post owner (skip self-comment)
--           reply created  → notify parent comment owner (skip self-reply)
CREATE OR REPLACE FUNCTION notify_comment_or_reply()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    -- Top-level comment: notify post owner
    INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id)
    SELECT p.user_id, NEW.user_id, 'comment', NEW.post_id, NEW.id
    FROM   posts p
    WHERE  p.id = NEW.post_id
      AND  p.user_id <> NEW.user_id;
  ELSE
    -- Reply: notify the parent comment's owner
    INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id)
    SELECT c.user_id, NEW.user_id, 'reply', NEW.post_id, NEW.id
    FROM   comments c
    WHERE  c.id = NEW.parent_id
      AND  c.user_id <> NEW.user_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_created ON comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW EXECUTE FUNCTION notify_comment_or_reply();

-- Trigger: follow → notify followed user
CREATE OR REPLACE FUNCTION notify_follow()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_user_followed ON follows;
CREATE TRIGGER on_user_followed
  AFTER INSERT ON follows
  FOR EACH ROW EXECUTE FUNCTION notify_follow();

-- Trigger: comment liked → notify comment owner (skip self-like)
CREATE OR REPLACE FUNCTION notify_comment_like()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, comment_id)
  SELECT c.user_id, NEW.user_id, 'like_comment', NEW.comment_id
  FROM   comments c
  WHERE  c.id = NEW.comment_id
    AND  c.user_id <> NEW.user_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_liked ON comment_likes;
CREATE TRIGGER on_comment_liked
  AFTER INSERT ON comment_likes
  FOR EACH ROW EXECUTE FUNCTION notify_comment_like();

-- ---------------------------------------------------------------------------
-- (d) Atomic view count increment (avoids read-modify-write race)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_post_view(p_post_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE posts SET view_count = view_count + 1 WHERE id = p_post_id;
$$;
