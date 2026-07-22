"use client";

import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChefHat,
  Utensils,
  Globe,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import AQISection from "./AQISection";
import { recipeService } from "@/services/recipeService";
import { cldUrl } from "@/lib/cldUrl";
import type { Recipe } from "@/types";

/* ─── Magenta base - matches AI assistant palette ───── */
const BG = "var(--kitchen-bg)";
const BG2 = "var(--kitchen-bg2)";
const CREAM = "var(--hm-text)";
const MAGENTA = "var(--hm-magenta)";
const DEEP = "var(--hm-magenta-deep)";

function cookTimeLabel(mins: number | null) {
  if (!mins) return "—";
  return mins >= 60
    ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`.trim()
    : `${mins} min`;
}

export default function KitchenLandingPage() {
  const router = useRouter();

  const statsRef = useRef(null);
  const cardsRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true });
  const cardsInView = useInView(cardsRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const ctaInView = useInView(ctaRef, { once: true });

  // ── Recipe feed carousel (real recipes) ──────────────
  const [feed, setFeed] = useState<Recipe[]>([]);
  useEffect(() => {
    recipeService
      .getRecipes({ pageSize: 10 })
      .then((res) => setFeed(res.data))
      .catch(() => {});
  }, []);

  const features = [
    {
      num: "01",
      Icon: ChefHat,
      title: "Personalised Recipes",
      desc: "Get personalized recipe suggestions based on your ingredients",
    },
    {
      num: "02",
      Icon: BookOpen,
      title: "Recipe Library",
      desc: "Browse thousands of verified halal recipes",
    },
    {
      num: "03",
      Icon: Utensils,
      title: "Cooking Tips",
      desc: "Expert advice and substitution suggestions",
    },
    {
      num: "04",
      Icon: ChefHat,
      title: "Share Recipes",
      desc: "Upload and share your own culinary creations",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* ─── Hero ───────────────────────────────────────── */}
      <section
        className="relative h-screen min-h-150 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#1C1C1C", borderBottom: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)` }}
      >
        {/* This hero is a full-bleed photograph, not a page surface - the scrim and
            text below stay fixed dark/light regardless of theme so the photo stays
            visible and legible in both, instead of washing out under a light-mode tint. */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/services/halal02.png"
            alt="Halal cooking"
            fill
            className="object-cover opacity-100 scale-105"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(28,28,28,0.8)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 0%, rgba(28,28,28,0.31) 55%, rgba(28,28,28,0.56) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 w-full">
          <div className="max-w-5xl w-full flex flex-col items-center">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-3 mb-6 md:mb-8"
            >
              <div className="w-8 h-px" style={{ backgroundColor: MAGENTA }} />
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: MAGENTA }}
              >
                Your Halal Cooking Companion
              </span>
              <div className="w-8 h-px" style={{ backgroundColor: MAGENTA }} />
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
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(255,255,255,0.92)",
                      borderRadius: "50%",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: MAGENTA,
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
                  style={{ fontFamily: "var(--font-logo)", color: "#F7E7CE" }}
                >
                  HalalMe
                </span>
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.7 }}
                className="block text-[clamp(2.25rem,8vw,8rem)]"
                style={{ color: MAGENTA }}
              >
                Kitchen
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                className="block text-[clamp(1.5rem,5vw,5rem)]"
                style={{ color: "#F7E7CE" }}
              >
                AI-Powered.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 md:mt-7 text-base md:text-lg max-w-md leading-relaxed mx-auto"
              style={{ color: "rgba(247,231,206,0.46)" }}
            >
              Get AI-powered recipe suggestions, discover community recipes, and
              master the art of halal cooking with your personal culinary
              assistant.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              <motion.button
                onClick={() => router.push("/kitchen/ai-assistant")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 text-white font-extrabold uppercase tracking-tighter text-sm sm:text-base"
                style={{ backgroundColor: DEEP }}
              >
                Cook with AQI
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              <motion.button
                onClick={() => router.push("/kitchen/recipes")}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(247,231,206,0.08)",
                }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border-2 font-extrabold uppercase tracking-tighter text-sm sm:text-base transition-all"
                style={{
                  borderColor: "rgba(247,231,206,0.15)",
                  color: "#F7E7CE",
                }}
              >
                Browse Recipes
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex flex-wrap gap-6 justify-center"
            >
              {[
                { Icon: Sparkles, text: "AI-Powered" },
                { Icon: BookOpen, text: "5K+ Recipes" },
                { Icon: Globe, text: "50+ Cuisines" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "rgba(247,231,206,0.4)" }}
                >
                  <item.Icon className="w-4 h-4" style={{ color: MAGENTA }} />
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
          backgroundColor: `color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
          borderTop: `1px solid color-mix(in oklab, var(--hm-magenta) 50%, transparent)`,
          borderBottom: `1px solid color-mix(in oklab, var(--hm-magenta) 50%, transparent)`,
        }}
      >
        {[
          { value: "5K+", label: "Recipes" },
          { value: "1K+", label: "AI Chats Daily" },
          { value: "10K+", label: "Community Members" },
          { value: "50+", label: "Cuisines" },
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
              style={{ color: "rgba(240,62,158,0.9)" }}
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── AQI Promo ────────────────────────────────────── */}
      <AQISection />

      {/* ─── Cards (What You Can Do) ───────────────────────── */}
      <section
        ref={cardsRef}
        className="py-24 md:py-32"
        style={{
          backgroundColor: BG,
          borderTop: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
          borderBottom: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
        }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={cardsInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: MAGENTA }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: MAGENTA }}
            >
              What You Can Do
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Cook Smarter
            <br />
            <span style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}>Eat Halal.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-2"
          style={{
            gap: "1px",
            backgroundColor: `color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
            borderLeft: `2px solid color-mix(in oklab, var(--hm-magenta) 50%, transparent)`,
            borderRight: `2px solid color-mix(in oklab, var(--hm-magenta) 50%, transparent)`,
          }}
        >
          {/* AI Card - hover to fuchsia */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Link href="/kitchen/ai-assistant">
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-pointer min-h-85 flex flex-col transition-colors duration-300"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = DEEP)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--kitchen-bg2)")
                }
                style={{
                  backgroundColor: "var(--kitchen-bg2)",
                  border: `1px solid color-mix(in oklab, var(--hm-text) 3%, transparent)`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none"
                  style={{ color: "color-mix(in oklab, var(--hm-text) 10%, transparent)" }}
                >
                  01
                </span>
                <div className="relative z-10 flex flex-col flex-1">
                  <ChefHat
                    className="w-7 h-7 mb-8 shrink-0 transition-colors duration-300 group-hover:text-black!"
                    style={{ color: MAGENTA }}
                  />
                  <h3
                    className="text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-tighter mb-4 transition-colors duration-300 group-hover:text-black!"
                    style={{ color: CREAM }}
                  >
                    AI Recipe Assistant
                  </h3>
                  <p
                    className="leading-relaxed text-sm md:text-base transition-colors duration-300 group-hover:text-black/70! flex-1"
                    style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
                  >
                    Have ingredients but don&apos;t know what to cook? Let our
                    AI create delicious halal recipes with step-by-step
                    instructions.
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    {[
                      "Paste your ingredients and get recipe suggestions",
                      "Ask for cooking help and substitutions",
                      "Get step-by-step cooking instructions",
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 text-sm transition-colors duration-300 group-hover:text-black/70!"
                        style={{ color: `color-mix(in oklab, var(--hm-text) 40%, var(--hm-lm-anchor))` }}
                      >
                        <span
                          className="group-hover:text-black! mt-0.5 font-bold"
                          style={{ color: MAGENTA }}
                        >
                          ✓
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-8 flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-colors duration-300 group-hover:text-black!"
                    style={{ color: MAGENTA }}
                  >
                    Start Now <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Recipes Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link href="/kitchen/recipes">
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-pointer min-h-85 flex flex-col transition-colors duration-300"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = DEEP)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "var(--kitchen-bg2)")
                }
                style={{
                  backgroundColor: "var(--kitchen-bg2)",
                  border: `1px solid color-mix(in oklab, var(--hm-text) 3%, transparent)`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none"
                  style={{ color: "color-mix(in oklab, var(--hm-text) 10%, transparent)" }}
                >
                  02
                </span>
                <div className="relative z-10 flex flex-col flex-1">
                  <BookOpen
                    className="w-7 h-7 mb-8 shrink-0 transition-colors duration-300 group-hover:text-black!"
                    style={{ color: MAGENTA }}
                  />
                  <h3
                    className="text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-tighter mb-4 transition-colors duration-300 group-hover:text-black!"
                    style={{ color: CREAM }}
                  >
                    Explore Recipes
                  </h3>
                  <p
                    className="leading-relaxed text-sm md:text-base transition-colors duration-300 group-hover:text-black/70! flex-1"
                    style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
                  >
                    Browse thousands of halal recipes from our community. Find
                    inspiration and share your own creations.
                  </p>
                  <div className="mt-6 flex flex-col gap-2">
                    {[
                      "Discover recipes from around the world",
                      "Filter by cuisine, difficulty, and cooking time",
                      "Upload and share your own recipes",
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 text-sm transition-colors duration-300 group-hover:text-black/70!"
                        style={{ color: `color-mix(in oklab, var(--hm-text) 40%, var(--hm-lm-anchor))` }}
                      >
                        <span
                          className="mt-0.5 font-bold group-hover:text-black!"
                          style={{ color: MAGENTA }}
                        >
                          ✓
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-8 flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-colors duration-300 group-hover:text-black!"
                    style={{ color: MAGENTA }}
                  >
                    Browse Now <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Features Grid ────────────────────────────────── */}
      <section
        ref={featuresRef}
        className="py-24 md:py-32"
        style={{
          backgroundColor: BG2,
          borderTop: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
          borderBottom: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
        }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={featuresInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: MAGENTA }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: MAGENTA }}
            >
              Why HalalMe Kitchen
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Your Complete
            <br />
            <span style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}>Culinary Companion.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: "1px", backgroundColor: `color-mix(in oklab, var(--hm-magenta) 31%, transparent)` }}
        >
          {features.map((f, i) => {
            const Icon = f.Icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative p-8 overflow-hidden hover:bg-(--hm-text) transition-colors duration-300 cursor-default"
                style={{
                  backgroundColor: BG,
                  border: `1px solid color-mix(in oklab, var(--hm-text) 3%, transparent)`,
                  minHeight: "220px",
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[7rem] font-extrabold leading-none select-none pointer-events-none transition-colors duration-300"
                  style={{ color: "color-mix(in oklab, var(--hm-text) 10%, transparent)" }}
                >
                  {f.num}
                </span>
                <div
                  className="relative z-10 flex flex-col"
                  style={{ minHeight: "180px" }}
                >
                  <Icon
                    className="w-6 h-6 mb-6 transition-colors duration-300 group-hover:text-(--hm-magenta-deep)"
                    style={{ color: MAGENTA }}
                  />
                  <h3
                    className="text-lg md:text-xl font-extrabold uppercase tracking-tighter mb-3 transition-colors duration-300 group-hover:text-(--kitchen-bg)"
                    style={{ color: CREAM }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed transition-colors duration-300 group-hover:text-(--kitchen-bg)/65"
                    style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
                  >
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Recipe Feed Preview ──────────────────────────── */}
      <section
        className="py-24 md:py-32 relative overflow-hidden"
        style={{
          backgroundColor: BG,
          borderTop: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
          borderBottom: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
        }}
      >
        {/* Pink glow accent */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in oklab, var(--hm-magenta) 7%, transparent) 0%, transparent 70%)`,
          }}
        />
        {/* Top border accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, color-mix(in oklab, var(--hm-magenta) 50%, transparent), transparent)`,
          }}
        />

        <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-px"
                  style={{ backgroundColor: MAGENTA }}
                />
                <span
                  className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                  style={{ color: MAGENTA }}
                >
                  Recipe Feed
                </span>
              </div>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.88]"
                style={{ color: CREAM }}
              >
                Thousands of
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${MAGENTA}, ${DEEP})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Halal Recipes.
                </span>
              </h2>
            </div>
            <Link href="/kitchen/recipes">
              <button
                className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter shrink-0 px-5 py-2.5 transition-all hover:brightness-110"
                style={{
                  background: `linear-gradient(135deg, ${DEEP}, ${MAGENTA})`,
                  color: "#fff",
                }}
              >
                Browse All <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Auto-scrolling carousel */}
          <div className="overflow-hidden relative">
            {/* Fade edges */}
            <div
              className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${BG}, transparent)`,
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to left, ${BG}, transparent)`,
              }}
            />

            {feed.length === 0 ? (
              /* Loading skeletons */
              <div className="flex">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="shrink-0 mx-2" style={{ width: "260px" }}>
                    <div style={{ backgroundColor: BG2, border: `1px solid color-mix(in oklab, var(--hm-magenta) 15%, transparent)` }}>
                      <div className="w-full h-36 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-magenta) 7%, transparent)` }} />
                      <div className="p-4 space-y-2">
                        <div className="h-3 w-3/4 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 8%, transparent)` }} />
                        <div className="h-2 w-1/2 animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 6%, transparent)` }} />
                        <div className="h-2 w-full animate-pulse" style={{ backgroundColor: `color-mix(in oklab, var(--hm-text) 3%, transparent)` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex"
                style={{ animation: "kitchen-scroll 28s linear infinite" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.animationPlayState = "paused")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.animationPlayState = "running")
                }
              >
                {[...Array(2)].map((_, clone) =>
                  feed.map((recipe, i) => (
                    <Link
                      href={`/kitchen/recipes/${recipe.id}`}
                      key={`${clone}-${i}`}
                      className="shrink-0 mx-2"
                      style={{ width: "260px" }}
                    >
                      <div
                        className="group cursor-pointer transition-colors duration-300"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = DEEP)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = BG2)
                        }
                        style={{
                          backgroundColor: BG2,
                          border: `1px solid color-mix(in oklab, var(--hm-magenta) 15%, transparent)`,
                        }}
                      >
                        <div
                          className="relative w-full h-36 overflow-hidden"
                          style={{
                            backgroundColor: `color-mix(in oklab, var(--hm-magenta) 7%, transparent)`,
                            borderBottom: `1px solid color-mix(in oklab, var(--hm-magenta) 13%, transparent)`,
                          }}
                        >
                          {recipe.image_url ? (
                            <Image
                              src={cldUrl(recipe.image_url) ?? recipe.image_url}
                              alt={recipe.title}
                              fill
                              sizes="260px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ChefHat className="w-10 h-10 text-[color:color-mix(in_oklab,var(--kitchen-fg)_35%,var(--hm-lm-anchor))]" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3
                              className="text-sm font-extrabold uppercase tracking-tighter line-clamp-1 group-hover:text-black! transition-colors"
                              style={{ color: CREAM }}
                            >
                              {recipe.title}
                            </h3>
                            {recipe.avg_rating ? (
                              <span
                                className="text-xs font-bold shrink-0 group-hover:text-black/60! transition-colors"
                                style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
                              >
                                ★ {Number(recipe.avg_rating).toFixed(1)}
                              </span>
                            ) : null}
                          </div>
                          <p
                            className="text-[10px] uppercase tracking-wide font-semibold mb-2 group-hover:text-black! transition-colors"
                            style={{ color: MAGENTA }}
                          >
                            {recipe.cuisine ?? "Halal"}
                          </p>
                          <div
                            className="flex items-center justify-between text-[10px] group-hover:text-black/65! transition-colors"
                            style={{ color: `color-mix(in oklab, var(--hm-text) 33%, var(--hm-lm-anchor))` }}
                          >
                            <span>⏱ {cookTimeLabel(recipe.cook_time_mins)}</span>
                            {recipe.difficulty && (
                              <span
                                className={
                                  recipe.difficulty === "easy"
                                    ? "text-green-400"
                                    : "text-yellow-400"
                                }
                              >
                                {recipe.difficulty.charAt(0).toUpperCase() +
                                  recipe.difficulty.slice(1)}
                              </span>
                            )}
                            <span className="truncate max-w-[80px]">
                              by {recipe.profiles?.username ?? "Community"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )),
                )}
              </div>
            )}
          </div>
          <style>{`
            @keyframes kitchen-scroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      </section>

      {/* ─── Upload Your Recipe ───────────────────────────── */}
      <section
        className="py-24 md:py-32 relative overflow-hidden"
        style={{
          backgroundColor: BG2,
          borderTop: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
          borderBottom: `1px solid color-mix(in oklab, var(--hm-magenta) 31%, transparent)`,
        }}
      >
        {/* Pink glow accent */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 100%, color-mix(in oklab, var(--hm-magenta) 7%, transparent) 0%, transparent 70%)`,
          }}
        />
        {/* Bottom border accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, color-mix(in oklab, var(--hm-magenta) 50%, transparent), transparent)`,
          }}
        />
        {/* Left border accent */}
        <div
          className="absolute top-0 left-0 bottom-0 w-px"
          style={{
            background: `linear-gradient(to bottom, transparent, color-mix(in oklab, var(--hm-magenta) 38%, transparent), transparent)`,
          }}
        />

        <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
          <div
            className="grid md:grid-cols-2 gap-px"
            style={{ backgroundColor: `color-mix(in oklab, var(--hm-magenta) 31%, transparent)` }}
          >
            {/* Left: form mockup */}
            <div className="p-8 md:p-12" style={{ backgroundColor: BG2 }}>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2"
                style={{ color: MAGENTA }}
              >
                Preview
              </p>
              <h3
                className="text-xl font-extrabold uppercase tracking-tighter mb-8"
                style={{ color: CREAM }}
              >
                Upload Form
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5"
                    style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
                  >
                    Recipe Title
                  </label>
                  <div
                    className="px-4 py-3 text-sm"
                    style={{
                      backgroundColor: BG,
                      border: `1px solid color-mix(in oklab, var(--hm-text) 8%, transparent)`,
                      color: `color-mix(in oklab, var(--hm-text) 25%, var(--hm-lm-anchor))`,
                    }}
                  >
                    e.g. Mum&apos;s Lamb Biryani
                  </div>
                </div>
                <div>
                  <label
                    className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5"
                    style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
                  >
                    Photo
                  </label>
                  <div
                    className="h-28 flex flex-col items-center justify-center gap-2"
                    style={{
                      backgroundColor: BG,
                      border: `1px dashed color-mix(in oklab, var(--hm-text) 13%, transparent)`,
                    }}
                  >
                    <span className="text-2xl">📷</span>
                    <span className="text-xs" style={{ color: `color-mix(in oklab, var(--hm-text) 31%, var(--hm-lm-anchor))` }}>
                      Click to upload image
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5"
                      style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
                    >
                      Cuisine
                    </label>
                    <div
                      className="px-4 py-3 text-sm"
                      style={{
                        backgroundColor: BG,
                        border: `1px solid color-mix(in oklab, var(--hm-text) 8%, transparent)`,
                        color: `color-mix(in oklab, var(--hm-text) 25%, var(--hm-lm-anchor))`,
                      }}
                    >
                      South Asian
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5"
                      style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
                    >
                      Cook Time
                    </label>
                    <div
                      className="px-4 py-3 text-sm"
                      style={{
                        backgroundColor: BG,
                        border: `1px solid color-mix(in oklab, var(--hm-text) 8%, transparent)`,
                        color: `color-mix(in oklab, var(--hm-text) 25%, var(--hm-lm-anchor))`,
                      }}
                    >
                      45 min
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <div
                    className="px-6 py-3 text-center text-sm font-extrabold uppercase tracking-tighter text-white"
                    style={{ backgroundColor: DEEP }}
                  >
                    Publish Recipe
                  </div>
                </div>
              </div>
            </div>

            {/* Right: copy */}
            <div
              className="p-8 md:p-12 flex flex-col justify-center"
              style={{ backgroundColor: BG }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-8 h-px"
                  style={{ backgroundColor: MAGENTA }}
                />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: MAGENTA }}
                >
                  Community
                </span>
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-6"
                style={{ color: CREAM }}
              >
                Share Your
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${MAGENTA}, ${DEEP})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Recipes.
                </span>
              </h2>
              <p
                className="text-sm md:text-base leading-relaxed mb-8"
                style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
              >
                Have a recipe the community should know about? Upload your halal
                creations, get rated, and inspire cooks around the world.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Add photo, ingredients & steps",
                  "Choose your cuisine and difficulty",
                  "Get liked and bookmarked by the community",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm"
                    style={{ color: `color-mix(in oklab, var(--hm-text) 46%, var(--hm-lm-anchor))` }}
                  >
                    <span
                      style={{ color: MAGENTA }}
                      className="font-bold mt-0.5"
                    >
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
              <Link href="/kitchen/recipes/upload">
                <button
                  className="self-start flex items-center gap-3 px-7 py-3.5 font-extrabold uppercase tracking-tighter text-sm text-white"
                  style={{ backgroundColor: DEEP }}
                >
                  Upload a Recipe <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────── */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden py-28 md:py-36"
        style={{ backgroundColor: DEEP, borderTop: `1px solid color-mix(in oklab, var(--hm-magenta) 50%, transparent)` }}
      >
        <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-8 h-px bg-white/30" />
            <span className="text-white/45 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
              Ready to Cook
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-white mb-10 max-w-4xl"
          >
            Ready to Start
            <br />
            Cooking?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-base md:text-lg max-w-xl mb-12 leading-relaxed"
          >
            Let our AI assistant help you create delicious halal meals today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <button
              onClick={() => router.push("/kitchen/ai-assistant")}
              className="flex items-center gap-3 px-8 py-4 bg-white font-extrabold uppercase tracking-tighter text-base hover:bg-(--hm-text) transition-colors"
              style={{ color: DEEP }}
            >
              Start Cooking with AQI
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link href="/kitchen/recipes">
              <button className="flex items-center gap-3 px-8 py-4 border-2 border-white/30 text-white font-extrabold uppercase tracking-tighter text-base hover:bg-white/10 transition-colors">
                Browse Recipes
              </button>
            </Link>
          </motion.div>

          <div className="flex flex-wrap gap-6 md:gap-10">
            {[
              { Icon: Sparkles, text: "AI-Powered Suggestions" },
              { Icon: BookOpen, text: "5K+ Halal Recipes" },
              { Icon: Globe, text: "50+ Cuisines" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wide"
              >
                <item.Icon className="w-4 h-4" />
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Watermark */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-white/8 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
        >
          Kitchen
        </div>
      </section>

      {/* ─── Back Links ───────────────────────────────────── */}
      <div
        className="px-6 py-8"
        style={{ backgroundColor: BG, borderTop: `1px solid color-mix(in oklab, var(--hm-text) 3%, transparent)` }}
      >
        <div className="max-w-[95vw] mx-auto flex justify-between items-center">
          <Link
            href="/hub"
            className="text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-fuchsia-400"
            style={{ color: `color-mix(in oklab, var(--hm-text) 38%, var(--hm-lm-anchor))` }}
          >
            ← Hub
          </Link>
          <Link
            href="/charity"
            className="text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:text-fuchsia-400"
            style={{ color: `color-mix(in oklab, var(--hm-text) 38%, var(--hm-lm-anchor))` }}
          >
            Charity →
          </Link>
        </div>
      </div>
    </div>
  );
}
