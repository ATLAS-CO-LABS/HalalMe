// Server-side only — never import this in a client component.
// Wraps the award_points() Postgres engine (SECURITY DEFINER, service-role only).
// Every earning action across the platform should award points through here.

import { createServiceClient } from "@/lib/supabase-server";

export interface AwardOptions {
  /** Object this award is tied to (recipe_id, post_id, ...) — enables dedup so
   *  the same object can't be rewarded twice. Omit for once-per-day/once-ever
   *  actions, which are bounded by the rule's caps instead. */
  referenceId?: string;
  /** GBP amount for 'per_gbp' rules (e.g. order/donation total). */
  amount?: number;
  /** Overrides the rule's default description on the ledger row. */
  description?: string;
  /** Multiplier applied to the base points (default 1.0). Reserved for
   *  tier/seasonal multipliers in Phase 2. */
  multiplier?: number;
}

/**
 * Award points for `action` to `userId`. Returns the number of points actually
 * granted — 0 if there is no active rule, a cap was hit, or it was a duplicate.
 * Never throws for "nothing to award"; logs and returns 0 on a real DB error.
 */
export async function awardPoints(
  userId: string,
  action: string,
  opts: AwardOptions = {},
): Promise<number> {
  const admin = createServiceClient();

  const { data, error } = await admin.rpc("award_points", {
    p_user_id: userId,
    p_action: action,
    p_reference_id: opts.referenceId ?? null,
    p_amount: opts.amount ?? null,
    p_description: opts.description ?? null,
    p_multiplier: opts.multiplier ?? 1.0,
  });

  if (error) {
    console.error(`[pointsService] award "${action}" failed:`, error.message);
    return 0;
  }

  return (data as number | null) ?? 0;
}

/**
 * Redeem `catalogItemId` for `userId`. `targetId` is the recipe/post being
 * boosted — required for recipe_boost/hub_post_boost items, ignored otherwise.
 * Returns the new redemption id. Throws on validation failure (insufficient
 * points, tier too low, velocity cap, etc.) — the caller maps that to a 400.
 */
export async function redeemReward(
  userId: string,
  catalogItemId: string,
  targetId?: string,
): Promise<string> {
  const admin = createServiceClient();

  const { data, error } = await admin.rpc("redeem_reward", {
    p_user_id: userId,
    p_catalog_item_id: catalogItemId,
    p_target_id: targetId ?? null,
  });

  if (error) throw new Error(error.message);

  return data as string;
}
