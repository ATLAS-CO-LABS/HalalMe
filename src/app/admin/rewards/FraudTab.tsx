"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw, AlertCircle, ShieldAlert, ShieldCheck, ShieldX, ChevronRight, Loader2, X, Banknote,
} from "lucide-react";
import { display } from "../_fonts";
import {
  fmtDateTime, fmtMoney, useToast, ToastView, StatCard, TableSkeleton, EmptyState, Pagination, FilterPills, Badge,
} from "./_ui";

type JoinedObj = {
  id: string; full_name?: string; email?: string; name?: string;
  amount?: number; currency?: string; status?: string; created_at?: string;
  user?: JoinedObj | JoinedObj[] | null; charity?: JoinedObj | JoinedObj[] | null;
};
type Joined = JoinedObj | JoinedObj[] | null;
function one(j: Joined | undefined): JoinedObj | undefined {
  if (!j) return undefined;
  return Array.isArray(j) ? j[0] : j;
}

interface Signal { rule_key?: string; points?: number; detail?: string }
interface FlagRow {
  id: string;
  donation_id: string;
  flagged_by: string;
  flag_type: string;
  risk_score_at_flag: number | null;
  signal_breakdown: Signal[];
  status: string;
  reviewer_notes: string | null;
  rewards_delayed: boolean;
  reviewed_at: string | null;
  created_at: string;
  donation: Joined;
}

const STATUS_FILTERS = [
  { key: "pending_review", label: "Pending" },
  { key: "reviewed_safe", label: "Cleared" },
  { key: "reviewed_blocked", label: "Blocked" },
  { key: "auto_cleared", label: "Auto-cleared" },
  { key: "all", label: "All" },
];
const STATUS_TONE: Record<string, "amber" | "green" | "red" | "gray"> = {
  pending_review: "amber", reviewed_safe: "green", reviewed_blocked: "red", auto_cleared: "gray",
};
const STATUS_LABEL: Record<string, string> = {
  pending_review: "Pending", reviewed_safe: "Cleared", reviewed_blocked: "Blocked", auto_cleared: "Auto-cleared",
};

