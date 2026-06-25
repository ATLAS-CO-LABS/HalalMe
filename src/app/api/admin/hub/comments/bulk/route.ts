import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

// PATCH /api/admin/hub/comments/bulk
//   { action: "delete", ids: string[] }
// Bulk delete comments in one request (cascades to replies via the parent_id
// self-FK). Manage-only. Writes a single audit entry per batch.
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin("hub", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: { action?: string; ids?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (ids.length === 0) return NextResponse.json({ error: "No comments selected" }, { status: 400 });
  if (body.action !== "delete") return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const { data, error } = await serviceClient.from("comments").delete().in("id", ids).select("id");
  if (error) {
    console.error("[api/admin/hub/comments/bulk] delete error", error);
    return NextResponse.json({ error: "Bulk delete failed" }, { status: 500 });
  }
  const updated = data?.length ?? 0;
  await logAdminAction(gate, {
    action: "comment.bulk_delete", module: "hub", targetType: "comment",
    summary: `Bulk deleted ${updated} comment${updated !== 1 ? "s" : ""}`,
    metadata: { count: updated, ids },
  });
  return NextResponse.json({ updated });
}
