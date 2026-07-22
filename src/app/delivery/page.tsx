"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Bike,
  Store,
  ShoppingBag,
  ShieldCheck,
  Zap,
  ArrowRight,
  BadgePercent,
  MapPin,
  Timer,
  Radio,
  Tag,
  X,
  Wifi,
  BatteryFull,
  SignalHigh,
} from "lucide-react";

const BG = "#1E0E38";
const BG2 = "#160A2A";
const CREAM = "#F7E7CE";
const GOLD = "#D4AF37";
const PURPLE = "#5E188F";
const LIGHT_PURPLE = "#B96AF0";
const DEEP = "#4A1270";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const DELIVERY_URL = "https://delivery.halalme.co.uk";

const restaurants = [
  {
    id: 1,
    name: "Dippers",
    cuisine: "Fast Food",
    distance: "1.57 mi",
    deliveryFee: "£2.99",
    image: "/images/delivery/dippers.png",
    url: "https://delivery.halalme.co.uk/en/m/dippers/66bf8d1b35890ee93d00a208",
  },
  {
    id: 2,
    name: "Kake Temptations",
    cuisine: "Ice Cream, Dessert",
    distance: "0.99 mi",
    deliveryFee: "£2.35",
    image: "/images/delivery/kake.png",
    url: "https://delivery.halalme.co.uk/en/m/kake-temptations-1/666b2905a7834f18970ad9ed",
  },
  {
    id: 3,
    name: "Uncle J's",
    cuisine: "Fast Food, Asian, Chinese",
    distance: "1.55 mi",
    deliveryFee: "£3.30",
    image: "/images/delivery/uncle%20js.png",
    url: "https://delivery.halalme.co.uk/en/m/uncle-js/66a100dc7328b7e115019742",
  },
  {
    id: 4,
    name: "Tegtat",
    cuisine: "Breakfast, Bakery",
    distance: "0.41 mi",
    deliveryFee: "£1.99",
    image: "/images/delivery/tehtat.png",
    url: "https://delivery.halalme.co.uk/en/m/tegtat/66a68223e692ee4bee00a593",
  },
  {
    id: 5,
    name: "Amigos",
    cuisine: "Pizza, Burger, Kebab",
    distance: "0.81 mi",
    deliveryFee: "£2.35",
    image: "/images/delivery/amigo.png",
    url: "https://delivery.halalme.co.uk/en/m/amigos/664f59eb133c5c0dff016c92",
  },
  {
    id: 6,
    name: "Pizza Plaza",
    cuisine: "Pizza, Burger, Fast Food",
    distance: "0.43 mi",
    deliveryFee: "£1.00",
    image: "/images/delivery/pizza%20plaza.png",
    url: "https://delivery.halalme.co.uk/en/m/pizza-plaza-1/65245926d20a415db006c845",
  },
];

export default function DeliveryLandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden pt-16"
      style={{ backgroundColor: BG }}
    >
      <AnnouncementBanner />
      <PromoBar />
      <HeroSection />
      <StatsStrip />
      <HowItWorksSection />
      <RestaurantsSection />
      <WhyDeliverySection />
      <DeliveryExperienceSection />
      <ForRestaurantsSection />
      <PromoBanner />
      <TestimonialsSection />
      <FinalCTA />
      <BottomNav />
    </div>
  );
}

