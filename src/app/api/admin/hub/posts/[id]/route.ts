import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

// GET /api/admin/hub/posts/[id] — full post + author + a sample of recent
// comments, via service role so admins can preview even hidden posts.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("hub", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { data: post, error } = await serviceClient
    .from("posts")
    .select("*, author:profiles!posts_user_id_fkey(id, full_name, username, avatar_url)")
    .eq("id", id)
    .single();

  if (error || !post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // A handful of recent comments for context.
  const { data: comments } = await serviceClient
    .from("comments")
    .select("id, content, created_at, author:profiles!comments_user_id_fkey(full_name, username)")
    .eq("post_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({ post, comments: comments ?? [] });
}

// PATCH /api/admin/hub/posts/[id] — { is_published: boolean } (unpublish/republish).
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("hub", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  let body: { is_published?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body.is_published !== "boolean") {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await gate.serviceClient
    .from("posts")
    .update({ is_published: body.is_published })
    .eq("id", id);
  if (error) {
    console.error("[api/admin/hub/posts/[id]] update error", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/hub/posts/[id] — hard delete (cascades to comments, likes,
// bookmarks, notifications via FK ON DELETE CASCADE).
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("hub", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { error } = await gate.serviceClient.from("posts").delete().eq("id", id);
  if (error) {
    console.error("[api/admin/hub/posts/[id]] delete error", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
