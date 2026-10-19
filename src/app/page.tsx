"use client";

import { useState } from "react";
import {
  motion,
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

declare global {
  interface Window {
    __halalmeHomeVisited?: boolean;
  }
}

/* Display type is set at medium weight - size and spacing carry the hierarchy */
const DISPLAY = "font-medium tracking-[-0.045em] leading-[0.98]";
const EYEBROW =
  "text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium";
const TEXT_LINK =
  "underline underline-offset-[6px] decoration-1 transition-colors duration-200";

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
        className={`min-h-screen bg-[#102C26] antialiased selection:bg-[#F7E7CE] selection:text-[#102C26] ${
          isLoading ? "overflow-hidden h-screen" : ""
        }`}
      >
        <HeroSection />

        <div className="relative z-10 mt-[100vh]">
          <RestaurantsBand />

          <AccountSection />

          {/* Five services - header (outside pinned section so overflow-hidden doesn't break GSAP pin) */}
          <div
            id="services"
            className="bg-[#102C26] pt-24 md:pt-32 pb-12 md:pb-16 border-t border-[#F7E7CE]/10"
          >
            <div className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-y-6 md:gap-x-12 items-end">
              <h2
                className={`${DISPLAY} md:col-span-8 text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[#F7E7CE]`}
              >
                Delivery, Kitchen, Social, Charity, Rewards.
              </h2>
              <p className="md:col-span-4 text-[#F7E7CE]/70 text-sm md:text-base leading-relaxed max-w-sm">
                Each one works on its own. Scroll through to see what is
                inside before you sign up.
              </p>
            </div>
          </div>

          {/* Horizontal scroll - pinned by GSAP, must not be inside overflow-hidden */}
          <HorizontalServices />

          <WeekSection />
          <ReviewsSection />
          <FinalCTA />
        </div>
      </div>
    </>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────── */

function HeroSection() {
  const { user } = useAuth();
  const reduceMotion = useReducedMotion();

  // Content recedes as the page scrolls over the fixed hero - motion values, no re-renders
  const { scrollY } = useScroll();
  const contentOpacity = useTransform(scrollY, [0, 560], [1, 0]);
  const contentY = useTransform(scrollY, [0, 560], [0, -70]);

  return (
    <section className="fixed top-0 left-0 w-full h-screen z-0 flex items-end overflow-hidden bg-[#102C26]">
      <div className="absolute inset-0 z-0">
        {/* Slow Ken Burns drift on the backdrop */}
        <motion.div
          className="absolute inset-0"
          animate={reduceMotion ? { scale: 1.05 } : { scale: [1.05, 1.14] }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 26,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }
          }
        >
          <Image
            src="/images/hero/halal5.webp"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </motion.div>
        {/* Weighted to the bottom left, where the copy sits */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top right, #102C26F5 0%, #102C26C8 42%, #102C2655 100%)`,
          }}
        />
      </div>

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 w-full max-w-[95vw] mx-auto px-6 md:px-10 pt-24 pb-14 md:pb-20"
      >
        <p className={`${EYEBROW} text-[#F59E0B] mb-5 md:mb-7`}>
          Halal delivery, recipes and giving in the UK
        </p>

        <h1
          className={`${DISPLAY} text-[clamp(2.25rem,7vw,7rem)] text-[#F7E7CE] max-w-[16ch]`}
        >
          Everything halal, on one account.
        </h1>

        <div className="mt-8 md:mt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <p className="text-base md:text-lg text-[#F7E7CE]/80 max-w-md leading-relaxed">
            Order from local halal restaurants, cook from the recipe library,
            post to Social, give to registered UK charities, and earn points
            as you go.
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href={user ? "/dashboard" : "/select-role"}
              className="px-7 sm:px-8 py-3.5 sm:py-4 bg-[#F7E7CE] text-[#102C26] font-semibold uppercase tracking-tight text-sm sm:text-base hover:bg-white active:translate-y-px transition-colors"
            >
              {user ? "Open your dashboard" : "Create free account"}
            </Link>
            <a
              href="#services"
              className={`${TEXT_LINK} text-sm sm:text-base text-[#F7E7CE] decoration-[#F7E7CE]/40 hover:decoration-[#F59E0B]`}
            >
              See the five services
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Restaurants band - champagne bg, the partners live on Delivery ─── */

// Mirrors the restaurant list on /delivery. Update both when a partner joins or leaves.
const LIVE_RESTAURANTS = [
  { name: "Dippers", cuisine: "Fast food" },
  { name: "Kake Temptations", cuisine: "Ice cream and dessert" },
  { name: "Uncle J's", cuisine: "Asian and Chinese" },
  { name: "Tegtat", cuisine: "Breakfast and bakery" },
  { name: "Amigos", cuisine: "Pizza, burgers, kebab" },
  { name: "Pizza Plaza", cuisine: "Pizza and burgers" },
];

function RestaurantsBand() {
  return (
    <section className="bg-[#F7E7CE] text-[#102C26]">
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 py-10 md:py-12 grid lg:grid-cols-12 gap-y-8 lg:gap-x-12">
        <div className="lg:col-span-3 flex lg:flex-col justify-between lg:justify-start gap-4">
          <h2 className={`${EYEBROW} text-[#102C26]/60`}>
            Delivering now from
          </h2>
          <Link
            href="/delivery"
            className={`${TEXT_LINK} text-sm decoration-[#102C26]/30 hover:decoration-[#102C26] w-fit`}
          >
            Order on Delivery
          </Link>
        </div>

        <ul className="lg:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
          {LIVE_RESTAURANTS.map((r) => (
            <li key={r.name} className="border-l border-[#102C26]/20 pl-4">
              <p className="text-base md:text-lg font-medium tracking-tight leading-tight">
                {r.name}
              </p>
              <p className="mt-1 text-xs md:text-sm text-[#102C26]/60">
                {r.cuisine}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── What an account gets you - editorial split, sticky intro + accent rows ─── */

function AccountSection() {
  const points = [
    {
      num: "01",
      title: "One sign-in for all five",
      desc: "The same account works on Delivery, Kitchen, Social, Charity and Rewards. Your profile and your points balance come with you.",
    },
    {
      num: "02",
      title: "AQI, the cooking assistant",
      desc: "Tell AQI what is in your fridge, or send it a photo, and it suggests a halal recipe you can cook tonight.",
    },
    {
      num: "03",
      title: "Points for taking part",
      desc: "10 points for every £1 you donate. 50 for your first recipe and your first post, then 20 for each post after that.",
    },
  ];

  return (
    <section className="bg-[#102C26] py-24 md:py-32">
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-y-14 md:gap-x-12 lg:gap-x-20">
        {/* Left - sticky intro column */}
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <p className={`${EYEBROW} text-[#F59E0B] mb-6`}>One account</p>
            <h2
              className={`${DISPLAY} text-3xl sm:text-4xl md:text-5xl text-[#F7E7CE]`}
            >
              What a HalalMe account gets you.
            </h2>
            <p className="mt-6 text-[#F7E7CE]/72 text-base md:text-lg leading-relaxed max-w-md">
              It is free to create. Here is what comes with it.
            </p>
          </div>
        </div>

        {/* Right - stacked rows, accent bar reveal on hover (no color inversion) */}
        <div className="md:col-span-7 flex flex-col">
          {points.map((p, i) => (
            <div
              key={p.num}
              className={`group relative pl-6 md:pl-8 py-8 md:py-10 flex gap-5 md:gap-8 items-start ${
                i !== 0 ? "border-t border-[#F7E7CE]/10" : ""
              }`}
            >
              <div className="absolute left-0 top-8 md:top-10 bottom-8 md:bottom-10 w-0.5bg-[#F7E7CE]/10 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 group-hover:scale-y-100 bg-[#F59E0B] transition-transform duration-500 ease-out" />
              </div>

              <span className="text-xs text-[#F7E7CE]/50 mt-1.5 shrink-0 tabular-nums">
                {p.num}
              </span>
              <div>
                <h3 className="text-xl md:text-2xl font-medium tracking-tight text-[#F7E7CE] mb-2.5">
                  {p.title}
                </h3>
                <p className="text-[#F7E7CE]/72 leading-relaxed text-sm md:text-base max-w-lg">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── One week on one account - a worked example, set as a ledger ───── */

// Point values match the earn rules and catalog costs on /rewards. Keep them in sync.
const WEEK = [
  {
    service: "Delivery",
    accent: "#B96AF0",
    action: "Order dinner from a halal restaurant nearby and follow it to your door.",
    result: "Dinner",
  },
  {
    service: "Kitchen",
    accent: "#F03E9E",
    action: "Upload your first recipe, with photos and steps.",
    result: "+50 pts",
  },
  {
    service: "Social",
    accent: "#F59E0B",
    action: "Share it as your first post.",
    result: "+50 pts",
  },
  {
    service: "Charity",
    accent: "#14B8A6",
    action: "Give £10 to a registered UK charity.",
    result: "+100 pts",
  },
  {
    service: "Rewards",
    accent: "#FB7185",
    action: "Spend 150 points on a frame for your profile photo.",
    result: "-150 pts",
  },
];

function WeekSection() {
  return (
    <section
      id="how-it-works"
      className="bg-[#0A1C19] py-24 md:py-32 border-t border-[#F7E7CE]/10"
    >
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-y-12 md:gap-x-12 lg:gap-x-20">
        <div className="md:col-span-4">
          <p className={`${EYEBROW} text-[#F59E0B] mb-6`}>
            How the points add up
          </p>
          <h2
            className={`${DISPLAY} text-3xl sm:text-4xl md:text-5xl text-[#F7E7CE]`}
          >
            One account, one week.
          </h2>
          <p className="mt-6 text-[#F7E7CE]/72 text-sm md:text-base leading-relaxed max-w-sm">
            A typical first week, using the real numbers.{" "}
            <Link
              href="/rewards"
              className={`${TEXT_LINK} text-[#F7E7CE] decoration-[#F7E7CE]/30 hover:decoration-[#F59E0B]`}
            >
              See every way to earn
            </Link>
            .
          </p>
        </div>

        <div className="md:col-span-8">
          <ol className="border-t border-[#F7E7CE]/15">
            {WEEK.map((row, i) => (
              <li
                key={row.service}
                className="grid grid-cols-[2rem_1fr_auto] md:grid-cols-[2.5rem_9rem_1fr_auto] items-baseline gap-x-4 md:gap-x-6 gap-y-1 py-5 md:py-6 border-b border-[#F7E7CE]/15"
              >
                <span className="text-xs text-[#F7E7CE]/40 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-sm md:text-base font-medium tracking-tight"
                  style={{ color: row.accent }}
                >
                  {row.service}
                </span>
                <span className="order-last md:order-0 col-start-2 col-span-2 md:col-auto text-sm md:text-base text-[#F7E7CE]/80 leading-relaxed">
                  {row.action}
                </span>
                <span className="text-sm md:text-base text-[#F7E7CE] tabular-nums text-right whitespace-nowrap">
                  {row.result}
                </span>
              </li>
            ))}
          </ol>
          <div className="flex items-baseline justify-between pt-5 md:pt-6">
            <span className="text-sm md:text-base text-[#F7E7CE]/60">
              Balance on day seven
            </span>
            <span className="text-2xl md:text-4xl font-medium tracking-tight text-[#F7E7CE] tabular-nums">
              50 pts
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Customer reviews - one lead quote, two supporting ─────────────── */

// Quotes are verbatim and tracked in SOCIAL_PROOF_REGISTER.md (SP-04 to SP-06). Do not edit the wording.
const REVIEWS = [
  {
    quote:
      "The AI recipe feature is honestly incredible. I told it what I had in the fridge and it gave me a full halal meal plan in seconds. I've discovered dishes I never would've tried otherwise. Cooking halal at home has never been this easy.",
    name: "Jani Fernandez",
    feature: "Kitchen",
  },
  {
    quote:
      "The community on here is unlike anything else. I've connected with people who actually understand the halal lifestyle - sharing recipes, restaurant finds, everything. It feels like a space that was built for us.",
    name: "Maryam",
    feature: "Social",
  },
  {
    quote:
      "The rewards are really good - you can donate to so many different charities. Love that every time I order I'm also giving back. Never seen anything like this on any other food app.",
    name: "Arbab",
    feature: "Charity",
  },
];

function ReviewAttribution({ name, feature }: { name: string; feature: string }) {
  return (
    <figcaption className="mt-6 text-xs md:text-sm text-[#F7E7CE]/55">
      <span className="text-[#F7E7CE]">{name}</span>
      <span className="mx-2 text-[#F7E7CE]/25">/</span>
      Customer review, {feature}
    </figcaption>
  );
}

function ReviewsSection() {
  const [lead, ...rest] = REVIEWS;

  return (
    <section className="bg-[#102C26] py-24 md:py-32 border-t border-[#F7E7CE]/10">
      <div className="max-w-[95vw] mx-auto px-6 md:px-10">
        <h2 className={`${EYEBROW} text-[#F59E0B] mb-10 md:mb-14`}>
          What customers have told us
        </h2>

        <div className="grid md:grid-cols-12 gap-y-12 md:gap-x-12 lg:gap-x-20">
          <figure className="md:col-span-7">
            <blockquote className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-[1.3] text-[#F7E7CE] text-pretty">
              &ldquo;{lead.quote}&rdquo;
            </blockquote>
            <ReviewAttribution name={lead.name} feature={lead.feature} />
          </figure>

          <div className="md:col-span-5 flex flex-col">
            {rest.map((r, i) => (
              <figure
                key={r.name}
                className={
                  i === 0
                    ? "pb-10"
                    : "pt-10 border-t border-[#F7E7CE]/10"
                }
              >
                <blockquote className="text-sm md:text-base leading-relaxed text-[#F7E7CE]/80">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <ReviewAttribution name={r.name} feature={r.feature} />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA - champagne bg, forest text ────────────────────────── */

function FinalCTA() {
  const { user } = useAuth();

  return (
    <section className="bg-[#F7E7CE] text-[#102C26] pt-24 pb-28 md:pt-32 md:pb-40">
      <div className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-12 gap-y-10 md:gap-x-12 items-end">
        <h2
          className={`${DISPLAY} md:col-span-8 text-4xl sm:text-6xl md:text-7xl lg:text-[clamp(3rem,6.5vw,6.5rem)]`}
        >
          {user ? "Pick up where you left off." : "One sign-up. All five services."}
        </h2>

        <div className="md:col-span-4 flex flex-col items-start gap-6">
          <p className="text-[#102C26]/70 text-base md:text-lg leading-relaxed max-w-sm">
            {user
              ? "Your orders, recipes, posts and points are in your dashboard."
              : "Creating an account is free. Your profile and points work everywhere from day one."}
          </p>
          <Link
            href={user ? "/dashboard" : "/select-role"}
            className="px-8 py-4 bg-[#102C26] text-[#F7E7CE] font-semibold uppercase tracking-tight text-base hover:bg-[#0A1C19] active:translate-y-px transition-colors"
          >
            {user ? "Open your dashboard" : "Create free account"}
          </Link>
          <Link
            href="/for-restaurants"
            className={`${TEXT_LINK} text-sm decoration-[#102C26]/30 hover:decoration-[#102C26]`}
          >
            Run a halal restaurant? List it on HalalMe
          </Link>
        </div>
      </div>
    </section>
  );
}
