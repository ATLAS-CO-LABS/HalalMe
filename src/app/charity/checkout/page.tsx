"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  ArrowLeft,
  Lock,
  Gift,
  Shield,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import Header from "@/components/layout/Header";

const BG    = "#0F1F17";
const BG2   = "#162B20";
const CREAM = "#F7E7CE";
const TEAL  = "#14B8A6";
const DEEP  = "#0D9488";

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

const stripeAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary:     TEAL,
    colorBackground:  "#0F1F17",
    colorText:        "#F7E7CE",
    colorDanger:      "#F87171",
    fontFamily:       "var(--font-body)",
    borderRadius:     "0px",
  },
  rules: {
    ".Input": {
      border:          `1px solid rgba(247,231,206,0.12)`,
      backgroundColor: BG,
      color:           "#F7E7CE",
    },
    ".Input:focus": {
      border:    `1px solid ${TEAL}`,
      boxShadow: "none",
    },
    ".Label": {
      color:          `rgba(247,231,206,0.5)`,
      textTransform:  "uppercase",
      letterSpacing:  "0.12em",
      fontSize:       "10px",
      fontWeight:     "700",
    },
  },
};

interface IntentData {
  donation_id:          string;
  client_secret:        string | null;
  connected_account_id: string | null;
  amount:               number;
  currency:         string;
  platform_fee:     number;
  net_amount:       number;
  points_preview:   number;
  charity_name:     string;
  charity_category: string | null;
  error?:           string;
}

