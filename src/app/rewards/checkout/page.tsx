"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  CreditCard,
  Lock,
  CheckCircle,
  Gift,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { getCharityById } from "@/data/charities";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const charityId = searchParams.get("charityId");
  const amount = searchParams.get("amount");

  const charity = charityId ? getCharityById(charityId) : null;
  const donationAmount = amount ? parseInt(amount, 10) : 0;
  const platformFee = Math.round(donationAmount * 0.05 * 100) / 100;
  const totalAmount = donationAmount;
  const pointsEarned = donationAmount * 10;

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    name: "",
  });

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
              Invalid checkout
            </h2>
            <p
              className="text-gray-400 mb-6 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Please select a cause and donation amount first.
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    } else if (name === "expiry") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "$1/$2")
        .slice(0, 5);
    } else if (name === "cvc") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    router.push(
      `/rewards/success?charityId=${charityId}&amount=${donationAmount}&points=${pointsEarned}`
    );
  };

  const isFormValid =
    formData.email &&
    formData.cardNumber.length >= 19 &&
    formData.expiry.length === 5 &&
    formData.cvc.length >= 3 &&
    formData.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900">
      <Header />

      {/* Back Link */}
      <section className="pt-24 md:pt-32 px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/rewards/causes/${charityId}`}
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to cause</span>
          </Link>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="px-4 md:px-6 pb-16">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-3xl md:text-4xl font-extrabold text-white mb-2"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Complete Your Donation
            </h1>
            <p
              className="text-gray-400 mb-8 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              You&apos;re donating to {charity.name}
            </p>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-3">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div>
                    <label
                      className="block text-white font-semibold mb-2"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}
                    />
                  </div>

                  {/* Card Details */}
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="w-5 h-5 text-emerald-400" />
                      <span
                        className="text-white font-semibold"
                        style={{ fontFamily: "var(--font-headline)" }}
                      >
                        Card Details
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-gray-400 text-sm mb-2"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                          style={{ fontFamily: "var(--font-body)" }}
                        />
                      </div>

                      <div>
                        <label
                          className="block text-gray-400 text-sm mb-2"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          Card Number
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          required
                          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                          style={{ fontFamily: "var(--font-body)" }}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            className="block text-gray-400 text-sm mb-2"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            name="expiry"
                            value={formData.expiry}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                            style={{ fontFamily: "var(--font-body)" }}
                          />
                        </div>
                        <div>
                          <label
                            className="block text-gray-400 text-sm mb-2"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            CVC
                          </label>
                          <input
                            type="text"
                            name="cvc"
                            value={formData.cvc}
                            onChange={handleInputChange}
                            placeholder="123"
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                            style={{ fontFamily: "var(--font-body)" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Lock className="w-4 h-4" />
                    <span style={{ fontFamily: "var(--font-body)" }}>
                      Your payment is secure and encrypted
                    </span>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={!isFormValid || isProcessing}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                      isFormValid && !isProcessing
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
                        : "bg-gray-700 text-gray-500 cursor-not-allowed"
                    }`}
                    whileHover={isFormValid && !isProcessing ? { scale: 1.02 } : {}}
                    whileTap={isFormValid && !isProcessing ? { scale: 0.98 } : {}}
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      `Donate £${totalAmount}`
                    )}
                  </motion.button>
                </form>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-2">
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 sticky top-24">
                  <h3
                    className="text-xl font-bold text-white mb-4"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    Donation Summary
                  </h3>

                  {/* Charity Info */}
                  <div className="flex items-start gap-3 mb-6 pb-6 border-b border-gray-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{charity.name}</p>
                      <p className="text-gray-400 text-sm">
                        {charity.category}
                      </p>
                    </div>
                  </div>

                  {/* Amount Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-400">
                      <span>Donation amount</span>
                      <span>£{donationAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Platform fee (5%)</span>
                      <span>£{platformFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-sm">
                      <span>To charity</span>
                      <span>
                        £{(donationAmount - platformFee).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between text-white font-bold text-lg pt-4 border-t border-gray-700 mb-6">
                    <span>Total</span>
                    <span>£{totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Rewards Preview */}
                  <div className="bg-emerald-900/30 rounded-xl p-4 border border-emerald-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">
                        Rewards You&apos;ll Earn
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Points</span>
                      <span className="text-emerald-300 font-bold">
                        +{pointsEarned}
                      </span>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Verified charity partner</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Tax receipt available</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Secure SSL encryption</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
