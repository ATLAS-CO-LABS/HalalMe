"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Users,
  Heart,
  MessageCircle,
  ChefHat,
  TrendingUp,
  Globe,
  ArrowRight,
  Sparkles,
  Share2,
} from "lucide-react";

/* ─── Hub design tokens - dark + amber ───────────────── */
const BG = "#0B0D0F"; // near-black with neutral warmth
const BG2 = "#111418"; // card sections
const BG3 = "#0D1012"; // deepest (hero overlay)
const AMBER = "#F59E0B";
const CREAM = "#F7E7CE";
/* ─── Mock post data for the landing preview stack ───── */
const MOCK_POSTS = [
  {
    id: 1,
    user: "Aisha Rahman",
    handle: "@aisha_cooks",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=faces&q=80",
    verified: true,
    content:
      "Just made the most incredible lamb biryani from scratch! The secret is slow-cooking the meat with whole spices first 🍚✨",
    postImage:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=300&fit=crop&q=80",
    likes: 247,
    commentCount: 38,
    time: "2h ago",
    tag: "Recipe",
    replies: [
      {
        user: "Maryam K.",
        text: "This looks absolutely amazing! 😍",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=faces&q=80",
      },
      {
        user: "Ibrahim S.",
        text: "Please share the full recipe! 🙏",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=faces&q=80",
      },
    ],
  },
  {
    id: 2,
    user: "Omar Abdullah",
    handle: "@omar_eats",
    avatar:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=80&h=80&fit=crop&crop=faces&q=80",
    verified: false,
    content:
      "Found the most incredible halal spot in London - their lamb shawarma wrap is absolutely unreal. You HAVE to try it 🔥",
    postImage:
      "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&h=300&fit=crop&q=80",
    likes: 183,
    commentCount: 52,
    time: "4h ago",
    tag: null,
    replies: [
      {
        user: "Zainab M.",
        text: "Which restaurant is this? 👀",
        avatar:
          "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=faces&q=80",
      },
      {
        user: "Yusuf H.",
        text: "Adding this to my list immediately!",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=faces&q=80",
      },
    ],
  },
  {
    id: 3,
    user: "Fatima Al-Sayed",
    handle: "@fatima_kitchen",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=faces&q=80",
    verified: true,
    content:
      "Sharing my grandmother's secret chicken curry recipe with you all. Halal, hearty and incredibly flavourful 🌿",
    postImage:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=300&fit=crop&q=80",
    likes: 412,
    commentCount: 67,
    time: "6h ago",
    tag: "Recipe",
    replies: [
      {
        user: "Aisha R.",
        text: "Grandma recipes are always the best ❤️",
        avatar:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=faces&q=80",
      },
      {
        user: "Omar A.",
        text: "Made this last week - incredible!",
        avatar:
          "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=40&h=40&fit=crop&crop=faces&q=80",
      },
    ],
  },
  {
    id: 4,
    user: "Yusuf Hassan",
    handle: "@yusuf_foodies",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces&q=80",
    verified: false,
    content:
      "Weekly halal meal prep done! 6 days of high-protein meals ready to go. Drop a 🙋 if you want the full breakdown!",
    postImage:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=300&fit=crop&q=80",
    likes: 329,
    commentCount: 44,
    time: "1d ago",
    tag: null,
    replies: [
      {
        user: "Fatima S.",
        text: "🙋 Yes please! Need this in my life",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=faces&q=80",
      },
      {
        user: "Maryam K.",
        text: "Your meal preps are always so clean 👌",
        avatar:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=40&h=40&fit=crop&crop=faces&q=80",
      },
    ],
  },
];

function getStackStyle(pos: number) {
  switch (pos) {
    case 0:
      return { zIndex: 40, scale: 1, rotate: 0, y: 0, x: 0, opacity: 1 };
    case 1:
      return {
        zIndex: 30,
        scale: 0.96,
        rotate: -2.5,
        y: 18,
        x: -14,
        opacity: 0.8,
      };
    case 2:
      return {
        zIndex: 20,
        scale: 0.92,
        rotate: 3.5,
        y: 32,
        x: 16,
        opacity: 0.55,
      };
    default:
      return { zIndex: 10, scale: 0.88, rotate: 0, y: 42, x: 0, opacity: 0 };
  }
}

