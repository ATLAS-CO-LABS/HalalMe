import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

// Tier data is non-sensitive and rarely changes — cache for 1 hour at the CDN edge
export const revalidate = 3600;

export async function GET() {
  try {
    const supabaseAdmin = createServiceClient();

    const { data, error } = await supabaseAdmin
      .from("reward_tiers")
      .select("name, min_points, color, ai_requests_per_hour, sort_order")
      .order("sort_order");

    if (error) {
      console.error("[rewards/tiers]", error.message);
      return NextResponse.json({ error: "Failed to load tiers" }, { status: 500 });
    }

    return NextResponse.json({ tiers: data ?? [] });

  } catch (err) {
    console.error("[rewards/tiers] unexpected:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
