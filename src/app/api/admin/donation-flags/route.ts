import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const PAGE_SIZE = 25;

// GET /api/admin/donation-flags
//   ?page=0&status=pending_review|reviewed_safe|reviewed_blocked|auto_cleared|all
// Fraud review queue. Defaults to pending_review. Each row carries the linked
// donation (amount, donor, charity) + the signal breakdown for the detail view.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("rewards", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const status = searchParams.get("status") ?? "pending_review";

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = serviceClient
    .from("donation_flags")
    .select(
      "id, donation_id, flagged_by, flag_type, risk_score_at_flag, signal_breakdown, status, " +
        "reviewer_notes, rewards_delayed, reviewed_at, created_at, " +
        "donation:donations!donation_flags_donation_id_fkey(id, amount, currency, status, created_at, " +
        "user:profiles!donations_user_id_fkey(id, full_name, email), " +
        "charity:charities!donations_charity_id_fkey(id, name))",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") query = query.eq("status", status);

  const { data, count, error } = await query;

  if (error) {
    console.error("[api/admin/donation-flags] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch fraud flags" }, { status: 500 });
  }

  const [pendingRes, safeRes, blockedRes] = await Promise.all([
    serviceClient.from("donation_flags").select("id", { count: "exact", head: true }).eq("status", "pending_review"),
    serviceClient.from("donation_flags").select("id", { count: "exact", head: true }).eq("status", "reviewed_safe"),
    serviceClient.from("donation_flags").select("id", { count: "exact", head: true }).eq("status", "reviewed_blocked"),
  ]);

  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions").select("access")
      .eq("user_id", gate.userId).eq("module", "rewards").single();
    canManage = vp?.access === "manage";
  }

  return NextResponse.json({
    flags: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    canManage,
    stats: {
      pending: pendingRes.count ?? 0,
      safe: safeRes.count ?? 0,
      blocked: blockedRes.count ?? 0,
    },
  });
}