/* ───────────────────────── Announcement Banner ───────────────────────── */
function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div
      className="relative flex items-center justify-center gap-3 px-10 py-2.5 text-xs font-semibold text-center"
      style={{ backgroundColor: DEEP, color: CREAM }}
    >
      <BadgePercent className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
      <span>
        New to HalalMe? Get{" "}
        <span className="font-extrabold" style={{ color: GOLD }}>£10 off</span>{" "}
        your first order - use code{" "}
        <span className="font-extrabold tracking-wider" style={{ color: GOLD }}>HALAL10</span>{" "}
        at checkout.
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ───────────────────────── Promo Ticker ───────────────────────── */
function PromoBar() {
  const tickerText =
    "£10 OFF YOUR FIRST ORDER  ·  100% HALAL CERTIFIED  ·  FREE DELIVERY OVER £25  ·  900+ ACTIVE RESTAURANTS  ·  30-60 MIN AVG DELIVERY  ·  ";
  return (
    <div className="overflow-hidden" style={{ backgroundColor: PURPLE }}>
      <div
        className="flex whitespace-nowrap py-2.5"
        style={{ animation: "ticker 18s linear infinite" }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="text-sm font-bold text-white mx-4 tracking-wide"
          >
            {tickerText}
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── Hero ───────────────────────── */
function HeroSection() {
  return (
    <section
      className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: BG, borderBottom: `1px solid ${PURPLE}50` }}
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/services/halal01.jpg"
          alt="Halal food delivery"
          fill
          className="object-cover opacity-100 scale-105"
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
        <div className="max-w-5xl w-full flex flex-col items-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-6 md:mb-8"
          >
            <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD }}
            >
              Halal Delivery at Your Doorstep
            </span>
            <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
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
                    backgroundColor: PURPLE,
                    WebkitMaskImage: "url(/logo/logo.png)",
                    maskImage: "url(/logo/logo.png)",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    maskMode: "alpha",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  } as React.CSSProperties}
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
              style={{ color: LIGHT_PURPLE }}
            >
              Delivery
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.7 }}
              className="block text-[clamp(1.5rem,5vw,5rem)]"
              style={{ color: LIGHT_PURPLE }}
            ></motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56, duration: 0.7 }}
              className="block text-[clamp(1.25rem,4vw,4rem)]"
              style={{ color: CREAM }}
            >
              100% Halal. Delivered Fast.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 md:mt-7 text-base md:text-lg max-w-md leading-relaxed mx-auto"
            style={{ color: `${CREAM}75` }}
          >
            “Craving Something Delicious?” Order fresh, halal-certified meals
            from thousands of your favorite local restaurants.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <a href={DELIVERY_URL} target="_blank" rel="noopener noreferrer">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 text-white font-extrabold uppercase tracking-tighter text-sm sm:text-base"
                style={{ backgroundColor: DEEP }}
              >
                Order Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.82 }}
            className="mt-3 text-xs font-semibold"
            style={{ color: GOLD }}
          >
            New customer? Use code <span className="font-extrabold tracking-wider">HALAL10</span> for £10 off your first order.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="mt-1.5 text-xs text-white/40"
          >
            Already have a HalalMe account? Log in at delivery with your email - a one-time code will be sent to you.
          </motion.p>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 flex flex-wrap gap-6 justify-center"
          >
            {[
              { icon: ShieldCheck, text: "100% Halal" },
              { icon: Timer, text: "30-60 Min Delivery" },
              { icon: Store, text: "900+ Active Restaurants" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: `${CREAM}65` }}
              >
                <item.icon className="w-4 h-4" style={{ color: PURPLE }} />
                {item.text}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Stats Strip ───────────────────────── */
function StatsStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4"
      style={{
        gap: "1px",
        backgroundColor: `${PURPLE}50`,
        borderTop: `1px solid ${PURPLE}50`,
        borderBottom: `1px solid ${PURPLE}50`,
      }}
    >
      {[
        { value: "900+", label: "Active Restaurants", icon: Store },
        { value: "30-60m", label: "Avg Delivery", icon: Timer },
        { value: "Free", label: "Over £25 Delivery", icon: BadgePercent },
        { value: "100%", label: "Halal Verified", icon: ShieldCheck },
      ].map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="py-10 md:py-14 px-8 md:px-12 text-center md:text-left"
            style={{ backgroundColor: BG2 }}
          >
            <Icon
              className="w-5 h-5 mb-3 mx-auto md:mx-0"
              style={{ color: `rgba(180,100,220,0.85)` }}
            />
            <div
              className="text-[3rem] md:text-[4.5rem] font-extrabold tracking-tighter leading-none"
              style={{ color: CREAM }}
            >
              {s.value}
            </div>
            <div
              className="text-[10px] md:text-xs uppercase tracking-[0.25em] mt-2 font-medium"
              style={{ color: `rgba(180,100,220,0.85)` }}
            >
              {s.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ───────────────────────── How It Works ───────────────────────── */
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      num: "01",
      icon: Store,
      title: "Browse Restaurants",
      desc: "Explore 900+ certified halal restaurants near you. Filter by cuisine, rating, or delivery time.",
    },
    {
      num: "02",
      icon: ShoppingBag,
      title: "Place Your Order",
      desc: "Build your perfect meal, customise to your liking, and check out in seconds. Simple as that.",
    },
    {
      num: "03",
      icon: Bike,
      title: "Fast Delivery",
      desc: "Track your order in real-time as our riders bring your food hot and fresh to your doorstep.",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-24 md:py-32"
      style={{
        backgroundColor: BG,
        borderTop: `1px solid ${PURPLE}50`,
        borderBottom: `1px solid ${PURPLE}50`,
      }}
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
          <span
            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            How It Works
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
          style={{ color: CREAM }}
        >
          Three Steps
          <br />
          <span style={{ color: `${CREAM}75` }}>Browse. Order. Deliver.</span>
        </motion.h2>
      </div>

      <div
        className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-3"
        style={{
          gap: "1px",
          backgroundColor: `${PURPLE}50`,
          borderLeft: `2px solid ${PURPLE}80`,
          borderRight: `2px solid ${PURPLE}80`,
        }}
      >
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.12, duration: 0.5 }}
              className="group relative p-8 md:p-10 overflow-hidden transition-colors duration-300"
              style={{
                backgroundColor: BG,
                border: `1px solid ${CREAM}08`,
                minHeight: "280px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = DEEP)
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BG)}
            >
              <span
                aria-hidden="true"
                className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none"
                style={{ color: "#180830" }}
              >
                {step.num}
              </span>
              <div className="relative z-10 flex flex-col">
                <Icon
                  className="w-7 h-7 mb-8 transition-colors duration-300 group-hover:text-white"
                  style={{ color: PURPLE }}
                />
                <h3
                  className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter mb-4 transition-colors duration-300 group-hover:text-white"
                  style={{ color: CREAM }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm md:text-base leading-relaxed transition-colors duration-300 group-hover:text-white/75"
                  style={{ color: `${CREAM}75` }}
                >
                  {step.desc}
                </p>
                <div
                  className="mt-6 flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-colors duration-300 group-hover:text-white"
                  style={{ color: PURPLE }}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────── Partner Restaurants ─────────────────── */
function RestaurantsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="py-24 md:py-32"
      style={{
        backgroundColor: BG2,
        borderTop: `1px solid ${PURPLE}50`,
        borderBottom: `1px solid ${PURPLE}50`,
      }}
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
          <span
            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            Top Rated
          </span>
        </motion.div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Partner
            <br />
            <span style={{ color: `${CREAM}75` }}>Restaurants.</span>
          </motion.h2>
          <a href={DELIVERY_URL} target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-opacity hover:opacity-70"
              style={{ color: PURPLE }}
            >
              View All <ArrowRight className="w-4 h-4" />
            </motion.button>
          </a>
        </div>
      </div>

      <div
        className="max-w-[95vw] mx-auto px-6 md:px-10 grid sm:grid-cols-2 lg:grid-cols-3"
        style={{
          gap: "1px",
          backgroundColor: `${PURPLE}50`,
          borderLeft: `2px solid ${PURPLE}80`,
          borderRight: `2px solid ${PURPLE}80`,
        }}
      >
        {restaurants.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
          >
            <a href={r.url} target="_blank" rel="noopener noreferrer">
              <div
                className="group relative overflow-hidden cursor-pointer transition-colors duration-300"
                style={{ backgroundColor: BG2, border: `1px solid ${CREAM}08` }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#0F0620")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BG2)
                }
              >
                <div className="relative h-40 sm:h-52 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${r.image})`,
                      backgroundColor: "#1a0d2e",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, ${BG2} 0%, transparent 60%)`,
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3
                    className="text-lg font-extrabold uppercase tracking-tight mb-1.5 transition-colors duration-300 group-hover:opacity-70"
                    style={{ color: CREAM }}
                  >
                    {r.name}
                  </h3>
                  <p
                    className="text-sm mb-4 uppercase tracking-wide font-medium"
                    style={{ color: `${CREAM}65` }}
                  >
                    {r.cuisine}
                  </p>
                  <div
                    className="flex items-center justify-between text-xs"
                    style={{ color: `${CREAM}65` }}
                  >
                    <div className="flex items-center gap-3 font-semibold uppercase tracking-wide">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {r.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bike className="w-3 h-3" />
                        {r.deliveryFee}
                      </span>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      style={{ color: PURPLE }}
                    />
                  </div>
                </div>
              </div>
            </a>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="max-w-[95vw] mx-auto px-6 md:px-10 mt-12"
      >
        <a href={DELIVERY_URL} target="_blank" rel="noopener noreferrer">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-8 py-4 text-white font-extrabold uppercase tracking-tighter text-sm"
            style={{ backgroundColor: DEEP }}
          >
            Explore All Restaurants
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </a>
      </motion.div>
    </section>
  );
}

/* ──────────────────── Why HalalMe Delivery ──────────────────── */
function WhyDeliverySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const benefits = [
    {
      num: "01",
      icon: ShieldCheck,
      title: "100% Halal Certified",
      desc: "Every restaurant on our platform is verified halal. We audit regularly so you can order with complete confidence.",
    },
    {
      num: "02",
      icon: Zap,
      title: "Lightning Fast",
      desc: "Average delivery in just 30-60 minutes. Our rider network ensures your food arrives hot and fresh, every time.",
    },
    {
      num: "03",
      icon: Radio,
      title: "Live Tracking",
      desc: "Track your order every step of the way - from kitchen to your door. Real-time updates, no guessing.",
    },
    {
      num: "04",
      icon: Tag,
      title: "Exclusive Deals",
      desc: "Unlock special offers, loyalty rewards, and first-order discounts. Save more with every order you place.",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-24 md:py-32"
      style={{
        backgroundColor: BG,
        borderTop: `1px solid ${PURPLE}50`,
        borderBottom: `1px solid ${PURPLE}50`,
      }}
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
          <span
            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            Why Choose Us
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
          style={{ color: CREAM }}
        >
          Built for the
          <br />
          <span style={{ color: `${CREAM}75` }}>Halal Community.</span>
        </motion.h2>
      </div>

      <div
        className="max-w-[95vw] mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          gap: "1px",
          backgroundColor: `${PURPLE}50`,
          borderLeft: `2px solid ${PURPLE}80`,
          borderRight: `2px solid ${PURPLE}80`,
        }}
      >
        {benefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative p-8 overflow-hidden hover:bg-[#F7E7CE] transition-colors duration-300 cursor-default"
              style={{
                backgroundColor: BG,
                border: `1px solid ${CREAM}08`,
                minHeight: "220px",
              }}
            >
              <span
                aria-hidden="true"
                className="absolute -top-6 -right-3 text-[7rem] font-extrabold leading-none select-none pointer-events-none transition-colors duration-300"
                style={{ color: "#130626" }}
              >
                {b.num}
              </span>
              <div
                className="relative z-10 flex flex-col"
                style={{ minHeight: "180px" }}
              >
                <Icon
                  className="w-6 h-6 mb-6 transition-colors duration-300 group-hover:text-[#4A1270]"
                  style={{ color: PURPLE }}
                />
                <h3
                  className="text-lg md:text-xl font-extrabold uppercase tracking-tighter mb-3 transition-colors duration-300 group-hover:text-[#08060F]"
                  style={{ color: CREAM }}
                >
                  {b.title}
                </h3>
                <p
                  className="text-sm leading-relaxed transition-colors duration-300 group-hover:text-[#08060F]/65"
                  style={{ color: `${CREAM}75` }}
                >
                  {b.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────── Promo Banner ─────────────────────── */
function PromoBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="py-8 px-6 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-[95vw] mx-auto relative overflow-hidden"
        style={{ backgroundColor: PURPLE }}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 px-8 md:px-14 py-10 md:py-12">
          <div className="flex items-center gap-5">
            <div
              className="w-14 h-14 flex items-center justify-center shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <BadgePercent className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter text-white mb-1">
                Get £10 Off Your First Order
              </h3>
              <p className="text-white/70 text-base">
                Use code <span className="font-bold text-white">HALAL10</span>{" "}
                at checkout. Certified halal food, delivered for less.
              </p>
            </div>
          </div>
          <a href={DELIVERY_URL} target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 font-extrabold uppercase tracking-tighter text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
              style={{ backgroundColor: BG, color: PURPLE }}
            >
              Claim Offer
            </motion.button>
          </a>
        </div>

        {/* Watermark */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-white/5 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
        >
          HALAL10
        </div>
      </motion.div>
    </section>
  );
}

/* ───────────────────────── Final CTA ───────────────────────── */
function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-28 md:py-36"
      style={{ backgroundColor: DEEP }}
    >
      <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
          <span
            className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold"
            style={{ color: GOLD }}
          >
            Ready to Order
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-white mb-10 max-w-4xl"
        >
          Hungry?
          <br />
          Order Now.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-base md:text-lg max-w-xl mb-12 leading-relaxed"
        >
          900+ halal restaurants. 30-60 minute delivery. Zero compromise. Your
          next favourite meal is just a tap away.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <a href={DELIVERY_URL} target="_blank" rel="noopener noreferrer">
            <button
              className="flex items-center gap-3 px-8 py-4 bg-white font-extrabold uppercase tracking-tighter text-base hover:bg-[#F7E7CE] transition-colors"
              style={{ color: DEEP }}
            >
              Start Ordering
              <ArrowRight className="w-5 h-5" />
            </button>
          </a>
          <a href={DELIVERY_URL} target="_blank" rel="noopener noreferrer">
            <button className="flex items-center gap-3 px-8 py-4 border-2 border-white/30 text-white font-extrabold uppercase tracking-tighter text-base hover:bg-white/10 transition-colors">
              View Restaurants
            </button>
          </a>
        </motion.div>

        <div className="flex flex-wrap gap-6 md:gap-10">
          {[
            { icon: ShieldCheck, text: "100% Halal Verified" },
            { icon: Timer, text: "30-60 Min Delivery" },
            { icon: Store, text: "900+ Restaurants" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wide"
            >
              <item.icon className="w-4 h-4" />
              {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* Watermark */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-white/5 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
      >
        Delivery
      </div>
    </section>
  );
}

/* ─────────────────── Merchant Image Slideshow (inside ContainerScroll card) ─────────────────── */
const MERCHANT_IMAGES = [
  { src: "/images/page sections/delivery3.jpg", alt: "Restaurant kitchen" },
  { src: "/images/page sections/delivery4.jpg", alt: "Menu management" },
  { src: "/images/page sections/delivery5.jpg", alt: "Rider pickup" },
  { src: "/images/page sections/delivery6.jpg", alt: "Delivery handoff" },
];

function MerchantSlideshow() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(0);
  const DURATION = 3000;

  useEffect(() => {
    startRef.current = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      if (elapsed < DURATION) {
        raf = requestAnimationFrame(tick);
      } else {
        setCurrent((p) => (p + 1) % MERCHANT_IMAGES.length);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 50, scale: 1.04 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.97 }}
          transition={{ duration: 0.6, ease: [0.32, 0, 0.67, 0] }}
          className="absolute inset-0"
        >
          <Image
            src={MERCHANT_IMAGES[current].src}
            alt={MERCHANT_IMAGES[current].alt}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 900px"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, rgba(13,7,32,0.6) 0%, transparent 55%)`,
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {MERCHANT_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="relative overflow-hidden rounded-full transition-all duration-300"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              backgroundColor: i === current ? PURPLE : `${CREAM}35`,
            }}
          >
            {i === current && (
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ backgroundColor: CREAM, width: `${progress}%` }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function POSTerminal3D({ children }: { children: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const ledRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([rigRef.current, floatRef.current], {
        transformPerspective: 2000,
      });
      gsap.set(receiptRef.current, { scaleY: 0, transformOrigin: "50% 0%" });

      // Scroll-linked reveal: tilts up into a held, diagonal angle
      gsap.fromTo(
        rigRef.current,
        { rotateX: 34, rotateY: -26, rotation: -20, y: 90, autoAlpha: 0 },
        {
          rotateX: 12,
          rotateY: -16,
          rotation: -11,
          y: 0,
          autoAlpha: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: stageRef.current,
            start: "top 85%",
            end: "top 40%",
            scrub: 0.6,
          },
        }
      );

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Continuous 3D float. Each axis runs on its own period so the cycles
        // never line up, which reads as organic drifting instead of a loop.
        const floatTweens = [
          gsap.fromTo(
            floatRef.current,
            { rotateY: -11 },
            {
              rotateY: 11,
              duration: 6.5,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }
          ),
          gsap.fromTo(
            floatRef.current,
            { rotateX: -7 },
            {
              rotateX: 7,
              duration: 4.7,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }
          ),
          gsap.fromTo(
            floatRef.current,
            { rotation: -3.5 },
            {
              rotation: 3.5,
              duration: 8.3,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }
          ),
          gsap.fromTo(
            floatRef.current,
            { y: -16 },
            { y: 16, duration: 3.9, ease: "sine.inOut", yoyo: true, repeat: -1 }
          ),
          // depth push/pull so it drifts toward and away from the viewer
          gsap.fromTo(
            floatRef.current,
            { z: -55 },
            { z: 55, duration: 5.6, ease: "sine.inOut", yoyo: true, repeat: -1 }
          ),
        ];

        // Shadow reacts to the float so the device reads as hovering
        const shadow = gsap.fromTo(
          shadowRef.current,
          { scale: 0.86, opacity: 0.75 },
          {
            scale: 1.1,
            opacity: 0.45,
            duration: 3.9,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }
        );

        // Specular sheen sweeping across the glass as it turns
        const sheen = gsap.fromTo(
          sheenRef.current,
          { xPercent: -120, opacity: 0 },
          {
            xPercent: 120,
            opacity: 1,
            duration: 2.6,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 4.2,
          }
        );

        // status LED blink
        const led = gsap.to(ledRef.current, {
          opacity: 0.2,
          duration: 1,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        // receipt printing loop
        const receiptTl = gsap.timeline({ repeat: -1, repeatDelay: 2.2, delay: 1.6 });
        receiptTl
          .to(receiptRef.current, { scaleY: 1, duration: 1.1, ease: "steps(16)" })
          .to({}, { duration: 1.5 })
          .to(receiptRef.current, { scaleY: 0, duration: 0.45, ease: "power1.in" });

        return () => {
          floatTweens.forEach((t) => t.kill());
          shadow.kill();
          sheen.kill();
          led.kill();
          receiptTl.kill();
        };
      });
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={stageRef}
      className="relative w-full flex items-center justify-center py-10 md:py-14"
      style={{ perspective: "2000px" }}
    >
      {/* Floor shadow */}
      <div
        ref={shadowRef}
        className="absolute bottom-6 w-[62%] h-[3.5rem] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)",
          filter: "blur(10px)",
          transform: "translateY(1rem) rotateX(60deg)",
        }}
      />

      <div
        ref={rigRef}
        className="relative w-full max-w-[13.5rem] md:max-w-[14.5rem]"
        style={{ transformStyle: "preserve-3d" }}
      >
       <div ref={floatRef} style={{ transformStyle: "preserve-3d" }}>
        {/* ── Device body ── */}
        <div
          className="relative w-full rounded-[1.7rem] p-[0.5rem] flex flex-col"
          style={{
            background:
              "linear-gradient(150deg, #3a3a3f 0%, #1a1a1d 22%, #050506 55%, #141416 100%)",
            boxShadow:
              "0 40px 70px -25px rgba(0,0,0,0.75), 0 2px 0 rgba(255,255,255,0.14) inset, 0 -2px 6px rgba(0,0,0,0.6) inset",
          }}
        >
          {/* Side buttons (left edge) */}
          <div
            className="absolute left-[-3px] top-[38%] w-[3px] h-[2.4rem] rounded-l-[3px]"
            style={{ background: "linear-gradient(180deg,#2a2a2d,#0c0c0e)" }}
          />
          <div
            className="absolute left-[-3px] top-[54%] w-[3px] h-[1.4rem] rounded-l-[3px]"
            style={{ background: "linear-gradient(180deg,#2a2a2d,#0c0c0e)" }}
          />

          {/* ── Printer cap ── */}
          <div className="relative px-[0.55rem] pt-[0.7rem] pb-[0.35rem]">
            {/* Brand lockup */}
            <div className="flex items-center justify-center gap-[0.4rem]">
              <span
                className="text-white font-black tracking-tight leading-none"
                style={{ fontSize: "1.05rem", fontFamily: "var(--font-logo)" }}
              >
                Halal&nbsp;me
              </span>
              <span
                className="relative shrink-0 rounded-full"
                style={{ width: 17, height: 17, background: "#fff" }}
              >
                <span
                  className="absolute inset-0"
                  style={{
                    background: "#111",
                    WebkitMaskImage: "url(/logo/logo.png)",
                    maskImage: "url(/logo/logo.png)",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
              </span>
            </div>
            <p
              className="text-center mt-[0.15rem] font-semibold tracking-[0.02em]"
              style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.46rem" }}
            >
              Fresh Food Delivered Fast
            </p>

            {/* Cutter bar + serrated teeth */}
            <div className="mt-[0.55rem]">
              <div
                className="h-[3px] rounded-[2px]"
                style={{
                  background:
                    "linear-gradient(180deg,#8f9094 0%,#54565a 45%,#232427 100%)",
                  boxShadow: "0 1px 1px rgba(0,0,0,0.5)",
                }}
              />
              <div
                className="h-[4px]"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, #6f7175 0 1.5px, #1b1c1e 1.5px 4px)",
                }}
              />
              <div
                className="h-[3px] rounded-b-[3px]"
                style={{ background: "#08080a", boxShadow: "inset 0 2px 3px rgba(0,0,0,0.9)" }}
              />
            </div>
          </div>

          {/* ── Receipt paper feeding out of the slot ── */}
          <div className="relative h-0 z-20">
            <div
              ref={receiptRef}
              className="absolute left-1/2 -translate-x-1/2 top-0 w-[68%] font-mono"
              style={{
                background: "#f6f2e8",
                color: "#241a05",
                fontSize: "0.4rem",
                lineHeight: 1.5,
                padding: "0.35rem 0.3rem 0.45rem",
                boxShadow: "0 8px 16px -6px rgba(0,0,0,0.6)",
                transformOrigin: "50% 0%",
                clipPath:
                  "polygon(0 0,100% 0,100% calc(100% - 3px),94% 100%,88% calc(100% - 3px),82% 100%,76% calc(100% - 3px),70% 100%,64% calc(100% - 3px),58% 100%,52% calc(100% - 3px),46% 100%,40% calc(100% - 3px),34% 100%,28% calc(100% - 3px),22% 100%,16% calc(100% - 3px),10% 100%,4% calc(100% - 3px),0 100%)",
              }}
            >
              <p className="m-0 whitespace-pre text-center font-bold tracking-[0.1em]">
                HalalMe
              </p>
              <p className="m-0 whitespace-pre opacity-50">*** ORDER #4821 ***</p>
              <p className="m-0 whitespace-pre">1x Zinger Wrap&nbsp;&nbsp;£6.50</p>
              <p className="m-0 whitespace-pre">1x Loaded Fries&nbsp;&nbsp;£3.20</p>
              <p className="m-0 whitespace-pre opacity-50">------------------</p>
              <p className="m-0 whitespace-pre font-bold">TOTAL&nbsp;&nbsp;&nbsp;£9.70</p>
              <p className="m-0 whitespace-pre opacity-50">STATUS: PAID ✓</p>
            </div>
          </div>

          {/* ── Screen ── */}
          <div
            className="relative mx-[0.3rem] mb-[0.3rem] rounded-[0.9rem] overflow-hidden"
            style={{
              aspectRatio: "0.62",
              background: "#000",
              border: "2px solid #050506",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.05), 0 6px 14px rgba(0,0,0,0.6) inset",
            }}
          >
            {/* Slideshow content */}
            <div className="absolute inset-0">{children}</div>

            {/* Status bar */}
            <div
              className="absolute top-0 left-0 right-0 flex items-center justify-between px-[0.6rem] py-[0.28rem] z-10"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 100%)",
              }}
            >
              <span
                className="text-white font-semibold"
                style={{ fontSize: "0.42rem" }}
              >
                12:06
              </span>
              <div className="flex items-center gap-[0.22rem] text-white">
                <SignalHigh style={{ width: 7, height: 7 }} />
                <Wifi style={{ width: 7, height: 7 }} />
                <BatteryFull style={{ width: 9, height: 9 }} />
              </div>
            </div>

            {/* Glass reflection */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 32%)",
              }}
            />

            {/* Sweeping specular highlight */}
            <div
              ref={sheenRef}
              className="absolute inset-y-0 -left-1/2 w-[70%] pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.3) 55%, transparent 100%)",
                filter: "blur(3px)",
              }}
            />

            {/* Brand LED */}
            <span
              ref={ledRef}
              className="absolute top-[0.4rem] left-1/2 -translate-x-1/2 w-[4px] h-[4px] rounded-full z-10"
              style={{ background: GOLD, boxShadow: `0 0 5px 1px ${GOLD}cc` }}
            />

            {/* Home indicator pill */}
            <div
              className="absolute bottom-[0.4rem] left-1/2 -translate-x-1/2 w-[28%] h-[3px] rounded-full z-10"
              style={{ background: "rgba(255,255,255,0.55)" }}
            />
          </div>
        </div>
       </div>
      </div>
    </div>
  );
}

