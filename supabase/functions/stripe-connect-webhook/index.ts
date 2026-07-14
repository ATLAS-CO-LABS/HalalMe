// =============================================================================
// stripe-connect-webhook/index.ts
// Handles Stripe Connect account lifecycle events
//
// Events handled:
//   account.updated   → sync stripe_charges_enabled, stripe_payouts_enabled,
//                       update onboarding_status on the charity row
//
// This is a SEPARATE webhook endpoint from stripe-webhook.
// In Stripe dashboard you create two webhook endpoints:
//   1. https://xxx.supabase.co/functions/v1/stripe-webhook         (payment events)
//   2. https://xxx.supabase.co/functions/v1/stripe-connect-webhook (Connect events)
//
// Required env vars:
//   STRIPE_SECRET_KEY               sk_live_xxx
//   STRIPE_CONNECT_WEBHOOK_SECRET   whsec_xxx  (different secret from payment webhook)
//
// Prerequisite: 018_stripe_connect.sql must be applied
// (adds stripe_account_id, stripe_charges_enabled, etc. to charities)
// =============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // -------------------------------------------------------------------------
  // 1. Load environment
  // -------------------------------------------------------------------------
  const supabaseUrl     = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret   = Deno.env.get("STRIPE_CONNECT_WEBHOOK_SECRET");

  if (!supabaseUrl || !serviceRoleKey || !stripeSecretKey || !webhookSecret) {
    console.error("[stripe-connect-webhook] missing env vars");
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
  // -------------------------------------------------------------------------
  const rawBody   = await req.text();
  const sigHeader = req.headers.get("stripe-signature");

  if (!sigHeader) {
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
    console.error("[stripe-connect-webhook] signature failed:", msg);
    return json({ error: "Invalid signature" }, 400);
  }

  console.log(`[stripe-connect-webhook] received: ${event.type} (${event.id})`);

  // -------------------------------------------------------------------------
  // 3. Idempotency — reuse webhook_events table
  // -------------------------------------------------------------------------
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id, processed_at")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existing?.processed_at) {
    console.log(`[stripe-connect-webhook] already processed: ${event.id}`);
    return json({ received: true, skipped: true });
  }

  if (!existing) {
    const { error: logErr } = await supabase.from("webhook_events").insert({
      provider:   "stripe",
      event_id:   event.id,
      event_type: event.type,
      payload:    event as unknown as Record<string, unknown>,
    });

    if (logErr?.code === "23505") {
      return json({ received: true, skipped: true });
    }
    if (logErr) {
      console.error("[stripe-connect-webhook] log error:", logErr.message);
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
      // account.updated
      // Fired when a Connect account's details change.
      // Most importantly: when charges_enabled or payouts_enabled flips to true
      // (meaning the charity has completed Stripe onboarding).
      // ----------------------------------------------------------------------
      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        const stripeAccountId = account.id;

        console.log(
          `[stripe-connect-webhook] account.updated: ${stripeAccountId} ` +
          `charges=${account.charges_enabled} payouts=${account.payouts_enabled}`
        );

        // Find the charity with this Stripe account ID
        const { data: charity, error: findErr } = await supabase
          .from("charities")
          .select("id, stripe_onboarding_status, stripe_charges_enabled")
          .eq("stripe_account_id", stripeAccountId)
          .maybeSingle();

        if (findErr || !charity) {
          console.warn(
            `[stripe-connect-webhook] no charity found for account: ${stripeAccountId}`
          );
          break;
        }

        // Determine new onboarding status
        let newOnboardingStatus: string;
        if (account.charges_enabled && account.payouts_enabled) {
          newOnboardingStatus = "completed";
        } else if (
          account.requirements?.disabled_reason &&
          account.requirements.disabled_reason !== null
        ) {
          newOnboardingStatus = "restricted";
        } else {
          newOnboardingStatus = "pending";
        }

        // Update charity with latest Stripe account state
        const { error: updateErr } = await supabase
          .from("charities")
          .update({
            stripe_charges_enabled:   account.charges_enabled ?? false,
            stripe_payouts_enabled:   account.payouts_enabled ?? false,
            stripe_onboarding_status: newOnboardingStatus,
            stripe_country:           account.country ?? null,
            stripe_default_currency:  account.default_currency ?? null,
            stripe_last_synced_at:    new Date().toISOString(),
          })
          .eq("id", charity.id);

        if (updateErr) {
          throw new Error(
            `Failed to update charity ${charity.id}: ${updateErr.message}`
          );
        }

        console.log(
          `[stripe-connect-webhook] charity ${charity.id} updated — ` +
          `onboarding: ${newOnboardingStatus}`
        );
        break;
      }

      // ----------------------------------------------------------------------
      // account.application.deauthorized
      // Charity disconnected their Stripe account from HalalMe.
      // Disable the charity so no new donations can be made until reconnected.
      // ----------------------------------------------------------------------
      case "account.application.deauthorized": {
        const account = event.data.object as Stripe.Application;
        const stripeAccountId = (event as unknown as { account: string }).account;

        console.log(`[stripe-connect-webhook] account deauthorized: ${stripeAccountId}`);

        if (!stripeAccountId) break;

        const { error: updateErr } = await supabase
          .from("charities")
          .update({
            stripe_charges_enabled:   false,
            stripe_payouts_enabled:   false,
            stripe_onboarding_status: "not_started",
            stripe_account_id:        null,
            stripe_last_synced_at:    new Date().toISOString(),
            is_active:                false,
          })
          .eq("stripe_account_id", stripeAccountId);

        if (updateErr) {
          throw new Error(
            `Failed to deauthorize account ${stripeAccountId}: ${updateErr.message}`
          );
        }

        console.log(
          `[stripe-connect-webhook] charity deauthorized and deactivated: ${stripeAccountId}`
        );
        break;
      }

      // ----------------------------------------------------------------------
      // payment_intent.succeeded  (DIRECT CHARGE on the charity's account)
      // Money captured into the charity's balance. Mark donation completed →
      // DB trigger awards points + updates charity stats.
      // ----------------------------------------------------------------------
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const connectedAccount = (event as unknown as { account?: string }).account;

        const { data: donation } = await supabase
          .from("donations")
          .select("id, amount, status, user_id, stripe_fee_amount")
          .eq("payment_intent_id", pi.id)
          .maybeSingle();

        if (!donation) {
          throw new Error(`Donation not found for payment_intent: ${pi.id}`);
        }
        // Fully done already (completed AND Stripe fee recorded) → nothing to do.
        // Use stripe_fee_amount as the sentinel: unlike net_amount it is only ever
        // set here, so it reliably signals whether fees still need backfilling.
        if (donation.status === "completed" && donation.stripe_fee_amount !== null) break;
        if (donation.status === "failed" || donation.status === "refunded") {
          throw new Error(`Unexpected status '${donation.status}' for donation ${donation.id}`);
        }

        const expectedPence = Math.round(donation.amount * 100);
        if (pi.amount_received !== expectedPence) {
          throw new Error(
            `Amount mismatch: expected ${expectedPence}p, got ${pi.amount_received}p (donation ${donation.id})`
          );
        }

        const chargeId = typeof pi.latest_charge === "string"
          ? pi.latest_charge
          : pi.latest_charge?.id ?? null;

        let stripeFeeAmount: number | null = null;
        let netAmount: number | null = null;
        let paymentMethodType: string | null = null;

        // The charge + balance transaction live on the connected account. The BT
        // can settle 0–2s after the charge, so retry a few times in-invocation to
        // land fees within seconds instead of waiting for Stripe's slow redelivery.
        if (chargeId && connectedAccount) {
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const charge = await stripe.charges.retrieve(
                chargeId,
                { expand: ["balance_transaction"] },
                { stripeAccount: connectedAccount },
              );
              paymentMethodType = charge.payment_method_details?.type ?? paymentMethodType;

              // balance_transaction may be an object, an unexpanded id, or null if
              // it hasn't settled yet. Resolve it to an object where possible.
              let bt = charge.balance_transaction as Stripe.BalanceTransaction | string | null;
              if (typeof bt === "string") {
                bt = await stripe.balanceTransactions.retrieve(bt, { stripeAccount: connectedAccount });
              }
              if (bt && typeof bt !== "string") {
                // net = amount − Stripe fee − application fee = the charity's take.
                netAmount = bt.net / 100;
                const stripeFeePence = (bt.fee_details ?? [])
                  .filter((f) => f.type === "stripe_fee")
                  .reduce((s, f) => s + f.amount, 0);
                stripeFeeAmount = stripeFeePence / 100;
                break;
              }
            } catch (e) {
              console.warn("[stripe-connect-webhook] charge/BT fetch attempt failed:", e);
            }
            if (attempt < 2) await new Promise((r) => setTimeout(r, 1200));
          }
        }

        // Complete a pending/expired row, OR backfill fees onto an already-
        // completed row whose net_amount is still null (confirm path won the race
        // before the balance transaction settled). Only set fee fields when known.
        const updateFields: Record<string, unknown> = {
          status:              "completed",
          payment_ref:         chargeId,
          stripe_charge_id:    chargeId,
          payment_method_type: paymentMethodType,
        };
        if (netAmount !== null) {
          updateFields.stripe_fee_amount = stripeFeeAmount;
          updateFields.net_amount = netAmount;
        }

        const { error: updateErr } = await supabase
          .from("donations")
          .update(updateFields)
          .eq("id", donation.id)
          .or("status.eq.pending,status.eq.expired,and(status.eq.completed,stripe_fee_amount.is.null)");

        if (updateErr) throw new Error(`Failed to complete donation ${donation.id}: ${updateErr.message}`);

        // If the balance transaction wasn't ready, ask Stripe to retry so we can
        // backfill fee/net once it settles (uses the 500-retry below). The
        // donation is already completed + points awarded, so this is safe.
        if (netAmount === null) {
          throw new Error(`balance_transaction not ready for donation ${donation.id} — retrying to backfill fees`);
        }

        console.log(`[stripe-connect-webhook] donation ${donation.id} completed`);
        break;
      }

      // ----------------------------------------------------------------------
      // payment_intent.payment_failed
      // ----------------------------------------------------------------------
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { data: donation } = await supabase
          .from("donations")
          .select("id, status")
          .eq("payment_intent_id", pi.id)
          .maybeSingle();

        if (donation?.status === "pending") {
          const { error: updateErr } = await supabase
            .from("donations")
            .update({ status: "failed" })
            .eq("id", donation.id)
            .eq("status", "pending");
          if (updateErr) throw new Error(`Failed to mark donation ${donation.id} failed: ${updateErr.message}`);
          console.log(`[stripe-connect-webhook] donation ${donation.id} failed`);
        }
        break;
      }

      // ----------------------------------------------------------------------
      // charge.refunded — reverse the donation + its reward points
      // ----------------------------------------------------------------------
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const { data: donation } = await supabase
          .from("donations")
          .select("id, status, points_earned, user_id")
          .eq("payment_ref", charge.id)
          .maybeSingle();

        if (!donation || donation.status === "refunded") break;

        const { error: updateErr } = await supabase
          .from("donations")
          .update({
            status:      "refunded",
            refunded_at: new Date().toISOString(),
            refund_ref:  charge.refunds?.data?.[0]?.id ?? null,
          })
          .eq("id", donation.id);
        if (updateErr) throw new Error(`Failed to refund donation ${donation.id}: ${updateErr.message}`);

        if (donation.points_earned > 0) {
          const { error: ledgerErr } = await supabase.from("reward_transactions").insert({
            user_id:     donation.user_id,
            points:      -donation.points_earned,
            action:      "spent",
            description: `Points reversed: donation refunded (${donation.id})`,
          });
          if (ledgerErr) {
            console.error("[stripe-connect-webhook] failed to reverse points:", ledgerErr.message);
          } else {
            await supabase.rpc("decrement_reward_points", {
              p_user_id: donation.user_id,
              p_points:  donation.points_earned,
            });
          }
        }
        console.log(`[stripe-connect-webhook] donation ${donation.id} refunded`);
        break;
      }

      default: {
        console.log(`[stripe-connect-webhook] unhandled event: ${event.type}`);
        break;
      }
    }
  } catch (err) {
    processingError = err instanceof Error ? err.message : String(err);
    console.error(
      `[stripe-connect-webhook] error processing ${event.id}:`,
      processingError
    );
  }

  // -------------------------------------------------------------------------
  // 5. Finalise. On error, leave processed_at NULL and return 500 so Stripe
  //    retries (self-heals transient failures like the webhook racing ahead of
  //    the donation insert). On success, stamp processed_at and return 200.
  // -------------------------------------------------------------------------
  if (processingError) {
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
