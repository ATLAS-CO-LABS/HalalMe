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
  // 5. Mark event processed
  // -------------------------------------------------------------------------
  await supabase
    .from("webhook_events")
    .update({
      processed_at:     new Date().toISOString(),
      processing_error: processingError,
    })
    .eq("event_id", event.id);

  return json({ received: true });
});
