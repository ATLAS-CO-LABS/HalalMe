"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { authService, isRateLimitError } from "@/services/authService";
import { startCooldown } from "@/lib/otpCooldown";

const inputClass =
  "w-full h-12 px-4 bg-[#102C26] border border-[#F7E7CE]/12 text-[#F7E7CE] placeholder:text-[#F7E7CE]/20 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors text-sm disabled:opacity-50";

const labelClass =
  "block text-[10px] font-bold text-[#F7E7CE]/35 uppercase tracking-[0.22em] mb-1.5";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const normalizedEmail = email.toLowerCase().trim();
    try {
      await authService.sendPasswordResetOtp(normalizedEmail);
      startCooldown(normalizedEmail, "reset");
      router.push(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}&type=reset`);
    } catch (err) {
      if (isRateLimitError(err)) {
        setError("Too many requests. Please wait a minute before trying again.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to send code");
      }
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className={labelClass}>Email address</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className={inputClass}
        />
        <p className="text-[10px] text-[#F7E7CE]/25 mt-1.5 uppercase tracking-wide">
          We&apos;ll send a 6-digit code to this address
        </p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 p-3 flex items-center gap-2 text-sm text-red-300">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-sm hover:bg-[#F7E7CE]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-[#102C26]/30 border-t-[#102C26] rounded-full animate-spin" />
            Sending…
          </>
        ) : (
          <>
            Send code
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-[#F7E7CE]/30">
        Remember your password?{" "}
        <Link href="/login" className="text-[#F7E7CE]/60 hover:text-[#F7E7CE] font-semibold transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
