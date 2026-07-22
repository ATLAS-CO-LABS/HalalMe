"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { resolvePostLoginDestination } from "@/lib/postLoginRedirect";
import { startCooldown } from "@/lib/otpCooldown";
import { Eye, EyeOff, ArrowRight, X, Mail } from "lucide-react";

const inputClass =
  "w-full h-12 px-4 bg-[#102C26] border border-[#F7E7CE]/12 text-[#F7E7CE] placeholder:text-[#F7E7CE]/20 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors text-sm disabled:opacity-50";

const labelClass =
  "block text-[10px] font-bold text-[#F7E7CE]/35 uppercase tracking-[0.22em] mb-1.5";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [mode, setMode] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      const redirect = searchParams.get("redirect");
      router.push(await resolvePostLoginDestination(redirect));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Passwordless path: email a 6-digit code, then verify it on /verify-otp.
  // Required for merchant accounts (which have no password) and a handy
  // fallback for anyone who's forgotten theirs.
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const emailLower = email.trim().toLowerCase();
    try {
      await authService.sendLoginOtp(emailLower);
      startCooldown(emailLower, "login");
      const redirect = searchParams.get("redirect");
      const qs = new URLSearchParams({ email: emailLower, type: "login" });
      if (redirect) qs.set("redirect", redirect);
      router.push(`/verify-otp?${qs.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send a code. Try again.");
      setIsLoading(false);
    }
  };

  function switchMode(next: "password" | "code") {
    setMode(next);
    setError("");
  }

  return (
    <form onSubmit={mode === "password" ? handlePasswordSubmit : handleCodeSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email" type="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          required disabled={isLoading} className={inputClass}
        />
      </div>

      {/* Sign-in method */}
      <div>
        <span className={labelClass}>Sign in with</span>
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#102C26] border border-[#F7E7CE]/12">
          <button
            type="button"
            onClick={() => switchMode("password")}
            className={`h-9 text-xs font-bold uppercase tracking-wide transition-colors ${
              mode === "password"
                ? "bg-[#F7E7CE] text-[#102C26]"
                : "text-[#F7E7CE]/45 hover:text-[#F7E7CE]/70"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => switchMode("code")}
            className={`h-9 text-xs font-bold uppercase tracking-wide transition-colors ${
              mode === "code"
                ? "bg-[#F7E7CE] text-[#102C26]"
                : "text-[#F7E7CE]/45 hover:text-[#F7E7CE]/70"
            }`}
          >
            Email Code
          </button>
        </div>
      </div>

      {/* Password (password mode only) */}
      {mode === "password" && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className={labelClass} style={{ marginBottom: 0 }}>Password</label>
            <Link href="/forgot-password" className="text-[10px] text-[#F7E7CE]/40 hover:text-[#F7E7CE]/70 uppercase tracking-wide transition-colors">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required disabled={isLoading}
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
        </div>
      )}

      {mode === "code" && (
        <p className="text-xs text-[#F7E7CE]/40 leading-relaxed">
          We&apos;ll email you a 6-digit code to sign in, no password needed.
          Merchant accounts always sign in this way.
        </p>
      )}

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
            {mode === "password" ? "Signing in…" : "Sending code…"}
          </>
        ) : mode === "password" ? (
          <>
            Sign In
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Email me a code
          </>
        )}
      </button>
    </form>
  );
}
