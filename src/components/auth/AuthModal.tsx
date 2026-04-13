"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, EyeOff, ChefHat, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { AuthGateModalProps } from "@/hooks/useAuthGate";

// ── Palette (matches Kitchen AI dark theme) ────────────────────────
const BG    = "#0D0A17";
const CREAM = "#F7E7CE";
const FX    = "#a21caf";
const FX2   = "#a855f7";
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
        style={{ color: `${CREAM}45`, letterSpacing: "0.2em" }}
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
          className="w-full h-11 px-3.5 text-sm outline-none transition-colors disabled:opacity-40"
          style={{
            backgroundColor: `${CREAM}06`,
            border: `1px solid ${BORDER}`,
            color: CREAM,
            fontFamily: "var(--font-body)",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = `${FX2}55`)}
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
        placeholder="••••••••"
        disabled={loading}
        right={
          <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)}
            style={{ color: `${CREAM}35` }}>
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />

      {error && (
        <p className="text-[11px]" style={{ color: "#f87171" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !email || !password}
        className="w-full h-11 flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase transition-opacity disabled:opacity-40"
        style={{ backgroundColor: FX, color: "#fff", letterSpacing: "0.18em" }}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <><ArrowRight className="w-3.5 h-3.5" /> Sign In</>}
      </button>
    </form>
  );
}

// ── Signup tab ─────────────────────────────────────────────────────
function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const { signup } = useAuth();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [verifyNeeded, setVerifyNeeded] = useState(false);

  const passwordOk =
    password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!passwordOk) {
      setError("Password needs 8+ chars, 1 uppercase, 1 number");
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
        <div className="w-10 h-10 mx-auto flex items-center justify-center" style={{ backgroundColor: `${FX}25`, border: `1px solid ${FX}40` }}>
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
              style={{ color: `${CREAM}35` }}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        {/* password strength dots */}
        {password.length > 0 && (
          <div className="flex gap-1.5 mt-1.5">
            {[password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].map((ok, i) => (
              <span key={i} className="h-1 flex-1 transition-colors"
                style={{ backgroundColor: ok ? FX2 : `${CREAM}12` }} />
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px]" style={{ color: "#f87171" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !name || !email || !password}
        className="w-full h-11 flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase transition-opacity disabled:opacity-40"
        style={{ backgroundColor: FX, color: "#fff", letterSpacing: "0.18em" }}
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <><ArrowRight className="w-3.5 h-3.5" /> Create Account</>}
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
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm"
            style={{ backgroundColor: BG, border: `1px solid ${CREAM}0F` }}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
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
                <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ backgroundColor: FX }}>
                  <ChefHat className="w-4 h-4 text-white" strokeWidth={1.5} />
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
                      color: tab === t ? FX2 : `${CREAM}30`,
                      letterSpacing: "0.18em",
                      borderBottom: `2px solid ${tab === t ? FX2 : "transparent"}`,
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
                  initial={{ opacity: 0, x: tab === "signup" ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {tab === "signin"
                    ? <LoginForm onSuccess={onSuccess ?? (() => {})} />
                    : <SignupForm onSuccess={onSuccess ?? (() => {})} />}
                </motion.div>
              </AnimatePresence>

              {/* Footer switch */}
              <p className="mt-4 text-center text-[10px]" style={{ color: `${CREAM}28` }}>
                {tab === "signup" ? "Already have an account? " : "Don't have an account? "}
                <button
                  onClick={() => setTab(tab === "signup" ? "signin" : "signup")}
                  className="underline transition-opacity hover:opacity-80"
                  style={{ color: `${CREAM}55` }}
                >
                  {tab === "signup" ? "Sign in" : "Sign up free"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
