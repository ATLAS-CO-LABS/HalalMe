"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users, Store, ChefHat, Gift, LifeBuoy, ShieldAlert, AlertTriangle,
  UserPlus, Heart, ArrowRight, Clock, CheckCircle2, MessageSquare, RotateCcw, ShieldCheck,
} from "lucide-react";
import { display } from "./_fonts";
import { StatCard, fmtMoney } from "./_ui";

interface Overview {
  name: string | null;
  stats: {
    users?: { total: number; newThisWeek: number };
    merchants?: { total: number; needsAttention: number };
    kitchen?: { total: number; pendingHalal: number };
    rewards?: { totalRaised: number; pendingApplications: number };
    fraud?: { pending: number };
    support?: { open: number };
  };
  needsAttention: { id: string; label: string; detail: string; href: string; severity: "warn" | "urgent" }[];
  recent: { type: string; label: string; detail: string; at: string }[];
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Icon + tint per activity type. Falls back to a neutral clock for unknown types.
const ACTIVITY_STYLE: Record<string, { icon: React.ElementType; cls: string }> = {
  user: { icon: UserPlus, cls: "bg-[#102C26]/8 text-[#102C26]" },
  merchant: { icon: Store, cls: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  donation: { icon: Heart, cls: "bg-[#F03E9E]/10 text-[#F03E9E]" },
  recipe: { icon: ChefHat, cls: "bg-green-50 text-green-600" },
  post: { icon: MessageSquare, cls: "bg-[#102C26]/8 text-[#102C26]" },
  charity: { icon: Gift, cls: "bg-[#F03E9E]/10 text-[#F03E9E]" },
  application: { icon: ShieldCheck, cls: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  refund: { icon: RotateCcw, cls: "bg-amber-50 text-amber-600" },
  fraud: { icon: ShieldAlert, cls: "bg-red-50 text-red-600" },
  ticket: { icon: LifeBuoy, cls: "bg-[#102C26]/8 text-[#102C26]" },
};
const FALLBACK_STYLE = { icon: Clock, cls: "bg-[#102C26]/6 text-[#102C26]/60" };

export default function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats ?? {};

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="w-5 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">Dashboard</span>
        </div>
        <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>
          {data?.name ? `Welcome, ${data.name.split(" ")[0]}` : "Overview"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">What needs your attention across the platform</p>
      </div>

      {loading ? (
        <div className="px-4 sm:px-8 py-5 animate-pulse space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white border border-[#102C26]/10 rounded-none" />)}</div>
          <div className="grid lg:grid-cols-2 gap-5">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-64 bg-white border border-[#102C26]/10 rounded-none" />)}</div>
        </div>
      ) : (
        <div className="px-4 sm:px-8 py-5 space-y-5">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {s.users && (
              <Link href="/admin/users"><StatCard label="Total Users" value={s.users.total} sub={`+${s.users.newThisWeek} this week`} icon={Users} tone="blue" /></Link>
            )}
            {s.merchants && (
              <Link href="/admin/merchants"><StatCard label="Merchants" value={s.merchants.total} sub={`${s.merchants.needsAttention} need attention`} icon={Store} tone="amber" /></Link>
            )}
            {s.kitchen && (
              <Link href="/admin/kitchen"><StatCard label="Recipes" value={s.kitchen.total} sub={`${s.kitchen.pendingHalal} pending halal`} icon={ChefHat} tone="green" /></Link>
            )}
            {s.rewards && (
              <Link href="/admin/rewards"><StatCard label="Total Raised" value={fmtMoney(s.rewards.totalRaised)} sub={`${s.rewards.pendingApplications} apps pending`} icon={Gift} tone="purple" /></Link>
            )}
            {s.support && (
              <Link href="/admin/chat"><StatCard label="Open Tickets" value={s.support.open} sub="Awaiting action" icon={LifeBuoy} tone="blue" /></Link>
            )}
            {s.fraud && (
              <Link href="/admin/rewards"><StatCard label="Fraud Flags" value={s.fraud.pending} sub="Pending review" icon={ShieldAlert} tone="red" /></Link>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            {/* Needs attention */}
            <div className="bg-white rounded-none border border-[#102C26]/12">
              <div className="px-5 py-4 border-b border-[#102C26]/8 flex items-center gap-2">
                <AlertTriangle size={15} className="text-[#F59E0B]" />
                <h2 className={`${display.className} text-sm font-bold uppercase tracking-tight text-[#102C26]`}>Needs Attention</h2>
              </div>
              {data && data.needsAttention.length > 0 ? (
                <div className="divide-y divide-[#102C26]/8">
                  {data.needsAttention.map((n) => (
                    <Link key={n.id} href={n.href} className="flex items-center gap-3 px-5 py-3 hover:bg-[#102C26]/2 transition-colors group">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${n.severity === "urgent" ? "bg-red-500" : "bg-[#F59E0B]"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{n.label}</p>
                        <p className="text-xs text-gray-500 truncate">{n.detail}</p>
                      </div>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#102C26] transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <CheckCircle2 size={26} className="text-green-500 mb-2" />
                  <p className="text-sm text-gray-600 font-medium">All clear</p>
                  <p className="text-xs text-gray-400 mt-0.5">Nothing needs attention right now</p>
                </div>
              )}
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-none border border-[#102C26]/12">
              <div className="px-5 py-4 border-b border-[#102C26]/8 flex items-center gap-2">
                <Clock size={15} className="text-[#102C26]/60" />
                <h2 className={`${display.className} text-sm font-bold uppercase tracking-tight text-[#102C26]`}>Recent Activity</h2>
              </div>
              {data && data.recent.length > 0 ? (
                <div className="divide-y divide-[#102C26]/8">
                  {data.recent.map((r, i) => {
                    const { icon: Icon, cls } = ACTIVITY_STYLE[r.type] ?? FALLBACK_STYLE;
                    return (
                      <div key={i} className="flex items-center gap-3 px-5 py-3">
                        <div className={`w-8 h-8 rounded-none flex items-center justify-center shrink-0 ${cls}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-gray-900 truncate"><span className="font-medium">{r.label}</span> <span className="text-gray-500">{r.detail}</span></p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{relativeTime(r.at)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center py-14 text-sm text-gray-400">No recent activity</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
