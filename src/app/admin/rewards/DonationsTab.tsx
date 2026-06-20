"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search, RefreshCw, AlertCircle, Receipt, CheckCircle2, RotateCcw, Banknote, ShieldAlert,
} from "lucide-react";
import ThemedSelect from "@/components/admin/ThemedSelect";
import {
  fmtDateTime, fmtMoney, useToast, ToastView, StatCard, TableSkeleton, EmptyState, Pagination, FilterPills, Badge,
} from "../_ui";

type Joined = { id: string; full_name?: string; email?: string; name?: string } | { id: string; full_name?: string; email?: string; name?: string }[] | null;
function one(j: Joined) { return Array.isArray(j) ? j[0] : j; }

interface DonationRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  points_earned: number;
  risk_score: number;
  is_anonymous: boolean;
  payment_method_type: string | null;
  created_at: string;
  user: Joined;
  charity: Joined;
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "completed", label: "Completed" },
  { key: "pending", label: "Pending" },
  { key: "failed", label: "Failed" },
  { key: "refunded", label: "Refunded" },
];
const STATUS_TONE: Record<string, "green" | "amber" | "red" | "gray"> = {
  completed: "green", pending: "amber", failed: "red", refunded: "gray",
};

export default function DonationsTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState<DonationRow[]>([]);
  const [stats, setStats] = useState<{ total: number; completed: number; refunded: number; totalRaised: number } | null>(null);
  const [charities, setCharities] = useState<{ id: string; name: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("all");
  const [charity, setCharity] = useState("all");
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function fetchRows(p: number, s: string, c: string, q: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (s !== "all") params.set("status", s);
      if (c !== "all") params.set("charity", c);
      if (q) params.set("search", q);
      const res = await fetch(`/api/admin/donations?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRows(json.donations); setStats(json.stats); setTotal(json.total);
      setPageSize(json.pageSize); setCharities(json.charities ?? []);
    } catch {
      setError("Could not load donations. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows(page, status, charity, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, charity]);
  useEffect(() => { setPage(0); }, [status, charity]);

  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); fetchRows(0, status, charity, val); }, 300);
  }

  return (
    <>
      <ToastView toast={toast} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <StatCard label="Total Donations" value={stats?.total ?? "—"} sub="All time" icon={Receipt} tone="blue" />
        <StatCard label="Completed" value={stats?.completed ?? "—"} sub="Successfully paid" icon={CheckCircle2} tone="green" />
        <StatCard label="Refunded" value={stats?.refunded ?? "—"} sub="Reversed" icon={RotateCcw} tone="amber" />
        <StatCard label="Total Raised" value={stats ? fmtMoney(stats.totalRaised) : "—"} sub="Completed only" icon={Banknote} tone="purple" />
      </div>

      <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
        <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <FilterPills options={STATUS_FILTERS} value={status} onChange={setStatus} />
            <div className="flex items-center gap-2">
              <div className="w-44">
                <ThemedSelect value={charity} onChange={setCharity}
                  options={[{ value: "all", label: "All charities" }, ...charities.map((c) => ({ value: c.id, label: c.name }))]} />
              </div>
              <button onClick={() => fetchRows(page, status, charity, search)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search donor name or email (current page)…"
              className="w-full pl-8 pr-4 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500 transition-colors" />
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
        ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon={Receipt} title="No donations found" hint="Donations made through the platform will appear here." />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                  <th className="pl-4 lg:pl-5 px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Donor</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden md:table-cell">Charity</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Points</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden xl:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#102C26]/8">
                {rows.map((d) => {
                  const u = one(d.user); const c = one(d.charity);
                  return (
                    <tr key={d.id} className="hover:bg-[#102C26]/2 transition-colors">
                      <td className="pl-4 lg:pl-5 px-2 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 truncate max-w-44">{d.is_anonymous ? "Anonymous" : (u?.full_name ?? "—")}</p>
                          {d.risk_score >= 70 && <span title={`Risk ${d.risk_score}`}><ShieldAlert size={13} className="text-red-500 shrink-0" /></span>}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{d.is_anonymous ? "" : (u?.email ?? "")}</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-gray-700 truncate max-w-44">{c?.name ?? "—"}</td>
                      <td className="px-4 py-3.5 text-right font-semibold text-gray-900 tabular-nums">{fmtMoney(d.amount, d.currency)}</td>
                      <td className="px-4 py-3.5"><Badge label={d.status} tone={STATUS_TONE[d.status] ?? "gray"} /></td>
                      <td className="px-4 py-3.5 text-right hidden lg:table-cell tabular-nums text-gray-600">{d.points_earned > 0 ? `+${d.points_earned}` : "—"}</td>
                      <td className="px-4 py-3.5 hidden xl:table-cell text-gray-600 whitespace-nowrap">{fmtDateTime(d.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={page} pageSize={pageSize} total={total} noun="donation" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} />
          </>
        )}
      </div>
    </>
  );
}
