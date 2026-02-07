"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import FlowingMenu from "@/components/navigation/FlowingMenu";
import LoadingScreen from "@/components/loading/LoadingScreen";
import {
  Fingerprint,
  ShieldCheck,
  Sparkles,
  UserCircle,
  LayoutGrid,
  Zap,
  ArrowRight,
  Star,
} from "lucide-react";

// --- Theme Constants (Emerald + White + Amber) ---
const COLORS = {
  emerald: "#064E3B",
  emeraldLight: "#10B981",
  mint: "#ECFDF5",
  saffron: "#F59E0B",
  gold: "#D97706",
  cream: "#FFFBEB",
  ebony: "#0F172A",
};

declare global {
  interface Window {
    __halalmeHomeVisited?: boolean;
  }
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.__halalmeHomeVisited;
  });

  const handleLoadingComplete = () => {
    window.__halalmeHomeVisited = true;
    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onLoadingComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      <div
        className={`min-h-screen bg-[#F8FAFC] font-sans antialiased selection:bg-emerald-200 ${isLoading ? "overflow-hidden h-screen" : ""}`}
      >
        {/* Hero Section - Immersive & Premium */}
        <HeroSection />

        <div className="relative z-10">
          {/* Bento Grid: What is HalalMe */}
          <WhatIsHalalMeSection />

          {/* The HalalMe Network - The "Flowing" Experience */}
          <section className="bg-emerald-950 relative overflow-hidden py-20">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute top-0 left-0 w-full h-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>

            <div className="mx-auto max-w-7xl relative px-6 mb-16">
              <div className="max-w-3xl">
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  className="text-amber-400 font-bold tracking-widest uppercase text-base md:text-lg"
                >
                  The Ecosystem
                </motion.span>
                <h2
                  className="text-4xl md:text-6xl font-extrabold text-white mt-4 mb-8"
                  style={{ fontFamily: "var(--font-headline)" }}
                >
                  Six Services. <br />
                  <span className="text-emerald-400">One Unified Account.</span>
                </h2>
                <p className="text-xl text-emerald-100/80 leading-relaxed">
                  Seamlessly transition between delivery, community, and travel.
                  Your Halal lifestyle, interconnected.
                </p>
              </div>
            </div>

            <FlowingMenu
              items={[
                {
                  link: "#delivery",
                  text: "HalalMe Delivery",
                  image: "/images/services/halal01.jpg",
                },
                {
                  link: "#kitchen",
                  text: "HalalMe Kitchen",
                  image: "/images/services/halal05.jpg",
                },
                {
                  link: "#fresh",
                  text: "HalalMe Fresh",
                  image: "/images/services/halal02.jpg",
                },
                {
                  link: "#hub",
                  text: "HalalMe Hub",
                  image: "/images/services/halal03.jpg",
                },
                {
                  link: "#travel",
                  text: "HalalMe Travel",
                  image: "/images/services/halal04.jpg",
                },
                {
                  link: "#rewards",
                  text: "HalalMe Rewards",
                  image: "/images/services/halal02.jpg",
                },
              ]}
              speed={20}
              textColor="#fff"
              bgColor="transparent"
              marqueeBgColor="#F59E0B"
              marqueeTextColor="#064E3B"
              borderColor="rgba(255,255,255,0.1)"
            />
          </section>

          {/* How it Works - Modern Timeline */}
          <HowItWorksSection />

          {/* Final CTA - High Conversion */}
          <FinalCTA />
        </div>
      </div>
    </>
  );
}

