-- =============================================================================
-- 027_cloudinary.sql
-- Add Cloudinary public_id columns for deletion and transformation support.
-- Existing rows keep their current URLs (lazy migration — old Supabase/external
-- URLs remain valid). New uploads will populate both url and public_id.
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_public_id TEXT;

ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS image_public_id TEXT;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS media_public_ids TEXT[];
