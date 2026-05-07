import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const supabaseAdmin = createServiceClient();

    const { data, error } = await supabaseAdmin
      .from("reward_transactions")
      .select("id, points, action, description, created_at, expires_at, source_donation_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ transactions: data ?? [] });

  } catch (err) {
    console.error("[rewards/history]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
