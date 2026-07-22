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
  // Build an array of exactly `length` slots - never relies on padEnd with empty fill
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
              "h-12 w-10 sm:h-14 sm:w-12 border text-center text-lg font-bold",
              "bg-[#102C26] text-[#F7E7CE] outline-none transition-colors",
              "focus:border-[#F7E7CE]/60",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error
                ? "border-red-500/60"
                : digit
                ? "border-[#F59E0B]/60"
                : "border-[#F7E7CE]/12",
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
        className="w-full h-12 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-sm hover:bg-[#F7E7CE]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-[#102C26]/30 border-t-[#102C26] rounded-full animate-spin" />
            Verifying…
          </>
        ) : (
          "Verify Code"
        )}
      </button>
    </div>
  );
}
