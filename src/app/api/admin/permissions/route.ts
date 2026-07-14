import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { isSuperAdmin } from "@/lib/adminRoles";
import type { AdminModule } from "@/lib/adminAuth";

// The full set of gated modules (mirrors the admin_permissions CHECK constraint).
const MODULES: AdminModule[] = ["merchants", "users", "kitchen", "hub", "rewards", "analytics", "support"];

// GET /api/admin/permissions
// Super-admin only. Returns every staff member (admin + super_admin) with their
// resolved per-module access grid, for the Roles & Permissions screen.
// super_admins implicitly have "manage" on everything.
export async function GET() {
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = createServiceClient();
  const { data: me } = await db.from("profiles").select("role").eq("id", user.id).single();
  if (!isSuperAdmin(me?.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: staff, error } = await db
    .from("profiles")
    .select("id, full_name, email, avatar_url, role")
    .in("role", ["admin", "super_admin"])
    .order("role", { ascending: true }) // admins before super_admins alphabetically
    .order("full_name", { ascending: true });

  if (error) {
    console.error("[api/admin/permissions] fetch error", error);
    return NextResponse.json({ error: "Failed to load team" }, { status: 500 });
  }

  const members = staff ?? [];
  const adminIds = members.filter((m) => m.role === "admin").map((m) => m.id);

  const byUser = new Map<string, Record<string, string>>();
  if (adminIds.length > 0) {
    const { data: perms } = await db
      .from("admin_permissions")
      .select("user_id, module, access")
      .in("user_id", adminIds);
    for (const p of perms ?? []) {
      const grid = byUser.get(p.user_id) ?? {};
      grid[p.module] = p.access;
      byUser.set(p.user_id, grid);
    }
  }

  const team = members.map((m) => ({
    id: m.id,
    full_name: m.full_name,
    email: m.email,
    avatar_url: m.avatar_url,
    role: m.role,
    permissions: Object.fromEntries(
      MODULES.map((mod) => [
        mod,
        m.role === "super_admin" ? "manage" : (byUser.get(m.id)?.[mod] ?? "none"),
      ]),
    ) as Record<AdminModule, "none" | "view" | "manage">,
  }));

  return NextResponse.json({ team, modules: MODULES, viewerId: user.id });
}
