"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Globe,
  ChefHat,
  Users,
  Plane,
  ShoppingBag,
  Gift,
  Truck,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 relative overflow-hidden">
      {/* Lightweight ambient background - radial gradients instead of blur orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 70% 10%, rgba(16,185,129,0.12) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 30% 90%, rgba(245,158,11,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-10 sm:mb-14 text-center px-4 animate-fade-in-up">
            <Link href="/" className="inline-block mb-8">
              <span
                className="text-2xl sm:text-3xl font-bold text-white"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                Halal<span className="text-amber-400">Me</span>
              </span>
            </Link>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              How do you want to use{" "}
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                HalalMe?
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-emerald-100/70 max-w-xl mx-auto">
              Choose your path to get started with our platform
            </p>
          </div>

          {/* Two Main Options */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* Option 1: HalalMe Delivery */}
            <div className="group relative rounded-2xl sm:rounded-3xl bg-white/[0.06] border border-white/10 p-5 sm:p-8 overflow-hidden animate-fade-in-up animation-delay-200 hover:bg-white/[0.09] transition-colors duration-300">
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

              <div className="relative z-10">
                <div className="mb-6">
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-3.5 shadow-lg shadow-amber-500/20">
                    <Truck className="h-7 w-7 text-white" />
                  </div>
                  <h2
                    className="mb-2 text-xl sm:text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    HalalMe Delivery
                  </h2>
                  <p className="text-sm sm:text-base text-emerald-200/60">
                    Order halal food or join as a vendor/driver
                  </p>
                </div>

                <div className="mb-6 space-y-3">
                  {[
                    "Fast halal food delivery to your door",
                    "Dedicated delivery platform",
                    "Join as a vendor or driver",
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-amber-400" />
                      </div>
                      <span className="text-sm text-emerald-100/70">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <a
                    href="https://www.halalme.co.uk/en/home"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-emerald-950 font-bold text-sm sm:text-base rounded-xl h-12 shadow-lg shadow-amber-500/20">
                      Order Food
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href="https://halalme.aidaform.com/merchant-registration"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-xs sm:text-sm rounded-xl h-11 bg-transparent"
                      >
                        Vendor Signup
                      </Button>
                    </a>
                    <a
                      href="https://halalme.aidaform.com/driver-registration"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 text-xs sm:text-sm rounded-xl h-11 bg-transparent"
                      >
                        Driver Signup
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Option 2: HalalMe Ecosystem */}
            <div className="group relative rounded-2xl sm:rounded-3xl bg-white/[0.06] border border-white/10 p-5 sm:p-8 overflow-hidden animate-fade-in-up animation-delay-400 hover:bg-white/[0.09] transition-colors duration-300">
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />

              {/* Popular badge */}
              <div className="absolute top-4 right-4 z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 px-3 py-1 text-xs font-semibold text-emerald-300">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Popular
                </span>
              </div>

              <div className="relative z-10">
                <div className="mb-6">
                  <div className="mb-5 inline-flex rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-3.5 shadow-lg shadow-emerald-500/20">
                    <Globe className="h-7 w-7 text-white" />
                  </div>
                  <h2
                    className="mb-2 text-xl sm:text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    HalalMe Ecosystem
                  </h2>
                  <p className="text-sm sm:text-base text-emerald-200/60">
                    Access all HalalMe services with one account
                  </p>
                </div>

                {/* Service mini-icons */}
                <div className="mb-6 grid grid-cols-2 gap-2.5">
                  {[
                    { icon: ChefHat, label: "Kitchen", color: "text-pink-400", bg: "bg-pink-400/10" },
                    { icon: Users, label: "Hub", color: "text-amber-400", bg: "bg-amber-400/10" },
                    { icon: Plane, label: "Travel", color: "text-sky-400", bg: "bg-sky-400/10" },
                    { icon: ShoppingBag, label: "Fresh", color: "text-lime-400", bg: "bg-lime-400/10" },
                    { icon: Gift, label: "Rewards", color: "text-teal-400", bg: "bg-teal-400/10" },
                    { icon: Zap, label: "& More", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 ${item.bg} rounded-xl px-3 py-2.5`}
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm text-white/80 font-medium">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => router.push("/signup?role=ecosystem")}
                  className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm sm:text-base rounded-xl h-12 shadow-lg shadow-emerald-500/20"
                >
                  Join HalalMe Ecosystem
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-emerald-200/50 text-xs sm:text-sm animate-fade-in-up animation-delay-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400/60" />
              <span>100% Halal Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-400/40 rounded-full" />
              <span>50,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-400/40 rounded-full" />
              <span>6 Unified Services</span>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 sm:mt-8 text-center animate-fade-in-up animation-delay-700">
            <p className="text-sm text-emerald-200/50">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-sm text-emerald-200/40">
              <Link
                href="/"
                className="hover:text-emerald-200/70 font-medium transition-colors"
              >
                &larr; Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
