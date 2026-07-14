"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw, AlertCircle, Store, Users, Gift, ChefHat, MessageSquare,
  TrendingUp, BadgeCheck, Star, Bot, Heart, MessageCircle, Timer, Download,
} from "lucide-react";
import { display } from "../_fonts";
import { StatCard, FilterPills, fmtMoney, DateRange } from "../_ui";
import { ChartCard, TimeSeries, BarList, Donut, Funnel, CHART_COLORS, ORDINAL_GREEN } from "./_charts";

type Point = { label: string; value: number };
interface Data {
  funnel?: Point[]; byStatus?: Point[]; addedOverTime?: Point[];
  avgDays?: { toInvited: number | null; toContacted: number | null; toLive: number | null };
  signups?: Point[]; roleBreakdown?: Point[]; verification?: Point[];
  raisedOverTime?: Point[]; topCharities?: Point[]; points?: Point[];
  publishedOverTime?: Point[]; source?: Point[]; mostViewed?: Point[];
  postsOverTime?: Point[]; mostFollowed?: Point[];
  stats?: Record<string, number>;
}

// Validated categorical palette (see _charts.tsx) — green/amber are brand-derived,
// blue/magenta extend it for charts that need a 3rd/4th distinct hue.
const { green: FOREST, amber: AMBER } = CHART_COLORS;

const SECTIONS = [
  { key: "merchants", label: "Merchants", icon: Store },
  { key: "users", label: "Users", icon: Users },
  { key: "rewards", label: "Rewards", icon: Gift },
  { key: "kitchen", label: "Kitchen", icon: ChefHat },
  { key: "hub", label: "Hub", icon: MessageSquare },
];
const RANGES = [
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom" },
];

function days(n: number | null | undefined) {
  return n === null || n === undefined ? "—" : `${n}d`;
}

