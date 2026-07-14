import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, createServerClient } from "@/lib/supabase-server";
import { createHyperzodMerchant } from "@/services/hyperzodService";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createRateLimiter, getClientIp, rateLimitResponse } from "@/lib/rateLimit";

const limiter = createRateLimiter("provision-merchant", 3, "10 m");

/**
 * Resolves the auth-user id to attach this merchant to.
 * - Creates a new passwordless account (email_confirm so OTP login works immediately).
 * - If the email already has an account, links to that existing user instead of
 *   creating a duplicate.
 * Returns null only if we genuinely can't create or find a user.
 */
async function resolveAuthUserId(
  serviceClient: SupabaseClient,
  email: string,
  fullName: string,
): Promise<string | null> {
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (!error && data?.user) return data.user.id;

  // Likely "email already registered" — find the existing user and link to it.
  // NOTE: listUsers is paginated; fine at current scale. Revisit if user base is large.
  const { data: list } = await serviceClient.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = list?.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  return found?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const { success, reset } = await limiter.limit(getClientIp(req));
    if (!success) return rateLimitResponse(reset);

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

    // ── Resolve the account this merchant belongs to ──────────────────────────
    // If the caller is already signed in (existing ecosystem user becoming a
    // merchant) → link to that account, no OTP needed.
    // Otherwise → create/link a passwordless account; the merchant logs in via OTP.
    const authedClient = await createServerClient();
    const { data: { user: sessionUser } } = await authedClient.auth.getUser();

    let userId: string | null = sessionUser?.id ?? null;
    const requiresLogin = !sessionUser;

    if (!userId) {
      userId = await resolveAuthUserId(serviceClient, email, owner_name ?? name);
      if (!userId) {
        console.error("[provision-merchant] could not create or resolve auth user");
        return NextResponse.json({ error: "account_error" }, { status: 500 });
      }
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
        user_id: userId,
        name,
        owner_name: owner_name ?? null,
        email,
        business_email: email,
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

    // NOTE: the welcome email is intentionally NOT sent here. It fires once the
    // merchant verifies and reaches their dashboard (POST /api/merchant/welcome),
    // so it doesn't arrive at the same time as the OTP login code.

    return NextResponse.json({
      success: true,
      merchant_id: merchant.id,
      hyperzod_id: result?.id ?? null,
      // Tells the form whether to send the merchant through OTP login (new account)
      // or straight to the dashboard (already signed in).
      requiresLogin,
    });
  } catch (err) {
    console.error("[provision-merchant] error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
