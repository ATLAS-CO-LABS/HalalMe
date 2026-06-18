import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const PAGE_SIZE = 25;

// GET /api/admin/charity-applications
//   ?page=0&status=all|pending|under_review|approved|rejected&search=
// Review queue for charity onboarding. Defaults to the pending/under_review
// queue. Returns the current page + global status counts for the stat cards.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("rewards", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("search")?.trim();

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = serviceClient
    .from("charity_applications")
    .select(
      "id, applicant_user_id, legal_name, display_name, registration_number, country, charity_type, category, contact_email, status, external_check_status, charity_id, created_at, reviewed_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    const term = `%${search}%`;
    query = query.or(
      `display_name.ilike.${term},legal_name.ilike.${term},registration_number.ilike.${term},contact_email.ilike.${term}`,
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[api/admin/charity-applications] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }

  // Global status counts (independent of the active filters).
  const [pendingRes, reviewRes, approvedRes, rejectedRes] = await Promise.all([
    serviceClient.from("charity_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    serviceClient.from("charity_applications").select("id", { count: "exact", head: true }).eq("status", "under_review"),
    serviceClient.from("charity_applications").select("id", { count: "exact", head: true }).eq("status", "approved"),
    serviceClient.from("charity_applications").select("id", { count: "exact", head: true }).eq("status", "rejected"),
  ]);

  // Does the viewer have manage-level on rewards? Controls whether the UI shows
  // approve/reject/edit actions. Super admins always do.
  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions")
      .select("access")
      .eq("user_id", gate.userId)
      .eq("module", "rewards")
      .single();
    canManage = vp?.access === "manage";
  }

  return NextResponse.json({
    applications: data ?? [],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    canManage,
    stats: {
      pending: pendingRes.count ?? 0,
      underReview: reviewRes.count ?? 0,
      approved: approvedRes.count ?? 0,
      rejected: rejectedRes.count ?? 0,
    },
  });
}
