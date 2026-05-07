"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Gift,
  Star,
  Trophy,
  Heart,
  Calendar,
  TrendingUp,
  Award,
  Lock,
} from "lucide-react";
import Header from "@/components/layout/Header";
import { rewardsService } from "@/services/rewardsService";
import { useAuth } from "@/hooks/useAuth";
import type { Donation, UserBadge } from "@/types/app";
import AuthGuard from "@/components/auth/AuthGuard";

const BG    = "#0F1F17";
const BG2   = "#162B20";
const CREAM = "#F7E7CE";
const TEAL  = "#14B8A6";
const DEEP  = "#0D9488";

interface RewardBalance {
  reward_points:           number;
  reward_tier:             string;
  next_tier:               string | null;
  points_to_next_tier:     number;
  current_tier_min_points: number;
  ai_requests_per_hour:    number;
  donation_points_per_gbp: number;
}

// Display data only - no tier threshold logic (that lives in the DB/API)
const TIER_DISPLAY: Record<string, { bg: string }> = {
  bronze:   { bg: "#92400E" },
  silver:   { bg: "#6B7280" },
  gold:     { bg: "#B45309" },
  platinum: { bg: "#0E7490" },
};
const LEVEL_ORDER = ["bronze", "silver", "gold", "platinum"];

const STATIC_BADGES = [
  { id: "first-giver",  name: "First Giver",     description: "Made your first donation", icon: Heart,    accent: "#EC4899" },
  { id: "consistent",   name: "Consistent Giver", description: "Donated 5 times",         icon: Calendar, accent: "#3B82F6" },
  { id: "generous",     name: "Generous Heart",   description: "Donated £100 total",       icon: Gift,     accent: "#8B5CF6" },
  { id: "champion",     name: "Charity Champion", description: "Reached Gold status",      icon: Trophy,   accent: "#F59E0B" },
];

