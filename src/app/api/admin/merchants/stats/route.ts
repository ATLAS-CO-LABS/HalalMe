import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getFollowUp } from "@/lib/followUps";

const PIPELINE_ORDER = ["pending", "invited", "contacted", "negotiating", "agreed", "live", "rejected"] as const;

// GET /api/admin/merchants/stats?mine=1
// Aggregates for the pipeline rail (donut, top cities, recent activity) and the
// status-filter counts + the "needs attention" / "commission review" sets.
//
// Computed server-side over a minimal column set so the browser never has to load
// the full merchant table (the list itself is paginated separately). At very large
// scale these counts should move to SQL aggregates/RPC; the per-row follow-up
// logic is kept here in JS so it stays a single source of truth (see lib/followUps).
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("merchants", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const mine = new URL(req.url).searchParams.get("mine") === "1";

  // Same scoping rule as the list route: view-only reps are always scoped to their
  // own book; manage admins can opt in with ?mine=1.
  const canManage = gate.access === "manage";
  const scopeToSelf = !canManage || mine;

  let query = serviceClient
    .from("merchants")
    .select("id, name, status, city, created_at, invited_at, contacted_at")
    .order("created_at", { ascending: false });
  if (scopeToSelf) query = query.eq("assigned_rep_id", gate.userId);

  const { data, error } = await query;
  if (error) {
    console.error("[api/admin/merchants/stats] fetch error", error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
  const rows = data ?? [];

  // Commission reviews still pending a decision (across all statuses).
  const { data: comms } = await serviceClient
    .from("merchant_commission")
    .select("merchant_id, review_status")
    .eq("review_status", "pending");
  const reviewIds = (comms ?? [])
    .map((c) => c.merchant_id as string)
    .filter((id) => rows.some((m) => m.id === id));

  // Status counts.
  const byStatus = Object.fromEntries(PIPELINE_ORDER.map((k) => [k, 0])) as Record<string, number>;
  for (const m of rows) if (m.status in byStatus) byStatus[m.status]++;

  // Top cities.
  const cityCounts = rows.reduce<Record<string, number>>((acc, m) => {
    const c = m.city?.trim();
    if (c) acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});
  const topCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Needs-attention set (shared follow-up brain).
  const attentionIds = rows
    .filter((m) => getFollowUp({ status: m.status, created_at: m.created_at, invited_at: m.invited_at, contacted_at: m.contacted_at }) !== null)
    .map((m) => m.id);

  const weekAgo = Date.now() - 7 * 86_400_000;
  const newThisWeek = rows.filter((m) => new Date(m.created_at).getTime() >= weekAgo).length;

  const recent = rows.slice(0, 4).map((m) => ({ id: m.id, name: m.name, created_at: m.created_at }));

  return NextResponse.json({
    total: rows.length,
    byStatus,
    live: byStatus.live ?? 0,
    newThisWeek,
    topCities,
    recent,
    attention: { count: attentionIds.length, ids: attentionIds },
    reviewPending: { count: reviewIds.length, ids: reviewIds },
  });
}
