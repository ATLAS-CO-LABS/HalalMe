"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, ChefHat, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { AuthGateModalProps } from "@/hooks/useAuthGate";

// ── Palette (matches platform teal theme) ─────────────────────────
const BG     = "#0A1C19";
const TEAL   = "#102C26";
const CREAM  = "#F7E7CE";
const BORDER = `${CREAM}12`;

// ── Tiny field component ───────────────────────────────────────────
function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  right,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-[10px] font-bold uppercase mb-1.5"
        style={{ color: `${CREAM}59`, letterSpacing: "0.22em" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-12 px-4 text-sm outline-none transition-colors disabled:opacity-50 placeholder:text-[#F7E7CE]/20"
          style={{
            backgroundColor: TEAL,
            border: `1px solid ${BORDER}`,
            color: CREAM,
            fontFamily: "var(--font-body)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = `${CREAM}66`)}
          onBlur={(e) => (e.currentTarget.style.borderColor = BORDER)}
        />
        {right && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
        )}
      </div>
    </div>
  );
}

// ── Login tab ──────────────────────────────────────────────────────
function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" type="email" value={email} onChange={setEmail}
        placeholder="you@example.com" disabled={loading} />
      <Field
        label="Password"
        type={showPw ? "text" : "password"}
        value={password}
        onChange={setPassword}
        placeholder="Enter your password"
        disabled={loading}
        right={
          <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
            className="text-[#F7E7CE]/30 hover:text-[#F7E7CE]/60 transition-colors">
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 p-3 flex items-center gap-2 text-xs text-red-300">
          <X className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full h-12 flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase transition-colors hover:bg-[#F7E7CE]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: CREAM, color: TEAL, letterSpacing: "0.18em" }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-[#102C26]/30 border-t-[#102C26] rounded-full animate-spin" />
            Signing in…
          </>
        ) : (
          <>Sign In <ArrowRight className="w-3.5 h-3.5" /></>
        )}
      </button>
    </form>
  );
}

// ── Signup tab ─────────────────────────────────────────────────────
function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const { signup } = useAuth();
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [verifyNeeded, setVerifyNeeded] = useState(false);

  const passwordOk =
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  const passwordsMatch = password === confirmPw;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!passwordOk) {
      setError("Password needs 8+ chars, 1 uppercase, 1 number");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { requiresVerification } = await signup(name, email, password);
      if (requiresVerification) {
        setVerifyNeeded(true);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  if (verifyNeeded) {
    return (
      <div className="py-4 text-center space-y-3">
        <div className="w-10 h-10 mx-auto flex items-center justify-center"
          style={{ backgroundColor: `${TEAL}`, border: `1px solid ${CREAM}20` }}>
          <span className="text-xl">📧</span>
        </div>
        <p className="text-sm font-bold" style={{ color: CREAM }}>Check your email</p>
        <p className="text-xs" style={{ color: `${CREAM}55` }}>
          We sent a verification link to <strong style={{ color: `${CREAM}90` }}>{email}</strong>.
          Verify your email and then sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full name" value={name} onChange={setName}
        placeholder="Your name" disabled={loading} />
      <Field label="Email" type="email" value={email} onChange={setEmail}
        placeholder="you@example.com" disabled={loading} />
      <div>
        <Field
          label="Password"
          type={showPw ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Min 8 chars, 1 uppercase, 1 number"
          disabled={loading}
          right={
            <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
              className="text-[#F7E7CE]/30 hover:text-[#F7E7CE]/60 transition-colors">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        {password.length > 0 && (
          <div className="flex gap-1.5 mt-1.5">
            {[password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].map((ok, i) => (
              <span key={i} className="h-1 flex-1 transition-colors"
                style={{ backgroundColor: ok ? `${CREAM}90` : `${CREAM}12` }} />
            ))}
          </div>
        )}
      </div>

      <Field
        label="Confirm Password"
        type={showConfirm ? "text" : "password"}
        value={confirmPw}
        onChange={setConfirmPw}
        placeholder="Re-enter your password"
        disabled={loading}
        right={
          <button type="button" tabIndex={-1} onClick={() => setShowConfirm((v) => !v)}
            className="text-[#F7E7CE]/30 hover:text-[#F7E7CE]/60 transition-colors">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 p-3 flex items-center gap-2 text-xs text-red-300">
          <X className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name || !email || !password || !confirmPw}
        className="w-full h-12 flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase transition-colors hover:bg-[#F7E7CE]/90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: CREAM, color: TEAL, letterSpacing: "0.18em" }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-[#102C26]/30 border-t-[#102C26] rounded-full animate-spin" />
            Creating account…
          </>
        ) : (
          <>Create Account <ArrowRight className="w-3.5 h-3.5" /></>
        )}
      </button>
    </form>
  );
}

// ── Main modal ─────────────────────────────────────────────────────
export function AuthModal({ isOpen, onClose, onSuccess, message }: AuthGateModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signup");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm overflow-y-auto overscroll-contain max-h-[90vh]"
            style={{ backgroundColor: BG, border: `1px solid ${CREAM}10` }}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-1 transition-opacity hover:opacity-80"
              style={{ color: `${CREAM}35` }}
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>

            <div className="px-6 pt-6 pb-7">
              {/* Header */}
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: TEAL, border: `1px solid ${CREAM}15` }}>
                  <ChefHat className="w-4 h-4" style={{ color: CREAM }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase" style={{ color: `${CREAM}40`, letterSpacing: "0.22em" }}>
                    HalalMe
                  </p>
                  {message ? (
                    <p className="text-sm font-bold leading-snug" style={{ color: CREAM }}>
                      {message}
                    </p>
                  ) : (
                    <p className="text-sm font-bold" style={{ color: CREAM }}>
                      {tab === "signup" ? "Create your free account" : "Welcome back"}
                    </p>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex mb-5" style={{ borderBottom: `1px solid ${CREAM}0C` }}>
                {(["signup", "signin"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className="flex-1 pb-2.5 text-[10px] font-extrabold uppercase transition-colors"
                    style={{
                      color: tab === t ? CREAM : `${CREAM}30`,
                      letterSpacing: "0.18em",
                      borderBottom: `2px solid ${tab === t ? CREAM : "transparent"}`,
                      marginBottom: -1,
                    }}
                  >
                    {t === "signup" ? "Sign Up" : "Sign In"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: tab === "signup" ? -8 : 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {tab === "signin"
                    ? <LoginForm onSuccess={onSuccess ?? (() => {})} />
                    : <SignupForm onSuccess={onSuccess ?? (() => {})} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
