import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";

const PAGE_SIZE = 20;

// GET /api/rewards/history?before=<ISO timestamp>
// Cursor-paginated ledger, newest first. Pass the created_at of the last row
// you have as `before` to fetch the next page.
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const supabaseAdmin = createServiceClient();
    const before = req.nextUrl.searchParams.get("before");

    let query = supabaseAdmin
      .from("reward_transactions")
      .select("id, points, action, description, created_at, expires_at, source_donation_id, balance_after")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (before) query = query.lt("created_at", before);

    const { data, error } = await query;
    if (error) throw error;

    const transactions = data ?? [];
    return NextResponse.json({
      transactions,
      hasMore: transactions.length === PAGE_SIZE,
    });

  } catch (err) {
    console.error("[rewards/history]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