function HeroSection() {
  return (
    <section className="sticky top-0 h-screen flex items-center overflow-hidden bg-emerald-900">
      {/* Background Image with enhanced overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/halal5.jpg"
          alt="Premium Halal Food"
          fill
          className="object-cover opacity-50 scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/80 to-emerald-900/40"></div>
        {/* Ambient glow */}
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px]"></div>
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Tagline badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-emerald-100 text-sm font-medium">
                The Complete Halal Ecosystem
              </span>
            </motion.div>

            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05]"
              style={{ fontFamily: "var(--font-headline)" }}
            >
              Halal Living <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent"
              >
                Perfected.
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-lg md:text-xl text-emerald-50/90 max-w-xl leading-relaxed"
            >
              The world&apos;s first unified ecosystem for Halal food, verified
              recipes, global travel, and community giving.
            </motion.p>

            {/* Enhanced CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex flex-wrap gap-4"
            >
              {/* Primary CTA - High visibility amber button */}
              <Link href="/select-role">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px -10px rgba(245, 158, 11, 0.5)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative px-8 py-4 md:px-10 md:py-5 bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-bold text-lg rounded-full shadow-xl shadow-amber-500/30 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explore the Network
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.span>
                  </span>
                  {/* Hover shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </motion.button>
              </Link>

              {/* Secondary CTA - Clear visibility */}
              <Link href="/select-role">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255,255,255,0.15)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 md:px-10 md:py-5 bg-white/10 border-2 border-white/40 backdrop-blur-sm text-white font-bold text-lg rounded-full hover:border-white/60 transition-all"
                >
                  Join the Community
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex flex-wrap items-center gap-6 text-emerald-200/70 text-sm"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Halal Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>50,000+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>6 Services, One Account</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function WhatIsHalalMeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    {
      title: "One Identity",
      desc: "Single sign-on for all 6 services. Your profile, preferences, and rewards sync seamlessly across the entire HalalMe ecosystem.",
      Icon: Fingerprint,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      iconBg: "bg-emerald-500",
    },
    {
      title: "Verified Halal",
      desc: "Every vendor undergoes strict certification. Our audit process ensures authentic Halal standards you can trust.",
      Icon: ShieldCheck,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      iconBg: "bg-amber-500",
    },
    {
      title: "Smart Recipes",
      desc: "AI-powered meal planning tailored to your dietary needs. Discover new Halal recipes personalized just for you.",
      Icon: Sparkles,
      gradient: "from-teal-500 to-emerald-600",
      bgGradient: "from-teal-50 to-emerald-50",
      iconBg: "bg-teal-500",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-24 px-6 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-emerald-100 rounded-full filter blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100 rounded-full filter blur-3xl opacity-40 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Star className="w-4 h-4" />
            Why Choose HalalMe
          </span>
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-emerald-950 mb-6"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Redefining the{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Halal Experience
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Built from the ground up for the modern Muslim lifestyle, combining
            technology with tradition.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.Icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.bgGradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                ></div>
                <div className="relative bg-white p-8 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50 group-hover:border-transparent group-hover:shadow-2xl group-hover:shadow-slate-300/50 transition-all duration-500">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-emerald-950 mb-3 group-hover:text-emerald-700 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>

                  {/* Hover arrow */}
                  <div className="mt-6 flex items-center text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm">Learn more</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      num: "01",
      title: "Unified Profile",
      desc: "Create one account that follows you everywhere. Your preferences, history, and rewards all in one place.",
      Icon: UserCircle,
      color: "emerald",
    },
    {
      num: "02",
      title: "Select Service",
      desc: "Choose from Delivery, Kitchen, Fresh, Travel, Hub, and Rewards. All connected, all Halal certified.",
      Icon: LayoutGrid,
      color: "amber",
    },
    {
      num: "03",
      title: "Live Seamlessly",
      desc: "Earn rewards, track orders, and explore Halal options across the globe. One ecosystem, endless possibilities.",
      Icon: Zap,
      color: "teal",
    },
  ];

  const colorMap: Record<
    string,
    { gradient: string; bg: string; text: string; ring: string }
  > = {
    emerald: {
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-500",
      text: "text-emerald-500",
      ring: "ring-emerald-500/20",
    },
    amber: {
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-500",
      text: "text-amber-500",
      ring: "ring-amber-500/20",
    },
    teal: {
      gradient: "from-teal-500 to-emerald-600",
      bg: "bg-teal-500",
      text: "text-teal-600",
      ring: "ring-teal-500/20",
    },
  };

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #064E3B 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-emerald-950 mb-6"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            Simple.{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Unified.
            </span>{" "}
            Elegant.
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Get started in three simple steps and unlock the full HalalMe
            experience.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-emerald-300 via-amber-300 to-teal-300"></div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, i) => {
              const Icon = step.Icon;
              const colors = colorMap[step.color];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
                  className="relative"
                >
                  <div className="text-center">
                    {/* Step Number Circle */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{
                        delay: 0.5 + i * 0.2,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="relative mx-auto mb-8"
                    >
                      <div
                        className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-xl ring-8 ${colors.ring} mx-auto`}
                      >
                        <Icon className="w-9 h-9 text-white" />
                      </div>
                      {/* Step number badge */}
                      <div
                        className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center`}
                      >
                        <span className={`text-sm font-bold ${colors.text}`}>
                          {step.num}
                        </span>
                      </div>
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-emerald-950 mb-4">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed max-w-xs mx-auto">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
    >
      {/* Full-bleed emerald gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900">
        {/* Static gradient orbs - no heavy animation */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-600/30 to-teal-500/20 rounded-full blur-[150px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-500/15 to-orange-400/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 py-20 text-center">
        {/* Badge - gentle fade */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="inline-flex items-center gap-2 mb-8"
        >
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <span className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase">
            Join 50,000+ Users Worldwide
          </span>
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
        </motion.div>

        {/* Main heading - subtle slide up */}
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1.15]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Ready to start your{" "}
          <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            HalalMe journey?
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="text-emerald-100/70 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Join a global community that values quality, faith, and seamless
          technology. Your complete Halal lifestyle starts here.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <Link href="/select-role">
            <button className="bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/25 transition-shadow duration-300 flex items-center gap-2">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/contact">
            <button className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/20 hover:border-white/35 hover:bg-white/5 transition-all duration-300">
              Contact Support
            </button>
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          {[
            {
              icon: ShieldCheck,
              text: "100% Halal Certified",
              color: "emerald",
            },
            { icon: Star, text: "4.9/5 User Rating", color: "amber" },
            { icon: Zap, text: "Instant Setup", color: "teal" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-white/60 text-sm"
            >
              <item.icon
                className={`w-4 h-4 ${item.color === "amber" ? "text-amber-400/70" : "text-emerald-400/70"}`}
              />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Static bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16">
        <svg
          className="w-full h-full"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,30 C480,80 960,10 1440,50 L1440,100 L0,100 Z"
            fill="#F8FAFC"
          />
        </svg>
      </div>
    </section>
  );
}
