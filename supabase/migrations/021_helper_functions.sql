-- =============================================================================
-- 021_helper_functions.sql
-- Small helper functions called by Edge Functions via supabase.rpc()
-- =============================================================================

-- Called by stripe-webhook when a donation is refunded
-- Safely decrements reward_points without going below 0
CREATE OR REPLACE FUNCTION decrement_reward_points(p_user_id UUID, p_points INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE profiles
  SET reward_points = GREATEST(0, reward_points - p_points)
  WHERE id = p_user_id;
END;
$$;
