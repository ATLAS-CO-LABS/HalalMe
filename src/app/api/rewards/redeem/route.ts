import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { redeemReward, RedemptionValidationError } from "@/services/pointsService";
import { createRateLimiter, rateLimitResponse } from "@/lib/rateLimit";
import * as Sentry from "@sentry/nextjs";

const limiter = createRateLimiter("rewards-redeem", 10, "1 m");

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

    const { success, reset } = await limiter.limit(user.id);
    if (!success) return rateLimitResponse(reset);

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
      // Known validation failures (insufficient points, tier, velocity, ...) — safe to show the user.
      if (err instanceof RedemptionValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      console.error("[rewards/redeem]", err);
      Sentry.captureException(err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  } catch (err) {
    console.error("[rewards/redeem]", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
