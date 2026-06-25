import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { isSuperAdmin } from "@/lib/adminRoles";
import { ilikeTerm } from "@/lib/adminSearch";

const PAGE_SIZE = 30;

// GET /api/admin/audit?page=0&module=all&action=&search=
// The admin action history. Super-admin only — this is the accountability record
// and must not be readable (or filterable) by regular admins.
export async function GET(req: NextRequest) {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServiceClient();
  const { data: profile } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!isSuperAdmin(profile?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const moduleFilter = searchParams.get("module") ?? "all";
  const search = searchParams.get("search");
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = db
    .from("admin_audit_log")
    .select("id, actor_id, actor_role, action, module, target_type, target_id, summary, metadata, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (moduleFilter !== "all") query = query.eq("module", moduleFilter);

  const term = ilikeTerm(search);
  if (term) query = query.or(`summary.ilike.${term},action.ilike.${term}`);

  const { data, count, error } = await query;
  if (error) {
    console.error("[api/admin/audit] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch audit log" }, { status: 500 });
  }

  const rows = data ?? [];

  // Resolve actor display names for this page.
  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))] as string[];
  const nameById = new Map<string, { full_name: string | null; email: string | null }>();
  if (actorIds.length > 0) {
    const { data: actors } = await db.from("profiles").select("id, full_name, email").in("id", actorIds);
    for (const a of actors ?? []) nameById.set(a.id, { full_name: a.full_name, email: a.email });
  }

  const entries = rows.map((r) => ({
    ...r,
    actor: r.actor_id ? (nameById.get(r.actor_id) ?? null) : null,
  }));

  return NextResponse.json({ entries, total: count ?? 0, page, pageSize: PAGE_SIZE });
}
