import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const gate = await requireAdmin("merchants", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.trim();
  const mine = searchParams.get("mine") === "1";

  // Determine the viewer's merchants access level for "My Merchants" scoping.
  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions")
      .select("access")
      .eq("user_id", gate.userId)
      .eq("module", "merchants")
      .single();
    canManage = vp?.access === "manage";
  }
  // View-only reps are always scoped to their own book; manage admins/super
  // admins can opt in with ?mine=1.
  const scopeToSelf = !canManage || mine;

  let query = serviceClient
    .from("merchants")
    .select(
      "id, name, owner_name, email, phone, city, post_code, status, assigned_rep, assigned_rep_id, commission_percentage, created_at, invited_at, contacted_at, activated_at, hyperzod_merchant_id, hyperzod_sync_failed"
    )
    .order("created_at", { ascending: false });

  if (scopeToSelf) {
    query = query.eq("assigned_rep_id", gate.userId);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[api/admin/merchants] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch merchants" }, { status: 500 });
  }

  // Attach each merchant's commission review status (for the list badge/filter).
  const { data: comms } = await serviceClient
    .from("merchant_commission")
    .select("merchant_id, review_status");
  const reviewByMerchant = new Map(
    (comms ?? []).map((c) => [c.merchant_id, c.review_status as string]),
  );

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

  return NextResponse.json({ merchants, canManage, scopedToSelf: scopeToSelf });
}
