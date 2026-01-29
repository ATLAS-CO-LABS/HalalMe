"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle,
  Heart,
  Gift,
  Star,
  Share2,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { getCharityById } from "@/data/charities";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const charityId = searchParams.get("charityId");
  const amount = searchParams.get("amount");
  const points = searchParams.get("points");

  const charity = charityId ? getCharityById(charityId) : null;
  const donationAmount = amount ? parseInt(amount, 10) : 0;
  const pointsEarned = points ? parseInt(points, 10) : 0;

  if (!charity || !donationAmount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2
              className="text-2xl font-bold text-white mb-2"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Something went wrong
            </h2>
            <p
              className="text-gray-400 mb-6 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              We couldn&apos;t find your donation details.
            </p>
            <Link
              href="/rewards/causes"
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              ← Browse causes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
      <Header />

      {/* Success Content */}
      <section className="pt-24 md:pt-32 px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2,
            }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(16, 185, 129, 0.4)",
                    "0 0 0 20px rgba(16, 185, 129, 0)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <CheckCircle className="w-12 h-12 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Thank You Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1
              className="text-3xl md:text-4xl font-extrabold text-white mb-4"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Thank You for Your Donation!
            </h1>
            <p
              className="text-lg text-gray-400 mb-8 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Your generosity is making a real difference. May Allah reward you
              for your kindness.
            </p>
          </motion.div>

          {/* Donation Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gray-800 rounded-2xl p-6 md:p-8 border border-gray-700 mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">{charity.name}</p>
                <p className="text-gray-400 text-sm">{charity.category}</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-gray-400 text-sm mb-1">You donated</p>
              <p
                className="text-4xl md:text-5xl font-extrabold text-emerald-400"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                £{donationAmount}
              </p>
            </div>

            {/* Rewards Earned */}
            <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-700">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-emerald-400" />
                <span
                  className="text-emerald-400 font-semibold"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Rewards Earned
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    +{pointsEarned}
                  </p>
                  <p className="text-gray-400 text-sm">Points</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    <p className="text-2xl font-bold text-white">+1</p>
                  </div>
                  <p className="text-gray-400 text-sm">Donation</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-8"
          >
            <p
              className="text-gray-400 mb-4 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Inspire others to give by sharing your donation
            </p>
            <motion.button
              className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-full font-semibold border border-gray-700 hover:border-emerald-500 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-5 h-5" />
              Share My Donation
            </motion.button>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => router.push("/rewards/causes")}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-full font-bold text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Donate Again
            </motion.button>
            <motion.button
              onClick={() => router.push("/rewards/my-rewards")}
              className="w-full sm:w-auto bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-lg border border-gray-700 hover:border-emerald-500 transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Rewards
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          {/* Receipt Notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="text-gray-500 text-sm mt-8 font-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            A receipt has been sent to your email address.
          </motion.p>
        </div>
      </section>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