// Percentage change current-vs-previous; null when there's nothing to compare
// (all-time range, or no previous-period value supplied).
function pctDelta(cur: number | undefined, prev: number | undefined, comparable: boolean): number | null {
  if (!comparable || cur === undefined || prev === undefined) return null;
  if (prev === 0) return cur === 0 ? 0 : 100;
  return Math.round(((cur - prev) / prev) * 100);
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function AnalyticsPage() {
  const [section, setSection] = useState("merchants");
  const [range, setRange] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(sec: string, rng: string, from = "", to = "") {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ section: sec, range: rng });
      if (rng === "custom") {
        if (from) params.set("from", from);
        if (to) params.set("to", to);
      }
      const res = await fetch(`/api/admin/analytics?${params}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError("Could not load analytics. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(section, range, customFrom, customTo); }, [section, range, customFrom, customTo]);

  const s = data?.stats ?? {};
  const comparable = range !== "all"; // all-time has no comparable prior window

  // Export the loaded section's stats + every {label,value} series to CSV.
  function exportCSV() {
    if (!data) return;
    const lines: string[] = [];
    lines.push(`Section,${section}`);
    lines.push(`Range,${range}`);
    lines.push("");
    lines.push("Metric,Value");
    for (const [k, v] of Object.entries(data.stats ?? {})) lines.push(`${csvCell(k)},${csvCell(v)}`);
    for (const [key, val] of Object.entries(data)) {
      if (key === "stats" || !Array.isArray(val)) continue;
      const points = val as Point[];
      if (points.length === 0 || typeof points[0]?.label === "undefined") continue;
      lines.push("");
      lines.push(`${key}`);
      lines.push("Label,Value");
      for (const p of points) lines.push(`${csvCell(p.label)},${csvCell(p.value)}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${section}-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    // Record the export in the audit log — fire-and-forget.
    fetch("/api/admin/exports", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resource: "analytics", scope: `${section} · ${range}` }) }).catch(() => {});
  }

  return (
    <div className="bg-[#F3E9D6] min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-[#102C26]/12 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-5 h-px bg-[#F59E0B]" />
            <span className="text-[#F59E0B] text-[9px] font-bold uppercase tracking-[0.3em]">Intelligence</span>
          </div>
          <h1 className={`${display.className} text-xl sm:text-2xl font-extrabold uppercase tracking-tighter text-[#102C26] leading-none`}>Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Trends and KPIs across the platform</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={exportCSV} disabled={!data || loading}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors disabled:opacity-50">
            <Download size={14} /> <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => load(section, range, customFrom, customTo)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Section tabs + range */}
      <div className="px-4 sm:px-8 pt-4 flex items-center justify-between gap-3 flex-wrap">
        <FilterPills options={SECTIONS.map(({ key, label }) => ({ key, label }))} value={section} onChange={setSection} />
        <div className="flex items-center gap-3 flex-wrap">
          {range === "custom" && (
            <DateRange from={customFrom} to={customTo} onChange={(f, t) => { setCustomFrom(f); setCustomTo(t); }} label="Range" />
          )}
          <FilterPills options={RANGES} value={range} onChange={setRange} />
        </div>
      </div>

      <div className="px-4 sm:px-8 py-5 space-y-5">
        {error ? (
          <div className="flex items-center gap-3 px-4 py-4 bg-red-50 border border-red-100 rounded-none text-red-700 text-sm font-medium"><AlertCircle size={16} /> {error}</div>
        ) : loading ? (
          <div className="animate-pulse space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white border border-[#102C26]/10 rounded-none" />)}</div>
            <div className="grid lg:grid-cols-2 gap-5">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-64 bg-white border border-[#102C26]/10 rounded-none" />)}</div>
          </div>
        ) : (
          <>
            {/* ── MERCHANTS ── */}
            {section === "merchants" && data && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard label="Total Merchants" value={s.total ?? "—"} sub="All in pipeline" icon={Store} tone="blue" />
                  <StatCard label="Live" value={s.live ?? "—"} sub={`${s.liveRate ?? 0}% of total`} icon={BadgeCheck} tone="green" />
                  <StatCard label="Avg Days to Contact" value={days(data.avgDays?.toContacted)} sub="Invited → contacted" icon={Timer} tone="amber" />
                  <StatCard label="Avg Days to Live" value={days(data.avgDays?.toLive)} sub="Contacted → live" icon={Timer} tone="purple" />
                </div>
                <div className="grid lg:grid-cols-2 gap-5">
                  <ChartCard title="Pipeline Funnel" subtitle="Merchants reaching each stage (lifecycle)">
                    <Funnel stages={data.funnel ?? []} />
                  </ChartCard>
                  <ChartCard title="Current Status" subtitle="Where merchants sit right now (pipeline order)">
                    <BarList data={data.byStatus ?? []} colors={ORDINAL_GREEN} />
                  </ChartCard>
                </div>
                <ChartCard title="Merchants Added" subtitle="New merchant records over time">
                  <TimeSeries data={data.addedOverTime ?? []} color={FOREST} />
                </ChartCard>
              </>
            )}

            {/* ── USERS ── */}
            {section === "users" && data && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <StatCard label="Total Users" value={s.total ?? "—"} sub="All accounts" icon={Users} tone="blue" />
                  <StatCard label="New (this range)" value={s.newInRange ?? "—"} sub="Signups in period" icon={TrendingUp} tone="green" deltaPct={pctDelta(s.newInRange, s.newInPrev, comparable)} />
                  <StatCard label="Verified" value={`${s.verifiedPct ?? 0}%`} sub="Of all users" icon={BadgeCheck} tone="purple" />
                </div>
                <ChartCard title="Signups" subtitle="New accounts over time">
                  <TimeSeries data={data.signups ?? []} color={AMBER} />
                </ChartCard>
                <div className="grid lg:grid-cols-2 gap-5">
                  <ChartCard title="Verification" subtitle="Verified vs unverified">
                    <Donut
                      segments={[
                        { label: "Verified", value: data.verification?.[0]?.value ?? 0, color: FOREST },
                        { label: "Unverified", value: data.verification?.[1]?.value ?? 0, color: "#9CA3AF" },
                      ]}
                      centerValue={`${s.verifiedPct ?? 0}%`} centerLabel="Verified"
                    />
                  </ChartCard>
                  <ChartCard title="Roles" subtitle="Account types (by privilege level)">
                    <BarList data={data.roleBreakdown ?? []} colors={ORDINAL_GREEN} />
                  </ChartCard>
                </div>
              </>
            )}

            {/* ── REWARDS ── */}
            {section === "rewards" && data && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard label="Raised (range)" value={fmtMoney(s.totalRaised ?? 0)} sub="Completed donations" icon={Gift} tone="green" deltaPct={pctDelta(s.totalRaised, s.totalRaisedPrev, comparable)} />
                  <StatCard label="Donations" value={s.donationCount ?? "—"} sub="In period" icon={Heart} tone="purple" deltaPct={pctDelta(s.donationCount, s.donationCountPrev, comparable)} />
                  <StatCard label="Avg Donation" value={fmtMoney(s.avgDonation ?? 0)} sub="Per donation" icon={TrendingUp} tone="blue" />
                  <StatCard label="Points Earned" value={(data.points?.[0]?.value ?? 0).toLocaleString()} sub={`${(data.points?.[1]?.value ?? 0).toLocaleString()} redeemed`} icon={Star} tone="amber" />
                </div>
                <ChartCard title="Raised Over Time" subtitle="Completed donation value">
                  <TimeSeries data={data.raisedOverTime ?? []} color={FOREST} format={(n) => fmtMoney(n)} />
                </ChartCard>
                <ChartCard title="Top Charities" subtitle="By total raised (lifecycle)">
                  <BarList data={data.topCharities ?? []} color={AMBER} format={(n) => fmtMoney(n)} />
                </ChartCard>
              </>
            )}

            {/* ── KITCHEN ── */}
            {section === "kitchen" && data && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard label="Total Recipes" value={s.total ?? "—"} sub={`${s.published ?? 0} published`} icon={ChefHat} tone="blue" />
                  <StatCard label="Avg Rating" value={s.avgRating ?? "—"} sub="Rated recipes" icon={Star} tone="amber" />
                  <StatCard label="AI Sessions" value={s.aiSessions ?? "—"} sub="In period" icon={Bot} tone="purple" deltaPct={pctDelta(s.aiSessions, s.aiSessionsPrev, comparable)} />
                  <StatCard label="Session → Recipe" value={`${s.sessionConversion ?? 0}%`} sub="Produced a recipe" icon={TrendingUp} tone="green" />
                </div>
                <ChartCard title="Recipes Published" subtitle="Published recipes over time">
                  <TimeSeries data={data.publishedOverTime ?? []} color={AMBER} />
                </ChartCard>
                <div className="grid lg:grid-cols-2 gap-5">
                  <ChartCard title="Source" subtitle="AI vs user-submitted">
                    <Donut
                      segments={[
                        { label: "AI-generated", value: data.source?.[0]?.value ?? 0, color: AMBER },
                        { label: "User-submitted", value: data.source?.[1]?.value ?? 0, color: FOREST },
                      ]}
                    />
                  </ChartCard>
                  <ChartCard title="Most Viewed" subtitle="Top recipes by views">
                    <BarList data={data.mostViewed ?? []} />
                  </ChartCard>
                </div>
              </>
            )}

            {/* ── HUB ── */}
            {section === "hub" && data && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <StatCard label="Total Posts" value={s.total ?? "—"} sub="All posts" icon={MessageSquare} tone="blue" />
                  <StatCard label="Avg Likes / Post" value={s.avgLikes ?? "—"} sub="Engagement" icon={Heart} tone="purple" />
                  <StatCard label="Avg Comments / Post" value={s.avgComments ?? "—"} sub="Engagement" icon={MessageCircle} tone="amber" />
                </div>
                <ChartCard title="Posts Over Time" subtitle="New posts in the period">
                  <TimeSeries data={data.postsOverTime ?? []} color={AMBER} />
                </ChartCard>
                <ChartCard title="Most Followed" subtitle="Top users by followers">
                  <BarList data={data.mostFollowed ?? []} color={AMBER} />
                </ChartCard>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
