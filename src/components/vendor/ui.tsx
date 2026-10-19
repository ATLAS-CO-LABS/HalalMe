"use client";

// UI kit for the Marketplace vendor portal and the admin Marketplace screens.
//
// The portal deliberately shares the admin panel's visual system (cream canvas,
// white cards, forest ink, amber accent, square corners), so the base
// primitives are re-exported from the admin kit and only the pieces admin did
// not already have are defined here.

import { useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { display } from "@/app/admin/_fonts";
import { Badge, Modal } from "@/app/admin/_ui";
import type { Tone } from "@/lib/vendorOnboarding";

export {
  Badge,
  EmptyState,
  FilterPills,
  LoadError,
  Modal,
  Pagination,
  StatCard,
  TableSkeleton,
  ToastView,
  useToast,
  fmtDate,
  fmtDateTime,
} from "@/app/admin/_ui";
export { display };

// ── Page chrome ──────────────────────────────────────────────────────────────

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  /** Rendered flush with the bottom edge, for a tab row. */
  children?: React.ReactNode;
}) {
  return (
    <div className={`bg-white border-b border-[#102C26]/12 px-4 sm:px-8 pt-4 sm:pt-5 ${children ? "" : "pb-4 sm:pb-5"}`}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-5 h-px bg-[#F59E0B]" />
            <span className="text-[#B45309] text-[9px] font-bold uppercase tracking-[0.3em]">{eyebrow}</span>
          </div>
          <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none break-words`}>
            {title}
          </h1>
          {description && <p className="text-xs sm:text-sm text-gray-600 mt-1.5 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function PageBody({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div className={`px-4 sm:px-8 py-5 space-y-5 ${narrow ? "max-w-4xl" : ""}`}>{children}</div>;
}

/** Underlined tab row that sits at the bottom of a PageHeader. */
export function Tabs<K extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { key: K; label: string; icon?: React.ElementType; count?: number }[];
  value: K;
  onChange: (key: K) => void;
}) {
  return (
    <div role="tablist" className="flex items-center gap-0.5 mt-4 -mb-px overflow-x-auto">
      {tabs.map(({ key, label, icon: Icon, count }) => {
        const active = value === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              active ? "border-[#F59E0B] text-[#102C26]" : "border-transparent text-gray-500 hover:text-[#102C26]"
            }`}
          >
            {Icon && <Icon size={15} className={active ? "text-[#F59E0B]" : ""} />}
            {label}
            {count !== undefined && count > 0 && (
              <span className="min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-[#F59E0B] text-white text-[10px] font-bold leading-none">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Card({
  title,
  subtitle,
  action,
  children,
  flush = false,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  /** No body padding, for tables and lists that run edge to edge. */
  flush?: boolean;
  className?: string;
}) {
  return (
    <section className={`bg-white border border-[#102C26]/12 ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#102C26]/8">
          <div className="min-w-0">
            {title && <h2 className={`${display.className} text-sm font-bold uppercase tracking-tight text-[#102C26]`}>{title}</h2>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={flush ? "" : "p-4 sm:p-5"}>{children}</div>
    </section>
  );
}

// ── Buttons ──────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-[#102C26] text-[#F7E7CE] hover:bg-[#102C26]/90 border border-[#102C26]",
  secondary: "bg-white text-[#102C26] border border-[#102C26]/20 hover:border-[#102C26]/45 hover:bg-[#102C26]/[0.03]",
  danger: "bg-red-600 text-white border border-red-600 hover:bg-red-700",
  ghost: "text-gray-600 border border-transparent hover:text-[#102C26] hover:bg-[#102C26]/[0.06]",
};

function buttonClass(variant: ButtonVariant, size: "sm" | "md", block: boolean) {
  return `inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wide whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/60 disabled:opacity-50 disabled:cursor-not-allowed ${
    size === "sm" ? "h-8 px-3 text-[11px]" : "h-10 px-4 text-xs"
  } ${block ? "w-full" : ""} ${BUTTON_VARIANTS[variant]}`;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  icon: Icon,
  children,
  className = "",
  ...rest
}: {
  variant?: ButtonVariant;
  size?: "sm" | "md";
  block?: boolean;
  loading?: boolean;
  icon?: React.ElementType;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      disabled={rest.disabled || loading}
      className={`${buttonClass(variant, size, block)} ${className}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  block = false,
  icon: Icon,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  block?: boolean;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, block)}>
      {Icon && <Icon size={14} />}
      {children}
    </Link>
  );
}

// ── Form controls ────────────────────────────────────────────────────────────

export const inputClass =
  "w-full h-10 px-3 text-sm text-gray-900 bg-white border border-[#102C26]/20 rounded-none placeholder:text-gray-400 transition-colors focus:outline-none focus:border-[#102C26] focus:ring-2 focus:ring-[#102C26]/12 disabled:bg-gray-50 disabled:text-gray-500";

export function Field({
  label,
  hint,
  error,
  optional = false,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string | null;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  // A wrapping <label> ties the caption to whichever control is passed in,
  // without every call site having to thread an id through.
  return (
    <label className={`block ${className}`}>
      <span className="flex items-baseline justify-between gap-2 mb-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-gray-700">{label}</span>
        {optional && <span className="text-[10px] text-gray-400">Optional</span>}
      </span>
      {children}
      {error ? (
        <span className="block text-xs text-red-600 mt-1">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-gray-500 mt-1">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={`${inputClass} h-auto py-2.5 resize-y ${props.className ?? ""}`} />;
}

export function Select({
  options,
  ...props
}: { options: { value: string; label: string }[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${inputClass} pr-8 cursor-pointer ${props.className ?? ""}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Number input prefixed with a pound sign. */
export function MoneyInput({ value, onChange, ...rest }: {
  value: string;
  onChange: (value: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div className="relative">
      <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">£</span>
      <input
        {...rest}
        type="number"
        inputMode="decimal"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pl-7 tabular-nums`}
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex items-start justify-between gap-4 py-3 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-900">{label}</span>
        {description && <span className="block text-xs text-gray-500 mt-0.5">{description}</span>}
      </span>
      <span className="relative shrink-0 mt-0.5">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="block w-10 h-5.5 rounded-full bg-gray-300 transition-colors peer-checked:bg-[#102C26] peer-focus-visible:ring-2 peer-focus-visible:ring-[#F59E0B]/60" />
        <span className="absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4.5" />
      </span>
    </label>
  );
}

/** Multi-select as a wrap of toggle chips. */
export function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((v) => v !== option.value) : [...value, option.value])}
            className={`px-3 py-2 text-xs font-semibold border transition-colors ${
              active
                ? "bg-[#102C26] text-[#F7E7CE] border-[#102C26]"
                : "bg-white text-gray-700 border-[#102C26]/20 hover:border-[#102C26]/45"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative flex-1 min-w-48">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${inputClass} pl-9 bg-gray-50 focus:bg-white`}
      />
    </div>
  );
}

