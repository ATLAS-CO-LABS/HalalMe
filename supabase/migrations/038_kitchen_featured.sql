-- =============================================================================
-- 038_kitchen_featured.sql
-- Adds a "featured" flag to recipes so admins can pin recipes to the Kitchen
-- homepage "Featured" section from the admin moderation panel.
--
-- Prerequisites: 003_kitchen.sql
-- =============================================================================

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- Partial index — only the (small) set of featured recipes is indexed, so the
-- homepage "Featured" query stays fast without bloating the index.
CREATE INDEX IF NOT EXISTS idx_recipes_is_featured
  ON public.recipes(is_featured) WHERE is_featured = TRUE;
