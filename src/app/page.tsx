"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  useInView,
  AnimatePresence,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import HorizontalServices from "@/components/navigation/HorizontalServices";
import LoadingScreen from "@/components/loading/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import {
  ShieldCheck,
  BookOpen,
  UserCircle,
  LayoutGrid,
  Zap,
  ArrowRight,
  ChevronDown,
  Fingerprint,
} from "lucide-react";

declare global {
  interface Window {
    __halalmeHomeVisited?: boolean;
  }
}

const CYCLE_WORDS = ["Perfected.", "Simplified.", "Connected.", "Elevated."];

export default function Home() {
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !window.__halalmeHomeVisited;
  });

  const handleLoadingComplete = () => {
    window.__halalmeHomeVisited = true;
    setIsLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onLoadingComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      {/* Primary bg is deep forest - visible green, not near-black */}
      <div
        className={`min-h-screen bg-[#102C26] font-sans antialiased selection:bg-[#F7E7CE] selection:text-[#102C26] ${
          isLoading ? "overflow-hidden h-screen" : ""
        }`}
      >
        <HeroSection />

        <div className="relative z-10 mt-[100vh]">
          {/* Champagne ticker - forest + champagne, no amber dominance */}
          <ServiceTicker />

          {/* Stats on dark contrast bg */}
          <StatsStrip />

          {/* Features */}
          <FeaturesSection />

          {/* Seven Services - header (outside pinned section so overflow-hidden doesn't break GSAP pin) */}
          <div className="bg-[#102C26] pt-24 md:pt-32 pb-12 md:pb-16">
            <div className="max-w-[95vw] mx-auto px-6 md:px-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-[#F59E0B]" />
                <span className="text-[#F59E0B] text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
                  Our Platform
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]">
                Five Services.
                <br />
                <span className="text-[#F7E7CE]/50">One Unified Account.</span>
              </h2>
            </div>
          </div>

          {/* Horizontal scroll - pinned by GSAP, must not be inside overflow-hidden */}
          <HorizontalServices />

          <HowItWorksSection />
          <TestimonialsSection />
          <FinalCTA />
        </div>
      </div>
    </>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────── */

