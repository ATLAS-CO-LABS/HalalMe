"use client";

import { useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { display } from "./_fonts";

// Shared admin UI primitives — used across the Rewards, Kitchen and Hub modules
// so every admin table/card/toast looks and behaves the same.

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
    <div className={`fixed top-4 right-4 z-70 flex items-center gap-2 px-4 py-2.5 rounded-none shadow-lg text-sm font-medium ${toast.kind === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {toast.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />} {toast.msg}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, tone }: {
  label: string; value: React.ReactNode; sub: string; icon: React.ElementType; tone: "green" | "amber" | "blue" | "purple" | "red";
}) {
  const tones = {
    green: "bg-green-50 text-green-600",
    amber: "bg-[#F59E0B]/10 text-[#F59E0B]",
    blue: "bg-[#102C26]/8 text-[#102C26]",
    purple: "bg-[#F59E0B]/10 text-[#F59E0B]",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-white rounded-none border border-[#102C26]/12 p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-600">{label}</p>
          <p className={`${display.className} text-2xl font-bold text-[#102C26] mt-1`}>{value}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 ${tones[tone]}`}><Icon size={18} /></div>
      </div>
    </div>
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
export function Pagination({ page, pageSize, total, noun, onPrev, onNext }: {
  page: number; pageSize: number; total: number; noun: string; onPrev: () => void; onNext: () => void;
}) {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);
  const hasNext = (page + 1) * pageSize < total;
  return (
    <div className="px-5 py-3 border-t border-[#102C26]/8 flex items-center justify-between gap-4">
      <p className="text-xs text-gray-600">Showing {from}–{to} of {total.toLocaleString()} {noun}{total !== 1 ? "s" : ""}</p>
      <div className="flex items-center gap-1">
        <button onClick={onPrev} disabled={page === 0}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-none hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft size={14} /> Prev</button>
        <button onClick={onNext} disabled={!hasNext}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-none hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next <ChevronRight size={14} /></button>
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
