// Shared admin auth + per-module permission gate for /api/admin/* route handlers.
//
// super_admin → implicit full access to every module.
// admin       → access governed by the admin_permissions table (036_admin_roles.sql).
//   'view'   required → passes if the module access is 'view' or 'manage'.
//   'manage' required → passes only if the module access is 'manage'.
//
// Usage:
//   const gate = await requireAdmin("users", "view");
//   if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
//   const { serviceClient, userId, role } = gate;

import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { isStaffRole, isSuperAdmin } from "@/lib/adminRoles";

export type AdminModule =
  | "merchants"
  | "users"
  | "kitchen"
  | "hub"
  | "rewards"
  | "analytics"
  | "support";

export type AccessLevel = "view" | "manage";

type ServiceClient = ReturnType<typeof createServiceClient>;

type AdminGate =
  | { ok: true; serviceClient: ServiceClient; userId: string; role: string }
  | { ok: false; error: string; status: number };

export async function requireAdmin(
  module: AdminModule,
  required: AccessLevel,
): Promise<AdminGate> {
  const serverClient = await createServerClient();
  const {
    data: { user },
  } = await serverClient.auth.getUser();

  if (!user) return { ok: false, error: "Unauthorized", status: 401 };

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isStaffRole(profile?.role)) {
    return { ok: false, error: "Forbidden", status: 403 };
  }

  const role = profile!.role as string;

  // super_admin bypasses the per-module table entirely.
  if (!isSuperAdmin(role)) {
    const { data: perm } = await serviceClient
      .from("admin_permissions")
      .select("access")
      .eq("user_id", user.id)
      .eq("module", module)
      .single();

    const level = (perm?.access as AccessLevel | "none" | undefined) ?? "none";
    const allowed = required === "view" ? level !== "none" : level === "manage";
    if (!allowed) return { ok: false, error: "Forbidden", status: 403 };
  }

  return { ok: true, serviceClient, userId: user.id, role };
}
