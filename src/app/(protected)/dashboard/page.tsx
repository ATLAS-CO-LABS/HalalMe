"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Truck,
  ChefHat,
  ShoppingBag,
  Users,
  Plane,
  Gift,
  ArrowRight,
  ShieldCheck,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  TrendingUp,
  Heart,
  Clock,
} from "lucide-react";

const services = [
  {
    name: "Delivery",
    description:
      "Order fresh halal meals from certified restaurants and vendors delivered straight to your door.",
    icon: Truck,
    gradient: "from-orange-500 to-amber-600",
    bgHover: "group-hover:bg-orange-500/5",
    href: "https://www.halalme.co.uk/en/home",
    external: true,
    tag: "Live",
    tagColor: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  },
  {
    name: "Kitchen",
    description:
      "Discover halal recipes, AI-powered meal planning, and step-by-step cooking guides for every skill level.",
    icon: ChefHat,
    gradient: "from-pink-500 to-rose-600",
    bgHover: "group-hover:bg-pink-500/5",
    href: "/kitchen",
    external: false,
    tag: "Beta",
    tagColor: "bg-pink-400/20 text-pink-300 border-pink-400/30",
  },
  {
    name: "Fresh",
    description:
      "Shop pre-made halal meals and fresh ingredients. Quality assured, ready to heat or cook at home.",
    icon: ShoppingBag,
    gradient: "from-lime-500 to-green-600",
    bgHover: "group-hover:bg-lime-500/5",
    href: "/fresh",
    external: false,
    tag: "Live",
    tagColor: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  },
  {
    name: "Hub",
    description:
      "Connect with your local halal community. Share recipes, attend food events, and discover new favourites.",
    icon: Users,
    gradient: "from-amber-500 to-yellow-600",
    bgHover: "group-hover:bg-amber-500/5",
    href: "/hub",
    external: false,
    tag: "Beta",
    tagColor: "bg-amber-400/20 text-amber-300 border-amber-400/30",
  },
  {
    name: "Travel",
    description:
      "Find halal-friendly hotels, flights, and city guides. Travel the world without compromising your values.",
    icon: Plane,
    gradient: "from-sky-500 to-blue-600",
    bgHover: "group-hover:bg-sky-500/5",
    href: "/travel",
    external: false,
    tag: "Live",
    tagColor: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  },
  {
    name: "Rewards",
    description:
      "Earn points across all HalalMe services. Redeem for discounts, donate to charity, or unlock exclusive perks.",
    icon: Gift,
    gradient: "from-teal-500 to-emerald-600",
    bgHover: "group-hover:bg-teal-500/5",
    href: "/rewards",
    external: false,
    tag: "Live",
    tagColor: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
  },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 relative overflow-hidden">
      {/* Lightweight ambient background - radial gradients instead of blur orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 70% 5%, rgba(16,185,129,0.10) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 5% 70%, rgba(245,158,11,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 90% 90%, rgba(20,184,166,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10">
        {/* Top Navigation Bar */}
        <nav className="border-b border-white/10 bg-white/[0.03]">
          <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Halal<span className="text-amber-400">Me</span>
              </span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-3">
              <Link
                href="/profile"
                className="p-2.5 sm:p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <Link
                href="/help"
                className="p-2.5 sm:p-2 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
              </Link>
              <button
                onClick={() => logout()}
                className="p-2.5 sm:p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mx-auto max-w-6xl">
            {/* Welcome Section */}
            <div className="mb-10 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-emerald-400 text-sm font-medium">
                      Welcome back
                    </p>
                    <span className="inline-flex sm:hidden items-center gap-1 rounded-full bg-emerald-400/15 border border-emerald-400/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <h1
                    className="text-2xl sm:text-4xl font-extrabold text-white"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {user?.name || "there"}
                  </h1>
                  <p className="mt-1.5 sm:mt-2 text-emerald-200/50 text-xs sm:text-sm">
                    Your halal ecosystem dashboard
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 border border-emerald-400/20 px-3 py-1.5 text-xs font-medium text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Member
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mb-10 grid gap-4 grid-cols-1 sm:grid-cols-3 animate-fade-in-up animation-delay-200">
              {[
                {
                  label: "Total Orders",
                  value: "0",
                  sub: "Place your first order",
                  icon: TrendingUp,
                  color: "text-amber-400",
                  bg: "bg-amber-400/10",
                },
                {
                  label: "Reward Points",
                  value: "0",
                  sub: "Start earning today",
                  icon: Star,
                  color: "text-emerald-400",
                  bg: "bg-emerald-400/10",
                },
                {
                  label: "Saved Items",
                  value: "0",
                  sub: "Save your favourites",
                  icon: Heart,
                  color: "text-pink-400",
                  bg: "bg-pink-400/10",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white/[0.05] border border-white/8 p-5 hover:bg-white/[0.08] transition-colors duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-emerald-200/50">
                      {stat.label}
                    </span>
                    <div
                      className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}
                    >
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-emerald-200/40 mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Ecosystem Services */}
            <div className="mb-4 animate-fade-in-up animation-delay-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="text-xl sm:text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    Explore the{" "}
                    <span className="bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">
                      Ecosystem
                    </span>
                  </h2>
                  <p className="text-sm text-emerald-200/40 mt-1">
                    Six services, one unified account
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10 animate-fade-in-up animation-delay-400">
              {services.map((service, i) => {
                const Icon = service.icon;
                const CardContent = (
                  <div
                    key={i}
                    className={`group relative rounded-2xl bg-white/[0.05] border border-white/8 p-5 sm:p-6 hover:bg-white/[0.08] hover:border-white/15 transition-colors duration-300 cursor-pointer overflow-hidden h-full`}
                  >
                    {/* Subtle hover glow */}
                    <div
                      className={`absolute inset-0 ${service.bgHover} opacity-0 transition-opacity duration-500 rounded-2xl`}
                    />

                    <div className="relative z-10">
                      {/* Top row: icon + tag */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full ${service.tagColor} border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider`}
                        >
                          {service.tag}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-white mb-2">
                        HalalMe {service.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-emerald-200/50 leading-relaxed mb-4">
                        {service.description}
                      </p>

                      {/* Link indicator */}
                      <div className="flex items-center text-sm font-medium text-emerald-400/70 group-hover:text-emerald-400 transition-colors">
                        <span>
                          {service.external ? "Visit platform" : "Explore"}
                        </span>
                        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
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
            <div className="rounded-2xl bg-white/[0.04] border border-white/6 p-6 animate-fade-in-up animation-delay-500">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-emerald-200/40 flex-shrink-0" />
                      <p className="text-xs text-emerald-200/40">
                        Member since{" "}
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : "Today"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <Link
                    href="/profile"
                    className="px-3 sm:px-4 py-2 rounded-xl bg-white/8 border border-white/10 text-xs sm:text-sm text-white/70 hover:text-white hover:bg-white/12 transition-colors whitespace-nowrap"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/help"
                    className="px-3 sm:px-4 py-2 rounded-xl bg-white/8 border border-white/10 text-xs sm:text-sm text-white/70 hover:text-white hover:bg-white/12 transition-colors whitespace-nowrap"
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
