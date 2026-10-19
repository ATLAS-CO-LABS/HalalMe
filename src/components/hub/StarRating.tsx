"use client";

import { useRef } from "react";
import { Star } from "lucide-react";

const AMBER = "var(--hm-amber)";
const EMPTY = "color-mix(in oklab, var(--hm-text) 22%, transparent)";
const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

/** Read-only stars with a text equivalent for screen readers. */
export function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          aria-hidden
          className={cls}
          style={{ color: n <= rating ? AMBER : EMPTY, fill: n <= rating ? AMBER : "transparent" }}
        />
      ))}
    </span>
  );
}

/**
 * Star rating input, built as a radio group so it works from the keyboard the
 * way people expect: Tab in, arrow keys to change, and every star announces
 * "3 stars, Good" rather than being an unlabelled button.
 */
export function StarInput({
  value,
  onChange,
  disabled,
  invalid,
  describedBy,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (delta: number) => {
    // Step from the star that has focus, not the stored value: with nothing
    // chosen yet, focusing star 3 and pressing → should pick 4, not 1.
    const focused = refs.current.findIndex((el) => el === document.activeElement) + 1;
    const from = focused || value || (delta > 0 ? 0 : 2);
    const next = Math.min(5, Math.max(1, from + delta));
    onChange(next);
    refs.current[next - 1]?.focus();
  };

  return (
    <div className="flex items-center gap-3">
      <div
        role="radiogroup"
        aria-label="Rating"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="inline-flex items-center gap-1"
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); move(1); }
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); move(-1); }
        }}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const checked = value === n;
          const lit = n <= value;
          return (
            <button
              key={n}
              ref={(el) => { refs.current[n - 1] = el; }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={`${n} star${n > 1 ? "s" : ""}, ${LABELS[n]}`}
              // Roving tabindex: one tab stop for the whole group.
              tabIndex={checked || (value === 0 && n === 1) ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(n)}
              className="p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--hm-amber) disabled:opacity-50"
            >
              <Star className="w-7 h-7" style={{ color: lit ? AMBER : EMPTY, fill: lit ? AMBER : "transparent" }} aria-hidden />
            </button>
          );
        })}
      </div>
      <span className="text-sm font-semibold min-w-20" style={{ color: value ? "var(--hm-text)" : "var(--hm-text-subtle)" }} aria-hidden>
        {value ? LABELS[value] : "Tap to rate"}
      </span>
    </div>
  );
}
