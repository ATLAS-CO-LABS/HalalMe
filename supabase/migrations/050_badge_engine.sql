-- =============================================================================
-- 050_badge_engine.sql
-- Points system — Phase 1, Day 4 (part 2): the badge engine
--
-- Badges are the STATUS layer (recognition, not points — we don't double-pay).
-- Adds a data-driven `badges` catalog (replacing the 4 hardcoded ones on the
-- rewards page), an idempotent award_badge() helper, and wires the launch set:
--   - firsts:   first-post (Hub), first-recipe (Kitchen), first-giver (charity, already wired)
--   - milestone: home-chef (5 recipes)
--   - tier:     tier-silver / tier-gold / tier-diamond (auto on tier-up)
--   - existing charity badges (consistent/generous/champion) already awarded by
--     the donation trigger; here they just join the catalog.
--
-- Prerequisites: 023_badge_awards.sql, 046_points_foundation.sql,
--                049_hub_kitchen_earning.sql
-- =============================================================================


-- 1. Badge catalog.
CREATE TABLE IF NOT EXISTS badges (
  slug         TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT NOT NULL,
  icon         TEXT,                                    -- lucide icon name
  category     TEXT NOT NULL CHECK (category IN ('hub','kitchen','charity','tier','platform')),
  bonus_points INTEGER NOT NULL DEFAULT 0,              -- reserved; badges are status, not points
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO badges (slug, name, description, icon, category, sort_order) VALUES
  ('first-post',   'First Post',       'Shared your first post in Hub', 'MessageSquare', 'hub',     10),
  ('first-recipe', 'First Recipe',     'Uploaded your first recipe',    'ChefHat',       'kitchen', 20),
  ('home-chef',    'Home Chef',        'Uploaded 5 recipes',            'CookingPot',    'kitchen', 21),
  ('first-giver',  'First Giver',      'Made your first donation',      'Heart',         'charity', 30),
  ('consistent',   'Consistent Giver', 'Donated 5 times',               'Calendar',      'charity', 31),
  ('generous',     'Generous Heart',   'Donated £100 in total',         'Gift',          'charity', 32),
  ('champion',     'Charity Champion', 'Reached Gold tier',             'Trophy',        'charity', 33),
  ('tier-bronze',  'Bronze',           'Bronze member',                 'Award',         'tier',    40),
  ('tier-silver',  'Silver',           'Reached Silver tier',           'Award',         'tier',    41),
  ('tier-gold',    'Gold',             'Reached Gold tier',             'Award',         'tier',    42),
  ('tier-diamond', 'Diamond',          'Reached Diamond tier',          'Gem',           'tier',    43)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='badges' AND policyname='Badges are publicly readable'
  ) THEN
    CREATE POLICY "Badges are publicly readable" ON badges FOR SELECT USING (true);
  END IF;
END $$;


-- 2. award_badge() — idempotent insert. Keeps the existing signature
--    (p_badge_slug) so CREATE OR REPLACE works; adds search_path hardening.
--    (Function pre-existed in the DB but was never in a migration — now versioned.)
CREATE OR REPLACE FUNCTION award_badge(p_user_id UUID, p_badge_slug TEXT, p_reason TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO user_badges (user_id, badge_slug, award_reason)
  VALUES (p_user_id, p_badge_slug, COALESCE(p_reason, ''))
  ON CONFLICT (user_id, badge_slug) DO NOTHING;
END;
$$;


-- 3. Hub post trigger — add first-post badge.
CREATE OR REPLACE FUNCTION handle_post_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM award_points(NEW.user_id, 'first_post', p_description => 'Your first post');
  PERFORM award_points(NEW.user_id, 'daily_post', p_reference_id => NEW.id, p_description => 'Posted in Hub');
  PERFORM award_badge(NEW.user_id, 'first-post', 'First post in Hub');
  RETURN NEW;
END;
$$;


-- 4. Kitchen recipe trigger — add first-recipe + home-chef (5 recipes) badges.
CREATE OR REPLACE FUNCTION handle_recipe_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM award_points(NEW.user_id, 'first_recipe', p_description => 'Your first recipe');
  PERFORM award_points(NEW.user_id, 'recipe_upload', p_reference_id => NEW.id, p_description => 'Recipe uploaded');
  PERFORM award_badge(NEW.user_id, 'first-recipe', 'First recipe uploaded');
  IF (SELECT count(*) FROM recipes WHERE user_id = NEW.user_id) >= 5 THEN
    PERFORM award_badge(NEW.user_id, 'home-chef', 'Uploaded 5 recipes');
  END IF;
  RETURN NEW;
END;
$$;


-- 5. Tier trigger — award the tier badge when a user levels up (silver/gold/diamond).
--    'platinum' DB value maps to the 'tier-diamond' badge (display name Diamond).
CREATE OR REPLACE FUNCTION sync_reward_tier()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_slug TEXT;
BEGIN
  NEW.reward_tier = CASE
    WHEN NEW.lifetime_points >= 15000 THEN 'platinum'
    WHEN NEW.lifetime_points >= 5000  THEN 'gold'
    WHEN NEW.lifetime_points >= 1000  THEN 'silver'
    ELSE 'bronze'
  END;

  IF NEW.reward_tier IS DISTINCT FROM OLD.reward_tier AND NEW.reward_tier <> 'bronze' THEN
    v_slug := 'tier-' || CASE NEW.reward_tier WHEN 'platinum' THEN 'diamond' ELSE NEW.reward_tier END;
    PERFORM award_badge(NEW.id, v_slug, 'Reached ' || replace(v_slug, 'tier-', '') || ' tier');
  END IF;

  RETURN NEW;
END;
$$;
