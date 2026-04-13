-- =============================================================================
-- 013_hub_fixes.sql
-- (a) post-media storage bucket for user-uploaded post images/videos
-- (b) missing RLS UPDATE policy on comments
-- =============================================================================

-- ---------------------------------------------------------------------------
-- post-media bucket
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-media',
  'post-media',
  true,
  52428800,   -- 50 MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read post media (public CDN URLs)
CREATE POLICY "Post media is publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-media');

-- Authenticated users can upload post media
-- Files must be stored under their own uid/ folder: {uid}/{postId}/{filename}
CREATE POLICY "Authenticated users can upload post media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can replace their own post media
CREATE POLICY "Users can update own post media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own post media
CREATE POLICY "Users can delete own post media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Missing RLS policy: users can edit their own comments
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
