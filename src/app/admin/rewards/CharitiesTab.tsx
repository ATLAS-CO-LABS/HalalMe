"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search, RefreshCw, AlertCircle, Heart, CheckCircle2, Star, Banknote,
  ChevronRight, Loader2, X, Plus, Ban, RotateCcw, Save,
} from "lucide-react";
import { display } from "../_fonts";
import {
  fmtMoney, useToast, ToastView, StatCard, TableSkeleton, EmptyState, Pagination, FilterPills, Badge,
} from "./_ui";

interface CharityRow {
  id: string;
  name: string;
  category: string;
  verification_status: string;
  verification_level: number;
  verification_score: number;
  goal_amount: number;
  raised_amount: number;
  donor_count: number;
  minimum_donation: number;
  platform_fee_pct: number;
  is_featured: boolean;
  is_zakat_eligible: boolean;
  is_active: boolean;
  currency: string;
}
interface FullCharity extends CharityRow {
  description: string; long_description: string | null; image_url: string | null;
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "approved", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "pending", label: "Pending" },
];
const STATUS_TONE: Record<string, "green" | "red" | "amber" | "gray"> = {
  approved: "green", suspended: "red", pending: "amber", under_review: "amber", rejected: "gray",
};
const LEVEL_LABEL = ["Unverified", "Docs", "Verified", "External"];

