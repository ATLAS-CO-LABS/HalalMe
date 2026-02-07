"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mockForgotPassword } from "@/lib/auth/mockAuth";
import { Check, X } from "lucide-react";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await mockForgotPassword(email);
      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 p-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <p className="text-sm text-emerald-300">
            Password reset link has been sent to your email!
          </p>
          <p className="mt-2 text-xs text-emerald-200/50">
            Redirecting to login page...
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Return to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-emerald-100/80">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="w-full h-11 px-4 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition-all disabled:opacity-50"
        />
        <p className="text-xs text-emerald-200/40">
          We&apos;ll send you a link to reset your password
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300 flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl h-12 shadow-lg shadow-emerald-500/20 text-base"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </span>
        ) : (
          "Send reset link"
        )}
      </Button>

      <p className="text-center text-sm text-emerald-200/50">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
