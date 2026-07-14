-- =============================================================================
-- 048_profile_complete_reward.sql
-- Points system — Phase 1, Day 3 (part 1): the onboarding reward
--
-- WHAT & WHY:
--   One "Complete your profile" reward (200 pts, once). It fires when a profile
--   transitions to "complete" — i.e. username AND phone both go from empty to
--   filled, which is exactly what the Complete Profile page does on submit
--   (photo is optional there, so not required).
--
--   Awarded via a DB trigger because the Complete Profile page saves straight
--   from the browser (no server code in that path), so a trigger is the only
--   safe, unfakeable place to grant points. Fires only on the NULL->set
--   transition, so already-onboarded accounts are not retro-awarded.
--
--   200 pts = the £2 minimum redemption, so a new user can redeem immediately
--   (the "first redemption moment"). Fraud-gated by email verification + a real
--   phone number.
--
-- Prerequisites: 005_rewards.sql, 047_award_points_engine.sql
-- =============================================================================


-- 1. Rule (config row). Once per user (max_lifetime = 1).
INSERT INTO reward_rules (action, label, points_per_unit, unit, max_per_day, max_lifetime)
VALUES ('profile_complete', 'Profile completed', 200, 'fixed', NULL, 1)
ON CONFLICT (action) DO NOTHING;


-- 2. Trigger: award once when username + phone both become set.
CREATE OR REPLACE FUNCTION handle_profile_complete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Newly complete = both fields set now, at least one was empty before.
  IF (NEW.username IS NOT NULL AND NEW.phone IS NOT NULL)
     AND (OLD.username IS NULL OR OLD.phone IS NULL) THEN
    PERFORM award_points(
      p_user_id      => NEW.id,
      p_action       => 'profile_complete',
      p_reference_id => NEW.id,               -- one per user (hard dedup)
      p_description  => 'Completed your profile'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- AFTER UPDATE (not BEFORE): award_points issues its own UPDATE on profiles
-- (reward_points/lifetime_points), so we must not be mid-update of the same row.
-- Scoped to username/phone so unrelated profile edits don't run this.
DROP TRIGGER IF EXISTS profiles_profile_complete ON profiles;
CREATE TRIGGER profiles_profile_complete
  AFTER UPDATE OF username, phone ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_profile_complete();
