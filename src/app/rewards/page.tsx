"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Coins,
  Award,
  Gift,
  Star,
  Sparkles,
  Megaphone,
  Palette,
  ChefHat,
  ArrowRight,
  Lock,
  HandHeart,
} from "lucide-react";

/* ─── Rewards design tokens - dark emerald + warm rose ─────────── */
const BG = "#0F1F17";
const BG2 = "#162B20";
const CREAM = "#F7E7CE";
const ROSE = "#FB7185";
const ROSE_DEEP = "#E11D48";

const TIERS = [
  { level: "Bronze", min: 0, aiPerHour: 10, bg: "#B87333", hover: "#CD8B4A" },
  { level: "Silver", min: 1000, aiPerHour: 20, bg: "#9EA3A8", hover: "#C0C0C0" },
  { level: "Gold", min: 5000, aiPerHour: 30, bg: "#D4AF37", hover: "#FFD700" },
  { level: "Diamond", min: 15000, aiPerHour: 50, bg: "#0E7490", hover: "#22B6DD" },
];

const EARN_WAYS = [
  { icon: HandHeart, title: "Donate to Charity", desc: "10 points per £1 donated through HalalMe Charity", href: "/charity" },
  { icon: ChefHat, title: "Upload a Recipe", desc: "+50 points the first time, plus review bonuses", href: "/kitchen" },
  { icon: Megaphone, title: "Post in the Hub", desc: "+50 for your first post, +20 for every post after", href: "/hub" },
  { icon: Star, title: "Log In Daily", desc: "+10 points just for showing up, plus a one-off referral bonus", href: "/dashboard?tab=rewards" },
];

const REDEEM_CATEGORIES = [
  { icon: Palette, title: "Profile Flair", desc: "Stand out in Hub with an exclusive profile flair." },
  { icon: Megaphone, title: "Hub Post Boost", desc: "Feature one of your posts in the discover feed." },
  { icon: ChefHat, title: "Recipe Boost", desc: "Get one of your recipes featured for extra reach." },
  { icon: Sparkles, title: "AI Power-Up", desc: "Unlock extra AI requests when you need them most." },
];

