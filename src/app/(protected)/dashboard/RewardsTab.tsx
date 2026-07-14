"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/services/supabase";
import { useRewardsRefreshKey } from "@/context/RewardsRealtimeContext";
import BoostTargetPicker, { type BoostOption } from "./BoostTargetPicker";
import type { RewardCatalogItem, RewardTransaction, RewardBadge } from "@/types/app";
import {
  Award, Lock, TrendingUp, Star, Sparkles, Megaphone, Palette,
  MessageSquare, ChefHat, CookingPot, Heart, Calendar, Gift, Trophy, Gem,
  Crown, Waves, Sunset, Circle, Medal, ShieldCheck,
  ArrowUpRight, ArrowDownRight, Loader2,
} from "lucide-react";

const TIER_ORDER = ["bronze", "silver", "gold", "platinum"];
const TIER_LABEL: Record<string, string> = { bronze: "Bronze", silver: "Silver", gold: "Gold", platinum: "Diamond" };
const TIER_COLOR: Record<string, string> = { bronze: "#92400E", silver: "#6B7280", gold: "#B45309", platinum: "#0E7490" };

// Category icon is the fallback; specific catalog items (e.g. each flair)
// override it via value_metadata.icon so visually-similar items in the same
// category (4 flairs) don't all render the same icon.
const CATEGORY_ICON: Record<string, typeof Star> = {
  profile_flair:   Palette,
  hub_post_boost:  Megaphone,
  recipe_boost:    Star,
  ai_power_up:     Sparkles,
};

const ICON_MAP: Record<string, typeof Star> = {
  MessageSquare, ChefHat, CookingPot, Heart, Calendar, Gift, Trophy, Award, Gem,
  Crown, Waves, Sunset, Circle, Medal, ShieldCheck,
};

interface Balance {
  reward_points: number;
  lifetime_points: number;
  reward_tier: string;
  next_tier: string | null;
  points_to_next_tier: number;
  current_tier_min_points: number;
  profile_flair: string | null;
}

// Mirrors the cap enforced server-side in redeem_reward (052) — shown here so
// users see the limit coming instead of hitting it blind.
const VELOCITY_LIMIT = 3;

