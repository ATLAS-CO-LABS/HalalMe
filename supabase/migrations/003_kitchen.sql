-- =============================================================================
-- 003_kitchen.sql
-- recipes, recipe_reviews, recipe_favorites, ai_chat_sessions
-- Fixes applied:
--   ✅ Separate INSERT policy with WITH CHECK (fix #1)
--   ✅ DELETE policy on recipe_reviews (fix #2)
--   ✅ ai_request_counts table for rate limiting (fix #6)
-- =============================================================================

-- =============================================================================
-- recipes
-- =============================================================================
CREATE TABLE recipes (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  -- [{step: number, text: string}]
  instructions      JSONB NOT NULL DEFAULT '[]',
  -- [{name: string, amount: string, unit: string}]
  ingredients       JSONB NOT NULL DEFAULT '[]',
  cuisine           TEXT,
  difficulty        TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prep_time_mins    INTEGER CHECK (prep_time_mins >= 0),
  cook_time_mins    INTEGER CHECK (cook_time_mins >= 0),
  servings          INTEGER CHECK (servings > 0),
  image_url         TEXT,
  is_ai_generated   BOOLEAN NOT NULL DEFAULT FALSE,
  is_published      BOOLEAN NOT NULL DEFAULT TRUE,
  is_halal_verified BOOLEAN NOT NULL DEFAULT FALSE,
  tags              TEXT[] DEFAULT '{}',
  -- {calories: number, protein: number, carbs: number, fat: number}
  nutrition         JSONB,
  view_count        INTEGER NOT NULL DEFAULT 0,
  avg_rating        NUMERIC(3,2) DEFAULT NULL,  -- maintained by trigger
  review_count      INTEGER NOT NULL DEFAULT 0, -- maintained by trigger
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Full-text search index
CREATE INDEX recipes_fts_idx ON recipes
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- =============================================================================
-- recipe_reviews
-- =============================================================================
CREATE TABLE recipe_reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id   UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (recipe_id, user_id)  -- one review per user per recipe
);

CREATE TRIGGER recipe_reviews_updated_at
  BEFORE UPDATE ON recipe_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger: keep avg_rating + review_count in sync after insert/update/delete
CREATE OR REPLACE FUNCTION sync_recipe_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  target_recipe_id UUID;
BEGIN
  target_recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id);

  UPDATE recipes
  SET
    avg_rating   = (SELECT AVG(rating)   FROM recipe_reviews WHERE recipe_id = target_recipe_id),
    review_count = (SELECT COUNT(*)       FROM recipe_reviews WHERE recipe_id = target_recipe_id)
  WHERE id = target_recipe_id;

  RETURN NULL;
END;
$$;

CREATE TRIGGER recipe_rating_sync
  AFTER INSERT OR UPDATE OR DELETE ON recipe_reviews
  FOR EACH ROW EXECUTE FUNCTION sync_recipe_rating();

-- =============================================================================
-- recipe_favorites
-- =============================================================================
CREATE TABLE recipe_favorites (
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id  UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- =============================================================================
-- ai_chat_sessions
-- =============================================================================
CREATE TABLE ai_chat_sessions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- [{role: 'user'|'assistant', content: string, timestamp: string}]
  messages     JSONB NOT NULL DEFAULT '[]',
  ingredients  TEXT[],
  -- links to the recipe row created from this session (if any)
  recipe_id    UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER ai_sessions_updated_at
  BEFORE UPDATE ON ai_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ai_request_counts  (rate limiting store — fix #6)
-- =============================================================================
CREATE TABLE ai_request_counts (
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('hour', NOW()),
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, window_start)
);

-- =============================================================================
-- RLS: recipes
-- =============================================================================
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Public can read published recipes
CREATE POLICY "Published recipes are public"
  ON recipes FOR SELECT USING (is_published = true);

-- Users can read their own unpublished drafts
CREATE POLICY "Users can read own recipes"
  ON recipes FOR SELECT USING (auth.uid() = user_id);

-- FIX #1: Separate INSERT policy with WITH CHECK (not FOR ALL)
CREATE POLICY "Users can create recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins manage all recipes"
  ON recipes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- =============================================================================
-- RLS: recipe_reviews
-- =============================================================================
ALTER TABLE recipe_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
  ON recipe_reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can review"
  ON recipe_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own review"
  ON recipe_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- FIX #2: DELETE policy (was missing)
CREATE POLICY "Users can delete own review"
  ON recipe_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- RLS: recipe_favorites
-- =============================================================================
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own favorites"
  ON recipe_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RLS: ai_chat_sessions
-- =============================================================================
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AI sessions"
  ON ai_chat_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- RLS: ai_request_counts (service role only — managed by Edge Function)
-- =============================================================================
ALTER TABLE ai_request_counts ENABLE ROW LEVEL SECURITY;

-- No user-facing policies — only the Edge Function (service role) touches this table
