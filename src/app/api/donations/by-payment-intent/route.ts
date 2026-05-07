import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";

// Called by the success page after Stripe redirects back
// GET /api/donations/by-payment-intent?pi=pi_xxx
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

    const pi = req.nextUrl.searchParams.get("pi");
    if (!pi) return NextResponse.json({ error: "Missing payment_intent param" }, { status: 400 });

    const supabaseAdmin = createServiceClient();

    const { data: donation, error } = await supabaseAdmin
      .from("donations")
      .select(`
        id, amount, currency, status, points_earned, created_at,
        charities ( name, slug, category, image_url )
      `)
      .eq("payment_intent_id", pi)
      .eq("user_id", user.id)   // security: user can only read own donations
      .single();

    if (error || !donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    return NextResponse.json({ donation });

  } catch (err) {
    console.error("[donations/by-payment-intent]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