function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  // Content recedes as the page scrolls over the fixed hero - motion values, no re-renders
  const { scrollY } = useScroll();
  const contentOpacity = useTransform(scrollY, [0, 560], [1, 0]);
  const contentY = useTransform(scrollY, [0, 560], [0, -70]);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % CYCLE_WORDS.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const word = CYCLE_WORDS[wordIndex];

  return (
    <section className="fixed top-0 left-0 w-full h-screen z-0 flex items-center justify-center overflow-hidden bg-[#102C26]">
      <div className="absolute inset-0 z-0">
        {/* Slow Ken Burns drift on the backdrop */}
        <motion.div
          className="absolute inset-0"
          animate={reduceMotion ? { scale: 1.05 } : { scale: [1.05, 1.14] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 26, repeat: Infinity, repeatType: "reverse", ease: "linear" }
          }
        >
          <Image
            src="/images/hero/halal5.jpg"
            alt="Halal Lifestyle"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, #102C2640 0%, #102C26B0 55%, #102C26F0 100%)`,
          }}
        />
      </div>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex flex-col items-center text-center px-6 pt-20 w-full"
      >
        {/* Eyebrow - lines draw outward from the label */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-8 h-px bg-[#F59E0B] origin-right"
          />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-[#F59E0B] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
          >
            The All-in-One Halal Platform
          </motion.span>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-8 h-px bg-[#F59E0B] origin-left"
          />
        </div>

        {/* Heading */}
        <h1 className="font-extrabold uppercase tracking-tighter leading-[0.88]">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.7 }}
            className="block text-[clamp(2.5rem,8vw,8rem)] text-[#F7E7CE]"
          >
            Halal Living
          </motion.span>
          <span className="block text-[clamp(2.5rem,8vw,8rem)] min-h-[1em]">
            <AnimatePresence mode="wait">
              <motion.span
                key={wordIndex}
                className="relative inline-block text-[#F7E7CE]/70 pb-1"
                initial={reduceMotion ? { opacity: 0 } : "hidden"}
                animate={reduceMotion ? { opacity: 1 } : "show"}
                exit={reduceMotion ? { opacity: 0 } : "exit"}
                variants={{
                  show: { transition: { staggerChildren: 0.038 } },
                  exit: { transition: { staggerChildren: 0.016, staggerDirection: -1 } },
                }}
              >
                {word.split("").map((ch, i) => (
                  <motion.span
                    key={`${wordIndex}-${i}`}
                    className="inline-block"
                    variants={{
                      hidden: { opacity: 0, y: 30, filter: "blur(7px)" },
                      show: {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                      },
                      exit: {
                        opacity: 0,
                        y: -24,
                        filter: "blur(5px)",
                        transition: { duration: 0.2, ease: "easeIn" },
                      },
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
                {/* Amber baseline redraws under each word */}
                <motion.span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[3px] bg-[#F59E0B]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  exit={{ width: "0%", transition: { duration: 0.18 } }}
                  transition={{ duration: 0.55, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.span>
            </AnimatePresence>
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.62 }}
          className="mt-7 text-base md:text-lg text-[#F7E7CE] max-w-sm leading-relaxed"
        >
          Live daily life the halal way, without switching apps.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.74 }}
          className="mt-8 flex flex-wrap gap-4 justify-center"
        >
          {!user && (
            <Link href="/select-role">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 bg-[#F7E7CE] text-[#102C26] font-extrabold uppercase tracking-tighter text-sm sm:text-base"
              >
                Create Free Account
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </Link>
          )}
          <a href="#how-it-works">
            <motion.button
              whileHover={{
                scale: 1.03,
                backgroundColor: "rgba(247,231,206,0.08)",
              }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border-2 border-[#F7E7CE]/25 text-[#F7E7CE] font-extrabold uppercase tracking-tighter text-sm sm:text-base transition-all"
            >
              See How It Works
              <ChevronDown className="w-4 h-4 opacity-60" />
            </motion.button>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Service Ticker - champagne bg, forest text ───────────────────── */

function ServiceTicker() {
  const services = [
    { label: "HalalMe Delivery", href: "/delivery" },
    { label: "HalalMe Kitchen", href: "/kitchen" },
    { label: "HalalMe Social", href: "/hub" },
    { label: "HalalMe Charity", href: "/charity" },
    { label: "HalalMe Rewards", href: "/rewards" },
  ];

  return (
    <div className="overflow-hidden bg-[#F7E7CE] py-4">
      <style>{`
        @keyframes hm-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hm-ticker-track { animation: none !important; }
        }
      `}</style>
      <div
        className="hm-ticker-track flex whitespace-nowrap"
        style={{
          animation: "hm-ticker 28s linear infinite",
          width: "max-content",
        }}
      >
        {[...services, ...services].map((s, i) => (
          <Link
            key={i}
            href={s.href}
            className="inline-flex items-center gap-8 md:gap-12 px-8 md:px-12 text-[#102C26] font-extrabold uppercase tracking-tighter text-base md:text-xl hover:text-[#102C26]/60 transition-colors"
          >
            {s.label}
            <span className="text-[#102C26]/25 text-sm" aria-hidden="true">
              ✦
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Stats Strip - dark contrast, champagne numbers ──────────────── */

function StatsStrip() {
  const stats = [
    { value: "900+", label: "Restaurants Signed" },
    { value: "5", label: "UK Cities" },
    { value: "4", label: "Services" },
    { value: "100%", label: "Halal Verified" },
  ];

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#F7E7CE]/8"
      style={{
        borderTop: "1px solid #F59E0B40",
        borderBottom: "1px solid #F59E0B40",
      }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-[#0A1C19] py-10 md:py-14 px-8 md:px-12 text-center md:text-left"
        >
          <div className="text-[3rem] md:text-[4.5rem] lg:text-[5.5rem] font-extrabold tracking-tighter leading-none text-[#F7E7CE]">
            {s.value}
          </div>
          <div className="text-[#F7E7CE]/30 text-[10px] md:text-xs uppercase tracking-[0.25em] mt-2 font-medium">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Features - champagne hover inversion ─────────────────────────── */

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    {
      num: "01",
      title: "One Identity",
      desc: "Single sign-on for all 5 services. Your profile, preferences, and rewards sync seamlessly across the entire HalalMe ecosystem.",
      Icon: Fingerprint,
    },
    {
      num: "02",
      title: "Verified Halal",
      desc: "Every vendor undergoes strict certification. Our audit process ensures authentic Halal standards you can trust.",
      Icon: ShieldCheck,
    },
    {
      num: "03",
      title: "Smart Recipes",
      desc: "AI-powered meal planning tailored to your dietary needs. Discover new Halal recipes personalized just for you.",
      Icon: BookOpen,
    },
  ];

  return (
    <section
      ref={ref}
      className="bg-[#102C26] py-24 md:py-32"
      style={{
        borderTop: "1px solid #F59E0B50",
        borderBottom: "1px solid #F59E0B50",
      }}
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
            What is HalalMe
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Redefining the
          <br />
          <span className="text-[#F7E7CE]/50">Halal Experience</span>
        </motion.h2>
      </div>

      {/* gap-px hairline grid - hover inverts to champagne */}
      <div
        className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-3"
        style={{
          gap: "1px",
          backgroundColor: "#F7E7CE",
          borderLeft: "2px solid #F7E7CE",
          borderRight: "2px solid #F7E7CE",
        }}
      >
        {features.map((f, i) => {
          const Icon = f.Icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="group relative bg-[#102C26] border border-[#F7E7CE]/8 p-8 md:p-10 overflow-hidden hover:bg-[#F7E7CE] transition-colors duration-300 cursor-default"
            >
              <span
                aria-hidden="true"
                className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold text-[#F7E7CE]/8 group-hover:text-[#102C26]/20 leading-none select-none pointer-events-none transition-colors duration-300"
              >
                {f.num}
              </span>

              <div className="relative z-10 flex flex-col min-h-[200px] md:min-h-[240px]">
                <Icon className="w-7 h-7 text-[#F7E7CE]/60 group-hover:text-[#102C26] mb-8 flex-shrink-0 transition-colors duration-300" />
                <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-4 transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-[#F7E7CE]/50 group-hover:text-[#102C26]/65 leading-relaxed text-sm md:text-base transition-colors duration-300">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── How It Works - champagne hover inversion ─────────────────────── */

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      num: "01",
      title: "Unified Profile",
      desc: "Create one account that follows you everywhere. Your preferences, history, and rewards all in one place.",
      Icon: UserCircle,
    },
    {
      num: "02",
      title: "Select Service",
      desc: "Choose from Delivery, Kitchen, Social, and Rewards. All connected, all Halal certified.",
      Icon: LayoutGrid,
    },
    {
      num: "03",
      title: "Live Seamlessly",
      desc: "Earn rewards, track orders, and explore Halal options across the globe. One ecosystem, endless possibilities.",
      Icon: Zap,
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="bg-[#0A1C19] py-24 md:py-32"
      style={{
        borderTop: "1px solid #F59E0B50",
        borderBottom: "1px solid #F59E0B50",
      }}
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
            How It Works
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Simple.
          <br />
          <span className="text-[#F7E7CE]/50">Unified.</span>
          <br />
          Elegant.
        </motion.h2>
      </div>

      <div
        className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-3"
        style={{
          gap: "1px",
          backgroundColor: "#F7E7CE",
          borderLeft: "2px solid #F7E7CE",
          borderRight: "2px solid #F7E7CE",
        }}
      >
        {steps.map((step, i) => {
          const Icon = step.Icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
              className="group relative bg-[#0A1C19] border border-[#F7E7CE]/8 p-8 md:p-10 overflow-hidden hover:bg-[#F7E7CE] transition-colors duration-300 cursor-default"
            >
              <div
                aria-hidden="true"
                className="text-[6rem] md:text-[8rem] lg:text-[9rem] font-extrabold leading-none tracking-tighter text-[#F7E7CE]/10 group-hover:text-[#102C26]/20 transition-colors duration-300 select-none mb-2"
              >
                {step.num}
              </div>
              <Icon className="w-6 h-6 text-[#F7E7CE]/50 group-hover:text-[#102C26] mb-4 transition-colors duration-300" />
              <h3 className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter text-[#F7E7CE] group-hover:text-[#102C26] mb-3 transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-[#F7E7CE]/50 group-hover:text-[#102C26]/65 leading-relaxed text-sm md:text-base transition-colors duration-300">
                {step.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Testimonials ─────────────────────────────────────────────────── */

function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const testimonials = [
    {
      quote:
        "The AI recipe feature is honestly incredible. I told it what I had in the fridge and it gave me a full halal meal plan in seconds. I've discovered dishes I never would've tried otherwise. Cooking halal at home has never been this easy.",
      name: "Jani Fernandez",
      feature: "Kitchen Recipes",
    },
    {
      quote:
        "The community on here is unlike anything else. I've connected with people who actually understand the halal lifestyle - sharing recipes, restaurant finds, everything. It feels like a space that was built for us.",
      name: "Maryam",
      feature: "Social Community",
    },
    {
      quote:
        "The rewards are really good - you can donate to so many different charities. Love that every time I order I'm also giving back. Never seen anything like this on any other food app.",
      name: "Arbab",
      feature: "Charity Donations",
    },
  ];

  return (
    <section
      ref={ref}
      className="bg-[#0A1C19] py-24 md:py-32"
      style={{
        borderTop: "1px solid #F59E0B50",
        borderBottom: "1px solid #F59E0B50",
      }}
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-8 h-px bg-[#F59E0B]" />
          <span className="text-[#F59E0B] text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
            What People Are Saying
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#F7E7CE]"
        >
          Real People.
          <br />
          <span className="text-[#F7E7CE]/50">Real Stories.</span>
        </motion.h2>
      </div>

      <div
        className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-3"
        style={{
          gap: "1px",
          backgroundColor: "#F7E7CE",
          borderLeft: "2px solid #F7E7CE",
          borderRight: "2px solid #F7E7CE",
        }}
      >
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="bg-[#0A1C19] border border-[#F7E7CE]/8 p-8 md:p-10 flex flex-col justify-between gap-6"
          >
            <p className="text-[#F7E7CE]/70 text-base md:text-lg leading-relaxed italic">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-[#F59E0B]" />
              <div>
                <span className="block text-[#F7E7CE]/80 text-xs uppercase tracking-[0.2em] font-bold">
                  {t.name}
                </span>
                <span className="text-[#F59E0B]/60 text-[10px] uppercase tracking-widest">
                  {t.feature}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Final CTA - champagne bg, forest text ────────────────────────── */

function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const { user } = useAuth();

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#F7E7CE] py-28 md:py-36"
      style={{ borderTop: "1px solid #F59E0B80" }}
    >
      <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-8 h-px bg-[#102C26]/30" />
          <span className="text-[#102C26]/45 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
            Join HalalMe Today
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-[clamp(3rem,7vw,7rem)] font-extrabold uppercase tracking-tighter leading-[0.88] text-[#102C26] mb-10 max-w-5xl"
        >
          Ready to start your
          <br />
          HalalMe journey?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="text-[#102C26]/55 text-base md:text-lg max-w-xl mb-12 leading-relaxed"
        >
          Join a global community that values quality, faith, and seamless
          technology. Your complete Halal lifestyle starts here.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          {!user && (
            <Link href="/select-role">
              <button className="flex items-center gap-3 px-8 py-4 bg-[#102C26] text-[#F7E7CE] font-extrabold uppercase tracking-tighter text-base hover:bg-[#0A1C19] transition-colors">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          )}
          <Link href="/select-role">
            <button className="flex items-center gap-3 px-8 py-4 border-2 border-[#102C26] text-[#102C26] font-extrabold uppercase tracking-tighter text-base hover:bg-[#102C26] hover:text-[#F7E7CE] transition-colors">
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-6 md:gap-10"
        >
          {[{ Icon: ShieldCheck, text: "100% Halal Certified" }].map(
            (item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[#102C26]/50 text-xs md:text-sm font-semibold uppercase tracking-wide"
              >
                <item.Icon className="w-4 h-4" />
                {item.text}
              </div>
            ),
          )}
        </motion.div>
      </div>

      {/* Decorative oversized background word */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 text-[8rem] md:text-[14rem] font-extrabold uppercase tracking-tighter leading-none text-[#102C26]/8 select-none pointer-events-none translate-x-6 translate-y-6"
      >
        Halal
      </div>
    </section>
  );
}
