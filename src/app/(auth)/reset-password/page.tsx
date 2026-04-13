"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Check, X, KeyRound, ArrowRight } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";

const inputClass =
  "w-full h-12 px-4 bg-[#102C26] border border-[#F7E7CE]/12 text-[#F7E7CE] placeholder:text-[#F7E7CE]/20 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors text-sm disabled:opacity-50";

const labelClass =
  "block text-[10px] font-bold text-[#F7E7CE]/35 uppercase tracking-[0.22em] mb-1.5";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [isLoading, setIsLoading]           = useState(false);
  const [error, setError]                   = useState("");
  const [success, setSuccess]               = useState(false);

  const passwordChecks = [
    { label: "8+ chars",  met: password.length >= 8      },
    { label: "Uppercase", met: /[A-Z]/.test(password)    },
    { label: "Number",    met: /[0-9]/.test(password)    },
  ];

  // If auth is resolved and user is not signed in, they haven't verified OTP yet
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/forgot-password");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("Password does not meet the requirements");
      return;
    }
    setIsLoading(true);
    try {
      await authService.updatePassword(password);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 p-6 sm:p-8 text-center">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
        </div>
        <h2
          className="text-xl font-extrabold uppercase tracking-tighter text-[#F7E7CE] mb-2"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Password updated
        </h2>
        <p className="text-sm text-[#F7E7CE]/45 mb-5">
          Your password has been changed. Redirecting to dashboard…
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-[#F7E7CE]/50 hover:text-[#F7E7CE]/80 transition-colors"
        >
          Go to dashboard <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  // ── Loading / redirect guard ───────────────────────────────────────────────
  if (authLoading || !user) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#F7E7CE]/20 border-t-[#F7E7CE]/60" />
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 p-6 sm:p-8">
      {/* Heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="w-px h-5 bg-[#F7E7CE]/15" />
          <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-[0.3em]">
            New Password
          </span>
        </div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#F7E7CE] mb-2"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Reset
          <br />
          <span className="text-[#F7E7CE]/40">Password</span>
        </h1>
        <p className="text-sm text-[#F7E7CE]/45 mt-3">
          Choose a strong new password for your account.
        </p>
      </div>

      <div className="h-px w-full bg-[#F7E7CE]/8 mb-7" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* New password */}
        <div>
          <label className={labelClass}>New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F7E7CE]/30 hover:text-[#F7E7CE]/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="flex gap-4 mt-2.5">
              {passwordChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {check.met
                    ? <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    : <X className="w-3 h-3 text-[#F7E7CE]/20 shrink-0" />
                  }
                  <span className={`text-[10px] uppercase tracking-wide ${check.met ? "text-emerald-400" : "text-[#F7E7CE]/25"}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className={labelClass}>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            className={`${inputClass} ${
              confirmPassword.length > 0 && password !== confirmPassword
                ? "border-red-400/40"
                : ""
            }`}
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="text-[10px] text-red-400 mt-1.5 uppercase tracking-wide">
              Passwords don&apos;t match
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/20 p-3 flex items-center gap-2 text-sm text-red-300">
            <X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-sm hover:bg-[#F7E7CE]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-[#102C26]/30 border-t-[#102C26] rounded-full animate-spin" />
              Updating…
            </>
          ) : (
            <>
              Set new password
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#F7E7CE]/8 text-center">
        <Link href="/login" className="text-xs text-[#F7E7CE]/30 hover:text-[#F7E7CE]/60 transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
