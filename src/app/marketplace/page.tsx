"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Store,
  Truck,
  Lock,
  Users,
  Search,
  ShoppingBag,
  PackageCheck,
} from "lucide-react";
import { marketplaceService } from "@/services/marketplaceService";
import { useMarketplaceQuery } from "@/hooks/useMarketplaceQuery";
import { ProductGrid } from "@/components/marketplace/ProductCard";
import { Eyebrow } from "@/components/marketplace/shared";
import {
  BG,
  BG2,
  BLUE,
  CREAM,
  DEEP,
  WATERMARK,
  CategoryIcon,
} from "@/components/marketplace/theme";

const MotionLink = motion.create(Link);

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Browse & Discover",
    desc: "Explore products from independent sellers, grouped into categories built around a halal lifestyle.",
  },
  {
    num: "02",
    icon: ShoppingBag,
    title: "One Basket, One Checkout",
    desc: "Add items from different sellers to a single basket and pay once through a secure checkout.",
  },
  {
    num: "03",
    icon: PackageCheck,
    title: "Shipped by the Seller",
    desc: "Each seller posts your order with their own courier and shares tracking so you can follow it.",
  },
];

const REASONS = [
  {
    num: "01",
    icon: ShieldCheck,
    title: "Sellers We Check",
    desc: "Every seller is verified before they can open a store, and every product is reviewed before it goes live.",
  },
  {
    num: "02",
    icon: Store,
    title: "Independent Businesses",
    desc: "Shop directly from small and Muslim-owned businesses, all in one place.",
  },
  {
    num: "03",
    icon: Lock,
    title: "Secure Checkout",
    desc: "Card payments are handled by a trusted payment provider. HalalMe never stores your card details.",
  },
  {
    num: "04",
    icon: Users,
    title: "One HalalMe Account",
    desc: "The same account you use for Kitchen, Social, Charity and Rewards works here too.",
  },
];

/* ─── Page ─────────────────────────────────────────────────── */

