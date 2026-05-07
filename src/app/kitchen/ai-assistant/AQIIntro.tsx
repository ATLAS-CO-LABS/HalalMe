"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ChefHat, Wand2, Repeat2, CalendarDays, ArrowRight,
  MessageSquare, BookOpen,
} from "lucide-react";

// ── Palette (matches chat page) ───────────────────────────────────────
const BG      = "#1C1C1C";
const CREAM   = "#F0DFC0";
const GOLD    = "#C9973A";
const MAGENTA = "#F03E9E";
const DEEP    = "#C41E73";

// ── Feature cards ─────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Recipe Generation",
    desc: "Describe what you have or crave - AQI builds a full halal recipe with ingredients, steps, and nutrition.",
    color: "#F03E9E",
  },
  {
    icon: <ChefHat className="w-5 h-5" />,
    title: "Cooking Guidance",
    desc: "Ask any technique question - temperatures, timings, knife skills - and get clear chef-level answers instantly.",
    color: "#C9973A",
  },
  {
    icon: <Repeat2 className="w-5 h-5" />,
    title: "Smart Substitutions",
    desc: "Missing an ingredient? AQI finds the best halal swap without compromising the dish's flavour or texture.",
    color: "#4ade80",
  },
  {
    icon: <CalendarDays className="w-5 h-5" />,
    title: "Meal Planning",
    desc: "Tell AQI your week, dietary goals, and family size - get a structured, halal-verified meal plan.",
    color: "#60a5fa",
  },
];

// ── Static demo messages ──────────────────────────────────────────────
const DEMO = [
  { role: "user",      text: "I have chicken, rice, and some spices. What should I make?" },
  { role: "assistant", text: "Perfect combo! I can make you Chicken Biryani, a simple Chicken Pulao, or a quick stir-fried rice. Which one sounds good?" },
  { role: "user",      text: "Biryani please!" },
  { role: "assistant", text: "Great choice! Here's a classic Chicken Biryani - aromatic, layered, and fully halal. I'll walk you through every step.", isRecipe: true },
];

const fade  = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

