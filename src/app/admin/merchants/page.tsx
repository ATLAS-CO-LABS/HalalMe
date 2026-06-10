"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { display } from "../_fonts";
import AddMerchantModal from "@/components/admin/AddMerchantModal";
import { getFollowUp } from "@/lib/followUps";
import {
  Search,
  RefreshCw,
  AlertCircle,
  Store,
  ChevronRight,
  CheckSquare,
  X,
  Mail,
  UserCog,
  Ban,
  Download,
  Activity,
  Sparkles,
  MapPin,
  Clock,
  MoreVertical,
  ArrowRight,
  Plus,
} from "lucide-react";

interface Merchant {
  id: string;
  name: string;
  owner_name: string | null;
  email: string;
  phone: string;
  city: string | null;
  post_code: string | null;
  status: string;
  assigned_rep: string | null;
  commission_percentage: number | null;
  created_at: string;
  invited_at: string | null;
  contacted_at: string | null;
  activated_at: string | null;
  hyperzod_merchant_id: string | null;
  hyperzod_sync_failed: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES = [
  { key: "all",         label: "All" },
  { key: "pending",     label: "Pending" },
  { key: "invited",     label: "Invited" },
  { key: "contacted",   label: "Contacted" },
  { key: "negotiating", label: "Negotiating" },
  { key: "agreed",      label: "Agreed" },
  { key: "live",        label: "Live" },
  { key: "rejected",    label: "Rejected" },
];

const STATUS_CONFIG: Record<string, { dot: string; badge: string; hex: string; label: string }> = {
  pending:     { dot: "bg-gray-400",   badge: "bg-gray-100 text-gray-700",   hex: "#9ca3af", label: "Pending" },
  invited:     { dot: "bg-blue-500",   badge: "bg-blue-50 text-blue-700",    hex: "#3b82f6", label: "Invited" },
  contacted:   { dot: "bg-amber-500",  badge: "bg-amber-50 text-amber-700",  hex: "#f59e0b", label: "Contacted" },
  negotiating: { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700",hex: "#f97316", label: "Negotiating" },
  agreed:      { dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700",hex: "#a855f7", label: "Agreed" },
  live:        { dot: "bg-green-500",  badge: "bg-green-50 text-green-700",   hex: "#22c55e", label: "Live" },
  rejected:    { dot: "bg-red-500",    badge: "bg-red-50 text-red-700",       hex: "#ef4444", label: "Rejected" },
};

const PIPELINE_ORDER = ["pending", "invited", "contacted", "negotiating", "agreed", "live", "rejected"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const d = Math.floor(hrs / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function DaysCell({ days, status }: { days: number; status: string }) {
  const urgent   = status === "pending" && days > 2;
  const critical = status === "pending" && days > 7;
  return (
    <span className={`tabular-nums text-sm font-semibold px-2 py-0.5 rounded-md ${
      critical ? "bg-red-50 text-red-600"
      : urgent  ? "bg-amber-50 text-amber-600"
      : "text-gray-500 font-normal"
    }`}>
      {days}d
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-none bg-[#102C26]/8 border border-[#102C26]/10 flex items-center justify-center shrink-0">
      <span className="text-[#102C26] text-xs font-bold">{initials(name)}</span>
    </div>
  );
}

// SVG donut from pipeline segments
function Donut({ segments, total }: { segments: { key: string; count: number; hex: string }[]; total: number }) {
  const size = 132, stroke = 16;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1efe9" strokeWidth={stroke} />
        {total > 0 && segments.filter((s) => s.count > 0).map((s) => {
          const len = (s.count / total) * circ;
          const el = (
            <circle
              key={s.key} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.hex} strokeWidth={stroke}
              strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`${display.className} text-2xl font-bold text-[#102C26] leading-none`}>{total}</span>
        <span className="text-[10px] text-gray-400 font-medium mt-0.5">Total</span>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-[#102C26]/8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-4">
          <div className="w-9 h-9 bg-gray-200 rounded-none" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-gray-200 rounded w-36" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-40 hidden lg:block" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-4 bg-gray-100 rounded w-8 ml-auto" />
        </div>
      ))}
    </div>
  );
}

// Mobile card row
function MerchantCard({ m, onClick, selected, onSelect }: {
  m: Merchant; onClick: () => void; selected: boolean; onSelect: () => void;
}) {
  const days = daysSince(m.created_at);
  const urgent   = m.status === "pending" && days > 2;
  const critical = m.status === "pending" && days > 7;

  return (
    <div className={`px-4 py-4 transition-colors border-b border-[#102C26]/8 last:border-0 ${
      selected ? "bg-[#102C26]/3" :
      critical ? "border-l-2 border-l-red-400" :
      urgent   ? "border-l-2 border-l-amber-400" : ""
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-6 h-6 shrink-0 mt-1.5" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          <input type="checkbox" checked={selected} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
        </div>
        <Avatar name={m.name} />
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate text-[15px]">{m.name}</p>
              <p className="text-sm text-gray-500 truncate mt-0.5">{m.email}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={m.status} />
              <ChevronRight size={15} className="text-gray-300" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {(m.city || m.post_code) && (
              <span className="text-xs text-gray-600">
                <MapPin size={11} className="inline mr-0.5 -mt-0.5 text-gray-400" />
                {[m.city, m.post_code].filter(Boolean).join(" · ")}
              </span>
            )}
            <span className={`text-xs font-semibold ${critical ? "text-red-600" : urgent ? "text-amber-600" : "text-gray-400"}`}>{days}d ago</span>
            {m.assigned_rep && <span className="text-xs text-gray-500">Rep: {m.assigned_rep}</span>}
            {m.hyperzod_sync_failed && <span className="text-xs text-amber-600 font-medium">⚠ Sync failed</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, tone, onClick, active }: {
  label: string; value: React.ReactNode; sub: string; icon: React.ElementType;
  tone: "green" | "amber" | "blue" | "purple";
  onClick?: () => void; active?: boolean;
}) {
  const tones = {
    green:  "bg-green-50 text-green-600",
    amber:  "bg-[#F59E0B]/10 text-[#F59E0B]",
    blue:   "bg-[#102C26]/8 text-[#102C26]",
    purple: "bg-[#F03E9E]/10 text-[#F03E9E]",
  };
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`text-left w-full bg-white rounded-none border p-4 sm:p-5 transition-all ${
        active ? "border-[#F59E0B] ring-2 ring-[#F59E0B]/20" : "border-[#102C26]/12"
      } ${onClick ? "hover:border-gray-300 cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className={`${display.className} text-2xl font-bold text-[#102C26] mt-1`}>{value}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
    </Tag>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MerchantPipelinePage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [allMerchants, setAllMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<null | "invite" | "reject" | "assign">(null);
  const [bulkResult, setBulkResult] = useState<{ action: string; count: number } | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [assignRep, setAssignRep] = useState("");
  const [confirmingBulkReject, setConfirmingBulkReject] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [attentionOnly, setAttentionOnly] = useState(false);

  async function fetchMerchants(status: string, q: string) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/merchants?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json() as { merchants: Merchant[] };
      setMerchants(json.merchants);
      if (status === "all" && !q) setAllMerchants(json.merchants);
    } catch {
      setError("Could not load merchants. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  function refreshAll() {
    fetch("/api/admin/merchants")
      .then((r) => r.json())
      .then((d: { merchants: Merchant[] }) => setAllMerchants(d.merchants))
      .catch(() => {});
  }

  useEffect(() => {
    fetchMerchants(statusFilter, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => { refreshAll(); }, []);
  useEffect(() => { setSelectedIds(new Set()); }, [statusFilter, search]);

  function handleSearchChange(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchMerchants(statusFilter, val), 300);
  }

  // Merchants that need follow-up (across all statuses)
  const attentionMerchants = allMerchants.filter((m) => getFollowUp(m) !== null);

  // What the table renders: overdue-only when the Needs-Attention filter is on
  const displayed = attentionOnly
    ? attentionMerchants.filter((m) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      })
    : merchants;

  // Selection helpers
  const selectedPendingCount = displayed.filter((m) => selectedIds.has(m.id) && m.status === "pending").length;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  function toggleSelectAll() {
    if (selectedIds.size === displayed.length && displayed.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(displayed.map((m) => m.id)));
  }
  function clearSelection() {
    setSelectedIds(new Set()); setShowAssign(false); setConfirmingBulkReject(false); setAssignRep("");
  }

  async function runBulk(action: "invite" | "reject" | "assign", extra?: Record<string, unknown>) {
    if (selectedIds.size === 0) return;
    setBulkBusy(action);
    setBulkResult(null);
    try {
      const url = action === "invite" ? "/api/admin/merchants/bulk-invite" : "/api/admin/merchants/bulk";
      const body = action === "invite"
        ? { ids: Array.from(selectedIds) }
        : { action, ids: Array.from(selectedIds), ...extra };
      const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error();
      const json = await res.json() as { updated: number };
      setBulkResult({ action, count: json.updated });
      clearSelection();
      await fetchMerchants(statusFilter, search);
      refreshAll();
    } catch {
      alert("Bulk action failed. Please try again.");
    } finally {
      setBulkBusy(null);
    }
  }

  function exportCSV() {
    const header = ["Name", "Owner", "Email", "Phone", "City", "Postcode", "Status", "Rep", "Commission %", "Registered"];
    const rows = displayed.map((m) => [
      m.name, m.owner_name ?? "", m.email, m.phone, m.city ?? "", m.post_code ?? "",
      m.status, m.assigned_rep ?? "", m.commission_percentage?.toString() ?? "",
      new Date(m.created_at).toISOString().slice(0, 10),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merchants-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getCount(key: string) {
    return key === "all" ? allMerchants.length : allMerchants.filter((m) => m.status === key).length;
  }

  // ── Derived stats / rail data ─────────────────────────────────────────────
  const total = allMerchants.length;
  const liveCount = allMerchants.filter((m) => m.status === "live").length;
  const urgentCount = attentionMerchants.length;
  const newThisWeek = allMerchants.filter((m) => daysSince(m.created_at) <= 7).length;

  const pipeline = PIPELINE_ORDER.map((key) => ({
    key,
    count: allMerchants.filter((m) => m.status === key).length,
    hex: STATUS_CONFIG[key].hex,
    label: STATUS_CONFIG[key].label,
  }));

  const topCities = Object.entries(
    allMerchants.reduce<Record<string, number>>((acc, m) => {
      const c = m.city?.trim();
      if (c) acc[c] = (acc[c] ?? 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const recentActivity = [...allMerchants]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const navigate = (id: string) => router.push(`/admin/merchants/${id}`);

  return (
    <div className="bg-[#F3E9D6] min-h-full">

      {/* ── Header ── */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-5 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">Merchant CRM</span>
          </div>
          <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>Pipeline</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage and grow your restaurant partners</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#102C26]/70 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => { fetchMerchants(statusFilter, search); refreshAll(); }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/70 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-extrabold uppercase tracking-tighter text-[#F7E7CE] bg-[#102C26] rounded-none hover:bg-[#102C26]/90 transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add Merchant</span>
          </button>
        </div>
      </div>

      {showAdd && (
        <AddMerchantModal
          onClose={() => setShowAdd(false)}
          onCreated={(id) => { setShowAdd(false); router.push(`/admin/merchants/${id}`); }}
        />
      )}

      {/* ── Stat cards ── */}
      <div className="px-4 sm:px-8 pt-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Total Merchants" value={total} sub="All time" icon={Store} tone="green" />
          <StatCard label="Needs Attention" value={urgentCount}
            sub={attentionOnly ? "Showing — click to clear" : urgentCount ? "Click to review" : "All caught up"}
            icon={AlertCircle} tone="amber"
            active={attentionOnly}
            onClick={() => setAttentionOnly((v) => !v)} />
          <StatCard label="Active (Live)" value={liveCount}
            sub={total ? `${Math.round((liveCount / total) * 100)}% of total` : "—"} icon={Activity} tone="green" />
          <StatCard label="New This Week" value={newThisWeek} sub="Registered ≤ 7 days" icon={Sparkles} tone="purple" />
        </div>
      </div>

      {/* ── Main + rail ── */}
      <div className="px-4 sm:px-8 py-5 grid grid-cols-1 xl:grid-cols-[1fr_330px] gap-5">

        {/* ── Main column ── */}
        <div className="min-w-0">

          {/* Filters */}
          <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
            <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8">
              <div className="flex items-center gap-0.5 overflow-x-auto pb-0.5 scrollbar-none">
                {STATUSES.map(({ key, label }) => {
                  const active = statusFilter === key;
                  return (
                    <button key={key} onClick={() => { setStatusFilter(key); setAttentionOnly(false); }}
                      className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-none text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                        active ? "bg-[#102C26] text-[#F7E7CE]" : "text-gray-500 hover:text-[#102C26] hover:bg-[#102C26]/8"
                      }`}>
                      {label}
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {getCount(key)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="relative mt-2.5">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text" value={search} onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search by restaurant name or email…"
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-400 transition-colors"
                />
              </div>
            </div>

            {/* Bulk toolbar */}
            {selectedIds.size > 0 && (
              <div className="bg-[#102C26] px-4 sm:px-5 py-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <CheckSquare size={16} className="text-[#F7E7CE]" />
                    <span className="text-white font-semibold text-sm">{selectedIds.size} selected</span>
                    <button onClick={clearSelection} className="text-white/50 hover:text-white transition-colors ml-1" title="Clear">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => { setShowAssign((v) => !v); setConfirmingBulkReject(false); }} disabled={!!bulkBusy}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50">
                      <UserCog size={14} /> Assign rep
                    </button>
                    <button onClick={() => { setConfirmingBulkReject((v) => !v); setShowAssign(false); }} disabled={!!bulkBusy}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50">
                      <Ban size={14} /> Reject
                    </button>
                    <button onClick={() => runBulk("invite")} disabled={!!bulkBusy || selectedPendingCount === 0}
                      title={selectedPendingCount === 0 ? "No pending merchants selected" : ""}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#F7E7CE] text-[#102C26] rounded-none text-sm font-semibold hover:bg-white transition-colors disabled:opacity-40">
                      <Mail size={14} />
                      {bulkBusy === "invite" ? "Marking…" : `Mark Invited${selectedPendingCount ? ` (${selectedPendingCount})` : ""}`}
                    </button>
                  </div>
                </div>
                {showAssign && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <input type="text" value={assignRep} onChange={(e) => setAssignRep(e.target.value)}
                      placeholder="Rep name (leave blank to unassign)"
                      className="flex-1 min-w-50 px-3 py-2 text-sm bg-white/10 text-white border border-white/20 rounded-none placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#F7E7CE]/40" />
                    <button onClick={() => runBulk("assign", { rep: assignRep })} disabled={!!bulkBusy}
                      className="px-4 py-2 bg-[#F7E7CE] text-[#102C26] rounded-none text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50">
                      {bulkBusy === "assign" ? "Assigning…" : "Apply"}
                    </button>
                  </div>
                )}
                {confirmingBulkReject && (
                  <div className="mt-3 flex items-center justify-between gap-2 bg-white/10 rounded-none px-3 py-2.5 flex-wrap">
                    <span className="text-sm text-white/90">Reject {selectedIds.size} merchant{selectedIds.size !== 1 ? "s" : ""}? (Live merchants are skipped.)</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setConfirmingBulkReject(false)} className="text-sm font-medium text-white/60 hover:text-white px-2 py-1">Cancel</button>
                      <button onClick={() => runBulk("reject")} disabled={!!bulkBusy}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-none text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
                        {bulkBusy === "reject" ? "Rejecting…" : "Yes, reject"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success banner */}
            {bulkResult && (
              <div className="bg-green-50 border-y border-green-100 px-4 sm:px-5 py-3 flex items-center justify-between">
                <p className="text-sm text-green-700 font-medium">
                  ✓ {bulkResult.count} merchant{bulkResult.count !== 1 ? "s" : ""}{" "}
                  {bulkResult.action === "invite" ? "marked as invited — Email #2 sent to each."
                    : bulkResult.action === "reject" ? "rejected." : "updated."}
                </p>
                <button onClick={() => setBulkResult(null)} className="text-green-400 hover:text-green-700 transition-colors"><X size={14} /></button>
              </div>
            )}

            {/* Table / states */}
            {error ? (
              <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            ) : loading ? (
              <TableSkeleton />
            ) : displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-14 h-14 bg-gray-100 rounded-none flex items-center justify-center mb-4"><Store size={22} className="text-gray-400" /></div>
                <p className="text-base font-semibold text-gray-700">
                  {attentionOnly ? "Nothing needs attention 🎉" : (search || statusFilter !== "all") ? "No results" : "No merchants yet"}
                </p>
                <p className="text-sm text-gray-400 mt-1 max-w-xs">
                  {attentionOnly ? "Every merchant is on track right now."
                    : (search || statusFilter !== "all") ? "Try adjusting your filters or search term."
                    : "Merchants who register will appear here."}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="md:hidden">
                  {displayed.map((m) => (
                    <MerchantCard key={m.id} m={m} onClick={() => navigate(m.id)} selected={selectedIds.has(m.id)} onSelect={() => toggleSelect(m.id)} />
                  ))}
                </div>

                {/* Desktop table */}
                <table className="hidden md:table w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                      <th className="pl-4 lg:pl-5 pr-3 py-3 w-12 cursor-pointer" onClick={toggleSelectAll} title="Select / deselect all">
                        <div className="flex items-center justify-center">
                          <input type="checkbox" checked={displayed.length > 0 && selectedIds.size === displayed.length} readOnly
                            disabled={displayed.length === 0} className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none disabled:opacity-30" />
                        </div>
                      </th>
                      <th className="px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Restaurant</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hidden lg:table-cell">Contact</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hidden xl:table-cell">Location</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hidden lg:table-cell">Rep</th>
                      <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">Days</th>
                      <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 hidden lg:table-cell">Comm %</th>
                      <th className="px-4 lg:px-5 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#102C26]/8">
                    {displayed.map((m) => {
                      const days = daysSince(m.created_at);
                      const isSelected = selectedIds.has(m.id);
                      const isNew = daysSince(m.created_at) <= 7;
                      const followUp = getFollowUp(m);
                      return (
                        <tr key={m.id} onClick={() => navigate(m.id)}
                          className={`group cursor-pointer transition-colors ${isSelected ? "bg-[#102C26]/3" : "hover:bg-[#102C26]/2"}`}>
                          <td className="pl-4 lg:pl-5 pr-3 py-3.5 w-12" onClick={(e) => { e.stopPropagation(); toggleSelect(m.id); }}>
                            <div className="flex items-center justify-center h-full">
                              <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                            </div>
                          </td>

                          {/* Restaurant */}
                          <td className="px-2 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar name={m.name} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 truncate max-w-40 group-hover:text-[#102C26] transition-colors">{m.name}</p>
                                  {isNew && <span className="text-[9px] font-bold uppercase tracking-wide text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full shrink-0">New</span>}
                                </div>
                                {followUp
                                  ? <p className={`text-[10px] font-semibold mt-0.5 ${followUp.severity === "urgent" ? "text-red-600" : "text-amber-600"}`}>⚠ {followUp.label} · {followUp.days}d</p>
                                  : m.owner_name
                                  ? <p className="text-xs text-gray-400 truncate">{m.owner_name}</p>
                                  : m.hyperzod_sync_failed && <p className="text-[10px] text-amber-600 font-medium">⚠ Sync failed</p>}
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="px-4 py-3.5 hidden lg:table-cell max-w-52">
                            <p className="text-gray-700 truncate">{m.email}</p>
                            <p className="text-xs text-gray-400 truncate">{m.phone}</p>
                          </td>

                          {/* Location */}
                          <td className="px-4 py-3.5 hidden xl:table-cell">
                            {(m.city || m.post_code) ? (
                              <div>
                                <p className="text-gray-700">{m.city ?? "—"}</p>
                                {m.post_code && <span className="text-xs text-gray-500 font-mono">{m.post_code}</span>}
                              </div>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5"><StatusBadge status={m.status} /></td>

                          {/* Rep */}
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            {m.assigned_rep
                              ? <span className="text-gray-700 text-sm">{m.assigned_rep}</span>
                              : <span className="text-xs text-gray-400 bg-gray-50 border border-dashed border-gray-200 px-2 py-0.5 rounded-md">Unassigned</span>}
                          </td>

                          {/* Days */}
                          <td className="px-4 py-3.5 text-center"><DaysCell days={days} status={m.status} /></td>

                          {/* Commission */}
                          <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                            {m.commission_percentage != null
                              ? <span className="font-semibold text-gray-900">{m.commission_percentage}%</span>
                              : <span className="text-gray-400 text-xs italic">Not set</span>}
                          </td>

                          {/* Action */}
                          <td className="px-4 lg:px-5 py-3.5 text-right">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-400 group-hover:bg-[#102C26] group-hover:text-white transition-all" title="Open">
                              <MoreVertical size={15} />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Footer count */}
                <div className="px-5 py-3 border-t border-[#102C26]/8 text-xs text-gray-400">
                  Showing {displayed.length} merchant{displayed.length !== 1 ? "s" : ""}
                  {attentionOnly ? " · needs attention" : statusFilter !== "all" ? ` · filtered by ${STATUS_CONFIG[statusFilter]?.label ?? statusFilter}` : ""}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right rail ── */}
        <aside className="space-y-5">

          {/* Pipeline overview */}
          <div className="bg-white rounded-none border border-[#102C26]/12 p-5">
            <h3 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26] mb-4`}>Pipeline Overview</h3>
            <div className="flex items-center gap-5">
              <Donut segments={pipeline} total={total} />
              <div className="flex-1 min-w-0 space-y-1.5">
                {pipeline.map((s) => (
                  <div key={s.key} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.hex }} />
                    <span className="text-gray-600 flex-1 truncate">{s.label}</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{s.count}</span>
                    <span className="text-gray-400 tabular-nums w-9 text-right">{total ? Math.round((s.count / total) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top cities */}
          <div className="bg-white rounded-none border border-[#102C26]/12 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={15} className="text-[#102C26]" />
              <h3 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26]`}>Top Cities</h3>
            </div>
            {topCities.length === 0 ? (
              <p className="text-xs text-gray-400">No city data yet.</p>
            ) : (
              <div className="space-y-3">
                {topCities.map(([city, count]) => (
                  <div key={city}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium truncate">{city}</span>
                      <span className="text-gray-400">{count} · {Math.round((count / total) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#102C26] rounded-full" style={{ width: `${(count / total) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-none border border-[#102C26]/12 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={15} className="text-[#102C26]" />
              <h3 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26]`}>Recent Activity</h3>
            </div>
            {recentActivity.length === 0 ? (
              <p className="text-xs text-gray-400">No activity yet.</p>
            ) : (
              <div className="space-y-3.5">
                {recentActivity.map((m) => (
                  <button key={m.id} onClick={() => navigate(m.id)} className="flex items-start gap-2.5 w-full text-left group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F03E9E] mt-1.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#102C26]">{m.name}</p>
                      <p className="text-xs text-gray-400">Added to CRM · {relativeTime(m.created_at)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-none border border-[#102C26]/12 p-5">
            <h3 className={`${display.className} text-[13px] font-extrabold uppercase tracking-wide text-[#102C26] mb-3`}>Quick Actions</h3>
            <div className="space-y-2">
              <button onClick={() => setStatusFilter("pending")}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-none border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /> Review pending</span>
                <ArrowRight size={14} className="text-gray-300" />
              </button>
              <button onClick={exportCSV}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-none border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <span className="flex items-center gap-2"><Download size={14} className="text-gray-400" /> Export report</span>
                <ArrowRight size={14} className="text-gray-300" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
