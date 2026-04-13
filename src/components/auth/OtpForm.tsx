"use client";

import { useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";

interface OtpFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error?: string | null;
  length?: number;  // defaults to 6, pass 8 if Supabase sends 8-digit OTPs
}

export default function OtpForm({ value, onChange, onSubmit, isLoading, error, length = 6 }: OtpFormProps) {
  // Build an array of exactly `length` slots — never relies on padEnd with empty fill
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Auto-focus first empty box on mount
  useEffect(() => {
    const firstEmpty = digits.findIndex((d) => !d);
    inputRefs.current[firstEmpty === -1 ? 0 : firstEmpty]?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateDigits(next: string[]) {
    onChange(next.join(""));
  }

  function handleChange(idx: number, char: string) {
    const digit = char.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    const next = [...digits];
    next[idx] = digit;
    updateDigits(next);

    if (idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto-submit when all boxes filled
    if (next.every(Boolean)) onSubmit();
  }

  function handleKeyDown(idx: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (digits[idx]) {
        next[idx] = "";
        updateDigits(next);
      } else if (idx > 0) {
        next[idx - 1] = "";
        updateDigits(next);
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    } else if (e.key === "Enter" && digits.every(Boolean)) {
      onSubmit();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const next = Array.from({ length }, (_, i) => pasted[i] ?? "");
    updateDigits(next);

    const focusIdx = Math.min(pasted.length, length - 1);
    inputRefs.current[focusIdx]?.focus();

    if (pasted.length === length) onSubmit();
  }

  const isFilled = digits.every(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 sm:gap-3 justify-center">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={isLoading}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`OTP digit ${idx + 1}`}
            className={[
              "h-12 w-10 sm:h-14 sm:w-12 rounded-lg border text-center text-lg font-bold",
              "bg-[#0A1C19] text-[#F7E7CE] outline-none transition-all",
              "focus:ring-2 focus:ring-[#F7E7CE]/40 focus:border-[#F7E7CE]/60",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-500/60"
                : digit
                ? "border-[#F7E7CE]/40"
                : "border-[#F7E7CE]/20",
            ].join(" ")}
          />
        ))}
      </div>

      {error && (
        <p className="text-center text-sm text-red-400">{error}</p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!isFilled || isLoading}
        className="w-full py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all
          bg-[#F7E7CE] text-[#102C26] hover:bg-[#F7E7CE]/90
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Verifying…
          </span>
        ) : (
          "Verify Code"
        )}
      </button>
    </div>
  );
}