export default function MyRewardsPage() {
  const { user } = useAuth();

  const [balance, setBalance]               = useState<RewardBalance | null>(null);
  const [donations, setDonations]           = useState<Donation[]>([]);
  const [donationCount, setDonationCount]   = useState(0);
  const [totalDonated, setTotalDonated]     = useState(0);
  const [earnedBadgeSlugs, setEarnedBadgeSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [bal, don, total, badgesRes] = await Promise.all([
          fetch("/api/rewards/balance").then((r) => r.json()),
          rewardsService.getUserDonations(user!.id),
          rewardsService.getTotalDonated(user!.id),
          fetch("/api/rewards/badges").then((r) => r.json()),
        ]);
        setBalance(bal);

        const allCompleted = don.filter((d: Donation) => d.status === "completed");
        setDonationCount(allCompleted.length);
        setDonations(allCompleted.slice(0, 5));

        setTotalDonated(total);

        const slugs: string[] = (badgesRes.badges ?? []).map((b: UserBadge) => b.badge_slug);
        setEarnedBadgeSlugs(new Set(slugs));
      } catch (err) {
        console.error("Failed to load rewards:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const totalPoints     = balance?.reward_points ?? 0;
  const tier            = balance?.reward_tier ?? "bronze";
  const currentTierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const nextTierName    = balance?.next_tier
    ? balance.next_tier.charAt(0).toUpperCase() + balance.next_tier.slice(1)
    : null;
  const pointsToNext    = balance?.points_to_next_tier ?? 0;

  // Progress bar - computed from API data, no hardcoded thresholds
  const earnedInTier = totalPoints - (balance?.current_tier_min_points ?? 0);
  const totalInTier  = earnedInTier + pointsToNext;
  const progress     = nextTierName && totalInTier > 0
    ? Math.max(0, Math.min(100, (earnedInTier / totalInTier) * 100))
    : 100;

  const currentLvlIdx = LEVEL_ORDER.indexOf(tier);

  // Badge earned state comes from DB; progress previews use local counts
  const badges = STATIC_BADGES.map((b) => {
    const earned = earnedBadgeSlugs.has(b.id);
    let prog: string | undefined;
    if (!earned) {
      if (b.id === "consistent") prog = `${Math.min(donationCount, 5)}/5`;
      if (b.id === "generous")   prog = `£${Math.min(totalDonated, 100).toFixed(0)}/£100`;
      if (b.id === "champion")   prog = currentTierName;
    }
    return { ...b, earned, prog };
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BG }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: TEAL }} />
    </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen" style={{ backgroundColor: BG }}>
        <Header />

        {/* Hero */}
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-6 md:px-10 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/page sections/rewards6.png"
              alt="My rewards dashboard"
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${BG}D0 0%, ${BG}70 45%, transparent 80%)` }} />
          </div>
          <div className="relative z-10 max-w-[95vw] mx-auto">
            <Link
              href="/rewards"
              className="inline-flex items-center gap-2 mb-10 font-semibold text-sm uppercase tracking-wider transition-colors"
              style={{ color: `${CREAM}40` }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TEAL)}
              onMouseLeave={(e) => (e.currentTarget.style.color = `${CREAM}40`)}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Rewards
            </Link>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
                  Your Dashboard
                </span>
              </div>
              <h1
                className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-4"
                style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
              >
                My<br />
                <span style={{ color: `${CREAM}40` }}>Rewards.</span>
              </h1>
              <p className="text-base max-w-md leading-relaxed font-normal" style={{ color: `${CREAM}45`, fontFamily: "var(--font-body)" }}>
                Track your donations, points, and badges
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 md:px-10 pb-12">
          <div className="max-w-[95vw] mx-auto">
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-4"
              style={{ gap: "1px", backgroundColor: `${CREAM}08` }}
            >
              {[
                { label: "Total Points",   value: totalPoints.toLocaleString(),  icon: Star,   accent: TEAL },
                { label: "Total Donated",  value: `£${totalDonated.toFixed(2)}`, icon: Heart,  accent: "#EC4899" },
                { label: "Donations Made", value: String(donationCount),          icon: Gift,   accent: "#8B5CF6" },
                { label: "Current Level",  value: currentTierName,               icon: Trophy, accent: "#F59E0B" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="py-10 md:py-14 px-8 md:px-12"
                  style={{ backgroundColor: BG2 }}
                >
                  <s.icon className="w-6 h-6 mb-5" style={{ color: s.accent }} />
                  <p
                    className="text-[2.5rem] md:text-[3.5rem] font-extrabold tracking-tighter leading-none mb-2"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] font-medium" style={{ color: `${CREAM}45` }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Level Progress */}
        <section className="px-6 md:px-10 pb-12">
          <div className="max-w-[95vw] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              style={{ backgroundColor: BG2 }}
            >
              <div className="p-6 md:p-8 border-b" style={{ borderColor: `${CREAM}08` }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-6 h-px" style={{ backgroundColor: TEAL }} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
                    Status Levels
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <h2
                    className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.88]"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    Level{" "}
                    <span style={{ color: `${CREAM}40` }}>Progress.</span>
                  </h2>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <TrendingUp className="w-4 h-4" style={{ color: TEAL }} />
                    <span className="text-sm font-bold" style={{ color: TEAL }}>
                      {nextTierName
                        ? `${pointsToNext.toLocaleString()} pts to ${nextTierName}`
                        : "Max tier reached"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 md:px-8 py-6">
                {/* Progress bar */}
                <div className="h-2 mb-8" style={{ backgroundColor: `${CREAM}10` }}>
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: TEAL }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                  />
                </div>

                <div
                  className="grid grid-cols-4 gap-px"
                  style={{ backgroundColor: `${CREAM}08` }}
                >
                  {LEVEL_ORDER.map((lvl, i) => {
                    const display = TIER_DISPLAY[lvl];
                    const isUnlocked = i <= currentLvlIdx;
                    return (
                      <div
                        key={lvl}
                        className="py-5 px-4 md:px-6 text-center"
                        style={{ backgroundColor: isUnlocked ? BG2 : BG }}
                      >
                        <div
                          className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{ backgroundColor: isUnlocked ? display.bg : `${CREAM}08` }}
                        >
                          {isUnlocked
                            ? <Star className="w-4 h-4 text-white" />
                            : <Lock className="w-4 h-4" style={{ color: `${CREAM}20` }} />}
                        </div>
                        <p
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: isUnlocked ? CREAM : `${CREAM}25` }}
                        >
                          {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Badges */}
        <section className="px-6 md:px-10 pb-12">
          <div className="max-w-[95vw] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
                  Your Badges
                </span>
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-8"
                style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
              >
                Badges &amp;{" "}
                <span style={{ color: `${CREAM}40` }}>Achievements.</span>
              </h2>

              <div
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px"
                style={{ backgroundColor: `${CREAM}08` }}
              >
                {badges.map((badge, i) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                    className="relative p-6"
                    style={{ backgroundColor: BG2, opacity: badge.earned ? 1 : 0.55 }}
                  >
                    {badge.earned && (
                      <div className="absolute top-4 right-4">
                        <Award className="w-4 h-4" style={{ color: badge.accent }} />
                      </div>
                    )}

                    <div
                      className="w-12 h-12 rounded-full mb-4 flex items-center justify-center"
                      style={{ backgroundColor: badge.earned ? badge.accent + "30" : `${CREAM}08` }}
                    >
                      <badge.icon
                        className="w-6 h-6"
                        style={{ color: badge.earned ? badge.accent : `${CREAM}30` }}
                      />
                    </div>

                    <h3
                      className="text-base font-extrabold uppercase tracking-tighter mb-2"
                      style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                    >
                      {badge.name}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-4 font-normal"
                      style={{ color: `${CREAM}50`, fontFamily: "var(--font-body)" }}
                    >
                      {badge.description}
                    </p>

                    {badge.earned ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: badge.accent }}>
                        Earned
                      </span>
                    ) : badge.prog ? (
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: `${CREAM}35` }}>
                        {badge.prog}
                      </span>
                    ) : null}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Recent Donations */}
        <section className="px-6 md:px-10 pb-24">
          <div className="max-w-[95vw] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
                    Giving History
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <h2
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tighter leading-[0.88]"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    Recent{" "}
                    <span style={{ color: `${CREAM}40` }}>Donations.</span>
                    {donationCount > 5 && (
                      <span className="ml-3 text-sm font-normal tracking-normal normal-case" style={{ color: `${CREAM}35` }}>
                        (showing 5 of {donationCount})
                      </span>
                    )}
                  </h2>
                  <Link
                    href="/rewards/causes"
                    className="text-sm font-bold uppercase tracking-wider transition-colors shrink-0 ml-4"
                    style={{ color: TEAL }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = TEAL)}
                  >
                    Donate More →
                  </Link>
                </div>
              </div>

              <div style={{ backgroundColor: BG2 }}>
                {donations.length > 0 ? (
                  <div className="divide-y" style={{ borderColor: `${CREAM}08` }}>
                    {donations.map((donation, i) => (
                      <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 + i * 0.08 }}
                        className="p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${CREAM}08` }}
                          >
                            <Heart className="w-5 h-5" style={{ color: "#EC4899" }} />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold uppercase tracking-tighter" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>
                              {(donation as Donation & { charities?: { name: string } }).charities?.name ?? "Charity"}
                            </p>
                            <p className="text-xs mt-0.5 font-normal" style={{ color: `${CREAM}35`, fontFamily: "var(--font-body)" }}>
                              {new Date(donation.created_at).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-extrabold tracking-tighter" style={{ color: CREAM, fontFamily: "var(--font-headline)" }}>£{donation.amount}</p>
                          <p className="text-xs font-extrabold uppercase tracking-[0.15em] mt-0.5" style={{ color: TEAL }}>
                            +{donation.points_earned ?? 0} pts
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: `${CREAM}15` }} />
                    <p className="text-sm font-normal mb-6" style={{ color: `${CREAM}50`, fontFamily: "var(--font-body)" }}>No donations yet</p>
                    <Link
                      href="/rewards/causes"
                      className="text-xs font-extrabold uppercase tracking-[0.2em] transition-colors"
                      style={{ color: TEAL }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = CREAM)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = TEAL)}
                    >
                      Make your first donation →
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </AuthGuard>
  );
}
