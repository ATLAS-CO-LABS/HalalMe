import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const supabaseAdmin = createServiceClient();

    // Run reads in parallel: profile, tier table, active donation rule, active points
    const [profileRes, tiersRes, donationRuleRes, activeTxRes, expiringSoonRes] =
      await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("reward_points, lifetime_points, reward_tier, profile_flair")
          .eq("id", user.id)
          .single(),

        supabaseAdmin
          .from("reward_tiers")
          .select("name, min_points, ai_requests_per_hour, sort_order")
          .order("sort_order"),

        supabaseAdmin
          .from("reward_rules")
          .select("points_per_unit, unit")
          .eq("action", "donation")
          .eq("is_active", true)
          .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
          .maybeSingle(),

        supabaseAdmin
          .from("reward_transactions")
          .select("points")
          .eq("user_id", user.id)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),

        supabaseAdmin
          .from("reward_transactions")
          .select("points")
          .eq("user_id", user.id)
          .gt("expires_at", new Date().toISOString())
          .lte("expires_at", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
          .gt("points", 0),
      ]);

    const walletPoints:   number = profileRes.data?.reward_points   ?? 0;
    const lifetimePoints: number = profileRes.data?.lifetime_points ?? 0;
    const tier:           string = profileRes.data?.reward_tier     ?? "bronze";

    // Tier progression is driven by LIFETIME points, never the spendable wallet —
    // otherwise redeeming a reward would make the progress bar look like it fell
    // backward, even though spending can never actually demote a tier.
    const tiers = tiersRes.data ?? [];
    const currentIdx    = tiers.findIndex((t) => t.name === tier);
    const currentTier   = tiers[currentIdx] ?? { min_points: 0, ai_requests_per_hour: 10 };
    const nextTierData  = currentIdx >= 0 && currentIdx < tiers.length - 1
      ? tiers[currentIdx + 1]
      : null;

    const nextTier             = nextTierData?.name ?? null;
    const pointsToNextTier     = nextTierData
      ? Math.max(0, nextTierData.min_points - lifetimePoints)
      : 0;

    // Active (non-expired) points from the ledger
    const activePoints = (activeTxRes.data ?? []).reduce(
      (sum, r) => sum + (r.points > 0 ? r.points : 0), 0
    );

    // Points expiring in next 30 days
    const expiringSoon = (expiringSoonRes.data ?? []).reduce(
      (sum, r) => sum + r.points, 0
    );

    // Points per £1 donated — read from active rule, fall back to 10
    const donationRule   = donationRuleRes.data;
    const donationPointsPerGbp =
      donationRule?.unit === "per_gbp" ? donationRule.points_per_unit : 10;

    return NextResponse.json({
      reward_points:           walletPoints,
      lifetime_points:         lifetimePoints,
      reward_tier:             tier,
      profile_flair:           profileRes.data?.profile_flair ?? null,
      next_tier:               nextTier,
      points_to_next_tier:     pointsToNextTier,
      current_tier_min_points: currentTier.min_points,
      ai_requests_per_hour:    currentTier.ai_requests_per_hour,
      active_points:           activePoints,
      expiring_soon:           expiringSoon,
      donation_points_per_gbp: donationPointsPerGbp,
    });

  } catch (err) {
    console.error("[rewards/balance]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
