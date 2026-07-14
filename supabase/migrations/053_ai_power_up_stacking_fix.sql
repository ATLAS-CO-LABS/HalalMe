-- =============================================================================
-- 053_ai_power_up_stacking_fix.sql
-- Points system — Phase 1, Day 6 (part 1): AI power-up tier conflict fix
--
-- Found while reviewing Day 6: reward_tiers.ai_requests_per_hour already
-- defines a per-tier AI limit (Bronze 10 / Silver 20 / Gold 30 / Platinum 50)
-- that Day 5's edge function change ignored (it used a flat default for
-- everyone). That meant Silver+ users weren't getting their tier's higher
-- limit, and the AI power-up (hardcoded to "30") was actually a DOWNGRADE for
-- Gold/Platinum members who already sit at 30/50.
--
-- Fix (edge function, generate-recipe): base limit now comes from the user's
-- tier; the power-up ADDS a bonus on top instead of setting an absolute value.
-- This migration updates value_amount to match — from "30" (absolute) to "20"
-- (bonus), so ai_limit_boosts.boosted_limit is now additive at every tier.
--
-- Prerequisites: 051_redemption_schema.sql
-- =============================================================================

UPDATE reward_catalog
SET value_amount = 20,
    description   = 'Adds +20 AI requests/hour on top of your tier''s limit, for the next 24 hours.'
WHERE category = 'ai_power_up';
