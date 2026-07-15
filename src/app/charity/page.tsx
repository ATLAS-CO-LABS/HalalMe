"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  HandHeart,
  Droplets,
  Wheat,
  LifeBuoy,
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Receipt,
  Banknote,
  CheckCircle,
  CreditCard,
  Lock,
  Search,
  Users,
} from "lucide-react";

/* ─── Charity design tokens - dark emerald ────────────────── */
const BG = "#0F1F17"; // dark green, lifted from near-black
const BG2 = "#162B20"; // card sections
const CREAM = "#F7E7CE";
const TEAL = "#14B8A6";
const DEEP = "#0D9488"; // teal-600 - solid button bg

/* ─── Example causes for the landing showcase ─────────────── */
const EXAMPLE_CAUSES = [
  {
    icon: Droplets,
    category: "Clean Water",
    name: "Water Wells for Villages",
    desc: "Hand-pump wells bringing safe drinking water to remote communities.",
    raised: 18400,
    goal: 25000,
    donors: 412,
  },
  {
    icon: LifeBuoy,
    category: "Emergency Relief",
    name: "Emergency Family Relief",
    desc: "Food parcels, shelter kits, and medical aid where crisis strikes.",
    raised: 31200,
    goal: 40000,
    donors: 903,
  },
  {
    icon: HandHeart,
    category: "Orphan Care",
    name: "Orphan Sponsorship",
    desc: "Monthly care covering food, schooling, and healthcare for orphans.",
    raised: 9800,
    goal: 15000,
    donors: 267,
  },
  {
    icon: Wheat,
    category: "Food Security",
    name: "Community Food Banks",
    desc: "Weekly halal food packs for families facing hardship in the UK.",
    raised: 6200,
    goal: 10000,
    donors: 158,
  },
];

/* ─── Animated donation-flow demo ─────────────────────────── */

const DEMO_CAUSES = [
  { icon: Droplets, name: "Water Wells for Villages", category: "Clean Water" },
  { icon: LifeBuoy, name: "Emergency Family Relief", category: "Emergency" },
  { icon: Wheat, name: "Community Food Banks", category: "Food Security" },
];

const DEMO_AMOUNTS = [5, 10, 20, 50];

