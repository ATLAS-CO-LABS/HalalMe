import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { sendMerchantWelcomeEmail } from "@/services/emailService";

// Sends the merchant welcome email exactly once, after the merchant has verified
// and reached their dashboard. Idempotent via merchants.welcome_sent_at.
export async function POST() {
  const authed = await createServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const service = createServiceClient();

  const { data: merchant, error } = await service
    .from("merchants")
    .select("id, name, owner_name, email, business_email, welcome_sent_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !merchant) {
    return NextResponse.json({ error: "No merchant record found" }, { status: 404 });
  }

  // Already sent — no-op (this endpoint is called on every dashboard load).
  if (merchant.welcome_sent_at) {
    return NextResponse.json({ sent: false, alreadySent: true });
  }

  // Stamp first to avoid a double-send if two dashboard loads race.
  const { error: stampErr } = await service
    .from("merchants")
    .update({ welcome_sent_at: new Date().toISOString() })
    .eq("id", merchant.id)
    .is("welcome_sent_at", null);

  if (stampErr) {
    console.error("[merchant/welcome] stamp error", stampErr);
    return NextResponse.json({ error: "Could not send" }, { status: 500 });
  }

  try {
    await sendMerchantWelcomeEmail({
      to: merchant.business_email ?? merchant.email,
      restaurantName: merchant.name,
      ownerName: merchant.owner_name ?? undefined,
    });
  } catch (err) {
    // Roll back the stamp so a later load can retry.
    await service
      .from("merchants")
      .update({ welcome_sent_at: null })
      .eq("id", merchant.id);
    console.error("[merchant/welcome] send failed", err);
    return NextResponse.json({ error: "Could not send" }, { status: 500 });
  }

  return NextResponse.json({ sent: true });
}