export default function CharitiesTab() {
  const { toast, flash } = useToast();
  const [rows, setRows] = useState<CharityRow[]>([]);
  const [stats, setStats] = useState<{ total: number; active: number; featured: number; totalRaised: number } | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [edit, setEdit] = useState<FullCharity | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  async function fetchRows(p: number, s: string, q: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (s !== "all") params.set("status", s);
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/charities?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRows(json.charities); setStats(json.stats); setTotal(json.total);
      setPageSize(json.pageSize); setCanManage(!!json.canManage);
    } catch {
      setError("Could not load charities. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows(page, status, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);
  useEffect(() => { setPage(0); }, [status]);

  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); fetchRows(0, status, val); }, 300);
  }

  async function openEdit(id: string) {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/charities/${id}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setEdit(json.charity);
    } catch {
      flash("err", "Could not load charity.");
    } finally {
      setEditLoading(false);
    }
  }

  async function saveEdit() {
    if (!edit) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/charities/${edit.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_amount: edit.goal_amount, minimum_donation: edit.minimum_donation,
          platform_fee_pct: edit.platform_fee_pct, description: edit.description,
          long_description: edit.long_description, image_url: edit.image_url,
          is_featured: edit.is_featured, is_zakat_eligible: edit.is_zakat_eligible,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { flash("err", json?.error ?? "Save failed."); return; }
      flash("ok", "Charity updated.");
      setEdit(null);
      fetchRows(page, status, search);
    } finally {
      setBusy(false);
    }
  }

  async function toggleSuspend() {
    if (!edit) return;
    const suspending = edit.verification_status !== "suspended";
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/charities/${edit.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: suspending ? "suspend" : "reinstate" }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { flash("err", json?.error ?? "Failed."); return; }
      flash("ok", suspending ? "Charity suspended." : "Charity reinstated.");
      setEdit(null);
      fetchRows(page, status, search);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <ToastView toast={toast} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard label="Total Charities" value={stats?.total ?? "—"} sub="All statuses" icon={Heart} tone="blue" />
        <StatCard label="Active" value={stats?.active ?? "—"} sub="Accepting donations" icon={CheckCircle2} tone="green" />
        <StatCard label="Featured" value={stats?.featured ?? "—"} sub="On homepage" icon={Star} tone="purple" />
        <StatCard label="Total Raised" value={stats ? fmtMoney(stats.totalRaised) : "—"} sub="All charities" icon={Banknote} tone="amber" />
      </div>

      <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
        <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <FilterPills options={STATUS_FILTERS} value={status} onChange={setStatus} />
            <div className="flex items-center gap-2">
              {canManage && (
                <button onClick={() => setCreating(true)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#F7E7CE] bg-[#102C26] rounded-none hover:bg-[#102C26]/90 transition-colors">
                  <Plus size={14} /> <span className="hidden sm:inline">Add charity</span>
                </button>
              )}
              <button onClick={() => fetchRows(page, status, search)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name or registration number…"
              className="w-full pl-8 pr-4 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500 transition-colors" />
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
        ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon={Heart} title="No charities found" hint="Approve an application or add a charity directly to seed the directory." />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                  <th className="pl-4 lg:pl-5 px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Charity</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden md:table-cell">Verification</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Raised / Goal</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Status</th>
                  <th className="px-4 lg:px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102C26]/8">
                {rows.map((c) => {
                  const pct = c.goal_amount > 0 ? Math.min(100, Math.round((c.raised_amount / c.goal_amount) * 100)) : 0;
                  return (
                    <tr key={c.id} onClick={() => openEdit(c.id)} className="group cursor-pointer hover:bg-[#102C26]/2 transition-colors">
                      <td className="pl-4 lg:pl-5 px-2 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 truncate max-w-52 group-hover:text-[#102C26]">{c.name}</p>
                          {c.is_featured && <Star size={13} className="text-[#F03E9E] shrink-0 fill-[#F03E9E]" />}
                          {c.is_zakat_eligible && <Badge label="Zakat" tone="purple" />}
                        </div>
                        <p className="text-xs text-gray-600 truncate capitalize">{c.category} · {c.donor_count} donor{c.donor_count !== 1 ? "s" : ""}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <Badge label={`L${c.verification_level} · ${LEVEL_LABEL[c.verification_level] ?? "?"}`} tone={c.verification_level >= 2 ? "green" : c.verification_level === 1 ? "amber" : "gray"} />
                        <span className="text-xs text-gray-500 ml-1.5">{c.verification_score}/100</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-gray-900 font-medium tabular-nums">{fmtMoney(c.raised_amount, c.currency)} <span className="text-gray-400 font-normal">/ {fmtMoney(c.goal_amount, c.currency)}</span></p>
                        <div className="mt-1 h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#102C26]" style={{ width: `${pct}%` }} /></div>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell"><Badge label={c.verification_status} tone={STATUS_TONE[c.verification_status] ?? "gray"} /></td>
                      <td className="px-4 lg:px-5 py-3.5 text-right"><ChevronRight size={15} className="text-gray-400 inline" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={total} noun="charity" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} />
          </>
        )}
      </div>

      {/* Edit drawer */}
      {(edit || editLoading) && (
        <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4" onClick={() => !busy && setEdit(null)}>
          <div className="bg-white rounded-none border border-[#102C26]/15 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {editLoading || !edit ? (
              <div className="flex items-center justify-center py-24"><Loader2 size={26} className="animate-spin text-[#102C26]/40" /></div>
            ) : (
              <>
                <div className="sticky top-0 bg-white border-b border-[#102C26]/10 px-6 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Badge label={edit.verification_status} tone={STATUS_TONE[edit.verification_status] ?? "gray"} />
                    <h3 className={`${display.className} text-lg font-bold text-[#102C26] truncate mt-1`}>{edit.name}</h3>
                  </div>
                  <button onClick={() => setEdit(null)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-none shrink-0"><X size={18} /></button>
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <NumberInput label="Goal (£)" value={edit.goal_amount} onChange={(v) => setEdit({ ...edit, goal_amount: v })} disabled={!canManage} />
                    <NumberInput label="Min donation (£)" value={edit.minimum_donation} onChange={(v) => setEdit({ ...edit, minimum_donation: v })} disabled={!canManage} />
                    <NumberInput label="Platform fee (%)" value={edit.platform_fee_pct} onChange={(v) => setEdit({ ...edit, platform_fee_pct: v })} disabled={!canManage} />
                  </div>
                  <TextInput label="Image URL" value={edit.image_url ?? ""} onChange={(v) => setEdit({ ...edit, image_url: v })} disabled={!canManage} />
                  <TextArea label="Short description" value={edit.description} onChange={(v) => setEdit({ ...edit, description: v })} disabled={!canManage} rows={2} />
                  <TextArea label="Long description" value={edit.long_description ?? ""} onChange={(v) => setEdit({ ...edit, long_description: v })} disabled={!canManage} rows={4} />
                  <div className="flex items-center gap-5">
                    <Toggle label="Featured" checked={edit.is_featured} onChange={(v) => setEdit({ ...edit, is_featured: v })} disabled={!canManage} />
                    <Toggle label="Zakat eligible" checked={edit.is_zakat_eligible} onChange={(v) => setEdit({ ...edit, is_zakat_eligible: v })} disabled={!canManage} />
                  </div>
                </div>

                {canManage && (
                  <div className="sticky bottom-0 bg-gray-50/95 backdrop-blur border-t border-[#102C26]/10 px-6 py-4 flex items-center justify-between gap-2 flex-wrap">
                    <button onClick={toggleSuspend} disabled={busy}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-none transition-colors disabled:opacity-50 ${edit.verification_status === "suspended" ? "text-green-700 bg-green-50 hover:bg-green-100" : "text-red-700 bg-red-50 hover:bg-red-100"}`}>
                      {edit.verification_status === "suspended" ? <><RotateCcw size={14} /> Reinstate</> : <><Ban size={14} /> Suspend</>}
                    </button>
                    <button onClick={saveEdit} disabled={busy}
                      className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold uppercase tracking-tight text-[#F7E7CE] bg-[#102C26] rounded-none hover:bg-[#102C26]/90 transition-colors disabled:opacity-50">
                      {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Add charity modal */}
      {creating && <AddCharityModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); fetchRows(0, status, search); flash("ok", "Charity created."); }} onError={(m) => flash("err", m)} />}
    </>
  );
}

// ─── Add charity modal ──────────────────────────────────────────────────────
function AddCharityModal({ onClose, onCreated, onError }: { onClose: () => void; onCreated: () => void; onError: (m: string) => void }) {
  const [form, setForm] = useState({
    name: "", description: "", category: "humanitarian", goal_amount: "10000",
    legal_name: "", registration_number: "", country: "GB", contact_email: "",
    is_zakat_eligible: false, is_featured: false,
  });
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/charities", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, goal_amount: Number(form.goal_amount) }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) { onError(json?.error ?? "Create failed."); return; }
      onCreated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4" onClick={() => !busy && onClose()}>
      <div className="bg-white rounded-none border border-[#102C26]/15 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-[#102C26]/10 px-6 py-4 flex items-center justify-between">
          <h3 className={`${display.className} text-lg font-bold text-[#102C26]`}>Add charity</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-none"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <TextInput label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <TextArea label="Short description *" value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} />
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Category *" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <NumberInput label="Goal (£) *" value={Number(form.goal_amount)} onChange={(v) => setForm({ ...form, goal_amount: String(v) })} />
            <TextInput label="Legal name" value={form.legal_name} onChange={(v) => setForm({ ...form, legal_name: v })} />
            <TextInput label="Registration no." value={form.registration_number} onChange={(v) => setForm({ ...form, registration_number: v })} />
            <TextInput label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
            <TextInput label="Contact email" value={form.contact_email} onChange={(v) => setForm({ ...form, contact_email: v })} />
          </div>
          <div className="flex items-center gap-5">
            <Toggle label="Featured" checked={form.is_featured} onChange={(v) => setForm({ ...form, is_featured: v })} />
            <Toggle label="Zakat eligible" checked={form.is_zakat_eligible} onChange={(v) => setForm({ ...form, is_zakat_eligible: v })} />
          </div>
        </div>
        <div className="border-t border-[#102C26]/10 px-6 py-4 flex items-center justify-end gap-2">
          <button onClick={onClose} disabled={busy} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</button>
          <button onClick={submit} disabled={busy || !form.name.trim() || !form.description.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-bold uppercase tracking-tight text-[#F7E7CE] bg-[#102C26] rounded-none hover:bg-[#102C26]/90 transition-colors disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inputs ──────────────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-1">{children}</p>;
}
const inputCls = "w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-400 disabled:opacity-60";

function TextInput({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return <div><Label>{label}</Label><input type="text" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={inputCls} /></div>;
}
function NumberInput({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return <div><Label>{label}</Label><input type="number" value={Number.isFinite(value) ? value : ""} disabled={disabled} onChange={(e) => onChange(parseFloat(e.target.value))} className={`${inputCls} tabular-nums`} /></div>;
}
function TextArea({ label, value, onChange, disabled, rows }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean; rows: number }) {
  return <div><Label>{label}</Label><textarea value={value} disabled={disabled} rows={rows} onChange={(e) => onChange(e.target.value)} className={inputCls} /></div>;
}
function Toggle({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className={`flex items-center gap-2 text-sm font-medium text-gray-700 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded border-gray-300 accent-[#102C26]" />
      {label}
    </label>
  );
}
