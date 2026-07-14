"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search, RefreshCw, AlertCircle, Inbox, Clock, CheckCircle2, XCircle, FileText,
  ChevronRight, ExternalLink, Loader2, X, ShieldCheck,
} from "lucide-react";
import { display } from "../_fonts";
import {
  fmtDate, useToast, ToastView, StatCard, TableSkeleton, EmptyState, Pagination, FilterPills, Badge, Modal,
} from "../_ui";

interface AppRow {
  id: string;
  display_name: string;
  legal_name: string;
  registration_number: string;
  country: string;
  charity_type: string;
  category: string;
  contact_email: string;
  status: string;
  external_check_status: string;
  charity_id: string | null;
  created_at: string;
  reviewed_at: string | null;
}
interface Detail {
  application: AppRow & {
    description: string; contact_phone: string | null; website_url: string | null;
    is_zakat_eligible: boolean; reviewer_notes: string | null;
  };
  applicant: { id: string; full_name: string; email: string; created_at: string } | null;
  reviewerName: string | null;
  documents: { type: string; name: string; url: string | null }[];
  canManage: boolean;
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "under_review", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];
const STATUS_TONE: Record<string, "amber" | "blue" | "green" | "red" | "gray"> = {
  pending: "amber", under_review: "blue", approved: "green", rejected: "red",
};
const CHECK_TONE: Record<string, "green" | "red" | "gray" | "amber"> = {
  matched: "green", not_found: "red", error: "red", pending: "amber", not_checked: "gray",
};

