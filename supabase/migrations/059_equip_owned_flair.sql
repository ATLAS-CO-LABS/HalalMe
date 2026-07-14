-- =============================================================================
-- 059_equip_owned_flair.sql
-- Points system — equip an already-owned flair for free
--
-- Bug: each flair catalog item has max_per_user = 1 (051_redemption_schema),
-- so once a user redeems a second flair it overwrites profiles.profile_flair
-- (052_redeem_reward_engine), but there was no way to switch back to a flair
-- redeemed earlier — clicking "Redeem" on it again just hit the max_per_user
-- guard and returned a confusing "already redeemed" 400. This RPC lets a user
-- re-equip any flair they've already paid for, without spending points again.
-- =============================================================================

CREATE OR REPLACE FUNCTION equip_flair(
  p_user_id         UUID,
  p_catalog_item_id UUID
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_item reward_catalog%ROWTYPE;
BEGIN
  SELECT * INTO v_item FROM reward_catalog WHERE id = p_catalog_item_id;
  IF NOT FOUND OR v_item.category != 'profile_flair' THEN
    RAISE EXCEPTION 'Not a flair';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM reward_redemptions
    WHERE user_id = p_user_id AND catalog_item_id = p_catalog_item_id
      AND status IN ('pending', 'fulfilled')
  ) THEN
    RAISE EXCEPTION 'Flair not owned';
  END IF;

  UPDATE profiles SET profile_flair = v_item.value_metadata->>'flair_slug' WHERE id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION equip_flair(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION equip_flair(UUID, UUID) TO service_role;
