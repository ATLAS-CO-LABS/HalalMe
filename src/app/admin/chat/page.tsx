"use client";
import { adminFetch, errorMessage } from "../_fetch";
import { adminKeys } from "../_query";

import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  RefreshCw, LifeBuoy, Inbox, Store, User as UserIcon,
  Clock, MessageCircle, UserCheck, Search,
} from "lucide-react";
import { display } from "../_fonts";
import {
  useToast, ToastView, StatCard, TableSkeleton, EmptyState, Pagination, FilterPills, Badge, LoadError,
} from "../_ui";
import { rememberList } from "@/lib/adminRecordNav";

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

interface ConversationsPayload {
  conversations: Conversation[];
  stats: Stats;
  total: number;
  pageSize: number;
}

const NO_ROWS: Conversation[] = [];

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
  const [page, setPage] = useState(0);
  // The size we ASK for. The server may clamp it; its answer is read back out of
  // the query data below for display only, and never written here — writing it
  // back would change the query key on every fetch and loop forever.
  const [pageSize, setPageSize] = useState(25);

  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");
  const [assigned, setAssigned] = useState("all");
  const [search, setSearch] = useState("");
  // `search` is what the input shows; `debouncedSearch` is what the query key
  // uses. The key is the dependency now, so the debounce has to gate the key
  // rather than gate a fetch call.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: adminKeys.list("support", { page, pageSize, status, source, assigned, search: debouncedSearch }),
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (status !== "all") params.set("status", status);
      if (source !== "all") params.set("source", source);
      if (assigned !== "all") params.set("assigned", assigned);
      if (debouncedSearch) params.set("search", debouncedSearch);
      return adminFetch<ConversationsPayload>(`/api/admin/support/conversations?${params}`);
    },
    // Near-live inbox. Replaces the old 25s setInterval plus focus listener:
    // TanStack pauses this while the tab is hidden, and the global
    // refetchOnWindowFocus covers the come-back-to-the-tab case.
    refetchInterval: 25_000,
    // Paging should not blank the table back to a skeleton.
    placeholderData: keepPreviousData,
  });

  const rows = query.data?.conversations ?? NO_ROWS;
  const stats = query.data?.stats ?? null;
  const total = query.data?.total ?? 0;
  const effectivePageSize = query.data?.pageSize ?? pageSize;
  // isLoading is the first load only, so background refetches no longer flash
  // the skeleton — that is what the old `silent` flag was hand-rolling.
  const loading = query.isLoading;
  const error = query.isError ? errorMessage(query.error, "Could not load conversations. Try refreshing.") : null;

  // Changing a filter resets to page 1. Done in the handlers rather than an
  // effect watching the filters: the reset is a consequence of the click, not
  // something to discover on a later render.
  const changeStatus = (v: string) => { setStatus(v); setPage(0); };
  const changeSource = (v: string) => { setSource(v); setPage(0); };
  const changeAssigned = (v: string) => { setAssigned(v); setPage(0); };

  // Feeds the prev/next stepper on the thread page. v5 removed onSuccess from
  // useQuery, so this side effect lives in an effect on the data instead.
  useEffect(() => {
    if (query.data?.conversations) {
      rememberList("support", query.data.conversations.map((c) => c.id));
    }
  }, [query.data]);

  function handleSearchChange(val: string) {
    setSearch(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(0); setDebouncedSearch(val); }, 300);
  }

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
        <button onClick={() => void query.refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={query.isFetching ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="px-4 sm:px-8 pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Open" value={stats?.open ?? "—"} sub="Awaiting reply" icon={Inbox} tone="amber" />
          <StatCard label="Pending" value={stats?.pending ?? "—"} sub="Awaiting requester" icon={MessageCircle} tone="blue" />
          <StatCard label="Unassigned" value={stats?.unassigned ?? "—"} sub="Open / pending, no owner" icon={UserCheck} tone="red" />
        </div>
      </div>

      {/* Main */}
      <div className="px-4 sm:px-8 py-5">
        <div className="bg-white rounded-none border border-[#102C26]/12 overflow-hidden">
          {/* Filters */}
          <div className="px-4 sm:px-5 pt-3 pb-3 border-b border-[#102C26]/8 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <FilterPills options={STATUS_FILTERS} value={status} onChange={changeStatus} />
              <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
              <FilterPills options={SOURCE_FILTERS} value={source} onChange={changeSource} />
              <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />
              <FilterPills options={ASSIGNED_FILTERS} value={assigned} onChange={changeAssigned} />
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input type="text" value={search} onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by subject, requester or delivery ref…"
                className="w-full pl-8 pr-4 py-2 text-sm text-gray-900 border border-gray-200 bg-gray-50 rounded-none focus:outline-none focus:ring-2 focus:ring-[#102C26]/15 focus:border-[#102C26] focus:bg-white placeholder:text-gray-500 transition-colors" />
            </div>
          </div>

          {error ? (
            <LoadError message={error} onRetry={() => void query.refetch()} compact />
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
              <Pagination page={page} pageSize={effectivePageSize} total={total} noun="conversation" onPrev={() => setPage((p) => Math.max(0, p - 1))} onNext={() => setPage((p) => p + 1)} onPageSize={(s) => { setPageSize(s); setPage(0); }} onJump={(p) => setPage(p)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
