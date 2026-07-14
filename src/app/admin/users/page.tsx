"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { display } from "../_fonts";
import { Modal, StatCard, Pagination, DateRange } from "../_ui";
import { rememberList } from "@/lib/adminRecordNav";
import {
  Search,
  RefreshCw,
  AlertCircle,
  Users,
  UserPlus,
  ShieldCheck,
  Ban,
  ChevronRight,
  MoreVertical,
  BadgeCheck,
  Store,
  Download,
  CheckSquare,
  X,
  Eye,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface UserRow {
  id: string;
  full_name: string;
  username: string | null;
  email: string | null;
  role: string;
  status: string;
  is_verified: boolean;
  reward_tier: string;
  reward_points: number;
  created_at: string;
  linked_merchant: { id: string; name: string } | null;
}

interface Stats { total: number; newThisWeek: number; team: number; suspended: number; }

// ─── Constants ──────────────────────────────────────────────────────────────
const ROLE_FILTERS = [
  { key: "all", label: "All" },
  { key: "user", label: "Users" },
  { key: "admin", label: "Team" },
];
const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "suspended", label: "Suspended" },
  { key: "banned", label: "Banned" },
];
const ROLE_CONFIG: Record<string, { label: string; cls: string }> = {
  user: { label: "User", cls: "bg-gray-100 text-gray-700" },
  admin: { label: "Admin", cls: "bg-[#102C26]/10 text-[#102C26]" },
  super_admin: { label: "Super Admin", cls: "bg-[#F59E0B]/10 text-[#F59E0B]" },
};
const STATUS_CONFIG: Record<string, { label: string; dot: string; cls: string }> = {
  active: { label: "Active", dot: "bg-green-500", cls: "bg-green-50 text-green-700" },
  suspended: { label: "Suspended", dot: "bg-amber-500", cls: "bg-amber-50 text-amber-700" },
  banned: { label: "Banned", dot: "bg-red-500", cls: "bg-red-50 text-red-700" },
};
const TIER_CONFIG: Record<string, string> = {
  bronze: "text-amber-700", silver: "text-gray-600", gold: "text-yellow-700", platinum: "text-[#102C26]",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Small components ─────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;
  return <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${cfg.cls}`}>{cfg.label}</span>;
}
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} /> {cfg.label}
    </span>
  );
}
function Avatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-none bg-[#102C26]/8 border border-[#102C26]/10 flex items-center justify-center shrink-0">
      <span className="text-[#102C26] text-xs font-bold">{initials(name || "?")}</span>
    </div>
  );
}
function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-[#102C26]/8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-6 py-4">
          <div className="w-9 h-9 bg-gray-200 rounded-none" />
          <div className="space-y-1.5 flex-1"><div className="h-4 bg-gray-200 rounded w-36" /><div className="h-3 bg-gray-100 rounded w-24" /></div>
          <div className="h-6 bg-gray-200 rounded-full w-16" /><div className="h-6 bg-gray-200 rounded-full w-20" /><div className="h-4 bg-gray-100 rounded w-8 ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Pre-filter to staff when arrived from the "Permissions" nav entry (?role=admin).
  const initialRole = useSearchParams().get("role");
  const [roleFilter, setRoleFilter] = useState(
    initialRole === "admin" || initialRole === "user" ? initialRole : "all",
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Selection / bulk
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState<string | null>(null);
  const [showBulkSuspend, setShowBulkSuspend] = useState(false);
  const [bulkReason, setBulkReason] = useState("");
  const [exporting, setExporting] = useState(false);

  // Row action menu (fixed-positioned dropdown)
  const [menu, setMenu] = useState<{ user: UserRow; top: number; left: number } | null>(null);
  // Confirm modal for suspend/delete from row menu
  const [modal, setModal] = useState<{ kind: "delete" | "suspend"; user: UserRow } | null>(null);
  const [modalReason, setModalReason] = useState("");
  const [modalBusy, setModalBusy] = useState(false);

  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  function flash(kind: "ok" | "err", msg: string) { setToast({ kind, msg }); setTimeout(() => setToast(null), 3500); }

  async function fetchUsers(p: number, role: string, status: string, q: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("pageSize", String(pageSize));
      if (role !== "all") params.set("role", role);
      if (status !== "all") params.set("status", status);
      if (q) params.set("search", q);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setUsers(json.users); setStats(json.stats); setTotal(json.total); setCanManage(!!json.canManage);
      rememberList("users", (json.users as UserRow[]).map((u) => u.id));
    } catch {
      setError("Could not load users. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers(page, roleFilter, statusFilter, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, roleFilter, statusFilter, dateFrom, dateTo]);
  useEffect(() => { setPage(0); }, [roleFilter, statusFilter, dateFrom, dateTo]);
  useEffect(() => { setSelectedIds(new Set()); }, [page, roleFilter, statusFilter, search]);

  // Close the row menu on any outside click / scroll / resize.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("click", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("click", close);
    };
  }, [menu]);

  function handleSearchChange(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); fetchUsers(0, roleFilter, statusFilter, val); }, 300);
  }

  const navigate = (id: string) => router.push(`/admin/users/${id}`);

  // Selection helpers (current page only).
  function toggleSelect(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function toggleSelectAll() {
    if (selectedIds.size === users.length && users.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map((u) => u.id)));
  }
  function clearSelection() { setSelectedIds(new Set()); setShowBulkSuspend(false); setBulkReason(""); }

  async function patch(id: string, body: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (!res.ok) { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Update failed."); return false; }
    return true;
  }

  async function runBulk(action: "verify" | "unverify" | "suspend" | "activate") {
    if (selectedIds.size === 0) return;
    if (action === "suspend" && !bulkReason.trim()) { flash("err", "A reason is required."); return; }
    setBulkBusy(action);
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: Array.from(selectedIds), reason: bulkReason.trim() || undefined }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      flash("ok", `${json.updated} user${json.updated !== 1 ? "s" : ""} updated.`);
      clearSelection();
      fetchUsers(page, roleFilter, statusFilter, search);
    } catch {
      flash("err", "Bulk action failed.");
    } finally {
      setBulkBusy(null);
    }
  }

  // Row-menu instant verify toggle.
  async function toggleVerify(u: UserRow) {
    setMenu(null);
    const ok = await patch(u.id, { is_verified: !u.is_verified });
    if (ok) { flash("ok", u.is_verified ? "Verification removed." : "User verified."); fetchUsers(page, roleFilter, statusFilter, search); }
  }

  // Confirm modal submit (suspend or delete).
  async function confirmModal() {
    if (!modal) return;
    if (modal.kind === "suspend" && !modalReason.trim()) { flash("err", "A reason is required."); return; }
    setModalBusy(true);
    try {
      let ok = false;
      if (modal.kind === "delete") {
        const res = await fetch(`/api/admin/users/${modal.user.id}`, { method: "DELETE" });
        if (res.ok) ok = true;
        else { const j = await res.json().catch(() => null); flash("err", j?.error ?? "Delete failed."); }
      } else {
        ok = await patch(modal.user.id, { status: "suspended", reason: modalReason.trim() });
      }
      if (ok) {
        flash("ok", modal.kind === "delete" ? "User deleted." : "User suspended.");
        setModal(null); setModalReason("");
        fetchUsers(page, roleFilter, statusFilter, search);
      }
    } finally {
      setModalBusy(false);
    }
  }

  async function exportCSV() {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("export", "1");
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json() as { users: UserRow[] };
      const header = ["Name", "Username", "Email", "Role", "Status", "Verified", "Tier", "Points", "Joined"];
      const rows = json.users.map((u) => [
        u.full_name, u.username ?? "", u.email ?? "", u.role, u.status,
        u.is_verified ? "yes" : "no", u.reward_tier, String(u.reward_points),
        new Date(u.created_at).toISOString().slice(0, 10),
      ]);
      const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
      URL.revokeObjectURL(url);
      // Record the export (PII) in the audit log — fire-and-forget.
      const scope = [roleFilter !== "all" && `role=${roleFilter}`, statusFilter !== "all" && `status=${statusFilter}`, search && "search", (dateFrom || dateTo) && "date-range"].filter(Boolean).join(", ") || "all users";
      fetch("/api/admin/exports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resource: "users", count: json.users.length, scope }) }).catch(() => {});
    } catch {
      flash("err", "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  function openMenu(e: React.MouseEvent, u: UserRow) {
    e.stopPropagation();
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ user: u, top: r.bottom + 4, left: Math.max(8, r.right - 180) });
  }

  const allSelected = users.length > 0 && selectedIds.size === users.length;

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-70 flex items-center gap-2 px-4 py-2.5 rounded-none shadow-lg text-sm font-medium ${toast.kind === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.kind === "ok" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-5 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">User Management</span>
          </div>
          <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>Users</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage members, team roles and account status</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={exportCSV} disabled={exporting}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors disabled:opacity-50">
            {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => fetchUsers(page, roleFilter, statusFilter, search)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="px-4 sm:px-8 pt-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="Total Users" value={stats?.total ?? "—"} sub="All time" icon={Users} tone="success" />
          <StatCard label="New This Week" value={stats?.newThisWeek ?? "—"} sub="Joined ≤ 7 days" icon={UserPlus} tone="accent" />
          <StatCard label="Team Members" value={stats?.team ?? "—"} sub="Admins & super admins" icon={ShieldCheck} tone="brand" />
          <StatCard label="Suspended / Banned" value={stats?.suspended ?? "—"} sub="Restricted accounts" icon={Ban} tone="warning" />
        </div>
      </div>

      {/* Main */}
      <div className="px-4 sm:px-8 py-5">
        <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
          {/* Filters */}
          <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-0.5">
                {ROLE_FILTERS.map(({ key, label }) => (
                  <button key={key} onClick={() => setRoleFilter(key)}
                    className={`px-3 py-1.5 rounded-none text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${roleFilter === key ? "bg-[#102C26] text-[#F7E7CE]" : "text-gray-600 hover:text-[#102C26] hover:bg-[#102C26]/8"}`}>{label}</button>
                ))}
              </div>
              <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
              <div className="flex items-center gap-0.5">
                {STATUS_FILTERS.map(({ key, label }) => (
                  <button key={key} onClick={() => setStatusFilter(key)}
                    className={`px-3 py-1.5 rounded-none text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${statusFilter === key ? "bg-[#102C26] text-[#F7E7CE]" : "text-gray-600 hover:text-[#102C26] hover:bg-[#102C26]/8"}`}>{label}</button>
                ))}
              </div>
              <div className="sm:ml-auto">
                <DateRange from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); }} label="Joined" />
              </div>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input type="text" value={search} onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by name, email or username…"
                className="w-full pl-8 pr-4 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500 transition-colors" />
            </div>
          </div>

          {/* Bulk toolbar */}
          {canManage && selectedIds.size > 0 && (
            <div className="bg-[#102C26] px-4 sm:px-5 py-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <CheckSquare size={16} className="text-[#F7E7CE]" />
                  <span className="text-white font-semibold text-sm">{selectedIds.size} selected</span>
                  <button onClick={clearSelection} className="text-white/60 hover:text-white transition-colors ml-1" title="Clear"><X size={14} /></button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => runBulk("verify")} disabled={!!bulkBusy}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><BadgeCheck size={14} /> Verify</button>
                  <button onClick={() => runBulk("activate")} disabled={!!bulkBusy}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><CheckCircle2 size={14} /> Activate</button>
                  <button onClick={() => setShowBulkSuspend((v) => !v)} disabled={!!bulkBusy}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white rounded-none text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"><Ban size={14} /> Suspend</button>
                </div>
              </div>
              {showBulkSuspend && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <input type="text" value={bulkReason} onChange={(e) => setBulkReason(e.target.value)} placeholder="Reason for suspension (required)"
                    className="flex-1 min-w-50 px-3 py-2 text-sm bg-white/10 text-white border border-white/20 rounded-none placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#F7E7CE]/40" />
                  <button onClick={() => runBulk("suspend")} disabled={!!bulkBusy || !bulkReason.trim()}
                    className="px-4 py-2 bg-[#F7E7CE] text-[#102C26] rounded-none text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50">
                    {bulkBusy === "suspend" ? "Suspending…" : "Apply"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Table / states */}
          {error ? (
            <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          ) : loading ? (
            <TableSkeleton />
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 bg-gray-100 rounded-none flex items-center justify-center mb-4"><Users size={22} className="text-gray-500" /></div>
              <p className="text-base font-semibold text-gray-800">No users found</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                {search || roleFilter !== "all" || statusFilter !== "all" ? "Try adjusting your filters or search term." : "Users who sign up will appear here."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-[#102C26]/8">
                {users.map((u) => {
                  const sel = selectedIds.has(u.id);
                  return (
                    <div key={u.id} className={`px-4 py-4 ${sel ? "bg-[#102C26]/3" : ""}`}>
                      <div className="flex items-start gap-3">
                        {canManage && (
                          <div className="flex items-center justify-center w-6 h-6 shrink-0 mt-1.5" onClick={() => toggleSelect(u.id)}>
                            <input type="checkbox" checked={sel} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                          </div>
                        )}
                        <Avatar name={u.full_name} />
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(u.id)}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate text-[15px]">{u.full_name}</p>
                              <p className="text-sm text-gray-600 truncate mt-0.5">{u.email ?? "—"}</p>
                            </div>
                            <ChevronRight size={15} className="text-gray-400 mt-1 shrink-0" />
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <RoleBadge role={u.role} /><StatusBadge status={u.status} />
                            {u.is_verified && <BadgeCheck size={14} className="text-[#102C26]/50" />}
                            {u.linked_merchant && <span className="text-[10px] text-gray-600 inline-flex items-center gap-0.5"><Store size={10} /> {u.linked_merchant.name}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <table className="hidden md:table w-full text-sm">
                <thead>
                  <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                    {canManage && (
                      <th className="pl-4 lg:pl-5 pr-3 py-3 w-12 cursor-pointer" onClick={toggleSelectAll} title="Select / deselect page">
                        <div className="flex items-center justify-center">
                          <input type="checkbox" checked={allSelected} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                        </div>
                      </th>
                    )}
                    <th className={`px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 ${canManage ? "" : "pl-4 lg:pl-5"}`}>User</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Role</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden xl:table-cell">Tier</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Joined</th>
                    <th className="px-4 lg:px-5 py-3 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#102C26]/8">
                  {users.map((u) => {
                    const sel = selectedIds.has(u.id);
                    return (
                      <tr key={u.id} onClick={() => navigate(u.id)} className={`group cursor-pointer transition-colors ${sel ? "bg-[#102C26]/3" : "hover:bg-[#102C26]/2"}`}>
                        {canManage && (
                          <td className="pl-4 lg:pl-5 pr-3 py-3.5 w-12" onClick={(e) => { e.stopPropagation(); toggleSelect(u.id); }}>
                            <div className="flex items-center justify-center h-full">
                              <input type="checkbox" checked={sel} readOnly className="w-4 h-4 rounded border-gray-300 accent-[#102C26] pointer-events-none" />
                            </div>
                          </td>
                        )}
                        <td className={`px-2 py-3.5 ${canManage ? "" : "pl-4 lg:pl-5"}`}>
                          <div className="flex items-center gap-3">
                            <Avatar name={u.full_name} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-gray-900 truncate max-w-44 group-hover:text-[#102C26] transition-colors">{u.full_name}</p>
                                {u.is_verified && <BadgeCheck size={14} className="text-[#102C26]/50 shrink-0" />}
                              </div>
                              <p className="text-xs text-gray-600 truncate">
                                {u.username ? `@${u.username}` : "—"}
                                {u.linked_merchant && <span className="ml-1.5 inline-flex items-center gap-0.5 text-gray-600"><Store size={10} /> {u.linked_merchant.name}</span>}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell max-w-56"><p className="text-gray-700 truncate">{u.email ?? "—"}</p></td>
                        <td className="px-4 py-3.5"><RoleBadge role={u.role} /></td>
                        <td className="px-4 py-3.5"><StatusBadge status={u.status} /></td>
                        <td className="px-4 py-3.5 hidden xl:table-cell">
                          <span className={`text-xs font-semibold capitalize ${TIER_CONFIG[u.reward_tier] ?? "text-gray-600"}`}>{u.reward_tier}</span>
                          <span className="text-gray-500 text-xs ml-1">· {u.reward_points.toLocaleString()}pt</span>
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell text-gray-600 text-sm whitespace-nowrap">{fmtDate(u.created_at)}</td>
                        <td className="px-4 lg:px-5 py-3.5 text-right">
                          <button onClick={(e) => openMenu(e, u)} title="Actions"
                            className="inline-flex items-center justify-center w-8 h-8 rounded-none text-gray-500 hover:bg-[#102C26] hover:text-white transition-all">
                            <MoreVertical size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination footer */}
              <Pagination
                page={page} pageSize={pageSize} total={total} noun="user"
                onPrev={() => setPage((p) => Math.max(0, p - 1))}
                onNext={() => setPage((p) => p + 1)}
                onPageSize={(s) => { setPageSize(s); setPage(0); }}
                onJump={(p) => setPage(p)}
              />
            </>
          )}
        </div>
      </div>

      {/* Row action menu (fixed) */}
      {menu && (
        <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", top: menu.top, left: menu.left, width: 180 }}
          className="z-50 bg-white border border-[#102C26]/15 shadow-xl rounded-none py-1 text-sm">
          <button onClick={() => { setMenu(null); navigate(menu.user.id); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors"><Eye size={14} className="text-gray-500" /> View details</button>
          {canManage && menu.user.role !== "super_admin" && (
            <button onClick={() => toggleVerify(menu.user)} className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
              <BadgeCheck size={14} className="text-gray-500" /> {menu.user.is_verified ? "Remove verification" : "Verify user"}
            </button>
          )}
          {canManage && menu.user.status !== "suspended" && menu.user.role !== "super_admin" && (
            <button onClick={() => { setModalReason(""); setModal({ kind: "suspend", user: menu.user }); setMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-amber-700 hover:bg-amber-50 transition-colors"><Ban size={14} /> Suspend</button>
          )}
          {canManage && menu.user.role === "user" && (
            <button onClick={() => { setModalReason(""); setModal({ kind: "delete", user: menu.user }); setMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-red-700 hover:bg-red-50 transition-colors"><Trash2 size={14} /> Delete</button>
          )}
        </div>
      )}

      {/* Confirm modal (suspend / delete) */}
      {modal && (
        <Modal open busy={modalBusy} onClose={() => { setModal(null); setModalReason(""); }} labelledBy="user-modal-title" describedBy="user-modal-desc" className="p-6">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 ${modal.kind === "delete" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                {modal.kind === "delete" ? <Trash2 size={18} /> : <Ban size={18} />}
              </div>
              <div className="min-w-0">
                <h3 id="user-modal-title" className={`${display.className} text-lg font-bold text-[#102C26]`}>{modal.kind === "delete" ? "Delete user?" : "Suspend user?"}</h3>
                <p id="user-modal-desc" className="text-sm text-gray-600 mt-1">
                  {modal.kind === "delete"
                    ? <>This permanently removes <span className="font-semibold">{modal.user.full_name}</span> and all of their content. This cannot be undone.</>
                    : <>Suspend <span className="font-semibold">{modal.user.full_name}</span>. They&apos;ll be hidden until reactivated.</>}
                </p>
              </div>
            </div>
            {modal.kind === "suspend" && (
              <textarea value={modalReason} onChange={(e) => setModalReason(e.target.value)} rows={3} placeholder="Reason for suspension (required)…"
                className="mt-4 w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500" />
            )}
            {modal.kind === "delete" && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Type <span className="font-bold text-red-600">DELETE</span> to confirm</label>
                <input type="text" value={modalReason} onChange={(e) => setModalReason(e.target.value)} placeholder="DELETE" autoComplete="off"
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white placeholder:text-gray-400" />
              </div>
            )}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button onClick={() => { setModal(null); setModalReason(""); }} disabled={modalBusy} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Cancel</button>
              <button onClick={confirmModal} disabled={modalBusy || (modal.kind === "suspend" && !modalReason.trim()) || (modal.kind === "delete" && modalReason.trim().toUpperCase() !== "DELETE")}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-tight text-white rounded-none disabled:opacity-50 transition-colors ${modal.kind === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}>
                {modalBusy ? <Loader2 size={14} className="animate-spin" /> : modal.kind === "delete" ? <Trash2 size={14} /> : <Ban size={14} />}
                {modal.kind === "delete" ? "Delete" : "Suspend"}
              </button>
            </div>
        </Modal>
      )}
    </div>
  );
}
