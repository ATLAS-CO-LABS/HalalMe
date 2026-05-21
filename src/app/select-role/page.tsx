"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Globe,
  ChefHat,
  Users,
  Gift,
  Truck,
  Store,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";

export default function SelectRolePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#102C26] relative overflow-hidden">
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #F7E7CE 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 sm:py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          {/* ── Header ─────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-10 text-center"
          >
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
              <span
                style={{
                  position: "relative",
                  display: "inline-flex",
                  width: 26,
                  height: 26,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(255,255,255,0.92)",
                    borderRadius: "50%",
                  }}
                />
                <Image
                  src="/logo/logo.png"
                  alt="HalalMe"
                  width={26}
                  height={26}
                  className="object-contain relative z-10"
                />
              </span>
              <span
                className="text-lg font-black text-[#F7E7CE] tracking-tight"
                style={{ fontFamily: "var(--font-logo)" }}
              >
                HalalMe
              </span>
            </Link>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-px bg-[#F59E0B]" />
              <span className="text-[#F59E0B] text-[10px] font-bold uppercase tracking-[0.3em]">
                Get Started
              </span>
              <div className="w-8 h-px bg-[#F59E0B]" />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]">
              How do you want
              <br />
              <span className="text-[#F7E7CE]/45">to use HalalMe?</span>
            </h1>
            <p className="mt-3 text-sm text-[#F7E7CE]/45 max-w-md mx-auto leading-relaxed">
              What would you like to do first?
            </p>
          </motion.div>

          {/* ── Two Cards ───────────────────────────────────────── */}
          <div className="grid gap-px sm:gap-3 md:gap-4 md:grid-cols-2 bg-[#F7E7CE]/8 sm:bg-transparent">
            {/* Card 1: HalalMe Ecosystem */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="relative bg-[#0A1C19] border border-[#F7E7CE]/8 p-5 sm:p-6 overflow-hidden"
            >
              {/* Operational badge */}
              <div className="absolute top-3 right-3 z-20">
                <span className="inline-flex items-center gap-1.5 bg-[#F7E7CE]/8 border border-[#F7E7CE]/15 px-2.5 py-0.5 text-[9px] font-bold text-[#F7E7CE]/60 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Operational
                </span>
              </div>

              {/* Decorative bg number */}
              <span
                aria-hidden="true"
                className="absolute -bottom-3 -right-3 text-[6rem] font-extrabold text-[#102C26] leading-none select-none pointer-events-none"
              >
                01
              </span>

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 bg-[#F7E7CE]/8 border border-[#F7E7CE]/12 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-[#F7E7CE]/60" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#F59E0B] uppercase tracking-[0.25em] mb-0.5">
                      Platform
                    </p>
                    <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tighter text-[#F7E7CE] leading-tight">
                      Explore & Connect
                    </h2>
                  </div>
                </div>

                <p className="text-[#F7E7CE]/45 text-xs mb-4 leading-relaxed">
                  Explore recipes, social community, rewards & halal food
                  delivery — all in one place.
                </p>

                {/* Feature bullets */}
                <div className="flex flex-col gap-2 mb-4">
                  {[
                    "AI-powered halal recipe assistant",
                    "Social hub for the halal community",
                    "Earn rewards by donating to causes",
                    "Order halal food from local restaurants",
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-[#F59E0B] shrink-0" />
                      <span className="text-[11px] text-[#F7E7CE]/55">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Service mini-grid */}
                <div className="grid grid-cols-4 gap-px bg-[#F7E7CE]/8 mb-5">
                  {[
                    { Icon: ChefHat, label: "Kitchen" },
                    { Icon: Users, label: "Social" },
                    { Icon: Gift, label: "Rewards" },
                    { Icon: Truck, label: "Delivery" },
                  ].map(({ Icon, label }, i) => (
                    <div
                      key={i}
                      className="bg-[#0A1C19] px-2 py-2 flex items-center gap-1.5"
                    >
                      <Icon className="w-3 h-3 text-[#F7E7CE]/35 shrink-0" />
                      <span className="text-[10px] text-[#F7E7CE]/50 font-medium">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <motion.button
                  onClick={() => router.push("/signup?role=ecosystem")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-10 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-xs flex items-center justify-center gap-2 hover:bg-[#F7E7CE]/90 transition-colors"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>

            {/* Card 2: Merchants & Drivers */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.5 }}
              className="relative bg-[#0A1C19] border border-[#F7E7CE]/8 p-5 sm:p-6 overflow-hidden group"
            >
              {/* Decorative bg number */}
              <span
                aria-hidden="true"
                className="absolute -bottom-3 -right-3 text-[6rem] font-extrabold text-[#102C26] leading-none select-none pointer-events-none"
              >
                02
              </span>

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 bg-[#F7E7CE]/8 border border-[#F7E7CE]/12 flex items-center justify-center shrink-0">
                    <Store className="w-4 h-4 text-[#F7E7CE]/60" />
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-[#F59E0B] uppercase tracking-[0.25em] mb-0.5">
                      Partners
                    </p>
                    <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tighter text-[#F7E7CE] leading-tight">
                      Merchants & Drivers
                    </h2>
                  </div>
                </div>

                <p className="text-[#F7E7CE]/45 text-xs mb-4 leading-relaxed">
                  Join the HalalMe Delivery network as a restaurant partner or
                  delivery driver.
                </p>

                <div className="flex flex-col gap-2 mb-5">
                  {[
                    "List your restaurant on HalalMe Delivery",
                    "Manage orders & menus in real time",
                    "Earn flexibly as a delivery driver",
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-[#F59E0B] shrink-0" />
                      <span className="text-[11px] text-[#F7E7CE]/55">
                        {text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    onClick={() => router.push("/partner/merchant")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-10 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-xs flex items-center justify-center gap-1.5 hover:bg-[#F7E7CE]/90 transition-colors"
                  >
                    <Store className="w-3.5 h-3.5" />
                    Merchant
                  </motion.button>
                  <a
                    href="https://tally.so/r/Pd96Nx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full h-10 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-xs flex items-center justify-center gap-1.5 hover:bg-[#F7E7CE]/90 transition-colors"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Driver
                    </motion.button>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Access note ─────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            className="mt-4 text-center text-xs text-[#F7E7CE]/30 max-w-sm mx-auto leading-relaxed"
          >
            You can always access everything from your dashboard later.
          </motion.p>

          {/* ── Trust bar ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 md:gap-8"
          >
            {[
              { Icon: ShieldCheck, text: "100% Halal Verified" },
              { text: "900+ Restaurants" },
              { text: "4 Unified Services" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[#F7E7CE]/30 text-xs uppercase tracking-wide"
              >
                {item.Icon && <item.Icon className="w-3.5 h-3.5" />}
                {i > 0 && !item.Icon && (
                  <span className="w-1 h-1 bg-[#F7E7CE]/20 rounded-full" />
                )}
                <span>{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* ── Footer links ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center space-y-2"
          >
            <p className="text-sm text-[#F7E7CE]/35">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#F7E7CE]/60 hover:text-[#F7E7CE] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
            <p>
              <Link
                href="/"
                className="text-xs text-[#F7E7CE]/25 hover:text-[#F7E7CE]/50 transition-colors"
              >
                ← Back to Home
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
