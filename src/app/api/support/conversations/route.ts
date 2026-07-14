import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { sendSupportNotifyEmail } from "@/services/emailService";
import { createRateLimiter, rateLimitResponse } from "@/lib/rateLimit";
import * as Sentry from "@sentry/nextjs";

export const runtime = "nodejs";

const limiter = createRateLimiter("support-conversations", 5, "10 m");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/support/conversations — the caller's own support conversations.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  // RLS scopes this to the caller's own conversations.
  const { data, error } = await supabase
    .from("support_conversations")
    .select("id, subject, status, priority, last_message_at, created_at")
    .order("last_message_at", { ascending: false });

  if (error) {
    console.error("[api/support/conversations] list error", error);
    return NextResponse.json({ error: "Could not load messages" }, { status: 500 });
  }

  return NextResponse.json({ conversations: data ?? [] });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/support/conversations — open a new conversation + first message.
// Body: { subject, message }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { success, reset } = await limiter.limit(user.id);
  if (!success) return rateLimitResponse(reset);

  let body: { subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const subject = body.subject?.trim();
  const message = body.message?.trim();
  if (!subject || !message) {
    return NextResponse.json(
      { error: "Subject and message are required" },
      { status: 400 },
    );
  }

  const { data: conversation, error: convErr } = await supabase
    .from("support_conversations")
    .insert({ user_id: user.id, subject })
    .select("id")
    .single();

  if (convErr || !conversation) {
    console.error("[api/support/conversations] create error", convErr);
    return NextResponse.json({ error: "Could not start a conversation" }, { status: 500 });
  }

  const { error: msgErr } = await supabase.from("support_messages").insert({
    conversation_id: conversation.id,
    sender_id: user.id,
    sender_role: "user",
    body: message,
  });

  if (msgErr) {
    console.error("[api/support/conversations] first message error", msgErr);
    return NextResponse.json({ error: "Could not send your message" }, { status: 500 });
  }

  // Notify the support team (non-blocking — ticket already exists).
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  sendSupportNotifyEmail({
    requesterName: profile?.full_name ?? user.email ?? "A user",
    requesterEmail: user.email ?? "",
    source: "user",
    subject,
    messagePreview: message,
    conversationId: conversation.id,
    isNew: true,
  }).catch((err) => {
    console.error("[api/support/conversations] notify failed", err);
    Sentry.captureException(err);
  });

  return NextResponse.json({ id: conversation.id });
}
