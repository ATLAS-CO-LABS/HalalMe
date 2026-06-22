import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const STATUSES = ["open", "pending", "resolved", "closed"];
const PRIORITIES = ["low", "normal", "high"];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/support/conversations/[id] — thread + meta (support:view).
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("support", "view");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  const { data: conversation, error } = await serviceClient
    .from("support_conversations")
    .select(
      "id, subject, status, priority, delivery_reference, last_message_at, created_at, assigned_to, requester_email, requester_name, " +
        "requester:profiles!support_conversations_user_id_fkey(id, full_name, username, avatar_url, email), " +
        "assignee:profiles!support_conversations_assigned_to_fkey(id, full_name), " +
        "merchant:merchants!support_conversations_merchant_id_fkey(id, name)",
    )
    .eq("id", id)
    .single();

  if (error || !conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: messages } = await serviceClient
    .from("support_messages")
    .select(
      "id, sender_role, body, created_at, " +
        "sender:profiles!support_messages_sender_id_fkey(id, full_name, avatar_url)",
    )
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  let canManage = gate.role === "super_admin";
  if (!canManage) {
    const { data: vp } = await serviceClient
      .from("admin_permissions").select("access")
      .eq("user_id", gate.userId).eq("module", "support").single();
    canManage = vp?.access === "manage";
  }

  // Evermile deep-link for delivery escalations (P1: deep-link only).
  // The multi-FK-hint embed isn't in the generated types, so cast for the
  // one field we read here (the JSON payload is returned as-is regardless).
  const deliveryRef = (conversation as unknown as { delivery_reference: string | null }).delivery_reference;
  const evermileBase = process.env.NEXT_PUBLIC_EVERMILE_ORDER_URL ?? null;
  const evermileUrl =
    evermileBase && deliveryRef ? `${evermileBase}${deliveryRef}` : null;

  return NextResponse.json({
    conversation,
    messages: messages ?? [],
    canManage,
    viewerId: gate.userId,
    evermileUrl,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/support/conversations/[id] — status / assign / priority
// (support:manage).
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("support", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: {
    status?: string;
    priority?: string;
    assigned_to?: string | null;
    delivery_reference?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (typeof body.status === "string") {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (typeof body.priority === "string") {
    if (!PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }
    update.priority = body.priority;
  }
  if ("assigned_to" in body) {
    update.assigned_to = body.assigned_to || null;
  }
  if ("delivery_reference" in body) {
    const ref = body.delivery_reference?.trim();
    update.delivery_reference = ref || null;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await serviceClient
    .from("support_conversations")
    .update(update)
    .eq("id", id);

  if (error) {
    console.error("[api/admin/support/conversations/[id]] update error", error);
    return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
