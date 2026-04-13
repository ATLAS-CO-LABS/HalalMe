-- =============================================================================
-- 015_hub_optimizations.sql
-- Security hardening, realtime config, and following-feed view.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Fix open INSERT policy on notifications (security hole)
--    Triggers run as SECURITY DEFINER and bypass RLS, so restricting the
--    policy to service_role prevents authenticated users from injecting
--    fake notifications directly via the PostgREST API.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "notifications_insert"         ON notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;

CREATE POLICY "notifications_service_insert"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 2. REPLICA IDENTITY FULL
--    Required so that UPDATE and DELETE realtime events carry the full row
--    payload (not just the PK), enabling client-side optimistic reconciliation.
-- ---------------------------------------------------------------------------
ALTER TABLE posts         REPLICA IDENTITY FULL;
ALTER TABLE notifications REPLICA IDENTITY FULL;
ALTER TABLE comments      REPLICA IDENTITY FULL;

-- ---------------------------------------------------------------------------
-- 3. Ensure tables are part of the supabase_realtime publication
--    (idempotent – skipped if already added)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE posts;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE comments;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. following_posts_view — DB-side following feed
--    Replaces the 2-round-trip JS approach (fetch follows → .in()) with a
--    single PostgREST query.  security_invoker = true means the view runs
--    with the calling user's RLS context.
--
--    Profile columns are inlined so PostgREST FK embedding is not needed and
--    the query shape exactly matches the existing Post type on the client.
-- ---------------------------------------------------------------------------
DROP VIEW IF EXISTS following_posts_view;

CREATE VIEW following_posts_view
WITH (security_invoker = true) AS
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
    'username',    pr.username,
    'full_name',   pr.full_name,
    'avatar_url',  pr.avatar_url,
    'is_verified', pr.is_verified
  ) AS profiles
FROM   posts    p
JOIN   follows  f  ON p.user_id = f.following_id
JOIN   profiles pr ON p.user_id = pr.id
WHERE  p.is_published = true;