export default function MarketplaceLandingPage() {
  const statsRef = useRef(null);
  const categoriesRef = useRef(null);
  const productsRef = useRef(null);
  const stepsRef = useRef(null);
  const ctaRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true });
  const categoriesInView = useInView(categoriesRef, {
    once: true,
    margin: "-60px",
  });
  const productsInView = useInView(productsRef, {
    once: true,
    margin: "-60px",
  });
  const stepsInView = useInView(stepsRef, { once: true, margin: "-60px" });
  const ctaInView = useInView(ctaRef, { once: true });

  const { data: categories } = useMarketplaceQuery("categories", () =>
    marketplaceService.listCategories(),
  );
  const { data: featured } = useMarketplaceQuery("featured", () =>
    marketplaceService.listProducts({ limit: 4 }),
  );

  return (
    <div style={{ backgroundColor: BG }}>
      {/* ─── Hero ────────────────────────────────────────── */}
      <section
        className="relative min-h-[calc(100svh-7rem)] flex items-center justify-center overflow-hidden py-12 md:py-16"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${BLUE}50` }}
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/services/halalme_market.webp"
            alt="Shopping on HalalMe Marketplace"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ backgroundColor: `${BG}CC` }}
          />
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
              <div className="w-8 h-px" style={{ backgroundColor: BLUE }} />
              <span
                className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: BLUE }}
              >
                Verified Sellers. One Basket. Shipped to You.
              </span>
              <div className="w-8 h-px" style={{ backgroundColor: BLUE }} />
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
                      backgroundColor: BLUE,
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
                style={{ color: BLUE }}
              >
                Marketplace
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.7 }}
                className="block text-[clamp(1.5rem,4.5vw,4.5rem)]"
                style={{ color: CREAM }}
              >
                Shop. Support. Belong.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 md:mt-7 text-base md:text-lg max-w-md leading-relaxed font-normal mx-auto"
              style={{ color: `${CREAM}75`, fontFamily: "var(--font-body)" }}
            >
              Modest fashion, prayer essentials, books and more from independent
              sellers we have verified. One basket, one checkout.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.72 }}
              className="mt-8 flex flex-wrap gap-4 justify-center"
            >
              <MotionLink
                href="/marketplace/shop"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-7 sm:px-8 py-3.5 sm:py-4 font-extrabold uppercase tracking-tighter text-sm sm:text-base text-white"
                style={{ backgroundColor: DEEP }}
              >
                Start Shopping
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </MotionLink>

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
                { icon: ShieldCheck, text: "Verified Sellers" },
                { icon: Lock, text: "Secure Checkout" },
                { icon: Truck, text: "Tracked UK Delivery" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: `${CREAM}65` }}
                >
                  <item.icon className="w-4 h-4" style={{ color: BLUE }} />
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
          backgroundColor: `${BLUE}50`,
          borderTop: `1px solid ${BLUE}50`,
          borderBottom: `1px solid ${BLUE}50`,
        }}
      >
        {[
          { value: "Verified", label: "Every Seller" },
          { value: "One", label: "Basket, Many Sellers" },
          { value: "Secure", label: "Card Checkout" },
          { value: "UK", label: "Wide Delivery" },
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
              style={{ color: BLUE }}
            >
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Categories ───────────────────────────────────── */}
      <section
        ref={categoriesRef}
        id="categories"
        className="py-24 md:py-32 scroll-mt-28"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${BLUE}50` }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={categoriesInView ? { opacity: 1, x: 0 } : {}}
          >
            <Eyebrow>Shop by Category</Eyebrow>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Everything Halal.
            <br />
            <span style={{ color: `${CREAM}65` }}>One Place.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid grid-cols-2 lg:grid-cols-4"
          style={{ gap: "1px", backgroundColor: `${BLUE}50` }}
        >
          {categories === null &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="min-h-48 md:min-h-56 animate-pulse"
                style={{ backgroundColor: BG2 }}
              />
            ))}
          {categories?.map((cat, i) => {
            return (
              <motion.div
                key={cat.handle}
                initial={{ opacity: 0, y: 30 }}
                animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Link
                  href={`/marketplace/c/${cat.handle}`}
                  className="block h-full"
                >
                  <div
                    className="group relative p-6 md:p-8 min-h-48 md:min-h-56 flex flex-col h-full transition-colors duration-300"
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = DEEP)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = BG2)
                    }
                    style={{
                      backgroundColor: BG2,
                      border: `1px solid ${BLUE}50`,
                    }}
                  >
                    <CategoryIcon
                      handle={cat.handle}
                      className="w-7 h-7 mb-6 shrink-0 transition-colors duration-300 group-hover:text-white"
                      style={{ color: BLUE }}
                    />
                    <h3
                      className="text-base md:text-xl font-extrabold uppercase tracking-tighter mb-2 transition-colors duration-300 group-hover:text-white"
                      style={{
                        color: CREAM,
                        fontFamily: "var(--font-headline)",
                      }}
                    >
                      {cat.title}
                    </h3>
                    <p
                      className="text-xs md:text-sm leading-relaxed transition-colors duration-300 group-hover:text-white/80"
                      style={{
                        color: `${CREAM}75`,
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {cat.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── Featured products ────────────────────────────── */}
      <section
        ref={productsRef}
        className="py-24 md:py-32"
        style={{ backgroundColor: BG2, borderBottom: `1px solid ${BLUE}50` }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={productsInView ? { opacity: 1, x: 0 } : {}}
          >
            <Eyebrow>On the Shelves</Eyebrow>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={productsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Made with Care.
            <br />
            <span style={{ color: `${CREAM}65` }}>Sold with Trust.</span>
          </motion.h2>
        </div>

        <div className="max-w-[95vw] mx-auto px-6 md:px-10">
          <ProductGrid products={featured} skeletonCount={4} />
          <Link
            href="/marketplace/shop"
            className="inline-flex items-center gap-2 mt-8 text-sm font-extrabold uppercase tracking-tighter transition-opacity hover:opacity-70"
            style={{ color: BLUE }}
          >
            Shop All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────── */}
      <section
        ref={stepsRef}
        id="how-it-works"
        className="py-24 md:py-32 scroll-mt-28"
        style={{ backgroundColor: BG, borderBottom: `1px solid ${BLUE}50` }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={stepsInView ? { opacity: 1, x: 0 } : {}}
          >
            <Eyebrow>How It Works</Eyebrow>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={stepsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            From Their Shelf
            <br />
            <span style={{ color: `${CREAM}65` }}>to Your Door.</span>
          </motion.h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-3"
          style={{ gap: "1px", backgroundColor: `${BLUE}50` }}
        >
          {STEPS.map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 30 }}
              animate={stepsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.12, duration: 0.5 }}
            >
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-default min-h-60 flex flex-col h-full transition-colors duration-300"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = DEEP)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BG2)
                }
                style={{ backgroundColor: BG2, border: `1px solid ${BLUE}50` }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none"
                  style={{ color: WATERMARK }}
                >
                  {item.num}
                </span>
                <div className="relative z-10 flex flex-col flex-1">
                  <item.icon
                    className="w-7 h-7 mb-6 shrink-0 transition-colors duration-300 group-hover:text-white"
                    style={{ color: BLUE }}
                  />
                  <h3
                    className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter mb-3 transition-colors duration-300 group-hover:text-white"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="leading-relaxed text-sm transition-colors duration-300 group-hover:text-white/80"
                    style={{
                      color: `${CREAM}75`,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── Why shop here ────────────────────────────────── */}
      <section
        className="py-24 md:py-32"
        style={{ backgroundColor: BG2, borderBottom: `1px solid ${BLUE}50` }}
      >
        <div className="max-w-[95vw] mx-auto px-6 md:px-10 mb-14 md:mb-20">
          <Eyebrow>Why HalalMe Marketplace</Eyebrow>
          <h2
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88]"
            style={{ color: CREAM }}
          >
            Shopping Made
            <br />
            <span style={{ color: `${CREAM}65` }}>Simple &amp; Honest.</span>
          </h2>
        </div>

        <div
          className="max-w-[95vw] mx-auto px-6 md:px-10 grid md:grid-cols-2"
          style={{ gap: "1px", backgroundColor: `${BLUE}50` }}
        >
          {REASONS.map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div
                className="group relative p-8 md:p-10 overflow-hidden cursor-default min-h-50 md:min-h-65 flex flex-col h-full transition-colors duration-300"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = BLUE)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BG)
                }
                style={{ backgroundColor: BG, border: `1px solid ${BLUE}50` }}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-6 -right-3 text-[8rem] md:text-[10rem] font-extrabold leading-none select-none pointer-events-none"
                  style={{ color: WATERMARK }}
                >
                  {item.num}
                </span>
                <div className="relative z-10 flex flex-col flex-1">
                  <item.icon
                    className="w-7 h-7 mb-6 shrink-0 transition-colors duration-300 group-hover:text-white"
                    style={{ color: BLUE }}
                  />
                  <h3
                    className="text-xl md:text-2xl font-extrabold uppercase tracking-tighter mb-3 transition-colors duration-300 group-hover:text-white"
                    style={{ color: CREAM, fontFamily: "var(--font-headline)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="leading-relaxed text-sm transition-colors duration-300 group-hover:text-white/80"
                    style={{
                      color: `${CREAM}75`,
                      fontFamily: "var(--font-body)",
                    }}
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
        style={{ backgroundColor: DEEP }}
      >
        <div className="relative z-10 max-w-[95vw] mx-auto px-6 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-white/40" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-white/70">
                Get Started
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-extrabold uppercase tracking-tighter leading-[0.88] mb-8 text-white">
              Ready to Shop
              <br />
              <span className="text-white/60">Halal?</span>
            </h2>
            <p
              className="text-base md:text-lg max-w-xl leading-relaxed mb-10 font-normal text-white/80"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Find something you love, or bring your own products to a community
              that is looking for them.
            </p>
            <div className="flex flex-wrap gap-4">
              <MotionLink
                href="/marketplace/shop"
                className="flex items-center gap-3 px-8 py-4 font-extrabold uppercase tracking-tighter text-base text-white"
                style={{ backgroundColor: BG }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 20px 50px -12px rgba(0,0,0,0.3)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                Shop All Products <ArrowRight className="w-5 h-5" />
              </MotionLink>
              <MotionLink
                href="/marketplace/sell"
                className="flex items-center gap-3 px-8 py-4 border-2 font-extrabold uppercase tracking-tighter text-base transition-all"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: "white" }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
                whileTap={{ scale: 0.97 }}
              >
                <Store className="w-5 h-5" /> Sell on HalalMe
              </MotionLink>
            </div>
          </motion.div>
        </div>

        {/* Watermark */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 font-extrabold uppercase tracking-tighter leading-none text-white/10 select-none pointer-events-none translate-x-6 translate-y-6 text-[5rem] sm:text-[8rem] md:text-[14rem]"
        >
          Market
        </div>
      </section>
    </div>
  );
}