export default function AQIIntro({ onAuth }: { onAuth: () => void }) {

  return (
    <div className="fixed inset-0 overflow-y-auto" style={{ backgroundColor: BG, color: CREAM, zIndex: 50 }}>

      {/* ── Ambient orbs ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-20%", left: "-10%",
          width: "60%", height: "60%",
          background: "radial-gradient(circle, rgba(196,30,115,0.10) 0%, rgba(196,30,115,0.03) 40%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-15%", right: "-10%",
          width: "55%", height: "55%",
          background: "radial-gradient(circle, rgba(240,62,158,0.08) 0%, rgba(240,62,158,0.02) 40%, transparent 70%)",
        }} />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <Image src="/logo/logo.png" alt="AQI" width={32} height={32} className="object-contain" />
          <div>
            <span className="text-sm font-black uppercase" style={{ color: CREAM, letterSpacing: "0.22em" }}>AQI</span>
            <div className="text-[8px] font-bold uppercase" style={{ color: `${CREAM}35`, letterSpacing: "0.2em" }}>by HalalMe</div>
          </div>
        </div>
        <button
          onClick={onAuth}
          className="flex items-center gap-2 px-4 py-2 text-xs font-black uppercase transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${DEEP}, ${MAGENTA})`, color: "#fff", letterSpacing: "0.18em" }}
        >
          Get Started
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-[9px] font-black uppercase"
          style={{ background: "rgba(240,62,158,0.08)", border: "1px solid rgba(240,62,158,0.25)", color: MAGENTA, letterSpacing: "0.22em" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MAGENTA, boxShadow: `0 0 5px ${MAGENTA}` }} />
          AQI · Kitchen AI
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 180 }}
          className="relative inline-block mb-8"
        >
          <div className="aqi-intro-ring-3" />
          <div className="aqi-intro-ring-2" />
          <div className="aqi-intro-ring-1" />
          <div className="relative z-10 w-28 h-28 mx-auto flex items-center justify-center">
            <Image src="/logo/logo.png" alt="AQI" width={100} height={100} className="object-contain" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none mb-6"
        >
          <span style={{
            background: `linear-gradient(135deg, ${CREAM} 0%, ${MAGENTA} 50%, ${CREAM} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Your Halal AI
          </span>
          <br />
          <span style={{ color: CREAM }}>Kitchen Assistant</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.22 }}
          className="text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed"
          style={{ color: `${CREAM}60` }}
        >
          Chat naturally with AQI to generate halal recipes, get cooking help, find ingredient substitutes, and plan your meals - all in seconds.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="flex items-center justify-center gap-3 flex-wrap"
        >
          <button
            onClick={onAuth}
            className="flex items-center gap-2.5 px-7 py-3.5 text-sm font-black uppercase transition-all hover:brightness-110 active:scale-98"
            style={{ background: `linear-gradient(135deg, ${DEEP}, ${MAGENTA})`, color: "#fff", letterSpacing: "0.18em" }}
          >
            <Wand2 className="w-4 h-4" />
            Start Cooking Free
          </button>
          <button
            onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
            className="flex items-center gap-2 px-5 py-3.5 text-xs font-black uppercase transition-all hover:border-magenta"
            style={{ border: "1px solid rgba(240,62,158,0.25)", color: `${CREAM}60`, letterSpacing: "0.16em" }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            See it in action
          </button>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={fade}
              className="p-6 group relative overflow-hidden transition-all"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(240,62,158,0.10)" }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 0% 0%, ${f.color}08, transparent 60%)` }} />

              <div className="flex items-start gap-4 relative z-10">
                <div className="shrink-0 w-10 h-10 flex items-center justify-center"
                  style={{ background: `${f.color}12`, border: `1px solid ${f.color}30`, color: f.color }}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase mb-1.5" style={{ color: CREAM, letterSpacing: "0.1em" }}>
                    {f.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: `${CREAM}50` }}>{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Demo chat ────────────────────────────────────────────── */}
      <section id="demo" className="relative z-10 max-w-2xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4 }}
        >
          {/* Section label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, rgba(240,62,158,0.3))` }} />
            <span className="text-[9px] font-black uppercase" style={{ color: `${CREAM}30`, letterSpacing: "0.28em" }}>Live Preview</span>
            <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, rgba(240,62,158,0.3))` }} />
          </div>

          {/* Chat window */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(240,62,158,0.12)" }}>
            {/* Window header */}
            <div className="flex items-center gap-2.5 px-4 py-3"
              style={{ borderBottom: "1px solid rgba(240,62,158,0.08)" }}>
              <div className="relative">
                <Image src="/logo/logo.png" alt="AQI" width={22} height={22} className="object-contain" />
              </div>
              <span className="text-[10px] font-black uppercase" style={{ color: CREAM, letterSpacing: "0.2em" }}>AQI</span>
              <div className="flex items-center gap-1 ml-auto">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#4ade80", boxShadow: "0 0 4px #4ade80" }} />
                <span className="text-[8px] font-bold uppercase" style={{ color: "#4ade8080", letterSpacing: "0.14em" }}>Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="px-4 py-5 space-y-4">
              {DEMO.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[80%]">
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Image src="/logo/logo.png" alt="AQI" width={14} height={14} className="object-contain" />
                        <span className="text-[8px] font-black uppercase" style={{ color: `${MAGENTA}90`, letterSpacing: "0.22em" }}>AQI</span>
                      </div>
                    )}
                    <div className="px-3.5 py-2.5 text-xs leading-relaxed"
                      style={msg.role === "user" ? {
                        background: "linear-gradient(135deg, #2A2A2A, #222222)",
                        border: "1px solid rgba(240,62,158,0.18)",
                        color: CREAM,
                      } : {
                        background: "rgba(38,38,38,0.95)",
                        border: "1px solid rgba(240,62,158,0.10)",
                        borderLeft: `3px solid ${MAGENTA}70`,
                        color: `${CREAM}CC`,
                      }}
                    >
                      {msg.text}
                      {msg.isRecipe && (
                        <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(240,62,158,0.12)" }}>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5"
                              style={{ background: "rgba(240,62,158,0.10)", color: MAGENTA, border: "1px solid rgba(240,62,158,0.2)" }}>
                              Pakistani
                            </span>
                            <span className="text-[8px] font-black uppercase px-1.5 py-0.5"
                              style={{ background: "rgba(201,151,58,0.10)", color: GOLD, border: `1px solid ${GOLD}30` }}>
                              Medium
                            </span>
                            <span className="text-[8px] font-bold uppercase" style={{ color: `${CREAM}40` }}>
                              75 min · 4 servings
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Prompt hint */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-px" style={{ background: "rgba(240,62,158,0.06)" }} />
                <span className="text-[8px] font-bold uppercase" style={{ color: `${CREAM}18`, letterSpacing: "0.18em" }}>
                  Try it yourself →
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(240,62,158,0.06)" }} />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.4 }}
          className="text-center py-16 px-8 relative overflow-hidden"
          style={{ background: "rgba(240,62,158,0.04)", border: "1px solid rgba(240,62,158,0.15)" }}
        >
          {/* BG accent */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(196,30,115,0.08), transparent)",
          }} />

          <div className="relative z-10">
            <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center"
              style={{ background: "rgba(240,62,158,0.08)", border: "1px solid rgba(240,62,158,0.2)" }}>
              <Image src="/logo/logo.png" alt="AQI" width={28} height={28} className="object-contain" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-4" style={{ color: CREAM }}>
              Ready to cook smarter?
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: `${CREAM}45` }}>
              Free to start. No credit card. Every recipe is 100% halal-verified by AQI.
            </p>

            <button
              onClick={onAuth}
              className="inline-flex items-center gap-3 px-8 py-4 text-sm font-black uppercase transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${DEEP}, ${MAGENTA})`, color: "#fff", letterSpacing: "0.2em" }}
            >
              <Wand2 className="w-4 h-4" />
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[9px] mt-4 uppercase" style={{ color: `${CREAM}20`, letterSpacing: "0.14em" }}>
              Already have an account?{" "}
              <button onClick={onAuth} className="underline" style={{ color: `${CREAM}35` }}>Sign in</button>
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t text-center py-6" style={{ borderColor: "rgba(240,62,158,0.08)" }}>
        <span className="text-[8px] font-bold uppercase" style={{ color: `${CREAM}18`, letterSpacing: "0.18em" }}>
          AQI by HalalMe · Always Halal
        </span>
      </footer>

      <style>{`
        .aqi-intro-ring-1,
        .aqi-intro-ring-2,
        .aqi-intro-ring-3 {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(240,62,158,0.3);
          animation: aqi-intro-ring 2.8s ease-out infinite;
        }
        .aqi-intro-ring-2 { animation-delay: 0.9s; border-color: rgba(196,30,115,0.18); }
        .aqi-intro-ring-3 { animation-delay: 1.8s; border-color: rgba(240,62,158,0.08); }
        @keyframes aqi-intro-ring {
          0%   { transform: scale(1);   opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
      `}</style>
    </div>
  );
}
