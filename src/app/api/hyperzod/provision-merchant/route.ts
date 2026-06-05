import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { createHyperzodMerchant } from "@/services/hyperzodService";
import { sendMerchantWelcomeEmail } from "@/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const {
      name, owner_name, email, phone, address, city, state,
      post_code, country, country_code,
      merchant_category_ids, accepted_order_types,
    } = body as {
      name: string;
      owner_name?: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      state?: string;
      post_code: string;
      country: string;
      country_code: string;
      merchant_category_ids: string[];
      accepted_order_types: string[];
    };

    if (
      !name || !email || !phone || !address || !city ||
      !post_code || !country_code || !country ||
      !merchant_category_ids?.length || !accepted_order_types?.length
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const serviceClient = createServiceClient();

    // Prevent duplicate registrations
    const { data: existing } = await serviceClient
      .from("merchants")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "email_already_registered" }, { status: 409 });
    }

    const result = await createHyperzodMerchant({
      name, email, phone, address, city,
      state: state ?? "",
      post_code, country, country_code,
      merchant_category_ids,
      accepted_order_types,
    });

    // Always store in DB — don't lose the application if Hyperzod is slow
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
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("[provision-merchant] db insert error", dbError);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    // Fire-and-forget — do not block the response on email delivery
    sendMerchantWelcomeEmail({
      to: email,
      restaurantName: name,
      ownerName: owner_name ?? undefined,
    }).catch((err) =>
      console.error("[provision-merchant] welcome email failed", err)
    );

    return NextResponse.json({
      success: true,
      merchant_id: merchant.id,
      hyperzod_id: result?.id ?? null,
    });
  } catch (err) {
    console.error("[provision-merchant] error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
