import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { createHyperzodMerchant } from "@/services/hyperzodService";

export async function POST(req: NextRequest) {
  // ── Auth gate ──────────────────────────────────────────────────────────────
  const serverClient = await createServerClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as Record<string, unknown>;
  const {
    name, owner_name, email, phone, address, city, state,
    post_code, country, country_code,
    merchant_category_ids, accepted_order_types,
  } = body as {
    name: string; owner_name?: string; email: string; phone: string;
    address: string; city: string; state?: string;
    post_code: string; country: string; country_code: string;
    merchant_category_ids: string[]; accepted_order_types: string[];
  };

  if (
    !name || !email || !phone || !address || !city ||
    !post_code || !country_code || !country ||
    !merchant_category_ids?.length || !accepted_order_types?.length
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Prevent duplicate registrations
  const { data: existing } = await serviceClient
    .from("merchants")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "email_already_registered" }, { status: 409 });
  }

  // Create on Hyperzod (status 0 — inactive) so the merchant is fully onboardable
  const result = await createHyperzodMerchant({
    name, email, phone, address, city,
    state: state ?? "",
    post_code, country, country_code,
    merchant_category_ids,
    accepted_order_types,
  });

  const { data: merchant, error: dbError } = await serviceClient
    .from("merchants")
    .insert({
      name,
      owner_name: owner_name ?? null,
      email,
      phone,
      address,
      city,
      state: state ?? null,
      post_code,
      country,
      country_code,
      category_ids: merchant_category_ids,
      order_types: accepted_order_types,
      hyperzod_merchant_id: result?.id ?? null,
      hyperzod_sync_failed: !result,
      status: "pending",
      source_attribution: "admin",
    })
    .select("id")
    .single();

  if (dbError) {
    console.error("[admin/merchants/create] db insert error", dbError);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // No welcome email — an admin-added lead didn't apply themselves.
  return NextResponse.json({
    merchant_id: merchant.id,
    hyperzod_id: result?.id ?? null,
    hyperzod_sync_failed: !result,
  });
}
