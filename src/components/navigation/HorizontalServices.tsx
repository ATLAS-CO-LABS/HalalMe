"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bike,
  CheckCircle2,
  ChefHat,
  Clock,
  CloudUpload,
  Droplets,
  Flame,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  Plus,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const CREAM = "#F7E7CE";

/* ═══════════════════════════════════════════════════════════
   Mini-demo previews - one tiny live UI per service so users
   see what actually happens inside before they click through.
   ═══════════════════════════════════════════════════════════ */

function PreviewShell({
  accent,
  title,
  sub,
  right,
  children,
}: {
  accent: string;
  title: string;
  sub: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="w-full"
      style={{
        background: "rgba(5,15,13,0.78)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${accent}30`,
        boxShadow: `0 24px 60px -20px rgba(0,0,0,0.6), 0 0 40px -18px ${accent}50`,
      }}
    >
      {/* Chrome */}
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderBottom: `1px solid ${accent}20` }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-[9px] font-black uppercase" style={{ color: CREAM, letterSpacing: "0.2em" }}>
          {title}
        </span>
        <span className="text-[8px] ml-auto uppercase tracking-[0.14em] flex items-center gap-2" style={{ color: `${CREAM}30` }}>
          {sub}
        </span>
        {right}
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  );
}

/* ── 01 Delivery: pick food, add to cart, track the order ── */
const MENU_ITEMS = [
  { name: "Lamb Shawarma Wrap", price: "£8.50", addedAt: 1 },
  { name: "Chicken Biryani", price: "£11.90", addedAt: 2 },
  { name: "Falafel Mezze Box", price: "£7.20", addedAt: 99 },
];
const DELIVERY_STEPS = ["Order placed", "Kitchen preparing", "Rider on the way", "Delivered"];

