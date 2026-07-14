import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { ilikeTerm } from "@/lib/adminSearch";
import { parsePageSize } from "@/lib/adminPaging";

// Shape of the joined inbox row. The multi-FK-hint embeds aren't in the
// generated Supabase types, so the typed select parser can't infer this — we
// cast the (valid at runtime) PostgREST result to this shape.
type Ref = { id: string; full_name: string | null; username?: string | null; avatar_url?: string | null; email?: string | null };
interface ConvRow {
  id: string;
  subject: string;
  status: string;
  priority: string;
  delivery_reference: string | null;
  last_message_at: string;
  created_at: string;
  requester_email: string | null;
  requester_name: string | null;
  requester: Ref | Ref[] | null;
  assignee: Ref | Ref[] | null;
  merchant: { id: string; name: string } | { id: string; name: string }[] | null;
}

// GET /api/admin/support/conversations
//   ?page=0&status=all|open|pending|resolved|closed
//   &source=all|user|merchant&assigned=all|me|unassigned
// Support inbox list. Returns the page + global status counts for the header.
export async function GET(req: NextRequest) {
  const gate = await requireAdmin("support", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { searchParams } = new URL(req.url);
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const PAGE_SIZE = parsePageSize(searchParams);
  const status = searchParams.get("status") ?? "all";
  const source = searchParams.get("source") ?? "all";
  const assigned = searchParams.get("assigned") ?? "all";
  const search = searchParams.get("search")?.trim();

  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = serviceClient
    .from("support_conversations")
    .select(
      "id, subject, status, priority, delivery_reference, last_message_at, created_at, requester_email, requester_name, requester:profiles!support_conversations_user_id_fkey(id, full_name, username, avatar_url, email), assignee:profiles!support_conversations_assigned_to_fkey(id, full_name), merchant:merchants!support_conversations_merchant_id_fkey(id, name)",
      { count: "exact" },
    )
    .order("last_message_at", { ascending: false })
    .range(from, to);

  if (["open", "pending", "resolved", "closed"].includes(status)) {
    query = query.eq("status", status);
  }
  if (source === "merchant") query = query.not("merchant_id", "is", null);
  else if (source === "user") query = query.is("merchant_id", null);

  if (assigned === "me") query = query.eq("assigned_to", gate.userId);
  else if (assigned === "unassigned") query = query.is("assigned_to", null);

  // Search across subject + the guest/denormalised requester fields + delivery ref.
  const term = ilikeTerm(search);
  if (term) {
    query = query.or(`subject.ilike.${term},requester_name.ilike.${term},requester_email.ilike.${term},delivery_reference.ilike.${term}`);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[api/admin/support/conversations] fetch error", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as ConvRow[];

  // Latest message preview for the page's conversations (one query, mapped in JS).
  const ids = rows.map((c) => c.id);
  const previews: Record<string, string> = {};
  if (ids.length > 0) {
    const { data: msgs } = await serviceClient
      .from("support_messages")
      .select("conversation_id, body, created_at")
      .in("conversation_id", ids)
      .eq("is_internal", false)
      .order("created_at", { ascending: false });
    for (const m of msgs ?? []) {
      if (!previews[m.conversation_id]) previews[m.conversation_id] = m.body;
    }
  }
  const conversations = rows.map((c) => ({
    ...c,
    last_message: previews[c.id] ?? "",
  }));

  // Global status counts (independent of filters).
  const [openRes, pendingRes, unassignedRes] = await Promise.all([
    serviceClient.from("support_conversations").select("id", { count: "exact", head: true }).eq("status", "open"),
    serviceClient.from("support_conversations").select("id", { count: "exact", head: true }).eq("status", "pending"),
    serviceClient.from("support_conversations").select("id", { count: "exact", head: true }).is("assigned_to", null).in("status", ["open", "pending"]),
  ]);

  const canManage = gate.access === "manage";

  return NextResponse.json({
    conversations,
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
    canManage,
    viewerId: gate.userId,
    stats: {
      open: openRes.count ?? 0,
      pending: pendingRes.count ?? 0,
      unassigned: unassignedRes.count ?? 0,
    },
  });
}
