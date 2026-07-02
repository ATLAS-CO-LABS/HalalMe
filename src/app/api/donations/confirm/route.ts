import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createServiceClient } from "@/lib/supabase-server";

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status });

// POST /api/donations/confirm
// Called by the success page after Stripe redirects back.
// Verifies the PaymentIntent status directly with Stripe (server-side),
// then transitions the donation from "pending" → "completed".
// The DB trigger handle_donation_completed fires automatically on that update,
// awarding points and updating charity stats.
export async function POST(req: NextRequest) {
  try {
    // -------------------------------------------------------------------------
    // 1. Auth
    // -------------------------------------------------------------------------
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorised" }, 401);

    // -------------------------------------------------------------------------
    // 2. Parse body
    // -------------------------------------------------------------------------
    let paymentIntentId: string;
    try {
      const body = await req.json();
      paymentIntentId = String(body.payment_intent_id ?? "").trim();
      if (!paymentIntentId) throw new Error("payment_intent_id is required");
    } catch (e) {
      return json({ error: e instanceof Error ? e.message : "Invalid request body" }, 400);
    }

    // -------------------------------------------------------------------------
    // 3. Fetch the donation row (must belong to this user)
    // -------------------------------------------------------------------------
    const supabaseAdmin = createServiceClient();

    const { data: donation, error: findErr } = await supabaseAdmin
      .from("donations")
      .select("id, amount, currency, status, user_id, charity_id")
      .eq("payment_intent_id", paymentIntentId)
      .eq("user_id", user.id) // security: user can only confirm their own donations
      .maybeSingle();

    if (findErr || !donation) {
      return json({ error: "Donation not found" }, 404);
    }

    // Already completed — return early (idempotent)
    if (donation.status === "completed") {
      return json({ success: true, status: "completed", already_completed: true });
    }

    // Accept 'expired' too: the stale-pending sweeper may have expired a row
    // whose payment actually succeeded — let it complete here.
    if (donation.status !== "pending" && donation.status !== "expired") {
      return json({ error: `Cannot confirm donation with status '${donation.status}'` }, 422);
    }

    // -------------------------------------------------------------------------
    // 4. Verify with Stripe — never trust the client
    // -------------------------------------------------------------------------
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return json({ error: "Stripe not configured" }, 503);
    }

    const Stripe = (await import("stripe")).default;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" as any });

    // Direct charges live on the charity's connected account — retrieve the PI
    // (and later the charge) there via the Stripe-Account header.
    const { data: charityRow } = await supabaseAdmin
      .from("charities")
      .select("stripe_account_id")
      .eq("id", donation.charity_id)
      .single();
    const connectedAccount = charityRow?.stripe_account_id ?? null;
    const stripeOpts = connectedAccount ? { stripeAccount: connectedAccount } : undefined;

    let pi: Awaited<ReturnType<typeof stripe.paymentIntents.retrieve>>;
    try {
      pi = await stripe.paymentIntents.retrieve(paymentIntentId, undefined, stripeOpts);
    } catch {
      return json({ error: "Could not verify payment with Stripe" }, 502);
    }

    if (pi.status !== "succeeded") {
      return json({ error: `Payment not succeeded (status: ${pi.status})` }, 422);
    }

    // Verify amount to guard against tampering
    const expectedPence = Math.round(donation.amount * 100);
    if (pi.amount_received !== expectedPence) {
      console.error(
        `[confirm] Amount mismatch for donation ${donation.id}: ` +
        `expected ${expectedPence}p, Stripe received ${pi.amount_received}p`
      );
      return json({ error: "Payment amount mismatch" }, 422);
    }

    // -------------------------------------------------------------------------
    // 5. Mark donation completed for instant UX. The Connect webhook is the
    //    authority for fee/net + payment method — it enriches this row (and
    //    backfills once the balance transaction settles), so here we only set
    //    status + charge ref. Avoids racing the balance_transaction on redirect.
    // -------------------------------------------------------------------------
    const chargeId = typeof pi.latest_charge === "string"
      ? pi.latest_charge
      : (pi.latest_charge as { id: string } | null)?.id ?? null;

    const { error: updateErr } = await supabaseAdmin
      .from("donations")
      .update({
        status:           "completed",
        payment_ref:      chargeId,
        stripe_charge_id: chargeId,
      })
      .eq("id", donation.id)
      .in("status", ["pending", "expired"]); // guard: only complete an unfinished row

    if (updateErr) {
      console.error("[confirm] update error:", updateErr.message);
      return json({ error: "Failed to complete donation" }, 500);
    }

    console.log(`[confirm] donation ${donation.id} marked completed`);
    return json({ success: true, status: "completed" });

  } catch (err) {
    console.error("[confirm] unexpected error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}
