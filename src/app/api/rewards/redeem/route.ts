import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { redeemReward } from "@/services/pointsService";

// POST /api/rewards/redeem
// Body: { catalogItemId: string, targetId?: string }
// The user id comes from the session (never the client). All validation
// (balance, tier, velocity, caps) happens inside redeem_reward — this route
// just maps its result to an HTTP response.
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const body = await request.json();
    const catalogItemId = body?.catalogItemId;
    const targetId = body?.targetId;

    if (!catalogItemId || typeof catalogItemId !== "string") {
      return NextResponse.json({ error: "catalogItemId is required" }, { status: 400 });
    }

    try {
      const redemptionId = await redeemReward(user.id, catalogItemId, targetId);
      return NextResponse.json({ redemptionId });
    } catch (err) {
      // redeem_reward validation failures (insufficient points, tier, velocity, ...) — user-facing.
      const message = err instanceof Error ? err.message : "Redemption failed";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  } catch (err) {
    console.error("[rewards/redeem]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
