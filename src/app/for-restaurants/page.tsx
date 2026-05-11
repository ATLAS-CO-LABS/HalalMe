"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import {
  ArrowRight,
  BadgePercent,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Timer,
  Users,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";

const BG = "#1E0E38";
const BG2 = "#160A2A";
const CREAM = "#F7E7CE";
const GOLD = "#D4AF37";
const PURPLE = "#5E188F";
const LIGHT_PURPLE = "#B96AF0";
const DEEP = "#4A1270";
const TALLY_URL = "https://tally.so/r/EklXdA";

export default function ForRestaurantsPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden pt-16"
      style={{ backgroundColor: BG }}
    >
      <HeroSection />
      <StatsStrip />
      <WhyHalalMeSection />
      <HowItWorksSection />
      <ComparisonSection />
      <TestimonialsSection />
      <FinalCTASection />
      <FAQSection />
    </div>
  );
}

/* ─────────────────────────── Restaurant Slideshow ─────────────────────────── */
const RESTAURANT_IMAGES = [
  { src: "/images/page sections/delivery3.jpg", alt: "Restaurant kitchen" },
  { src: "/images/page sections/delivery4.jpg", alt: "Menu management" },
  { src: "/images/page sections/delivery5.jpg", alt: "Rider pickup" },
  { src: "/images/page sections/delivery6.jpg", alt: "Delivery handoff" },
];

