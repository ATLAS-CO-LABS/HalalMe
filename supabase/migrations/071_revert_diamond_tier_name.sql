-- =============================================================================
-- 071_revert_diamond_tier_name.sql
-- HME-WEB-DEC-001 (Sami, 9 Aug 2026), WA-31 override: the founder decision doc
-- locks the public tier vocabulary as Bronze -> Silver -> Gold -> Diamond and
-- explicitly says "do not rename Diamond to Platinum". This reverses the DB
-- half of 070_hub_to_social_rename.sql, which had renamed the tier-diamond
-- badge's display text to "Platinum" per the (now superseded) WA-31 default.
--
-- Badge slug 'tier-diamond' was never changed and stays as-is — it already
-- matches the now-locked name, and user_badges.badge_slug references it by
-- text match with no FK, so touching the slug itself would still be unsafe.
-- Only name/description (public display text) are reverted here.
--
-- Internal tier keys ('platinum' in TIER_ORDER, min_tier_required, etc.) are
-- left unchanged in code and DB, same as the original rename — those are
-- internal identifiers, not public copy, matching the precedent set for RBAC
-- keys and CSS variables in the Hub -> Social rename.
-- =============================================================================

UPDATE badges
SET name = 'Diamond', description = 'Reached Diamond tier'
WHERE slug = 'tier-diamond' AND name = 'Platinum';