export default function FraudTab() {
  const { toast, flash } = useToast();
  const [rows, setRows] = useState<FlagRow[]>([]);
  const [stats, setStats] = useState<{ pending: number; safe: number; blocked: number } | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending_review");

  const [detail, setDetail] = useState<FlagRow | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function fetchRows(p: number, s: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), status: s });
      const res = await fetch(`/api/admin/donation-flags?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRows(json.flags); setStats(json.stats); setTotal(json.total);
      setPageSize(json.pageSize); setCanManage(!!json.canManage);
    } catch {
      setError("Could not load fraud flags. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRows(page, status); }, [page, status]);
  useEffect(() => { setPage(0); }, [status]);

  async function review(action: "safe" | "blocked") {
    if (!detail) return;
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/donation-flags/${detail.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: notes.trim() || undefined }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { flash("err", json?.error ?? "Action failed."); return; }
      flash("ok", action === "safe" ? "Marked safe — rewards released." : "Blocked — refund initiated.");
      setDetail(null); setNotes("");
      fetchRows(page, status);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <ToastView toast={toast} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        <StatCard label="Pending Review" value={stats?.pending ?? "—"} sub="Rewards withheld" icon={ShieldAlert} tone="amber" />
        <StatCard label="Cleared Safe" value={stats?.safe ?? "—"} sub="Rewards released" icon={ShieldCheck} tone="green" />
        <StatCard label="Blocked" value={stats?.blocked ?? "—"} sub="Refunded" icon={ShieldX} tone="red" />
      </div>

      <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
        <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 flex items-center justify-between gap-2 flex-wrap">
          <FilterPills options={STATUS_FILTERS} value={status} onChange={setStatus} />
          <button onClick={() => fetchRows(page, status)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {error ? (
          <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
        ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No flags here" hint="Donations that trip the risk rules land in this queue for manual review." />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                  <th className="pl-4 lg:pl-5 px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Donation</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden md:table-cell">Reason</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Risk</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Flagged</th>
                  <th className="px-4 lg:px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102C26]/8">
                {rows.map((f) => {
                  const don = one(f.donation); const u = one(don?.user); const c = one(don?.charity);
                  return (
                    <tr key={f.id} onClick={() => { setDetail(f); setNotes(""); }} className="group cursor-pointer hover:bg-[#102C26]/2 transition-colors">
                      <td className="pl-4 lg:pl-5 px-2 py-3.5">
                        <p className="font-semibold text-gray-900 truncate max-w-44">{don ? fmtMoney(don.amount ?? 0, don.currency) : "—"} <span className="font-normal text-gray-500">to {c?.name ?? "—"}</span></p>
                        <p className="text-xs text-gray-600 truncate">{u?.full_name ?? u?.email ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-gray-700 capitalize">{f.flag_type.replace(/_/g, " ")}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`tabular-nums font-semibold px-2 py-0.5 rounded-md ${(f.risk_score_at_flag ?? 0) >= 75 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>{f.risk_score_at_flag ?? "—"}</span>
                      </td>
                      <td className="px-4 py-3.5"><Badge label={STATUS_LABEL[f.status] ?? f.status} tone={STATUS_TONE[f.status] ?? "gray"} /></td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-gray-600 whitespace-nowrap">{fmtDateTime(f.created_at)}</td>
                      <td className="px-4 lg:px-5 py-3.5 text-right"><ChevronRight size={15} className="text-gray-400 inline" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={total} noun="flag" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} />
          </>
        )}
      </div>

      {/* Detail modal */}
      {detail && (() => {
        const don = one(detail.donation); const u = one(don?.user); const c = one(don?.charity);
        return (
          <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4" onClick={() => !busy && setDetail(null)}>
            <div className="bg-white rounded-none border border-[#102C26]/15 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-[#102C26]/10 px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1"><Badge label={STATUS_LABEL[detail.status] ?? detail.status} tone={STATUS_TONE[detail.status] ?? "gray"} /><Badge label={`Flagged by ${detail.flagged_by}`} tone="gray" /></div>
                  <h3 className={`${display.className} text-lg font-bold text-[#102C26]`}>{don ? fmtMoney(don.amount ?? 0, don.currency) : "Donation"}</h3>
                  <p className="text-xs text-gray-600">to {c?.name ?? "—"} · {don?.created_at ? fmtDateTime(don.created_at) : ""}</p>
                </div>
                <button onClick={() => setDetail(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-none shrink-0"><X size={18} /></button>
              </div>

              <div className="px-6 py-5 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1">Donor</p>
                  <p className="text-sm text-gray-900 font-medium">{u?.full_name ?? "—"}</p>
                  <p className="text-xs text-gray-600">{u?.email ?? ""}</p>
                </div>

                <div className="flex items-center justify-between px-3 py-2.5 bg-red-50/60 border border-red-100 rounded-none">
                  <span className="text-sm font-semibold text-red-700">Risk score at flag</span>
                  <span className={`${display.className} text-xl font-bold text-red-600 tabular-nums`}>{detail.risk_score_at_flag ?? "—"}</span>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1.5">Signals that fired</p>
                  {detail.signal_breakdown?.length ? (
                    <div className="space-y-1.5">
                      {detail.signal_breakdown.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 border border-[#102C26]/12 rounded-none">
                          <span className="text-sm text-gray-800 flex-1">{s.detail ?? s.rule_key?.replace(/_/g, " ")}</span>
                          {typeof s.points === "number" && <span className="text-xs font-bold text-red-600 tabular-nums">+{s.points}</span>}
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500">No signal breakdown recorded.</p>}
                </div>

                {detail.rewards_delayed && detail.status === "pending_review" && (
                  <p className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-3 py-2 rounded-none"><Banknote size={14} /> Reward points are withheld until this flag is reviewed.</p>
                )}

                {detail.reviewer_notes && (
                  <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1">Reviewer notes</p><p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.reviewer_notes}</p></div>
                )}
              </div>

              {canManage && detail.status === "pending_review" && (
                <div className="sticky bottom-0 bg-gray-50/95 backdrop-blur border-t border-[#102C26]/10 px-6 py-4 space-y-3">
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Reviewer notes (optional)…"
                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 bg-white rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] placeholder:text-gray-500" />
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => review("blocked")} disabled={!!busy}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white bg-red-600 rounded-none hover:bg-red-700 transition-colors disabled:opacity-50">{busy === "blocked" ? <Loader2 size={14} className="animate-spin" /> : <ShieldX size={14} />} Block & refund</button>
                    <button onClick={() => review("safe")} disabled={!!busy}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white bg-green-600 rounded-none hover:bg-green-700 transition-colors disabled:opacity-50">{busy === "safe" ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Mark safe</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}
