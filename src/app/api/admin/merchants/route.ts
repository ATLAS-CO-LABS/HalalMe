import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { ilikeTerm } from "@/lib/adminSearch";
import { parsePageSize } from "@/lib/adminPaging";

export async function GET(req: NextRequest) {
  const gate = await requireAdmin("merchants", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();
  const mine = searchParams.get("mine") === "1";
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const PAGE_SIZE = parsePageSize(searchParams);
  // Explicit id set — used by the "needs attention" / "commission review" views,
  // whose membership is computed by the stats endpoint.
  const idsParam = searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : null;

  // Determine the viewer's merchants access level for "My Merchants" scoping.
  const canManage = gate.access === "manage";
  // View-only reps are always scoped to their own book; manage admins/super
  // admins can opt in with ?mine=1.
  const scopeToSelf = !canManage || mine;

  // When an explicit id set is supplied (attention/review views) we return those
  // rows in full without pagination — the set is already small and bounded.
  const usingIds = ids !== null;

  let query = serviceClient
    .from("merchants")
    .select(
      "id, name, owner_name, email, phone, city, post_code, status, assigned_rep, assigned_rep_id, commission_percentage, created_at, invited_at, contacted_at, activated_at, hyperzod_merchant_id, hyperzod_sync_failed",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (scopeToSelf) {
    query = query.eq("assigned_rep_id", gate.userId);
  }

  if (usingIds) {
    if (ids.length === 0) {
      // Nothing to show — short-circuit so we don't return the whole table.
      return NextResponse.json({ merchants: [], total: 0, page: 0, pageSize: PAGE_SIZE, canManage, scopedToSelf: scopeToSelf });
    }
    query = query.in("id", ids);
  } else {
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    const term = ilikeTerm(search);
    if (term) {
      query = query.or(`name.ilike.${term},email.ilike.${term}`);
    }
    query = query.range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[api/admin/merchants] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 });
  }

  const pageIds = (data ?? []).map((m) => m.id);

  // Attach each merchant's commission review status (for the list badge), scoped
  // to just this page's merchants.
  let reviewByMerchant = new Map<string, string>();
  if (pageIds.length > 0) {
    const { data: comms } = await serviceClient
      .from("merchant_commission")
      .select("merchant_id, review_status")
      .in("merchant_id", pageIds);
    reviewByMerchant = new Map(
      (comms ?? []).map((c) => [c.merchant_id as string, c.review_status as string]),
    );
  }

  // Resolve assigned_rep_id → name so the list can show the linked team member.
  const repIds = [...new Set((data ?? []).map((m) => m.assigned_rep_id).filter(Boolean))] as string[];
  let repNameById = new Map<string, string>();
  if (repIds.length > 0) {
    const { data: reps } = await serviceClient
      .from("profiles")
      .select("id, full_name")
      .in("id", repIds);
    repNameById = new Map((reps ?? []).map((r) => [r.id, r.full_name]));
  }

  const merchants = (data ?? []).map((m) => ({
    ...m,
    commission_review_status: reviewByMerchant.get(m.id) ?? null,
    assigned_rep_name: m.assigned_rep_id ? repNameById.get(m.assigned_rep_id) ?? null : null,
  }));

  return NextResponse.json({
    merchants,
    total: count ?? merchants.length,
    page,
    pageSize: PAGE_SIZE,
    canManage,
    scopedToSelf: scopeToSelf,
  });
}
