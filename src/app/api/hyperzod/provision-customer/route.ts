import { NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { createHyperzodCustomer } from "@/services/hyperzodService";

export async function POST() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("full_name, phone, hyperzod_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.hyperzod_customer_id) {
      return NextResponse.json({ already_provisioned: true });
    }

    if (!profile.phone) {
      return NextResponse.json({ skipped: "no_phone" });
    }

    const result = await createHyperzodCustomer({
      full_name: profile.full_name,
      email: user.email ?? "",
      phone: profile.phone,
    });

    if (!result) {
      return NextResponse.json({ error: "hyperzod_api_failed" }, { status: 502 });
    }

    // Store ID if returned, otherwise "provisioned" as marker to prevent duplicate attempts
    await serviceClient
      .from("profiles")
      .update({ hyperzod_customer_id: result.id ?? "provisioned" })
      .eq("id", user.id);

    return NextResponse.json({ success: true, hyperzod_id: result.id ?? null });
  } catch (err) {
    console.error("[hyperzod] provision-customer error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
