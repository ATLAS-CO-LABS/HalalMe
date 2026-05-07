"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  HandHeart,
  Gift,
  Star,
  Globe,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

/* ─── Rewards design tokens - dark emerald ────────────────── */
const BG = "#0F1F17"; // dark green, lifted from near-black
const BG2 = "#162B20"; // card sections
const CREAM = "#F7E7CE";
const TEAL = "#14B8A6";
const DEEP = "#0D9488"; // teal-600 - solid button bg

export default function RewardsLandingPage() {
  const router = useRouter();

  const statsRef = useRef(null);
  const cardsRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true });
  const cardsInView = useInView(cardsRef, { once: true });
  const featuresRef2 = useInView(featuresRef, { once: true });
  const ctaInView = useInView(ctaRef, { once: true });

  const features = [
    {
      num: "01",
      icon: HandHeart,
      title: "Give Sadaqah",
      desc: "Support meaningful causes and earn rewards with every donation you make.",
    },
    {
      num: "02",
      icon: Gift,
      title: "Earn Rewards",
      desc: "Get points, badges, and exclusive benefits within the HalalMe ecosystem.",
    },
    {
      num: "03",
      icon: Star,
      title: "Level Up",
      desc: "Unlock Bronze, Silver, Gold, and Platinum status as you give more.",
    },
    {
      num: "04",
      icon: TrendingUp,
      title: "Track Impact",
      desc: "See exactly how your donations are making a difference in real lives.",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* ─── Hero ────────────────────────────────────────── */}
      <section
        className="relative mt-16 min-h-[calc(100svh-4rem)] flex items-center overflow-hidden py-12 md:py-16"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${TEAL}50` }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/services/halal04.png"
            alt="Charity and giving"
            fill
            className="object-cover opacity-100 object-center"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${BG}F5 0%, ${BG}D0 30%, ${BG}99 55%, ${BG}22 100%)`,
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[95vw] mx-auto px-6 md:px-10">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-6 md:mb-8"
            >
              <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: TEAL }}
              >
                Donate Good. Feel Good. Get Rewarded.
              </span>
            </motion.div>

            {/* H1 */}
            <h1 className="font-extrabold uppercase tracking-tighter leading-[0.88]">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="flex items-center gap-3 mb-3 normal-case"
              >
                <div
                  style={{
                    position: "relative",
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: TEAL,
                      WebkitMaskImage: "url(/logo/logo.png)",
                      maskImage: "url(/logo/logo.png)",
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskMode: "alpha",
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
                style={{ color: TEAL }}
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
                Give. Earn. Grow.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 md:mt-7 text-base md:text-lg max-w-md leading-relaxed font-normal"
              style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
            >
              Give charity, earn rewards, and make a real impact. Support causes
              you care about while unlocking exclusive benefits within HalalMe.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <motion.button
                onClick={() => router.push("/rewards/causes")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 font-extrabold uppercase tracking-tighter text-sm sm:text-base text-white"
                style={{ backgroundColor: DEEP }}
              >
                Start Donating
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              <motion.button
                onClick={() => router.push("/rewards/my-rewards")}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(247,231,206,0.06)",
                }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border-2 font-extrabold uppercase tracking-tighter text-sm sm:text-base transition-all"
                style={{ borderColor: `${CREAM}25`, color: CREAM }}
              >
                My Rewards
              </motion.button>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex flex-wrap gap-6"
            >
              {[
                { icon: ShieldCheck, text: "Verified Causes" },
                { icon: HandHeart, text: "£50K+ Donated" },
                { icon: Gift, text: "Instant Rewards" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: `${CREAM}65` }}
                >
                  <item.icon className="w-4 h-4" style={{ color: TEAL }} />
                  {item.text}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats Strip ──────────────────────────────────── */}
      <div
        ref={statsRef}
        className="grid grid-cols-2 md:grid-cols-4"
        style={{
          gap: "1px",
          backgroundColor: `${TEAL}50`,
          borderTop: `1px solid ${TEAL}50`,
          borderBottom: `1px solid ${TEAL}50`,
        }}
      >
        {[
          { value: "£50K+", label: "Total Donated" },
          { value: "25+", label: "Causes Supported" },
          { value: "2K+", label: "Active Donors" },
          { value: "30+", label: "Countries Reached" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="py-10 md:py-14 px-8 md:px-12 text-center md:text-left"
            style={{ backgroundColor: BG2 }}
          >
            <div
              className="text-[3rem] md:text-[4.5rem] font-extrabold tracking-tighter leading-none"
              style={{ color: CREAM }}
            >
              {s.value}
            </div>
            <div
              className="text-[10px] md:text-xs uppercase tracking-[0.25em] mt-2 font-medium"
              style={{ color: TEAL }}
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── How It Works ─────────────────────────────────── */}
      <section
        ref={cardsRef}
        className="py-24 md:py-32"
        style={{
          backgroundColor: BG,
          borderTop: `1px solid ${TEAL}50`,
          borderBottom: `1px solid ${TEAL}50`,
        }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={cardsInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: TEAL }}
            >
              How It Works
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Give.
            <br />
            <span style={{ color: `${CREAM}65` }}>Earn. Grow.</span>
          </motion.h2>
        </div>

        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-10">
          <div className="relative w-full h-52 md:h-72 overflow-hidden">
            <Image
              src="/images/page sections/rewards2.png"
              alt="Giving and earning rewards"
              fill
              className="object-cover"
              sizes="95vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${BG}60 0%, transparent 60%)`,
              }}
            />
          </div>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-3"
          style={{ gap: "1px", backgroundColor: `${TEAL}50` }}
        >
          {[
            {
              num: "01",
              title: "Choose a Cause",
              icon: Heart,
              desc: "Browse through verified charity causes and select one that resonates with you.",
            },
            {
              num: "02",
              title: "Make a Donation",
              icon: HandHeart,
              desc: "Donate any amount - £5, £10, £20, or a custom amount of your choice.",
            },
            {
              num: "03",
              title: "Earn Rewards",
              icon: Gift,
              desc: "Receive points, unlock badges, and level up your contribution status.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={cardsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-default min-h-[200px] md:min-h-[300px] flex flex-col transition-colors duration-300"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = DEEP)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BG2)
                }
                style={{ backgroundColor: BG2, border: `1px solid ${TEAL}50` }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none"
                  style={{ color: "#0A1A10" }}
                >
                  {item.num}
                </span>
                <div className="relative z-10 flex flex-col flex-1">
                  <item.icon
                    className="w-7 h-7 mb-8 shrink-0 transition-colors duration-300 group-hover:text-white"
                    style={{ color: TEAL }}
                  />
                  <h3
                    className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter mb-4 transition-colors duration-300 group-hover:text-white"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="leading-relaxed text-sm md:text-base transition-colors duration-300 group-hover:text-white/80 flex-1"
                    style={{
                      color: `${CREAM}75`,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.desc}
                  </p>
                  <div
                    className="mt-8 flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-colors duration-300 group-hover:text-white"
                    style={{ color: TEAL }}
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────── */}
      <section
        ref={featuresRef}
        className="py-24 md:py-32"
        style={{
          backgroundColor: BG2,
          borderTop: `1px solid ${TEAL}50`,
          borderBottom: `1px solid ${TEAL}50`,
        }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={featuresRef2 ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: TEAL }}
            >
              Why HalalMe Rewards
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={featuresRef2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Charity That
            <br />
            <span style={{ color: `${CREAM}65` }}>Rewards You.</span>
          </motion.h2>
        </div>

        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-10">
          <div className="relative w-full h-52 md:h-72 overflow-hidden">
            <Image
              src="/images/page sections/rewards1.png"
              alt="Why HalalMe Rewards"
              fill
              className="object-cover"
              sizes="95vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to left, ${BG2}70 0%, transparent 60%)`,
              }}
            />
          </div>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-2"
          style={{ gap: "1px", backgroundColor: `${TEAL}50` }}
        >
          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={featuresRef2 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-default min-h-[200px] md:min-h-[260px] flex flex-col transition-colors duration-300"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = TEAL)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BG)
                }
                style={{ backgroundColor: BG, border: `1px solid ${TEAL}50` }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none"
                  style={{ color: "#0A1A10" }}
                >
                  {item.num}
                </span>
                <div className="relative z-10 flex flex-col flex-1">
                  <item.icon
                    className="w-7 h-7 mb-6 shrink-0 transition-colors duration-300 group-hover:text-white"
                    style={{ color: TEAL }}
                  />
                  <h3
                    className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter mb-3 transition-colors duration-300 group-hover:text-white"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="leading-relaxed text-sm transition-colors duration-300 group-hover:text-white/80"
                    style={{
                      color: `${CREAM}75`,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Tiers ────────────────────────────────────────── */}
      <section
        className="py-24 md:py-32"
        style={{
          backgroundColor: BG,
          borderTop: `1px solid ${TEAL}50`,
          borderBottom: `1px solid ${TEAL}50`,
        }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: TEAL }}
            >
              Status Levels
            </span>
          </div>
          <h2
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Contribution
            <br />
            <span style={{ color: `${CREAM}65` }}>Levels.</span>
          </h2>
        </div>

        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-10">
          <div className="relative w-full h-52 md:h-72 overflow-hidden">
            <Image
              src="/images/page sections/rewards3.png"
              alt="Contribution levels"
              fill
              className="object-cover"
              sizes="95vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, transparent 40%, ${BG}CC 100%)`,
              }}
            />
          </div>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4"
          style={{ gap: "1px", backgroundColor: `${CREAM}08` }}
        >
          {[
            { level: "Bronze", req: "£25+", bg: "#B87333", hover: "#CD8B4A" },
            { level: "Silver", req: "£100+", bg: "#9EA3A8", hover: "#C0C0C0" },
            { level: "Gold", req: "£500+", bg: "#D4AF37", hover: "#FFD700" },
            {
              level: "Platinum",
              req: "£1000+",
              bg: "#8B8FA8",
              hover: "#A8ADBE",
            },
          ].map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div
                className="group p-6 md:p-10 flex flex-col items-center text-center min-h-[180px] md:min-h-[220px] justify-center transition-colors duration-300 cursor-default"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = tier.hover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BG2)
                }
                style={{ backgroundColor: BG2, border: `1px solid ${CREAM}05` }}
              >
                <div
                  className="w-14 h-14 rounded-full mb-5 flex items-center justify-center"
                  style={{ backgroundColor: tier.bg }}
                >
                  <Star className="w-7 h-7 text-white" />
                </div>
                <h3
                  className="text-xl font-extrabold uppercase tracking-tighter mb-1 transition-colors duration-300 group-hover:text-white"
                  style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                >
                  {tier.level}
                </h3>
                <p
                  className="text-sm transition-colors duration-300 group-hover:text-white/70"
                  style={{
                    color: `${CREAM}65`,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {tier.req} donated
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden py-24 md:py-32"
        style={{ backgroundColor: TEAL }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-white/40" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/60">
                Get Started
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-8 text-white">
              Ready to Make
              <br />
              <span className="text-white/60">a Difference?</span>
            </h2>
            <p
              className="text-base md:text-lg max-w-xl leading-relaxed mb-10 font-normal text-white/70"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Start your giving journey today and earn rewards while supporting
              causes that matter to you and your community.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => router.push("/rewards/causes")}
                className="flex items-center gap-3 px-8 py-4 font-extrabold uppercase tracking-tighter text-base text-white"
                style={{ backgroundColor: BG }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: `0 20px 50px -12px rgba(0,0,0,0.3)`,
                }}
                whileTap={{ scale: 0.97 }}
              >
                Browse Causes <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => router.push("/rewards/my-rewards")}
                className="flex items-center gap-3 px-8 py-4 border-2 font-extrabold uppercase tracking-tighter text-base transition-all"
                style={{ borderColor: `rgba(255,255,255,0.4)`, color: "white" }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <Globe className="w-5 h-5" /> My Rewards
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Watermark */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-white/10 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
        >
          Rewards
        </div>
      </section>
    </div>
  );
}
