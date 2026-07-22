"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGate } from "@/hooks/useAuthGate";

const BG2 = "var(--kitchen-bg2)";
const CREAM = "var(--hm-text)";
const MAGENTA = "var(--hm-magenta)";
const DEEP = "var(--hm-magenta-deep)";

const DEMO_SEQUENCES = [
  [
    {
      role: "user",
      text: "I have chicken, rice and some spices. What can I make?",
    },
    {
      role: "assistant",
      text: "Perfect combo! Try Chicken Biryani - aromatic, layered and 100% halal. Want the full recipe?",
    },
  ],
  [
    { role: "user", text: "What's a quick halal breakfast under 15 minutes?" },
    {
      role: "assistant",
      text: "Egg paratha with mint chutney - ready in 12 mins. I'll walk you through every step.",
    },
  ],
  [
    { role: "user", text: "Can I substitute butter with something halal?" },
    {
      role: "assistant",
      text: "Yes! Use ghee for richness, or coconut oil for baking. Both are halal and work beautifully.",
    },
  ],
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function AQISection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const pausedRef = useRef(false);
  const router = useRouter();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();

  const [seqIdx, setSeqIdx] = useState(0);
  const [userVisible, setUserVisible] = useState(false);
  const [typing, setTyping] = useState(false);
  const [aiqVisible, setAiqVisible] = useState(false);
  const [inputPulse, setInputPulse] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    pausedRef.current = query.length > 0;
    if (query.length > 0) {
      setUserVisible(false);
      setTyping(false);
      setAiqVisible(false);
      setInputPulse(false);
    }
  }, [query]);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        // Pause while user is typing
        while (pausedRef.current && !cancelled) {
          await delay(200);
        }
        if (cancelled) break;

        setUserVisible(false);
        setTyping(false);
        setAiqVisible(false);
        setInputPulse(false);

        await delay(500);
        if (cancelled || pausedRef.current) continue;
        setInputPulse(true);
        await delay(600);
        if (cancelled || pausedRef.current) continue;
        setInputPulse(false);
        setUserVisible(true);

        await delay(900);
        if (cancelled || pausedRef.current) continue;
        setTyping(true);

        await delay(1400);
        if (cancelled || pausedRef.current) continue;
        setTyping(false);
        setAiqVisible(true);

        await delay(2800);
        if (cancelled) break;

        setSeqIdx((i) => (i + 1) % DEMO_SEQUENCES.length);
        await delay(400);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [inView]);

  const currentSeq = DEMO_SEQUENCES[seqIdx];

  const handleSubmit = () => {
    const text = query.trim();
    if (!text) return;
    sessionStorage.setItem("aqi_pending_message", text);
    if (user) {
      router.push("/kitchen/ai-assistant");
    } else {
      requireAuth(
        () => router.push("/kitchen/ai-assistant"),
        "Sign up to chat with AQI - your personal halal cooking assistant"
      );
    }
  };

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 md:py-32"
      style={{ backgroundColor: BG2, borderTop: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)`, borderBottom: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)` }}
    >
      {/* Animated background orbs */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: "-10%",
          left: "-5%",
          width: "55%",
          height: "55%",
          background:
            "radial-gradient(circle, rgba(196,30,115,0.09) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          bottom: "-10%",
          right: "-5%",
          width: "50%",
          height: "50%",
          background:
            "radial-gradient(circle, rgba(240,62,158,0.07) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      />

      <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px" style={{ backgroundColor: MAGENTA }} />
          <span
            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: MAGENTA }}
          >
            AI Kitchen Assistant
          </span>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* ── Left: copy + CTA ── */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tighter leading-[0.9] mb-6"
              style={{ color: CREAM }}
            >
              Meet AQI -{" "}
              <motion.span
                style={{
                  background: `linear-gradient(135deg, ${MAGENTA}, ${DEEP}, ${MAGENTA})`,
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                Your AI Kitchen
              </motion.span>{" "}
              Assistant
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.22 }}
              className="text-sm md:text-base leading-relaxed mb-8 max-w-sm"
              style={{ color: `color-mix(in oklab, var(--hm-text) 33%, var(--hm-lm-anchor))` }}
            >
              Cook smarter with AI-powered recipes, guidance, and substitutions
              - halal every time.
            </motion.p>

            {/* Feature pills with stagger */}
            <motion.div
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              variants={{
                show: {
                  transition: { staggerChildren: 0.1, delayChildren: 0.3 },
                },
              }}
              className="flex flex-col gap-2 mb-10"
            >
              {[
                "Recipe ideas from your fridge",
                "Step-by-step cooking guidance",
                "Full Halal ingredient database",
              ].map((text, i) => (
                <motion.div
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -16 },
                    show: { opacity: 1, x: 0 },
                  }}
                  className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: `color-mix(in oklab, var(--hm-text) 33%, var(--hm-lm-anchor))` }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 shrink-0"
                    style={{ backgroundColor: MAGENTA }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                  {text}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ── Right: animated chat demo ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="relative"
              animate={
                inView
                  ? {
                      boxShadow: [
                        `0 0 0px rgba(240,62,158,0)`,
                        `0 0 30px rgba(240,62,158,0.12)`,
                        `0 0 0px rgba(240,62,158,0)`,
                      ],
                    }
                  : {}
              }
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(240,62,158,0.14)",
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center gap-2.5 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(240,62,158,0.08)" }}
              >
                <Image
                  src="/logo/aqi.png"
                  alt="AQI"
                  width={20}
                  height={20}
                  className="object-contain rounded-full bg-white p-1"
                />
                <span
                  className="text-[10px] font-black uppercase"
                  style={{ color: CREAM, letterSpacing: "0.2em" }}
                >
                  AQI
                </span>
                <span
                  className="text-[8px] font-medium ml-1"
                  style={{ color: `color-mix(in oklab, var(--hm-text) 19%, var(--hm-lm-anchor))` }}
                >
                  · AI Kitchen Assistant
                </span>
                <div className="flex items-center gap-1 ml-auto">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#4ade80" }}
                    animate={{
                      boxShadow: [
                        "0 0 2px #4ade80",
                        "0 0 8px #4ade80",
                        "0 0 2px #4ade80",
                      ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  />
                  <span
                    className="text-[8px] font-bold uppercase"
                    style={{ color: "#4ade8080", letterSpacing: "0.14em" }}
                  >
                    Online
                  </span>
                </div>
              </div>

              {/* Messages area */}
              <div className="px-4 py-5 space-y-3 min-h-35">
                <AnimatePresence mode="wait">
                  {userVisible && (
                    <motion.div
                      key={`user-${seqIdx}`}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.28 }}
                      className="flex justify-end"
                    >
                      <div
                        className="max-w-[78%] px-3.5 py-2.5 text-xs leading-relaxed"
                        style={{
                          background: `color-mix(in oklab, var(--hm-magenta) 12%, var(--kitchen-bg2))`,
                          border: "1px solid rgba(240,62,158,0.18)",
                          color: CREAM,
                        }}
                      >
                        {currentSeq[0].text}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {typing && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Image
                          src="/logo/aqi.png"
                          alt="AQI"
                          width={12}
                          height={12}
                          className="object-contain rounded-full bg-white p-0.5"
                        />
                        <span
                          className="text-[8px] font-black uppercase"
                          style={{
                            color: `color-mix(in oklab, var(--hm-magenta) 56%, var(--hm-text))`,
                            letterSpacing: "0.22em",
                          }}
                        >
                          AQI
                        </span>
                      </div>
                      <div
                        className="ml-2 px-3 py-2.5 flex items-center gap-1"
                        style={{
                          background: "var(--kitchen-bubble-bg)",
                          border: "1px solid rgba(240,62,158,0.10)",
                          borderLeft: `3px solid color-mix(in oklab, var(--hm-magenta) 44%, transparent)`,
                        }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="block w-1.5 h-1.5"
                            style={{ background: MAGENTA }}
                            animate={{
                              opacity: [0.2, 1, 0.2],
                              scaleY: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.16,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {aiqVisible && (
                    <motion.div
                      key={`aiq-${seqIdx}`}
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[82%]">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Image
                            src="/logo/aqi.png"
                            alt="AQI"
                            width={12}
                            height={12}
                            className="object-contain rounded-full bg-white p-0.5"
                          />
                          <span
                            className="text-[8px] font-black uppercase"
                            style={{
                              color: `color-mix(in oklab, var(--hm-magenta) 56%, var(--hm-text))`,
                              letterSpacing: "0.22em",
                            }}
                          >
                            AQI
                          </span>
                        </div>
                        <div
                          className="px-3.5 py-2.5 text-xs leading-relaxed"
                          style={{
                            background: "var(--kitchen-bubble-bg)",
                            border: "1px solid rgba(240,62,158,0.10)",
                            borderLeft: `3px solid color-mix(in oklab, var(--hm-magenta) 44%, transparent)`,
                            color: `color-mix(in oklab, var(--hm-text) 80%, var(--hm-lm-anchor))`,
                          }}
                        >
                          {currentSeq[1].text}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input row - real functional input */}
              <motion.div
                className="flex items-center gap-2 mx-4 mb-4 px-3 py-2"
                animate={
                  inputPulse
                    ? {
                        borderColor: `rgba(240,62,158,0.5)`,
                        boxShadow: "0 0 10px rgba(240,62,158,0.12)",
                      }
                    : {
                        borderColor: "rgba(240,62,158,0.08)",
                        boxShadow: "none",
                      }
                }
                transition={{ duration: 0.3 }}
                style={{ border: "1px solid rgba(240,62,158,0.08)" }}
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                  placeholder="Ask AQI anything…"
                  className="flex-1 bg-transparent outline-none text-[11px] min-w-0"
                  style={{ color: query ? CREAM : `color-mix(in oklab, var(--hm-text) 19%, transparent)`, caretColor: MAGENTA }}
                />
                <motion.button
                  onClick={handleSubmit}
                  className="w-6 h-6 flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${DEEP}, ${MAGENTA})` }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                >
                  <ArrowRight className="w-3 h-3 text-white" />
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