function RestaurantSlideshow() {
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
        setCurrent((p) => (p + 1) % RESTAURANT_IMAGES.length);
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
            src={RESTAURANT_IMAGES[current].src}
            alt={RESTAURANT_IMAGES[current].alt}
            fill
            className="object-cover"
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

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {RESTAURANT_IMAGES.map((_, i) => (
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

/* ─────────────────────────── Hero ─────────────────────────── */
function HeroSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      <ContainerScroll
        cardInnerClassName="bg-[#0D0720]"
        titleComponent={
          <div className="flex flex-col items-center gap-5 text-center px-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: GOLD }}
              >
                For Restaurant Partners
              </span>
              <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
            </motion.div>

            <h1 className="font-extrabold uppercase tracking-tighter leading-[0.88]">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="block text-[clamp(2.5rem,7vw,7rem)]"
                style={{ color: CREAM }}
              >
                Grow Your
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.7 }}
                className="block text-[clamp(2.5rem,7vw,7rem)]"
                style={{ color: LIGHT_PURPLE }}
              >
                Restaurant
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                className="block text-[clamp(2rem,5vw,5rem)]"
                style={{ color: CREAM }}
              >
                With HalalMe.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-base md:text-lg max-w-md leading-relaxed"
              style={{ color: `${CREAM}75` }}
            >
              Join 900+ restaurants already signed up across the UK. Lower
              commission. Halal-verified customers. Zero hassle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.68 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <a href={TALLY_URL} target="_blank" rel="noopener noreferrer">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-7 py-3.5 font-extrabold uppercase tracking-tighter text-sm"
                  style={{ backgroundColor: CREAM, color: BG }}
                >
                  Partner With Us
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </a>
              <a href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-7 py-3.5 font-extrabold uppercase tracking-tighter text-sm border-2 hover:bg-white/10 transition-colors"
                  style={{ borderColor: `${CREAM}50`, color: CREAM }}
                >
                  See How It Works ↓
                </motion.button>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="flex flex-wrap gap-6 justify-center"
            >
              {[
                { icon: ShieldCheck, text: "100% Halal Verified" },
                { icon: Store, text: "900+ Restaurants" },
                { icon: Timer, text: "Go Live in 48hrs" },
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
        }
      >
        <RestaurantSlideshow />
      </ContainerScroll>
    </section>
  );
}

/* ─────────────────────────── Stats Strip ─────────────────────────── */
function StatsStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { value: "900+", label: "Restaurants Signed", icon: Store },
    { value: "5", label: "UK Cities", icon: MapPin },
    { value: "48hrs", label: "Average Go-Live Time", icon: Timer },
    { value: "100%", label: "Halal Verified", icon: ShieldCheck },
  ];

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
      {stats.map((s, i) => {
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
              style={{ color: "rgba(180,100,220,0.85)" }}
            />
            <div
              className="text-[3rem] md:text-[4.5rem] font-extrabold tracking-tighter leading-none"
              style={{ color: CREAM }}
            >
              {s.value}
            </div>
            <div
              className="text-[10px] md:text-xs uppercase tracking-[0.25em] mt-2 font-medium"
              style={{ color: "rgba(180,100,220,0.85)" }}
            >
              {s.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Why HalalMe ─────────────────────────── */
function WhyHalalMeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const cards = [
    {
      num: "01",
      icon: BadgePercent,
      title: "Lower Commission",
      desc: "Keep more of what you earn. Our rates are designed to let independent restaurants thrive, not just survive.",
    },
    {
      num: "02",
      icon: Users,
      title: "Halal-Verified Customers",
      desc: "Your customers are actively looking for halal. No more competing with non-halal restaurants for visibility. You're the main event.",
    },
    {
      num: "03",
      icon: Zap,
      title: "Go Live in 48 Hours",
      desc: "We handle the setup. Menu upload, photo guidance, halal verification - our team does the heavy lifting so you can focus on cooking.",
    },
    {
      num: "04",
      icon: Store,
      title: "Community, Not Just a Platform",
      desc: "HalalMe isn't another faceless app. We're building the halal ecosystem - rewards, social, recipes - and your restaurant is at the centre of it.",
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
            Why HalalMe
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
          style={{ color: CREAM }}
        >
          Everything Uber Eats
          <br />
          <span style={{ color: `${CREAM}75` }}>Offers. Plus More.</span>
        </motion.h2>
      </div>

      <div
        className="max-w-[95vw] mx-auto px-6 md:px-10 grid sm:grid-cols-2 lg:grid-cols-4"
        style={{
          gap: "1px",
          backgroundColor: `${PURPLE}50`,
          borderLeft: `2px solid ${PURPLE}80`,
          borderRight: `2px solid ${PURPLE}80`,
        }}
      >
        {cards.map((card, i) => {
          const Icon = card.icon;
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
                className="absolute -top-6 -right-3 text-[7rem] font-extrabold leading-none select-none pointer-events-none"
                style={{ color: "#130626" }}
              >
                {card.num}
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
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed transition-colors duration-300 group-hover:text-[#08060F]/65"
                  style={{ color: `${CREAM}75` }}
                >
                  {card.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────── How It Works ─────────────────────────── */
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const steps = [
    {
      num: "01",
      icon: ClipboardList,
      title: "Sign Up",
      desc: "Fill in your details and upload your halal certificate. Takes under 5 minutes.",
    },
    {
      num: "02",
      icon: Settings,
      title: "We Set You Up",
      desc: "Our team uploads your menu, optimises your listing, and verifies your halal credentials. You approve and go live.",
    },
    {
      num: "03",
      icon: ShoppingBag,
      title: "Start Receiving Orders",
      desc: "Orders come in through your tablet or existing POS. Riders pick up. You get paid every 3 days.",
    },
  ];

  return (
    <section
      id="how-it-works"
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
          Three Steps.
          <br />
          <span style={{ color: `${CREAM}75` }}>
            Sign Up. Set Up. Start Earning.
          </span>
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
                backgroundColor: BG2,
                border: `1px solid ${CREAM}08`,
                minHeight: "280px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = DEEP)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = BG2)
              }
            >
              <span
                aria-hidden="true"
                className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none"
                style={{ color: "#0F0620" }}
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
                <div className="mt-6" style={{ color: PURPLE }}>
                  <ArrowRight className="w-4 h-4 transition-colors duration-300 group-hover:text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────────────────────── Comparison Table ─────────────────────────── */
type CellVal = boolean | string;

function renderCell(val: CellVal, highlighted = false) {
  if (typeof val === "boolean") {
    return val ? (
      <CheckCircle2
        className="w-5 h-5 mx-auto"
        style={{ color: highlighted ? GOLD : "#22c55e" }}
      />
    ) : (
      <XCircle className="w-5 h-5 mx-auto" style={{ color: "#4b5563" }} />
    );
  }
  return <span className="text-sm font-bold">{val}</span>;
}

function ComparisonSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const rows: {
    feature: string;
    halalme: CellVal;
    uberEats: CellVal;
    deliveroo: CellVal;
  }[] = [
    {
      feature: "Commission Rate",
      halalme: "[TBC]%",
      uberEats: "~30%",
      deliveroo: "~25–35%",
    },
    {
      feature: "Halal-Only Marketplace",
      halalme: true,
      uberEats: false,
      deliveroo: false,
    },
    {
      feature: "Halal Certificate Verification",
      halalme: true,
      uberEats: false,
      deliveroo: false,
    },
    {
      feature: "Dedicated Halal Audience",
      halalme: true,
      uberEats: false,
      deliveroo: false,
    },
    {
      feature: "Go-Live Time",
      halalme: "48hrs",
      uberEats: "2–4 weeks",
      deliveroo: "2–4 weeks",
    },
    {
      feature: "Payout Frequency",
      halalme: "Every 3 days",
      uberEats: "Weekly",
      deliveroo: "Weekly",
    },
    {
      feature: "Self-Service Menu Updates",
      halalme: true,
      uberEats: true,
      deliveroo: true,
    },
    {
      feature: "Community Rewards",
      halalme: true,
      uberEats: false,
      deliveroo: false,
    },
    {
      feature: "Dedicated Local Support",
      halalme: true,
      uberEats: "Limited",
      deliveroo: "Limited",
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
            The Difference
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
          style={{ color: CREAM }}
        >
          Already on Uber Eats?
          <br />
          <span style={{ color: `${CREAM}75` }}>Pay Less. Get More.</span>
        </motion.h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="max-w-[95vw] mx-auto px-6 md:px-10 overflow-x-auto"
      >
        <table
          className="w-full min-w-[580px]"
          style={{ borderCollapse: "collapse" }}
        >
          <thead>
            <tr style={{ borderBottom: `1px solid ${CREAM}20` }}>
              <th
                className="text-left py-4 px-4 text-xs font-bold uppercase tracking-widest"
                style={{ color: `${CREAM}50`, width: "36%" }}
              >
                Feature
              </th>
              <th
                className="py-4 px-4 text-center"
                style={{
                  backgroundColor: `${PURPLE}25`,
                  borderLeft: `1px solid ${PURPLE}50`,
                  borderRight: `1px solid ${PURPLE}50`,
                }}
              >
                <span
                  className="text-xs font-extrabold uppercase tracking-widest"
                  style={{ color: GOLD }}
                >
                  HalalMe
                </span>
              </th>
              <th className="py-4 px-4 text-center">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: `${CREAM}40` }}
                >
                  Uber Eats
                </span>
              </th>
              <th className="py-4 px-4 text-center">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: `${CREAM}40` }}
                >
                  Deliveroo
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${CREAM}10` }}>
                <td
                  className="py-4 px-4 text-sm font-semibold"
                  style={{ color: `${CREAM}70` }}
                >
                  {row.feature}
                </td>
                <td
                  className="py-4 px-4 text-center"
                  style={{
                    backgroundColor: `${PURPLE}15`,
                    borderLeft: `1px solid ${PURPLE}30`,
                    borderRight: `1px solid ${PURPLE}30`,
                    color: CREAM,
                  }}
                >
                  {renderCell(row.halalme, true)}
                </td>
                <td
                  className="py-4 px-4 text-center"
                  style={{ color: `${CREAM}60` }}
                >
                  {renderCell(row.uberEats)}
                </td>
                <td
                  className="py-4 px-4 text-center"
                  style={{ color: `${CREAM}60` }}
                >
                  {renderCell(row.deliveroo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-xs" style={{ color: `${CREAM}30` }}>
          * Commission % to be confirmed before publishing.
        </p>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────── Testimonials ─────────────────────────── */
function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const quotes = [
    {
      text: "I was sceptical at first, but the team came to my shop, did everything on the spot, and I was taking orders within two days. The commission is fair and my customers love it.",
      name: "Ahmed K.",
      restaurant: "Spice House",
      city: "Leicester",
    },
    {
      text: "We were paying 30% on Uber Eats. HalalMe gives us a better deal and our customers are actually looking for halal food specifically. It's a no-brainer.",
      name: "Yusuf M.",
      restaurant: "Grill Masters",
      city: "Burton",
    },
  ];

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
            From Our Partners
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
          style={{ color: CREAM }}
        >
          900+ Restaurants.
          <br />
          <span style={{ color: `${CREAM}75` }}>Here's Why They Joined.</span>
        </motion.h2>
      </div>

      <div
        className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-2"
        style={{
          gap: "1px",
          backgroundColor: `${PURPLE}50`,
          borderLeft: `2px solid ${PURPLE}80`,
          borderRight: `2px solid ${PURPLE}80`,
        }}
      >
        {quotes.map((q, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.12, duration: 0.5 }}
            className="p-8 md:p-12 flex flex-col justify-between"
            style={{ backgroundColor: BG2, minHeight: "260px" }}
          >
            <div className="mb-8">
              <span
                className="text-6xl font-serif leading-none"
                style={{ color: PURPLE }}
              >
                "
              </span>
              <p
                className="text-lg md:text-xl italic leading-relaxed mt-2"
                style={{ color: `${CREAM}90` }}
              >
                {q.text}
              </p>
            </div>
            <div className="pt-5" style={{ borderTop: `1px solid ${CREAM}12` }}>
              <p
                className="font-extrabold uppercase tracking-tight text-sm"
                style={{ color: CREAM }}
              >
                {q.name}
              </p>
              <p
                className="text-xs uppercase tracking-widest mt-1"
                style={{ color: `${CREAM}50` }}
              >
                {q.restaurant}, {q.city}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────── Final CTA ─────────────────────────── */
function FinalCTASection() {
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
            Ready to Grow
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-white mb-6 max-w-4xl"
        >
          Ready to Grow
          <br />
          Your Restaurant?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-white/60 text-base md:text-lg max-w-xl mb-10 leading-relaxed"
        >
          Join 900+ restaurants across the UK. No setup fees. No long contracts.
          Go live in 48 hours.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <a href={TALLY_URL} target="_blank" rel="noopener noreferrer">
            <button
              className="flex items-center gap-3 px-8 py-4 font-extrabold uppercase tracking-tighter text-base hover:opacity-90 transition-opacity"
              style={{ backgroundColor: CREAM, color: DEEP }}
            >
              Become a Partner
              <ArrowRight className="w-5 h-5" />
            </button>
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-14 text-sm"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          <span className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> [phone number]
          </span>
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4" /> partners@halalme.co.uk
          </span>
        </motion.div>

        <div className="flex flex-wrap gap-6 md:gap-10">
          {[
            { icon: ShieldCheck, text: "Halal Certified" },
            { icon: BookOpen, text: "Scholar Verified" },
            { icon: Store, text: "900+ Restaurants" },
            { icon: Wallet, text: "Payout Every 3 Days" },
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

      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-white/5 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
      >
        Partners
      </div>
    </section>
  );
}

/* ─────────────────────────── FAQ ─────────────────────────── */
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    {
      q: "What does it cost to join?",
      a: "There are no setup fees or joining costs. We operate on a commission-per-order model. You only pay when you earn.",
    },
    {
      q: "What commission do you charge?",
      a: "Our rates are competitive and designed to be fairer than major platforms. We believe restaurants should keep more of what they earn.",
    },
    {
      q: "How long does it take to go live?",
      a: "Most restaurants are live within 48 hours. Our team handles menu upload, listing setup, and halal verification. You just approve and start.",
    },
    {
      q: "Do I need a halal certificate?",
      a: "Yes. Every restaurant on HalalMe must provide valid halal certification. This is how we maintain trust with our community. We'll guide you through the verification process.",
    },
    {
      q: "How do I receive orders?",
      a: "Orders arrive via a tablet or through integration with your existing POS system. You'll hear a notification, confirm the order, and our delivery riders handle the rest.",
    },
    {
      q: "When do I get paid?",
      a: "Payouts are processed every 3 days directly to your bank account via Stripe. No waiting until end of month.",
    },
    {
      q: "Can I also stay on Uber Eats / Deliveroo?",
      a: "Absolutely. Many of our partners use HalalMe alongside other platforms. We're not asking you to leave - we're giving you a better option for your halal customers.",
    },
    {
      q: "What areas do you operate in?",
      a: "We're currently launching in the Midlands (Leicester, Burton, Derby, Birmingham) and Manchester, with nationwide expansion planned. If you're outside these areas, sign up anyway - we'll notify you when we launch near you.",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-24 md:py-32"
      style={{ backgroundColor: BG, borderTop: `1px solid ${PURPLE}50` }}
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
            FAQ
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-14 md:mb-20"
          style={{ color: CREAM }}
        >
          Your Questions.
          <br />
          <span style={{ color: `${CREAM}75` }}>Answered.</span>
        </motion.h2>

        <div
          className="max-w-3xl"
          style={{ borderTop: `1px solid ${CREAM}12` }}
        >
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              style={{ borderBottom: `1px solid ${CREAM}12` }}
            >
              <button
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span
                  className="text-base md:text-lg font-bold uppercase tracking-tight"
                  style={{ color: CREAM }}
                >
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                    open === i ? "rotate-180" : ""
                  }`}
                  style={{ color: PURPLE }}
                />
              </button>
              {open === i && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  className="pb-5 pr-8 text-base leading-relaxed"
                  style={{ color: `${CREAM}70` }}
                >
                  {faq.a}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
