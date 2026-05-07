import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

// POST /api/donations/webhook
// Stripe webhook handler — alternative to the Supabase Edge Function.
// Register this URL in Stripe Dashboard → Developers → Webhooks:
//   https://yourdomain.com/api/donations/webhook
//
// Required env vars:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET   (from Stripe dashboard → Webhooks → signing secret)
//
// For local dev with Stripe CLI:
//   stripe listen --forward-to localhost:3000/api/donations/webhook

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const stripeSecretKey  = process.env.STRIPE_SECRET_KEY;
  const webhookSecret    = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !webhookSecret) {
    console.error("[webhook] missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const Stripe = (await import("stripe")).default;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2026-03-25.dahlia" as any });

  // Raw body required for signature verification
  const rawBody   = await req.text();
  const sigHeader = req.headers.get("stripe-signature");

  if (!sigHeader) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: import("stripe").Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sigHeader, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[webhook] received: ${event.type} (${event.id})`);

  const supabase = createServiceClient();

  // Idempotency check
  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id, processed_at")
    .eq("event_id", event.id)
    .maybeSingle();

  if (existing?.processed_at) {
    return NextResponse.json({ received: true, skipped: true });
  }

  if (!existing) {
    const { error: logErr } = await supabase.from("webhook_events").insert({
      provider:   "stripe",
      event_id:   event.id,
      event_type: event.type,
      payload:    event as unknown as Record<string, unknown>,
    });
    if (logErr?.code === "23505") {
      return NextResponse.json({ received: true, skipped: true });
    }
  }

  let processingError: string | null = null;

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as import("stripe").Stripe.PaymentIntent;

        const { data: donation } = await supabase
          .from("donations")
          .select("id, amount, status, user_id")
          .eq("payment_intent_id", pi.id)
          .maybeSingle();

        if (!donation) {
          throw new Error(`Donation not found for payment_intent: ${pi.id}`);
        }
        if (donation.status === "completed") break;
        if (donation.status !== "pending") {
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
          : (pi.latest_charge as { id: string } | null)?.id ?? null;

        let stripeFeeAmount: number | null = null;
        let netAmount: number | null = null;
        let paymentMethodType: string | null = null;

        if (chargeId) {
          try {
            const charge = await stripe.charges.retrieve(chargeId, { expand: ["balance_transaction"] });
            paymentMethodType = charge.payment_method_details?.type ?? null;
            const bt = charge.balance_transaction as { fee: number; net: number } | null;
            if (bt) { stripeFeeAmount = bt.fee / 100; netAmount = bt.net / 100; }
          } catch { /* non-fatal */ }
        }

        const { error: updateErr } = await supabase
          .from("donations")
          .update({
            status:              "completed",
            payment_ref:         chargeId,
            payment_method_type: paymentMethodType,
            stripe_fee_amount:   stripeFeeAmount,
            net_amount:          netAmount,
          })
          .eq("id", donation.id)
          .eq("status", "pending");

        if (updateErr) throw new Error(`Failed to complete donation ${donation.id}: ${updateErr.message}`);
        console.log(`[webhook] donation ${donation.id} completed`);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as import("stripe").Stripe.PaymentIntent;
        const { data: donation } = await supabase
          .from("donations")
          .select("id, status")
          .eq("payment_intent_id", pi.id)
          .maybeSingle();

        if (donation?.status === "pending") {
          await supabase.from("donations").update({ status: "failed" })
            .eq("id", donation.id).eq("status", "pending");
          console.log(`[webhook] donation ${donation.id} failed`);
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as import("stripe").Stripe.Charge;
        const { data: donation } = await supabase
          .from("donations")
          .select("id, status, points_earned, user_id")
          .eq("payment_ref", charge.id)
          .maybeSingle();

        if (!donation || donation.status === "refunded") break;

        await supabase.from("donations").update({
          status:      "refunded",
          refunded_at: new Date().toISOString(),
          refund_ref:  charge.refunds?.data?.[0]?.id ?? null,
        }).eq("id", donation.id);

        if (donation.points_earned > 0) {
          await supabase.from("reward_transactions").insert({
            user_id:     donation.user_id,
            points:      -donation.points_earned,
            action:      "spent",
            description: `Points reversed: donation refunded (${donation.id})`,
          });
          await supabase.rpc("decrement_reward_points", {
            p_user_id: donation.user_id,
            p_points:  donation.points_earned,
          });
        }
        console.log(`[webhook] donation ${donation.id} refunded`);
        break;
      }

      default:
        console.log(`[webhook] unhandled event: ${event.type}`);
    }
  } catch (err) {
    processingError = err instanceof Error ? err.message : String(err);
    console.error(`[webhook] error processing ${event.id}:`, processingError);
  }

  await supabase.from("webhook_events").update({
    processed_at:     new Date().toISOString(),
    processing_error: processingError,
  }).eq("event_id", event.id);

  return NextResponse.json({ received: true });
}