/* ─────────────────── For Restaurants (Merchant) ─────────────────── */
function ForRestaurantsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const points = [
    "Manage your menu seamlessly",
    "Receive orders instantly",
    "Stay focused on food",
  ];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 md:py-32"
      style={{ backgroundColor: BG2 }}
    >
      <span
        aria-hidden="true"
        className="absolute -top-4 -right-6 md:-top-10 md:-right-10 text-[10rem] md:text-[18rem] font-extrabold leading-none select-none pointer-events-none z-0"
        style={{ color: "#0F0620" }}
      >
        02
      </span>

      <div className="relative max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-[1fr_1.05fr] gap-16 md:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: GOLD }}
            >
              For Restaurants
            </span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Run Your Kitchen
            <br />
            <span style={{ color: `${CREAM}75` }}>Like a System.</span>
          </h2>

          <div
            className="w-full max-w-md flex flex-col"
            style={{ borderTop: `1px solid ${CREAM}12` }}
          >
            {points.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 py-3 text-sm font-semibold uppercase tracking-wide"
                style={{
                  color: `${CREAM}B3`,
                  borderBottom: `1px solid ${CREAM}12`,
                }}
              >
                <span>{p}</span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: PURPLE }}
                >
                  0{i + 1}
                </span>
              </div>
            ))}
          </div>

          <Link href="/for-restaurants">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-8 py-4 text-white font-extrabold uppercase tracking-tighter text-sm w-fit"
              style={{ backgroundColor: DEEP }}
            >
              Join as a Restaurant
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

        <POSTerminal3D>
          <MerchantSlideshow />
        </POSTerminal3D>
      </div>
    </section>
  );
}

