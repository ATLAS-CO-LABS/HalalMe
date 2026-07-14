import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { sendMerchantSupportEmail } from "@/services/emailService";
import { createRateLimiter, rateLimitResponse } from "@/lib/rateLimit";

const limiter = createRateLimiter("merchant-support", 5, "10 m");

export async function POST(req: NextRequest) {
  const authed = await createServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { success, reset } = await limiter.limit(user.id);
  if (!success) return rateLimitResponse(reset);

  let body: { subject?: string; message?: string };
  try {
    body = await req.json() as { subject?: string; message?: string };
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const subject = body.subject?.trim();
  const message = body.message?.trim();
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: merchant } = await service
    .from("merchants")
    .select("id, name, owner_name, email, business_email")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!merchant) {
    return NextResponse.json({ error: "No merchant record found" }, { status: 404 });
  }

  // Also open an inbox ticket so it surfaces in /admin/chat, not just email.
  const { error: convErr } = await (async () => {
    const { data: conversation, error } = await service
      .from("support_conversations")
      .insert({ user_id: user.id, merchant_id: merchant.id, subject })
      .select("id")
      .single();
    if (error || !conversation) return { error };
    return service.from("support_messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      sender_role: "user",
      body: message,
    });
  })();

  if (convErr) {
    console.error("[merchant/support] ticket create failed", convErr);
    return NextResponse.json({ error: "Could not send. Please try again." }, { status: 500 });
  }

  try {
    await sendMerchantSupportEmail({
      restaurantName: merchant.name,
      merchantId: merchant.id,
      fromEmail: merchant.business_email ?? merchant.email,
      ownerName: merchant.owner_name ?? undefined,
      subject,
      message,
    });
  } catch (err) {
    console.error("[merchant/support] send failed", err);
    return NextResponse.json({ error: "Could not send. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
