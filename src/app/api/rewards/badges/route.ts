import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = createServiceClient();
    const targetUserId  = req.nextUrl.searchParams.get("userId");

    // Public fetch — ?userId=xxx returns any user's badges without auth
    if (targetUserId) {
      const { data, error } = await supabaseAdmin
        .from("user_badges")
        .select("badge_slug, awarded_at, award_reason")
        .eq("user_id", targetUserId)
        .order("awarded_at");

      if (error) {
        console.error("[rewards/badges] public fetch:", error.message);
        return NextResponse.json({ error: "Failed to load badges" }, { status: 500 });
      }
      return NextResponse.json({ badges: data ?? [] });
    }

    // No userId → return the authenticated user's own badges
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from("user_badges")
      .select("badge_slug, awarded_at, award_reason")
      .eq("user_id", user.id)
      .order("awarded_at");

    if (error) {
      console.error("[rewards/badges]", error.message);
      return NextResponse.json({ error: "Failed to load badges" }, { status: 500 });
    }
    return NextResponse.json({ badges: data ?? [] });

  } catch (err) {
    console.error("[rewards/badges] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
