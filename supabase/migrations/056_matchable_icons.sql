-- =============================================================================
-- 056_matchable_icons.sql
-- Points system — Phase 1, Day 6 fix: distinct, matchable icons
--
-- Two problems found:
--   1. All 4 profile_flair catalog items shared one generic category icon
--      (Palette) — visually indistinguishable in the redeem grid.
--   2. All 4 tier badges (bronze/silver/gold/diamond) used the same 'Award'
--      icon — no visual distinction between tiers.
--
-- Fix: give each flair its own icon via value_metadata (client reads
-- value_metadata.icon, falling back to the category icon for boosts/AI which
-- were already distinct). Give each tier badge a different icon.
-- =============================================================================

UPDATE reward_catalog SET value_metadata = value_metadata || '{"icon": "Crown"}'::jsonb
  WHERE value_metadata->>'flair_slug' = 'gold-frame';
UPDATE reward_catalog SET value_metadata = value_metadata || '{"icon": "Waves"}'::jsonb
  WHERE value_metadata->>'flair_slug' = 'ocean-wave';
UPDATE reward_catalog SET value_metadata = value_metadata || '{"icon": "Sunset"}'::jsonb
  WHERE value_metadata->>'flair_slug' = 'sunset';
UPDATE reward_catalog SET value_metadata = value_metadata || '{"icon": "Circle"}'::jsonb
  WHERE value_metadata->>'flair_slug' = 'minimal-mono';

UPDATE badges SET icon = 'Medal' WHERE slug = 'tier-bronze';
UPDATE badges SET icon = 'ShieldCheck' WHERE slug = 'tier-silver';
UPDATE badges SET icon = 'Trophy' WHERE slug = 'tier-gold';
-- tier-diamond keeps 'Gem'; champion (charity) keeps 'Trophy' — different category, fine.