const FLOW_STEPS = [
  {
    title: "Choose a Cause",
    desc: "Every cause is a registered charity, verified before it ever appears.",
  },
  {
    title: "Pick an Amount",
    desc: "£5 or £500 - give what feels right, one-off, in seconds.",
  },
  {
    title: "Pay Securely",
    desc: "Card, Apple Pay, or Google Pay - processed by Stripe, never stored by us.",
  },
  {
    title: "Money Goes Direct",
    desc: "Your donation lands in the charity's own account. A receipt lands in your inbox.",
  },
];

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function DonationFlowDemo() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [phase, setPhase] = useState(0); // 0 choose, 1 amount, 2 pay, 3 done
  const [picked, setPicked] = useState(false); // sub-state: selection made in current phase
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        // Phase 0 - cause list appears, one gets selected
        setPhase(0); setPicked(false); setProcessing(false);
        await wait(1100); if (cancelled) break;
        setPicked(true);
        await wait(900); if (cancelled) break;

        // Phase 1 - amount chips, £20 selected
        setPhase(1); setPicked(false);
        await wait(1000); if (cancelled) break;
        setPicked(true);
        await wait(900); if (cancelled) break;

        // Phase 2 - payment sheet, then processing
        setPhase(2); setPicked(false);
        await wait(1200); if (cancelled) break;
        setProcessing(true);
        await wait(1300); if (cancelled) break;

        // Phase 3 - confirmation + breakdown
        setPhase(3); setProcessing(false);
        await wait(3200); if (cancelled) break;
      }
    };

    run();
    return () => { cancelled = true; };
  }, [inView]);

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="relative overflow-hidden py-24 md:py-32"
      style={{ backgroundColor: BG2, borderTop: `1px solid ${TEAL}50`, borderBottom: `1px solid ${TEAL}50` }}
    >
      {/* Ambient orbs */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: "-12%", left: "-6%", width: "55%", height: "55%",
          background: "radial-gradient(circle, rgba(13,148,136,0.10) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          bottom: "-12%", right: "-6%", width: "50%", height: "50%",
          background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]" style={{ color: TEAL }}>
            How Giving Works
          </span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* ── Left: copy + live step list ── */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tighter leading-[0.9] mb-6"
              style={{ color: CREAM }}
            >
              From Your Heart{" "}
              <motion.span
                style={{
                  background: `linear-gradient(135deg, ${TEAL}, ${DEEP}, ${TEAL})`,
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                to Their Hands
              </motion.span>{" "}
              in Under a Minute
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.22 }}
              className="text-sm md:text-base leading-relaxed mb-10 max-w-sm"
              style={{ color: `${CREAM}55`, fontFamily: "var(--font-body)" }}
            >
              Watch the whole journey - this is exactly what happens when you
              donate on HalalMe, from choosing a cause to the money arriving.
            </motion.p>

            {/* Live step list, synced to the demo */}
            <div className="flex flex-col gap-1">
              {FLOW_STEPS.map((step, i) => {
                const active = phase === i;
                const done = phase > i;
                return (
                  <motion.div
                    key={i}
                    className="flex items-start gap-4 px-4 py-3 transition-colors duration-300"
                    style={{
                      backgroundColor: active ? `${TEAL}12` : "transparent",
                      borderLeft: `2px solid ${active ? TEAL : done ? `${TEAL}50` : `${CREAM}10`}`,
                    }}
                  >
                    <span
                      className="w-6 h-6 flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 transition-colors duration-300"
                      style={{
                        backgroundColor: active ? TEAL : done ? `${TEAL}25` : `${CREAM}08`,
                        color: active ? "#fff" : done ? TEAL : `${CREAM}35`,
                      }}
                    >
                      {done ? "✓" : `0${i + 1}`}
                    </span>
                    <div>
                      <p
                        className="text-sm font-extrabold uppercase tracking-tighter transition-colors duration-300"
                        style={{ color: active ? CREAM : `${CREAM}${done ? "70" : "40"}`, fontFamily: "var(--font-headline)" }}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs leading-relaxed mt-0.5" style={{ color: `${CREAM}${active ? "55" : "30"}`, fontFamily: "var(--font-body)" }}>
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Right: animated donation window ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="relative max-w-md mx-auto w-full"
              animate={
                inView
                  ? {
                      boxShadow: [
                        "0 0 0px rgba(20,184,166,0)",
                        "0 0 30px rgba(20,184,166,0.12)",
                        "0 0 0px rgba(20,184,166,0)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(20,184,166,0.16)" }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2.5 px-4 py-3" style={{ borderBottom: "1px solid rgba(20,184,166,0.10)" }}>
                <HandHeart className="w-4 h-4" style={{ color: TEAL }} />
                <span className="text-[10px] font-black uppercase" style={{ color: CREAM, letterSpacing: "0.2em" }}>
                  Donate
                </span>
                <span className="text-[8px] font-medium ml-1" style={{ color: `${CREAM}30` }}>
                  · halalme.co.uk/charity
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <Lock className="w-3 h-3" style={{ color: "#4ade80" }} />
                  <span className="text-[8px] font-bold uppercase" style={{ color: "#4ade8080", letterSpacing: "0.14em" }}>
                    Secure
                  </span>
                </div>
              </div>

              {/* Body - morphs through the 4 phases */}
              <div className="px-4 py-5 min-h-71">
                <AnimatePresence mode="wait">
                  {/* Phase 0 - choose a cause */}
                  {phase === 0 && (
                    <motion.div
                      key="choose"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Search className="w-3 h-3" style={{ color: `${CREAM}30` }} />
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: `${CREAM}40` }}>
                          Verified causes near you
                        </span>
                      </div>
                      {DEMO_CAUSES.map((c, i) => {
                        const selected = picked && i === 0;
                        return (
                          <motion.div
                            key={i}
                            className="flex items-center gap-3 px-3 py-3 transition-colors duration-300"
                            animate={{
                              backgroundColor: selected ? "rgba(20,184,166,0.14)" : "rgba(247,231,206,0.02)",
                              borderColor: selected ? "rgba(20,184,166,0.5)" : "rgba(247,231,206,0.06)",
                            }}
                            style={{ border: "1px solid rgba(247,231,206,0.06)" }}
                          >
                            <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ backgroundColor: `${TEAL}15` }}>
                              <c.icon className="w-4 h-4" style={{ color: TEAL }} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-extrabold uppercase tracking-tighter truncate" style={{ color: CREAM }}>
                                {c.name}
                              </p>
                              <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: `${CREAM}35` }}>
                                {c.category}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <BadgeCheck className="w-3.5 h-3.5" style={{ color: selected ? TEAL : `${CREAM}20` }} />
                              {selected && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="text-[8px] font-bold uppercase tracking-[0.14em]"
                                  style={{ color: TEAL }}
                                >
                                  Selected
                                </motion.span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}

                  {/* Phase 1 - pick an amount */}
                  {phase === 1 && (
                    <motion.div
                      key="amount"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Droplets className="w-3.5 h-3.5" style={{ color: TEAL }} />
                        <span className="text-[10px] font-extrabold uppercase tracking-tighter" style={{ color: CREAM }}>
                          Water Wells for Villages
                        </span>
                      </div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: `${CREAM}40` }}>
                        Choose your donation
                      </p>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {DEMO_AMOUNTS.map((amt) => {
                          const selected = picked && amt === 20;
                          return (
                            <motion.div
                              key={amt}
                              className="py-3 text-center text-sm font-extrabold tracking-tighter transition-colors duration-300"
                              animate={{
                                backgroundColor: selected ? DEEP : "rgba(247,231,206,0.03)",
                                color: selected ? "#fff" : `${CREAM}60`,
                                scale: selected ? 1.05 : 1,
                              }}
                              style={{ border: `1px solid ${selected ? DEEP : "rgba(247,231,206,0.08)"}` }}
                            >
                              £{amt}
                            </motion.div>
                          );
                        })}
                      </div>
                      <AnimatePresence>
                        {picked && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="px-3 py-3 text-center"
                            style={{ backgroundColor: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)" }}
                          >
                            <p className="text-[10px]" style={{ color: `${CREAM}55`, fontFamily: "var(--font-body)" }}>
                              £20 provides clean water for a family for a month
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* Phase 2 - secure payment */}
                  {phase === 2 && (
                    <motion.div
                      key="pay"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: `${CREAM}40` }}>
                        Payment details
                      </p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-3 px-3 py-3" style={{ backgroundColor: "rgba(247,231,206,0.03)", border: "1px solid rgba(20,184,166,0.25)" }}>
                          <CreditCard className="w-4 h-4" style={{ color: TEAL }} />
                          <span className="text-xs tracking-widest" style={{ color: `${CREAM}70` }}>
                            •••• •••• •••• 4242
                          </span>
                          <span className="ml-auto text-[9px]" style={{ color: `${CREAM}30` }}>12/28</span>
                        </div>
                        <div className="flex justify-between px-3 py-2 text-[10px]" style={{ color: `${CREAM}45` }}>
                          <span>Donating to Water Wells for Villages</span>
                          <span className="font-extrabold" style={{ color: CREAM }}>£20.00</span>
                        </div>
                      </div>
                      <motion.div
                        className="w-full py-3.5 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-tighter text-white"
                        animate={{ backgroundColor: processing ? `${DEEP}90` : DEEP }}
                      >
                        {processing ? (
                          <>
                            <motion.span
                              className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full"
                              style={{ borderColor: "rgba(255,255,255,0.5)", borderTopColor: "transparent" }}
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            />
                            Processing…
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" /> Donate £20.00
                          </>
                        )}
                      </motion.div>
                      <div className="flex items-center justify-center gap-2 mt-3 text-[8px] uppercase tracking-[0.16em]" style={{ color: `${CREAM}25` }}>
                        <Lock className="w-2.5 h-2.5" /> Secured by Stripe · 256-bit SSL
                      </div>
                    </motion.div>
                  )}

                  {/* Phase 3 - confirmed + where the money went */}
                  {phase === 3 && (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35 }}
                      className="text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                        className="w-12 h-12 mx-auto mb-3 flex items-center justify-center"
                        style={{ backgroundColor: DEEP }}
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                      <p className="text-sm font-extrabold uppercase tracking-tighter mb-1" style={{ color: CREAM }}>
                        JazakAllah Khair
                      </p>
                      <p className="text-[10px] mb-4" style={{ color: `${CREAM}45`, fontFamily: "var(--font-body)" }}>
                        Your donation is on its way
                      </p>
                      <div className="space-y-1.5 text-left">
                        {[
                          { label: "To Water Wells for Villages", value: "£19.00", strong: true },
                          { label: "Platform fee (5%)", value: "£1.00", strong: false },
                          { label: "Receipt", value: "Sent to your email", strong: false },
                        ].map((row, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.15 }}
                            className="flex justify-between px-3 py-2.5 text-[10px]"
                            style={{
                              backgroundColor: row.strong ? "rgba(20,184,166,0.10)" : "rgba(247,231,206,0.02)",
                              border: `1px solid ${row.strong ? "rgba(20,184,166,0.25)" : "rgba(247,231,206,0.05)"}`,
                            }}
                          >
                            <span style={{ color: `${CREAM}50` }}>{row.label}</span>
                            <span className="font-extrabold" style={{ color: row.strong ? TEAL : `${CREAM}70` }}>
                              {row.value}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */

export default function CharityLandingPage() {
  const router = useRouter();

  const statsRef = useRef(null);
  const causesRef = useRef(null);
  const moneyRef = useRef(null);
  const ctaRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true });
  const causesInView = useInView(causesRef, { once: true });
  const moneyInView = useInView(moneyRef, { once: true });
  const ctaInView = useInView(ctaRef, { once: true });

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* ─── Hero ────────────────────────────────────────── */}
      <section
        className="relative mt-16 min-h-[calc(100svh-4rem)] flex items-center justify-center overflow-hidden py-12 md:py-16"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${TEAL}50` }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/page sections/rewards6.png"
            alt="Charity and giving"
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
              <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: TEAL }}
              >
                Verified Causes. Direct Giving. Real Impact.
              </span>
              <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            </motion.div>

            {/* H1 */}
            <h1 className="font-extrabold uppercase tracking-tighter leading-[0.88]">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="flex items-center justify-center gap-3 mb-3 normal-case"
              >
                <div
                  style={{
                    position: "relative",
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(255,255,255,0.92)", borderRadius: "50%" }} />
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
                Charity
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                className="block text-[clamp(1.5rem,4.5vw,4.5rem)]"
                style={{ color: CREAM }}
              >
                Give. Track. Transform.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 md:mt-7 text-base md:text-lg max-w-md leading-relaxed font-normal mx-auto"
              style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
            >
              Your sadaqah, delivered straight to verified charities. Choose a
              cause, give in under a minute, and watch your impact grow.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              <motion.button
                onClick={() => router.push("/charity/causes")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 font-extrabold uppercase tracking-tighter text-sm sm:text-base text-white"
                style={{ backgroundColor: DEEP }}
              >
                Start Donating
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              <motion.a
                href="#how-it-works"
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(247,231,206,0.06)",
                }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border-2 font-extrabold uppercase tracking-tighter text-sm sm:text-base transition-all"
                style={{ borderColor: `${CREAM}25`, color: CREAM }}
              >
                How It Works
              </motion.a>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex flex-wrap gap-6 justify-center"
            >
              {[
                { icon: ShieldCheck, text: "Verified Causes" },
                { icon: HandHeart, text: "£50K+ Donated" },
                { icon: Banknote, text: "Direct to Charity" },
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

      {/* ─── Donation flow demo ───────────────────────────── */}
      <DonationFlowDemo />

      {/* ─── Real-world causes showcase ───────────────────── */}
      <section
        ref={causesRef}
        className="py-24 md:py-32"
        style={{
          backgroundColor: BG,
          borderBottom: `1px solid ${TEAL}50`,
        }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20 flex flex-wrap items-end justify-between gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={causesInView ? { opacity: 1, x: 0 } : {}}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: TEAL }}
              >
                The Causes
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={causesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
              style={{ color: CREAM }}
            >
              Real Needs.
              <br />
              <span style={{ color: `${CREAM}65` }}>Real People.</span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={causesInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/charity/causes"
              className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-opacity hover:opacity-70"
              style={{ color: TEAL }}
            >
              Browse All Causes <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: "1px", backgroundColor: `${TEAL}50` }}
        >
          {EXAMPLE_CAUSES.map((cause, i) => {
            const pct = Math.round((cause.raised / cause.goal) * 100);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={causesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link href="/charity/causes" className="block h-full">
                  <div
                    className="group relative p-7 md:p-8 overflow-hidden cursor-pointer min-h-72 flex flex-col transition-colors duration-300 h-full"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1C3828")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG2)}
                    style={{ backgroundColor: BG2, border: `1px solid ${TEAL}50` }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: `${TEAL}15` }}>
                        <cause.icon className="w-5 h-5" style={{ color: TEAL }} />
                      </div>
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.18em] px-2.5 py-1"
                        style={{ color: TEAL, border: `1px solid ${TEAL}30` }}
                      >
                        {cause.category}
                      </span>
                    </div>

                    <h3
                      className="text-lg font-extrabold uppercase tracking-tighter mb-2 transition-colors duration-300 group-hover:text-white"
                      style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                    >
                      {cause.name}
                    </h3>
                    <p
                      className="text-xs leading-relaxed flex-1 mb-6"
                      style={{ color: `${CREAM}50`, fontFamily: "var(--font-body)" }}
                    >
                      {cause.desc}
                    </p>

                    {/* Animated progress */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-extrabold tracking-tighter" style={{ color: TEAL }}>
                          £{cause.raised.toLocaleString()}
                        </span>
                        <span style={{ color: `${CREAM}30` }}>of £{cause.goal.toLocaleString()}</span>
                      </div>
                      <div className="h-1 mb-3" style={{ backgroundColor: `${CREAM}10` }}>
                        <motion.div
                          className="h-full"
                          style={{ backgroundColor: TEAL }}
                          initial={{ width: 0 }}
                          animate={causesInView ? { width: `${pct}%` } : {}}
                          transition={{ duration: 1.2, delay: 0.4 + i * 0.15, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[10px]" style={{ color: `${CREAM}35` }}>
                          <Users className="w-3 h-3" /> {cause.donors} donors
                        </span>
                        <span
                          className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-tighter transition-colors duration-300 group-hover:text-white"
                          style={{ color: TEAL }}
                        >
                          Donate <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p
          className="max-w-[95vw] mx-auto px-6 md:px-10 mt-4 text-[10px] uppercase tracking-[0.15em]"
          style={{ color: `${CREAM}25` }}
        >
          Illustrative examples - live causes and totals are on the causes page
        </p>
      </section>

      {/* ─── Where your money goes ────────────────────────── */}
      <section
        ref={moneyRef}
        className="py-24 md:py-32"
        style={{
          backgroundColor: BG2,
          borderBottom: `1px solid ${TEAL}50`,
        }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={moneyInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: TEAL }}
            >
              Full Transparency
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={moneyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-6"
            style={{ color: CREAM }}
          >
            Where Your
            <br />
            <span style={{ color: `${CREAM}65` }}>Money Goes.</span>
          </motion.h2>
          <p
            className="max-w-xl text-sm md:text-base leading-relaxed"
            style={{ color: `${CREAM}55`, fontFamily: "var(--font-body)" }}
          >
            No pooled funds, no middlemen holding your donation. Payments are
            processed by Stripe and settle directly into each charity&apos;s own
            account - we never touch the money.
          </p>
        </div>

        {/* £20 split bar */}
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14">
          <div className="p-6 md:p-10" style={{ backgroundColor: BG, border: `1px solid ${TEAL}30` }}>
            <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: `${CREAM}40` }}>
                A £20 donation, split
              </span>
              <span className="text-2xl md:text-3xl font-extrabold tracking-tighter" style={{ color: CREAM }}>
                £20.00
              </span>
            </div>
            <div className="flex h-10 md:h-14 overflow-hidden mb-3">
              <motion.div
                className="flex items-center justify-center gap-2 min-w-0"
                style={{ backgroundColor: DEEP }}
                initial={{ width: "0%" }}
                animate={moneyInView ? { width: "95%" } : {}}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              >
                <span className="text-xs md:text-sm font-extrabold uppercase tracking-tighter text-white whitespace-nowrap px-2">
                  £19.00 → The charity
                </span>
              </motion.div>
              <motion.div
                className="flex items-center justify-center min-w-0"
                style={{ backgroundColor: `${CREAM}12` }}
                initial={{ width: "0%" }}
                animate={moneyInView ? { width: "5%" } : {}}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              >
                <span className="text-[9px] md:text-[10px] font-bold uppercase whitespace-nowrap px-1" style={{ color: `${CREAM}55` }}>
                  £1
                </span>
              </motion.div>
            </div>
            <p className="text-xs" style={{ color: `${CREAM}40`, fontFamily: "var(--font-body)" }}>
              95% goes straight to the cause. The 5% platform fee covers payment
              processing, charity verification, and keeping HalalMe Charity running.
            </p>
          </div>
        </div>

        {/* Trust cards */}
        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-3"
          style={{ gap: "1px", backgroundColor: `${TEAL}50` }}
        >
          {[
            {
              num: "01",
              icon: BadgeCheck,
              title: "Verified Before Listed",
              desc: "Every charity is checked against the Charity Commission register and completes Stripe identity verification before a single donation can flow.",
            },
            {
              num: "02",
              icon: Banknote,
              title: "Direct-to-Charity Payments",
              desc: "Your card payment settles into the charity's own Stripe account. HalalMe never holds, pools, or redirects donation funds.",
            },
            {
              num: "03",
              icon: Receipt,
              title: "Receipts & Records",
              desc: "An emailed receipt for every gift, plus a full donation history in your dashboard - handy for Gift Aid and zakat records.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={moneyInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-default min-h-60 flex flex-col transition-colors duration-300"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = DEEP)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG)}
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
                    style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Why give here ────────────────────────────────── */}
      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${TEAL}50` }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px" style={{ backgroundColor: TEAL }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: TEAL }}
            >
              Why HalalMe Charity
            </span>
          </div>
          <h2
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Giving Made
            <br />
            <span style={{ color: `${CREAM}65` }}>Simple &amp; Honest.</span>
          </h2>
        </div>

        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-10">
          <div className="relative w-full h-52 md:h-72 overflow-hidden">
            <Image
              src="/images/page sections/rewards1.png"
              alt="Why HalalMe Charity"
              fill
              className="object-cover"
              sizes="95vw"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to left, ${BG}70 0%, transparent 60%)`,
              }}
            />
          </div>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-2"
          style={{ gap: "1px", backgroundColor: `${TEAL}50` }}
        >
          {[
            {
              num: "01",
              icon: HandHeart,
              title: "Give Sadaqah & Zakat",
              desc: "Support meaningful causes with one-off gifts of any size - £5 to £500 and beyond, whenever the intention strikes.",
            },
            {
              num: "02",
              icon: ShieldCheck,
              title: "Only Verified Charities",
              desc: "Causes are vetted against official charity registers, so your giving always lands where it should.",
            },
            {
              num: "03",
              icon: Heart,
              title: "Track Your Impact",
              desc: "Your dashboard shows every donation, every cause, and your lifetime giving total in one place.",
            },
            {
              num: "04",
              icon: Receipt,
              title: "Records That Count",
              desc: "Instant email receipts and a permanent history - everything you need for Gift Aid claims and zakat accounting.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-default min-h-50 md:min-h-65 flex flex-col transition-colors duration-300"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = TEAL)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG2)}
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
                    style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
                  >
                    {item.desc}
                  </p>
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
              Someone, somewhere, is waiting on the generosity of a stranger.
              Pick a cause and be that stranger today.
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                onClick={() => router.push("/charity/causes")}
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
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-3 px-8 py-4 border-2 font-extrabold uppercase tracking-tighter text-base transition-all"
                style={{ borderColor: `rgba(255,255,255,0.4)`, color: "white" }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <Heart className="w-5 h-5" /> My Donations
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Watermark */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-white/10 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
        >
          Charity
        </div>
      </section>
    </div>
  );
}
