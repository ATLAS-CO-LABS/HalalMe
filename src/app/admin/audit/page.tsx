"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search, RefreshCw, AlertCircle, ScrollText, ShieldAlert,
} from "lucide-react";
import { display } from "../_fonts";
import {
  fmtDateTime, TableSkeleton, EmptyState, Pagination, FilterPills, Badge,
} from "../_ui";

interface Entry {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  module: string | null;
  target_type: string | null;
  target_id: string | null;
  summary: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: { full_name: string | null; email: string | null } | null;
}

const MODULE_FILTERS = [
  { key: "all", label: "All" },
  { key: "users", label: "Users" },
  { key: "merchants", label: "Merchants" },
  { key: "kitchen", label: "Kitchen" },
  { key: "hub", label: "Hub" },
  { key: "rewards", label: "Rewards" },
];

// Destructive / money actions get a red tone so they stand out in the timeline.
const DANGER = /(delete|block|suspend|ban|reject|deactivate)/;
function actionTone(action: string): "red" | "amber" | "green" | "blue" {
  if (DANGER.test(action)) return "red";
  if (/(publish|approve|reinstate|activate|cleared|create)/.test(action)) return "green";
  if (/(counter|update|edit|info|role|permissions)/.test(action)) return "amber";
  return "blue";
}

export default function AuditPage() {
  const [rows, setRows] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchRows(p: number, mod: string, q: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), pageSize: String(pageSize) });
      if (mod !== "all") params.set("module", mod);
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/audit?${params}`);
      if (res.status === 403) { setForbidden(true); return; }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRows(json.entries); setTotal(json.total); setPageSize(json.pageSize);
    } catch {
      setError("Could not load the audit log. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows(page, moduleFilter, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, moduleFilter]);
  useEffect(() => { setPage(0); }, [moduleFilter]);

  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); fetchRows(0, moduleFilter, val); }, 300);
  }

  if (forbidden) {
    return (
      <div className="bg-[#F3E9D6] min-h-full flex items-center justify-center py-32 px-6">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-red-50 border border-red-100 rounded-none flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={22} className="text-red-500" />
          </div>
          <p className="text-base font-semibold text-gray-800">Super admins only</p>
          <p className="text-sm text-gray-500 mt-1">The audit log is restricted to super admin accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-5 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">System</span>
          </div>
          <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>Audit Log</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Every admin action — who did what, and when</p>
        </div>
        <button onClick={() => fetchRows(page, moduleFilter, search)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Main */}
      <div className="px-4 sm:px-8 py-5">
        <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
          {/* Filters */}
          <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 space-y-2.5">
            <FilterPills options={MODULE_FILTERS} value={moduleFilter} onChange={setModuleFilter} />
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by action or description…"
                className="w-full pl-8 pr-4 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500 transition-colors" />
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
          ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
            <EmptyState icon={ScrollText} title="No activity yet" hint="Admin actions like deletes, status changes and approvals will be recorded here." />
          ) : (
            <>
              <div className="divide-y divide-[#102C26]/8">
                {rows.map((e) => {
                  const actorName = e.actor?.full_name ?? e.actor?.email ?? "Unknown";
                  return (
                    <div key={e.id} className="flex items-start gap-4 px-4 sm:px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <Badge label={e.action.replace(/[._]/g, " ")} tone={actionTone(e.action)} />
                          {e.module && <span className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{e.module}</span>}
                        </div>
                        <p className="text-sm text-gray-900 truncate">{e.summary ?? e.action}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {actorName}
                          {e.actor_role ? ` · ${e.actor_role === "super_admin" ? "Super admin" : "Admin"}` : ""}
                          {e.target_id ? ` · ${e.target_type ?? "target"} ${String(e.target_id).slice(0, 8)}` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{fmtDateTime(e.created_at)}</span>
                    </div>
                  );
                })}
              </div>
              <Pagination page={page} pageSize={pageSize} total={total} noun="record" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} onPageSize={(s) => { setPageSize(s); setPage(0); }} pageSizeOptions={[30, 60, 120]} onJump={(p) => setPage(p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
