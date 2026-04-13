"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  ChefHat,
  TrendingUp,
  Globe,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/* ─── Hub design tokens — dark + amber ───────────────── */
const BG    = "#0B0D0F";   // near-black with neutral warmth
const BG2   = "#111418";   // card sections
const BG3   = "#0D1012";   // deepest (hero overlay)
const AMBER = "#F59E0B";

export default function HubLandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const statsRef    = useRef(null);
  const cardsRef    = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef      = useRef(null);

  const statsInView    = useInView(statsRef,    { once: true });
  const cardsInView    = useInView(cardsRef,    { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const ctaInView      = useInView(ctaRef,      { once: true });

  const whatYouCanDo = [
    { Icon: Share2,        title: "Share Posts",      desc: "Upload food pictures, share recipes, and tell your cooking stories with the community.", num: "01" },
    { Icon: Heart,         title: "Engage & Connect", desc: "Like, comment, and interact with posts from fellow food lovers around the world.",        num: "02" },
    { Icon: MessageCircle, title: "Build Community",  desc: "Follow your favourite creators, earn followers, and grow your own food community.",       num: "03" },
  ];

  const features = [
    { Icon: Users,      num: "01", title: "Join the Community",  desc: "Connect with halal food lovers from around the world." },
    { Icon: ChefHat,    num: "02", title: "Share Recipes",       desc: "Showcase your culinary creations to thousands of food enthusiasts." },
    { Icon: TrendingUp, num: "03", title: "Discover Trending",   desc: "Find the most popular halal recipes and posts every single day." },
    { Icon: Globe,      num: "04", title: "Global Reach",        desc: "A worldwide platform for the halal food community to connect." },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section
        className="relative h-screen min-h-[620px] max-h-[960px] flex items-center overflow-hidden"
        style={{ backgroundColor: BG3 }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1920&auto=format&fit=crop&q=80"
            alt="Halal food community"
            fill
            className="object-cover opacity-[0.18] scale-105"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${BG3} 40%, ${BG3}90 65%, transparent 100%)`,
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[95vw] mx-auto px-6 md:px-10 pt-20">
          <div className="max-w-4xl">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-6 md:mb-8"
            >
              <div className="w-8 h-px" style={{ backgroundColor: AMBER }} />
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: AMBER }}
              >
                Your Halal Community
              </span>
            </motion.div>

            {/* H1 */}
            <h1 className="font-extrabold uppercase tracking-tighter leading-[0.88]">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 text-white/40"
              >
                HalalMe
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.7 }}
                className="block text-[clamp(3rem,8vw,8rem)] text-white"
              >
                Hub.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                className="block text-[clamp(2rem,4.5vw,4.5rem)]"
                style={{ color: AMBER }}
              >
                Share. Inspire.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 md:mt-7 text-base md:text-lg max-w-md leading-relaxed text-white/50 font-normal"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Join thousands of food lovers sharing recipes, posting food pictures,
              and building a vibrant halal food community.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              {!user && (
                <motion.button
                  onClick={() => router.push("/select-role")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 font-extrabold uppercase tracking-tighter text-sm sm:text-base"
                  style={{ backgroundColor: AMBER, color: BG }}
                >
                  Join Hub
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              )}

              <motion.button
                onClick={() => router.push("/hub/feed")}
                whileHover={{ scale: 1.03, backgroundColor: "rgba(255,255,255,0.06)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border-2 font-extrabold uppercase tracking-tighter text-sm sm:text-base text-white transition-all"
                style={{ borderColor: "rgba(255,255,255,0.18)" }}
              >
                Explore Feed
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex flex-wrap gap-6"
            >
              {[
                { Icon: Users,    text: "10K+ Members"       },
                { Icon: Globe,    text: "Global Community"   },
                { Icon: Sparkles, text: "Daily Content"      },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/35"
                >
                  <item.Icon className="w-4 h-4" style={{ color: AMBER }} />
                  {item.text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll dot */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-white/15 rounded-full flex justify-center pt-2"
          >
            <div className="w-1.5 h-3 rounded-full" style={{ backgroundColor: AMBER }} />
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Strip ──────────────────────────────────── */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gap: "1px", backgroundColor: "rgba(255,255,255,0.05)" }}
      >
        {[
          { value: "10K+", label: "Community Members" },
          { value: "5K+",  label: "Recipes Shared"    },
          { value: "500+", label: "Daily Posts"        },
          { value: "50+",  label: "Countries"          },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="py-10 md:py-14 px-8 md:px-12 text-center md:text-left"
            style={{ backgroundColor: BG2 }}
          >
            <div className="text-[3rem] md:text-[4.5rem] font-extrabold tracking-tighter leading-none text-white">
              {s.value}
            </div>
            <div
              className="text-[10px] md:text-xs uppercase tracking-[0.25em] mt-2 font-medium"
              style={{ color: `${AMBER}80` }}
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── What You Can Do ──────────────────────────────── */}
      <section
        ref={cardsRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={cardsInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: AMBER }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: AMBER }}
            >
              What You Can Do
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-white"
          >
            Connect.
            <br />
            <span className="text-white/40">Build Together.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-3"
          style={{ gap: "1px", backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          {whatYouCanDo.map((item, i) => {
            const Icon = item.Icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={cardsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <div
                  className="group relative p-8 md:p-10 overflow-hidden cursor-default min-h-[300px] flex flex-col transition-colors duration-300"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = AMBER)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG2)}
                  style={{
                    backgroundColor: BG2,
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Ghost number */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none text-white/[0.03]"
                  >
                    {item.num}
                  </span>
                  <div className="relative z-10 flex flex-col flex-1">
                    <Icon
                      className="w-7 h-7 mb-8 shrink-0 transition-colors duration-300 group-hover:text-[#0B0D0F]"
                      style={{ color: AMBER }}
                    />
                    <h3
                      className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter mb-4 text-white transition-colors duration-300 group-hover:text-[#0B0D0F]"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="leading-relaxed text-sm md:text-base text-white/50 transition-colors duration-300 group-hover:text-[#0B0D0F]/70 flex-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.desc}
                    </p>
                    <div
                      className="mt-8 flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-colors duration-300 group-hover:text-[#0B0D0F]"
                      style={{ color: AMBER }}
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Why Hub ──────────────────────────────────────── */}
      <section
        ref={featuresRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG2 }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={featuresInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: AMBER }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: AMBER }}
            >
              Why HalalMe Hub
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-white"
          >
            Your Food.
            <br />
            <span className="text-white/40">Your Community.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: "1px", backgroundColor: "rgba(255,255,255,0.05)" }}
        >
          {features.map((f, i) => {
            const Icon = f.Icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative p-8 overflow-hidden transition-colors duration-300 cursor-default"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F59E0B")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG3)}
                style={{
                  backgroundColor: BG3,
                  border: "1px solid rgba(255,255,255,0.05)",
                  minHeight: "220px",
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[7rem] font-extrabold leading-none select-none pointer-events-none text-white/[0.03]"
                >
                  {f.num}
                </span>
                <div className="relative z-10 flex flex-col" style={{ minHeight: "180px" }}>
                  <Icon
                    className="w-6 h-6 mb-6 transition-colors duration-300 group-hover:text-[#0B0D0F]"
                    style={{ color: AMBER }}
                  />
                  <h3
                    className="text-lg md:text-xl font-extrabold uppercase tracking-tighter mb-3 text-white transition-colors duration-300 group-hover:text-[#0B0D0F]"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed text-white/50 transition-colors duration-300 group-hover:text-[#0B0D0F]/65"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────── */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden py-28 md:py-36"
        style={{ backgroundColor: AMBER }}
      >
        <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-8 h-px bg-black/25" />
            <span className="text-black/40 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
              Ready to Join
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#0B0D0F] mb-10 max-w-4xl"
          >
            Start Sharing
            <br />
            Today.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg max-w-xl mb-12 leading-relaxed text-[#0B0D0F]/65"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Create your account and start building your halal food community today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <button
              onClick={() => router.push("/select-role")}
              className="flex items-center gap-3 px-8 py-4 bg-[#0B0D0F] text-white font-extrabold uppercase tracking-tighter text-base hover:bg-[#1a1e22] transition-colors"
            >
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/hub/feed")}
              className="flex items-center gap-3 px-8 py-4 border-2 border-[#0B0D0F]/30 text-[#0B0D0F] font-extrabold uppercase tracking-tighter text-base hover:bg-[#0B0D0F]/08 transition-colors"
            >
              Browse the Feed
            </button>
          </motion.div>

          <div className="flex flex-wrap gap-6 md:gap-10">
            {[
              { Icon: Users,    text: "10K+ Community Members" },
              { Icon: ChefHat, text: "5K+ Recipes Shared"      },
              { Icon: Globe,   text: "50+ Countries"            },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0B0D0F]/45">
                <item.Icon className="w-4 h-4" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-[#0B0D0F]/08 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
        >
          Hub
        </div>
      </section>

      {/* ─── Back links ───────────────────────────────────── */}
      <div
        className="px-6 py-8"
        style={{ backgroundColor: BG, borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-[95vw] mx-auto flex justify-between items-center">
          <Link
            href="/kitchen"
            className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-amber-400"
          >
            ← Kitchen
          </Link>
          <Link
            href="/rewards"
            className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-amber-400"
          >
            Rewards →
          </Link>
        </div>
      </div>
    </div>
  );
}
