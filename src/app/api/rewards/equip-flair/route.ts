import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { equipFlair, RedemptionValidationError } from "@/services/pointsService";
import { createRateLimiter, rateLimitResponse } from "@/lib/rateLimit";
import * as Sentry from "@sentry/nextjs";

const limiter = createRateLimiter("rewards-equip-flair", 10, "1 m");

// POST /api/rewards/equip-flair
// Body: { catalogItemId: string }
// Re-equips a flair the user already owns (previously redeemed) — free, no
// points spent. Ownership is validated inside equip_flair; this route just
// maps its result to an HTTP response.
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { success, reset } = await limiter.limit(user.id);
    if (!success) return rateLimitResponse(reset);

    const body = await request.json();
    const catalogItemId = body?.catalogItemId;

    if (!catalogItemId || typeof catalogItemId !== "string") {
      return NextResponse.json({ error: "catalogItemId is required" }, { status: 400 });
    }

    try {
      await equipFlair(user.id, catalogItemId);
      return NextResponse.json({ success: true });
    } catch (err) {
      if (err instanceof RedemptionValidationError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      console.error("[rewards/equip-flair]", err);
      Sentry.captureException(err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  } catch (err) {
    console.error("[rewards/equip-flair]", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