function PaymentForm({
  intentData,
  onError,
}: {
  intentData: IntentData;
  onError: (msg: string) => void;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/charity/success`,
      },
    });

    if (error) {
      onError(error.message ?? "Payment failed. Please try again.");
      setProcessing(false);
    }
    // Stripe redirects on success - no need to handle here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />

      <motion.button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="w-full py-4 font-extrabold uppercase tracking-tighter text-sm text-white disabled:opacity-40"
        style={{ backgroundColor: DEEP }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "transparent" }}
            />
            Processing...
          </span>
        ) : (
          `Donate £${intentData.amount.toFixed(2)}`
        )}
      </motion.button>

      <div className="flex items-center gap-2 text-xs" style={{ color: `${CREAM}35` }}>
        <Lock className="w-3 h-3 shrink-0" />
        Secured by Stripe · 256-bit SSL
      </div>
    </form>
  );
}

function CheckoutContent() {
  const searchParams   = useSearchParams();
  const charityId      = searchParams.get("charityId");
  const amountParam    = searchParams.get("amount");
  const donationAmount = amountParam ? parseInt(amountParam, 10) : 0;

  const [intentData, setIntentData] = useState<IntentData | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const intentCreated = useRef(false);

  // Direct charges live on the charity's connected account, so Stripe.js must be
  // initialised with that account id to confirm the payment.
  const stripePromise = useMemo(() => {
    if (!STRIPE_PK || !intentData?.connected_account_id) return null;
    return loadStripe(STRIPE_PK, { stripeAccount: intentData.connected_account_id });
  }, [intentData]);

  useEffect(() => {
    if (!charityId || !donationAmount) return;
    if (intentCreated.current) return;
    intentCreated.current = true;
    fetch("/api/donations/create-intent", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ charity_id: charityId, amount: donationAmount }),
    })
      .then((r) => r.json())
      .then((data: IntentData) => {
        if (data.error) setError(data.error ?? "Could not initialise payment.");
        else            setIntentData(data);
      })
      .catch(() => setError("Could not initialise payment."));
  }, [charityId, donationAmount]);

  const platformFee  = intentData?.platform_fee ?? Math.round(donationAmount * 0.05 * 100) / 100;
  const pointsEarned = intentData?.points_preview ?? null;

  if (!charityId || !donationAmount) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: BG }}>
        <p className="font-bold uppercase tracking-tighter" style={{ color: CREAM }}>
          Invalid checkout
        </p>
        <Link
          href="/charity/causes"
          className="text-xs font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
          style={{ color: TEAL }}
        >
          ← Browse Causes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <Header />

      <section className="pt-24 md:pt-32 px-6 md:px-10 pb-20">
        <div className="max-w-[95vw] mx-auto">
          <Link
            href={`/charity/causes/${charityId}`}
            className="inline-flex items-center gap-2 mb-10 font-semibold text-sm uppercase tracking-wider transition-colors"
            style={{ color: `${CREAM}40` }}
            onMouseEnter={(e) => (e.currentTarget.style.color = TEAL)}
            onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}40`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to cause
          </Link>

          {/* Eyebrow + Heading */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
              Secure Checkout
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-10"
            style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
          >
            Complete Your<br />
            <span style={{ color: `${CREAM}40` }}>Donation.</span>
          </h1>

          {/* Grid: form + summary */}
          <div className="grid lg:grid-cols-5 gap-px" style={{ backgroundColor: `${CREAM}08` }}>

            {/* ── Payment form ─────────────────── */}
            <div className="lg:col-span-3 p-6 md:p-8" style={{ backgroundColor: BG2 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-6 h-px" style={{ backgroundColor: TEAL }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
                  Payment Details
                </span>
              </div>

              {error && (
                <div
                  className="mb-6 p-4 text-sm border"
                  style={{ borderColor: "#F87171", backgroundColor: "rgba(69,10,10,0.2)", color: "#F87171" }}
                >
                  {error}
                </div>
              )}

              {!intentData && !error && (
                <div className="flex items-center gap-3 py-8" style={{ color: `${CREAM}35` }}>
                  <span
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin shrink-0"
                    style={{ borderColor: TEAL, borderTopColor: "transparent" }}
                  />
                  <span className="text-sm">Initialising payment…</span>
                </div>
              )}

              {intentData && stripePromise && intentData.client_secret && (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret: intentData.client_secret, appearance: stripeAppearance }}
                >
                  <PaymentForm intentData={intentData} onError={setError} />
                </Elements>
              )}

              {intentData && !intentData.client_secret && (
                <div
                  className="p-4 border text-sm"
                  style={{ borderColor: `${CREAM}12`, color: `${CREAM}40` }}
                >
                  Stripe is not configured. Payment processing requires Stripe keys in production.
                </div>
              )}
            </div>

            {/* ── Order summary ─────────────────── */}
            <div className="lg:col-span-2" style={{ backgroundColor: BG2 }}>

              {/* Charity */}
              <div className="p-6 md:p-8 border-b" style={{ borderColor: `${CREAM}08` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-px" style={{ backgroundColor: TEAL }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
                    Donating to
                  </span>
                </div>
                <p
                  className="text-lg font-extrabold uppercase tracking-tighter leading-[0.88]"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  {intentData?.charity_name ?? "-"}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] mt-2 font-medium" style={{ color: `${CREAM}35` }}>{intentData?.charity_category ?? ""}</p>
              </div>

              {/* Breakdown */}
              <div className="p-6 md:p-8 border-b" style={{ borderColor: `${CREAM}08` }}>
                <button
                  onClick={() => setSummaryOpen(!summaryOpen)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.3em] mb-0"
                  style={{ color: `${CREAM}40` }}
                >
                  Summary
                  <ChevronDown
                    className="w-4 h-4 transition-transform duration-200"
                    style={{
                      color:     `${CREAM}30`,
                      transform: summaryOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {summaryOpen && (
                  <div className="mt-4 space-y-2" style={{ fontFamily: "var(--font-body)" }}>
                    <div className="flex justify-between text-sm" style={{ color: `${CREAM}45` }}>
                      <span className="font-normal">Donation</span>
                      <span className="font-bold tracking-tighter">£{donationAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ color: `${CREAM}30` }}>
                      <span className="font-normal">Platform fee (5%)</span>
                      <span className="font-bold tracking-tighter">£{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ color: `${CREAM}25` }}>
                      <span className="font-normal">To charity</span>
                      <span className="font-bold tracking-tighter">£{(donationAmount - platformFee).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-end justify-between mt-6 pt-4" style={{ borderTop: `1px solid ${CREAM}08` }}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: `${CREAM}40` }}>
                    Total
                  </span>
                  <span
                    className="text-4xl font-extrabold tracking-tighter leading-none"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    £{donationAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Points preview */}
              <div className="p-6 md:p-8 border-b" style={{ borderColor: `${CREAM}08` }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-px" style={{ backgroundColor: TEAL }} />
                  <Gift className="w-3.5 h-3.5" style={{ color: TEAL }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
                    Rewards Preview
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-normal" style={{ color: `${CREAM}45`, fontFamily: "var(--font-body)" }}>Points earned</span>
                  <span
                    className="text-xl font-extrabold tracking-tighter"
                    style={{ color: TEAL, fontFamily: "var(--font-headline)" }}
                  >
                    {pointsEarned !== null ? `+${pointsEarned} pts` : "…"}
                  </span>
                </div>
              </div>

              {/* Trust signals */}
              <div className="p-6 md:p-8 space-y-3">
                {[
                  { icon: Shield,       text: "Verified charity partner" },
                  { icon: CheckCircle,  text: "Tax receipt available"    },
                  { icon: Lock,         text: "256-bit SSL encryption"   },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-2" style={{ color: `${CREAM}28` }}>
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: `${CREAM}35` }} />
                    <span className="text-xs font-normal" style={{ fontFamily: "var(--font-body)" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
          <span
            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: TEAL, borderTopColor: "transparent" }}
          />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
