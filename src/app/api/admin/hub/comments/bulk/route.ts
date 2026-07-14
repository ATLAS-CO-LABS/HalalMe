import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";
import type { SupabaseClient } from "@supabase/supabase-js";

// Apply per-post comment_count deltas (trigger only covers real INSERT/DELETE of
// top-level comments, so soft-delete/restore are reconciled here).
async function applyCountDeltas(db: SupabaseClient, deltas: Map<string, number>) {
  for (const [postId, delta] of deltas) {
    if (delta === 0) continue;
    const { data } = await db.from("posts").select("comment_count").eq("id", postId).single();
    const next = Math.max(0, ((data?.comment_count as number) ?? 0) + delta);
    await db.from("posts").update({ comment_count: next }).eq("id", postId);
  }
}

// PATCH /api/admin/hub/comments/bulk
//   { action: "delete"|"restore"|"purge", ids: string[] }
// Bulk lifecycle of comments in one request. Manage-only. "delete" soft-deletes
// (Trash); "restore" brings them back; "purge" permanently removes them
// (cascades to replies via the parent_id self-FK). One audit entry per batch.
export async function PATCH(req: NextRequest) {
  const gate = await requireAdmin("hub", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const db = gate.serviceClient;

  let body: { action?: string; ids?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const action = body.action ?? "";
  const ids = Array.isArray(body.ids) ? body.ids.filter((x): x is string => typeof x === "string") : [];
  if (ids.length === 0) return NextResponse.json({ error: "No comments selected" }, { status: 400 });
  if (!["delete", "restore", "purge"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  // Pre-read so we can keep top-level comment counts accurate.
  const { data: rows } = await db.from("comments").select("id, parent_id, post_id, deleted_at").in("id", ids);
  const comments = rows ?? [];
  const deltas = new Map<string, number>();
  const bump = (postId: string | null, d: number) => {
    if (!postId) return;
    deltas.set(postId, (deltas.get(postId) ?? 0) + d);
  };
  for (const c of comments) {
    if (c.parent_id) continue; // only top-level comments affect the count
    if (action === "delete" && !c.deleted_at) bump(c.post_id as string, -1);
    if (action === "restore" && c.deleted_at) bump(c.post_id as string, +1);
    if (action === "purge" && c.deleted_at) bump(c.post_id as string, +1); // offset the ON DELETE trigger
  }

  let q;
  if (action === "delete") {
    q = db.from("comments")
      .update({ deleted_at: new Date().toISOString(), deleted_by: gate.userId })
      .in("id", ids).select("id");
  } else if (action === "restore") {
    q = db.from("comments").update({ deleted_at: null, deleted_by: null }).in("id", ids).select("id");
  } else {
    q = db.from("comments").delete().in("id", ids).select("id");
  }
  const { data, error } = await q;
  if (error) {
    console.error(`[api/admin/hub/comments/bulk] ${action} error`, error);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }

  await applyCountDeltas(db, deltas);

  const updated = data?.length ?? 0;
  const verb = action === "delete" ? "moved to Trash" : action === "restore" ? "restored" : "permanently deleted";
  logAdminAction(gate, {
    action: `comment.bulk_${action}`, module: "hub", targetType: "comment",
    summary: `Bulk ${verb} ${updated} comment${updated !== 1 ? "s" : ""}`,
    metadata: { count: updated, ids },
  });
  return NextResponse.json({ updated });
}
