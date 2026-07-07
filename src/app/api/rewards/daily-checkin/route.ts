import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { awardPoints } from "@/services/pointsService";

// POST /api/rewards/daily-checkin
// Awards the daily_login reward for the signed-in user. The user id comes from
// the session (never the client), and the award_points engine caps it at once
// per day — so this is safe to ping on every app load.
export async function POST() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const awarded = await awardPoints(user.id, "daily_login");
    return NextResponse.json({ awarded });
  } catch (err) {
    console.error("[rewards/daily-checkin]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