/* ─────────────────── Delivery Experience ─────────────────── */
function DeliveryExperienceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const points = [
    "Browse restaurants",
    "Add to cart instantly",
    "Track orders in real-time",
  ];

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        backgroundColor: BG,
        borderTop: `1px solid ${PURPLE}50`,
        borderBottom: `1px solid ${PURPLE}50`,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute -top-4 -left-4 md:-top-10 md:-left-6 text-[10rem] md:text-[18rem] font-extrabold leading-none select-none pointer-events-none"
        style={{ color: "#130626" }}
      >
        01
      </span>

      <div className="relative max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
          <span
            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            Delivery
          </span>
        </motion.div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Order Without
            <br />
            <span style={{ color: `${CREAM}75` }}>Friction.</span>
          </motion.h2>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="flex flex-col md:max-w-sm w-full"
            style={{ borderTop: `1px solid ${CREAM}12` }}
          >
            {points.map((p, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-4 py-3 text-sm md:text-base font-semibold uppercase tracking-wide"
                style={{
                  color: `${CREAM}B3`,
                  borderBottom: `1px solid ${CREAM}12`,
                }}
              >
                <span>{p}</span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: PURPLE }}
                >
                  0{i + 1}
                </span>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      <div
        className="relative max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-2"
        style={{ gap: "1px", backgroundColor: `${CREAM}08` }}
      >
        {["delivery1", "delivery2"].map((img, i) => (
          <motion.div
            key={img}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
            className="relative w-full aspect-[12/5] overflow-hidden"
            style={{ backgroundColor: BG2 }}
          >
            <Image
              src={`/images/page sections/${img}.jpg`}
              alt={img === "delivery1" ? "Order at the door" : "Rider handoff"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 48vw"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── Testimonials ───────────────────────── */
function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const testimonials = [
    {
      quote:
        "Halal Me Delivery is a game-changer for halal food lovers! The app is user-friendly, the food quality is exceptional, and the delivery is punctual. Their customer service goes above and beyond. Highly recommended for a top-notch halal dining experience!",
      name: "Zainab Javied",
      date: "11 October 2023",
    },
    {
      quote:
        "Ordered it yesterday extremely fast delivery definitely gonna be ordering from here again",
      name: "Adyaan",
      date: "23 April 2024",
    },
    {
      quote:
        "Ordered food last week it was very fast delivery very delicious halal food great service loved it! Definitley gonna order again thank you!",
      name: "Ibrahim Khawaja",
      date: "5 April 2024",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 md:py-28"
      style={{ backgroundColor: BG2, borderTop: `1px solid ${PURPLE}50` }}
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
          <span
            className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            Customer Reviews
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-14 md:mb-20"
          style={{ color: CREAM }}
        >
          Real People.
          <br />
          <span style={{ color: `${CREAM}50` }}>Real Reviews.</span>
        </motion.h2>

        <div
          className="grid md:grid-cols-3"
          style={{
            gap: "1px",
            backgroundColor: `${PURPLE}50`,
            borderLeft: `2px solid ${PURPLE}50`,
            borderRight: `2px solid ${PURPLE}50`,
          }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="flex flex-col justify-between gap-6 p-8 md:p-10"
              style={{ backgroundColor: BG }}
            >
              <p
                className="text-base md:text-lg leading-relaxed italic"
                style={{ color: `${CREAM}B3` }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
                <div>
                  <span
                    className="block text-xs uppercase tracking-[0.2em] font-bold"
                    style={{ color: `${CREAM}80` }}
                  >
                    {t.name}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: `${CREAM}35` }}
                  >
                    {t.date}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Bottom Nav ───────────────────────── */
function BottomNav() {
  return (
    <div
      className="px-6 py-8"
      style={{ backgroundColor: BG, borderTop: `1px solid ${CREAM}08` }}
    >
      <div className="max-w-[95vw] mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2" style={{ opacity: 0.75 }}>
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: CREAM }}>
            Powered by
          </span>
          <div className="relative w-16 aspect-[19/10]">
            <Image
              src="/images/page sections/hyperzod.jpg"
              alt="Hyperzod"
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>
        </div>
        <Link
          href="/kitchen"
          className="text-xs font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-100 opacity-40"
          style={{ color: CREAM }}
        >
          Kitchen →
        </Link>
      </div>
    </div>
  );
}