export default function RewardsLandingPage() {
  const router = useRouter();

  const earnRef = useRef(null);
  const tiersRef = useRef(null);
  const redeemRef = useRef(null);
  const ctaRef = useRef(null);

  const earnInView = useInView(earnRef, { once: true });
  const tiersInView = useInView(tiersRef, { once: true });
  const redeemInView = useInView(redeemRef, { once: true });
  const ctaInView = useInView(ctaRef, { once: true });

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* ─── Hero ────────────────────────────────────────── */}
      <section
        className="relative mt-16 min-h-[calc(100svh-4rem)] flex items-center justify-center overflow-hidden py-12 md:py-16"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${ROSE}50` }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/services/rewards.png"
            alt="Earn and redeem rewards"
            fill
            className="object-cover opacity-100 object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ backgroundColor: `${BG}CC` }} />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 0%, ${BG}50 55%, ${BG}90 100%)`,
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 w-full">
          <div className="max-w-4xl w-full flex flex-col items-center">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3 mb-6 md:mb-8"
            >
              <div className="w-8 h-px" style={{ backgroundColor: ROSE }} />
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: ROSE }}
              >
                Earn Across HalalMe. Redeem Anytime.
              </span>
              <div className="w-8 h-px" style={{ backgroundColor: ROSE }} />
            </motion.div>

            {/* H1 */}
            <h1 className="font-extrabold uppercase tracking-tighter leading-[0.88]">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="flex items-center justify-center gap-3 mb-3 normal-case"
              >
                <div style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: ROSE,
                      WebkitMaskImage: "url(/logo/logo.png)",
                      maskImage: "url(/logo/logo.png)",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      maskMode: "alpha",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                    }}
                  />
                </div>
                <span
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
                  style={{ fontFamily: "var(--font-logo)", color: CREAM }}
                >
                  HalalMe
                </span>
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.7 }}
                className="block text-[clamp(2.25rem,8vw,8rem)]"
                style={{ color: ROSE }}
              >
                Rewards
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                className="block text-[clamp(1.5rem,4.5vw,4.5rem)]"
                style={{ color: CREAM }}
              >
                Earn. Redeem. Repeat.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 md:mt-7 text-base md:text-lg max-w-md leading-relaxed font-normal mx-auto"
              style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
            >
              Every recipe, post, and donation earns points. Climb the tiers
              and redeem for perks across the whole HalalMe ecosystem.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              <motion.button
                onClick={() => router.push("/dashboard?tab=rewards")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 font-extrabold uppercase tracking-tighter text-sm sm:text-base"
                style={{ backgroundColor: ROSE_DEEP, color: BG }}
              >
                View My Rewards
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              <motion.button
                onClick={() => router.push("/charity")}
                whileHover={{ scale: 1.03, backgroundColor: "rgba(247,231,206,0.06)" }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border-2 font-extrabold uppercase tracking-tighter text-sm sm:text-base transition-all"
                style={{ borderColor: `${CREAM}25`, color: CREAM }}
              >
                Give to Charity
              </motion.button>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex flex-wrap gap-6 justify-center"
            >
              {[
                { icon: Coins, text: "4 Ways to Earn" },
                { icon: Award, text: "4 Status Tiers" },
                { icon: Gift, text: "Instant Redemption" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: `${CREAM}65` }}
                >
                  <item.icon className="w-4 h-4" style={{ color: ROSE }} />
                  {item.text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Ways to Earn ──────────────────────────────────── */}
      <section
        ref={earnRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${ROSE}50` }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={earnInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: ROSE }} />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ROSE }}>
              Ways to Earn
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={earnInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Points From
            <br />
            <span style={{ color: `${CREAM}65` }}>Everywhere You Go.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-2 lg:grid-cols-4"
          style={{ gap: "1px", backgroundColor: `${ROSE}50` }}
        >
          {EARN_WAYS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={earnInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <a
                href={item.href}
                className="group relative p-8 overflow-hidden cursor-pointer min-h-55 flex flex-col transition-colors duration-300"
                style={{ backgroundColor: BG2, border: `1px solid ${ROSE}50` }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ROSE_DEEP)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG2)}
              >
                <item.icon
                  className="w-7 h-7 mb-6 shrink-0 transition-colors duration-300 group-hover:text-white"
                  style={{ color: ROSE }}
                />
                <h3
                  className="text-lg font-extrabold uppercase tracking-tighter mb-3 transition-colors duration-300 group-hover:text-white"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="leading-relaxed text-sm transition-colors duration-300 group-hover:text-white/80"
                  style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
                >
                  {item.desc}
                </p>
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Tiers ────────────────────────────────────────── */}
      <section
        ref={tiersRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG2, borderBottom: `1px solid ${ROSE}50` }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px" style={{ backgroundColor: ROSE }} />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ROSE }}>
              Status Tiers
            </span>
          </div>
          <h2
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-6"
            style={{ color: CREAM }}
          >
            Bronze to
            <br />
            <span style={{ color: `${CREAM}65` }}>Diamond.</span>
          </h2>
          <p
            className="max-w-xl text-sm md:text-base leading-relaxed"
            style={{ color: `${CREAM}55`, fontFamily: "var(--font-body)" }}
          >
            Your tier is set by your lifetime points and never resets. Higher
            tiers unlock more AI requests per hour on top of every redemption perk.
          </p>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4"
          style={{ gap: "1px", backgroundColor: `${CREAM}08` }}
        >
          {TIERS.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={tiersInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div
                className="group p-6 md:p-10 flex flex-col items-center text-center transition-colors duration-300 cursor-default"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${tier.bg}18`)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG)}
                style={{ backgroundColor: BG, border: `1px solid ${CREAM}05`, borderTop: `2px solid ${tier.bg}` }}
              >
                <div className="relative mb-6 mt-2">
                  <div
                    className="w-20 h-20 flex items-center justify-center"
                    style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", backgroundColor: `${tier.bg}30` }}
                  >
                    <div
                      className="w-16 h-16 flex items-center justify-center"
                      style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", background: `linear-gradient(135deg, ${tier.bg}, ${tier.hover})` }}
                    >
                      <Star className="w-6 h-6 text-white drop-shadow" fill="white" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-extrabold uppercase tracking-tighter mb-1" style={{ color: tier.bg, fontFamily: "var(--font-headline)" }}>
                  {tier.level}
                </h3>
                <p className="text-sm mb-2" style={{ color: `${CREAM}65`, fontFamily: "var(--font-body)" }}>
                  {tier.min.toLocaleString()}+ pts
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: `${CREAM}35` }}>
                  {tier.aiPerHour} AI req/hr
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Redeem ───────────────────────────────────────── */}
      <section
        ref={redeemRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${ROSE}50` }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={redeemInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: ROSE }} />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: ROSE }}>
              Spend Your Points
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={redeemInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Redeem For
            <br />
            <span style={{ color: `${CREAM}65` }}>Real Perks.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-2 lg:grid-cols-4"
          style={{ gap: "1px", backgroundColor: `${ROSE}50` }}
        >
          {REDEEM_CATEGORIES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={redeemInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div
                className="group relative p-8 overflow-hidden cursor-default min-h-55 flex flex-col transition-colors duration-300"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ROSE)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG2)}
                style={{ backgroundColor: BG2, border: `1px solid ${ROSE}50` }}
              >
                <item.icon
                  className="w-7 h-7 mb-6 shrink-0 transition-colors duration-300 group-hover:text-white"
                  style={{ color: ROSE }}
                />
                <h3
                  className="text-lg font-extrabold uppercase tracking-tighter mb-3 transition-colors duration-300 group-hover:text-white"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="leading-relaxed text-sm transition-colors duration-300 group-hover:text-white/80"
                  style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
                >
                  {item.desc}
                </p>
                <div className="mt-auto pt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: `${CREAM}30` }}>
                  <Lock className="w-3 h-3" /> Unlocks by tier
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden py-24 md:py-32"
        style={{ backgroundColor: ROSE }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#0F1F17]/40" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: `${BG}90` }}>
                Get Started
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-8" style={{ color: BG }}>
              Ready to Start
              <br />
              <span style={{ color: `${BG}70` }}>Earning?</span>
            </h2>
            <p
              className="text-base md:text-lg max-w-xl leading-relaxed mb-10 font-normal"
              style={{ color: `${BG}90`, fontFamily: "var(--font-body)" }}
            >
              Post a recipe, share in the Hub, or donate to charity — every
              action moves you closer to your next tier.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => router.push("/dashboard?tab=rewards")}
                className="flex items-center gap-3 px-8 py-4 font-extrabold uppercase tracking-tighter text-base"
                style={{ backgroundColor: BG, color: CREAM }}
                whileHover={{ scale: 1.03, boxShadow: `0 20px 50px -12px rgba(0,0,0,0.3)` }}
                whileTap={{ scale: 0.97 }}
              >
                View My Rewards <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => router.push("/charity")}
                className="flex items-center gap-3 px-8 py-4 border-2 font-extrabold uppercase tracking-tighter text-base transition-all"
                style={{ borderColor: `${BG}40`, color: BG }}
                whileHover={{ scale: 1.03, backgroundColor: "rgba(15,31,23,0.1)" }}
                whileTap={{ scale: 0.97 }}
              >
                <HandHeart className="w-5 h-5" /> Give to Charity
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Watermark */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-[#0F1F17]/10 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
        >
          Rewards
        </div>
      </section>
    </div>
  );
}
