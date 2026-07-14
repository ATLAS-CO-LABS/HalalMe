import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { sendSupportNotifyEmail } from "@/services/emailService";
import { createRateLimiter, rateLimitResponse } from "@/lib/rateLimit";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

const limiter = createRateLimiter("support-messages", 10, "10 m");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/support/conversations/[id]/messages — thread for the caller's convo.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  // RLS ensures the caller can only read their own conversation.
  const { data: conversation } = await supabase
    .from("support_conversations")
    .select("id, subject, status, priority, last_message_at, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: messages, error } = await supabase
    .from("support_messages")
    .select("id, sender_role, body, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[api/support/.../messages] list error", error);
    return NextResponse.json({ error: "Could not load messages" }, { status: 500 });
  }

  return NextResponse.json({ conversation, messages: messages ?? [] });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/support/conversations/[id]/messages — caller sends a reply.
// Body: { message }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { success, reset } = await limiter.limit(user.id);
  if (!success) return rateLimitResponse(reset);

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

  // Confirm ownership (RLS-scoped) and grab the subject for the notification.
  const { data: conversation } = await supabase
    .from("support_conversations")
    .select("id, subject")
    .eq("id", id)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const { data: newMessage, error: msgErr } = await supabase
    .from("support_messages")
    .insert({
      conversation_id: id,
      sender_id: user.id,
      sender_role: "user",
      body: message,
    })
    .select("id, sender_role, body, created_at")
    .single();

  if (msgErr) {
    console.error("[api/support/.../messages] send error", msgErr);
    return NextResponse.json({ error: "Could not send your message" }, { status: 500 });
  }

  // Notify the support team (non-blocking).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  sendSupportNotifyEmail({
    requesterName: profile?.full_name ?? user.email ?? "A user",
    requesterEmail: user.email ?? "",
    source: "user",
    subject: conversation.subject,
    messagePreview: message,
    conversationId: id,
    isNew: false,
  }).catch((err) => {
    console.error("[api/support/.../messages] notify failed", err);
    Sentry.captureException(err);
  });

  return NextResponse.json({ ok: true, message: newMessage });
}
