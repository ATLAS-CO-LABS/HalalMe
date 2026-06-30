// =============================================================================
// stripe-webhook/index.ts
// Handles Stripe payment events for the HalalMe donation system
//
// Events handled:
//   payment_intent.succeeded      → mark donation completed, trigger awards points
//   payment_intent.payment_failed → mark donation failed
//   charge.refunded               → mark donation refunded
//
// Security:
//   - Stripe-Signature header verified on every request (rejects anything unsigned)
//   - webhook_events table deduplicates Stripe retries (idempotent)
//   - Uses service role key — never exposed to clients
//   - donation.status transitions ONLY happen here, never from client
//
// Required env vars (set in Supabase dashboard → Edge Functions → Secrets):
//   STRIPE_SECRET_KEY         sk_live_xxx  (or sk_test_xxx for dev)
//   STRIPE_WEBHOOK_SECRET     whsec_xxx    (from Stripe dashboard → Webhooks)
//
// Auto-injected by Supabase (no setup needed):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
// =============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req: Request) => {
  // Stripe only sends POST — reject everything else
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // -------------------------------------------------------------------------
  // 1. Load environment
  // -------------------------------------------------------------------------
  const supabaseUrl        = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecretKey    = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret      = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey || !webhookSecret) {
    console.error("[stripe-webhook] missing env vars");
    return json({ error: "Server configuration error" }, 500);
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-04-10",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // -------------------------------------------------------------------------
  // 2. Verify Stripe signature
  // Raw body MUST be read as text before any parsing
  // -------------------------------------------------------------------------
  const rawBody  = await req.text();
  const sigHeader = req.headers.get("stripe-signature");

  if (!sigHeader) {
    console.error("[stripe-webhook] missing stripe-signature header");
    return json({ error: "Missing signature" }, 400);
  }

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sigHeader,
      webhookSecret,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[stripe-webhook] signature verification failed:", msg);
    return json({ error: "Invalid signature" }, 400);
  }

  console.log(`[stripe-webhook] received event: ${event.type} (${event.id})`);

  // -------------------------------------------------------------------------
  // 3. Idempotency — check if we've already processed this event
  // -------------------------------------------------------------------------
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id, processed_at")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existing?.processed_at) {
    console.log(`[stripe-webhook] already processed: ${event.id} — skipping`);
    return json({ received: true, skipped: true });
  }

  // Log event (processed_at = NULL means in-flight)
  if (!existing) {
    const { error: logErr } = await supabase.from("webhook_events").insert({
      provider:   "stripe",
      event_id:   event.id,
      event_type: event.type,
      payload:    event as unknown as Record<string, unknown>,
    });
    if (logErr) {
      // If insert fails due to race condition (duplicate), another instance
      // is already processing this event — return 200 to stop Stripe retrying
      if (logErr.code === "23505") {
        console.log(`[stripe-webhook] race condition on ${event.id} — skipping`);
        return json({ received: true, skipped: true });
      }
      console.error("[stripe-webhook] failed to log event:", logErr.message);
      return json({ error: "Internal error" }, 500);
    }
  }

  // -------------------------------------------------------------------------
  // 4. Handle event
  // -------------------------------------------------------------------------
  let processingError: string | null = null;

  try {
    switch (event.type) {

      // ----------------------------------------------------------------------
      // payment_intent.succeeded
      // Money has been captured. Mark donation completed.
      // DB trigger fires automatically → awards points → updates charity stats
      // ----------------------------------------------------------------------
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`[stripe-webhook] payment succeeded: ${pi.id}`);

        // Find the donation by payment_intent_id
        const { data: donation, error: findErr } = await supabase
          .from("donations")
          .select("id, amount, currency, status, user_id, charity_id")
          .eq("payment_intent_id", pi.id)
          .maybeSingle();

        if (findErr || !donation) {
          throw new Error(`Donation not found for payment_intent: ${pi.id}`);
        }

        if (donation.status === "completed") {
          console.log(`[stripe-webhook] donation ${donation.id} already completed`);
          break;
        }

        // Accept 'expired' too: the stale-pending sweeper may have expired a row
        // whose payment actually succeeded — complete it rather than lose it.
        if (donation.status !== "pending" && donation.status !== "expired") {
          throw new Error(
            `Unexpected donation status '${donation.status}' for ${donation.id}`
          );
        }

        // Verify amount matches — fraud safeguard
        // pi.amount is in pence (smallest currency unit)
        const expectedPence = Math.round(donation.amount * 100);
        if (pi.amount_received !== expectedPence) {
          throw new Error(
            `Amount mismatch: expected ${expectedPence}p, Stripe received ${pi.amount_received}p ` +
            `for donation ${donation.id}`
          );
        }

        // Get the charge for fee details
        const chargeId = typeof pi.latest_charge === "string"
          ? pi.latest_charge
          : pi.latest_charge?.id ?? null;

        let stripeFeeAmount: number | null = null;
        let netAmount: number | null = null;
        let paymentMethodType: string | null = null;

        if (chargeId) {
          try {
            const charge = await stripe.charges.retrieve(chargeId, {
              expand: ["balance_transaction"],
            });

            paymentMethodType = charge.payment_method_details?.type ?? null;

            const bt = charge.balance_transaction as Stripe.BalanceTransaction | null;
            if (bt) {
              stripeFeeAmount = bt.fee / 100;
              netAmount = bt.net / 100;
            }
          } catch (chargeErr) {
            // Non-fatal — fee details are nice-to-have, not required
            console.warn("[stripe-webhook] could not retrieve charge details:", chargeErr);
          }
        }

        // Mark donation completed
        // This UPDATE triggers handle_donation_completed() in the DB:
        //   → awards points to user
        //   → updates charity raised_amount + donor_count
        const { error: updateErr } = await supabase
          .from("donations")
          .update({
            status:               "completed",
            payment_ref:          chargeId,
            payment_method_type:  paymentMethodType,
            stripe_fee_amount:    stripeFeeAmount,
            net_amount:           netAmount,
          })
          .eq("id", donation.id)
          .in("status", ["pending", "expired"]); // guard: only complete an unfinished row

        if (updateErr) {
          throw new Error(`Failed to complete donation ${donation.id}: ${updateErr.message}`);
        }

        console.log(`[stripe-webhook] donation ${donation.id} marked completed`);
        break;
      }

      // ----------------------------------------------------------------------
      // payment_intent.payment_failed
      // Payment could not be captured. Mark donation failed.
      // ----------------------------------------------------------------------
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`[stripe-webhook] payment failed: ${pi.id}`);

        const { data: donation } = await supabase
          .from("donations")
          .select("id, status")
          .eq("payment_intent_id", pi.id)
          .maybeSingle();

        if (!donation) {
          console.warn(`[stripe-webhook] no donation found for failed pi: ${pi.id}`);
          break;
        }

        if (donation.status !== "pending") {
          console.log(`[stripe-webhook] donation ${donation.id} not pending — skipping`);
          break;
        }

        const { error: updateErr } = await supabase
          .from("donations")
          .update({ status: "failed" })
          .eq("id", donation.id)
          .eq("status", "pending");

        if (updateErr) {
          throw new Error(`Failed to mark donation ${donation.id} as failed: ${updateErr.message}`);
        }

        console.log(`[stripe-webhook] donation ${donation.id} marked failed`);
        break;
      }

      // ----------------------------------------------------------------------
      // charge.refunded
      // A charge was refunded (full or partial). Mark donation refunded
      // and reverse the reward points that were awarded.
      // ----------------------------------------------------------------------
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const chargeId = charge.id;
        console.log(`[stripe-webhook] charge refunded: ${chargeId}`);

        // Find donation by payment_ref (charge ID)
        const { data: donation } = await supabase
          .from("donations")
          .select("id, status, points_earned, user_id")
          .eq("payment_ref", chargeId)
          .maybeSingle();

        if (!donation) {
          console.warn(`[stripe-webhook] no donation found for refunded charge: ${chargeId}`);
          break;
        }

        if (donation.status === "refunded") {
          console.log(`[stripe-webhook] donation ${donation.id} already refunded`);
          break;
        }

        // Mark donation refunded
        const { error: updateErr } = await supabase
          .from("donations")
          .update({
            status:      "refunded",
            refunded_at: new Date().toISOString(),
            refund_ref:  charge.refunds?.data?.[0]?.id ?? null,
          })
          .eq("id", donation.id);

        if (updateErr) {
          throw new Error(`Failed to refund donation ${donation.id}: ${updateErr.message}`);
        }

        // Reverse points if any were awarded
        if (donation.points_earned > 0) {
          const { error: ledgerErr } = await supabase
            .from("reward_transactions")
            .insert({
              user_id:     donation.user_id,
              points:      -donation.points_earned,
              action:      "spent",
              description: `Points reversed: donation refunded (${donation.id})`,
            });

          if (ledgerErr) {
            // Non-fatal — log but don't fail the webhook
            console.error("[stripe-webhook] failed to reverse points:", ledgerErr.message);
          } else {
            // Update profile balance
            await supabase.rpc("decrement_reward_points", {
              p_user_id: donation.user_id,
              p_points:  donation.points_earned,
            });
          }
        }

        console.log(`[stripe-webhook] donation ${donation.id} marked refunded`);
        break;
      }

      // ----------------------------------------------------------------------
      // All other events — acknowledge but take no action
      // ----------------------------------------------------------------------
      default: {
        console.log(`[stripe-webhook] unhandled event type: ${event.type}`);
        break;
      }
    }
  } catch (err) {
    processingError = err instanceof Error ? err.message : String(err);
    console.error(`[stripe-webhook] processing error for ${event.id}:`, processingError);
  }

  // -------------------------------------------------------------------------
  // 5. Finalise. On error, leave processed_at NULL and return 500 so Stripe
  //    retries (exponential backoff, up to ~3 days). The idempotency check
  //    re-enters this handler on retry, so a transient failure (e.g. the
  //    webhook racing ahead of the donation insert, or a momentary DB error)
  //    self-heals on a later attempt instead of leaving the donation stuck
  //    pending. Stripe caps retries, so a truly permanent error eventually
  //    stops — and the error is recorded in webhook_events.processing_error.
  // -------------------------------------------------------------------------
  if (processingError) {
    console.error(`[stripe-webhook] processing failed, will retry: ${processingError}`);
    await supabase
      .from("webhook_events")
      .update({ processing_error: processingError })
      .eq("event_id", event.id);

    return json({ error: "Processing failed, will retry" }, 500);
  }

  await supabase
    .from("webhook_events")
    .update({
      processed_at:     new Date().toISOString(),
      processing_error: null,
    })
    .eq("event_id", event.id);

  return json({ received: true });
});