function formatCountdown(ms: number): string {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export default function RewardsTab() {
  const { user } = useAuth();

  const [balance, setBalance]   = useState<Balance | null>(null);
  const [catalog, setCatalog]   = useState<RewardCatalogItem[]>([]);
  const [history, setHistory]   = useState<RewardTransaction[]>([]);
  const [allBadges, setAllBadges] = useState<RewardBadge[]>([]);
  const [earnedSlugs, setEarnedSlugs] = useState<Set<string>>(new Set());
  const [myRecipes, setMyRecipes] = useState<BoostOption[]>([]);
  const [myPosts, setMyPosts]     = useState<BoostOption[]>([]);
  const [loading, setLoading]   = useState(true);

  const [historyFilter, setHistoryFilter] = useState<"all" | "earned" | "spent">("all");
  const [targetByItem, setTargetByItem]   = useState<Record<string, string>>({});
  const [redeemingId, setRedeemingId]     = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
  const [recentRedemptionTimes, setRecentRedemptionTimes] = useState<string[]>([]);
  const [ownedCounts, setOwnedCounts] = useState<Record<string, number>>({});
  const [equippingId, setEquippingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!user) return;
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [balRes, catalogRes, histRes, badgesRes, allBadgesRes, recipesRes, postsRes, redemptionsRes, ownedRes] = await Promise.all([
        fetch("/api/rewards/balance").then((r) => r.json()),
        supabase.from("reward_catalog").select("*").eq("is_active", true).order("points_required"),
        fetch("/api/rewards/history").then((r) => r.json()),
        fetch("/api/rewards/badges").then((r) => r.json()),
        supabase.from("badges").select("slug, name, description, icon, category, sort_order").eq("is_active", true).order("sort_order"),
        supabase.from("recipes").select("id, title, cuisine, image_url").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("posts").select("id, content, media_urls, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("reward_redemptions").select("created_at").eq("user_id", user.id).gte("created_at", oneDayAgo).order("created_at", { ascending: true }),
        supabase.from("reward_redemptions").select("catalog_item_id").eq("user_id", user.id).in("status", ["pending", "fulfilled"]),
      ]);

      setBalance(balRes);
      setCatalog((catalogRes.data ?? []) as RewardCatalogItem[]);
      setHistory(histRes.transactions ?? []);
      setHasMoreHistory(histRes.hasMore ?? false);
      setAllBadges((allBadgesRes.data ?? []) as RewardBadge[]);
      setRecentRedemptionTimes((redemptionsRes.data ?? []).map((r: { created_at: string }) => r.created_at));
      setOwnedCounts(
        (ownedRes.data ?? []).reduce((acc: Record<string, number>, r: { catalog_item_id: string }) => {
          acc[r.catalog_item_id] = (acc[r.catalog_item_id] ?? 0) + 1;
          return acc;
        }, {})
      );
      setEarnedSlugs(new Set((badgesRes.badges ?? []).map((b: { badge_slug: string }) => b.badge_slug)));
      setMyRecipes((recipesRes.data ?? []).map((r: { id: string; title: string; cuisine: string | null; image_url: string | null }) => ({
        id: r.id, label: r.title, subtitle: r.cuisine ?? undefined, imageUrl: r.image_url,
      })));
      setMyPosts((postsRes.data ?? []).map((p: { id: string; content: string; media_urls: string[] | null; created_at: string }) => ({
        id: p.id,
        label: p.content.slice(0, 60) || "Untitled post",
        subtitle: new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        imageUrl: p.media_urls?.[0] ?? null,
      })));
    } catch (err) {
      console.error("Failed to load rewards tab:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const rewardsRefreshKey = useRewardsRefreshKey();
  useEffect(() => { loadAll(); }, [loadAll, rewardsRefreshKey]);

  async function loadMoreHistory() {
    if (history.length === 0) return;
    setLoadingMoreHistory(true);
    try {
      const oldest = history[history.length - 1].created_at;
      const res = await fetch(`/api/rewards/history?before=${encodeURIComponent(oldest)}`);
      const data = await res.json();
      setHistory((prev) => [...prev, ...(data.transactions ?? [])]);
      setHasMoreHistory(data.hasMore ?? false);
    } catch (err) {
      console.error("Failed to load more history:", err);
    } finally {
      setLoadingMoreHistory(false);
    }
  }

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(t);
  }, [feedback]);

  async function handleRedeem(item: RewardCatalogItem) {
    const needsTarget = item.category === "recipe_boost" || item.category === "hub_post_boost";
    const targetId = targetByItem[item.id];
    if (needsTarget && !targetId) {
      setFeedback({ type: "error", message: "Pick which one to boost first." });
      return;
    }

    if (recentRedemptionTimes.length >= VELOCITY_LIMIT) {
      setFeedback({ type: "error", message: `You've used all ${VELOCITY_LIMIT} redemptions for today — check back later.` });
      return;
    }

    setRedeemingId(item.id);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalogItemId: item.id, targetId: needsTarget ? targetId : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Redemption failed");
      setFeedback({ type: "success", message: `Redeemed: ${item.name}` });
      await loadAll();
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Redemption failed" });
    } finally {
      setRedeemingId(null);
    }
  }

  async function handleEquip(item: RewardCatalogItem) {
    setEquippingId(item.id);
    try {
      const res = await fetch("/api/rewards/equip-flair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catalogItemId: item.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Equip failed");
      setFeedback({ type: "success", message: `Equipped: ${item.name}` });
      await loadAll();
    } catch (err) {
      setFeedback({ type: "error", message: err instanceof Error ? err.message : "Equip failed" });
    } finally {
      setEquippingId(null);
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#F7E7CE]/40" />
      </div>
    );
  }

  const tier = balance?.reward_tier ?? "bronze";
  const currentTierIdx = TIER_ORDER.indexOf(tier);
  const earnedInTier = (balance?.lifetime_points ?? 0) - (balance?.current_tier_min_points ?? 0);
  const totalInTier  = earnedInTier + (balance?.points_to_next_tier ?? 0);
  const progress = balance?.next_tier && totalInTier > 0
    ? Math.max(0, Math.min(100, (earnedInTier / totalInTier) * 100))
    : 100;

  const filteredHistory = history.filter((h) =>
    historyFilter === "all" ? true : historyFilter === "earned" ? h.points > 0 : h.points < 0
  );

  const velocityUsed = recentRedemptionTimes.length;
  const velocityCapped = velocityUsed >= VELOCITY_LIMIT;
  // Cap resets on a rolling 24h window — frees up as soon as the oldest of
  // the 3 falls outside it, not at a fixed daily reset time.
  const nextSlotAt = velocityCapped
    ? new Date(new Date(recentRedemptionTimes[0]).getTime() + 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="relative">
      {feedback && (
        <div
          className="fixed top-20 right-4 z-50 px-4 py-3 text-sm font-bold shadow-lg border"
          style={{
            backgroundColor: feedback.type === "success" ? "#0A1C19" : "#2A1212",
            borderColor: feedback.type === "success" ? "#14B8A6" : "#EF4444",
            color: feedback.type === "success" ? "#14B8A6" : "#EF4444",
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Points summary */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-px bg-[#14B8A6]" />
          <span className="text-[#14B8A6] text-[10px] font-bold uppercase tracking-[0.3em]">Your Points</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]">
              {(balance?.reward_points ?? 0).toLocaleString()} <span className="text-[#F7E7CE]/40">pts</span>
            </h1>
            <p className="mt-2 text-sm text-[#F7E7CE]/40">Spendable balance — ready to redeem below</p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest self-start sm:self-auto border"
            style={{ backgroundColor: `${TIER_COLOR[tier]}20`, borderColor: `${TIER_COLOR[tier]}50`, color: TIER_COLOR[tier] }}
          >
            <Award className="w-3.5 h-3.5" />
            {TIER_LABEL[tier]} Member
          </span>
        </div>

        <div className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-6 md:p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#F7E7CE]/40">Tier Progress</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#14B8A6]" />
              <span className="text-sm font-bold text-[#14B8A6]">
                {balance?.next_tier
                  ? `${(balance.points_to_next_tier).toLocaleString()} pts to ${TIER_LABEL[balance.next_tier]}`
                  : "Max tier reached"}
              </span>
            </div>
          </div>

          <div className="h-2 mb-6 bg-[#F7E7CE]/10">
            <div className="h-full bg-[#14B8A6] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>

          <div className="grid grid-cols-4 gap-px bg-[#F7E7CE]/8">
            {TIER_ORDER.map((lvl, i) => {
              const unlocked = i <= currentTierIdx;
              return (
                <div key={lvl} className="py-4 px-2 text-center" style={{ backgroundColor: unlocked ? "#0A1C19" : "#102C26" }}>
                  <div
                    className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: unlocked ? TIER_COLOR[lvl] : "#F7E7CE10" }}
                  >
                    {unlocked ? <Star className="w-3.5 h-3.5 text-white" /> : <Lock className="w-3.5 h-3.5 text-[#F7E7CE]/20" />}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: unlocked ? "#F7E7CE" : "#F7E7CE30" }}>
                    {TIER_LABEL[lvl]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Redeem */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.3em]">Spend Your Points</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#F7E7CE]">
            Redeem <span className="text-[#F7E7CE]/40">Rewards</span>
          </h2>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border"
            style={{
              backgroundColor: velocityCapped ? "rgba(239,68,68,0.1)" : "rgba(20,184,166,0.1)",
              borderColor: velocityCapped ? "rgba(239,68,68,0.35)" : "rgba(20,184,166,0.35)",
              color: velocityCapped ? "#EF4444" : "#14B8A6",
            }}
            title="Max 3 redemptions per rolling 24 hours"
          >
            {velocityUsed}/{VELOCITY_LIMIT} redemptions today
            {velocityCapped && nextSlotAt && ` · next in ${formatCountdown(nextSlotAt.getTime() - Date.now())}`}
          </span>
        </div>

        <div className="grid gap-px grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#F7E7CE]/8">
          {catalog.map((item) => {
            const itemIconName = item.value_metadata?.icon;
            const Icon = (itemIconName && ICON_MAP[itemIconName]) || CATEGORY_ICON[item.category] || Star;
            const needsTarget = item.category === "recipe_boost" || item.category === "hub_post_boost";
            const options = item.category === "recipe_boost" ? myRecipes : item.category === "hub_post_boost" ? myPosts : [];
            const tierRank = TIER_ORDER.indexOf(item.min_tier_required);
            const tierLocked = currentTierIdx < tierRank;
            const cantAfford = (balance?.reward_points ?? 0) < item.points_required;
            const isFlair = item.category === "profile_flair";
            const owned = item.max_per_user != null && (ownedCounts[item.id] ?? 0) >= item.max_per_user;
            const equipped = isFlair && owned && balance?.profile_flair === item.value_metadata?.flair_slug;
            const disabled = tierLocked || cantAfford || velocityCapped || owned || (needsTarget && options.length === 0) || redeemingId === item.id;

            return (
              <div key={item.id} className="bg-[#0A1C19] p-6 flex flex-col">
                <div className="w-10 h-10 rounded-full bg-[#F7E7CE]/6 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-tighter text-[#F7E7CE] mb-2">{item.name}</h3>
                <p className="text-xs text-[#F7E7CE]/45 leading-relaxed mb-4 flex-1">{item.description}</p>

                {tierLocked && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#F7E7CE]/30 mb-3 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Requires {TIER_LABEL[item.min_tier_required]}
                  </p>
                )}

                {needsTarget && !tierLocked && (
                  options.length > 0 ? (
                    <BoostTargetPicker
                      options={options}
                      value={targetByItem[item.id] ?? ""}
                      onChange={(id) => setTargetByItem((prev) => ({ ...prev, [item.id]: id }))}
                      placeholder={`Choose ${item.category === "recipe_boost" ? "a recipe" : "a post"}…`}
                    />
                  ) : (
                    <p className="text-[10px] text-[#F7E7CE]/30 mb-3">
                      {item.category === "recipe_boost" ? "Upload a recipe first" : "Post in Hub first"}
                    </p>
                  )
                )}

                {isFlair && owned ? (
                  <button
                    onClick={() => handleEquip(item)}
                    disabled={equipped || equippingId === item.id}
                    className={
                      equipped || equippingId === item.id
                        ? "mt-auto h-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#F7E7CE]/20 text-[#F7E7CE]/40 opacity-60 cursor-not-allowed"
                        : "mt-auto h-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-[#14B8A6] text-[#0A1C19] hover:bg-[#0d9488] active:bg-[#0b7c72] transition-colors cursor-pointer"
                    }
                  >
                    {equippingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : equipped ? (
                      "Equipped"
                    ) : (
                      "Equip"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleRedeem(item)}
                    disabled={disabled}
                    className={
                      disabled
                        ? "mt-auto h-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#F7E7CE]/20 text-[#F7E7CE]/40 opacity-60 cursor-not-allowed"
                        : "mt-auto h-10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-[#14B8A6] text-[#0A1C19] hover:bg-[#0d9488] active:bg-[#0b7c72] transition-colors cursor-pointer"
                    }
                  >
                    {redeemingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : owned ? (
                      "Already claimed"
                    ) : velocityCapped && !tierLocked ? (
                      "Daily limit reached"
                    ) : (
                      <>{item.points_required.toLocaleString()} pts {cantAfford && !tierLocked ? "· Need more points" : ""}</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#14B8A6]" />
              <span className="text-[#14B8A6] text-[10px] font-bold uppercase tracking-[0.3em]">Ledger</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#F7E7CE]">
              Points <span className="text-[#F7E7CE]/40">History</span>
            </h2>
          </div>
          <div className="flex gap-1">
            {(["all", "earned", "spent"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setHistoryFilter(f)}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
                style={{
                  backgroundColor: historyFilter === f ? "#14B8A6" : "transparent",
                  color: historyFilter === f ? "#0A1C19" : "#F7E7CE60",
                  border: historyFilter === f ? "none" : "1px solid #F7E7CE20",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0A1C19] border border-[#F7E7CE]/8">
          {filteredHistory.length > 0 ? (
            <div className="divide-y divide-[#F7E7CE]/8">
              {filteredHistory.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: tx.points > 0 ? "#14B8A620" : "#EF444420" }}
                    >
                      {tx.points > 0
                        ? <ArrowUpRight className="w-4 h-4 text-[#14B8A6]" />
                        : <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#F7E7CE] truncate">{tx.description ?? tx.action}</p>
                      <p className="text-xs text-[#F7E7CE]/35 mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold" style={{ color: tx.points > 0 ? "#14B8A6" : "#EF4444" }}>
                      {tx.points > 0 ? "+" : ""}{tx.points}
                    </p>
                    {tx.balance_after !== null && (
                      <p className="text-[10px] text-[#F7E7CE]/30 mt-0.5">Balance: {tx.balance_after.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-sm text-[#F7E7CE]/40">No {historyFilter !== "all" ? historyFilter : ""} activity yet</div>
          )}
        </div>

        {hasMoreHistory && (
          <button
            onClick={loadMoreHistory}
            disabled={loadingMoreHistory}
            className="mt-3 w-full py-3 text-xs font-bold uppercase tracking-wider text-[#F7E7CE]/50 border border-[#F7E7CE]/15 hover:text-[#F7E7CE] hover:border-[#F7E7CE]/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingMoreHistory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Load more"}
          </button>
        )}
      </div>

      {/* Badges */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.3em]">Achievements</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#F7E7CE] mb-8">
          Your <span className="text-[#F7E7CE]/40">Badges</span>
        </h2>

        <div className="grid gap-px grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 bg-[#F7E7CE]/8">
          {allBadges.map((badge) => {
            const earned = earnedSlugs.has(badge.slug);
            const Icon = badge.icon ? (ICON_MAP[badge.icon] ?? Award) : Award;
            return (
              <div key={badge.slug} className="bg-[#0A1C19] p-5" style={{ opacity: earned ? 1 : 0.5 }}>
                <div
                  className="w-11 h-11 rounded-full mb-3 flex items-center justify-center"
                  style={{ backgroundColor: earned ? "#14B8A630" : "#F7E7CE08" }}
                >
                  <Icon className="w-5 h-5" style={{ color: earned ? "#14B8A6" : "#F7E7CE30" }} />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-tighter text-[#F7E7CE] mb-1">{badge.name}</h3>
                <p className="text-[11px] text-[#F7E7CE]/40 leading-relaxed mb-2">{badge.description}</p>
                {earned && <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#14B8A6]">Earned</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link href="/rewards" className="text-xs font-bold uppercase tracking-wider text-[#14B8A6] hover:text-[#F7E7CE] transition-colors">
          Visit the Charity &amp; Giving page →
        </Link>
      </div>
    </div>
  );
}
