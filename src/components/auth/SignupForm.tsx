"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Check, X } from "lucide-react";

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
    { label: "8+ characters", met: password.length >= 8 },
    { label: "1 uppercase", met: /[A-Z]/.test(password) },
    { label: "1 number", met: /[0-9]/.test(password) },
  ];

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd))
      return "Password must contain at least one uppercase letter";
    if (!/[0-9]/.test(pwd))
      return "Password must contain at least one number";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password);
      if (role === "ecosystem") {
        router.push("/dashboard");
      } else {
        router.push("/select-platform");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm font-medium text-white/85">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          className="w-full h-11 px-4 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#065f46]/70 focus:border-[#065f46] transition-all disabled:opacity-50"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-white/85">
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
          className="w-full h-11 px-4 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#065f46]/70 focus:border-[#065f46] transition-all disabled:opacity-50"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-white/85">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="w-full h-11 px-4 pr-11 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#065f46]/70 focus:border-[#065f46] transition-all disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {password.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {passwordChecks.map((check, i) => (
              <div key={i} className="flex items-center gap-1">
                {check.met ? (
                  <Check className="w-3 h-3 text-[#34a37a] flex-shrink-0" />
                ) : (
                  <X className="w-3 h-3 text-white/30 flex-shrink-0" />
                )}
                <span
                  className={`text-xs whitespace-nowrap ${check.met ? "text-[#34a37a]" : "text-white/30"}`}
                >
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-white/85"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          className={`w-full h-11 px-4 rounded-xl bg-white/[0.08] border text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#065f46]/70 transition-all disabled:opacity-50 ${
            confirmPassword.length > 0 && password !== confirmPassword
              ? "border-red-400/50"
              : "border-white/15 focus:border-[#065f46]"
          }`}
        />
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p className="text-xs text-red-400 mt-1">Passwords don&apos;t match</p>
        )}
      </div>

      <div className="flex items-start space-x-3">
        <input
          id="terms"
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 text-[#065f46] focus:ring-[#065f46]/70 accent-[#065f46]"
          disabled={isLoading}
        />
        <label htmlFor="terms" className="text-sm text-white/65">
          I agree to the{" "}
          <Link
            href="/terms"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Terms and Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-amber-400 hover:text-amber-300 transition-colors"
          >
            Privacy Policy
          </Link>
        </label>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300 flex items-center gap-2">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-[#065f46] hover:bg-[#064e3b] text-white font-bold rounded-xl h-12 shadow-lg shadow-black/25 text-base"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating account...
          </span>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-sm text-white/60">
        Already have an account?{" "}
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
