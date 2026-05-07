"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Heart,
  Gift,
  ArrowRight,
  Share2,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import type { Donation, Charity } from "@/types/app";

const BG    = "#0F1F17";
const BG2   = "#162B20";
const CREAM = "#F7E7CE";
const TEAL  = "#14B8A6";
const DEEP  = "#0D9488";

type DonationWithCharity = Donation & {
  charities?: Pick<Charity, "name" | "slug" | "category" | "image_url">;
};

function SuccessContent() {
  const searchParams  = useSearchParams();
  const router        = useRouter();

  const paymentIntent   = searchParams.get("payment_intent");
  const redirectStatus  = searchParams.get("redirect_status");

  // Fallback for legacy / dev flows
  const fallbackAmount = searchParams.get("amount");
  const fallbackPoints = searchParams.get("points");

  const [donation,  setDonation]  = useState<DonationWithCharity | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      if (!paymentIntent) {
        setLoading(false);
        return;
      }

      if (redirectStatus !== "succeeded") {
        setError("Payment was not completed. Please try again.");
        setLoading(false);
        return;
      }

      try {
        // 1. Confirm server-side (idempotent)
        const confirmRes  = await fetch("/api/donations/confirm", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ payment_intent_id: paymentIntent }),
        });
        const confirmData = await confirmRes.json();

        if (!confirmData.success && !confirmData.already_completed) {
          setError(confirmData.error ?? "Could not confirm your donation.");
        }

        // 2. Fetch donation record
        const donRes  = await fetch(`/api/donations/by-payment-intent?pi=${paymentIntent}`);
        const donData = await donRes.json();
        if (donData.donation) setDonation(donData.donation as DonationWithCharity);
      } catch {
        setError("Something went wrong. Your payment may still have processed - check your email for a receipt.");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [paymentIntent, redirectStatus]);

  const donationAmount = donation?.amount       ?? (fallbackAmount ? parseInt(fallbackAmount, 10) : 0);
  const pointsEarned   = donation?.points_earned ?? (fallbackPoints ? parseInt(fallbackPoints, 10) : 0);
  const charityName    = donation?.charities?.name ?? "your chosen charity";
  const currency       = donation?.currency ?? "GBP";
  const symbol         = currency === "GBP" ? "£" : "$";

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: BG }}>
      <span
        className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: TEAL, borderTopColor: "transparent" }}
      />
      <p className="text-sm" style={{ color: `${CREAM}40` }}>Confirming your donation…</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <Header />

      <section className="pt-24 md:pt-32 px-6 md:px-10 pb-20">
        <div className="mx-auto max-w-2xl">

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 border flex items-start gap-3"
              style={{ borderColor: "#F87171", backgroundColor: "rgba(69,10,10,0.2)" }}
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          {/* Success mark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
            className="flex justify-center mb-10"
          >
            <motion.div
              className="w-20 h-20 flex items-center justify-center"
              style={{ backgroundColor: DEEP }}
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(13,148,136,0.45)",
                  "0 0 0 28px rgba(13,148,136,0)",
                ],
              }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
                Donation Confirmed
              </span>
              <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            </div>

            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-5"
              style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
            >
              Thank You for<br />
              <span style={{ color: TEAL }}>Your Giving.</span>
            </h1>
            <p
              className="text-base leading-relaxed"
              style={{ color: `${CREAM}50`, fontFamily: "var(--font-body)" }}
            >
              May Allah reward you for your generosity. Your donation to{" "}
              <span style={{ color: CREAM }}>{charityName}</span>{" "}
              is making a real difference.
            </p>
          </motion.div>

          {/* Banner image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.38, duration: 0.7 }}
            className="relative w-full h-44 md:h-56 mb-8 overflow-hidden"
          >
            <Image
              src="/images/page sections/rewards7.png"
              alt="Thank you for giving"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${BG}60 0%, transparent 40%, ${BG}80 100%)` }} />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="mb-8 grid grid-cols-2 gap-px"
            style={{ backgroundColor: `${CREAM}08` }}
          >
            <div className="py-10 px-8 text-center" style={{ backgroundColor: BG2 }}>
              <Heart className="w-5 h-5 mx-auto mb-4" style={{ color: "#EC4899" }} />
              <p
                className="text-[2.5rem] font-extrabold tracking-tighter leading-none"
                style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
              >
                {symbol}{donationAmount}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.25em] mt-2 font-medium"
                style={{ color: `${CREAM}35` }}
              >
                Donated
              </p>
            </div>

            <div className="py-10 px-8 text-center" style={{ backgroundColor: BG2 }}>
              <Gift className="w-5 h-5 mx-auto mb-4" style={{ color: TEAL }} />
              <p
                className="text-[2.5rem] font-extrabold tracking-tighter leading-none"
                style={{ color: TEAL, fontFamily: "var(--font-headline)" }}
              >
                +{pointsEarned}
              </p>
              <p
                className="text-[10px] uppercase tracking-[0.25em] mt-2 font-medium"
                style={{ color: `${CREAM}35` }}
              >
                Points Earned
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            <motion.button
              onClick={() => router.push("/rewards/my-rewards")}
              className="flex-1 flex items-center justify-center gap-2 py-4 font-extrabold uppercase tracking-tighter text-sm text-white"
              style={{ backgroundColor: DEEP }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View My Rewards <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              onClick={() => router.push("/rewards/causes")}
              className="flex-1 flex items-center justify-center gap-2 py-4 border font-extrabold uppercase tracking-tighter text-sm transition-all"
              style={{ borderColor: `${CREAM}18`, color: CREAM }}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(247,231,206,0.04)" }}
              whileTap={{ scale: 0.98 }}
            >
              <Heart className="w-4 h-4" /> Donate Again
            </motion.button>
          </motion.div>

          {/* Share */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center space-y-4"
          >
            <motion.button
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
              style={{ color: `${CREAM}30` }}
              whileHover={{ scale: 1.04 }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share your donation
            </motion.button>

            <p
              className="text-xs block"
              style={{ color: `${CREAM}20`, fontFamily: "var(--font-body)" }}
            >
              A receipt has been sent to your email address.
            </p>
          </motion.div>

        </div>
      </section>
    </div>
  );
}

export default function SuccessPage() {
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
      <SuccessContent />
    </Suspense>
  );
}
