import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { sendSupportReplyEmail } from "@/services/emailService";

export const runtime = "nodejs";

// POST /api/admin/support/conversations/[id]/messages — admin reply (support:manage).
// The DB trigger sets status='pending' and assigns the convo to the sender if
// it was unassigned. We then email the requester.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const gate = await requireAdmin("support", "manage");
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });
  const { serviceClient } = gate;

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Load the conversation + requester for the notification email. A guest ticket
  // has no linked profile — fall back to the typed requester_email/name.
  const { data: conversation } = await serviceClient
    .from("support_conversations")
    .select(
      "id, subject, requester_email, requester_name, requester:profiles!support_conversations_user_id_fkey(full_name, email)",
    )
    .eq("id", id)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { error: msgErr } = await serviceClient.from("support_messages").insert({
    conversation_id: id,
    sender_id: gate.userId,
    sender_role: "admin",
    body: message,
  });

  if (msgErr) {
    console.error("[api/admin/support/.../messages] insert error", msgErr);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }

  // Notify the requester (non-blocking — reply already saved). Prefer the linked
  // account email; fall back to the guest's typed email.
  const conv = conversation as unknown as {
    subject: string;
    requester_email: string | null;
    requester_name: string | null;
    requester: { full_name: string | null; email: string | null } | { full_name: string | null; email: string | null }[] | null;
  };
  const linked = Array.isArray(conv.requester) ? conv.requester[0] : conv.requester;
  const toEmail = linked?.email ?? conv.requester_email;
  const toName = linked?.full_name ?? conv.requester_name ?? undefined;
  if (toEmail) {
    try {
      await sendSupportReplyEmail({
        to: toEmail,
        recipientName: toName,
        subject: conv.subject,
        replyPreview: message,
        conversationId: id,
      });
    } catch (err) {
      console.error("[api/admin/support/.../messages] reply email failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
