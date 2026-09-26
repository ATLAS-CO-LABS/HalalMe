"use client";
import { adminFetch, errorMessage } from "../_fetch";
import { adminKeys } from "../_query";

import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Search, RefreshCw, Receipt, CheckCircle2, RotateCcw, Banknote, ShieldAlert, Coins,
} from "lucide-react";
import ThemedSelect from "@/components/admin/ThemedSelect";
import {
  fmtDateTime, fmtMoney, useToast, ToastView, StatCard, TableSkeleton, EmptyState, Pagination, FilterPills, Badge, DateRange, LoadError,
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
  net_amount: number | null;
  platform_fee_amount: number | null;
  stripe_fee_amount: number | null;
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

interface DonationStats { total: number; completed: number; refunded: number; totalRaised: number; platformFees: number }
interface DonationsPayload {
  donations: DonationRow[];
  stats: DonationStats;
  total: number;
  pageSize: number;
  charities?: { id: string; name: string }[];
}
const NO_DONATIONS: DonationRow[] = [];
const NO_CHARITIES: { id: string; name: string }[] = [];

export default function DonationsTab() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  // Requested size; the server's clamped value is read back for display only.
  const [pageSize, setPageSize] = useState(25);
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [charity, setCharity] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (searchTimer.current) clearTimeout(searchTimer.current); }, []);

  // Read-only ledger: no mutations here, so nothing to invalidate.
  const query = useQuery({
    queryKey: adminKeys.list("donations", { page, pageSize, status, charity, dateFrom, dateTo, search: debouncedSearch }),
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (status !== "all") params.set("status", status);
      if (charity !== "all") params.set("charity", charity);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      return adminFetch<DonationsPayload>(`/api/admin/donations?${params}`);
    },
    placeholderData: keepPreviousData,
  });

  const rows = query.data?.donations ?? NO_DONATIONS;
  const stats = query.data?.stats ?? null;
  const charities = query.data?.charities ?? NO_CHARITIES;
  const total = query.data?.total ?? 0;
  const effectivePageSize = query.data?.pageSize ?? pageSize;
  const loading = query.isLoading;
  const error = query.isError ? errorMessage(query.error, "Could not load donations. Try refreshing.") : null;

  // Filter changes reset to page 1 in the handler, not an effect watching them.
  const changeStatus = (v: string) => { setStatus(v); setPage(0); };
  const changeCharity = (v: string) => { setCharity(v); setPage(0); };
  const changeDates = (f: string, t: string) => { setDateFrom(f); setDateTo(t); setPage(0); };

  function handleSearch(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); setDebouncedSearch(val); }, 300);
  }

  return (
    <>
      <ToastView toast={toast} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-5">
        <StatCard label="Total Donations" value={stats?.total ?? "—"} sub="All time" icon={Receipt} tone="blue" />
        <StatCard label="Completed" value={stats?.completed ?? "—"} sub="Successfully paid" icon={CheckCircle2} tone="green" />
        <StatCard label="Refunded" value={stats?.refunded ?? "—"} sub="Reversed" icon={RotateCcw} tone="amber" />
        <StatCard label="Total Raised" value={stats ? fmtMoney(stats.totalRaised) : "—"} sub="Gross, completed" icon={Banknote} tone="purple" />
        <StatCard label="Platform Fees" value={stats ? fmtMoney(stats.platformFees) : "—"} sub="Our revenue" icon={Coins} tone="amber" />
      </div>

      <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
        <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <FilterPills options={STATUS_FILTERS} value={status} onChange={changeStatus} />
            <div className="flex items-center gap-2 flex-wrap">
              <DateRange from={dateFrom} to={dateTo} onChange={changeDates} label="Donated" />
              <div className="w-44">
                <ThemedSelect value={charity} onChange={changeCharity}
                  options={[{ value: "all", label: "All charities" }, ...charities.map((c) => ({ value: c.id, label: c.name }))]} />
              </div>
              <button onClick={() => void query.refetch()}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
                <RefreshCw size={13} className={query.isFetching ? "animate-spin" : ""} />
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
          <LoadError message={error} onRetry={() => void query.refetch()} compact />
        ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
          <EmptyState icon={Receipt} title="No donations found" hint="Donations made through the platform will appear here." />
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[#102C26]/8">
              {rows.map((d) => {
                const u = one(d.user); const c = one(d.charity);
                return (
                  <div key={d.id} className="px-4 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-gray-900 truncate">{d.is_anonymous ? "Anonymous" : (u?.full_name ?? "—")}</p>
                          {d.risk_score >= 70 && <span title={`Risk ${d.risk_score}`}><ShieldAlert size={13} className="text-red-500 shrink-0" /></span>}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{d.is_anonymous ? "" : (u?.email ?? "")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-gray-900 tabular-nums">{fmtMoney(d.amount, d.currency)}</p>
                        <div className="mt-1"><Badge label={d.status} tone={STATUS_TONE[d.status] ?? "gray"} /></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 mt-2 text-xs text-gray-500">
                      <span className="truncate">{c?.name ?? "—"}</span>
                      <span className="shrink-0">{fmtDateTime(d.created_at)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#102C26]/12 bg-gray-50/60">
                    <th className="pl-4 lg:pl-5 px-2 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Donor</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Charity</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600">To charity</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden lg:table-cell">Platform fee</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-gray-600 hidden xl:table-cell">Stripe fee</th>
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
                        <td className="px-4 py-3.5 text-gray-700 truncate max-w-44">{c?.name ?? "—"}</td>
                        <td className="px-4 py-3.5 text-right font-semibold text-gray-900 tabular-nums">{fmtMoney(d.amount, d.currency)}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-gray-700">{d.net_amount != null ? fmtMoney(d.net_amount, d.currency) : "—"}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-gray-600 hidden lg:table-cell">{d.platform_fee_amount != null ? fmtMoney(d.platform_fee_amount, d.currency) : "—"}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-gray-500 hidden xl:table-cell">{d.stripe_fee_amount != null ? fmtMoney(d.stripe_fee_amount, d.currency) : "—"}</td>
                        <td className="px-4 py-3.5"><Badge label={d.status} tone={STATUS_TONE[d.status] ?? "gray"} /></td>
                        <td className="px-4 py-3.5 text-right hidden lg:table-cell tabular-nums text-gray-600">{d.points_earned > 0 ? `+${d.points_earned}` : "—"}</td>
                        <td className="px-4 py-3.5 hidden xl:table-cell text-gray-600 whitespace-nowrap">{fmtDateTime(d.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pageSize={effectivePageSize} total={total} noun="donation" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} onPageSize={(s) => { setPageSize(s); setPage(0); }} onJump={(p) => setPage(p)} />
          </>
        )}
      </div>
    </>
  );
}
