-- =============================================================================
-- 045_soft_delete_content.sql
-- Soft-delete + restore window for moderated content (recipes, posts, comments).
--
-- Admin "delete" now sets deleted_at (a recoverable Trash) instead of erasing the
-- row; a separate, explicitly-flagged "purge" still hard-deletes (and is logged
-- distinctly in the admin audit log).
--
-- Public and owner read paths are updated to exclude soft-deleted rows. The admin
-- panel uses the service-role client, which bypasses RLS, so the Trash/Restore
-- views still see deleted rows. No live rows are deleted yet (deleted_at = NULL
-- everywhere), so applying this changes nothing visible until an admin acts.
-- =============================================================================

-- ── Columns ──────────────────────────────────────────────────────────────────
ALTER TABLE recipes  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
                     ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES profiles(id);
ALTER TABLE posts    ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
                     ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES profiles(id);
ALTER TABLE comments ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
                     ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES profiles(id);

-- Partial indexes — only the (small) Trash set is indexed.
CREATE INDEX IF NOT EXISTS idx_recipes_deleted_at  ON recipes  (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at    ON posts    (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments (deleted_at) WHERE deleted_at IS NOT NULL;

-- ── RLS: recipes ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Published recipes are public" ON recipes;
CREATE POLICY "Published recipes are public"
  ON recipes FOR SELECT
  USING (is_published = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can read own recipes" ON recipes;
CREATE POLICY "Users can read own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- ── RLS: posts ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Published posts are public" ON posts;
CREATE POLICY "Published posts are public"
  ON posts FOR SELECT
  USING (is_published = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can read own unpublished posts" ON posts;
CREATE POLICY "Users can read own unpublished posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- ── RLS: comments ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Comments are public" ON comments;
CREATE POLICY "Comments are public"
  ON comments FOR SELECT
  USING (deleted_at IS NULL);
