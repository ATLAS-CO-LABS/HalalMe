import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";
import type { SupabaseClient } from "@supabase/supabase-js";

// posts.comment_count is trigger-maintained on real INSERT/DELETE of top-level
// comments only. Soft-delete/restore are UPDATEs (no trigger), so we keep the
// public count honest here. Read-modify-write is fine at admin concurrency.
async function bumpCommentCount(db: SupabaseClient, postId: string, delta: number) {
  const { data } = await db.from("posts").select("comment_count").eq("id", postId).single();
  const next = Math.max(0, ((data?.comment_count as number) ?? 0) + delta);
  await db.from("posts").update({ comment_count: next }).eq("id", postId);
}

// PATCH /api/admin/hub/comments/[id] — { restore: true } restores from Trash.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("hub", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const db = gate.serviceClient;

  let body: { restore?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (body.restore !== true) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data: c } = await db.from("comments").select("parent_id, post_id").eq("id", id).single();
  const { error } = await db.from("comments").update({ deleted_at: null, deleted_by: null }).eq("id", id);
  if (error) {
    console.error("[api/admin/hub/comments/[id]] restore error", error);
    return NextResponse.json({ error: "Failed to restore comment" }, { status: 500 });
  }
  if (c && !c.parent_id && c.post_id) await bumpCommentCount(db, c.post_id as string, +1);

  await logAdminAction(gate, {
    action: "comment.restore", module: "hub", targetType: "comment", targetId: id,
    summary: "Restored comment from Trash",
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/hub/comments/[id]
//   default  → soft delete (Trash): set deleted_at, hide from public.
//   ?hard=1  → permanent delete (cascades to replies via the parent_id self-FK).
// Manage-only.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const hard = new URL(req.url).searchParams.get("hard") === "1";

  const gate = await requireAdmin("hub", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const db = gate.serviceClient;

  const { data: c } = await db.from("comments").select("parent_id, post_id, deleted_at").eq("id", id).single();
  const topLevel = !!c && !c.parent_id;

  if (hard) {
    // If it was already soft-deleted (count already decremented), pre-increment
    // to cancel the ON DELETE trigger's decrement — net effect stays at -1.
    if (topLevel && c?.deleted_at && c.post_id) await bumpCommentCount(db, c.post_id as string, +1);
    const { error } = await db.from("comments").delete().eq("id", id);
    if (error) {
      console.error("[api/admin/hub/comments/[id]] purge error", error);
      return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
    await logAdminAction(gate, {
      action: "comment.purge", module: "hub", targetType: "comment", targetId: id,
      summary: "Permanently deleted comment and any replies",
    });
    return NextResponse.json({ ok: true });
  }

  const { error } = await db
    .from("comments")
    .update({ deleted_at: new Date().toISOString(), deleted_by: gate.userId })
    .eq("id", id);
  if (error) {
    console.error("[api/admin/hub/comments/[id]] soft-delete error", error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
  if (topLevel && c?.post_id) await bumpCommentCount(db, c.post_id as string, -1);

  await logAdminAction(gate, {
    action: "comment.delete", module: "hub", targetType: "comment", targetId: id,
    summary: "Moved comment to Trash",
  });

  return NextResponse.json({ ok: true });
}
