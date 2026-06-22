"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw, AlertCircle, Store, Users, Gift, ChefHat, MessageSquare,
  TrendingUp, BadgeCheck, Star, Bot, Heart, MessageCircle, Timer,
} from "lucide-react";
import { display } from "../_fonts";
import { StatCard, FilterPills, fmtMoney } from "../_ui";
import { ChartCard, TimeSeries, BarList, Donut, Funnel } from "./_charts";

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

const FOREST = "#102C26", AMBER = "#F59E0B", MUTED = "#9CA3AF";

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
];

function days(n: number | null | undefined) {
  return n === null || n === undefined ? "—" : `${n}d`;
}

export default function AnalyticsPage() {
  const [section, setSection] = useState("merchants");
  const [range, setRange] = useState("30d");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(sec: string, rng: string) {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?section=${sec}&range=${rng}`);
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch {
      setError("Could not load analytics. Try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(section, range); }, [section, range]);

  const s = data?.stats ?? {};

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
        <button onClick={() => load(section, range)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#102C26]/80 bg-[#102C26]/5 border border-[#102C26]/15 rounded-none hover:bg-[#102C26]/10 transition-colors" title="Refresh">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Section tabs + range */}
      <div className="px-4 sm:px-8 pt-4 flex items-center justify-between gap-3 flex-wrap">
        <FilterPills options={SECTIONS.map(({ key, label }) => ({ key, label }))} value={section} onChange={setSection} />
        <FilterPills options={RANGES} value={range} onChange={setRange} />
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
                  <ChartCard title="Current Status" subtitle="Where merchants sit right now">
                    <BarList data={data.byStatus ?? []} />
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
                  <StatCard label="New (this range)" value={s.newInRange ?? "—"} sub="Signups in period" icon={TrendingUp} tone="green" />
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
                        { label: "Unverified", value: data.verification?.[1]?.value ?? 0, color: MUTED },
                      ]}
                      centerValue={`${s.verifiedPct ?? 0}%`} centerLabel="Verified"
                    />
                  </ChartCard>
                  <ChartCard title="Roles" subtitle="Account types">
                    <BarList data={data.roleBreakdown ?? []} />
                  </ChartCard>
                </div>
              </>
            )}

            {/* ── REWARDS ── */}
            {section === "rewards" && data && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard label="Raised (range)" value={fmtMoney(s.totalRaised ?? 0)} sub="Completed donations" icon={Gift} tone="green" />
                  <StatCard label="Donations" value={s.donationCount ?? "—"} sub="In period" icon={Heart} tone="purple" />
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
                  <StatCard label="AI Sessions" value={s.aiSessions ?? "—"} sub="In period" icon={Bot} tone="purple" />
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
