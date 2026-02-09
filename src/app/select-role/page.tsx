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
    <div className="min-h-screen bg-[#052e26] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[#052e26]" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-white/5" />

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
              <span className="text-amber-300">
                HalalMe?
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/70 max-w-xl mx-auto">
              Choose your path to get started with our platform
            </p>
          </div>

          {/* Two Main Options */}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {/* Option 1: HalalMe Delivery */}
            <div className="group relative rounded-3xl bg-white/[0.08] border border-white/15 p-5 sm:p-8 overflow-hidden animate-fade-in-up animation-delay-200 hover:bg-white/[0.11] transition-colors duration-300 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)]">
              <div className="relative z-10">
                <div className="mb-6">
                  <div className="mb-5 inline-flex rounded-2xl bg-amber-500 p-3.5 shadow-lg shadow-black/30">
                    <Truck className="h-7 w-7 text-white" />
                  </div>
                  <h2
                    className="mb-2 text-xl sm:text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    HalalMe Delivery
                  </h2>
                  <p className="text-sm sm:text-base text-white/65">
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
                      <span className="text-sm text-white/75">
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
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-[#052e26] font-bold text-sm sm:text-base rounded-xl h-12 shadow-lg shadow-black/25">
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
            <div className="group relative rounded-3xl bg-white/[0.08] border border-white/15 p-5 sm:p-8 overflow-hidden animate-fade-in-up animation-delay-400 hover:bg-white/[0.11] transition-colors duration-300 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)]">
              {/* Popular badge */}
              <div className="absolute top-4 right-4 z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#065f46]/30 border border-[#065f46] px-3 py-1 text-xs font-semibold text-white/85">
                  <span className="w-1.5 h-1.5 bg-white/90 rounded-full animate-pulse" />
                  Popular
                </span>
              </div>

              <div className="relative z-10">
                <div className="mb-6">
                  <div className="mb-5 inline-flex rounded-2xl bg-[#065f46] p-3.5 shadow-lg shadow-black/30">
                    <Globe className="h-7 w-7 text-white" />
                  </div>
                  <h2
                    className="mb-2 text-xl sm:text-2xl font-bold text-white"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    HalalMe Ecosystem
                  </h2>
                  <p className="text-sm sm:text-base text-white/65">
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
                    { icon: Gift, label: "Rewards", color: "text-emerald-300", bg: "bg-emerald-300/10" },
                    { icon: Zap, label: "& More", color: "text-emerald-200", bg: "bg-emerald-200/10" },
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
                  className="w-full bg-[#065f46] hover:bg-[#064e3b] text-white font-bold text-sm sm:text-base rounded-xl h-12 shadow-lg shadow-black/25"
                >
                  Join HalalMe Ecosystem
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/60 text-xs sm:text-sm animate-fade-in-up animation-delay-600">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-white/80" />
              <span>100% Halal Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-white/45 rounded-full" />
              <span>50,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-white/45 rounded-full" />
              <span>6 Unified Services</span>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 sm:mt-8 text-center animate-fade-in-up animation-delay-700">
            <p className="text-sm text-white/60">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-sm text-white/50">
              <Link
                href="/"
                className="hover:text-white/80 font-medium transition-colors"
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
