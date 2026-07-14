import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";
import { randomUUID } from "crypto";
import { createRateLimiter, rateLimitResponse } from "@/lib/rateLimit";
import * as Sentry from "@sentry/nextjs";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status });

const limiter = createRateLimiter("donations-create-intent", 5, "1 m");

export async function POST(req: NextRequest) {
  try {
    // -------------------------------------------------------------------------
    // 1. Auth — require logged-in user
    // -------------------------------------------------------------------------
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorised" }, 401);

    const { success, reset } = await limiter.limit(user.id);
    if (!success) return rateLimitResponse(reset);

    // -------------------------------------------------------------------------
    // 2. Parse + validate body
    // -------------------------------------------------------------------------
    let charityId: string;
    let amount: number;
    let message: string | undefined;
    let isAnonymous: boolean;

    try {
      const body = await req.json();
      charityId   = String(body.charity_id ?? "").trim();
      amount      = Number(body.amount);
      message     = typeof body.message === "string" ? body.message.trim() : undefined;
      isAnonymous = Boolean(body.is_anonymous);

      if (!charityId) throw new Error("charity_id is required");
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("amount must be a positive number");
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Invalid request body" }, 400);
    }

    // -------------------------------------------------------------------------
    // 3. Load + validate charity
    // -------------------------------------------------------------------------
    const supabaseAdmin = createServiceClient();

    const { data: charity, error: charityErr } = await supabaseAdmin
      .from("charities")
      .select("id, name, slug, category, currency, minimum_donation, platform_fee_pct, verification_status, is_active, stripe_charges_enabled, stripe_account_id")
      .eq("id", charityId)
      .single();

    if (charityErr || !charity) {
      return json({ error: "Charity not found" }, 404);
    }
    if (charity.verification_status !== "approved" || !charity.is_active) {
      return json({ error: "This charity is not currently accepting donations" }, 422);
    }
    // Fiduciary gate: only charities fully Connected to Stripe can receive
    // donations. Never silently route money into the platform account.
    if (!charity.stripe_account_id || !charity.stripe_charges_enabled) {
      return json({ error: "This charity isn't set up to receive donations yet. Please check back soon." }, 422);
    }
    if (amount < charity.minimum_donation) {
      return json({ error: `Minimum donation for this charity is ${charity.currency} ${charity.minimum_donation}` }, 422);
    }

    // -------------------------------------------------------------------------
    // 4. Calculate fees server-side (never trust client amounts)
    // -------------------------------------------------------------------------
    const platformFeeAmount = Number(
      ((amount * charity.platform_fee_pct) / 100).toFixed(2)
    );
    const netAmount = Number((amount - platformFeeAmount).toFixed(2));

    // Load active donation reward rule to compute a client-side preview
    // (the trigger recalculates this authoritatively on completion)
    const { data: donationRule } = await supabaseAdmin
      .from("reward_rules")
      .select("points_per_unit, unit")
      .eq("action", "donation")
      .eq("is_active", true)
      .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
      .maybeSingle();

    const pointsPreview = donationRule
      ? donationRule.unit === "per_gbp"
        ? Math.floor(amount * donationRule.points_per_unit)
        : donationRule.points_per_unit
      : Math.floor(amount * 10); // safe fallback if no rule defined yet

    // -------------------------------------------------------------------------
    // 5. Calculate risk score
    // -------------------------------------------------------------------------
    const ipAddress  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                    ?? req.headers.get("x-real-ip")
                    ?? null;
    const userAgent  = req.headers.get("user-agent") ?? null;

    let riskScore = 0;
    const signals: string[] = [];

    // Signal: account age
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("created_at, location")
      .eq("id", user.id)
      .single();

    if (profile) {
      const ageMs   = Date.now() - new Date(profile.created_at).getTime();
      const ageDays = ageMs / (1000 * 60 * 60 * 24);

      if (ageDays < 7 && amount > 100) {
        riskScore += 40;
        signals.push("new_account_large_gift");
      } else if (ageDays < 7) {
        riskScore += 25;
        signals.push("account_age_days");
      }
    }

    // Signal: high single donation
    if (amount > 500 && !signals.includes("new_account_large_gift")) {
      riskScore += 20;
      signals.push("donation_amount_high");
    }

    // Signal: velocity — donations in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentHourCount } = await supabaseAdmin
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneHourAgo);

    if ((recentHourCount ?? 0) >= 3) {
      riskScore += 30;
      signals.push("velocity_per_hour");
    }

    // Signal: velocity — donations in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentDayCount } = await supabaseAdmin
      .from("donations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", oneDayAgo);

    if ((recentDayCount ?? 0) >= 10) {
      riskScore += 25;
      signals.push("velocity_per_day");
    }

    riskScore = Math.min(riskScore, 100);

    // -------------------------------------------------------------------------
    // 6. Stripe is required — never create a donation row without a real
    //    PaymentIntent (orphan pending rows can never complete).
    // -------------------------------------------------------------------------
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("[create-intent] STRIPE_SECRET_KEY not configured");
      return json({ error: "Donations are temporarily unavailable" }, 503);
    }

    const Stripe = (await import("stripe")).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" as any });

    // -------------------------------------------------------------------------
    // 6a. Dedupe — reuse a recent in-flight PaymentIntent for an identical
    //     attempt (same user + charity + amount within 30 min). Stops double
    //     clicks, page reloads and remounts from creating duplicate donations.
    // -------------------------------------------------------------------------
    const dedupeWindow = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: existingPending } = await supabaseAdmin
      .from("donations")
      .select("id, payment_intent_id")
      .eq("user_id", user.id)
      .eq("charity_id", charityId)
      .eq("amount", amount)
      .eq("status", "pending")
      .not("payment_intent_id", "is", null)
      .gte("created_at", dedupeWindow)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPending?.payment_intent_id) {
      try {
        const existingPi = await stripe.paymentIntents.retrieve(
          existingPending.payment_intent_id,
          undefined,
          { stripeAccount: charity.stripe_account_id },
        );
        const reusable = ["requires_payment_method", "requires_confirmation", "requires_action", "processing"];
        if (existingPi.client_secret && reusable.includes(existingPi.status)) {
          return json({
            donation_id:         existingPending.id,
            client_secret:       existingPi.client_secret,
            connected_account_id: charity.stripe_account_id,
            amount,
            currency:            charity.currency,
            platform_fee:        platformFeeAmount,
            net_amount:          netAmount,
            risk_score:          riskScore,
            points_preview:      pointsPreview,
            charity_name:        charity.name,
            charity_category:    charity.category ?? null,
            reused:              true,
          });
        }
      } catch {
        // PaymentIntent not retrievable (e.g. test/live key swap) — fall through
        // and create a fresh one.
      }
    }

    // -------------------------------------------------------------------------
    // 6b. Create a new PaymentIntent. The idempotency key protects against
    //     network-level retries of THIS create call double-charging.
    // -------------------------------------------------------------------------
    const idempotencyKey = randomUUID();

    const intentParams: Parameters<typeof stripe.paymentIntents.create>[0] = {
      amount:                 Math.round(amount * 100), // pence
      currency:               charity.currency.toLowerCase(),
      payment_method_types:   ["card"], // card only — excludes Revolut Pay, BACS, etc.
      application_fee_amount:  Math.round(platformFeeAmount * 100), // HalalMe's cut → platform
      metadata: {
        user_id:    user.id,
        charity_id: charity.id,
      },
    };

    // Direct charge ON the charity's connected account: the donation lands in the
    // charity's Stripe balance, Stripe's processing fee comes out of the charity
    // natively, and our application fee transfers to the platform. HalalMe never
    // holds the donation funds.
    const intent = await stripe.paymentIntents.create(intentParams, {
      idempotencyKey,
      stripeAccount: charity.stripe_account_id,
    });
    const paymentIntentId = intent.id;
    const clientSecret    = intent.client_secret;

    // -------------------------------------------------------------------------
    // 7. Insert donation row (status: pending)
    // -------------------------------------------------------------------------

    const { data: donation, error: insertErr } = await supabaseAdmin
      .from("donations")
      .insert({
        user_id:              user.id,
        charity_id:           charityId,
        amount,
        currency:             charity.currency,
        platform_fee_amount:  platformFeeAmount,
        application_fee_amount: platformFeeAmount,
        // net_amount is left null here — the Connect webhook fills the true value
        // (amount − Stripe fee − platform fee) once the balance transaction settles.
        payment_intent_id:    paymentIntentId,
        idempotency_key:      idempotencyKey,
        status:               "pending",
        message:              message ?? null,
        is_anonymous:         isAnonymous,
        ip_address:           ipAddress,
        user_agent:           userAgent,
        risk_score:           riskScore,
      })
      .select("id")
      .single();

    if (insertErr || !donation) {
      console.error("[create-intent] insert error:", insertErr?.message);
      return json({ error: "Failed to create donation" }, 500);
    }

    // -------------------------------------------------------------------------
    // 8. Update PaymentIntent metadata with real donation ID
    // -------------------------------------------------------------------------
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { user_id: user.id, charity_id: charity.id, donation_id: donation.id },
    }, { stripeAccount: charity.stripe_account_id }).then(() => null, () => null); // non-fatal

    // -------------------------------------------------------------------------
    // 9. Auto-flag if high risk score
    // -------------------------------------------------------------------------
    if (riskScore >= 70) {
      await supabaseAdmin.from("donation_flags").insert({
        donation_id:        donation.id,
        flagged_by:         "system",
        flag_type:          signals[0] ?? "high_risk_score",
        risk_score_at_flag: riskScore,
        signal_breakdown:   signals.map((s) => ({ rule_key: s })),
        rewards_delayed:    true,
      }).then(() => null, () => null); // non-fatal
    }

    return json({
      donation_id:          donation.id,
      client_secret:        clientSecret,
      connected_account_id: charity.stripe_account_id,
      amount,
      currency:         charity.currency,
      platform_fee:     platformFeeAmount,
      net_amount:       netAmount,
      risk_score:       riskScore,
      points_preview:   pointsPreview,
      charity_name:     charity.name,
      charity_category: charity.category ?? null,
    });

  } catch (err) {
    console.error("[create-intent] unexpected error:", err);
    Sentry.captureException(err);
    return json({ error: "Internal server error" }, 500);
  }
}
