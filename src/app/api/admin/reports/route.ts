import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, type AdminModule } from "@/lib/adminAuth";
import { logAdminAction } from "@/lib/adminAudit";

// Posts & comments are moderated under the "hub" module; recipes under "kitchen".
function moduleForType(type: string): AdminModule {
  return type === "recipe" ? "kitchen" : "hub";
}

interface Grouped {
  contentType: string;
  contentId: string;
  reportCount: number;
  reasons: string[];
  lastReportedAt: string;
  status: string;
}

// GET /api/admin/reports?type=post|comment|recipe&status=open|all
// The moderation queue: user-submitted reports grouped per content item, newest
// first, with a preview of the reported content.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "post";
  const status = searchParams.get("status") ?? "open";
  if (!["post", "comment", "recipe"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const mod = moduleForType(type);
  const gate = await requireAdmin(mod, "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let q = serviceClient
    .from("content_reports")
    .select("content_type, content_id, reason, status, created_at")
    .eq("content_type", type)
    .order("created_at", { ascending: false });
  if (status !== "all") q = q.eq("status", status);

  const { data: reports, error } = await q;
  if (error) {
    console.error("[api/admin/reports] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }

  // Group reports by content item.
  const byContent = new Map<string, Grouped>();
  for (const r of reports ?? []) {
    const g: Grouped = byContent.get(r.content_id) ?? {
      contentType: r.content_type, contentId: r.content_id,
      reportCount: 0, reasons: [], lastReportedAt: r.created_at, status: r.status,
    };
    g.reportCount += 1;
    if (!g.reasons.includes(r.reason)) g.reasons.push(r.reason);
    byContent.set(r.content_id, g);
  }
  const groups = [...byContent.values()].sort((a, b) => b.reportCount - a.reportCount);
  const ids = groups.map((g) => g.contentId);

  // Resolve a preview for each reported item (content + author + visibility).
  const previews: Record<string, { text: string; author: string | null; isPublished?: boolean; postId?: string }> = {};
  if (ids.length > 0) {
    if (type === "post") {
      const { data } = await serviceClient
        .from("posts")
        .select("id, content, is_published, author:profiles!posts_user_id_fkey(full_name, username)")
        .in("id", ids);
      for (const p of (data ?? []) as unknown as { id: string; content: string; is_published: boolean; author: { full_name?: string; username?: string } | { full_name?: string; username?: string }[] | null }[]) {
        const a = Array.isArray(p.author) ? p.author[0] : p.author;
        previews[p.id] = { text: p.content ?? "", author: a?.full_name ?? (a?.username ? `@${a.username}` : null), isPublished: p.is_published };
      }
    } else if (type === "comment") {
      const { data } = await serviceClient
        .from("comments")
        .select("id, content, post_id, author:profiles!comments_user_id_fkey(full_name, username)")
        .in("id", ids);
      for (const c of (data ?? []) as unknown as { id: string; content: string; post_id: string; author: { full_name?: string; username?: string } | { full_name?: string; username?: string }[] | null }[]) {
        const a = Array.isArray(c.author) ? c.author[0] : c.author;
        previews[c.id] = { text: c.content ?? "", author: a?.full_name ?? (a?.username ? `@${a.username}` : null), postId: c.post_id };
      }
    } else {
      const { data } = await serviceClient
        .from("recipes")
        .select("id, title, is_published, author:profiles!recipes_user_id_fkey(full_name, username)")
        .in("id", ids);
      for (const r of (data ?? []) as unknown as { id: string; title: string; is_published: boolean; author: { full_name?: string; username?: string } | { full_name?: string; username?: string }[] | null }[]) {
        const a = Array.isArray(r.author) ? r.author[0] : r.author;
        previews[r.id] = { text: r.title ?? "", author: a?.full_name ?? (a?.username ? `@${a.username}` : null), isPublished: r.is_published };
      }
    }
  }

  const items = groups.map((g) => ({
    ...g,
    preview: previews[g.contentId] ?? { text: "(content removed)", author: null },
    deleted: !previews[g.contentId],
  }));

  const canManage = gate.access === "manage";

  return NextResponse.json({ items, total: items.length, canManage });
}

// PATCH /api/admin/reports  { contentType, contentId, action: "dismiss" | "reviewed" }
// Resolve all open reports for a content item: "dismiss" (no violation) or
// "reviewed" (after the admin hid/deleted the content via the normal endpoints).
export async function PATCH(req: NextRequest) {
  let body: { contentType?: string; contentId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { contentType, contentId, action } = body;
  if (!contentType || !["post", "comment", "recipe"].includes(contentType)) {
    return NextResponse.json({ error: "Invalid contentType" }, { status: 400 });
  }
  if (!contentId) return NextResponse.json({ error: "contentId is required" }, { status: 400 });
  if (action !== "dismiss" && action !== "reviewed") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const gate = await requireAdmin(moduleForType(contentType), "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const newStatus = action === "dismiss" ? "dismissed" : "reviewed";
  const { data, error } = await serviceClient
    .from("content_reports")
    .update({ status: newStatus, reviewed_by: gate.userId, reviewed_at: new Date().toISOString() })
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .eq("status", "open")
    .select("id");

  if (error) {
    console.error("[api/admin/reports] resolve error", error);
    return NextResponse.json({ error: "Failed to resolve reports" }, { status: 500 });
  }

  logAdminAction(gate, {
    action: `report.${action}`, module: moduleForType(contentType), targetType: contentType, targetId: contentId,
    summary: `${action === "dismiss" ? "Dismissed" : "Resolved"} ${data?.length ?? 0} report${(data?.length ?? 0) !== 1 ? "s" : ""} on a ${contentType}`,
    metadata: { count: data?.length ?? 0 },
  });

  return NextResponse.json({ resolved: data?.length ?? 0 });
}
