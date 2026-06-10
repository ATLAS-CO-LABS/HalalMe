import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";

// Only these columns may be changed by a merchant. status / commission / readiness
// are deliberately excluded — they are admin/service-role-only.
const ALLOWED_FIELDS = ["phone", "address", "city", "post_code", "business_email"] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function PATCH(req: NextRequest) {
  const authed = await createServerClient();
  const { data: { user } } = await authed.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json() as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Build the update from the allowlist only.
  const update: Record<string, string> = {};
  for (const key of ALLOWED_FIELDS) {
    const v = body[key];
    if (typeof v === "string" && v.trim()) update[key] = v.trim();
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  if (update.business_email && !EMAIL_RE.test(update.business_email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const service = createServiceClient();

  // Find the merchant owned by this user (service role — RLS bypassed, but we
  // scope strictly by user_id so a merchant can only ever edit their own record).
  const { data: owned, error: lookupErr } = await service
    .from("merchants")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (lookupErr || !owned) {
    return NextResponse.json({ error: "No merchant record found" }, { status: 404 });
  }

  const { data: merchant, error } = await service
    .from("merchants")
    .update(update)
    .eq("id", owned.id)
    .select("*")
    .single();

  if (error) {
    console.error("[merchant/me] update error", error);
    return NextResponse.json({ error: "Could not save changes" }, { status: 500 });
  }

  return NextResponse.json({ merchant });
}
