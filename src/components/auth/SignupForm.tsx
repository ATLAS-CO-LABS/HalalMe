"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Check, X, ArrowRight } from "lucide-react";

const inputClass =
  "w-full h-12 px-4 bg-[#102C26] border border-[#F7E7CE]/12 text-[#F7E7CE] placeholder:text-[#F7E7CE]/20 focus:outline-none focus:border-[#F7E7CE]/40 transition-colors text-sm disabled:opacity-50";

const labelClass =
  "block text-[10px] font-bold text-[#F7E7CE]/35 uppercase tracking-[0.22em] mb-1.5";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup } = useAuth();
  const role = searchParams.get("role");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = [
    { label: "8+ chars",   met: password.length >= 8        },
    { label: "Uppercase",  met: /[A-Z]/.test(password)      },
    { label: "Number",     met: /[0-9]/.test(password)      },
  ];

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8)       return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd))   return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(pwd))   return "Password must contain at least one number";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    const passwordError = validatePassword(password);
    if (passwordError) { setError(passwordError); return; }
    if (!agreeToTerms) { setError("You must agree to the terms and conditions"); return; }
    setIsLoading(true);
    try {
      await signup(name, email, password);
      router.push(role === "ecosystem" ? "/dashboard" : "/select-platform");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label htmlFor="name" className={labelClass}>Full Name</label>
        <input
          id="name" type="text" placeholder="Your full name"
          value={name} onChange={(e) => setName(e.target.value)}
          required disabled={isLoading} className={inputClass}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email" type="email" placeholder="you@example.com"
          value={email} onChange={(e) => setEmail(e.target.value)}
          required disabled={isLoading} className={inputClass}
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className={labelClass}>Password</label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
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
        {/* Strength indicators */}
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

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className={labelClass}>Confirm Password</label>
        <input
          id="confirmPassword" type="password" placeholder="Confirm your password"
          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
          required disabled={isLoading}
          className={`${inputClass} ${
            confirmPassword.length > 0 && password !== confirmPassword
              ? "border-red-400/40"
              : ""
          }`}
        />
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p className="text-[10px] text-red-400 mt-1.5 uppercase tracking-wide">Passwords don&apos;t match</p>
        )}
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3">
        <input
          id="terms" type="checkbox"
          checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)}
          disabled={isLoading}
          className="mt-0.5 h-4 w-4 border border-[#F7E7CE]/20 bg-[#102C26] accent-[#F7E7CE]"
        />
        <label htmlFor="terms" className="text-xs text-[#F7E7CE]/45 leading-relaxed">
          I agree to the{" "}
          <Link href="/terms" className="text-[#F7E7CE]/65 hover:text-[#F7E7CE] transition-colors underline underline-offset-2">
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#F7E7CE]/65 hover:text-[#F7E7CE] transition-colors underline underline-offset-2">
            Privacy Policy
          </Link>
        </label>
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
            Creating account…
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
