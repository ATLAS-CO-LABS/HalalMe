"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { display } from "./_fonts";

// Shared admin UI primitives — used across the Rewards, Kitchen and Hub modules
// so every admin table/card/toast looks and behaves the same.

// ─── z-index scale ──────────────────────────────────────────────────────────────
// One canonical stacking order for the admin panel so overlays never fight.
// Import these instead of writing ad-hoc `z-55` / `z-60` values inline.
//   sticky  — sticky sub-headers inside a scrolling page
//   overlay — mobile drawer / dropdown backdrop scrims
//   menu    — row-action dropdowns and the mobile sidebar drawer
//   modal   — dialog backdrops (the shared Modal)
//   toast   — toasts, always on top of everything
export const Z = {
  sticky: "z-20",
  overlay: "z-40",
  menu: "z-50",
  modal: "z-60",
  toast: "z-70",
} as const;

// ─── Formatting ───────────────────────────────────────────────────────────────
export function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
export function fmtMoney(amount: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export type Toast = { kind: "ok" | "err"; msg: string } | null;

export function useToast() {
  const [toast, setToast] = useState<Toast>(null);
  const flash = useCallback((kind: "ok" | "err", msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, flash };
}

export function ToastView({ toast }: { toast: Toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-4 right-4 ${Z.toast} flex items-center gap-2 px-4 py-2.5 rounded-none shadow-lg text-sm font-medium ${toast.kind === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {toast.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />} {toast.msg}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
// Semantic tone names (preferred): brand, accent, success, warning, danger.
// The legacy colour names (blue/purple/green/amber/red) are kept as aliases so
// existing call-sites keep working while pages migrate to the semantic set.
// Pass `onClick` to render an interactive, filterable card (used by Merchants).
const STAT_TONES = {
  brand: "bg-[#102C26]/8 text-[#102C26]",
  accent: "bg-[#F59E0B]/10 text-[#F59E0B]",
  success: "bg-green-50 text-green-600",
  warning: "bg-[#F59E0B]/10 text-[#F59E0B]",
  danger: "bg-red-50 text-red-600",
  // legacy aliases — map to the same colours so nothing changes visually
  blue: "bg-[#102C26]/8 text-[#102C26]",
  purple: "bg-[#F59E0B]/10 text-[#F59E0B]",
  green: "bg-green-50 text-green-600",
  amber: "bg-[#F59E0B]/10 text-[#F59E0B]",
  red: "bg-red-50 text-red-600",
} as const;

export type StatTone = keyof typeof STAT_TONES;

export function StatCard({ label, value, sub, icon: Icon, tone, onClick, active, deltaPct }: {
  label: string; value: React.ReactNode; sub: string; icon: React.ElementType; tone: StatTone;
  onClick?: () => void; active?: boolean;
  // Period-over-period change as a percentage; renders a coloured ▲/▼ chip.
  deltaPct?: number | null;
}) {
  const Tag = onClick ? "button" : "div";
  const showDelta = deltaPct !== null && deltaPct !== undefined && Number.isFinite(deltaPct);
  const up = (deltaPct ?? 0) > 0, flat = (deltaPct ?? 0) === 0;
  return (
    <Tag
      onClick={onClick}
      className={`text-left w-full bg-white rounded-none border p-4 sm:p-5 transition-all ${
        active ? "border-[#F59E0B] ring-2 ring-[#F59E0B]/20" : "border-[#102C26]/12"
      } ${onClick ? "hover:border-gray-300 cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-600">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className={`${display.className} text-2xl font-bold text-[#102C26]`}>{value}</p>
            {showDelta && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                flat ? "bg-gray-100 text-gray-500" : up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`} title="vs previous period">
                {flat ? "→" : up ? "▲" : "▼"} {Math.abs(deltaPct as number)}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 ${STAT_TONES[tone]}`}><Icon size={18} /></div>
      </div>
    </Tag>
  );
}

// ─── Table skeleton ───────────────────────────────────────────────────────────
export function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-[#102C26]/8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-4">
          <div className="space-y-1.5 flex-1"><div className="h-4 bg-gray-200 rounded w-44" /><div className="h-3 bg-gray-100 rounded w-28" /></div>
          <div className="h-6 bg-gray-200 rounded-full w-20" /><div className="h-6 bg-gray-200 rounded-full w-16" /><div className="h-4 bg-gray-100 rounded w-10 ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, hint }: { icon: React.ElementType; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-14 h-14 bg-gray-100 rounded-none flex items-center justify-center mb-4"><Icon size={22} className="text-gray-500" /></div>
      <p className="text-base font-semibold text-gray-800">{title}</p>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">{hint}</p>
    </div>
  );
}

// ─── Pagination footer ────────────────────────────────────────────────────────
// Always shows "Page X of Y" alongside the running count. Pass `onPageSize` +
// `pageSizeOptions` to expose a rows-per-page selector, and `onJump` to enable a
// jump-to-page box. All three are optional so existing callers keep working.
export function Pagination({ page, pageSize, total, noun, onPrev, onNext, onPageSize, pageSizeOptions = [25, 50, 100], onJump }: {
  page: number; pageSize: number; total: number; noun: string; onPrev: () => void; onNext: () => void;
  onPageSize?: (size: number) => void; pageSizeOptions?: number[]; onJump?: (page: number) => void;
}) {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);
  const hasNext = (page + 1) * pageSize < total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [jumpVal, setJumpVal] = useState("");
  const submitJump = () => {
    const n = parseInt(jumpVal, 10);
    if (onJump && !Number.isNaN(n) && n >= 1 && n <= totalPages) onJump(n - 1);
    setJumpVal("");
  };
  return (
    <div className="px-5 py-3 border-t border-[#102C26]/8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="flex items-center gap-3">
        <p className="text-xs text-gray-600">Showing {from}–{to} of {total.toLocaleString()} {noun}{total !== 1 ? "s" : ""}</p>
        {onPageSize && (
          <label className="text-xs text-gray-600 flex items-center gap-1.5">
            <span className="hidden sm:inline">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSize(Number(e.target.value))}
              className="border border-gray-200 rounded-none px-1.5 py-1 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#102C26]/40"
            >
              {pageSizeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 whitespace-nowrap">Page {page + 1} of {totalPages.toLocaleString()}</span>
        {onJump && totalPages > 1 && (
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpVal}
            onChange={(e) => setJumpVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submitJump(); }}
            onBlur={submitJump}
            placeholder="Go"
            aria-label="Jump to page"
            className="w-12 border border-gray-200 rounded-none px-1.5 py-1 text-xs text-gray-700 text-center focus:outline-none focus:border-[#102C26]/40"
          />
        )}
        <div className="flex items-center gap-1">
          <button onClick={onPrev} disabled={page === 0} aria-label="Previous page"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-none hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14} /> Prev</button>
          <button onClick={onNext} disabled={!hasNext} aria-label="Next page"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-none hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next <ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter pill row ──────────────────────────────────────────────────────────
export function FilterPills({ options, value, onChange }: {
  options: { key: string; label: string }[]; value: string; onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {options.map(({ key, label }) => (
        <button key={key} onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-none text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${value === key ? "bg-[#102C26] text-[#F7E7CE]" : "text-gray-600 hover:text-[#102C26] hover:bg-[#102C26]/8"}`}>{label}</button>
      ))}
    </div>
  );
}

// ─── Date-range control ─────────────────────────────────────────────────────────
// Compact From/To picker for list filters. Emits `YYYY-MM-DD` strings (or empty
// when cleared). Pairs with `parseDateRange` in `@/lib/adminFilters` server-side.
export function DateRange({ from, to, onChange, label = "Joined" }: {
  from: string; to: string; onChange: (from: string, to: string) => void; label?: string;
}) {
  const base = "border border-gray-200 rounded-none px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#102C26]/40";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400 hidden sm:inline">{label}</span>
      <input type="date" value={from} max={to || undefined} onChange={(e) => onChange(e.target.value, to)} aria-label={`${label} from`} className={base} />
      <span className="text-gray-400 text-xs">–</span>
      <input type="date" value={to} min={from || undefined} onChange={(e) => onChange(from, e.target.value)} aria-label={`${label} to`} className={base} />
      {(from || to) && (
        <button onClick={() => onChange("", "")} aria-label="Clear date range"
          className="px-2 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-none hover:bg-gray-50 transition-colors">Clear</button>
      )}
    </div>
  );
}

// ─── Accessible modal ──────────────────────────────────────────────────────────
// One dialog primitive for the admin panel: backdrop + centred card with proper
// dialog semantics (role="dialog", aria-modal), Escape-to-close, a focus trap,
// and focus restore to the trigger on close. Pass `labelledBy` = the id of the
// heading inside, and `describedBy` for the body text, so screen readers announce
// the dialog. `onClose` fires on Escape and backdrop click (not while `busy`).
export function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  maxWidth = "max-w-md",
  busy = false,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  describedBy?: string;
  maxWidth?: string;
  busy?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Latest onClose/busy held in refs so the focus-trap effect can depend on
  // `open` alone — re-running it on every render would steal focus mid-typing.
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  useEffect(() => {
    onCloseRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;

    const getFocusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    // Focus the first field/control inside the dialog.
    requestAnimationFrame(() => {
      const items = getFocusable();
      (items[0] ?? panel)?.focus();
    });

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (!busyRef.current) onCloseRef.current();
        return;
      }
      if (e.key === "Tab") {
        const items = getFocusable();
        if (items.length === 0) { e.preventDefault(); return; }
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 ${Z.modal} bg-black/40 flex items-center justify-center p-4`}
      onClick={() => { if (!busy) onClose(); }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-none border border-[#102C26]/15 shadow-2xl w-full ${maxWidth} focus:outline-none ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Status badge (generic) ───────────────────────────────────────────────────
export function Badge({ label, tone }: { label: string; tone: "green" | "amber" | "red" | "gray" | "blue" | "purple" }) {
  const tones = {
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-[#102C26]/10 text-[#102C26]",
    purple: "bg-[#F59E0B]/10 text-[#F59E0B]",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${tones[tone]}`}>{label}</span>;
}