export default function ApplicationsTab() {
  const { toast, flash } = useToast();
  const [rows, setRows] = useState<AppRow[]>([]);
  const [stats, setStats] = useState<{ pending: number; underReview: number; approved: number; rejected: number } | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [level, setLevel] = useState<1 | 2>(2);

  async function fetchRows(p: number, s: string, q: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) });
      if (s !== "all") params.set("status", s);
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/charity-applications?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRows(json.applications); setStats(json.stats); setTotal(json.total);
      setPageSize(json.pageSize);
    } catch {
      setError("Could not load applications. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows(page, status, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);
  useEffect(() => { setPage(0); }, [status]);

  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); fetchRows(0, status, val); }, 300);
  }

  async function openDetail(id: string) {
    setDetailLoading(true); setNotes(""); setLevel(2);
    try {
      const res = await fetch(`/api/admin/charity-applications/${id}`);
      if (!res.ok) throw new Error();
      setDetail(await res.json());
    } catch {
      flash("err", "Could not load application details.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function act(action: "approve" | "reject" | "request_info") {
    if (!detail) return;
    if (action === "reject" && !notes.trim()) { flash("err", "A reason is required to reject."); return; }
    setBusy(action);
    try {
      const res = await fetch(`/api/admin/charity-applications/${detail.application.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: notes.trim() || undefined, verification_level: action === "approve" ? level : undefined }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { flash("err", json?.error ?? "Action failed."); return; }
      flash("ok", action === "approve" ? "Charity approved and added to the directory." : action === "reject" ? "Application rejected." : "Marked under review.");
      setDetail(null);
      fetchRows(page, status, search);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <ToastView toast={toast} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard label="Pending" value={stats?.pending ?? "—"} sub="Awaiting first review" icon={Inbox} tone="amber" />
        <StatCard label="Under Review" value={stats?.underReview ?? "—"} sub="More info requested" icon={Clock} tone="blue" />
        <StatCard label="Approved" value={stats?.approved ?? "—"} sub="Now in directory" icon={CheckCircle2} tone="green" />
        <StatCard label="Rejected" value={stats?.rejected ?? "—"} sub="Declined" icon={XCircle} tone="red" />
      </div>

      <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
        {/* Filters */}
        <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <FilterPills options={STATUS_FILTERS} value={status} onChange={setStatus} />
            <button onClick={() => fetchRows(page, status, search)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, registration number or email…"
              className="w-full pl-8 pr-4 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500 transition-colors" />
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
        ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon={Inbox} title="No applications found" hint="Charity applications submitted by users will appear here for review." />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                  <th className="pl-4 lg:pl-5 px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Charity</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden md:table-cell">Reg. No.</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Ext. Check</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Submitted</th>
                  <th className="px-4 lg:px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102C26]/8">
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => openDetail(r.id)} className="group cursor-pointer hover:bg-[#102C26]/2 transition-colors">
                    <td className="pl-4 lg:pl-5 px-2 py-3.5">
                      <p className="font-semibold text-gray-900 truncate max-w-56 group-hover:text-[#102C26]">{r.display_name}</p>
                      <p className="text-xs text-gray-600 truncate capitalize">{r.category} · {r.country}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-gray-700 tabular-nums">{r.registration_number}</td>
                    <td className="px-4 py-3.5"><Badge label={r.status.replace("_", " ")} tone={STATUS_TONE[r.status] ?? "gray"} /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell"><Badge label={r.external_check_status.replace("_", " ")} tone={CHECK_TONE[r.external_check_status] ?? "gray"} /></td>
                    <td className="px-4 py-3.5 hidden lg:table-cell text-gray-600 whitespace-nowrap">{fmtDate(r.created_at)}</td>
                    <td className="px-4 lg:px-5 py-3.5 text-right"><ChevronRight size={15} className="text-gray-400 inline" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={total} noun="application" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} onPageSize={(s) => { setPageSize(s); setPage(0); }} onJump={(p) => setPage(p)} />
          </>
        )}
      </div>

      {/* Detail modal */}
      {(detail || detailLoading) && (
        <Modal open onClose={() => setDetail(null)} busy={!!busy} maxWidth="max-w-2xl" className="max-h-[90vh] overflow-y-auto">
            {detailLoading || !detail ? (
              <div className="flex items-center justify-center py-24"><Loader2 size={26} className="animate-spin text-[#102C26]/40" /></div>
            ) : (
              <>
                <div className="sticky top-0 bg-white border-b border-[#102C26]/10 px-6 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1"><Badge label={detail.application.status.replace("_", " ")} tone={STATUS_TONE[detail.application.status] ?? "gray"} />{detail.application.is_zakat_eligible && <Badge label="Zakat" tone="purple" />}</div>
                    <h3 className={`${display.className} text-lg font-bold text-[#102C26] truncate`}>{detail.application.display_name}</h3>
                    <p className="text-xs text-gray-600">{detail.application.legal_name}</p>
                  </div>
                  <button onClick={() => setDetail(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-none shrink-0"><X size={18} /></button>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Applicant */}
                  {detail.applicant && (
                    <Field label="Applicant">
                      <p className="text-sm text-gray-900 font-medium">{detail.applicant.full_name}</p>
                      <p className="text-xs text-gray-600">{detail.applicant.email} · joined {fmtDate(detail.applicant.created_at)}</p>
                    </Field>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Category"><p className="text-sm text-gray-900 capitalize">{detail.application.category}</p></Field>
                    <Field label="Type"><p className="text-sm text-gray-900 capitalize">{detail.application.charity_type}</p></Field>
                    <Field label="Registration No."><p className="text-sm text-gray-900 tabular-nums">{detail.application.registration_number}</p></Field>
                    <Field label="Country"><p className="text-sm text-gray-900">{detail.application.country}</p></Field>
                    <Field label="Contact email"><p className="text-sm text-gray-900 break-all">{detail.application.contact_email}</p></Field>
                    {detail.application.contact_phone && <Field label="Phone"><p className="text-sm text-gray-900">{detail.application.contact_phone}</p></Field>}
                  </div>
                  {detail.application.website_url && (
                    <Field label="Website"><a href={detail.application.website_url} target="_blank" rel="noreferrer" className="text-sm text-[#102C26] font-medium inline-flex items-center gap-1 hover:underline">{detail.application.website_url} <ExternalLink size={12} /></a></Field>
                  )}
                  <Field label="Description"><p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{detail.application.description}</p></Field>

                  {/* External check */}
                  <Field label="External verification check">
                    <Badge label={detail.application.external_check_status.replace("_", " ")} tone={CHECK_TONE[detail.application.external_check_status] ?? "gray"} />
                  </Field>

                  {/* Documents */}
                  <Field label={`Documents (${detail.documents.length})`}>
                    {detail.documents.length === 0 ? <p className="text-sm text-gray-500">No documents uploaded.</p> : (
                      <div className="space-y-1.5">
                        {detail.documents.map((d, i) => (
                          <a key={i} href={d.url ?? "#"} target="_blank" rel="noreferrer"
                            className={`flex items-center gap-2.5 px-3 py-2 border border-[#102C26]/12 rounded-none text-sm transition-colors ${d.url ? "hover:bg-[#102C26]/5 text-gray-800" : "text-gray-400 cursor-not-allowed"}`}
                            onClick={(e) => { if (!d.url) e.preventDefault(); }}>
                            <FileText size={15} className="text-[#102C26]/50 shrink-0" />
                            <span className="flex-1 truncate">{d.name}</span>
                            <span className="text-[10px] uppercase tracking-wide text-gray-500">{d.type}</span>
                            {d.url && <ExternalLink size={12} className="text-gray-400" />}
                          </a>
                        ))}
                      </div>
                    )}
                  </Field>

                  {detail.application.reviewer_notes && (
                    <Field label="Reviewer notes"><p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.application.reviewer_notes}</p>{detail.reviewerName && <p className="text-xs text-gray-500 mt-1">— {detail.reviewerName}</p>}</Field>
                  )}
                </div>

                {/* Actions */}
                {detail.canManage && detail.application.status !== "approved" && detail.application.status !== "rejected" && (
                  <div className="sticky bottom-0 bg-gray-50/95 backdrop-blur border-t border-[#102C26]/10 px-6 py-4 space-y-3">
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notes (required to reject, optional otherwise)…"
                      className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 bg-white rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] placeholder:text-gray-500" />
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 mr-auto">
                        <ShieldCheck size={13} className="text-[#102C26]/50" /> Approve at level
                        <button onClick={() => setLevel(1)} className={`px-2 py-1 rounded-none font-semibold ${level === 1 ? "bg-[#102C26] text-[#F7E7CE]" : "bg-[#102C26]/8 text-gray-700"}`}>1 · Docs</button>
                        <button onClick={() => setLevel(2)} className={`px-2 py-1 rounded-none font-semibold ${level === 2 ? "bg-[#102C26] text-[#F7E7CE]" : "bg-[#102C26]/8 text-gray-700"}`}>2 · Verified</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <button onClick={() => act("request_info")} disabled={!!busy}
                        className="px-4 py-2 text-sm font-semibold text-[#102C26] bg-[#102C26]/8 rounded-none hover:bg-[#102C26]/15 transition-colors disabled:opacity-50">{busy === "request_info" ? "…" : "Request info"}</button>
                      <button onClick={() => act("reject")} disabled={!!busy || !notes.trim()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white bg-red-600 rounded-none hover:bg-red-700 transition-colors disabled:opacity-50">{busy === "reject" ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Reject</button>
                      <button onClick={() => act("approve")} disabled={!!busy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white bg-green-600 rounded-none hover:bg-green-700 transition-colors disabled:opacity-50">{busy === "approve" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Approve</button>
                    </div>
                  </div>
                )}
              </>
            )}
        </Modal>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1">{label}</p>
      {children}
    </div>
  );
}
