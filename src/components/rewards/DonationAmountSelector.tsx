"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface DonationAmountSelectorProps {
  selectedAmount: number | null;
  onAmountSelect: (amount: number) => void;
}

const presetAmounts = [5, 10, 20, 50, 100];

export default function DonationAmountSelector({
  selectedAmount,
  onAmountSelect,
}: DonationAmountSelectorProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const handlePresetClick = (amount: number) => {
    setIsCustom(false);
    setCustomAmount("");
    onAmountSelect(amount);
  };

  const handleCustomChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setCustomAmount(numericValue);
    setIsCustom(true);
    if (numericValue) {
      onAmountSelect(parseInt(numericValue, 10));
    }
  };

  return (
    <div className="space-y-4">
      <label
        className="block text-white font-semibold mb-2"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        Select Donation Amount
      </label>

      {/* Preset Amounts */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {presetAmounts.map((amount) => (
          <motion.button
            key={amount}
            onClick={() => handlePresetClick(amount)}
            className={`py-3 px-4 rounded-xl font-semibold text-lg transition-all ${
              selectedAmount === amount && !isCustom
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-2 border-emerald-400"
                : "bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-emerald-500 hover:text-white"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            £{amount}
          </motion.button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="mt-4">
        <label
          className="block text-gray-400 text-sm mb-2 font-normal"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Or enter a custom amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold">
            £
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            onFocus={() => setIsCustom(true)}
            className={`w-full bg-gray-800 rounded-xl pl-10 pr-4 py-3 text-white text-lg placeholder-gray-500 focus:outline-none transition-all ${
              isCustom && customAmount
                ? "border-2 border-emerald-400"
                : "border-2 border-gray-700 focus:border-emerald-500"
            }`}
            style={{ fontFamily: "var(--font-body)" }}
          />
        </div>
      </div>

      {/* Selected Amount Display */}
      {selectedAmount && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-emerald-900/30 border border-emerald-700 rounded-xl"
        >
          <p
            className="text-emerald-400 text-center font-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            You&apos;re donating{" "}
            <span className="font-bold text-xl">£{selectedAmount}</span>
          </p>
          <p
            className="text-gray-400 text-sm text-center mt-1 font-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            You&apos;ll earn{" "}
            <span className="text-emerald-300 font-semibold">
              {selectedAmount * 10} points
            </span>{" "}
            for this donation
          </p>
        </motion.div>
      )}
    </div>
  );
}
