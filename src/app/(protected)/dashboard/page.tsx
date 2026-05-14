"use client";

import { useAuth } from "@/hooks/useAuth";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Truck, X } from "lucide-react";
import { supabase } from "@/services/supabase";
import {
  ArrowRight,
  ShieldCheck,
  Settings,
  HelpCircle,
  LogOut,
  Clock,
  Coins,
  HandHeart,
  Bookmark,
} from "lucide-react";

const services = [
  {
    name: "Delivery",
    description:
      "Order fresh halal meals from certified restaurants and vendors delivered straight to your door.",
    accent: "#B96AF0",
    logoColor: "#5E188F",
    href: "/delivery",
    external: false,
    tag: "Live",
  },
  {
    name: "Kitchen",
    description:
      "Discover halal recipes, AI-powered meal planning, and step-by-step cooking guides for every skill level.",
    accent: "#F03E9E",
    href: "/kitchen",
    external: false,
    tag: "Beta",
  },
  {
    name: "Social",
    description:
      "Connect with the global Muslim community. Share recipes, reviews, and halal finds.",
    accent: "#F59E0B",
    href: "/hub",
    external: false,
    tag: "Beta",
  },
  {
    name: "Rewards",
    description:
      "Earn points across all HalalMe services. Redeem for discounts, donate to charity, or unlock exclusive perks.",
    accent: "#14B8A6",
    href: "/rewards",
    external: false,
    tag: "Live",
  },
];

