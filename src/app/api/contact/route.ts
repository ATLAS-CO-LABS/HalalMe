import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { sendSupportNotifyEmail } from "@/services/emailService";
import { createRateLimiter, getClientIp, rateLimitResponse } from "@/lib/rateLimit";

const limiter = createRateLimiter("contact", 5, "10 m");

// Public contact form → creates a support ticket in /admin/chat.
//   - Logged-in submitter → ticket tied to their account (shows in My Messages).
//   - Anonymous submitter → guest ticket keyed by the email + name they typed.
// Either way the team is notified by email with a link to the ticket.
export const runtime = "nodejs";

// Maps the form's <select> values to human-readable subjects.
const SUBJECT_LABELS: Record<string, string> = {
  support: "Support",
  order: "Order Issue",
  partnership: "Partnership",
  charity: "Charity / Rewards",
  general: "General Inquiry",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { success, reset } = await limiter.limit(getClientIp(req));
  if (!success) return rateLimitResponse(reset);

  let body: {
    fullName?: string;
    email?: string;
    subject?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const fullName = body.fullName?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();
  const subjectKey = body.subject?.trim();

  if (!fullName || !email || !subjectKey || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const subject = SUBJECT_LABELS[subjectKey] ?? subjectKey;

  // If the submitter is logged in, tie the ticket to their account so they can
  // continue it in My Messages. We only trust an authenticated session here —
  // never an unverified typed email — to avoid opening tickets on someone else's
  // account.
  const authed = await createServerClient();
  const { data: { user } } = await authed.auth.getUser();

  const service = createServiceClient();
  const convInsert = user
    ? { user_id: user.id, subject }
    : { requester_name: fullName, requester_email: email, subject };

  const { data: conversation, error: convErr } = await service
    .from("support_conversations")
    .insert(convInsert)
    .select("id")
    .single();

  if (convErr || !conversation) {
    console.error("[api/contact] ticket create error", convErr);
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 });
  }

  const { error: msgErr } = await service.from("support_messages").insert({
    conversation_id: conversation.id,
    sender_id: user?.id ?? null,
    sender_role: "user",
    body: message,
  });

  if (msgErr) {
    console.error("[api/contact] first message error", msgErr);
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 500 });
  }

  // Notify the support team (non-blocking — ticket already exists).
  try {
    await sendSupportNotifyEmail({
      requesterName: fullName,
      requesterEmail: email,
      source: "user",
      subject,
      messagePreview: message,
      conversationId: conversation.id,
      isNew: true,
    });
  } catch (err) {
    console.error("[api/contact] notify failed", err);
  }

  return NextResponse.json({ ok: true });
}
