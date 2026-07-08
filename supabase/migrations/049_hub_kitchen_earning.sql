-- =============================================================================
-- 049_hub_kitchen_earning.sql
-- Points system — Phase 1, Day 4 (part 1): Hub + Kitchen earning
--
-- Wires the "create things" actions to the award_points engine via DB triggers
-- (posts, recipes, recipe_reviews are inserted straight from the browser, so a
-- trigger is the safe, server-side place to grant points — same pattern as the
-- profile-complete reward).
--
--   posts          -> first_post (50, once) + daily_post (20, 1/day)
--   recipes        -> first_recipe (100, once) + recipe_upload (50, 1/day*)
--   recipe_reviews -> review (25, up to 3/day)
--   donation       -> first_donation (100, once) added to the donation trigger
--
--   * recipe_upload keeps its existing 1/day cap from 005 (anti-farm); tune the
--     rule row later if you want per-recipe.
--
-- Prerequisites: 003_kitchen.sql, 004_hub.sql, 047_award_points_engine.sql
-- =============================================================================


-- 1. New rules (recipe_upload + review already seeded in 005).
INSERT INTO reward_rules (action, label, points_per_unit, unit, max_per_day, max_lifetime)
VALUES
  ('first_post',     'First post',     50,  'fixed', NULL, 1),
  ('daily_post',     'Daily post',     20,  'fixed', 1,    NULL),
  ('first_recipe',   'First recipe',   100, 'fixed', NULL, 1),
  ('first_donation', 'First donation', 100, 'fixed', NULL, 1)
ON CONFLICT (action) DO NOTHING;


-- 2. Hub: post created -> first_post (once) + daily_post (1/day).
CREATE OR REPLACE FUNCTION handle_post_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM award_points(NEW.user_id, 'first_post', p_description => 'Your first post');
  PERFORM award_points(NEW.user_id, 'daily_post', p_reference_id => NEW.id, p_description => 'Posted in Hub');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS posts_award_points ON posts;
CREATE TRIGGER posts_award_points
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION handle_post_created();


-- 3. Kitchen: recipe created -> first_recipe (once) + recipe_upload (1/day).
CREATE OR REPLACE FUNCTION handle_recipe_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM award_points(NEW.user_id, 'first_recipe', p_description => 'Your first recipe');
  PERFORM award_points(NEW.user_id, 'recipe_upload', p_reference_id => NEW.id, p_description => 'Recipe uploaded');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recipes_award_points ON recipes;
CREATE TRIGGER recipes_award_points
  AFTER INSERT ON recipes
  FOR EACH ROW EXECUTE FUNCTION handle_recipe_created();


-- 4. Kitchen: recipe review created -> review (up to 3/day).
CREATE OR REPLACE FUNCTION handle_review_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM award_points(NEW.user_id, 'review', p_reference_id => NEW.id, p_description => 'Recipe review');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS recipe_reviews_award_points ON recipe_reviews;
CREATE TRIGGER recipe_reviews_award_points
  AFTER INSERT ON recipe_reviews
  FOR EACH ROW EXECUTE FUNCTION handle_review_created();


-- 5. Donations: add first_donation (100, once) to the existing completion trigger.
CREATE OR REPLACE FUNCTION handle_donation_completed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_points           INTEGER;
  v_already_rewarded BOOLEAN;
  v_donation_count   INTEGER;
  v_total_donated    NUMERIC;
  v_new_tier         TEXT;
BEGIN
  IF NEW.status <> 'completed' OR OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM reward_transactions
    WHERE source_donation_id = NEW.id AND action = 'donation'
  ) INTO v_already_rewarded;

  IF v_already_rewarded THEN
    RETURN NEW;
  END IF;

  v_points := award_points(
    p_user_id            => NEW.user_id,
    p_action             => 'donation',
    p_amount             => NEW.amount,
    p_description        => 'Donation of ' || NEW.amount || ' ' || NEW.currency || ' to charity',
    p_source_donation_id => NEW.id
  );

  -- First-donation bonus (once ever, via max_lifetime = 1).
  PERFORM award_points(NEW.user_id, 'first_donation', p_description => 'Your first donation');

  NEW.points_earned := v_points;

  UPDATE charities
  SET raised_amount = raised_amount + NEW.amount,
      donor_count   = donor_count   + 1
  WHERE id = NEW.charity_id;

  SELECT COUNT(*) INTO v_donation_count
  FROM donations WHERE user_id = NEW.user_id AND status = 'completed';

  SELECT COALESCE(SUM(amount), 0) INTO v_total_donated
  FROM donations WHERE user_id = NEW.user_id AND status = 'completed';

  SELECT reward_tier INTO v_new_tier FROM profiles WHERE id = NEW.user_id;

  IF v_donation_count = 0 THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'first-giver', 'First donation completed')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  IF v_donation_count = 4 THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'consistent', 'Completed 5 donations')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  IF v_total_donated < 100 AND (v_total_donated + NEW.amount) >= 100 THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'generous', 'Donated £100 in total')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  IF v_new_tier IN ('gold', 'platinum') THEN
    INSERT INTO user_badges (user_id, badge_slug, award_reason)
    VALUES (NEW.user_id, 'champion', 'Reached ' || v_new_tier || ' tier')
    ON CONFLICT (user_id, badge_slug) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
