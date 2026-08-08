-- =============================================================================
-- 070_hub_to_social_rename.sql
-- WA-30: the Hub page was renamed to Social (route /hub -> /social, see
-- next.config.ts redirects). This migration catches the copy that lived in
-- the database instead of the codebase, which the code-only sweep couldn't
-- reach: reward catalog descriptions, badge descriptions, and the trigger
-- that generates new "Posted in Hub" ledger entries going forward.
--
-- Also folds in the DB half of WA-31 (Diamond -> Platinum tier naming) that
-- the earlier session's TIER_LABEL map fix in RewardsTab.tsx missed: the
-- `badges` catalog row for the platinum tier still displayed "Diamond".
-- Badge slugs (e.g. 'tier-diamond') are left unchanged — they're internal
-- identifiers referenced by user_badges.badge_slug, not public copy, and
-- renaming them risks orphaning already-earned badges for no visible benefit.
-- =============================================================================


-- 1. Reward catalog: "in Hub" -> "on Social" in redemption descriptions.
UPDATE reward_catalog
SET description = replace(description, ' in Hub', ' on Social')
WHERE description ILIKE '% in Hub%';

UPDATE reward_catalog
SET description = 'Feature your Social post for 5 days.'
WHERE category = 'hub_post_boost' AND description = 'Feature your Hub post for 5 days.';


-- 2. Badges: first-post description, and the Diamond -> Platinum display rename.
UPDATE badges
SET description = 'Shared your first post on Social'
WHERE slug = 'first-post' AND description = 'Shared your first post in Hub';

UPDATE badges
SET name = 'Platinum', description = 'Reached Platinum tier'
WHERE slug = 'tier-diamond';


-- 3. Backfill existing ledger entries so history reads consistently too.
UPDATE reward_transactions
SET description = 'Posted on Social'
WHERE description = 'Posted in Hub';


-- 4. Re-point the post-created trigger so future posts generate the new
--    copy instead of reintroducing "Posted in Hub" / "First post in Hub".
CREATE OR REPLACE FUNCTION handle_post_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM award_points(NEW.user_id, 'first_post', p_description => 'Your first post');
  PERFORM award_points(NEW.user_id, 'daily_post', p_reference_id => NEW.id, p_description => 'Posted on Social');
  PERFORM award_badge(NEW.user_id, 'first-post', 'First post on Social');
  RETURN NEW;
END;
$$;
