-- =============================================================================
-- 009_indexes.sql
-- FIX #4: All performance indexes
-- =============================================================================

-- profiles
CREATE INDEX idx_profiles_username    ON profiles(username);
CREATE INDEX idx_profiles_role        ON profiles(role);
CREATE INDEX idx_profiles_reward_tier ON profiles(reward_tier);

-- recipes
CREATE INDEX idx_recipes_user_id      ON recipes(user_id);
CREATE INDEX idx_recipes_cuisine      ON recipes(cuisine);
CREATE INDEX idx_recipes_difficulty   ON recipes(difficulty);
CREATE INDEX idx_recipes_is_published ON recipes(is_published);
CREATE INDEX idx_recipes_created_at   ON recipes(created_at DESC);
CREATE INDEX idx_recipes_avg_rating   ON recipes(avg_rating DESC NULLS LAST);

-- recipe_reviews
CREATE INDEX idx_reviews_recipe_id ON recipe_reviews(recipe_id);
CREATE INDEX idx_reviews_user_id   ON recipe_reviews(user_id);

-- recipe_favorites
CREATE INDEX idx_favorites_user_id   ON recipe_favorites(user_id);
CREATE INDEX idx_favorites_recipe_id ON recipe_favorites(recipe_id);

-- ai_chat_sessions
CREATE INDEX idx_ai_sessions_user_id ON ai_chat_sessions(user_id);

-- (Hub, Fresh, Rewards, Travel, Blog indexes will be added when those modules are implemented)