// ── Data display ─────────────────────────────────────────────────────────────

export function StatusBadge<S extends string>({
  status,
  map,
}: {
  status: S;
  map: Record<S, { label: string; tone: Tone }>;
}) {
  return <Badge label={map[status].label} tone={map[status].tone} />;
}

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  /** Extra classes for both header and cell, e.g. "hidden lg:table-cell". */
  className?: string;
  render: (row: T) => React.ReactNode;
}

/**
 * Table on desktop, stacked cards on mobile. `mobile` renders one row as a
 * card; rows become links when `href` is given.
 */
export function DataTable<T>({
  rows,
  columns,
  rowKey,
  href,
  mobile,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  href?: (row: T) => string;
  mobile: (row: T) => React.ReactNode;
}) {
  return (
    <>
      <ul className="md:hidden divide-y divide-[#102C26]/8">
        {rows.map((row) => (
          <li key={rowKey(row)}>
            {href ? (
              <Link href={href(row)} className="block px-4 py-3.5 hover:bg-[#102C26]/[0.02] transition-colors">
                {mobile(row)}
              </Link>
            ) : (
              <div className="px-4 py-3.5">{mobile(row)}</div>
            )}
          </li>
        ))}
      </ul>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 first:pl-5 last:pr-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 whitespace-nowrap ${
                    col.align === "right" ? "text-right" : "text-left"
                  } ${col.className ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#102C26]/8">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-[#102C26]/[0.02] transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 first:pl-5 last:pr-5 py-3.5 align-middle ${
                      col.align === "right" ? "text-right tabular-nums" : ""
                    } ${col.className ?? ""}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Client-side paging for lists that arrive whole. Resets are the caller's job via `setPage(0)`. */
export function usePaged<T>(rows: T[], pageSize = 10) {
  const [page, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(rows.length / pageSize) - 1);
  const current = Math.min(page, lastPage);
  return {
    page: current,
    setPage,
    pageSize,
    total: rows.length,
    slice: rows.slice(current * pageSize, (current + 1) * pageSize),
    onPrev: () => setPage(Math.max(0, current - 1)),
    onNext: () => setPage(Math.min(lastPage, current + 1)),
  };
}

/** Label and value pair for detail panels. */
export function DetailList({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-[#102C26]/8">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-6 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-500 shrink-0">{row.label}</dt>
          <dd className="text-sm text-gray-900 sm:text-right break-words min-w-0">{row.value || <span className="text-gray-400">Not set</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Inline message strip: guidance, warnings and review notes. */
export function Callout({
  tone = "info",
  title,
  children,
  icon: Icon,
  action,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title?: string;
  children: React.ReactNode;
  icon?: React.ElementType;
  action?: React.ReactNode;
}) {
  const tones = {
    info: "bg-[#102C26]/[0.04] border-[#102C26]/15 text-[#102C26]",
    success: "bg-green-50 border-green-200 text-green-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    danger: "bg-red-50 border-red-200 text-red-900",
  };
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 border px-4 py-3 ${tones[tone]}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {Icon && <Icon size={16} className="shrink-0 mt-0.5" />}
        <div className="min-w-0">
          {title && <p className="text-sm font-bold">{title}</p>}
          <div className={`text-sm leading-relaxed ${title ? "opacity-90 mt-0.5" : ""}`}>{children}</div>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ── Dialogs ──────────────────────────────────────────────────────────────────

/**
 * Confirmation dialog, optionally with a note the user has to write (a reason
 * for rejecting, for example). `onConfirm` receives the note.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  danger = false,
  busy = false,
  noteLabel,
  notePlaceholder,
  noteRequired = false,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  noteLabel?: string;
  notePlaceholder?: string;
  noteRequired?: boolean;
  error?: string | null;
}) {
  return (
    <Modal open={open} onClose={onClose} busy={busy} labelledBy="confirm-title" describedBy="confirm-body">
      {/* Remounted on each open so a previous note never carries over */}
      {open && (
        <ConfirmBody
          onClose={onClose}
          onConfirm={onConfirm}
          title={title}
          body={body}
          confirmLabel={confirmLabel}
          danger={danger}
          busy={busy}
          noteLabel={noteLabel}
          notePlaceholder={notePlaceholder}
          noteRequired={noteRequired}
          error={error}
        />
      )}
    </Modal>
  );
}

function ConfirmBody({
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  danger,
  busy,
  noteLabel,
  notePlaceholder,
  noteRequired,
  error,
}: Omit<Parameters<typeof ConfirmDialog>[0], "open">) {
  const [note, setNote] = useState("");
  return (
    <div className="p-5 sm:p-6">
      <h2 id="confirm-title" className={`${display.className} text-base font-bold uppercase tracking-tight text-[#102C26]`}>
        {title}
      </h2>
      <div id="confirm-body" className="text-sm text-gray-600 mt-2 leading-relaxed">
        {body}
      </div>
      {noteLabel && (
        <Field label={noteLabel} optional={!noteRequired} className="mt-4">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={notePlaceholder} rows={3} />
        </Field>
      )}
      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          loading={busy}
          disabled={noteRequired && note.trim() === ""}
          onClick={() => onConfirm(note)}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

/** Square thumbnail with a neutral placeholder when there is no image. */
export function Thumb({ src, alt, size = 40 }: { src: string | null | undefined; alt: string; size?: number }) {
  return (
    <span
      className="shrink-0 inline-flex items-center justify-center bg-gray-100 border border-[#102C26]/10 overflow-hidden text-[10px] font-bold text-gray-400 uppercase"
      style={{ width: size, height: size }}
    >
      {src ? (
        // Vendor uploads are data URLs and arbitrary hosts, which next/image cannot optimise.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        alt.slice(0, 2)
      )}
    </span>
  );
}