interface DashboardStats {
  rewardPoints: number;
  totalDonated: number;
  savedRecipes: number;
  savedPosts: number;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showDeliveryBanner, setShowDeliveryBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get("delivery") === "ready") {
      setShowDeliveryBanner(true);
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  const [stats, setStats] = useState<DashboardStats>({
    rewardPoints: 0,
    totalDonated: 0,
    savedRecipes: 0,
    savedPosts: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const userId = user.id;

    async function fetchStats() {
      try {
        const [profileRes, donationsRes, recipeFavRes, bookmarksRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("reward_points")
              .eq("id", userId)
              .single(),
            supabase
              .from("donations")
              .select("amount")
              .eq("user_id", userId)
              .eq("status", "completed"),
            supabase
              .from("recipe_favorites")
              .select("recipe_id", { count: "exact", head: true })
              .eq("user_id", userId),
            supabase
              .from("post_bookmarks")
              .select("post_id", { count: "exact", head: true })
              .eq("user_id", userId),
          ]);

        const rewardPoints = profileRes.data?.reward_points ?? 0;
        const totalDonated = (donationsRes.data ?? []).reduce(
          (sum: number, d: { amount: number }) => sum + d.amount,
          0,
        );
        const savedRecipes = recipeFavRes.count ?? 0;
        const savedPosts   = bookmarksRes.count ?? 0;

        setStats({ rewardPoints, totalDonated, savedRecipes, savedPosts });
      } catch {
        // silently keep zeros on error
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-[#102C26] relative overflow-hidden">
      {/* Dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #F7E7CE 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">
        {/* Delivery account ready banner */}
        {showDeliveryBanner && (
          <div className="bg-[#5E188F] border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-white shrink-0" />
              <p className="text-sm text-white">
                <span className="font-bold">Your delivery account is ready.</span>{" "}
                Log in at{" "}
                <a href="https://delivery.halalme.co.uk" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:opacity-80">
                  delivery.halalme.co.uk
                </a>{" "}
                with your email — a one-time code will be sent to you.
              </p>
            </div>
            <button onClick={() => setShowDeliveryBanner(false)} className="text-white/60 hover:text-white shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Navigation Bar */}
        <nav className="border-b border-[#F7E7CE]/8 bg-[#0A1C19]/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span style={{ position: "relative", display: "inline-flex", width: 26, height: 26, flexShrink: 0 }}>
                <span style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
                <Image src="/logo/logo.png" alt="HalalMe" width={26} height={26} className="object-contain relative z-10" />
              </span>
              <span
                className="text-lg font-black text-[#F7E7CE] tracking-tight"
                style={{ fontFamily: "var(--font-logo)" }}
              >
                HalalMe
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/profile"
                className="p-2.5 text-[#F7E7CE]/40 hover:text-[#F7E7CE]/80 hover:bg-[#F7E7CE]/6 transition-colors"
              >
                <Settings className="w-4.5 h-4.5" />
              </Link>
              <Link
                href="/help"
                className="p-2.5 text-[#F7E7CE]/40 hover:text-[#F7E7CE]/80 hover:bg-[#F7E7CE]/6 transition-colors"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </Link>
              <button
                onClick={() => logout()}
                className="p-2.5 text-[#F7E7CE]/40 hover:text-red-400 hover:bg-[#F7E7CE]/6 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            {/* Welcome Section */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-px bg-[#F59E0B]" />
                <span className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.3em]">
                  Welcome back
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]">
                    {user?.full_name ?? user?.username ?? "there"}
                  </h1>
                  <p className="mt-2 text-sm text-[#F7E7CE]/40">
                    Your halalme ecosystem dashboard
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-[#F7E7CE]/6 border border-[#F7E7CE]/12 px-3 py-1.5 text-[10px] font-bold text-[#F7E7CE]/55 uppercase tracking-widest self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Member
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mb-12 grid gap-px grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-[#F7E7CE]/8">
              {[
                {
                  label: "Reward Balance",
                  value: statsLoading
                    ? "-"
                    : stats.rewardPoints.toLocaleString(),
                  sub:
                    stats.rewardPoints > 0
                      ? "Points ready to redeem"
                      : "Start earning today",
                  icon: Coins,
                  num: "01",
                  href: "/rewards",
                },
                {
                  label: "Your Impact",
                  value: statsLoading
                    ? "-"
                    : `£${stats.totalDonated.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                  sub:
                    stats.totalDonated > 0
                      ? "Donated to charities"
                      : "Make your first donation",
                  icon: HandHeart,
                  num: "02",
                  href: "/rewards#donations",
                },
                {
                  label: "Saved Recipes",
                  value: statsLoading ? "-" : stats.savedRecipes.toString(),
                  sub:
                    stats.savedRecipes > 0
                      ? "Recipes bookmarked"
                      : "Save recipes to cook later",
                  icon: Bookmark,
                  num: "03",
                  href: "/kitchen/recipes?tab=saved",
                },
                {
                  label: "Saved Posts",
                  value: statsLoading ? "-" : stats.savedPosts.toString(),
                  sub:
                    stats.savedPosts > 0
                      ? "Posts bookmarked"
                      : "Bookmark posts from the hub",
                  icon: Bookmark,
                  num: "04",
                  href: "/hub/feed?tab=bookmarks",
                },
              ].map((stat, i) => (
                <Link
                  key={i}
                  href={stat.href}
                  className="relative bg-[#0A1C19] p-6 overflow-hidden hover:bg-[#0d2420] transition-colors duration-200 block"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-3 -right-2 text-[5rem] font-extrabold text-[#102C26] leading-none select-none pointer-events-none"
                  >
                    {stat.num}
                  </span>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-[#F7E7CE]/35 uppercase tracking-[0.2em]">
                        {stat.label}
                      </span>
                      <div className="w-8 h-8 bg-[#F7E7CE]/6 border border-[#F7E7CE]/10 flex items-center justify-center">
                        <stat.icon className="w-4 h-4 text-[#F7E7CE]/40" />
                      </div>
                    </div>
                    <p className="text-3xl font-extrabold text-[#F7E7CE] tracking-tighter">
                      {stat.value}
                    </p>
                    <p className="text-xs text-[#F7E7CE]/30 mt-1">{stat.sub}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Ecosystem Services */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-6 h-px bg-[#F59E0B]" />
                <span className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.3em]">
                  Ecosystem
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tighter leading-[0.9] text-[#F7E7CE] mb-1">
                Explore the
                <br />
                <span className="text-[#F7E7CE]/40">Services</span>
              </h2>
              <p className="text-sm text-[#F7E7CE]/35 mt-3 mb-8">
                Four services, one unified account
              </p>
            </div>

            <div className="grid gap-px grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-[#F7E7CE]/8 mb-12">
              {services.map((service, i) => {
                const CardContent = (
                  <div
                    key={i}
                    className="group relative bg-[#102C26] border-0 p-6 hover:bg-[#F7E7CE] transition-colors duration-300 cursor-pointer overflow-hidden h-full"
                  >
                    {/* Decorative bg number */}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-4 -right-3 text-[6rem] font-extrabold text-[#0A1C19] group-hover:text-[#102C26]/15 leading-none select-none pointer-events-none transition-colors duration-300"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div className="relative z-10">
                      {/* Top row: logo + tag */}
                      <div className="flex items-start justify-between mb-5">
                        <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
                          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              backgroundColor: ("logoColor" in service ? service.logoColor : undefined) ?? service.accent,
                              WebkitMaskImage: "url(/logo/logo.png)",
                              maskImage: "url(/logo/logo.png)",
                              WebkitMaskSize: "contain",
                              maskSize: "contain",
                              WebkitMaskRepeat: "no-repeat",
                              maskRepeat: "no-repeat",
                              maskMode: "alpha",
                              WebkitMaskPosition: "center",
                              maskPosition: "center",
                            } as React.CSSProperties}
                          />
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border transition-colors duration-300 ${
                            service.tag === "Live"
                              ? "bg-[#F7E7CE]/6 border-[#F7E7CE]/12 text-[#F7E7CE]/45 group-hover:bg-[#102C26]/6 group-hover:border-[#102C26]/15 group-hover:text-[#102C26]/55"
                              : "bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]/70 group-hover:bg-[#102C26]/6 group-hover:border-[#102C26]/15 group-hover:text-[#102C26]/55"
                          }`}
                        >
                          {service.tag}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-2 transition-colors duration-300">
                        HalalMe {service.name}
                      </h3>

                      <p className="text-xs text-[#F7E7CE]/45 group-hover:text-[#102C26]/60 leading-relaxed mb-5 transition-colors duration-300">
                        {service.description}
                      </p>

                      <div className="flex items-center text-xs font-bold text-[#F7E7CE]/40 group-hover:text-[#102C26]/70 uppercase tracking-wide transition-colors duration-300">
                        Explore
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                );

                if (service.external) {
                  return (
                    <a
                      key={i}
                      href={service.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {CardContent}
                    </a>
                  );
                }

                return (
                  <Link key={i} href={service.href} className="block">
                    {CardContent}
                  </Link>
                );
              })}
            </div>

            {/* Account Info Footer */}
            <div className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-[#F7E7CE]/8 border border-[#F7E7CE]/12 flex items-center justify-center text-[#F7E7CE]/60 font-bold text-base shrink-0">
                    {(user?.full_name ?? user?.username)
                      ?.charAt(0)
                      ?.toUpperCase() ?? "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#F7E7CE]/70 truncate uppercase tracking-wide">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-[#F7E7CE]/30 shrink-0" />
                      <p className="text-xs text-[#F7E7CE]/30">
                        Member since{" "}
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-GB",
                              { month: "short", year: "numeric" },
                            )
                          : "Today"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href="/profile"
                    className="h-10 px-4 border border-[#F7E7CE]/12 text-xs font-bold text-[#F7E7CE]/50 uppercase tracking-wide hover:border-[#F7E7CE]/30 hover:text-[#F7E7CE]/80 transition-colors flex items-center"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/help"
                    className="h-10 px-4 border border-[#F7E7CE]/12 text-xs font-bold text-[#F7E7CE]/50 uppercase tracking-wide hover:border-[#F7E7CE]/30 hover:text-[#F7E7CE]/80 transition-colors flex items-center"
                  >
                    Get Help
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
