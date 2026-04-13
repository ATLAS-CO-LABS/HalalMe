"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService, isRateLimitError } from "@/services/authService";
import { startCooldown, getCooldownRemaining, COOLDOWN_SECONDS } from "@/lib/otpCooldown";
import { minDelay } from "@/lib/minDelay";
import OtpForm from "@/components/auth/OtpForm";

// ── Email masking ─────────────────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(2, local.length - 2))}@${domain}`;
}

// ── Main content ──────────────────────────────────────────────────────────────

function VerifyOtpContent() {
  const router = useRouter();
  const params = useSearchParams();

  const rawEmail  = params.get("email") ?? "";
  const type      = (params.get("type") ?? "signup") as "signup" | "reset";
  const redirect  = params.get("redirect") ?? null;
  const email     = rawEmail.toLowerCase().trim();

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Initialise cooldown from sessionStorage on mount (survives page refresh)
  useEffect(() => {
    if (!email) return;
    const remaining = getCooldownRemaining(email, type);
    setCooldown(remaining);
  }, [email, type]);

  // Count down every second
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6 || isVerifying) return;
    setError(null);
    setIsVerifying(true);
    try {
      if (type === "signup") {
        await minDelay(authService.verifySignupOtp(email, otp));
        router.push(redirect ?? "/dashboard");
      } else {
        await minDelay(authService.verifyPasswordResetOtp(email, otp));
        router.push("/reset-password");
      }
    } catch (err) {
      if (isRateLimitError(err)) {
        setError("Too many attempts. Please wait a minute before trying again.");
      } else {
        setError("Invalid or expired code — request a new one below.");
      }
      setIsVerifying(false);
    }
  }, [email, otp, type, router, isVerifying]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || isResending) return;
    setError(null);
    setResendMessage(null);
    setIsResending(true);
    try {
      if (type === "signup") {
        await authService.resendSignupOtp(email);
      } else {
        await authService.sendPasswordResetOtp(email);
      }
      startCooldown(email, type);
      setCooldown(COOLDOWN_SECONDS);
      setResendMessage("A new code has been sent.");
      setOtp("");
    } catch (err) {
      if (isRateLimitError(err)) {
        setError("Too many requests. Please wait a minute before trying again.");
        setCooldown(COOLDOWN_SECONDS);
      } else {
        setError(err instanceof Error ? err.message : "Failed to resend. Try again.");
      }
    } finally {
      setIsResending(false);
    }
  }, [email, type, cooldown, isResending]);

  if (!email) {
    return (
      <div className="text-center text-[#F7E7CE]/60 py-12">
        <p>No email provided. Please go back and try again.</p>
      </div>
    );
  }

  const resendLabel =
    cooldown > 0
      ? `Resend code in ${cooldown}s`
      : isResending
      ? "Sending…"
      : "Resend code";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F7E7CE]/10 border border-[#F7E7CE]/20">
          <svg className="h-7 w-7 text-[#F7E7CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-[#F7E7CE] tracking-tight">
          Check your email
        </h1>
        <p className="text-sm text-[#F7E7CE]/55 leading-relaxed">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-[#F7E7CE]/80">{maskEmail(email)}</span>
        </p>
      </div>

      {/* OTP input */}
      <OtpForm
        value={otp}
        onChange={(v) => { setOtp(v); setError(null); }}
        onSubmit={handleVerify}
        isLoading={isVerifying}
        error={error}
        length={6}
      />

      {/* Resend */}
      <div className="text-center space-y-2">
        {resendMessage && (
          <p className="text-sm text-emerald-400">{resendMessage}</p>
        )}
        <p className="text-sm text-[#F7E7CE]/40">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="font-semibold text-[#F7E7CE]/70 hover:text-[#F7E7CE] transition-colors
              disabled:opacity-40 disabled:cursor-not-allowed underline underline-offset-2"
          >
            {resendLabel}
          </button>
        </p>
        <p className="text-xs text-[#F7E7CE]/25">
          Check your spam folder if you don&apos;t see it.
        </p>
      </div>

      {/* Back link */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs text-[#F7E7CE]/30 hover:text-[#F7E7CE]/60 transition-colors"
        >
          ← Go back
        </button>
      </div>
    </div>
  );
}

// ── Page export (Suspense required for useSearchParams) ───────────────────────

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpContent />
    </Suspense>
  );
}
