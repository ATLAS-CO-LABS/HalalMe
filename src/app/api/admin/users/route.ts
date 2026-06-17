import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const PAGE_SIZE = 25;

// GET /api/admin/users
//   ?page=0&role=all|user|admin&status=all|active|suspended|banned&search=
// Server-side paginated (user volume is large). "admin" role filter includes
// super_admin (both are team members). Returns the current page + global stat
// counts (independent of the active filters) for the dashboard cards.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("users", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const role = searchParams.get("role") ?? "all";
  const status = searchParams.get("status") ?? "all";
  const search = searchParams.get("search")?.trim();
  // export mode returns the full filtered set (capped) for CSV — no pagination/stats.
  const isExport = searchParams.get("export") === "1";
  const EXPORT_CAP = 2000;

  const from = isExport ? 0 : page * PAGE_SIZE;
  const to = isExport ? EXPORT_CAP - 1 : from + PAGE_SIZE - 1;

  let query = serviceClient
    .from("profiles")
    .select(
      "id, full_name, username, email, role, status, is_verified, reward_tier, reward_points, created_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (role === "user") {
    query = query.eq("role", "user");
  } else if (role === "admin") {
    query = query.in("role", ["admin", "super_admin"]);
  }

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    const term = `%${search}%`;
    query = query.or(`full_name.ilike.${term},email.ilike.${term},username.ilike.${term}`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[api/admin/users] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  const users = data ?? [];

  // Export mode: return the rows directly, no merchant/stats overhead.
  if (isExport) {
    return NextResponse.json({ users, total: count ?? users.length });
  }

  // Resolve linked merchants for just this page's users.
  const ids = users.map((u) => u.id);
  let merchantByUser = new Map<string, { id: string; name: string }>();
  if (ids.length > 0) {
    const { data: merchants } = await serviceClient
      .from("merchants")
      .select("id, name, user_id")
      .in("user_id", ids);
    merchantByUser = new Map(
      (merchants ?? [])
        .filter((m) => m.user_id)
        .map((m) => [m.user_id as string, { id: m.id, name: m.name }]),
    );
  }

  const rows = users.map((u) => ({
    ...u,
    linked_merchant: merchantByUser.get(u.id) ?? null,
  }));

  // Global stat counts (not affected by the current filters).
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const [totalRes, weekRes, teamRes, suspendedRes] = await Promise.all([
    serviceClient.from("profiles").select("id", { count: "exact", head: true }),
    serviceClient.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    serviceClient.from("profiles").select("id", { count: "exact", head: true }).in("role", ["admin", "super_admin"]),
    serviceClient.from("profiles").select("id", { count: "exact", head: true }).in("status", ["suspended", "banned"]),
  ]);

  // Does the viewer have manage-level on users? Controls whether the list shows
  // bulk / row mutating actions. Super admins always do.
  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions")
      .select("access")
      .eq("user_id", gate.userId)
      .eq("module", "users")
      .single();
    canManage = vp?.access === "manage";
  }

  return NextResponse.json({
    users: rows,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    canManage,
    stats: {
      total: totalRes.count ?? 0,
      newThisWeek: weekRes.count ?? 0,
      team: teamRes.count ?? 0,
      suspended: suspendedRes.count ?? 0,
    },
  });
}
