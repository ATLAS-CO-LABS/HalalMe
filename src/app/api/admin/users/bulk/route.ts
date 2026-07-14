import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

// PATCH /api/admin/users/bulk
//   { action: "verify" | "unverify" | "suspend" | "activate", ids: string[], reason?: string }
// Applies a moderation action to many users at once. Super admins and the caller
// are always excluded from the operation (never bulk-modify staff/self).
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin("users", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: { action?: string; ids?: string[]; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action;
  const ids = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string") : [];
  if (!action || !["verify", "unverify", "suspend", "activate"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
  if (ids.length === 0) {
    return NextResponse.json({ error: "No users selected" }, { status: 400 });
  }

  const reason = body.reason?.trim();
  if (action === "suspend" && !reason) {
    return NextResponse.json({ error: "A reason is required to suspend" }, { status: 400 });
  }

  // Resolve which of the selected ids are eligible (exclude super admins + self).
  const { data: targets } = await serviceClient
    .from("profiles")
    .select("id, role")
    .in("id", ids);

  const eligible = (targets ?? [])
    .filter((t) => t.role !== "super_admin" && t.id !== gate.userId)
    .map((t) => t.id);

  if (eligible.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  let update: Record<string, unknown>;
  switch (action) {
    case "verify":
      update = { is_verified: true };
      break;
    case "unverify":
      update = { is_verified: false };
      break;
    case "activate":
      update = { status: "active", suspended_reason: null, suspended_at: null, suspended_by: null };
      break;
    case "suspend":
      update = { status: "suspended", suspended_reason: reason, suspended_at: new Date().toISOString(), suspended_by: gate.userId };
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { error } = await serviceClient.from("profiles").update(update).in("id", eligible);
  if (error) {
    console.error("[api/admin/users/bulk] update error", error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }

  logAdminAction(gate, {
    action: `user.bulk_${action}`, module: "users", targetType: "user",
    summary: `Bulk ${action} on ${eligible.length} user${eligible.length !== 1 ? "s" : ""}`,
    metadata: { count: eligible.length, ids: eligible, reason: reason ?? null },
  });

  return NextResponse.json({ updated: eligible.length });
}
