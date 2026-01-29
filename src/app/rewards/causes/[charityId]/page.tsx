"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Users,
  Target,
  Share2,
  CheckCircle,
} from "lucide-react";
import Header from "@/components/layout/Header";
import DonationAmountSelector from "@/components/rewards/DonationAmountSelector";
import { getCharityById } from "@/data/charities";

export default function CharityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const charityId = params.charityId as string;
  const charity = getCharityById(charityId);

  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  if (!charity) {
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
              Cause not found
            </h2>
            <p
              className="text-gray-400 mb-6 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              The cause you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/rewards/causes"
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              ← Browse all causes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min(
    (charity.raised / charity.goal) * 100,
    100
  );

  const handleDonate = () => {
    if (selectedAmount) {
      router.push(
        `/rewards/checkout?charityId=${charity.id}&amount=${selectedAmount}`
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
      <Header />

      {/* Back Link */}
      <section className="pt-24 md:pt-32 px-4 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/rewards/causes"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Causes</span>
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Column - Charity Info */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Image Placeholder */}
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="w-24 h-24 text-emerald-400/50" />
                  <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full">
                    {charity.category}
                  </div>
                  {charity.featured && (
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-full">
                      Featured
                    </div>
                  )}
                </div>

                {/* Title and Description */}
                <h1
                  className="text-3xl md:text-4xl font-extrabold text-white mb-4"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  {charity.name}
                </h1>

                <p
                  className="text-lg text-gray-300 mb-6 leading-relaxed font-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {charity.longDescription}
                </p>

                {/* Impact Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                    <Target className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-xl">
                      £{charity.goal.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">Goal</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                    <Heart className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-xl">
                      £{charity.raised.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">Raised</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700">
                    <Users className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="text-white font-bold text-xl">
                      {charity.donors}
                    </p>
                    <p className="text-gray-400 text-sm">Donors</p>
                  </div>
                </div>

                {/* What Your Donation Does */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
                  <h3
                    className="text-xl font-bold text-white mb-4"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    What Your Donation Does
                  </h3>
                  <div className="space-y-3">
                    {[
                      "£5 — Provides essential supplies for one person",
                      "£10 — Supports a family for one week",
                      "£20 — Makes a meaningful impact on the community",
                      "£50+ — Creates lasting change for those in need",
                    ].map((impact, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <p
                          className="text-gray-300 font-normal"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {impact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Share Button */}
                <button className="inline-flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="font-semibold">Share this cause</span>
                </button>
              </motion.div>
            </div>

            {/* Right Column - Donation Card */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gray-800 rounded-2xl p-6 border border-gray-700 sticky top-24"
              >
                <h2
                  className="text-2xl font-bold text-white mb-4"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Make a Donation
                </h2>

                {/* Progress */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-emerald-400 font-semibold">
                      £{charity.raised.toLocaleString()} raised
                    </span>
                    <span className="text-gray-500">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Goal: £{charity.goal.toLocaleString()}
                  </p>
                </div>

                {/* Amount Selector */}
                <DonationAmountSelector
                  selectedAmount={selectedAmount}
                  onAmountSelect={setSelectedAmount}
                />

                {/* Donate Button */}
                <motion.button
                  onClick={handleDonate}
                  disabled={!selectedAmount}
                  className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedAmount
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                  whileHover={selectedAmount ? { scale: 1.02 } : {}}
                  whileTap={selectedAmount ? { scale: 0.98 } : {}}
                >
                  {selectedAmount
                    ? `Donate £${selectedAmount}`
                    : "Select an amount"}
                </motion.button>

                {/* Trust Badge */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Secure payment • 5% platform fee</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
