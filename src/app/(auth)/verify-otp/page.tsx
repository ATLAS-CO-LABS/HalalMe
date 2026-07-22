"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { authService, isRateLimitError } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { startCooldown, getCooldownRemaining, COOLDOWN_SECONDS } from "@/lib/otpCooldown";
import { minDelay } from "@/lib/minDelay";
import { resolvePostLoginDestination } from "@/lib/postLoginRedirect";
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
  const { refreshUser } = useAuth();

  const rawEmail  = params.get("email") ?? "";
  const type      = (params.get("type") ?? "signup") as "signup" | "reset" | "merchant" | "login";
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
        // onAuthStateChange no longer runs, so manually sync the new session
        // into AuthContext before navigating to the protected dashboard.
        await refreshUser();
        router.push(redirect ?? "/dashboard");
      } else if (type === "merchant") {
        await minDelay(authService.verifyMerchantLoginOtp(email, otp));
        await refreshUser();
        router.push(redirect ?? "/merchant");
      } else if (type === "login") {
        // Returning passwordless login (merchant or customer). Route by role
        // and profile state rather than a fixed destination.
        await minDelay(authService.verifyLoginOtp(email, otp));
        await refreshUser();
        router.push(await resolvePostLoginDestination(redirect));
      } else {
        await minDelay(authService.verifyPasswordResetOtp(email, otp));
        // Same - reset-password page checks useAuth().user; sync first.
        await refreshUser();
        router.push("/reset-password");
      }
    } catch (err) {
      if (isRateLimitError(err)) {
        setError("Too many attempts. Please wait a minute before trying again.");
      } else {
        setError("Invalid or expired code - request a new one below.");
      }
      setIsVerifying(false);
    }
  }, [email, otp, type, router, isVerifying, refreshUser, redirect]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || isResending) return;
    setError(null);
    setResendMessage(null);
    setIsResending(true);
    try {
      if (type === "signup") {
        await authService.resendSignupOtp(email);
      } else if (type === "merchant") {
        await authService.sendMerchantLoginOtp(email);
      } else if (type === "login") {
        await authService.sendLoginOtp(email);
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
      <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 p-6 sm:p-8 text-center">
        <p className="text-sm text-[#F7E7CE]/50">No email provided. Please go back and try again.</p>
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
    <div className="bg-[#0A1C19] border border-[#F7E7CE]/10 p-6 sm:p-8">
      {/* Logo + heading */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-6">
          <span style={{ position: "relative", display: "inline-flex", width: 26, height: 26, flexShrink: 0 }}>
              <span style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
              <Image src="/logo/logo.png" alt="HalalMe" width={26} height={26} className="object-contain relative z-10" />
            </span>
          <div className="w-px h-5 bg-[#F7E7CE]/15" />
          <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-[0.3em]">
            Verify Email
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#F7E7CE] mb-2">
          Enter
          <br />
          <span className="text-[#F7E7CE]/40">Your Code</span>
        </h1>
        <p className="text-[#F7E7CE]/45 text-sm mt-3">
          We sent a 6-digit code to{" "}
          <span className="text-[#F7E7CE]/70 font-semibold">{maskEmail(email)}</span>
        </p>
      </div>

      <div className="h-px w-full bg-[#F7E7CE]/8 mb-7" />

      {/* OTP input */}
      <OtpForm
        value={otp}
        onChange={(v) => { setOtp(v); setError(null); }}
        onSubmit={handleVerify}
        isLoading={isVerifying}
        error={error}
        length={6}
      />

      {/* Resend + back */}
      <div className="mt-6 pt-5 border-t border-[#F7E7CE]/8 space-y-3">
        {resendMessage && (
          <p className="text-center text-xs text-[#F59E0B]">{resendMessage}</p>
        )}
        <p className="text-center text-xs text-[#F7E7CE]/30">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className="text-[#F7E7CE]/60 hover:text-[#F7E7CE] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {resendLabel}
          </button>
          {" "}· Check your spam folder
        </p>
        <p className="text-center text-xs">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-[#F7E7CE]/25 hover:text-[#F7E7CE]/50 transition-colors"
          >
            ← Go back
          </button>
        </p>
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
