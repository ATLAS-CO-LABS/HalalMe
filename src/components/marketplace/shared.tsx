"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { BG, BG2, BLUE, CREAM, DEEP } from "@/components/marketplace/theme";

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-px" style={{ backgroundColor: BLUE }} />
      <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: BLUE }}>
        {children}
      </span>
    </div>
  );
}

/** Title block used at the top of every inner Marketplace page. */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header
      className="py-12 md:py-16"
      style={{ backgroundColor: BG2, borderBottom: `1px solid ${BLUE}50` }}
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.9]"
          style={{ color: CREAM }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-5 max-w-xl text-sm md:text-base leading-relaxed"
            style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
          >
            {description}
          </p>
        )}
      </div>
    </header>
  );
}

/** Empty, not-found and error states. */
export function Notice({
  title,
  message,
  actionHref,
  actionLabel,
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div
      className="px-6 py-16 md:py-20 text-center"
      style={{ backgroundColor: BG2, border: `1px solid ${BLUE}30` }}
    >
      <h2
        className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter mb-3"
        style={{ color: CREAM }}
      >
        {title}
      </h2>
      <p
        className="max-w-md mx-auto text-sm leading-relaxed"
        style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
      >
        {message}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-3 mt-8 px-7 py-3.5 font-extrabold uppercase tracking-tighter text-sm text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: DEEP }}
        >
          {actionLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export function QuantityStepper({
  quantity,
  onChange,
  label,
  max,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  label: string;
  /** Units in stock. The plus button stops here. */
  max?: number;
}) {
  const buttonClass =
    "w-10 h-10 flex items-center justify-center transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div
      className="inline-flex items-center"
      style={{ backgroundColor: BG, border: `1px solid ${BLUE}50`, color: CREAM }}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
        aria-label={`Decrease quantity of ${label}`}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-10 text-center text-sm font-extrabold tabular-nums" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        className={buttonClass}
        onClick={() => onChange(quantity + 1)}
        disabled={max !== undefined && quantity >= max}
        aria-label={`Increase quantity of ${label}`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Forms ────────────────────────────────────────────────────────────────────

export const darkInputClass =
  "w-full h-12 px-4 text-sm bg-transparent outline-none transition-colors placeholder:text-[#F7E7CE]/40 focus:border-[#3B82F6]";

export function TextField({
  label,
  value,
  onChange,
  error,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: `${CREAM}CC` }}>
        {label}
      </span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={darkInputClass}
        style={{ backgroundColor: BG2, color: CREAM, border: `1px solid ${error ? "#F87171" : `${BLUE}50`}` }}
      />
      {error && <span className="block text-xs mt-1.5 text-red-300">{error}</span>}
    </label>
  );
}

/** Bordered panel used for basket summaries, checkout sections and order parcels. */
export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`p-5 md:p-7 ${className}`} style={{ backgroundColor: BG2, border: `1px solid ${BLUE}50` }}>
      {title && (
        <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-tighter mb-5" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

// ── Parcel status ────────────────────────────────────────────────────────────

/** Customer-facing wording for each fulfilment status. */
export const PARCEL_STATUS: Record<string, { label: string; color: string }> = {
  new: { label: "Order placed", color: "#FBBF24" },
  accepted: { label: "Being prepared", color: "#FBBF24" },
  packed: { label: "Packed", color: "#FBBF24" },
  shipped: { label: "On its way", color: "#60A5FA" },
  delivered: { label: "Delivered", color: "#4ADE80" },
  cancelled: { label: "Cancelled", color: "#F87171" },
  refunded: { label: "Refunded", color: "#F87171" },
};

export function ParcelBadge({ status }: { status: string }) {
  const meta = PARCEL_STATUS[status] ?? { label: status, color: CREAM };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 whitespace-nowrap"
      style={{ color: meta.color, border: `1px solid ${meta.color}60` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </span>
  );
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