export default function HubLandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [activeCard, setActiveCard] = useState(0);

  const statsRef = useRef(null);
  const cardsRef = useRef(null);
  const featuresRef = useRef(null);
  const feedRef = useRef(null);
  const ctaRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true });
  const cardsInView = useInView(cardsRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const feedInView = useInView(feedRef, { once: true, margin: "-100px" });
  const ctaInView = useInView(ctaRef, { once: true });

  // Auto-cycle the card stack
  useEffect(() => {
    const t = setInterval(
      () => setActiveCard((p) => (p + 1) % MOCK_POSTS.length),
      3500,
    );
    return () => clearInterval(t);
  }, []);

  const whatYouCanDo = [
    {
      Icon: Share2,
      title: "Share Posts",
      desc: "Upload food pictures, share recipes, and tell your cooking stories with the community.",
      num: "01",
    },
    {
      Icon: Heart,
      title: "Engage & Connect",
      desc: "Like, comment, and interact with posts from fellow food lovers around the world.",
      num: "02",
    },
    {
      Icon: MessageCircle,
      title: "Build Community",
      desc: "Follow your favourite creators, earn followers, and grow your own food community.",
      num: "03",
    },
  ];

  const features = [
    {
      Icon: Users,
      num: "01",
      title: "Join the Community",
      desc: "Connect with halal food lovers from around the world.",
    },
    {
      Icon: ChefHat,
      num: "02",
      title: "Share Recipes",
      desc: "Showcase your culinary creations to thousands of food enthusiasts.",
    },
    {
      Icon: TrendingUp,
      num: "03",
      title: "Discover Trending",
      desc: "Find the most popular halal recipes and posts every single day.",
    },
    {
      Icon: Globe,
      num: "04",
      title: "Global Reach",
      desc: "A worldwide platform for the halal food community to connect.",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section
        className="relative h-screen min-h-[620px] flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: BG3 }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/services/halal03.png"
            alt="Halal food community"
            fill
            className="object-cover object-center opacity-100"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0" style={{ backgroundColor: `${BG3}CC` }} />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, transparent 0%, ${BG3}50 55%, ${BG3}90 100%)`,
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
              <div className="w-8 h-px" style={{ backgroundColor: AMBER }} />
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: AMBER }}
              >
                Your Halal Community
              </span>
              <div className="w-8 h-px" style={{ backgroundColor: AMBER }} />
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
                      backgroundColor: AMBER,
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
                className="block text-[clamp(2.25rem,8vw,8rem)] text-white"
                style={{ color: AMBER }}
              >
                Social
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                className="block text-[clamp(2rem,4.5vw,4.5rem)]"
                style={{ color: CREAM }}
              >
                Share. Inspire.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 md:mt-7 text-base md:text-lg max-w-md leading-relaxed text-white/50 font-normal mx-auto"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Join thousands of food lovers sharing recipes, posting food
              pictures, and building a vibrant halal food community.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              {!user && (
                <motion.button
                  onClick={() => router.push("/select-role")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 font-extrabold uppercase tracking-tighter text-sm sm:text-base"
                  style={{ backgroundColor: AMBER, color: BG }}
                >
                  Join HalalMe Social
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              )}

              <motion.button
                onClick={() => router.push("/hub/feed")}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(255,255,255,0.06)",
                }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 border-2 font-extrabold uppercase tracking-tighter text-sm sm:text-base text-white transition-all"
                style={{ borderColor: "rgba(255,255,255,0.18)" }}
              >
                Explore Feed
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex flex-wrap gap-6 justify-center"
            >
              {[
                { Icon: Users, text: "10K+ Members" },
                { Icon: Globe, text: "Global Community" },
                { Icon: Sparkles, text: "Daily Content" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/35"
                >
                  <item.Icon className="w-4 h-4" style={{ color: AMBER }} />
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
          backgroundColor: "rgba(255,255,255,0.05)",
          borderTop: `1px solid ${AMBER}40`,
          borderBottom: `1px solid ${AMBER}40`,
        }}
      >
        {[
          { value: "10K+", label: "Community Members" },
          { value: "5K+", label: "Recipes Shared" },
          { value: "500+", label: "Daily Posts" },
          { value: "50+", label: "Countries" },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="py-10 md:py-14 px-8 md:px-12 text-center md:text-left"
            style={{ backgroundColor: BG2 }}
          >
            <div className="text-[3rem] md:text-[4.5rem] font-extrabold tracking-tighter leading-none text-white">
              {s.value}
            </div>
            <div
              className="text-[10px] md:text-xs uppercase tracking-[0.25em] mt-2 font-medium"
              style={{ color: `${AMBER}80` }}
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── What You Can Do ──────────────────────────────── */}
      <section
        ref={cardsRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={cardsInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: AMBER }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: AMBER }}
            >
              What You Can Do
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-white"
          >
            Connect
            <br />
            <span className="text-white/40">Build Together.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-3"
          style={{
            gap: "1px",
            backgroundColor: AMBER,
            borderLeft: `2px solid ${AMBER}`,
            borderRight: `2px solid ${AMBER}`,
          }}
        >
          {whatYouCanDo.map((item, i) => {
            const Icon = item.Icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={cardsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.5 }}
              >
                <div
                  className="group relative p-8 md:p-10 overflow-hidden cursor-default min-h-[200px] md:min-h-[300px] flex flex-col transition-colors duration-300"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = AMBER)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = BG2)
                  }
                  style={{
                    backgroundColor: BG2,
                    border: `1px solid ${AMBER}30`,
                  }}
                >
                  {/* Ghost number */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none text-white/[0.03]"
                  >
                    {item.num}
                  </span>
                  <div className="relative z-10 flex flex-col flex-1">
                    <Icon
                      className="w-7 h-7 mb-8 shrink-0 transition-colors duration-300 group-hover:text-black!"
                      style={{ color: AMBER }}
                    />
                    <h3
                      className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter mb-4 text-white transition-colors duration-300 group-hover:text-[#0B0D0F]"
                      style={{ fontFamily: "var(--font-headline)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="leading-relaxed text-sm md:text-base text-white/50 transition-colors duration-300 group-hover:text-[#0B0D0F]/70 flex-1"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {item.desc}
                    </p>
                    <div
                      className="mt-8 flex items-center gap-2 text-sm font-extrabold uppercase tracking-tighter transition-colors duration-300 group-hover:text-[#0B0D0F]"
                      style={{ color: AMBER }}
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Community Preview Stack ──────────────────────── */}
      <section
        ref={feedRef}
        className="relative overflow-hidden py-24 md:py-32"
        style={{
          backgroundColor: BG2,
          borderTop: `1px solid ${AMBER}40`,
          borderBottom: `1px solid ${AMBER}40`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)`,
          }}
        />
        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
            {/* Left - text */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={feedInView ? { opacity: 1, x: 0 } : {}}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-8 h-px" style={{ backgroundColor: AMBER }} />
                <span
                  className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                  style={{ color: AMBER }}
                >
                  From the Community
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={feedInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tighter leading-[0.88] text-white mb-8"
              >
                Real Posts.
                <br />
                <span className="text-white/40">Real People.</span>
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={feedInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.2 }}
                className="space-y-4 mb-10"
              >
                {[
                  {
                    icon: ChefHat,
                    text: "Share recipes, food pics & cooking stories",
                  },
                  {
                    icon: Heart,
                    text: "Like and comment on posts from the community",
                  },
                  {
                    icon: Users,
                    text: "Follow creators and build your food network",
                  },
                  {
                    icon: TrendingUp,
                    text: "Discover trending halal food content daily",
                  },
                ].map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={feedInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.25 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${AMBER}18` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: AMBER }} />
                    </div>
                    <span
                      className="text-sm text-white/60 font-normal"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.button
                onClick={() => router.push("/hub/feed")}
                initial={{ opacity: 0, y: 12 }}
                animate={feedInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.55 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-8 py-4 font-extrabold uppercase tracking-tighter text-base"
                style={{ backgroundColor: AMBER, color: BG }}
              >
                Explore the Feed
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Right - animated card stack */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={feedInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative h-95 md:h-130 pb-10 select-none"
            >
              {MOCK_POSTS.map((post, i) => {
                const pos =
                  (i - activeCard + MOCK_POSTS.length) % MOCK_POSTS.length;
                const s = getStackStyle(pos);
                return (
                  <motion.div
                    key={post.id}
                    animate={{
                      scale: s.scale,
                      rotate: s.rotate,
                      y: s.y,
                      x: s.x,
                      opacity: s.opacity,
                      zIndex: s.zIndex,
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 26 }}
                    className="absolute inset-0 rounded-2xl border border-gray-800 overflow-hidden cursor-pointer"
                    style={{ backgroundColor: BG3 }}
                    onClick={() => setActiveCard(i)}
                  >
                    {/* Post header */}
                    <div className="p-4 flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-700">
                        <Image
                          src={post.avatar}
                          alt={post.user}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-semibold text-white text-sm truncate"
                            style={{ fontFamily: "var(--font-headline)" }}
                          >
                            {post.user}
                          </span>
                          {post.verified && (
                            <svg
                              className="w-3.5 h-3.5 shrink-0"
                              viewBox="0 0 20 20"
                              fill={AMBER}
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-normal">
                          {post.handle} · {post.time}
                        </p>
                      </div>
                      {post.tag && (
                        <span
                          className="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${AMBER}20`,
                            color: AMBER,
                          }}
                        >
                          {post.tag}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-3">
                      <p
                        className="text-white/80 text-sm leading-relaxed font-normal line-clamp-2"
                        style={{ fontFamily: "var(--font-body)" }}
                      >
                        {post.content}
                      </p>
                    </div>

                    {/* Post image */}
                    <div className="relative mx-4 mb-3 h-36 rounded-xl overflow-hidden">
                      <Image
                        src={post.postImage}
                        alt="Post"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Comments */}
                    <div className="px-4 pb-3 space-y-2">
                      {post.replies.map((reply, ri) => (
                        <div key={ri} className="flex items-start gap-2">
                          <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5">
                            <Image
                              src={reply.avatar}
                              alt={reply.user}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0 bg-gray-800/60 rounded-xl px-3 py-1.5">
                            <span className="text-[11px] font-semibold text-white/70 mr-1.5">
                              {reply.user}
                            </span>
                            <span
                              className="text-[11px] text-white/50 font-normal"
                              style={{ fontFamily: "var(--font-body)" }}
                            >
                              {reply.text}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 border-t border-gray-800 flex items-center gap-5">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs font-semibold">
                          {post.likes}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs font-semibold">
                          {post.commentCount}
                        </span>
                      </div>
                      <div className="ml-auto text-gray-600">
                        <Share2 className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Dot indicators */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {MOCK_POSTS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveCard(i)}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        i === activeCard ? AMBER : "rgba(255,255,255,0.2)",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Why Hub ──────────────────────────────────────── */}
      <section
        ref={featuresRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG2 }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={featuresInView ? { opacity: 1, x: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px" style={{ backgroundColor: AMBER }} />
            <span
              className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
              style={{ color: AMBER }}
            >
              Why HalalMe Social
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-white"
          >
            Your Food.
            <br />
            <span className="text-white/40">Your Community.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{
            gap: "1px",
            backgroundColor: AMBER,
            borderLeft: `2px solid ${AMBER}`,
            borderRight: `2px solid ${AMBER}`,
          }}
        >
          {features.map((f, i) => {
            const Icon = f.Icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group relative p-8 overflow-hidden transition-colors duration-300 cursor-default"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#F59E0B")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BG3)
                }
                style={{
                  backgroundColor: BG3,
                  border: `1px solid ${AMBER}30`,
                  minHeight: "220px",
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[7rem] font-extrabold leading-none select-none pointer-events-none text-white/[0.03]"
                >
                  {f.num}
                </span>
                <div
                  className="relative z-10 flex flex-col"
                  style={{ minHeight: "180px" }}
                >
                  <Icon
                    className="w-6 h-6 mb-6 transition-colors duration-300 group-hover:text-black!"
                    style={{ color: AMBER }}
                  />
                  <h3
                    className="text-lg md:text-xl font-extrabold uppercase tracking-tighter mb-3 text-white transition-colors duration-300 group-hover:text-[#0B0D0F]"
                    style={{ fontFamily: "var(--font-headline)" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed text-white/50 transition-colors duration-300 group-hover:text-[#0B0D0F]/65"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────── */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden py-28 md:py-36"
        style={{ backgroundColor: AMBER }}
      >
        <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-8 h-px bg-black/25" />
            <span className="text-black/40 text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">
              Ready to Join
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] text-[#0B0D0F] mb-10 max-w-4xl"
          >
            Start Sharing
            <br />
            Today.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={ctaInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg max-w-xl mb-12 leading-relaxed text-[#0B0D0F]/65"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Create your account and start building your halal food community
            today.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            {!user && (
              <button
                onClick={() => router.push("/select-role")}
                className="flex items-center gap-3 px-8 py-4 bg-[#0B0D0F] text-white font-extrabold uppercase tracking-tighter text-base hover:bg-[#1a1e22] transition-colors"
              >
                Create Your Account
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => router.push("/hub/feed")}
              className="flex items-center gap-3 px-8 py-4 border-2 border-[#0B0D0F]/30 text-[#0B0D0F] font-extrabold uppercase tracking-tighter text-base hover:bg-[#0B0D0F]/08 transition-colors"
            >
              Browse the Feed
            </button>
          </motion.div>

          <div className="flex flex-wrap gap-6 md:gap-10">
            {[
              { Icon: Users, text: "10K+ Community Members" },
              { Icon: ChefHat, text: "5K+ Recipes Shared" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#0B0D0F]/45"
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
          className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-[#0B0D0F]/08 select-none pointer-events-none translate-x-6 translate-y-6 text-[8rem] md:text-[14rem]"
        >
          Social
        </div>
      </section>

      {/* ─── Back links ───────────────────────────────────── */}
      <div
        className="px-6 py-8"
        style={{
          backgroundColor: BG,
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="max-w-[95vw] mx-auto flex justify-between items-center">
          <Link
            href="/kitchen"
            className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-amber-400"
          >
            ← Kitchen
          </Link>
          <Link
            href="/charity"
            className="text-xs font-bold uppercase tracking-[0.2em] text-white/25 transition-colors hover:text-amber-400"
          >
            Charity →
          </Link>
        </div>
      </div>
    </div>
  );
}