function DeliveryPreview({ accent }: { accent: string }) {
  // 0 menu · 1-2 items added · 3-6 tracking steps
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 8), 1300);
    return () => clearInterval(id);
  }, []);

  const cartCount = Math.min(phase, 2);
  const tracking = phase >= 3;
  const trackStep = phase - 3; // 0..4 (last tick lingers on Delivered)

  return (
    <PreviewShell
      accent={accent}
      title="Zaytoon Grill"
      sub="0.8 mi"
      right={
        <span className="relative ml-2 shrink-0">
          <ShoppingBag className="w-3.5 h-3.5" style={{ color: `${CREAM}60` }} />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                key={cartCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 18 }}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                style={{ backgroundColor: accent }}
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      }
    >
      <div className="min-h-38">
        <AnimatePresence mode="wait">
          {!tracking ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {MENU_ITEMS.map((item, i) => {
                const added = phase >= item.addedAt;
                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-300"
                    animate={{
                      backgroundColor: added ? "rgba(185,106,240,0.10)" : "rgba(247,231,206,0.02)",
                    }}
                    style={{ border: `1px solid ${added ? `${accent}45` : "rgba(247,231,206,0.06)"}` }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-tighter truncate" style={{ color: CREAM }}>
                        {item.name}
                      </p>
                      <p className="text-[9px]" style={{ color: `${CREAM}35` }}>
                        Halal certified · {item.price}
                      </p>
                    </div>
                    <motion.span
                      className="w-6 h-6 flex items-center justify-center shrink-0"
                      animate={{
                        backgroundColor: added ? accent : "rgba(247,231,206,0.06)",
                        scale: added ? [1, 1.25, 1] : 1,
                      }}
                      transition={{ duration: 0.35 }}
                    >
                      {added ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" style={{ color: `${CREAM}50` }} />
                      )}
                    </motion.span>
                  </motion.div>
                );
              })}
              <AnimatePresence>
                {cartCount === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 py-2 text-[9px] font-extrabold uppercase tracking-tighter text-white"
                    style={{ backgroundColor: accent }}
                  >
                    <ShoppingBag className="w-2.5 h-2.5" /> Checkout · £20.40
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="track"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-extrabold uppercase tracking-tighter" style={{ color: CREAM }}>
                  Order #2481 confirmed
                </p>
                <span
                  className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1 shrink-0"
                  style={{ color: accent, border: `1px solid ${accent}40` }}
                >
                  <MapPin className="w-2.5 h-2.5" /> 18 min
                </span>
              </div>
              <div className="space-y-2">
                {DELIVERY_STEPS.map((label, i) => {
                  const done = trackStep > i;
                  const active = trackStep === i;
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <span
                        className="w-4 h-4 flex items-center justify-center shrink-0 rounded-full transition-colors duration-500"
                        style={{
                          backgroundColor: done ? accent : active ? `${accent}30` : "rgba(247,231,206,0.06)",
                        }}
                      >
                        {done ? (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        ) : active ? (
                          <motion.span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: accent }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        )}
                      </span>
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider transition-colors duration-500 flex items-center gap-1.5"
                        style={{ color: done || active ? `${CREAM}90` : `${CREAM}30` }}
                      >
                        {label}
                        {active && i === 2 && <Bike className="w-3 h-3" style={{ color: accent }} />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PreviewShell>
  );
}

/* ── 02 Kitchen: browse recipes, then upload your own ── */
const DEMO_RECIPES = [
  {
    title: "Grandma's Chicken Curry",
    meta: "45 min · 4.8",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=160&h=160&fit=crop&q=80",
  },
  {
    title: "Lamb Shawarma Platter",
    meta: "30 min · 4.6",
    img: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=160&h=160&fit=crop&q=80",
  },
];

function KitchenPreview({ accent }: { accent: string }) {
  // 0-1 browse (second recipe highlights) · 2 uploading · 3 published
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const durations = [1600, 1400, 1800, 2200];
    const id = setTimeout(() => setPhase((p) => (p + 1) % 4), durations[phase]);
    return () => clearTimeout(id);
  }, [phase]);

  const uploading = phase >= 2;

  return (
    <PreviewShell accent={accent} title="Kitchen" sub="5K+ recipes">
      {/* Tabs */}
      <div className="flex gap-1.5 mb-3">
        {["Browse", "Upload"].map((tab, i) => {
          const active = (i === 1) === uploading;
          return (
            <span
              key={tab}
              className="px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] transition-colors duration-300"
              style={{
                backgroundColor: active ? accent : "rgba(247,231,206,0.04)",
                color: active ? "#fff" : `${CREAM}40`,
              }}
            >
              {tab}
            </span>
          );
        })}
      </div>

      <div className="min-h-31">
        <AnimatePresence mode="wait">
          {!uploading ? (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              {DEMO_RECIPES.map((r, i) => {
                const spotlight = phase === 1 && i === 1;
                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 p-2 transition-colors duration-300"
                    animate={{
                      backgroundColor: spotlight ? "rgba(240,62,158,0.10)" : "rgba(247,231,206,0.02)",
                    }}
                    style={{ border: `1px solid ${spotlight ? `${accent}45` : "rgba(247,231,206,0.06)"}` }}
                  >
                    <span className="relative w-10 h-10 shrink-0 overflow-hidden">
                      <Image src={r.img} alt={r.title} fill className="object-cover" sizes="40px" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-tighter truncate" style={{ color: CREAM }}>
                        {r.title}
                      </p>
                      <p className="text-[9px] flex items-center gap-1" style={{ color: `${CREAM}40` }}>
                        <Clock className="w-2.5 h-2.5" /> {r.meta}
                        <Star className="w-2.5 h-2.5" style={{ color: accent }} fill="currentColor" />
                      </p>
                    </div>
                    <ArrowRight className="w-3 h-3 shrink-0" style={{ color: spotlight ? accent : `${CREAM}25` }} />
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="flex flex-col items-center justify-center gap-2 py-5 mb-2"
                style={{ border: `1px dashed ${accent}45`, backgroundColor: "rgba(240,62,158,0.05)" }}
              >
                {phase === 3 ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ backgroundColor: accent }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </motion.span>
                ) : (
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <CloudUpload className="w-6 h-6" style={{ color: accent }} />
                  </motion.span>
                )}
                <p className="text-[10px] font-extrabold uppercase tracking-tighter" style={{ color: CREAM }}>
                  {phase === 3 ? "Recipe published" : "Uploading your biryani…"}
                </p>
                <p className="text-[8px] uppercase tracking-[0.14em]" style={{ color: `${CREAM}35` }}>
                  {phase === 3 ? "Now live for the whole community" : "3 photos · 8 steps · serves 4"}
                </p>
              </div>
              <div className="h-1" style={{ backgroundColor: "rgba(247,231,206,0.08)" }}>
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: accent }}
                  initial={{ width: "0%" }}
                  animate={{ width: phase === 3 ? "100%" : "78%" }}
                  transition={{ duration: phase === 3 ? 0.3 : 1.6, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PreviewShell>
  );
}

/* ── 03 Social: image post with live reactions ── */
function SocialPreview({ accent }: { accent: string }) {
  // 0 post · 1 liked · 2 reply appears
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % 3), 1900);
    return () => clearInterval(id);
  }, []);

  const liked = phase >= 1;

  return (
    <PreviewShell accent={accent} title="Hub Feed" sub="Trending now">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-7 h-7 flex items-center justify-center text-[10px] font-black shrink-0"
          style={{ backgroundColor: `${accent}25`, color: accent }}
        >
          AR
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold tracking-tight truncate" style={{ color: CREAM }}>
            Aisha Rahman <span style={{ color: accent }}>✓</span>
          </p>
          <p className="text-[8px] uppercase tracking-[0.14em]" style={{ color: `${CREAM}30` }}>
            @aisha_cooks · 2h
          </p>
        </div>
        <span
          className="ml-auto text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 shrink-0"
          style={{ color: accent, border: `1px solid ${accent}35` }}
        >
          Recipe
        </span>
      </div>

      <p className="text-[10px] leading-relaxed mb-2.5" style={{ color: `${CREAM}75` }}>
        Lamb biryani from scratch - slow-cook the whole spices first 🍚✨
      </p>

      {/* Post image */}
      <div className="relative w-full h-24 mb-2.5 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=300&fit=crop&q=80"
          alt="Lamb biryani"
          fill
          className="object-cover"
          sizes="340px"
        />
        {/* Heart burst on the photo when the like lands */}
        <AnimatePresence>
          {phase === 1 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, times: [0, 0.4, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Heart className="w-10 h-10 drop-shadow-lg" style={{ color: accent }} fill="currentColor" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 text-[10px]" style={{ color: `${CREAM}40` }}>
        <span className="flex items-center gap-1.5">
          <motion.span animate={liked ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.4 }}>
            <Heart
              className="w-3.5 h-3.5 transition-colors duration-300"
              style={{ color: liked ? accent : `${CREAM}40` }}
              fill={liked ? accent : "none"}
            />
          </motion.span>
          <span style={{ color: liked ? accent : `${CREAM}40` }}>{liked ? 248 : 247}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="w-3.5 h-3.5" /> {phase === 2 ? 39 : 38}
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <Flame className="w-3.5 h-3.5" style={{ color: accent }} />
          <span style={{ color: `${CREAM}55` }}>Trending</span>
        </span>
      </div>

      {/* Reply slides in */}
      <div className="h-7 mt-2">
        <AnimatePresence>
          {phase === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 px-2 py-1.5"
              style={{ backgroundColor: "rgba(247,231,206,0.03)", borderLeft: `2px solid ${accent}` }}
            >
              <span
                className="w-4 h-4 flex items-center justify-center text-[7px] font-black shrink-0"
                style={{ backgroundColor: `${accent}20`, color: accent }}
              >
                IS
              </span>
              <span className="text-[9px] truncate" style={{ color: `${CREAM}60` }}>
                Please share the full recipe! 🙏
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PreviewShell>
  );
}

/* ── 04 Charity: cause card with live progress ── */
function CharityPreview({ accent }: { accent: string }) {
  return (
    <PreviewShell accent={accent} title="Verified Cause" sub="Clean Water">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}18` }}>
          <Droplets className="w-4 h-4" style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-tighter truncate" style={{ color: CREAM }}>
            Water Wells for Villages
          </p>
          <p className="text-[8px] uppercase tracking-[0.14em]" style={{ color: `${CREAM}35` }}>
            Charity Commission verified
          </p>
        </div>
      </div>
      <div className="flex justify-between text-[10px] mb-1.5">
        <span className="font-extrabold tracking-tighter" style={{ color: accent }}>£18,400 raised</span>
        <span style={{ color: `${CREAM}30` }}>of £25,000</span>
      </div>
      <div className="h-1 mb-3" style={{ backgroundColor: "rgba(247,231,206,0.08)" }}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: accent }}
          animate={{ width: ["4%", "74%"] }}
          transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2.2, ease: "easeOut" }}
        />
      </div>
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[5, 10, 20, 50].map((amt) => (
          <motion.span
            key={amt}
            className="py-1.5 text-center text-[10px] font-extrabold tracking-tighter"
            animate={
              amt === 20
                ? { backgroundColor: [`rgba(247,231,206,0.04)`, `${accent}`, `${accent}`, `rgba(247,231,206,0.04)`], color: ["#F7E7CE99", "#fff", "#fff", "#F7E7CE99"] }
                : {}
            }
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
            style={{ border: "1px solid rgba(247,231,206,0.1)", color: `${CREAM}60` }}
          >
            £{amt}
          </motion.span>
        ))}
      </div>
      <div
        className="flex items-center justify-center gap-1.5 py-2 text-[9px] font-extrabold uppercase tracking-tighter text-white"
        style={{ backgroundColor: accent }}
      >
        <Lock className="w-2.5 h-2.5" /> Donate securely
      </div>
    </PreviewShell>
  );
}

/* ── 05 Rewards: points balance + earning toast ── */
function RewardsPreview({ accent }: { accent: string }) {
  const [toast, setToast] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setToast((t) => !t), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <PreviewShell accent={accent} title="My Rewards" sub="Silver member">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: `${CREAM}35` }}>
            Balance
          </p>
          <p className="text-2xl font-extrabold tracking-tighter leading-none" style={{ color: CREAM }}>
            {toast ? "1,260" : "1,240"} <span className="text-xs" style={{ color: `${CREAM}35` }}>pts</span>
          </p>
        </div>
        <span
          className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-1"
          style={{ color: accent, border: `1px solid ${accent}40` }}
        >
          <Star className="w-2.5 h-2.5" fill="currentColor" /> Silver
        </span>
      </div>
      <div className="flex justify-between text-[9px] mb-1.5" style={{ color: `${CREAM}35` }}>
        <span>Progress to Gold</span>
        <span style={{ color: accent }}>3,760 pts to go</span>
      </div>
      <div className="h-1 mb-4" style={{ backgroundColor: "rgba(247,231,206,0.08)" }}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: accent }}
          animate={{ width: ["22%", "26%"] }}
          transition={{ duration: 2.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      </div>
      <div className="relative h-9">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 flex items-center gap-2 px-3 py-2"
              style={{ backgroundColor: `${accent}14`, border: `1px solid ${accent}35` }}
            >
              <TrendingUp className="w-3 h-3" style={{ color: accent }} />
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: CREAM }}>
                +20 pts · Posted in Hub
              </span>
            </motion.div>
          )}
          {!toast && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute inset-x-0 flex items-center gap-2 px-3 py-2"
              style={{ backgroundColor: "rgba(247,231,206,0.03)", border: "1px solid rgba(247,231,206,0.08)" }}
            >
              <ChefHat className="w-3 h-3" style={{ color: `${CREAM}40` }} />
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `${CREAM}45` }}>
                Upload a recipe · +50 pts
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PreviewShell>
  );
}

/* ═══════════════════════════════════════════════════════════
   Service data
   ═══════════════════════════════════════════════════════════ */

const SERVICES = [
  {
    num: "01",
    name: "Delivery",
    tagline: "Halal food at your door",
    desc: "Order from the best halal restaurants near you, delivered in minutes.",
    features: ["Certified halal restaurants only", "Live order & rider tracking", "Delivery in minutes, not hours"],
    link: "/delivery",
    image: "/images/services/halal01.jpg",
    accent: "#B96AF0",
    logoColor: "#5E188F",
    Preview: DeliveryPreview,
  },
  {
    num: "02",
    name: "Kitchen",
    tagline: "AI-powered recipes",
    desc: "Discover thousands of halal recipes and get AI-generated meal plans tailored to you.",
    features: ["Browse 5K+ community recipes", "Upload & share your own dishes", "AQI - your AI cooking assistant"],
    link: "/kitchen",
    image: "/images/services/halal02.png",
    accent: "#F03E9E",
    Preview: KitchenPreview,
  },
  {
    num: "03",
    name: "Social",
    tagline: "The halal social network",
    desc: "Connect with the global Muslim community. Share recipes, reviews, and halal finds.",
    features: ["Share photos, recipes & finds", "Follow cooks you love", "Boost your best posts"],
    link: "/hub",
    image: "/images/services/halal03.png",
    accent: "#F59E0B",
    Preview: SocialPreview,
  },
  {
    num: "04",
    name: "Charity",
    tagline: "Give back, verified and tracked",
    desc: "Donate to verified Islamic charities and see the real-world impact of every contribution.",
    features: ["Charity Commission verified", "Payments go direct to charity", "Receipts for zakat & Gift Aid"],
    link: "/charity",
    image: "/images/page sections/rewards6.png",
    accent: "#14B8A6",
    Preview: CharityPreview,
  },
  {
    num: "05",
    name: "Rewards",
    tagline: "Earn points, redeem perks",
    desc: "Every recipe, post, and donation earns points you can redeem across HalalMe.",
    features: ["Earn from every service", "Bronze to Diamond tiers", "Boosts, flair & AI power-ups"],
    link: "/rewards",
    image: "/images/services/rewards.png",
    accent: "#FB7185",
    Preview: RewardsPreview,
  },
];

export default function HorizontalServices() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const mainSTRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const track = trackRef.current!;
      const section = sectionRef.current!;
      const progress = progressRef.current!;

      gsap.set(track, { width: `${SERVICES.length * 100}vw` });

      const getDistance = () => track.scrollWidth - window.innerWidth;

      // Main horizontal scrub - ease:"none" keeps scroll↔position 1:1
      const scrollTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1.2,
          start: "top top",
          end: () => `+=${getDistance()}`,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (SERVICES.length - 1),
            duration: { min: 0.25, max: 0.7 },
            delay: 0.08,
            ease: "power2.inOut",
          },
        },
      });
      mainSTRef.current = scrollTween.scrollTrigger ?? null;

      gsap.to(progress, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          scrub: true,
          start: "top top",
          end: () => `+=${getDistance()}`,
          invalidateOnRefresh: true,
        },
      });

      // Per-panel choreography, driven by the horizontal movement
      const panels = gsap.utils.toArray<HTMLElement>(".hs-panel", section);
      panels.forEach((panel, i) => {
        const bg = panel.querySelector(".hs-bg");
        const num = panel.querySelector(".hs-num");
        const reveals = panel.querySelectorAll(".hs-reveal");
        const preview = panel.querySelector(".hs-preview");

        // Depth: background pans slower, oversized number drifts faster
        if (bg) {
          gsap.fromTo(
            bg,
            { xPercent: i === 0 ? 0 : -7 },
            {
              xPercent: 7,
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTween,
                trigger: panel,
                start: i === 0 ? "left left" : "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        }
        if (num) {
          gsap.fromTo(
            num,
            { xPercent: i === 0 ? 0 : 35 },
            {
              xPercent: -20,
              ease: "none",
              scrollTrigger: {
                containerAnimation: scrollTween,
                trigger: panel,
                start: i === 0 ? "left left" : "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
        }

        // Content cascades in as the panel arrives (panel 0 enters with the section itself)
        if (reveals.length) {
          gsap.from(reveals, {
            opacity: 0,
            y: 44,
            stagger: 0.07,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger:
              i === 0
                ? { trigger: section, start: "top 70%", once: true }
                : {
                    containerAnimation: scrollTween,
                    trigger: panel,
                    start: "left 62%",
                    toggleActions: "play none none reverse",
                  },
          });
        }
        if (preview) {
          gsap.from(preview, {
            opacity: 0,
            x: 90,
            rotate: 2.5,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger:
              i === 0
                ? { trigger: section, start: "top 65%", once: true }
                : {
                    containerAnimation: scrollTween,
                    trigger: panel,
                    start: "left 55%",
                    toggleActions: "play none none reverse",
                  },
          });
        }

        // Track which panel is centred, for the bottom nav
        ScrollTrigger.create({
          containerAnimation: scrollTween,
          trigger: panel,
          start: "left center",
          end: "right center",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      return () => {
        mainSTRef.current = null;
        gsap.set(track, { clearProps: "width,x" });
      };
    });

    // Reduced motion on desktop: skip the hijack entirely, stack panels vertically
    mm.add("(min-width: 768px) and (prefers-reduced-motion: reduce)", () => {
      gsap.set(trackRef.current, { flexDirection: "column", width: "100%" });
      return () => {
        gsap.set(trackRef.current, { clearProps: "flexDirection,width" });
      };
    });

    return () => mm.revert();
  }, []);

  // Jump to a panel from the bottom nav
  const jumpTo = (i: number) => {
    const st = mainSTRef.current;
    if (!st) return;
    const y = st.start + (i / (SERVICES.length - 1)) * (st.end - st.start);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="relative bg-[#050F0D]">
      {/* Scroll track - flex-col on mobile, flex-row on desktop (width set by GSAP) */}
      <div ref={trackRef} className="flex flex-col md:flex-row">
        {SERVICES.map((s, i) => (
          <div
            key={s.num}
            className="hs-panel relative shrink-0 w-screen min-h-[92vh] md:h-screen overflow-hidden"
          >
            {/* Background image - oversized so the parallax pan never shows edges */}
            <div className="hs-bg absolute inset-0 scale-115">
              <Image
                src={s.image}
                alt={`HalalMe ${s.name}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover object-center"
                style={{ backgroundColor: "#102C26" }}
              />
            </div>

            {/* Cinematic gradient - dark left, image reveals right */}
            <div className="absolute inset-0 bg-linear-to-r from-[#050F0D] via-[#102C26]/82 to-[#102C26]/15" />

            {/* Oversized decorative number - drifts at its own speed */}
            <div
              aria-hidden="true"
              className="hs-num absolute -bottom-4 left-0 font-extrabold tracking-tighter leading-none select-none pointer-events-none text-[#F7E7CE]/[0.035]"
              style={{ fontSize: "clamp(8rem, 28vw, 38rem)" }}
            >
              {s.num}
            </div>

            {/* Panel content */}
            <div className="relative md:absolute md:inset-0 flex flex-col justify-center px-8 md:px-20 lg:px-28 max-w-[92vw] md:max-w-[52vw] py-16 md:py-0">
              {/* Counter */}
              <div className="hs-reveal flex items-center gap-3 mb-6 md:mb-8">
                <div className="w-6 md:w-8 h-px bg-[#F59E0B]" />
                <span className="text-[#F59E0B] text-[9px] md:text-[10px] uppercase tracking-[0.3em] font-bold">
                  {s.num} / {String(SERVICES.length).padStart(2, "0")}
                </span>
              </div>

              {/* Heading */}
              <h2 className="hs-reveal font-extrabold uppercase tracking-tighter leading-[0.88] mb-4 md:mb-5">
                <span className="flex items-center gap-2 mb-2 normal-case">
                  <span
                    style={{
                      position: "relative",
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      display: "inline-block",
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
                    <span
                      style={
                        {
                          position: "absolute",
                          inset: 0,
                          backgroundColor: s.logoColor ?? s.accent,
                          WebkitMaskImage: "url(/logo/logo.png)",
                          maskImage: "url(/logo/logo.png)",
                          WebkitMaskSize: "contain",
                          maskSize: "contain",
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                          maskMode: "alpha",
                          WebkitMaskPosition: "center",
                          maskPosition: "center",
                        } as React.CSSProperties
                      }
                    />
                  </span>
                  <span
                    className="text-base md:text-2xl lg:text-3xl font-black tracking-tight"
                    style={{ fontFamily: "var(--font-logo)", color: "#F7E7CE" }}
                  >
                    HalalMe
                  </span>
                </span>
                <span
                  className="block"
                  style={{
                    color: s.accent,
                    fontSize: "clamp(2.8rem, 7vw, 8rem)",
                  }}
                >
                  {s.name}
                </span>
              </h2>

              {/* Tagline */}
              <p className="hs-reveal text-[#F7E7CE]/70 text-[9px] md:text-[10px] uppercase tracking-[0.25em] mb-3 md:mb-4">
                {s.tagline}
              </p>

              {/* Description */}
              <p className="hs-reveal text-[#F7E7CE]/60 text-sm md:text-base lg:text-lg max-w-xs md:max-w-sm leading-relaxed mb-6">
                {s.desc}
              </p>

              {/* Feature bullets - what's actually inside */}
              <div className="hs-reveal flex flex-col gap-2 mb-8 md:mb-10">
                {s.features.map((f, fi) => (
                  <div
                    key={fi}
                    className="flex items-center gap-3 text-[10px] md:text-[11px] font-semibold uppercase tracking-wider text-[#F7E7CE]/55"
                  >
                    <motion.span
                      className="w-1.5 h-1.5 shrink-0"
                      style={{ backgroundColor: s.accent }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, delay: fi * 0.4 }}
                    />
                    {f}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="hs-reveal">
                <Link href={s.link}>
                  <button
                    className="group/btn self-start flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 font-extrabold uppercase tracking-tighter text-xs md:text-sm transition-all duration-300 border-2 hover:gap-5"
                    style={{ borderColor: s.accent, color: s.accent }}
                  >
                    Explore {s.name}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                </Link>
              </div>

              {/* Mobile-only compact preview below content */}
              <div className="md:hidden mt-8 max-w-sm">
                <s.Preview accent={s.accent} />
              </div>
            </div>

            {/* Desktop mini-demo preview - floats over the revealed image */}
            <div className="hs-preview hidden lg:block absolute right-[6vw] top-1/2 -translate-y-1/2 w-85 z-10">
              <s.Preview accent={s.accent} />
            </div>

            {/* Colored accent line on each panel */}
            <div
              className="absolute bottom-0 left-0 w-full h-0.75 opacity-60"
              style={{ backgroundColor: s.accent }}
            />
          </div>
        ))}
      </div>

      {/* Panel nav - desktop only, lights up with the active service */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 items-center gap-1">
        {SERVICES.map((s, i) => {
          const isActive = active === i;
          return (
            <button
              key={s.num}
              onClick={() => jumpTo(i)}
              aria-label={`Go to ${s.name}`}
              className="group flex items-center gap-2 px-3 py-2 transition-colors duration-300"
            >
              <span
                className="h-0.5 transition-all duration-500"
                style={{
                  width: isActive ? 28 : 12,
                  backgroundColor: isActive ? s.accent : "rgba(247,231,206,0.2)",
                }}
              />
              <span
                className="text-[9px] font-bold uppercase tracking-[0.2em] transition-colors duration-300"
                style={{ color: isActive ? s.accent : "rgba(247,231,206,0.3)" }}
              >
                {s.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Progress bar - desktop only */}
      <div className="hidden md:block absolute bottom-0 left-0 right-0 h-0.75 bg-[#F7E7CE]/8 z-10">
        <div
          ref={progressRef}
          className="h-full bg-[#F7E7CE]/50 origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </section>
  );
}
