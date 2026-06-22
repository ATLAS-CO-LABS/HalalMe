"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  RefreshCw, AlertCircle, LifeBuoy, Inbox, Store, User as UserIcon,
  Clock, MessageCircle, UserCheck,
} from "lucide-react";
import { display } from "../_fonts";
import {
  useToast, ToastView, StatCard, TableSkeleton, EmptyState, Pagination, FilterPills, Badge,
} from "../_ui";

type Ref = { id: string; full_name?: string | null; username?: string | null; avatar_url?: string | null; email?: string | null };
type MerchantRef = { id: string; name: string };
function one<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
}

interface Conversation {
  id: string;
  subject: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
  delivery_reference: string | null;
  last_message_at: string;
  created_at: string;
  last_message: string;
  requester_email: string | null;
  requester_name: string | null;
  requester: Ref | Ref[] | null;
  assignee: Ref | Ref[] | null;
  merchant: MerchantRef | MerchantRef[] | null;
}
interface Stats { open: number; pending: number; unassigned: number; }

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "pending", label: "Pending" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];
const SOURCE_FILTERS = [
  { key: "all", label: "All" },
  { key: "user", label: "Users" },
  { key: "merchant", label: "Merchants" },
];
const ASSIGNED_FILTERS = [
  { key: "all", label: "All" },
  { key: "me", label: "Mine" },
  { key: "unassigned", label: "Unassigned" },
];

const STATUS_TONE: Record<Conversation["status"], "amber" | "blue" | "green" | "gray"> = {
  open: "amber",
  pending: "blue",
  resolved: "green",
  closed: "gray",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminChatPage() {
  const { toast } = useToast();
  const [rows, setRows] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [assigned, setAssigned] = useState("all");

  async function fetchRows(p: number, st: string, sr: string, asg: string, silent = false) {
    if (!silent) { setLoading(true); setError(null); }
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (st !== "all") params.set("status", st);
      if (sr !== "all") params.set("source", sr);
      if (asg !== "all") params.set("assigned", asg);
      const res = await fetch(`/api/admin/support/conversations?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setRows(json.conversations); setStats(json.stats); setTotal(json.total); setPageSize(json.pageSize);
    } catch {
      setError("Could not load conversations. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows(page, status, source, assigned);
  }, [page, status, source, assigned]);
  useEffect(() => { setPage(0); }, [status, source, assigned]);

  // Near-live inbox: silent refetch every 25s and when the tab regains focus.
  useEffect(() => {
    const tick = () => { if (!document.hidden) fetchRows(page, status, source, assigned, true); };
    const interval = setInterval(tick, 25000);
    window.addEventListener("focus", tick);
    return () => { clearInterval(interval); window.removeEventListener("focus", tick); };
  }, [page, status, source, assigned]);

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      <ToastView toast={toast} />

      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-5 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">Support Inbox</span>
          </div>
          <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>Support</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Respond to user and merchant support conversations</p>
        </div>
        <button onClick={() => fetchRows(page, status, source, assigned)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="px-4 sm:px-8 pt-5">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Open" value={stats?.open ?? "—"} sub="Awaiting reply" icon={Inbox} tone="amber" />
          <StatCard label="Pending" value={stats?.pending ?? "—"} sub="Awaiting requester" icon={MessageCircle} tone="blue" />
          <StatCard label="Unassigned" value={stats?.unassigned ?? "—"} sub="Open / pending, no owner" icon={UserCheck} tone="red" />
        </div>
      </div>

      {/* Main */}
      <div className="px-4 sm:px-8 py-5">
        <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
          {/* Filters */}
          <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 flex items-center gap-2 flex-wrap">
            <FilterPills options={STATUS_FILTERS} value={status} onChange={setStatus} />
            <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
            <FilterPills options={SOURCE_FILTERS} value={source} onChange={setSource} />
            <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
            <FilterPills options={ASSIGNED_FILTERS} value={assigned} onChange={setAssigned} />
          </div>

          {error ? (
            <div className="flex items-center gap-3 m-4 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
          ) : loading ? <TableSkeleton /> : rows.length === 0 ? (
            <EmptyState icon={LifeBuoy} title="No conversations" hint="Support messages from users and merchants will appear here." />
          ) : (
            <>
              <div className="divide-y divide-[#102C26]/8">
                {rows.map((c) => {
                  const r = one(c.requester);
                  const m = one(c.merchant);
                  const a = one(c.assignee);
                  const isMerchant = !!m;
                  const isGuest = !isMerchant && !r;
                  const name = isMerchant
                    ? m!.name
                    : r
                      ? (r.full_name ?? (r.username ? `@${r.username}` : r.email ?? "Unknown"))
                      : (c.requester_name ?? c.requester_email ?? "Guest");
                  return (
                    <Link key={c.id} href={`/admin/chat/${c.id}`} className="flex items-start gap-4 px-4 sm:px-5 py-4 hover:bg-[#102C26]/2 transition-colors">
                      {/* Source icon */}
                      <div className={`mt-0.5 w-9 h-9 rounded-none flex items-center justify-center shrink-0 ${isMerchant ? "bg-[#F59E0B]/10 text-[#F59E0B]" : "bg-[#102C26]/8 text-[#102C26]"}`}>
                        {isMerchant ? <Store size={16} /> : <UserIcon size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="font-semibold text-gray-900 truncate max-w-64">{c.subject}</span>
                          <Badge label={c.status} tone={STATUS_TONE[c.status]} />
                          {c.priority === "high" && <Badge label="High" tone="red" />}
                          {c.delivery_reference && <Badge label="Delivery" tone="purple" />}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{c.last_message || "—"}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {name}{isMerchant ? " · Merchant" : isGuest ? " · Guest" : ""}{a?.full_name ? ` · Assigned to ${a.full_name}` : " · Unassigned"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap"><Clock size={11} /> {relativeTime(c.last_message_at)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Pagination page={page} pageSize={pageSize} total={total} noun="conversation" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
